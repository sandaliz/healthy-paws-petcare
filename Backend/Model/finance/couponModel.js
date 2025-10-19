import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    description: { type: String },
    discountType: { type: String, enum: ["Percentage", "Fixed"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minInvoiceAmount: { type: Number, default: 0 },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    scope: { type: String, enum: ["GLOBAL", "ISSUED"], default: "GLOBAL", index: true },
    ownerUserID: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    status: { type: String, enum: ["Available", "Used", "Expired", "Revoked"], default: "Available" },
    usedAt: { type: Date },
  },
  { timestamps: true, collection: "coupons" }
);

couponSchema.index({ scope: 1, ownerUserID: 1, status: 1 });
couponSchema.index({ parentId: 1 });

couponSchema.methods.canApply = function (invoiceTotal) {
  const now = new Date();
  const notExpired = now <= this.expiryDate;
  const meetsMinAmount = Number(invoiceTotal) >= (this.minInvoiceAmount || 0);
  if (!notExpired || !meetsMinAmount) return false;
  if (this.scope === "GLOBAL") {
    const withinLimit = this.usageLimit === 0 || this.usedCount < this.usageLimit;
    return withinLimit;
  }
  return this.status === "Available";
};

couponSchema.methods.incrementUsage = function () {
  if (this.scope !== "GLOBAL") return Promise.resolve(this);
  this.usedCount += 1;
  return this.save();
};

couponSchema.methods.markIssuedUsed = function () {
  if (this.scope !== "ISSUED") return Promise.resolve(this);
  this.status = "Used";
  this.usedAt = new Date();
  return this.save();
};

couponSchema.statics.issueToUser = async function ({ templateId, userID }) {
  const template = await this.findById(templateId);
  if (!template) throw new Error("Template coupon not found");
  const now = new Date();
  if (now > template.expiryDate) throw new Error("Template expired");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  const issuedCode = `${template.code}-${suffix}`;
  return this.create({
    code: issuedCode,
    description: template.description,
    discountType: template.discountType,
    discountValue: template.discountValue,
    minInvoiceAmount: template.minInvoiceAmount,
    expiryDate: template.expiryDate,
    scope: "ISSUED",
    ownerUserID: new mongoose.Types.ObjectId(userID),
    parentId: template._id,
    status: "Available",
  });
};

export default mongoose.model("Coupon", couponSchema);