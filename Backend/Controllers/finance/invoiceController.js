// Controllers/finance/invoiceController.js
import Invoice from "../../Model/finance/invoiceModel.js";

// Helpers
const generateInvoiceID = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(100 + Math.random() * 900);
  return `INV-${date}-${random}`;
};

const toMoney = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// Create a new invoice
export const createInvoice = async (req, res) => {
  try {
    const { userID, lineItems } = req.body;
    if (!userID || !Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({ message: "User ID and at least one line item are required" });
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
    res.status(201).json({
      message: "Invoice created. Please pay within 15 days.",
      invoice,
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
      .populate("userID", "OwnerName OwnerEmail")
      .sort({ createdAt: -1 });
    res.json({ invoices });
  } catch (err) {
    console.error("getInvoiceList error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get invoice by ID
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("userID", "OwnerName OwnerEmail");
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    console.error("getInvoiceById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get invoice by business invoice number
export const getInvoiceByBusinessId = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ invoiceID: req.params.no }).populate("userID", "OwnerName OwnerEmail");
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    console.error("getInvoiceByBusinessId error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update invoice
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

// Delete invoice
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
