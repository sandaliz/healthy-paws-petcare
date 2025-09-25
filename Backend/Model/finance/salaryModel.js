// models/salaryModel.js
import mongoose from "mongoose";

const salarySchema = new mongoose.Schema(
  {
    employeeID: { type: mongoose.Schema.Types.ObjectId, ref: "register", required: true },
    baseSalary: { type: Number, required: true, min: 0 },
    allowances: { type: Number, default: 0, min: 0 },
    deductions: { type: Number, default: 0, min: 0 },
    netSalary: { type: Number, min: 0 },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Paid"], default: "Pending" }
  },
  { timestamps: true }
);

// Calculate netSalary before save
salarySchema.pre("save", function (next) {
  this.netSalary =
    Number(this.baseSalary) +
    Number(this.allowances || 0) -
    Number(this.deductions || 0);
  next();
});

// Ensure netSalary updates for findOneAndUpdate / findByIdAndUpdate
salarySchema.pre("findOneAndUpdate", async function (next) {
  try {
    let update = this.getUpdate() || {};
    const $set = update.$set || update;

    if ($set.baseSalary != null || $set.allowances != null || $set.deductions != null) {
      const current = await this.model.findOne(this.getQuery()).lean();
      const base = Number($set.baseSalary ?? current.baseSalary ?? 0);
      const allow = Number($set.allowances ?? current.allowances ?? 0);
      const ded = Number($set.deductions ?? current.deductions ?? 0);
      const net = base + allow - ded;

      if (update.$set) update.$set.netSalary = net;
      else update.netSalary = net;

      this.setUpdate(update);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Generate monthly salary report
salarySchema.statics.generateMonthlyReport = async function (month, year) {
  return await this.find({ month, year }).populate("employeeID", "OwnerName OwnerEmail");
};

export default mongoose.model("Salary", salarySchema);
