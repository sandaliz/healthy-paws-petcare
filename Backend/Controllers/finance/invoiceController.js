import Invoice from "../../Model/finance/invoiceModel.js";
import Payment from "../../Model/finance/paymentModel.js";
import { v4 as uuidv4 } from "uuid";

const generateInvoiceID = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(100 + Math.random() * 900);
  return `INV-${date}-${random}`;
};

const toMoney = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const OFFLINE_METHODS = ["Cash", "Card", "BankTransfer"];

export const createInvoice = async (req, res) => {
  try {
    const { userID, lineItems, paymentMethod } = req.body;
    if (!userID || !Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({ message: "User ID and at least one line item are required" });
    }

    if (paymentMethod && !OFFLINE_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method. Allowed: Cash, Card, BankTransfer" });
    }

    const normalizedItems = lineItems.map((item) => {
      const qty = Number(item.quantity);
      const price = Number(item.unitPrice);
      if (!item.description || isNaN(qty) || isNaN(price) || qty <= 0 || price < 0) {
        throw new Error("Invalid line item");
      }
      return {
        description: item.description,
        quantity: qty,
        unitPrice: price,
        total: toMoney(qty * price),
      };
    });

    const subtotal = toMoney(normalizedItems.reduce((acc, i) => acc + i.total, 0));
    const tax = toMoney(subtotal * 0.08);
    const total = toMoney(subtotal + tax);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);

    const invoice = new Invoice({
      invoiceID: generateInvoiceID(),
      userID,
      lineItems: normalizedItems,
      subtotal,
      tax,
      total,
      status: "Pending",
      dueDate,
    });

    await invoice.save();

    let paymentRecord = null;
    if (paymentMethod) {
      try {
        paymentRecord = await Payment.create({
          paymentID: `PAY-${uuidv4()}`,
          invoiceID: invoice._id,
          userID,
          method: paymentMethod,
          amount: total,
          currency: "LKR",
          status: "Pending",
        });
      } catch (err) {
        console.error("createInvoice payment creation error:", err);
        await Invoice.findByIdAndDelete(invoice._id);
        return res.status(500).json({ message: "Invoice creation failed while creating pending payment. Please try again." });
      }
    }

    res.status(201).json({
      message: "Invoice created. Please pay within 15 days.",
      invoice,
      payment: paymentRecord,
    });
  } catch (err) {
    console.error("createInvoice error:", err);
    res.status(500).json({ message: err?.message || "Server error" });
  }
};

// List all invoices
export const getInvoiceList = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("userID", "name email")
      .sort({ createdAt: -1 });
    res.json({ invoices });
  } catch (err) {
    console.error("getInvoiceList error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("userID", "name email");
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    console.error("getInvoiceById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getInvoiceByBusinessId = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ invoiceID: req.params.no }).populate("userID", "name email");
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    console.error("getInvoiceByBusinessId error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const { lineItems, status, dueDate } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const isFinalized = ["Paid", "Refunded"].includes(invoice.status);

    if (Array.isArray(lineItems)) {
      if (isFinalized) {
        return res.status(400).json({ message: `Cannot edit line items of a ${invoice.status} invoice` });
      }
      if (lineItems.length === 0) {
        return res.status(400).json({ message: "At least one line item is required" });
      }

      const normalizedItems = lineItems.map((item) => {
        const qty = Number(item.quantity);
        const price = Number(item.unitPrice);
        if (!item.description || isNaN(qty) || isNaN(price) || qty <= 0 || price < 0) {
          throw new Error("Invalid line item");
        }
        return {
          description: item.description,
          quantity: qty,
          unitPrice: price,
          total: toMoney(qty * price),
        };
      });

      const subtotal = toMoney(normalizedItems.reduce((acc, i) => acc + i.total, 0));
      const tax = toMoney(subtotal * 0.08);
      const total = toMoney(subtotal + tax);

      invoice.lineItems = normalizedItems;
      invoice.subtotal = subtotal;
      invoice.tax = tax;
      invoice.total = total;
    }

    if (typeof status === "string") {
      const next = status.trim();
      if (next === "Paid" || next === "Refunded") {
        return res.status(403).json({ message: `Status "${next}" can only be set via payment/refund processing.` });
      }
      const allowed = ["Pending", "Cancelled", "Overdue"];
      if (!allowed.includes(next)) {
        return res.status(400).json({ message: `Invalid status. Allowed here: ${allowed.join(", ")}` });
      }
      invoice.status = next;
    }

    if (dueDate) {
      const d = new Date(dueDate);
      if (isNaN(d.getTime())) return res.status(400).json({ message: "Invalid dueDate" });
      invoice.dueDate = d;
    }

    await invoice.save();
    res.json({ message: "Invoice updated", invoice });
  } catch (err) {
    console.error("updateInvoice error:", err);
    res.status(500).json({ message: err?.message || "Server error" });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json({ message: "Invoice deleted" });
  } catch (err) {
    console.error("deleteInvoice error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
