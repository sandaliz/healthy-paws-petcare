import React from 'react';
import { NavLink } from 'react-router-dom';
import { PieChart, Receipt, CreditCard, RefreshCcw, Ticket, Trophy, Wallet } from 'lucide-react';

const link = ({ isActive }) => `fm-nav-link ${isActive ? 'active' : ''}`;

export default function Sidebar() {
  return (
    <aside className="fm-sidebar">
      <div className="fm-brand">
        <div className="fm-logo">🐾</div>
        <div className="fm-title">Healthy Paws</div>
      </div>
      <nav className="fm-nav">
        <NavLink to="/fm" end className={link}><PieChart size={18} /><span>Overview</span></NavLink>
        <NavLink to="/fm/invoices" className={link}><Receipt size={18} /><span>Invoices</span></NavLink>
        <NavLink to="/fm/payments" className={link}><CreditCard size={18} /><span>Payments</span></NavLink>
        <NavLink to="/fm/refunds" className={link}><RefreshCcw size={18} /><span>Refunds</span></NavLink>
        <NavLink to="/fm/coupons" className={link}><Ticket size={18} /><span>Coupons</span></NavLink>
        <NavLink to="/fm/loyalty" className={link}><Trophy size={18} /><span>Loyalty</span></NavLink>
        <NavLink to="/fm/salaries" className={link}><Wallet size={18} /><span>Salaries</span></NavLink>
      </nav>
    </aside>
  );
}