// Controllers/finance/forecastController.js
import mlRegression from "ml-regression";
import Invoice from "../../Model/finance/invoiceModel.js";
import Salary from "../../Model/finance/salaryModel.js";

export const getForecast = async (req, res) => {
  try {
    // Revenue (Paid invoices)
    const rev = await Invoice.aggregate([
      { $match: { status: "Paid" } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          totalRevenue: { $sum: "$total" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Salaries (expenses)
    const sal = await Salary.aggregate([
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          totalSalary: { $sum: "$netSalary" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // No data at all
    if (rev.length === 0) {
      return res.status(400).json({ message: "No data available for forecasting." });
    }

    // Align months across revenue & salaries
    const months = rev.map(
      (m) => `${m._id.year}-${String(m._id.month).padStart(2, "0")}`
    );
    const salariesMap = new Map(
      sal.map((s) => [
        `${s._id.year}-${String(s._id.month).padStart(2, "0")}`,
        s.totalSalary,
      ])
    );

    const history = rev.map((r, i) => {
      const month = months[i];
      const revenue = r.totalRevenue;
      const expense = salariesMap.get(month) || 0;
      return {
        month,
        revenue,
        expense,
        profit: revenue - expense,
      };
    });

    // ---- Fallback: Only 1 month available ----
    if (history.length === 1) {
      const onlyMonth = history[0];
      const [year, month] = onlyMonth.month.split("-");
      const baseYear = parseInt(year);
      const baseMonth = parseInt(month);

      const future = [];
      for (let i = 1; i <= 3; i++) {
        let nextMonth = baseMonth + i;
        let nextYear = baseYear;
        if (nextMonth > 12) {
          nextYear += Math.floor((nextMonth - 1) / 12);
          nextMonth = ((nextMonth - 1) % 12) + 1;
        }
        future.push({
          month: `${nextYear}-${String(nextMonth).padStart(2, "0")}`,
          revenue: onlyMonth.revenue,
          expense: onlyMonth.expense,
          profit: onlyMonth.profit,
        });
      }

      return res.json({ history, future });
    }

    // ---- Normal case: 2+ months, use regression ----
    const x = history.map((_, i) => i);
    const revenueY = history.map((h) => h.revenue);
    const expenseY = history.map((h) => h.expense);

    const regRevenue = new mlRegression.SLR(x, revenueY);
    const regExpense = new mlRegression.SLR(x, expenseY);

    const lastIndex = x[x.length - 1];
    const [lastYear, lastMonth] = history[history.length - 1].month.split("-");
    let baseYear = parseInt(lastYear);
    let baseMonth = parseInt(lastMonth);

    const future = [];
    for (let i = 1; i <= 3; i++) {
      let nextMonth = baseMonth + i;
      let nextYear = baseYear;
      if (nextMonth > 12) {
        nextYear += Math.floor((nextMonth - 1) / 12);
        nextMonth = ((nextMonth - 1) % 12) + 1;
      }

      const idx = lastIndex + i;
      const revenue = Math.max(0, Math.round(regRevenue.predict(idx)));
      const expense = Math.max(0, Math.round(regExpense.predict(idx)));

      future.push({
        month: `${nextYear}-${String(nextMonth).padStart(2, "0")}`,
        revenue,
        expense,
        profit: revenue - expense,
      });
    }

    res.json({ history, future });
  } catch (err) {
    console.error("forecast error:", err);
    res.status(500).json({ error: err.message });
  }
};
