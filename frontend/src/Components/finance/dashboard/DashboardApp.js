import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';
import Overview from './Overview';
import Invoices from './Invoices';
import Payments from './Payments';
import Refunds from './Refunds';
import Coupons from './Coupons';
import Loyalty from './Loyalty';
import Salaries from './Salaries';
import '../css/dashboard.css';

export default function DashboardApp() {
  return (
    <div className="fm-shell">
      <Sidebar />
      <main className="fm-main">
        <header className="fm-topbar">
          <h1>Finance Manager</h1>
          <div className="fm-top-actions">
            <NavLink to="/fm" end className="fm-top-link">Overview</NavLink>
          </div>
        </header>
        <div className="fm-content">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/refunds" element={<Refunds />} />
            <Route path="/coupons" element={<Coupons />} />
            <Route path="/loyalty" element={<Loyalty />} />
            <Route path="/salaries" element={<Salaries />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
