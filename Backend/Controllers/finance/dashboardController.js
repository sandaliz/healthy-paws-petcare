import Invoice from "../../Model/finance/invoiceModel.js";
import Payment from "../../Model/finance/paymentModel.js";
import Loyalty from "../../Model/finance/loyaltyModel.js";

export const getFinancialManagerDashboard = async (req, res) => {
  try {
    const payments = await Payment.find({ status: "Completed" })
      .populate("userID", "name email");
    const invoices = await Invoice.find()
      .populate("userID", "name email");
    const loyalties = await Loyalty.find()
      .populate("userID", "name email");

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Group by user
    const paymentsByUser = {};
    for (const p of payments) {
      const uid = p.userID?._id?.toString();
      if (!uid) continue;
      (paymentsByUser[uid] ||= []).push(p);
    }

    const invoicesByUser = {};
    for (const inv of invoices) {
      const uid = inv.userID?._id?.toString();
      if (!uid) continue;
      (invoicesByUser[uid] ||= []).push(inv);
    }

    // Union users from invoices, payments, loyalty
    const userIds = new Set([
      ...Object.keys(invoicesByUser),
      ...Object.keys(paymentsByUser),
      ...loyalties.map(l => l.userID?._id?.toString()).filter(Boolean),
    ]);

    const dashboard = [...userIds].map((uid) => {
      const userInvoices = invoicesByUser[uid] || [];
      const userPayments = paymentsByUser[uid] || [];
      const loyalty = loyalties.find(l => l.userID?._id?.toString() === uid) || null;

      const user =
        userInvoices[0]?.userID ||
        loyalty?.userID ||
        userPayments.find(p => p.userID?._id?.toString() === uid)?.userID ||
        null;

      const totalSpent = userInvoices.reduce((s, inv) => s + (inv.total || 0), 0);
      const totalPaid = userPayments.reduce((s, pay) => s + (pay.amount || 0), 0);

      return {
        user,
        loyalty: loyalty ? { points: loyalty.points, tier: loyalty.tier } : null,
        invoices: { count: userInvoices.length, totalSpent },
        payments: { count: userPayments.length, totalPaid },
        balanceDue: Math.max(0, totalSpent - totalPaid),
      };
    });

    res.json({
      totalRevenue,
      totalUsers: dashboard.length,
      totalInvoices: invoices.length,
      totalPayments: payments.length,
      dashboard,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
