import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/financeApi';
import Card from './components/Card';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { FileText, BarChart2, CreditCard, Users } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../css/dashboard.css';
import { fmt } from '../utils/financeFormatters';

const COLORS = ['#54413C', '#FFD58E', '#9CA3AF', '#22C55E', '#EF4444'];

export default function Overview() {
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState({
    pendingRefunds: 0,
    overdueInvoices: 0,
    lowCoupons: 0,
  });

  const revenueRef = useRef();
  const incomeExpenseRef = useRef();
  const payMethodsRef = useRef();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const dash = await api.get('/financial-dashboard');
        const pays = await api.get('/payments');
        const invs = await api.get('/invoices');
        const sal = await api.get('/salaries');
        const refunds = await api.get('/refunds');
        const coupons = await api.get('/coupons');
        if (!mounted) return;

        setSummary(dash);
        setPayments(pays.payments || []);

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

        const acts = [];
        (pays.payments || []).slice(0, 5).forEach(p => {
          let who = '';
          if (p.userID && typeof p.userID === 'object') {
            who = p.userID.name;
          } else if (p.invoiceID?.userID && typeof p.invoiceID.userID === 'object') {
            who = p.invoiceID.userID.name;
          }
          acts.push({
            type: 'payment',
            message: <>Payment {p.paymentID} of <b>{fmt(p.amount)}</b> ({p.method}) </>
          });
        });

        (invs.invoices || []).slice(0, 5).forEach(i => {
          acts.push({
            type: 'invoice',
            message: <>Invoice {i.invoiceID} created for <b>{i.userID?.name || 'Unknown'}</b></>
          });
        });

        (refunds.requests || []).slice(0, 5).forEach(r => {
          const cust = r.userID?.name || 'Unknown';
          if (r.status === 'Pending') {
            acts.push({ type: 'refund', message: <>Refund placed by <b>{cust}</b> for <b>{fmt(r.amount)}</b></> });
          }
          if (r.status === 'Approved') {
            acts.push({ type: 'refund-approved', message: <>Refund approved for <b>{cust}</b> of <b>{fmt(r.amount)}</b></> });
          }
          if (r.status === 'Rejected') {
            acts.push({ type: 'refund-rejected', message: <>Refund rejected for <b>{cust}</b></> });
          }
        });

        setActivities(acts.slice(0, 8));

        const pendingRefunds = (refunds.requests || []).filter(r => r.status === 'Pending').length;
        const overdueInvoices = (invs.invoices || []).filter(i => i.status === 'Overdue').length;
        const lowCoupons = (coupons.coupons || []).filter(c => {
          if (c.scope !== 'GLOBAL') return false;
          if (!c.usageLimit || c.usageLimit <= 0) return false;
          return (c.usageLimit - (c.usedCount || 0)) <= 5;
        }).length;
        setNotifications({ pendingRefunds, overdueInvoices, lowCoupons });
      } catch (e) {
        console.error('Failed to fetch finance data', e);
      }
    })();
    return () => { mounted = false };
  }, []);

  const revenueSeries = buildSeries(payments);
  const methodBreakdown = breakdown(payments);

  const exportPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFont('helvetica', 'bold').setFontSize(18);
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
      if (y + pdfHeight > 270) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold').setFontSize(13).text(title, 14, y);
      y += 5;
      doc.addImage(imgData, 'PNG', 14, y, pdfWidth, pdfHeight);
      y += pdfHeight + 15;
    };
    await addChart(revenueRef, 'Revenue (last 30 days)');
    await addChart(incomeExpenseRef, 'Income vs Expenses');
    await addChart(payMethodsRef, 'Payment Methods');

    doc.setFont('helvetica', 'bold').setFontSize(14).text('Top Customers', 14, y);
    y += 8; doc.setFont('helvetica', 'normal').setFontSize(11);
    customers.forEach((c, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`${i + 1}. ${c.name} (${c.email}) — ${fmt(c.revenue)}`, 20, y);
      y += 7;
    });
    doc.save('HealthyPaws_Finance_Report.pdf');
  };

  return (
    <>
      <div className="page-head">
        <h2>Finance Overview</h2>
        <button className="btn fm-o-btn-primary" onClick={exportPDF}>Export PDF</button>
      </div>
      <div className="overview-grid">
        <div className="overview-grid kpis">
          <Card className="kpi" title="Total Revenue" value={fmt(summary?.totalRevenue)}>
            <div className="kpi-icon revenue"><BarChart2 size={24} /></div>
          </Card>
          <Card className="kpi" title="Invoices" value={summary?.totalInvoices ?? 0}>
            <div className="kpi-icon invoices"><FileText size={24} /></div>
          </Card>
          <Card className="kpi" title="Payments" value={summary?.totalPayments ?? 0}>
            <div className="kpi-icon payments"><CreditCard size={24} /></div>
          </Card>
          <Card className="kpi" title="Customers" value={summary?.totalUsers ?? 0}>
            <div className="kpi-icon customers"><Users size={24} /></div>
          </Card>
        </div>
      </div>
      <div className="overview-grid charts">
        <div className="chart-card" ref={revenueRef}>
          <div className="chart-header">
            <div className="chart-title">Revenue (last 30 days)</div>
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-color" style={{ background: '#54413C' }}></span>Revenue</span>
            </div>
          </div>
          <div className="chart-body">
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
        </div>

        <div className="chart-card" ref={incomeExpenseRef}>
          <div className="chart-header">
            <div className="chart-title">Income vs Expenses</div>
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-color" style={{ background: '#16A34A' }}></span>Income</span>
              <span className="legend-item"><span className="legend-color" style={{ background: '#DC2626' }}></span>Expenses</span>
            </div>
          </div>
          <div className="chart-body">
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
        </div>

        <div className="chart-card" ref={payMethodsRef}>
          <div className="chart-header">
            <div className="chart-title">Payment Methods</div>
            <div className="chart-legend">
              {methodBreakdown.map((m, i) => (
                <span key={i} className="legend-item">
                  <span className="legend-color" style={{ background: COLORS[i % COLORS.length] }}></span>{m.name}
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

        <div className="card panel">
          <div className="panel-title">Top 5 Customers</div>
          <table className="fm-table small">
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

        <section className="overview-activities" style={{ gridColumn: 'span 2' }}>
          <h3 className="activities-title">Recent Activities</h3>
          <ul className="activities-feed">
            {activities.map((a, i) => (
              <li key={i} className="activity-item">
                <div className={`activity-icon ${a.type}`}>
                  {a.type === 'payment' && '💳'}
                  {a.type === 'invoice' && '📄'}
                  {a.type === 'refund' && '💲'}
                  {a.type === 'refund-approved' && '✅'}
                  {a.type === 'refund-rejected' && '❌'}
                </div>
                <div className="activity-content">
                  <div className="activity-message">{a.message}</div>
                  {a.user && (
                    <div className="activity-user">
                      <span className="name">{a.user.name}</span>
                      {a.user.email && <span className="email">({a.user.email})</span>}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="card panel">
          <div className="panel-title">Notifications</div>
          <ul className="notif-list">
            <li>{notifications.pendingRefunds} pending refund approvals</li>
            <li>{notifications.overdueInvoices} overdue invoices</li>
            <li>{notifications.lowCoupons} coupon templates low on stock</li>
          </ul>
        </div>
      </div>
    </>
  );
}

function buildSeries(pays = []) {
  const map = {}, days = 30, now = new Date();
  for (let i = days - 1; i >= 0; i--) { const d = new Date(now); d.setDate(now.getDate() - i); const key = d.toISOString().slice(0, 10); map[key] = 0; }
  pays.forEach(p => { if (p.status !== 'Completed') return; const k = (p.createdAt || '').slice(0, 10); if (map[k] != null) map[k] += Number(p.amount || 0); });
  return Object.entries(map).map(([date, amount]) => ({ date, amount }));
}
function breakdown(pays = []) { const m = {}; pays.forEach(p => { if (p.status === 'Completed') m[p.method] = (m[p.method] || 0) + 1 }); return Object.entries(m).map(([name, value]) => ({ name, value })); }
function combineIncomeExpense(revenueSeries, exp = []) {
  const expMap = {}; exp.forEach(e => { if (e.date) expMap[e.date] = (expMap[e.date] || 0) + Number(e.amount || 0); });
  return revenueSeries.map(r => ({ date: r.date, income: r.amount, expense: expMap[r.date] || 0 }));
}