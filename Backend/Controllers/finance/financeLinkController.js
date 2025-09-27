// controllers/financeLinkController.js
import Invoice from "../../Model/finance/invoiceModel.js";
import Cart from "../../Model/Cart.js";
import Appointment from "../../Model/Appointment.js";

const generateInvoiceID = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const time = Date.now().toString().slice(-6); // last 6 digits of ms timestamp
  const rand = Math.floor(100 + Math.random() * 900); // 3-digit random
  return `INV-${date}-${time}-${rand}`;
};

const toMoney = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// 🔹 Create Invoice From Cart
export const createInvoiceFromCart = async (req, res) => {
  try {
    const { cartId, userId } = req.body;
    if (!cartId || !userId)
      return res.status(400).json({ message: "cartId and userId are required" });

    const cart = await Cart.findById(cartId).populate("userId", "name email");
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const lineItems = cart.items.map((i) => ({
      description: i.productName,
      quantity: i.quantity,
      unitPrice: i.cost,
      total: toMoney(i.quantity * i.cost),
    }));

    const subtotal = toMoney(lineItems.reduce((s, i) => s + i.total, 0));
    const tax = toMoney(subtotal * 0.08);
    const total = toMoney(subtotal + tax);

    const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

    const invoice = new Invoice({
      invoiceID: generateInvoiceID(),
      userID: userId,
      lineItems,
      subtotal,
      tax,
      total,
      status: "Pending",
      dueDate,
    });

    await invoice.save();
    res.status(201).json({ message: "Invoice created from cart", invoice });
  } catch (err) {
    console.error("createInvoiceFromCart error:", err);
    res.status(500).json({ message: err?.message || "Server error" });
  }
};

// Create Invoice From Appointment
export const createInvoiceFromAppointment = async (req, res) => {
  try {
    const { appointmentId, userId } = req.body;
    if (!appointmentId || !userId)
      return res.status(400).json({ message: "appointmentId and userId are required" });

    const appointment = await Appointment.findById(appointmentId).populate("userID", "name email");
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const feeMap = {
      VACCINE: 2000,
      SURGERY: 10000,
      DENTAL: 5000,
      GENERAL_CHECKUP: 1500,
    };

    const amount = feeMap[appointment.category] || 1500;

    const lineItems = [
      {
        description: `Appointment: ${appointment.category} for ${appointment.petName}`,
        quantity: 1,
        unitPrice: amount,
        total: amount,
      },
    ];

    const subtotal = amount;
    const tax = toMoney(subtotal * 0.08);
    const total = toMoney(subtotal + tax);

    const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

    const invoice = new Invoice({
      invoiceID: generateInvoiceID(),
      userID,
      lineItems,
      subtotal,
      tax,
      total,
      status: "Pending",
      dueDate,
    });

    await invoice.save();
    res.status(201).json({ message: "Invoice created from appointment", invoice });
  } catch (err) {
    console.error("createInvoiceFromAppointment error:", err);
    res.status(500).json({ message: err?.message || "Server error" });
  }
};