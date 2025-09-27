import React, { useEffect, useState, useRef } from 'react';
import { api } from '../../finance/services/financeApi';
import Card from './components/Card';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { FileText, BarChart2, CreditCard, Users } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../css/dashboard.css';

const COLORS = ['#54413C', '#FFD58E', '#9CA3AF', '#22C55E', '#EF4444'];

export default function Overview() {
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activities, setActivities] = useState([]);

  const revenueRef = useRef();
  const incomeExpenseRef = useRef();
  const payMethodsRef = useRef();
  const expenseRef = useRef();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const dash = await api.get('/financial-dashboard');
        const pays = await api.get('/payments');
        if (!mounted) return;
        setSummary(dash);
        setPayments(pays.payments || []);
      } catch (e) { console.error('Failed to fetch finance data', e); }

      setExpenses([
        { category: 'Salaries', amount: 500000 },
        { category: 'Marketing', amount: 180000 },
        { category: 'Supplies', amount: 80000 },
        { category: 'Other', amount: 40000 }
      ]);
      setCustomers([
        { _id: 1, name: 'Alice Johnson', email: 'alice@corp.com', revenue: 250000 },
        { _id: 2, name: 'Bob Smith', email: 'bob@biz.com', revenue: 180000 },
        { _id: 3, name: 'Charlie Lee', email: 'charlie@startup.com', revenue: 120000 },
        { _id: 4, name: 'Diana King', email: 'diana@shop.com', revenue: 110000 },
        { _id: 5, name: 'Evan Wright', email: 'evan@agency.com', revenue: 95000 }
      ]);
      setActivities([
        { message: 'Invoice #432 created (Alice Johnson)' },
        { message: 'Payment of LKR 40,000 received from Bob Smith' },
        { message: 'Refund approved for Charlie Lee' },
        { message: 'New coupon issued: SPRING25' }
      ]);
    })();
    return () => { mounted = false; };
  }, []);

  const revenueSeries = buildSeries(payments);
  const methodBreakdown = breakdown(payments);
  const expenseBreakdown = groupExpenses(expenses);

  const exportPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('HealthyPaws — Financial Overview Report', 14, 20);

    doc.setFontSize(11).setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

    doc.setFont('helvetica', 'bold').setFontSize(14);
    doc.text('Key Metrics', 14, 40);
    doc.setFont('helvetica', 'normal').setFontSize(12);
    doc.text(`Total Revenue: ${fmt(summary?.totalRevenue)}`, 20, 50);
    doc.text(`Invoices: ${summary?.totalInvoices ?? 0}`, 20, 58);
    doc.text(`Payments: ${summary?.totalPayments ?? 0}`, 20, 66);
    doc.text(`Customers: ${summary?.totalUsers ?? 0}`, 20, 74);

    let y = 90;

    const addChart = async (ref, title) => {
      if (!ref.current) return;
      const canvas = await html2canvas(ref.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 180;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      if (y + pdfHeight > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('helvetica', 'bold').setFontSize(13);
      doc.text(title, 14, y);
      y += 5;
      doc.addImage(imgData, 'PNG', 14, y, pdfWidth, pdfHeight);
      y += pdfHeight + 15;
    };

    await addChart(revenueRef, 'Revenue (last 30 days)');
    await addChart(incomeExpenseRef, 'Income vs Expenses');
    await addChart(payMethodsRef, 'Payment Methods');
    await addChart(expenseRef, 'Expense Breakdown');

    doc.setFont('helvetica', 'bold').setFontSize(14);
    doc.text('Top Customers', 14, y);
    y += 8;
    doc.setFont('helvetica', 'normal').setFontSize(11);
    customers.forEach((c, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`${i+1}. ${c.name} (${c.email}) — ${fmt(c.revenue)}`, 20, y);
      y += 7;
    });

    if (y > 230) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold').setFontSize(14);
    doc.text('Recent Activities', 14, y);
    y += 8;
    doc.setFont('helvetica', 'normal').setFontSize(11);
    activities.forEach((a, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`• ${a.message}`, 20, y);
      y += 6;
    });

    doc.save('HealthyPaws_Finance_Report.pdf');
  };

  return (
    <>
      <div className="page-head">
        <h2>Finance Overview</h2>
        <button className="btn primary" onClick={exportPDF}>Export PDF</button>
      </div>

      <div className="overview-grid">
        <Card title="Total Revenue" value={fmt(summary?.totalRevenue)}>
          <div className="kpi-icon revenue"><BarChart2 size={24} /></div>
        </Card>
        <Card title="Invoices" value={summary?.totalInvoices ?? 0}>
          <div className="kpi-icon invoices"><FileText size={24} /></div>
        </Card>
        <Card title="Payments" value={summary?.totalPayments ?? 0}>
          <div className="kpi-icon payments"><CreditCard size={24} /></div>
        </Card>
        <Card title="Customers" value={summary?.totalUsers ?? 0}>
          <div className="kpi-icon customers"><Users size={24} /></div>
        </Card>

        <div className="chart-card" ref={revenueRef}>
          <div className="chart-title">Revenue (last 30 days)</div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={revenueSeries}>
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) =>
                    new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                  }
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tickFormatter={(v) => `Rs ${Math.round(v / 1000)}k`} />
                <Tooltip
                  labelFormatter={(d) =>
                    new Date(d).toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' })
                  }
                  formatter={(val) => fmt(val)}
                />
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#54413C" stopOpacity={0.7}/>
                    <stop offset="100%" stopColor="#FFD58E" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#54413C"
                  strokeWidth={2.5}
                  dot={false}
                  fill="url(#revGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card" ref={incomeExpenseRef}>
          <div className="chart-title">Income vs Expenses</div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={combineIncomeExpense(revenueSeries, expenseBreakdown)}>
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) =>
                    new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                  }
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tickFormatter={(v) => `Rs ${Math.round(v / 1000)}k`} />
                <Tooltip
                  labelFormatter={(d) =>
                    new Date(d).toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })
                  }
                  formatter={(val) => fmt(val)}
                />
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#16A34A"
                  strokeWidth={2}
                  fill="url(#incomeGradient)"
                  name="Income"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#DC2626"
                  strokeWidth={2}
                  fill="url(#expenseGradient)"
                  name="Expenses"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card" ref={payMethodsRef}>
          <div className="chart-header">
            <div className="chart-title">Payment Methods</div>
            <div className="chart-legend">
              {methodBreakdown.map((d, i) => (
                <div key={i} className="legend-item">
                  <span
                    className="legend-color"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  ></span>{d.name}
                </div>
              ))}
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={methodBreakdown} dataKey="value" nameKey="name" outerRadius={84} label>
                  {methodBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card" ref={expenseRef}>
          <div className="chart-header">
            <div className="chart-title">Expense Breakdown</div>
            <div className="chart-legend">
              {expenseBreakdown.map((d, i) => (
                <div key={i} className="legend-item">
                  <span
                    className="legend-color"
                    style={{ backgroundColor: COLORS[(i+2) % COLORS.length] }}
                  ></span>{d.name}
                </div>
              ))}
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={expenseBreakdown} dataKey="value" nameKey="name" outerRadius={84} label>
                  {expenseBreakdown.map((_, i) => <Cell key={i} fill={COLORS[(i+2) % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card panel">
          <div className="panel-title">Top 5 Customers</div>
          <table className="fm-table small">
            <thead><tr><th>Customer</th><th>Email</th><th className="right">Revenue</th></tr></thead>
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

        <div className="card panel">
          <div className="panel-title">Recent Activities</div>
          <ul className="activity-list">
            {activities.map((a, i) => <li key={i}>{a.message}</li>)}
          </ul>
        </div>

        <div className="card panel">
          <div className="panel-title">Notifications</div>
          <ul className="notif-list">
            <li>Pending refund approvals</li>
            <li>Overdue invoices</li>
            <li>Low coupon stock</li>
          </ul>
        </div>
      </div>
    </>
  );
}

function buildSeries(pays = []) {
  const map = {};
  const days = 30, now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now); d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0,10);
    map[key] = 0;
  }
  pays.forEach(p => {
    if (p.status !== 'Completed') return;
    const key = (p.createdAt || '').slice(0,10);
    if (map[key] != null) map[key] += Number(p.amount || 0);
  });
  return Object.entries(map).map(([date, amount]) => ({ date, amount }));
}
function breakdown(pays = []) {
  const m = {};
  pays.forEach(p => { if (p.status === 'Completed') m[p.method] = (m[p.method] || 0) + 1; });
  return Object.entries(m).map(([name, value]) => ({ name, value }));
}
function groupExpenses(exp = []) {
  return exp.map(e => ({ name: e.category, value: e.amount }));
}
function combineIncomeExpense(revenueSeries, expenses = []) {
  return revenueSeries.map(r => ({
    date: r.date,
    income: r.amount,
    expense: Math.floor((Math.random()*0.5 + 0.2)*r.amount)
  }));
}
function fmt(n) {
  return new Intl.NumberFormat('en-LK',{ style:'currency',currency:'LKR'}).format(Number(n)||0);
}