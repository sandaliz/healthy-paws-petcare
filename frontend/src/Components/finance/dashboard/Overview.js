import React, { useEffect, useState } from 'react';
import { api } from '../financeApi';
import Card from './components/Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../css/dashboard.css';

const COLORS = ['#54413C', '#FFD58E', '#9CA3AF', '#22C55E', '#EF4444'];

export default function Overview() {
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const dash = await api.get('/financial-dashboard');
      const pays = await api.get('/payments');
      if (!mounted) return;
      setSummary(dash);
      setPayments(pays.payments || []);
    })();
    return () => { mounted = false; };
  }, []);

  const series = buildSeries(payments);
  const methods = breakdown(payments);

  return (
    <div className="overview-grid">
      <Card title="Total Revenue" value={fmt(summary?.totalRevenue)} />
      <Card title="Invoices" value={summary?.totalInvoices ?? 0} />
      <Card title="Payments" value={summary?.totalPayments ?? 0} />
      <Card title="Customers" value={summary?.totalUsers ?? 0} />

      <div className="chart-card">
        <div className="chart-title">Revenue (last 30 days)</div>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={series}>
              <XAxis dataKey="date" hide />
              <YAxis tickFormatter={(v) => `LKR ${Math.round(v/1000)}k`} />
              <Tooltip formatter={(v) => fmt(v)} labelFormatter={() => ''} />
              <Line type="monotone" dataKey="amount" stroke="#54413C" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-title">Payment Methods</div>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={methods} dataKey="value" nameKey="name" outerRadius={84} label>
                {methods.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card panel">
        <div className="panel-title">Notifications</div>
        <ul className="notif-list">
          <li>Pending refunds approval</li>
          <li>Overdue invoices (status != Paid AND dueDate {'<'} today)</li>
          <li>Low coupon stock (usageLimit reached)</li>
        </ul>
      </div>
    </div>
  );
}

function buildSeries(pays = []) {
  const map = {};
  const days = 30, now = new Date();
  for (let i=days-1;i>=0;i--) {
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
function fmt(n) {
  return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(Number(n) || 0);
}