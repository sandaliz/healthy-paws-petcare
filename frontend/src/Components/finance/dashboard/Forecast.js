// src/finance/pages/Forecast.js
import React, { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { api } from '../services/financeApi';
import Card from './components/Card';
import { fmt } from '../utils/financeFormatters';
import '../css/dashboard/forecast.css';

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const toCurrency = (value) => fmt(value ?? 0);

const buildChartConfig = (entries = [], futureCount = 0) => {
  const labels = entries.map((entry) => entry.label);
  const historyLength = labels.length - futureCount;

  const sharedPointRadius = (ctx) => (ctx?.dataIndex ?? 0) >= historyLength ? 4 : 2.5;
  const sharedPointBorder = (ctx) => (ctx?.dataIndex ?? 0) >= historyLength ? 1.5 : 1;
  const forecastDash = (ctx) => (ctx?.p1DataIndex ?? 0) >= historyLength ? [6, 6] : undefined;

  return {
    labels,
    datasets: [
      {
        label: 'Revenue',
        data: entries.map((entry) => entry.revenue ?? 0),
        fill: true,
        borderColor: '#16A34A',
        backgroundColor: 'rgba(22, 163, 74, 0.18)',
        borderWidth: 3,
        tension: 0.35,
        pointRadius: sharedPointRadius,
        pointBorderWidth: sharedPointBorder,
        pointHoverRadius: 6,
        datalabels: { display: false },
      },
      {
        label: 'Expenses',
        data: entries.map((entry) => entry.expense ?? 0),
        fill: true,
        borderColor: '#DC2626',
        backgroundColor: 'rgba(220, 38, 38, 0.18)',
        borderWidth: 2,
        tension: 0.35,
        pointRadius: sharedPointRadius,
        pointBorderWidth: sharedPointBorder,
        segment: { borderDash: forecastDash },
        pointHoverRadius: 6,
        datalabels: { display: false },
      },
      {
        label: 'Profit',
        data: entries.map((entry) => entry.profit ?? 0),
        borderColor: '#2563EB',
        borderWidth: 2,
        fill: false,
        tension: 0.35,
        pointStyle: (ctx) => ((ctx?.dataIndex ?? 0) >= historyLength ? 'triangle' : 'circle'),
        pointRadius: (ctx) => ((ctx?.dataIndex ?? 0) >= historyLength ? 5 : 3),
        pointBorderWidth: 1.5,
        pointHoverRadius: 7,
        datalabels: { display: false },
      },
    ],
  };
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        font: { family: 'Poppins', size: 12 },
        color: '#54413C',
      },
    },
    datalabels: {
      display: false,
    },
    tooltip: {
      callbacks: {
        title: (items) => items.map((item) => item.label).join(' / '),
        label: (ctx) => `${ctx.dataset.label}: ${toCurrency(ctx.parsed.y)}`,
      },
      backgroundColor: 'rgba(84, 65, 60, 0.9)',
      borderWidth: 0,
      bodyFont: { family: 'Poppins' },
      titleFont: { family: 'Poppins', weight: '600' },
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#6B7280',
        maxRotation: 0,
        minRotation: 0,
        autoSkip: true,
        maxTicksLimit: 6,
        font: { family: 'Poppins', size: 11 },
        callback: (value) => {
          if (typeof value !== 'string') return value;
          const [start, end] = value.split(' – ');
          if (!end) return value;
          const shortEnd = end.split(' ')[0];
          return [`${start}`, `${shortEnd}`];
        },
      },
      border: { color: 'rgba(84, 65, 60, 0.2)' },
      grid: { display: false },
    },
    y: {
      ticks: {
        color: '#6B7280',
        callback: (value) => `Rs ${(value / 1000).toFixed(0)}k`,
        font: { family: 'Poppins', size: 11 },
      },
      border: { dash: [6, 4] },
      grid: {
        color: 'rgba(84, 65, 60, 0.08)',
        drawTicks: false,
      },
    },
  },
};

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

  const resolvedForecast = (forecast && !forecast.error) ? forecast : null;

  const combinedEntries = useMemo(() => {
    if (!resolvedForecast) return [];
    const history = resolvedForecast.history || [];
    const future = resolvedForecast.future || [];
    return [...history, ...future];
  }, [resolvedForecast]);

  const futureCount = resolvedForecast?.future?.length ?? 0;

  const chartData = useMemo(
    () => buildChartConfig(combinedEntries, futureCount),
    [combinedEntries, futureCount],
  );

  const futureTotals = useMemo(() => {
    const future = resolvedForecast?.future || [];
    return {
      revenue: future.reduce((acc, entry) => acc + (entry.revenue || 0), 0),
      expense: future.reduce((acc, entry) => acc + (entry.expense || 0), 0),
      profit: future.reduce((acc, entry) => acc + (entry.profit || 0), 0),
    };
  }, [resolvedForecast]);

  if (loading) {
    return <div className="loading">Loading forecast...</div>;
  }

  if (!resolvedForecast) {
    return (
      <div className="error-box">
        ⚠️ Could not load forecast: {forecast?.error || 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="forecast-page">
      <div className="forecast-head">
        <div>
          <h1>Finance Forecast</h1>
          <p className="forecast-sub">Bi-weekly projections aligned with insights visuals</p>
        </div>
        <div className="forecast-meta">
          <span className="forecast-tag">{resolvedForecast.periodDays}-day cadence</span>
          <span className="forecast-tag forecast-tag--accent">Next {((futureCount * (resolvedForecast.periodDays ?? 0)) / 7).toFixed(1)} weeks outlook</span>
        </div>
      </div>

      <div className="forecast-kpis">
        <Card className="kpi" title="Projected Revenue (Next 12 Weeks)" value={toCurrency(futureTotals.revenue)} />
        <Card className="kpi" title="Projected Expenses (Next 12 Weeks)" value={toCurrency(futureTotals.expense)} />
        <Card className="kpi" title="Projected Profit (Next 12 Weeks)" value={toCurrency(futureTotals.profit)} />
      </div>

      <div className="forecast-chart">
        <div className="forecast-chart-header">
          <h3>Revenue vs Expenses vs Profit</h3>
          <span className="forecast-caption">Solid lines show history · Dashed/triangles project the next 6 bi-weekly windows</span>
        </div>
        <div className="forecast-chart-canvas">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="forecast-table">
        <h3>Bi-weekly Forecast Breakdown</h3>
        <table className="fm-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Revenue</th>
              <th>Expenses</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>
            {(resolvedForecast.future || []).map((entry, idx) => (
              <tr key={entry.startDate || idx}>
                <td>{entry.label}</td>
                <td>{toCurrency(entry.revenue)}</td>
                <td>{toCurrency(entry.expense)}</td>
                <td className={entry.profit >= 0 ? 'pos' : 'neg'}>{toCurrency(entry.profit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
