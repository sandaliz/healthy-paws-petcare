const mongoose = require("mongoose");
const RefundRequest = require("../../Model/finance/refundModel.js");
const Payment = require("../../Model/finance/paymentModel.js");
const Invoice = require("../../Model/finance/invoiceModel.js");
const Stripe = require("stripe");
const { sendRefundEmail, sendRefundRejectedEmail } = require("../../config/finance/email");

const stripe = new Stripe(process.env.STRIPE_SECRET);

// Find payment by Mongo _id or by business id (PAY-xxx)
const findPaymentByFlexibleId = async (id) => {
  if (!id) return null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    const byDb = await Payment.findById(id).populate("invoiceID");
    if (byDb) return byDb;
  }
  return await Payment.findOne({ paymentID: id }).populate("invoiceID");
};

// Create refund request (supports partial refunds via "amount")
const createRefundRequest = async (req, res) => {
  try {
    const { paymentID, userID, reason, amount } = req.body;
    if (!paymentID || !reason || !userID) {
      return res.status(400).json({ message: "Payment ID, User ID, and reason are required" });
    }

    const payment = await findPaymentByFlexibleId(paymentID);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.status !== "Completed") {
      return res.status(400).json({ message: `Refund not allowed. Payment is ${payment.status}.` });
    }

    if (payment.invoiceID) {
      if (["Cancelled", "Pending"].includes(payment.invoiceID.status)) {
        return res.status(400).json({ message: `Refund not allowed. Invoice is ${payment.invoiceID.status}.` });
      }
    }

    const maxRefundable = Number(payment.amount) - Number(payment.refundedAmount || 0);
    const requested = amount != null ? Number(amount) : maxRefundable;
    if (!(requested > 0)) {
      return res.status(400).json({ message: "Invalid refund amount" });
    }
    if (requested > maxRefundable) {
      return res.status(400).json({ message: `Refund exceeds paid balance. Max refundable: ${maxRefundable}` });
    }

    const existing = await RefundRequest.findOne({ paymentID: payment._id, status: "Pending" });
    if (existing) return res.status(400).json({ message: "Refund request already pending" });

    const refundRequest = new RefundRequest({
      paymentID: payment._id,
      userID,
      amount: requested,
      reason,
    });
    await refundRequest.save();

    res.status(201).json({ message: "Refund submitted", refundRequest });
  } catch (err) {
    console.error("createRefundRequest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// List refund requests
const getAllRefundRequests = async (req, res) => {
  try {
    const requests = await RefundRequest.find()
      .populate("paymentID")
      .populate("userID", "OwnerName OwnerEmail");
    res.json({ requests });
  } catch (err) {
    console.error("getAllRefundRequests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Enhanced: Recompute invoice status after refunds
// - If no completed/refunded payments at all => Pending
// - Else if netPaid <= 0 => Refunded
// - Else => Paid
async function recomputeInvoiceStatus(invoiceId) {
  const payments = await Payment.find({ invoiceID: invoiceId });

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
    if (p.status === "Completed") {
      totalCompleted += paid;
      anyCompletedOrRefunded = true;
    } else if (p.status === "Refunded") {
      totalCompleted += paid;
      anyCompletedOrRefunded = true;
    }
    totalRefunded += refunded;
  }

  const netPaid = Math.max(0, totalCompleted - totalRefunded);

  const invoice = await Invoice.findById(invoiceId);
  if (invoice) {
    if (!anyCompletedOrRefunded) {
      invoice.status = "Pending";
    } else if (netPaid <= 0) {
      invoice.status = "Refunded";
    } else {
      invoice.status = "Paid";
    }
    await invoice.save();
  }
  return { netPaid };
}

// Approve refund: Stripe -> refund to card; Offline -> record + notify to collect at counter
const approveRefund = async (req, res) => {
  try {
    let refundRequest = await RefundRequest.findById(req.params.id).populate("paymentID");
    if (!refundRequest) return res.status(404).json({ message: "Refund request not found" });

    // Idempotency: if already processed, return current state (and do not send duplicate emails)
    if (refundRequest.status === "Approved") {
      return res.json({ message: "Refund already approved", refundRequest });
    }
    if (refundRequest.status === "Rejected") {
      return res.status(400).json({ message: "Refund previously rejected" });
    }

    const payment = await Payment.findById(refundRequest.paymentID._id).populate("invoiceID");
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.status !== "Completed") {
      return res.status(400).json({ message: `Payment is ${payment.status}, cannot approve refund.` });
    }

    const refundableLeft = Number(payment.amount) - Number(payment.refundedAmount || 0);
    const refundAmount = Math.min(Number(refundRequest.amount || payment.amount), refundableLeft);
    if (!(refundAmount > 0)) {
      return res.status(400).json({ message: "Nothing to refund" });
    }

    let stripeRefundId = null;
    if (payment.method === "Stripe" && payment.stripePaymentIntentId) {
      const stripeRefund = await stripe.refunds.create(
        {
          payment_intent: payment.stripePaymentIntentId,
          amount: Math.round(refundAmount * 100),
        },
        // Idempotency to avoid duplicate Stripe refunds on retries/double-clicks
        { idempotencyKey: `refund_${refundRequest._id}` }
      );
      stripeRefundId = stripeRefund?.id || null;
    } else {
      // Offline refund: handled out-of-band (cash/bank). We only record it and notify the owner.
    }

    // Update payment refund tracking
    payment.refundedAmount = Number(payment.refundedAmount || 0) + refundAmount;
    const fullyRefunded = Math.abs(payment.refundedAmount - payment.amount) < 0.00001;
    if (fullyRefunded) payment.status = "Refunded";
    if (stripeRefundId) payment.stripeRefundId = stripeRefundId;
    await payment.save();

    // Update invoice based on net paid across all payments
    await recomputeInvoiceStatus(payment.invoiceID);

    // Close request
    refundRequest.status = "Approved";
    refundRequest.processedAt = new Date();
    await refundRequest.save();

    if (!refundRequest.approvalEmailSentAt) {
      const invoice = await Invoice.findById(payment.invoiceID).populate("userID", "OwnerName OwnerEmail");
      if (invoice) {
        await sendRefundEmail({
          to: invoice.userID?.OwnerEmail,
          invoice,
          payment,
          refundAmount,
          stripeRefundId,
          mode: payment.method === "Stripe" ? "online" : "offline",
        });
      }
      refundRequest.approvalEmailSentAt = new Date();
      await refundRequest.save();
    }

    res.json({
      message: "Refund approved",
      refundRequest,
      payment,
      invoice: payment.invoiceID,
      stripeRefundId,
    });
  } catch (err) {
    console.error("approveRefund error:", err);
    const msg = err?.raw?.message || err?.message || "Server error";
    res.status(500).json({ message: msg });
  }
};

// Reject refund: save decision and notify owner with reasons (once)
const rejectRefund = async (req, res) => {
  try {
    const { reasonRejected } = req.body;
    if (!reasonRejected) return res.status(400).json({ message: "Reason required" });

    let refundRequest = await RefundRequest.findById(req.params.id).populate("paymentID");
    if (!refundRequest) return res.status(404).json({ message: "Refund request not found" });

    // Idempotency
    if (refundRequest.status === "Rejected") {
      return res.json({ message: "Refund already rejected", refundRequest });
    }
    if (refundRequest.status === "Approved") {
      return res.status(400).json({ message: "Refund already approved" });
    }

    refundRequest.status = "Rejected";
    refundRequest.reasonRejected = reasonRejected;
    refundRequest.processedAt = new Date();
    await refundRequest.save();

    // Notify once
    if (!refundRequest.rejectionEmailSentAt) {
      const payment = await Payment.findById(refundRequest.paymentID._id).populate("invoiceID");
      let invoice = null;
      if (payment?.invoiceID?._id) {
        invoice = await Invoice.findById(payment.invoiceID._id).populate("userID", "OwnerName OwnerEmail");
      }
      if (invoice) {
        await sendRefundRejectedEmail({
          to: invoice.userID?.OwnerEmail,
          invoice,
          payment,
          refundAmount: refundRequest.amount,
          reasonProvided: refundRequest.reason,
          reasonRejected,
        });
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

module.exports = {
  createRefundRequest,
  getAllRefundRequests,
  approveRefund,
  rejectRefund,
};