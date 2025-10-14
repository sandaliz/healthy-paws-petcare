import React, { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { PieChart, Receipt, CreditCard, RefreshCcw, Ticket, Trophy, Wallet, LogOut } from 'lucide-react';

const link = ({ isActive }) => `fm-nav-link ${isActive ? 'active' : ''}`;

export default function Sidebar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Load user from localStorage (optional)
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // logout function (same as Navbar)
  const handleLogout = () => {
  // add a CSS class that will trigger animation
  document.body.classList.add('fm-logging-out');

  // clear session data immediately
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  setUser(null);

  // navigate after short delay (matches animation)
  setTimeout(() => {
    navigate('/login');
  }, 600); // 0.6s
};

  return (
    <aside className="fm-sidebar">
      {/* Brand */}
      <Link to="/home" className="fm-brand fm-brand-link" title="Go to Home">
        <div className="fm-logo">🐾</div>
        <div className="fm-title">Healthy Paws</div>
      </Link>

      {/* Nav Links */}
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
          <Trophy size={18} /><span>PawPerks Loyalty Management</span>
        </NavLink>
        <NavLink to="/fm/salaries" className={link}>
          <Wallet size={18} /><span>Payroll Management</span>
        </NavLink>
      </nav>

      {/* Logout section */}
      <div className="fm-logout-area">
        <button onClick={handleLogout} className="fm-logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}