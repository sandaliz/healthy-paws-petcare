import React, { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  PieChart, Receipt, CreditCard, RefreshCcw,
  Ticket, Trophy, Wallet, LogOut, TrendingUp
} from 'lucide-react';

import Modal from './components/Modal';

const link = ({ isActive }) => `fm-nav-link ${isActive ? 'active' : ''}`;

export default function Sidebar() {
  const [user, setUser] = useState(null);
  const [logoutModal, setLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    document.body.classList.add('fm-logging-out');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setTimeout(() => navigate('/login'), 600);
  };

  return (
    <aside className="fm-sidebar">
      {/* Brand */}
      <Link to="/home" className="fm-brand fm-brand-link" title="Go to Home">
        <div className="fm-logo">🐾</div>
        <div className="fm-title">Healthy Paws</div>
      </Link>

      {/* Main Nav */}
      <nav className="fm-nav">
        <NavLink to="/fm" end className={link}>
          <PieChart size={18} /><span>Overview</span>
        </NavLink>
        <NavLink to="/fm/invoices" className={link}>
          <Receipt size={18} /><span>Invoice Center</span>
        </NavLink>
        <NavLink to="/fm/payments" className={link}>
          <CreditCard size={18} /><span>Payment Management</span>
        </NavLink>
        <NavLink to="/fm/refunds" className={link}>
          <RefreshCcw size={18} /><span>Refund Management</span>
        </NavLink>
        <NavLink to="/fm/coupons" className={link}>
          <Ticket size={18} /><span>Coupons</span>
        </NavLink>
        <NavLink to="/fm/loyalty" className={link}>
          <Trophy size={18} /><span>PawPerks Loyalty</span>
        </NavLink>
        <NavLink to="/fm/salaries" className={link}>
          <Wallet size={18} /><span>Payroll Management</span>
        </NavLink>
      </nav>

      {/* Special feature: Income Forecasting */}
      <div className="fm-special-feature">
        <NavLink to="/fm/forecast" className="fm-forecast-link">
          <TrendingUp size={18} /><span>Income Forecasting</span>
        </NavLink>
      </div>

      {/* Logout */}
      <div className="fm-logout-area">
        <button onClick={() => setLogoutModal(true)} className="fm-logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      {logoutModal && (
        <Modal open={logoutModal} onClose={() => setLogoutModal(false)} title="Confirm Logout">
          <div className="notice error">⚠️ Are you sure you want to logout?</div>
          <div className="row end delete-coupon-actions">
            <button className="loyalty-btn-ghost" onClick={() => setLogoutModal(false)}>Cancel</button>
            <button className="fm-logout-btn" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </Modal>
      )}
    </aside>
  );
}