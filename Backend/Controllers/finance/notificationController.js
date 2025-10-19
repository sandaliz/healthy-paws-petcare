import { loadNotificationSources } from "../../Services/finance/financeDataService.js";

const fmtLKR = (value = 0) => {
  try {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  } catch (err) {
    return `LKR ${(Number(value) || 0).toFixed(2)}`;
  }
};

const buildRefundNotifications = (refunds = []) =>
  refunds.map((refund) => ({
    id: `refund-${refund._id}`,
    type: "Refund",
    title: refund.paymentID?.paymentID || "Refund request",
    message: `Refund request from ${refund.userID?.name || "Unknown"} for ${fmtLKR(
      refund.amount
    )}.`,
    link: "/fm/refunds",
    status: "new",
    timestamp: refund.createdAt,
  }));

const buildOfflinePaymentNotifications = (payments = []) =>
  payments.map((payment) => ({
    id: `offline-${payment._id}`,
    type: "Offline Payment",
    title: payment.invoiceID?.invoiceID || payment.paymentID,
    message: `${payment.userID?.name || "Unknown"} submitted an offline ${
      payment.method
    } payment for ${fmtLKR(payment.amount)}.`,
    link: "/fm/payments",
    status: "new",
    timestamp: payment.createdAt,
  }));

const buildOverdueInvoiceNotifications = (invoices = []) =>
  invoices.map((invoice) => ({
    id: `invoice-${invoice._id}`,
    type: "Invoice",
    title: invoice.invoiceID || "Overdue invoice",
    message: `${invoice.userID?.name || "Unknown"}'s invoice is overdue since ${
      invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "Unknown"
    }.`,
    link: "/fm/invoices",
    status: "info",
    timestamp: invoice.updatedAt || invoice.dueDate || invoice.createdAt,
  }));

export const getFinanceNotifications = async (req, res) => {
  try {
    const { refunds, offlinePayments, overdueInvoices, errors } = await loadNotificationSources();
    const warnings = Object.entries(errors)
      .filter(([, err]) => err)
      .map(([scope, err]) => ({ scope, message: err?.message || String(err) }));

    const notifications = [
      ...buildRefundNotifications(refunds),
      ...buildOfflinePaymentNotifications(offlinePayments),
      ...buildOverdueInvoiceNotifications(overdueInvoices),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const meta = {
      pendingRefunds: refunds.length,
      pendingOfflinePayments: offlinePayments.length,
      overdueInvoices: overdueInvoices.length,
      total: notifications.length,
      newCount: notifications.filter((n) => n.status === "new").length,
      partial: warnings.length > 0,
    };

    res.json({ notifications, meta, warnings });
  } catch (err) {
    console.error("getFinanceNotifications error:", err);
    res.status(500).json({ message: "Failed to load finance notifications" });
  }
};
