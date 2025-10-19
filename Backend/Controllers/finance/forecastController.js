// Controllers/finance/forecastController.js
import mlRegression from "ml-regression";
import Invoice from "../../Model/finance/invoiceModel.js";
import Payment from "../../Model/finance/paymentModel.js";
import Salary from "../../Model/finance/salaryModel.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const PERIOD_DAYS = 14;
const PERIOD_MS = PERIOD_DAYS * DAY_MS;
const FUTURE_PERIODS = 6; // predict next 12 weeks (6 bi-weekly spans)

const toStartOfDay = (input) => {
  if (!input) return null;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const normalizeAmount = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const formatRangeLabel = (start, end) => {
  const format = (date) =>
    date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  const yearPart =
    start.getFullYear() === end.getFullYear()
      ? start.getFullYear()
      : `${start.getFullYear()}/${end.getFullYear()}`;
  return `${format(start)} – ${format(end)} ${yearPart}`;
};

const buildBucket = (baseTs, index) => {
  const start = new Date(baseTs + index * PERIOD_MS);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + PERIOD_MS - DAY_MS);
  end.setHours(23, 59, 59, 999);
  return {
    idx: index,
    start,
    end,
    revenue: 0,
    expense: 0,
    label: formatRangeLabel(start, end),
  };
};

export const getForecast = async (req, res) => {
  try {
    const invoices = await Invoice.find({ status: "Paid" })
      .select("total createdAt")
      .sort({ createdAt: 1 })
      .lean();

    const payments = await Payment.find({ status: "Completed" })
      .select("amount createdAt")
      .sort({ createdAt: 1 })
      .lean();

    const salaries = await Salary.find({ status: "Paid" })
      .select(
        "netSalary baseSalary allowances deductions month year createdAt status"
      )
      .sort({ year: 1, month: 1, createdAt: 1 })
      .lean();

    if (!payments.length && !invoices.length && !salaries.length) {
      return res
        .status(400)
        .json({ message: "No data available for forecasting." });
    }

    const earliestRevenueDate = payments.length
      ? toStartOfDay(payments[0].createdAt)
      : invoices.length
      ? toStartOfDay(invoices[0].createdAt)
      : null;
    const earliestSalaryEntry = salaries.length
      ? toStartOfDay(
          salaries[0].createdAt ??
            new Date(
              salaries[0].year ?? new Date().getFullYear(),
              Math.max(0, (salaries[0].month ?? 1) - 1),
              1
            )
        )
      : null;

    const baseDateCandidates = [
      earliestRevenueDate,
      earliestSalaryEntry,
    ].filter((d) => d instanceof Date);
    const baseDate =
      baseDateCandidates.length > 0
        ? new Date(Math.min(...baseDateCandidates.map((d) => d.getTime())))
        : new Date();
    baseDate.setHours(0, 0, 0, 0);
    const baseTs = baseDate.getTime();

    const buckets = new Map();
    const ensureBucket = (idx) => {
      if (!buckets.has(idx)) buckets.set(idx, buildBucket(baseTs, idx));
      return buckets.get(idx);
    };

    if (payments.length) {
      payments.forEach((payment) => {
        const date = toStartOfDay(payment.createdAt);
        if (!date) return;
        const idx = Math.floor((date.getTime() - baseTs) / PERIOD_MS);
        if (idx < 0) return;
        const bucket = ensureBucket(idx);
        bucket.revenue += normalizeAmount(payment.amount);
      });
    } else {
      invoices.forEach((invoice) => {
        const date = toStartOfDay(invoice.createdAt);
        if (!date) return;
        const idx = Math.floor((date.getTime() - baseTs) / PERIOD_MS);
        if (idx < 0) return;
        const bucket = ensureBucket(idx);
        bucket.revenue += normalizeAmount(invoice.total);
      });
    }

    salaries.forEach((salary) => {
      let amount = 0;
      if (salary.netSalary != null) {
        amount = normalizeAmount(salary.netSalary);
      } else {
        amount =
          normalizeAmount(salary.baseSalary) +
          normalizeAmount(salary.allowances) -
          normalizeAmount(salary.deductions);
      }

      const rawDate =
        salary.createdAt ??
        new Date(
          salary.year ?? new Date().getFullYear(),
          Math.max(0, (salary.month ?? 1) - 1),
          1
        );
      const date = toStartOfDay(rawDate);
      if (!date) return;
      const idx = Math.floor((date.getTime() - baseTs) / PERIOD_MS);
      if (idx < 0) return;
      const bucket = ensureBucket(idx);
      bucket.expense += amount;
    });

    if (buckets.size === 0) {
      return res
        .status(400)
        .json({ message: "Insufficient data available for forecasting." });
    }

    const maxIdx = Math.max(...buckets.keys());
    const history = [];
    for (let idx = 0; idx <= maxIdx; idx += 1) {
      const bucket = ensureBucket(idx);
      history.push({
        label: bucket.label,
        startDate: bucket.start.toISOString(),
        endDate: bucket.end.toISOString(),
        revenue: Math.round(bucket.revenue),
        expense: Math.round(bucket.expense),
        profit: Math.round(bucket.revenue - bucket.expense),
      });
    }

    if (history.length === 1) {
      const [single] = history;
      const future = [];
      let nextIdx = maxIdx;
      for (let i = 1; i <= FUTURE_PERIODS; i += 1) {
        nextIdx += 1;
        const bucket = buildBucket(baseTs, nextIdx);
        future.push({
          label: bucket.label,
          startDate: bucket.start.toISOString(),
          endDate: bucket.end.toISOString(),
          revenue: single.revenue,
          expense: single.expense,
          profit: single.profit,
        });
      }

      return res.json({
        periodDays: PERIOD_DAYS,
        history,
        future,
      });
    }

    const x = history.map((_, i) => i);
    const revenueY = history.map((entry) => entry.revenue);
    const expenseY = history.map((entry) => entry.expense);

    const regRevenue = new mlRegression.SLR(x, revenueY);
    const regExpense = new mlRegression.SLR(x, expenseY);

    const positiveRevenue = revenueY.filter((value) => value > 0);
    const positiveExpense = expenseY.filter((value) => value > 0);
    const averageRevenue =
      positiveRevenue.length > 0
        ? positiveRevenue.reduce((sum, value) => sum + value, 0) /
          positiveRevenue.length
        : 0;
    const averageExpense =
      positiveExpense.length > 0
        ? positiveExpense.reduce((sum, value) => sum + value, 0) /
          positiveExpense.length
        : 0;
    const lastExpense =
      positiveExpense.length > 0
        ? positiveExpense[positiveExpense.length - 1]
        : 0;

    const future = [];
    let nextIdx = maxIdx;
    for (let step = 1; step <= FUTURE_PERIODS; step += 1) {
      nextIdx += 1;
      const bucket = buildBucket(baseTs, nextIdx);
      const predictorIndex = x[x.length - 1] + step;
      let revenue = Math.round(regRevenue.predict(predictorIndex));
      if (revenue <= 0 && averageRevenue > 0) {
        revenue = Math.round(averageRevenue);
      }
      revenue = Math.max(0, revenue);

      let expense = Math.round(regExpense.predict(predictorIndex));
      if (history.length < 4 || positiveExpense.length <= 1) {
        expense = Math.round(lastExpense || averageExpense);
      } else if (expense <= 0 && averageExpense > 0) {
        expense = Math.round(averageExpense);
      }
      expense = Math.max(0, expense);

      future.push({
        label: bucket.label,
        startDate: bucket.start.toISOString(),
        endDate: bucket.end.toISOString(),
        revenue,
        expense,
        profit: revenue - expense,
      });
    }

    res.json({
      periodDays: PERIOD_DAYS,
      history,
      future,
    });
  } catch (err) {
    console.error("forecast error:", err);
    res.status(500).json({ error: err.message });
  }
};
