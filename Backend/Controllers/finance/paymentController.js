import Payment from "../../Model/finance/paymentModel.js";
import Invoice from "../../Model/finance/invoiceModel.js";
import User from "../../Model/userModel.js";
import Coupon from "../../Model/finance/couponModel.js";
import Loyalty from "../../Model/finance/loyaltyModel.js";
import Stripe from "stripe";
import mongoose from "mongoose";
import { sendPaymentEmail } from "../../config/finance/email.js";
import { v4 as uuidv4 } from "uuid";

const stripe = new Stripe(process.env.STRIPE_SECRET);

function computeDiscount(coupon, invoiceTotal) {
  if (!coupon) return 0;
  if (!coupon.canApply(invoiceTotal)) return 0;
  const d =
    coupon.discountType === "Percentage"
      ? +(invoiceTotal * (coupon.discountValue / 100)).toFixed(2)
      : Math.min(invoiceTotal, coupon.discountValue);
  return Math.max(0, d);
}

async function resolveCouponForPayment({ couponId, couponCode, userID }) {
  if (couponId) {
    const c = await Coupon.findById(couponId);
    if (!c) throw new Error("Coupon not found");

    if (c.scope === "ISSUED") {
      if (!mongoose.isValidObjectId(userID)) {
        throw new Error("Invalid userID format");
      }
      const ownerObjId = new mongoose.Types.ObjectId(userID);
      if (!c.ownerUserID.equals(ownerObjId)) {
        throw new Error("User coupon does not belong to this user");
      }
      if (c.status !== "Available") {
        throw new Error("User coupon is not available");
      }
      return c;
    }

    if (c.scope === "GLOBAL") return c;
    throw new Error("Invalid coupon scope");
  }

  if (couponCode) {
    const formattedCode = String(couponCode).trim().toUpperCase();

    // Try a direct issued coupon match for this user
    let c = await Coupon.findOne({
      code: formattedCode,
      scope: "ISSUED",
      ownerUserID: userID,
      status: "Available",
    });
    if (c) return c;

    // Try finding the global template directly
    c = await Coupon.findOne({ code: formattedCode, scope: "GLOBAL" });
    if (c) return c;

    // If user typed global *base* code, find their issued copy
    const template = await Coupon.findOne({ code: formattedCode, scope: "GLOBAL" });
    if (template) {
      c = await Coupon.findOne({
        scope: "ISSUED",
        ownerUserID: userID,
        parentId: template._id,
        status: "Available",
      });
      if (c) return c;
    }

    throw new Error("Invalid coupon code");
  }

  return null;
}

async function normalizeInvoiceStatus(invoice) {
  const payments = await Payment.find({ invoiceID: invoice._id });
  let totalCompleted = 0;
  let totalRefunded = 0;
  let anyCompletedOrRefunded = false;

  for (const p of payments) {
    const paid = Number(p.amount || 0);
    const refunded = Number(
      p.refundedAmount != null
        ? p.refundedAmount
        : p.status === "Refunded"
          ? p.amount || 0
          : 0
    );
    if (p.status === "Completed" || p.status === "Refunded") {
      totalCompleted += paid;
      anyCompletedOrRefunded = true;
    }
    totalRefunded += refunded;
  }

  const netPaid = Math.max(0, totalCompleted - totalRefunded);
  let effective = "Pending";
  if (!anyCompletedOrRefunded) effective = "Pending";
  else if (netPaid <= 0) effective = "Refunded";
  else effective = "Paid";

  if (invoice.status !== effective) {
    invoice.status = effective;
    await invoice.save();
  }
  return effective;
}

async function ensureInvoiceOpenForPayment(invoice) {
  const effective = await normalizeInvoiceStatus(invoice);
  if (effective === "Paid" || effective === "Refunded")
    return { canPay: false, reason: effective };
  if (invoice.status !== "Pending") {
    invoice.status = "Pending";
    await invoice.save();
  }
  return { canPay: true };
}

async function cancelOtherPendingPayments(invoiceId, keepPaymentId) {
  const others = await Payment.find({
    invoiceID: invoiceId,
    status: "Pending",
    _id: { $ne: keepPaymentId },
  });
  for (const p of others) {
    if (p.method === "Stripe" && p.stripePaymentIntentId) {
      try {
        await stripe.paymentIntents.cancel(p.stripePaymentIntentId);
      } catch (e) {
        console.warn("Stripe PI cancel failed:", e?.message);
      }
    }
  }
  await Payment.deleteMany({
    invoiceID: invoiceId,
    status: "Pending",
    _id: { $ne: keepPaymentId },
  });
}

/**
 * ✅ Updated resolveOwnerDoc to use User model and "name/email"
 */
async function resolveOwnerDoc({ invoice, payment }) {
  if (invoice?.userID && typeof invoice.userID === "object" && (invoice.userID.name || invoice.userID.email)) {
    return invoice.userID;
  }
  if (payment?.userID && typeof payment.userID === "object" && (payment.userID.name || payment.userID.email)) {
    return payment.userID;
  }
  const id =
    (invoice?.userID && (invoice.userID._id || invoice.userID)) ||
    (payment?.userID && (payment.userID._id || payment.userID)) ||
    null;
  if (id) {
    try {
      const doc = await User.findById(id).select("name email").lean();
      if (doc) return doc;
    } catch (_) { }
  }
  return null;
}

// ----- OFFLINE -----
export const processOfflinePayment = async (req, res) => {
  try {
    const { invoiceID, method, couponId, couponCode } = req.body;
    if (!invoiceID || !method)
      return res.status(400).json({ message: "invoiceID and method are required" });
    if (!["Cash", "Card", "BankTransfer"].includes(method))
      return res.status(400).json({ message: "Invalid offline payment method" });

    const invoice = await Invoice.findById(invoiceID);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const open = await ensureInvoiceOpenForPayment(invoice);
    if (!open.canPay) return res.status(400).json({ message: `Invoice already ${open.reason}` });

    const canonicalOwnerId = invoice.userID;

    let coupon = null;
    try {
      coupon = await resolveCouponForPayment({ couponId, couponCode, userID: canonicalOwnerId });
    } catch (err) {
      if (couponId || couponCode) return res.status(400).json({ message: err.message || "Coupon not valid" });
    }

    const discount = computeDiscount(coupon, Number(invoice.total));
    const finalAmount = Math.max(0, +(Number(invoice.total) - discount).toFixed(2));

    const payment = new Payment({
      paymentID: `PAY-${uuidv4()}`,
      invoiceID,
      userID: canonicalOwnerId,
      method,
      amount: finalAmount,
      currency: "LKR",
      status: "Pending",
      couponId: coupon ? coupon._id : undefined,
      discount,
    });

    await payment.save();

    res.status(201).json({
      message: "Offline payment recorded as Pending. Finance must confirm to mark as Paid.",
      payment,
    });
  } catch (err) {
    console.error("processOfflinePayment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const confirmOfflinePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("invoiceID")
      .populate("couponId")
      .populate("userID", "name email");

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // Idempotent confirm + email
    if (payment.status === "Completed") {
      if (!payment.receiptEmailSentAt && payment.invoiceID) {
        const invoice = await Invoice.findById(payment.invoiceID._id)
          .populate("userID", "name email");

        // resolve owner robustly for display name and email
        const owner = await resolveOwnerDoc({ invoice, payment });
        const toEmail = owner?.email || null;

        if (toEmail) {
          await sendPaymentEmail({
            to: toEmail,
            invoice,
            payment,
            ownerName: owner?.name,
            ownerEmail: owner?.email,
          });
          payment.receiptEmailSentAt = new Date();
          await payment.save();
        }
      }
      return res.json({ message: "Payment already confirmed", payment });
    }

    if (payment.status !== "Pending") {
      return res.status(400).json({ message: `Payment is ${payment.status}, cannot confirm.` });
    }

    payment.status = "Completed";
    await payment.save();

    // Handle coupon usage (ISSUED vs GLOBAL)
    if (payment.couponId) {
      try {
        const applied = await Coupon.findById(payment.couponId);
        if (applied) {
          if (applied.scope === "ISSUED") {
            await applied.markIssuedUsed();
            if (applied.parentId) {
              await Coupon.findByIdAndUpdate(applied.parentId, { $inc: { usedCount: 1 } });
            }
          } else if (applied.scope === "GLOBAL") {
            await applied.incrementUsage();
          }
        }
      } catch (_) { }
    }

    if (payment.invoiceID) {
      const invoice = await Invoice.findById(payment.invoiceID._id)
        .populate("userID", "name email");
      if (invoice) {
        invoice.status = "Paid";
        await invoice.save();

        // resolve owner robustly
        const owner = await resolveOwnerDoc({ invoice, payment });
        const toEmail = owner?.email || null;

        // Send once
        if (!payment.receiptEmailSentAt && toEmail) {
          await sendPaymentEmail({
            to: toEmail,
            invoice,
            payment,
            ownerName: owner?.name,
            ownerEmail: owner?.email,
          });
          payment.receiptEmailSentAt = new Date();
          await payment.save();
        }

        await cancelOtherPendingPayments(invoice._id, payment._id);
      }
    }

    if (payment.invoiceID && payment.invoiceID.userID) {
      try {
        const userId = payment.invoiceID.userID._id || payment.invoiceID.userID;
        let loyalty = await Loyalty.findOne({ userID: userId });
        if (!loyalty) {
          loyalty = await Loyalty.create({ userID: userId, points: 0, tier: "Bronze" });
        }
        await loyalty.addPoints(payment.amount);
      } catch (e) {
        console.error("Loyalty add error", e);
      }
    }


    res.json({ message: "Offline payment confirmed and invoice marked as Paid", payment });
  } catch (err) {
    console.error("confirmOfflinePayment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createStripePayment = async (req, res) => {
  try {
    const { invoiceID, userID, currency, couponId, couponCode } = req.body;

    if (!invoiceID || !userID) {
      return res.status(400).json({ message: "invoiceID and userID are required" });
    }

    const invoice = await Invoice.findById(invoiceID);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const open = await ensureInvoiceOpenForPayment(invoice);
    if (!open.canPay) return res.status(400).json({ message: "Invoice already Paid" });

    const usedCurrency = (currency || "lkr").toLowerCase();

    // Canonical owner: always take from the invoice (ignore posted userID)
    const canonicalOwnerId = invoice.userID;

    // Resolve coupon
    let coupon = null;
    try {
      coupon = await resolveCouponForPayment({ couponId, couponCode, userID: canonicalOwnerId });
    } catch (err) {
      if (couponId || couponCode) {
        return res.status(400).json({ message: err.message || "Coupon not valid" });
      }
    }

    const discount = computeDiscount(coupon, Number(invoice.total));
    const finalAmount = Math.max(0, +(Number(invoice.total) - discount).toFixed(2));
    if (finalAmount <= 0) {
      return res.status(400).json({ message: "Final amount is zero after discount." });
    }

    // Find an existing pending Stripe payment for this invoice (user-agnostic)
    let payment = await Payment.findOne({
      invoiceID,
      method: "Stripe",
      status: "Pending",
    });

    if (payment && payment.stripePaymentIntentId) {
      try {
        await stripe.paymentIntents.update(payment.stripePaymentIntentId, {
          amount: Math.round(finalAmount * 100),
          currency: usedCurrency,
        });
      } catch (e) {
        try { await stripe.paymentIntents.cancel(payment.stripePaymentIntentId); } catch (_) { }
        const newPI = await stripe.paymentIntents.create({
          amount: Math.round(finalAmount * 100),
          currency: usedCurrency,
          metadata: { invoiceID: String(invoiceID), userID: String(canonicalOwnerId) },
          automatic_payment_methods: { enabled: false },
        });
        payment.stripePaymentIntentId = newPI.id;
      }

      payment.userID = canonicalOwnerId;
      payment.amount = finalAmount;
      payment.currency = usedCurrency.toUpperCase();
      payment.couponId = coupon ? coupon._id : undefined;
      payment.discount = discount;
      await payment.save();

      const pi = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
      return res.json({
        clientSecret: pi.client_secret,
        paymentID: payment.paymentID,
        paymentDbId: payment._id,
        amount: finalAmount,
        discount,
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100),
      currency: usedCurrency,
      metadata: { invoiceID: String(invoiceID), userID: String(canonicalOwnerId) },
      automatic_payment_methods: { enabled: true },
    });

    payment = new Payment({
      paymentID: `PAY-${uuidv4()}`,
      invoiceID,
      userID: canonicalOwnerId,
      method: "Stripe",
      amount: finalAmount,
      currency: usedCurrency.toUpperCase(),
      stripePaymentIntentId: paymentIntent.id,
      status: "Pending",
      couponId: coupon ? coupon._id : undefined,
      discount,
    });

    await payment.save();
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentID: payment.paymentID,
      paymentDbId: payment._id,
      amount: finalAmount,
      discount,
    });
  } catch (err) {
    console.error("createStripePayment error:", err);
    res.status(500).json({ message: "Stripe error" });
  }
};

export const confirmStripePayment = async (req, res) => {
  try {
    const { paymentIntentId, email: typedEmailRaw } = req.body;
    if (!paymentIntentId) {
      return res.status(400).json({ message: "paymentIntentId is required" });
    }

    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ["charges"] });
    if (!pi) return res.status(404).json({ message: "PaymentIntent not found on Stripe" });
    if (pi.status !== "succeeded") {
      return res.status(400).json({ message: `PaymentIntent status is ${pi.status}, not succeeded` });
    }

    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId })
      .populate("couponId");
    if (!payment) return res.status(404).json({ message: "Local payment record not found" });

    const invoice = await Invoice.findById(payment.invoiceID)
      .populate("userID", "name email");

    // Idempotent confirm + email
    if (payment.status === "Completed") {
      if (!payment.receiptEmailSentAt && invoice) {
        const chargeEmail = pi?.charges?.data?.[0]?.billing_details?.email || pi?.receipt_email || null;
        const typedEmail = (typeof typedEmailRaw === 'string' && typedEmailRaw.trim()) ? typedEmailRaw.trim() : null;

        // resolve owner for display name
        const owner = await resolveOwnerDoc({ invoice, payment });
        const toEmail = typedEmail || chargeEmail || owner?.email || null;

        if (toEmail) {
          await sendPaymentEmail({
            to: toEmail,
            invoice,
            payment,
            ownerName: owner?.name,
            ownerEmail: toEmail,
          });
          payment.receiptEmailSentAt = new Date();
          await payment.save();
        }
      }

      if (payment.invoiceID && payment.invoiceID.userID) {
        try {
          const userId = payment.invoiceID.userID._id || payment.invoiceID.userID;
          let loyalty = await Loyalty.findOne({ userID: userId });
          if (!loyalty) {
            loyalty = await Loyalty.create({ userID: userId, points: 0, tier: "Bronze" });
          }
          await loyalty.addPoints(payment.amount);
        } catch (e) {
          console.error("Loyalty add error", e);
        }
      }
      return res.json({ message: "Payment already confirmed", payment });
    }

    const latestCharge = pi.latest_charge || pi.charges?.data?.[0]?.id || null;
    payment.stripeChargeId = latestCharge || payment.stripeChargeId;
    payment.status = "Completed";
    await payment.save();

    if (payment.couponId) {
      try {
        const applied = await Coupon.findById(payment.couponId);
        if (applied) {
          if (applied.scope === "ISSUED") {
            await applied.markIssuedUsed();
            if (applied.parentId) {
              await Coupon.findByIdAndUpdate(applied.parentId, { $inc: { usedCount: 1 } });
            }
          } else if (applied.scope === "GLOBAL") {
            await applied.incrementUsage();
          }
        }
      } catch (_) { }
    }

    if (invoice) {
      invoice.status = "Paid";
      await invoice.save();

      const chargeEmail = pi?.charges?.data?.[0]?.billing_details?.email || pi?.receipt_email || null;
      const typedEmail = (typeof typedEmailRaw === 'string' && typedEmailRaw.trim()) ? typedEmailRaw.trim() : null;

      const owner = await resolveOwnerDoc({ invoice, payment });
      const toEmail = typedEmail || chargeEmail || owner?.email || null;

      if (!payment.receiptEmailSentAt && toEmail) {
        await sendPaymentEmail({
          to: toEmail,
          invoice,
          payment,
          ownerName: owner?.name,
          ownerEmail: toEmail,
        });
        payment.receiptEmailSentAt = new Date();
        await payment.save();
      }

      await cancelOtherPendingPayments(invoice._id, payment._id);
    }

    res.json({ message: "Stripe payment confirmed and invoice marked as Paid", payment });
  } catch (err) {
    console.error("confirmStripePayment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.excludeFailed === "1") filter.status = { $ne: "Failed" };
    if (req.query.userId) filter.userID = req.query.userId;

    const payments = await Payment.find(filter)
      .populate("userID", "name email")
      .populate({
        path: "invoiceID",
        select: "invoiceID status total userID",
        populate: { path: "userID", select: "name email" },
      })
      .populate("couponId", "code discountType discountValue scope ownerUserID parentId status")
      .lean();

    for (const p of payments) {
      if (!p.userID && p.invoiceID?.userID) {
        p.userID = p.invoiceID.userID;
      }
    }

    res.json({ payments });
  } catch (err) {
    console.error("getAllPayments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
