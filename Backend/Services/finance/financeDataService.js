import Invoice from "../../Model/finance/invoiceModel.js";
import Payment from "../../Model/finance/paymentModel.js";
import Refund from "../../Model/finance/refundModel.js";
import Loyalty from "../../Model/finance/loyaltyModel.js";

const logFinanceDataError = (context, error) => {
  console.error(`[FinanceDataService] ${context} failed:`, error?.message || error);
};

const extractFromSettled = (result, scope, fallback = []) => {
  if (result.status === "fulfilled") return result.value;
  logFinanceDataError(scope, result.reason);
  return fallback;
};

const settledError = (result) => (result.status === "rejected" ? result.reason : null);

export async function loadDashboardEntities() {
  const [paymentsResult, invoicesResult, loyaltiesResult] = await Promise.allSettled([
    Payment.find({ status: "Completed" }).populate("userID", "name email"),
    Invoice.find().populate("userID", "name email"),
    Loyalty.find().populate("userID", "name email"),
  ]);

  return {
    payments: extractFromSettled(paymentsResult, "payments"),
    invoices: extractFromSettled(invoicesResult, "invoices"),
    loyalties: extractFromSettled(loyaltiesResult, "loyalties"),
    errors: {
      payments: settledError(paymentsResult),
      invoices: settledError(invoicesResult),
      loyalties: settledError(loyaltiesResult),
    },
  };
}

export async function loadNotificationSources(limit = 15) {
  const [refundsResult, offlinePaymentsResult, overdueInvoicesResult] = await Promise.allSettled([
    Refund.find({ status: "Pending" })
      .populate("userID", "name email")
      .populate({
        path: "paymentID",
        select: "paymentID amount method invoiceID",
        populate: { path: "invoiceID", select: "invoiceID" },
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    Payment.find({
      status: "Pending",
      method: { $in: ["Cash", "Card", "BankTransfer"] },
    })
      .populate("userID", "name email")
      .populate("invoiceID", "invoiceID")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    Invoice.find({ status: "Overdue" })
      .populate("userID", "name email")
      .sort({ dueDate: 1 })
      .limit(limit)
      .lean(),
  ]);

  return {
    refunds: extractFromSettled(refundsResult, "notifications:refunds"),
    offlinePayments: extractFromSettled(offlinePaymentsResult, "notifications:offlinePayments"),
    overdueInvoices: extractFromSettled(overdueInvoicesResult, "notifications:overdueInvoices"),
    errors: {
      refunds: settledError(refundsResult),
      offlinePayments: settledError(offlinePaymentsResult),
      overdueInvoices: settledError(overdueInvoicesResult),
    },
  };
}
