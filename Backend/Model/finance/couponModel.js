const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    description: { type: String },
    discountType: { type: String, enum: ["Percentage", "Fixed"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minInvoiceAmount: { type: Number, default: 0 },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 0 }, // 0 = unlimited
    usedCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Method to validate coupon before applying
couponSchema.methods.canApply = function(invoiceTotal) {
  const notExpired = new Date() <= this.expiryDate;
  const meetsMinAmount = invoiceTotal >= this.minInvoiceAmount;
  const withinLimit = this.usageLimit === 0 || this.usedCount < this.usageLimit;

  return notExpired && meetsMinAmount && withinLimit;
};

// Method to mark as used
couponSchema.methods.incrementUsage = function() {
  if (this.usageLimit !== 0) this.usedCount += 1;
  return this.save();
};

module.exports = mongoose.model("Coupon", couponSchema);
