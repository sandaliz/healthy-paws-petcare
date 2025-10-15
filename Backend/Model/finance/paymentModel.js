// models/paymentModel.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    paymentID: { type: String, required: true, unique: true }, // business id e.g., PAY-xxxx
    invoiceID: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", required: true },
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    method: {
      type: String,
      method: {
        type: String,
        enum: ["Cash", "Card", "BankTransfer", "Stripe", "PayHere"],
        required: true,
      },
      required: true,
    },

    amount: { type: Number, required: true, min: 0 }, // final charged amount after discount
    currency: { type: String, default: "LKR" },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Refunded"],
      default: "Pending",
    },

    // Stripe metadata
    stripePaymentIntentId: { type: String },
    stripeChargeId: { type: String },

    // PayHere metadata
  payhereOrderId:   { type: String },        // PH reference returned to you
  payhereStatus:    { type: String },        // e.g. SUCCESS, FAILED


    // Coupon audit
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    discount: { type: Number, default: 0, min: 0 },

    // Refund tracking
    refundedAmount: { type: Number, default: 0, min: 0 },
    stripeRefundId: { type: String },

    // Email idempotency
    receiptEmailSentAt: { type: Date }, // set when payment receipt email is sent
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
