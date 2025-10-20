import mongoose from "mongoose";

const refundSchema = new mongoose.Schema(
  {
    paymentID: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    reason: { type: String },
    reasonRejected: { type: String },
    processedAt: { type: Date },

    // idempotency flags
    approvalEmailSentAt: { type: Date },
    rejectionEmailSentAt: { type: Date },

    payoutStatus: { type: String, enum: ["NotRequired", "Pending", "Paid"], default: "NotRequired" },
    payoutHandledBy: { type: String },
    payoutReference: { type: String },
    payoutCompletedAt: { type: Date },
  },
  { timestamps: true }
);

refundSchema.index({ paymentID: 1, status: 1 });

export default mongoose.model("Refund", refundSchema);
