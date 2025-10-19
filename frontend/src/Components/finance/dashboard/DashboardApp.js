import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import Overview from './Overview';
import Invoices from './Invoices';
import Payments from './Payments';
import Refunds from './Refunds';
import Coupons from './Coupons';
import Loyalty from './Loyalty';
import Salaries from './Salaries';
import Forecast from './Forecast';
import '../css/dashboard/dashboardApp.css';
import { api } from '../services/financeApi';

export default function DashboardApp() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [meta, setMeta] = useState({ total: 0, newCount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState([]);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setMeta(data.meta || { total: 0, newCount: 0 });
      setWarnings(data.warnings || []);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
      setMeta({ total: 0, newCount: 0 });
      setNotifications([]);
      setWarnings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const newCount = meta.newCount || notifications.filter(n => n.status === 'new').length;
  const indicator = useMemo(() => {
    const message = [];
    if (meta.pendingRefunds) message.push(`${meta.pendingRefunds} refund`);
    if (meta.pendingOfflinePayments) message.push(`${meta.pendingOfflinePayments} offline payment`);
    if (meta.overdueInvoices) message.push(`${meta.overdueInvoices} overdue invoice`);
    return message.join(', ');
  }, [meta]);

  return (
    <div className="fm-shell">
      <Sidebar />
      <main className="fm-main">
        <header className="fm-topbar">
          {/* <h1>Finance Manager</h1> */}
          <div className="fm-top-actions">
            <NavLink to="/fm" end className="fm-top-link">Finance Manager Dashboard</NavLink>
            <div className="fm-top-spacer" />
            <div className="fm-top-notify">
              <button
                className={`fm-notify-btn ${notifOpen ? 'open' : ''}`}
                onClick={() => setNotifOpen(o => !o)}
                aria-label="Finance notifications"
              >
                <Bell size={20} />
                {newCount > 0 && <span className="fm-notify-dot" aria-hidden="true" />}
              </button>
              {notifOpen && (
                <div className="fm-notify-menu">
                  <div className="fm-notify-header">
                    <h3>Finance Notifications</h3>
                    <p>{loading ? 'Refreshing…' : newCount > 0 ? `${newCount} new` : 'All caught up'}</p>
                  </div>
                  {indicator && (
                    <div className="fm-notify-meta">{indicator}</div>
                  )}
                  {meta.partial && (
                    <div className="fm-notify-warning">Partial data shown. See warnings below.</div>
                  )}
                  {warnings.length > 0 && (
                    <ul className="fm-notify-warnings">
                      {warnings.map((warn, idx) => (
                        <li key={warn.scope || idx}>
                          <strong>{warn.scope || 'Source'}:</strong> {warn.message}
                        </li>
                      ))}
                    </ul>
                  )}
                  {error && <div className="fm-notify-error">{error}</div>}
                  <ul>
                    {notifications.length === 0 && !loading && !error && (
                      <li className="empty">
                        <div className="fm-notify-type">Nothing yet</div>
                        <p>You are up to date with finance tasks.</p>
                      </li>
                    )}
                    {notifications.map(item => (
                      <li key={item.id} className={item.status === 'new' ? 'new' : ''}>
                        <div className="fm-notify-type">{item.type}</div>
                        <div className="fm-notify-title">{item.title}</div>
                        <p>{item.message}</p>
                        <div className="fm-notify-footer">
                          {item.timestamp && (
                            <span>{new Date(item.timestamp).toLocaleString()}</span>
                          )}
                          <NavLink to={item.link} onClick={() => setNotifOpen(false)}>View</NavLink>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="fm-notify-actions">
                    <button className="fm-notify-refresh" onClick={loadNotifications} disabled={loading}>
                      Refresh
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="fm-content">
          <Routes>
            <Route
              path="/"
              element={<Overview />}
            />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/refunds" element={<Refunds />} />
            <Route path="/coupons" element={<Coupons />} />
            <Route path="/loyalty" element={<Loyalty />} />
            <Route path="/salaries" element={<Salaries />} />
            <Route path="/forecast" element={<Forecast />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
