import mongoose from "mongoose";
import RefundRequest from "../../Model/finance/refundModel.js";
import Payment from "../../Model/finance/paymentModel.js";
import Invoice from "../../Model/finance/invoiceModel.js";
import Stripe from "stripe";
import { sendRefundEmail, sendRefundRejectedEmail } from "../../config/finance/email.js";
import { resolveOwnerDoc } from "../../Services/finance/ownerHelper.js";

const stripe = new Stripe(process.env.STRIPE_SECRET);
const REFUND_WINDOW_DAYS = parseInt(process.env.REFUND_WINDOW_DAYS || "7", 10);

export const findPaymentByFlexibleId = async (id) => {
  if (!id) return null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    const byDb = await Payment.findById(id).populate("invoiceID");
    if (byDb) return byDb;
  }
  return await Payment.findOne({ paymentID: id }).populate("invoiceID");
};

export const createRefundRequest = async (req, res) => {
  try {
    const { paymentID, userID, reason, amount } = req.body;
    if (!paymentID || !reason || !userID) return res.status(400).json({ message: "Payment ID, User ID, and reason are required" });

    const payment = await findPaymentByFlexibleId(paymentID);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.status !== "Completed") return res.status(400).json({ message: `Refund not allowed. Payment is ${payment.status}.` });

    const tooOld = (Date.now() - new Date(payment.createdAt).getTime()) / 86400000 > REFUND_WINDOW_DAYS;
    if (tooOld) return res.status(400).json({ message: `Refund window of ${REFUND_WINDOW_DAYS} days has passed` });

    if (payment.invoiceID && ["Cancelled", "Pending"].includes(payment.invoiceID.status)) {
      return res.status(400).json({ message: `Refund not allowed. Invoice is ${payment.invoiceID.status}.` });
    }

    const maxRefundable = Number(payment.amount) - Number(payment.refundedAmount || 0);
    const requested = amount != null ? Number(amount) : maxRefundable;
    if (!(requested > 0)) return res.status(400).json({ message: "Invalid refund amount" });
    if (requested > maxRefundable) return res.status(400).json({ message: `Refund exceeds paid balance. Max refundable: ${maxRefundable}` });

    const existing = await RefundRequest.findOne({ paymentID: payment._id, status: "Pending" });
    if (existing) return res.status(400).json({ message: "Refund request already pending" });

    const refundRequest = new RefundRequest({ paymentID: payment._id, userID, amount: requested, reason });
    await refundRequest.save();

    res.status(201).json({ message: "Refund submitted", refundRequest });
  } catch (err) {
    console.error("createRefundRequest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllRefundRequests = async (req, res) => {
  try {
    const role = (req.headers["x-role"] || "").trim();
    const filter = {};
    if (role === "Owner") {
      const uid = req.query.userId;
      if (!uid) return res.status(400).json({ message: "userId required for owner" });
      filter.userID = uid;
    }

    const requests = await RefundRequest.find(filter)
      .populate({
        path: "paymentID",
        populate: [
          { path: "userID", select: "name email" },
          { path: "invoiceID", select: "invoiceID userID", populate: { path: "userID", select: "name email" } },
        ],
      })
      .populate("userID", "name email");

    res.json({ requests });
  } catch (err) {
    console.error("getAllRefundRequests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const recomputeInvoiceStatus = async (invoiceId) => {
  const payments = await Payment.find({ invoiceID: invoiceId });
  let totalCompleted = 0, totalRefunded = 0, anyCompletedOrRefunded = false;

  for (const p of payments) {
    const paid = Number(p.amount || 0);
    const refunded = Number(p.refundedAmount ?? (p.status === "Refunded" ? p.amount || 0 : 0));
    if (p.status === "Completed" || p.status === "Refunded") {
      totalCompleted += paid;
      anyCompletedOrRefunded = true;
    }
    totalRefunded += refunded;
  }

  const netPaid = Math.max(0, totalCompleted - totalRefunded);
  const invoice = await Invoice.findById(invoiceId);
  if (invoice) {
    invoice.status = !anyCompletedOrRefunded ? "Pending" : netPaid <= 0 ? "Refunded" : "Paid";
    await invoice.save();
  }
  return { netPaid };
};

export const approveRefund = async (req, res) => {
  try {
    let refundRequest = await RefundRequest.findById(req.params.id).populate("paymentID");
    if (!refundRequest) return res.status(404).json({ message: "Refund request not found" });
    if (refundRequest.status === "Approved") return res.json({ message: "Refund already approved", refundRequest });
    if (refundRequest.status === "Rejected") return res.status(400).json({ message: "Refund previously rejected" });

    const payment = await Payment.findById(refundRequest.paymentID._id).populate("invoiceID");
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.status !== "Completed") return res.status(400).json({ message: `Payment is ${payment.status}, cannot approve refund.` });

    const refundableLeft = Number(payment.amount) - Number(payment.refundedAmount || 0);
    const refundAmount = Math.min(Number(refundRequest.amount || payment.amount), refundableLeft);
    if (!(refundAmount > 0)) return res.status(400).json({ message: "Nothing to refund" });

    const isStripe = payment.method === "Stripe";
    let stripeRefundId = null;
    if (isStripe && payment.stripePaymentIntentId) {
      const stripeRefund = await stripe.refunds.create(
        { payment_intent: payment.stripePaymentIntentId, amount: Math.round(refundAmount * 100) },
        { idempotencyKey: `refund_${refundRequest._id}` }
      );
      stripeRefundId = stripeRefund?.id ?? null;
    }

    if (isStripe) {
      payment.refundedAmount = Number(payment.refundedAmount || 0) + refundAmount;
      if (Math.abs(payment.refundedAmount - payment.amount) < 0.00001) payment.status = "Refunded";
      if (stripeRefundId) payment.stripeRefundId = stripeRefundId;
      await payment.save();
      await recomputeInvoiceStatus(payment.invoiceID);
      refundRequest.payoutStatus = "Paid";
      refundRequest.payoutHandledBy = "Stripe";
      refundRequest.payoutReference = stripeRefundId;
      refundRequest.payoutCompletedAt = new Date();
    } else {
      refundRequest.payoutStatus = "Pending";
      refundRequest.payoutHandledBy = null;
      refundRequest.payoutReference = null;
      refundRequest.payoutCompletedAt = null;
    }

    refundRequest.status = "Approved";
    refundRequest.processedAt = new Date();
    await refundRequest.save();

    if (!refundRequest.approvalEmailSentAt) {
      const invoice = await Invoice.findById(payment.invoiceID).populate("userID", "name email");
      const owner = await resolveOwnerDoc({ invoice, payment });
      const toEmail = owner?.email ?? null;

      if (toEmail) {
        await sendRefundEmail({ to: toEmail, invoice, payment, refundAmount, stripeRefundId, mode: payment.method === "Stripe" ? "online" : "offline", ownerName: owner?.name, ownerEmail: owner?.email });
      }
      refundRequest.approvalEmailSentAt = new Date();
      await refundRequest.save();
    }

    res.json({ message: "Refund approved", refundRequest, payment, invoice: payment.invoiceID, stripeRefundId });
  } catch (err) {
    console.error("approveRefund error:", err);
    res.status(500).json({ message: err?.raw?.message ?? err?.message ?? "Server error" });
  }
};

export const recordRefundPayout = async (req, res) => {
  try {
    const { handledBy, reference } = req.body;
    if (!handledBy || !handledBy.trim()) return res.status(400).json({ message: "handledBy is required" });

    let refundRequest = await RefundRequest.findById(req.params.id).populate("paymentID");
    if (!refundRequest) return res.status(404).json({ message: "Refund request not found" });
    if (refundRequest.status !== "Approved") return res.status(400).json({ message: "Refund must be approved before payout" });
    if (refundRequest.payoutStatus === "Paid") return res.json({ message: "Refund payout already recorded", refundRequest });

    const payment = await Payment.findById(refundRequest.paymentID._id).populate("invoiceID");
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.method === "Stripe") return res.status(400).json({ message: "Stripe refunds are paid automatically" });

    const refundAmount = Number(refundRequest.amount || 0);
    if (!(refundAmount > 0)) return res.status(400).json({ message: "Invalid refund amount" });

    const refundableLeft = Number(payment.amount) - Number(payment.refundedAmount || 0);
    if (!(refundableLeft > 0)) return res.status(400).json({ message: "Nothing remaining to refund" });
    if (refundAmount > refundableLeft + 0.00001) {
      return res.status(400).json({
        message: `Refund exceeds remaining balance. Max cash payout available is ${refundableLeft}.`,
      });
    }

    const amountToRefund = Math.min(refundAmount, refundableLeft);

    payment.refundedAmount = Number(payment.refundedAmount || 0) + amountToRefund;
    if (Math.abs(payment.refundedAmount - payment.amount) < 0.00001) payment.status = "Refunded";
    await payment.save();
    await recomputeInvoiceStatus(payment.invoiceID);

    refundRequest.payoutStatus = "Paid";
    refundRequest.payoutHandledBy = handledBy.trim();
    refundRequest.payoutReference = reference || null;
    refundRequest.payoutCompletedAt = new Date();
    await refundRequest.save();

    res.json({ message: "Refund payout recorded", refundRequest, payment });
  } catch (err) {
    console.error("recordRefundPayout error:", err);
    res.status(500).json({ message: err?.message ?? "Server error" });
  }
};

export const rejectRefund = async (req, res) => {
  try {
    const { reasonRejected } = req.body;
    if (!reasonRejected) return res.status(400).json({ message: "Reason required" });

    let refundRequest = await RefundRequest.findById(req.params.id).populate("paymentID");
    if (!refundRequest) return res.status(404).json({ message: "Refund request not found" });
    if (refundRequest.status === "Rejected") return res.json({ message: "Refund already rejected", refundRequest });
    if (refundRequest.status === "Approved") return res.status(400).json({ message: "Refund already approved" });

    refundRequest.status = "Rejected";
    refundRequest.reasonRejected = reasonRejected;
    refundRequest.processedAt = new Date();
    await refundRequest.save();

    if (!refundRequest.rejectionEmailSentAt) {
      const payment = await Payment.findById(refundRequest.paymentID._id).populate("invoiceID");
      const invoice = payment?.invoiceID?._id
        ? await Invoice.findById(payment.invoiceID._id).populate("userID", "name email")
        : null;

      if (invoice) {
        const owner = await resolveOwnerDoc({ invoice, payment });
        const toEmail = owner?.email ?? null;

        if (toEmail) {
          await sendRefundRejectedEmail({ to: toEmail, invoice, payment, refundAmount: refundRequest.amount, reasonProvided: refundRequest.reason, reasonRejected, ownerName: owner?.name, ownerEmail: owner?.email });
        }
      }
      refundRequest.rejectionEmailSentAt = new Date();
      await refundRequest.save();
    }

    res.json({ message: "Refund rejected and owner notified", refundRequest });
  } catch (err) {
    console.error("rejectRefund error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
