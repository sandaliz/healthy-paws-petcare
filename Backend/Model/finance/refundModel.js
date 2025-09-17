const mongoose = require("mongoose");

const refundSchema = new mongoose.Schema({
  paymentID: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "Register", required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  reason: { type: String },
  reasonRejected: { type: String },
  processedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Refund", refundSchema);

