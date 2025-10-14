import mongoose from "mongoose";

const lineItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceID: { type: String, required: true, unique: true }, // business-facing ID
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    lineItems: [lineItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },

    status: { 
      type: String, 
      enum: ["Pending", "Paid", "Overdue", "Cancelled", "Refunded"], 
      default: "Pending" 
    },
    dueDate: { type: Date, required: true },

    // 🔗 Traceability to originating business object
    linkedAppointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", index: true },
    linkedCart:        { type: mongoose.Schema.Types.ObjectId, ref: "Cart", index: true },
    linkedDaycare:     { type: mongoose.Schema.Types.ObjectId, ref: "CareCustomer", index: true },
  },
  { timestamps: true }
);

// Prevent duplicates (at most one invoice per linked entity)
invoiceSchema.index({ linkedAppointment: 1 }, { unique: true, sparse: true });
invoiceSchema.index({ linkedCart: 1 }, { unique: true, sparse: true });
invoiceSchema.index({ linkedDaycare: 1 }, { unique: true, sparse: true });

export default mongoose.model("Invoice", invoiceSchema);