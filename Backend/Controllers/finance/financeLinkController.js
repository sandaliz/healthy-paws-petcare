// controllers/financeLinkController.js
import Invoice from "../../Model/finance/invoiceModel.js";
import Cart from "../../Model/Cart.js";
import Appointment from "../../Model/Appointment.js";
import CareCustomer from "../../Model/CareModel.js";

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
    if (!appointmentId || !userId) {
      return res.status(400).json({ message: "appointmentId and userId are required" });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate("user", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // ✅ First: Check if invoice already exists for this appointment
    let invoice = await Invoice.findOne({ linkedAppointment: appointmentId });

    if (invoice) {
      if (invoice.status === "Paid") {
        return res.status(400).json({ message: "This appointment is already paid", invoice });
      }
      if (invoice.status === "Refunded") {
        return res.status(400).json({ message: "This appointment has been refunded", invoice });
      }
      // Reuse existing Pending/Overdue invoice
      return res.status(200).json({ message: "Invoice already exists for appointment", invoice });
    }

    // Otherwise, generate a fresh invoice
    const feeMap = {
      VACCINE: 4000,
      SURGERY: 10000,
      DENTAL: 5000,
      GENERAL_CHECKUP: 3500,
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
    const tax = +(subtotal * 0.08).toFixed(2);
    const total = subtotal + tax;
    const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

    invoice = new Invoice({
      invoiceID: generateInvoiceID(),
      userID: userId,
      lineItems,
      subtotal,
      tax,
      total,
      status: "Pending",
      dueDate,
      linkedAppointment: appointment._id,
    });

    await invoice.save();
    return res.status(201).json({ message: "Invoice created from appointment", invoice });
  } catch (err) {
    console.error("createInvoiceFromAppointment error:", err);
    res.status(500).json({ message: err?.message || "Server error" });
  }
};

export const createInvoiceFromDaycare = async (req, res) => {
  try {
    const { careId, userID } = req.body;
    if (!careId || !userID)
      return res.status(400).json({ message: "careId and userID are required" });

    const care = await CareCustomer.findById(careId).populate("user", "name email");
    if (!care) return res.status(404).json({ message: "Daycare booking not found" });

    // Check if an invoice already exists for this daycare booking
    let invoice = await Invoice.findOne({ linkedDaycare: careId });
    if (invoice) {
      if (invoice.status === "Paid") {
        return res.status(400).json({ message: "This daycare booking is already paid", invoice });
      }
      if (invoice.status === "Refunded") {
        return res.status(400).json({ message: "This daycare booking has been refunded", invoice });
      }
      return res.status(200).json({ message: "Invoice already exists for daycare booking", invoice });
    }

    const nightlyRate = 3000;
    let subtotal = care.nightsStay * nightlyRate;

    if (care.grooming) subtotal += 3500;
    if (care.walking) subtotal += 2000;

    const lineItems = [
      {
        description: `Daycare for ${care.petName} (${care.nightsStay} nights)`,
        quantity: care.nightsStay,
        unitPrice: nightlyRate,
        total: care.nightsStay * nightlyRate,
      },
    ];

    if (care.grooming)
      lineItems.push({ description: "Grooming service", quantity: 1, unitPrice: 500, total: 500 });

    if (care.walking)
      lineItems.push({ description: "Daily Walking", quantity: care.nightsStay, unitPrice: 300, total: care.nightsStay * 300 });

    const tax = +(subtotal * 0.08).toFixed(2);
    const total = subtotal + tax;
    const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

    // Create new invoice
    invoice = new Invoice({
      invoiceID: `INV-${Date.now()}`,
      userID,
      lineItems,
      subtotal,
      tax,
      total,
      status: "Pending",
      dueDate,
      linkedDaycare: care._id,
    });

    await invoice.save();
    return res.status(201).json({ message: "Invoice created for daycare", invoice });
  } catch (err) {
    console.error("createInvoiceFromDaycare error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};