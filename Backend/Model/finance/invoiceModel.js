const mongoose = require("mongoose");

const lineItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 }
});

const invoiceSchema = new mongoose.Schema({
  invoiceID: { type: String, required: true, unique: true }, // business ID
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "Register", required: true },
  lineItems: [lineItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Paid", "Overdue", "Cancelled", "Refunded"], default: "Pending" },
  dueDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Invoice", invoiceSchema);

