// src/finance/pages/Forecast.js
import React, { useEffect, useState } from 'react';
import { api } from '../services/financeApi';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Card from './components/Card';
import { fmt } from '../utils/financeFormatters';
import '../css/dashboard/forecast.css';

export default function Forecast() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/forecast');
        if (!mounted) return;
        setForecast(res);
      } catch (err) {
        console.error('Failed to fetch forecast', err);
        setForecast({ error: err.message });
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <div className="loading">Loading forecast...</div>;
  }

  if (!forecast || forecast.error) {
    return (
      <div className="error-box">
        ⚠️ Could not load forecast: {forecast?.error || 'Unknown error'}
      </div>
    );
  }

  // Combine history + future for chart
  const chartData = [
    ...(forecast.history || []),
    ...(forecast.future || []),
  ].map((d, i) => ({
    name: d.month,
    revenue: d.revenue,
    expense: d.expense,
    profit: d.profit,
    idx: i,
  }));

  const totalFutureProfit = (forecast.future || []).reduce((a, f) => a + f.profit, 0);

  return (
    <div className="forecast-page">

      <div className="forecast-kpis">
        <Card className="kpi" title="Projected 3-Month Revenue"
          value={fmt((forecast.future || []).reduce((a, f) => a + f.revenue, 0))} />
        <Card className="kpi" title="Projected 3-Month Expenses"
          value={fmt((forecast.future || []).reduce((a, f) => a + f.expense, 0))} />
        <Card className="kpi" title="Projected 3-Month Profit"
          value={fmt(totalFutureProfit)} />
      </div>

      <div className="forecast-chart">
        <h3>Revenue, Expenses & Profit (History + Forecast)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={v => `Rs ${Math.round(v / 1000)}k`} />
            <Tooltip formatter={(v, k) => [fmt(v), k]} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#16A34A" name="Revenue" />
            <Line type="monotone" dataKey="expense" stroke="#DC2626" name="Expenses" />
            <Line type="monotone" dataKey="profit" stroke="#2563EB" name="Profit" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="forecast-table">
        <h3>Forecast Breakdown</h3>
        <table className="fm-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Revenue</th>
              <th>Expenses</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>
            {(forecast.future || []).map((f, i) => (
              <tr key={i}>
                <td>{f.month}</td>
                <td>{fmt(f.revenue)}</td>
                <td>{fmt(f.expense)}</td>
                <td className={f.profit >= 0 ? 'pos' : 'neg'}>
                  {fmt(f.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
