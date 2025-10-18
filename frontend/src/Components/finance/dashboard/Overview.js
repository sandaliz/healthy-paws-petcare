import React, { useEffect, useState, useRef, useMemo } from 'react';
import Skeleton from './components/Skeleton';
import { api } from '../services/financeApi';
import Card from './components/Card';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { FileText, BarChart2, CreditCard, Users } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../css/dashboard/overview.css';
import { fmt } from '../utils/financeFormatters';

const COLORS = ['#54413C', '#FFD58E', '#9CA3AF', '#22C55E', '#EF4444'];

export default function Overview() {
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30'); // days: 7, 30, 90
  const [exportOpts, setExportOpts] = useState({
    revenue: true,
    incomeExpense: true,
    methods: true,
    topCustomers: true,
  });
  const [invoices, setInvoices] = useState([]);

  const revenueRef = useRef();
  const incomeExpenseRef = useRef();
  const payMethodsRef = useRef();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const dash = await api.get('/financial-dashboard');
        const pays = await api.get('/payments');
        const invs = await api.get('/invoices');
        const sal = await api.get('/salaries');
        const refunds = await api.get('/refunds');
        if (!mounted) return;

        setSummary(dash);
        setPayments(pays.payments || []);
        setInvoices(invs.invoices || []);

        const exp = (sal.salaries || []).map(s => ({
          category: `Salary ${s.employeeID?.name || ''}`,
          amount: Number(s.baseSalary || 0) + Number(s.allowances || 0) - Number(s.deductions || 0),
          date: `${s.year}-${String(s.month).padStart(2, '0')}-01`
        }));
        setExpenses(exp);

        const agg = {};
        (invs.invoices || []).forEach(inv => {
          if (!inv.userID) return;
          const u = inv.userID;
          if (!agg[u._id]) agg[u._id] = { _id: u._id, name: u.name, email: u.email, revenue: 0 };
          agg[u._id].revenue += Number(inv.total || 0);
        });
        setCustomers(Object.values(agg).sort((a, b) => b.revenue - a.revenue).slice(0, 5));

        // Build recent activities from finance events with timestamps, sort desc
        const events = [];
        (pays.payments || []).forEach(p => {
          const ts = new Date(p.createdAt || 0);
          if (!isNaN(ts)) {
            events.push({
              ts,
              type: 'payment',
              message: <>Payment {p.paymentID} of <b>{fmt(p.amount)}</b> ({p.method})</>
            });
          }
        });
        (invs.invoices || []).forEach(i => {
          const ts = new Date(i.createdAt || 0);
          if (!isNaN(ts)) {
            events.push({
              ts,
              type: 'invoice',
              message: <>Invoice {i.invoiceID} created for <b>{i.userID?.name || 'Unknown'}</b></>
            });
          }
        });
        (refunds.requests || []).forEach(r => {
          const base = new Date(r.updatedAt || r.createdAt || 0);
          if (isNaN(base)) return;
          const cust = r.userID?.name || 'Unknown';
          if (r.status === 'Pending') {
            events.push({ ts: base, type: 'refund', message: <>Refund placed by <b>{cust}</b> for <b>{fmt(r.amount)}</b></> });
          } else if (r.status === 'Approved') {
            events.push({ ts: base, type: 'refund-approved', message: <>Refund approved for <b>{cust}</b> of <b>{fmt(r.amount)}</b></> });
          } else if (r.status === 'Rejected') {
            events.push({ ts: base, type: 'refund-rejected', message: <>Refund rejected for <b>{cust}</b></> });
          }
        });
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        const latest = events
          .filter(e => e.ts >= cutoff)
          .sort((a, b) => b.ts - a.ts)
          .slice(0, 8);
        setActivities(latest);

        setLoading(false);
      } catch (e) {
        console.error('Failed to fetch finance data', e);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const revenueSeries = buildSeries(payments, Number(timeframe));
  const methodBreakdown = breakdown(payments, Number(timeframe));

  const deltas = useMemo(() => {
    const days = Number(timeframe) || 30;
    const today = new Date();
    const endCurrent = new Date(today);
    endCurrent.setHours(23, 59, 59, 999);
    const startCurrent = new Date(today);
    startCurrent.setHours(0, 0, 0, 0);
    startCurrent.setDate(startCurrent.getDate() - (days - 1));
    const endPrev = new Date(startCurrent);
    endPrev.setHours(23, 59, 59, 999);
    endPrev.setDate(endPrev.getDate() - 1);
    const startPrev = new Date(startCurrent);
    startPrev.setDate(startPrev.getDate() - days);

    const inRange = (d, s, e) => d >= s && d <= e;
    const payFiltered = (s, e) => (payments || []).filter(p => {
      if (p.status !== 'Completed') return false;
      const d = new Date(p.createdAt || 0);
      if (isNaN(d)) return false;
      return inRange(d, s, e);
    });
    const invFiltered = (s, e) => (invoices || []).filter(i => {
      const d = new Date(i.createdAt || 0);
      if (isNaN(d)) return false;
      return inRange(d, s, e);
    });
    const sumAmt = arr => arr.reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const pct = (cur, prev) => {
      if (!prev) return cur ? 100 : 0;
      return ((cur - prev) / prev) * 100;
    };

    const payCur = payFiltered(startCurrent, endCurrent);
    const payPrev = payFiltered(startPrev, endPrev);
    const revenueCur = sumAmt(payCur);
    const revenuePrev = sumAmt(payPrev);
    const paymentsCur = payCur.length;
    const paymentsPrev = payPrev.length;

    const invCur = invFiltered(startCurrent, endCurrent);
    const invPrev = invFiltered(startPrev, endPrev);
    const invoicesCur = invCur.length;
    const invoicesPrev = invPrev.length;
    const customersCur = new Set(invCur.map(i => (i.userID && typeof i.userID === 'object') ? i.userID._id : i.userID)).size;
    const customersPrev = new Set(invPrev.map(i => (i.userID && typeof i.userID === 'object') ? i.userID._id : i.userID)).size;

    return {
      revenue: { cur: revenueCur, prev: revenuePrev, pct: pct(revenueCur, revenuePrev) },
      payments: { cur: paymentsCur, prev: paymentsPrev, pct: pct(paymentsCur, paymentsPrev) },
      invoices: { cur: invoicesCur, prev: invoicesPrev, pct: pct(invoicesCur, invoicesPrev) },
      customers: { cur: customersCur, prev: customersPrev, pct: pct(customersCur, customersPrev) },
    };
  }, [timeframe, payments, invoices]);

  const exportPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const PAGE_W = 210, PAGE_H = 297, MARGIN_X = 14;
    const BRAND_BROWN = { r: 84, g: 65, b: 60 };
    const BRAND_ACCENT = { r: 255, g: 213, b: 142 };

    // Header bar
    const HEADER_H = 30;
    doc.setFillColor(BRAND_BROWN.r, BRAND_BROWN.g, BRAND_BROWN.b);
    doc.rect(0, 0, PAGE_W, HEADER_H, 'F');
    doc.setTextColor(BRAND_ACCENT.r, BRAND_ACCENT.g, BRAND_ACCENT.b);
    doc.setFont('helvetica', 'bold').setFontSize(18);
    doc.text('HealthyPaws — Finance Analytics', MARGIN_X, 18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal').setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()} | Timeframe: Last ${timeframe} days`, MARGIN_X, 26);

    // Draw a simple vector paw at the header right (emoji fallback removed)
    const pawCX = PAGE_W - 18, pawCY = HEADER_H / 2;
    doc.setFillColor(BRAND_ACCENT.r, BRAND_ACCENT.g, BRAND_ACCENT.b);
    // central pad (ellipse)
    if (doc.ellipse) {
      doc.ellipse(pawCX, pawCY + 2, 3.8, 2.6, 'F');
      // toes
      doc.circle(pawCX - 6, pawCY - 1, 1.5, 'F');
      doc.circle(pawCX - 2, pawCY - 3, 1.5, 'F');
      doc.circle(pawCX + 2, pawCY - 3, 1.5, 'F');
      doc.circle(pawCX + 6, pawCY - 1, 1.5, 'F');
    }

    let y = HEADER_H + 8; // add breathing space under header
    // Key Metrics section (color-coded chips, two columns)
    doc.setTextColor(BRAND_BROWN.r, BRAND_BROWN.g, BRAND_BROWN.b);
    doc.setFont('helvetica', 'bold').setFontSize(14);
    doc.text('Key Metrics', MARGIN_X, y);
    y += 8;
    const CHIP_W = 86, CHIP_H = 10, GAP_X = 8, COL1_X = MARGIN_X + 6, COL2_X = COL1_X + CHIP_W + GAP_X;
    const drawChip = (x, y0, label, value, color) => {
      doc.setFillColor(color.r, color.g, color.b);
      doc.rect(x, y0, CHIP_W, CHIP_H, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold').setFontSize(10);
      doc.text(`${label}: ${value}`, x + 3, y0 + 7);
      doc.setTextColor(0, 0, 0);
    };
    const C_GREEN = { r: 22, g: 163, b: 74 };
    const C_GRAY  = { r: 107, g: 114, b: 128 };
    const C_BLUE  = { r: 37, g: 99, b: 235 };
    const C_AMBER = { r: 245, g: 158, b: 11 };
    // row 1
    drawChip(COL1_X, y, 'Revenue', fmt(summary?.totalRevenue), C_GREEN);
    drawChip(COL2_X, y, 'Invoices', String(summary?.totalInvoices ?? 0), C_GRAY);
    y += CHIP_H + 6;
    // row 2
    drawChip(COL1_X, y, 'Payments', String(summary?.totalPayments ?? 0), C_BLUE);
    drawChip(COL2_X, y, 'Customers', String(summary?.totalUsers ?? 0), C_AMBER);
    y += CHIP_H + 10;

    // Helpers
    const ensureSpace = (need) => {
      if (y + need > PAGE_H - 22) {
        doc.addPage();
        y = 20; // top margin for subsequent pages
      }
    };

    // Dynamic chart height based on how many are selected
    const selectedCharts = ['revenue', 'incomeExpense', 'methods'].filter(k => exportOpts[k]);
    const chartCount = selectedCharts.length;
    const CHART_H = chartCount === 1 ? 110 : chartCount === 2 ? 92 : 80;

    const addChart = async (ref, title) => {
      if (!ref.current) return;
      const canvas = await html2canvas(ref.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const PDF_W = 180;
      const MIN_H = 70;
      const remain = (PAGE_H - 22) - y; // remaining drawable height on page (above footer)
      let PDF_H = CHART_H;
      if (remain >= (5 + MIN_H + 12)) {
        // Fit chart to remaining space, capped by CHART_H
        PDF_H = Math.min(CHART_H, remain - (5 + 12));
      } else {
        // Not enough space even for a minimum chart -> new page
        doc.addPage();
        y = 20;
        PDF_H = CHART_H;
      }
      doc.setTextColor(BRAND_BROWN.r, BRAND_BROWN.g, BRAND_BROWN.b);
      doc.setFont('helvetica', 'bold').setFontSize(13).text(title, MARGIN_X, y);
      y += 5;
      doc.addImage(imgData, 'PNG', MARGIN_X, y, PDF_W, PDF_H);
      y += PDF_H + 12;
    };

    if (exportOpts.revenue) await addChart(revenueRef, `Revenue (last ${timeframe} days)`);
    if (exportOpts.incomeExpense) await addChart(incomeExpenseRef, 'Income vs Expenses');
    if (exportOpts.methods) await addChart(payMethodsRef, 'Payment Methods');

    // Top Customers at the end, with smart pagination
    if (exportOpts.topCustomers) {
      const rowH = 7, headerH = 8;
      const need = headerH + (customers.length * rowH) + 6;
      ensureSpace(need);
      doc.setTextColor(BRAND_BROWN.r, BRAND_BROWN.g, BRAND_BROWN.b);
      doc.setFont('helvetica', 'bold').setFontSize(14).text('Top Customers', MARGIN_X, y);
      y += headerH;
      doc.setFont('helvetica', 'normal').setFontSize(11);
      customers.forEach((c, i) => {
        if (y > PAGE_H - 22) { doc.addPage(); y = 20; }
        doc.text(`${i + 1}. ${c.name} (${c.email}) — ${fmt(c.revenue)}`, MARGIN_X + 6, y);
        y += rowH;
      });
    }

    // Footer page numbers (brown)
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setTextColor(BRAND_BROWN.r, BRAND_BROWN.g, BRAND_BROWN.b);
      doc.setFont('helvetica', 'normal').setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, PAGE_W / 2, PAGE_H - 7, { align: 'center' });
    }
    doc.save('HealthyPaws_Finance_Report.pdf');
  };

  if (loading) {
    return (
      <>
        <div className="bf-overview-head">
          <div className="bf-overview-controls">
            <label className="bf-overview-label">Timeframe:</label>
            <select className="bf-overview-select" value={timeframe} onChange={e => setTimeframe(e.target.value)}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          <button className="bf-overview-btn-export" disabled>Export PDF</button>
        </div>
        <div className="bf-overview-grid-kpis"><Skeleton rows={4} /></div>
        <div className="bf-overview-charts"><Skeleton rows={10} /></div>
      </>
    );
  }

  return (
    <>
      <div className="bf-overview-head">
        <div className="bf-overview-controls">
          <label className="bf-overview-label">Timeframe:</label>
          <select className="bf-overview-select" value={timeframe} onChange={e => setTimeframe(e.target.value)}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
        <div className="bf-overview-export-opts">
          <label><input type="checkbox" checked={exportOpts.revenue} onChange={e => setExportOpts(o => ({ ...o, revenue: e.target.checked }))} /> Revenue</label>
          <label><input type="checkbox" checked={exportOpts.incomeExpense} onChange={e => setExportOpts(o => ({ ...o, incomeExpense: e.target.checked }))} /> Income vs Expenses</label>
          <label><input type="checkbox" checked={exportOpts.methods} onChange={e => setExportOpts(o => ({ ...o, methods: e.target.checked }))} /> Methods</label>
          <label><input type="checkbox" checked={exportOpts.topCustomers} onChange={e => setExportOpts(o => ({ ...o, topCustomers: e.target.checked }))} /> Top Customers</label>
        </div>
        <div className="bf-overview-help">Unselected sections are excluded in PDF (dimmed).</div>
        <button className="bf-overview-btn-export" onClick={exportPDF}>Export PDF</button>
      </div>

      {/* === KPI Cards (Restored cool version) === */}
<div className="bf-overview-grid-kpis">
  <Card className="bf-overview-kpi kpi-revenue">
    <div className="bf-overview-kpi-title">Total Revenue</div>
    <div className="bf-overview-kpi-value">{fmt(summary?.totalRevenue)}</div>
    <div className={`bf-overview-kpi-delta ${deltas.revenue.pct >= 0 ? 'up' : 'down'}`}>{fmtPct(deltas.revenue.pct)} vs prev</div>
    <div className="bf-overview-kpi-icon revenue">
      <BarChart2 size={24} />
    </div>
  </Card>

  <Card className="bf-overview-kpi kpi-invoices">
    <div className="bf-overview-kpi-title">Invoices</div>
    <div className="bf-overview-kpi-value">{summary?.totalInvoices ?? 0}</div>
    <div className={`bf-overview-kpi-delta ${deltas.invoices.pct >= 0 ? 'up' : 'down'}`}>{fmtPct(deltas.invoices.pct)} vs prev</div>
    <div className="bf-overview-kpi-icon invoices">
      <FileText size={24} />
    </div>
  </Card>

  <Card className="bf-overview-kpi kpi-payments">
    <div className="bf-overview-kpi-title">Payments</div>
    <div className="bf-overview-kpi-value">{summary?.totalPayments ?? 0}</div>
    <div className={`bf-overview-kpi-delta ${deltas.payments.pct >= 0 ? 'up' : 'down'}`}>{fmtPct(deltas.payments.pct)} vs prev</div>
    <div className="bf-overview-kpi-icon payments">
      <CreditCard size={24} />
    </div>
  </Card>

  <Card className="bf-overview-kpi kpi-customers">
    <div className="bf-overview-kpi-title">Customers</div>
    <div className="bf-overview-kpi-value">{summary?.totalUsers ?? 0}</div>
    <div className={`bf-overview-kpi-delta ${deltas.customers.pct >= 0 ? 'up' : 'down'}`}>{fmtPct(deltas.customers.pct)} vs prev</div>
    <div className="bf-overview-kpi-icon customers">
      <Users size={24} />
    </div>
  </Card>
</div>

      <div className="bf-overview-charts">
        <div className={`bf-overview-chart ${exportOpts.revenue ? '' : 'bf-excluded'}`} ref={revenueRef}>
          <div className="bf-overview-chart-header">
            <div className="bf-overview-chart-title">Revenue (last {timeframe} days)</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueSeries}>
              <XAxis dataKey="date"
                tickFormatter={d => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                angle={-30} textAnchor="end" height={50} />
              <YAxis tickFormatter={v => `Rs ${Math.round(v / 1000)}k`} />
              <Tooltip formatter={val => fmt(val)} />
              <Line type="monotone" dataKey="amount" stroke="#54413C" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={`bf-overview-chart ${exportOpts.incomeExpense ? '' : 'bf-excluded'}`} ref={incomeExpenseRef}>
          <div className="bf-overview-chart-title">Income vs Expenses</div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={combineIncomeExpense(revenueSeries, expenses)}>
              <XAxis dataKey="date"
                tickFormatter={d => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                angle={-30} textAnchor="end" height={50} />
              <YAxis tickFormatter={v => `Rs ${Math.round(v / 1000)}k`} />
              <Tooltip formatter={val => fmt(val)} />
              <Area dataKey="income" stroke="#16A34A" fill="#bbf7d0" name="Income" />
              <Area dataKey="expense" stroke="#DC2626" fill="#fecaca" name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={`bf-overview-chart ${exportOpts.methods ? '' : 'bf-excluded'}`} ref={payMethodsRef}>
          <div className="bf-overview-chart-head">
            <div className="bf-overview-chart-title">Payment Methods</div>
            <div className="bf-overview-chart-legend">
              {methodBreakdown.map((m, i) => (
                <span key={i} className="bf-overview-legend-item">
                  <span className="bf-overview-legend-color" style={{ background: COLORS[i % COLORS.length] }} />{m.name}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={methodBreakdown} dataKey="value" nameKey="name" outerRadius={84} label>
                {methodBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={`bf-overview-panel ${exportOpts.topCustomers ? '' : 'bf-excluded'}`}>
          <div className="bf-overview-panel-title">Top 5 Customers</div>
          <table className="bf-overview-table">
            <thead><tr><th>Name</th><th>Email</th><th className="right">Revenue</th></tr></thead>
            <tbody>
              {customers.map(c => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td className="right">{fmt(c.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="bf-overview-activities">
          <h3 className="bf-overview-activities-title">Recent Activities</h3>
          <ul className="bf-overview-activities-feed">
            {activities.map((a, i) => (
              <li key={i} className={`bf-overview-activity-item ${a.type}`}>
                <div className="bf-overview-activity-icon">
                  {a.type === 'payment' && '💳'}
                  {a.type === 'invoice' && '📄'}
                  {a.type.startsWith('refund') && '💲'}
                </div>
                <div className="bf-overview-activity-message">{a.message}</div>
              </li>
            ))}
          </ul>
        </section>

      </div>
    </>
  );
}

/* ---------- helpers ---------- */
function buildSeries(pays = [], days = 30) {
  const map = {}, now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map[key] = 0;
  }
  pays.forEach(p => {
    if (p.status !== 'Completed') return;
    const k = (p.createdAt || '').slice(0, 10);
    if (map[k] != null) map[k] += Number(p.amount || 0);
  });
  return Object.entries(map).map(([date, amount]) => ({ date, amount }));
}
function breakdown(pays = [], days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (days - 1));
  const m = {};
  pays.forEach(p => {
    if (p.status !== 'Completed') return;
    const d = new Date(p.createdAt || 0);
    if (isNaN(d)) return;
    if (d < cutoff) return;
    m[p.method] = (m[p.method] || 0) + 1;
  });
  return Object.entries(m).map(([name, value]) => ({ name, value }));
}
function combineIncomeExpense(revenueSeries, exp = []) {
  const expMap = {};
  exp.forEach(e => { if (e.date) expMap[e.date] = (expMap[e.date] || 0) + Number(e.amount || 0); });
  return revenueSeries.map(r => ({ date: r.date, income: r.amount, expense: expMap[r.date] || 0 }));
}
function fmtPct(n) {
  try {
    if (n == null || isNaN(n)) return '0%';
    const val = Math.round(n);
    const sign = val > 0 ? '+' : '';
    return `${sign}${val}%`;
  } catch {
    return '0%';
  }
}