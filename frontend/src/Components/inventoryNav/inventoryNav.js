import React from 'react';
import './inventoryNav.css';
import { Link, useLocation } from 'react-router-dom';
import { FaBoxes, FaBell, FaPrescriptionBottle, FaChartBar, FaStore } from 'react-icons/fa';

function InventoryNav() {
  const location = useLocation(); // Get current route to highlight active link

  const navItems = [
    { path: "/product", label: "Product Catalogue", icon: <FaBoxes /> },
    { path: "/alerts", label: "Notification & Alerts", icon: <FaBell /> },
    { path: "/prescription-list", label: "Prescription Management", icon: <FaPrescriptionBottle /> },
    { path: "/insights", label: "Insights", icon: <FaChartBar /> },
    { path: "/store", label: "Go to Pet Store", icon: <FaStore /> },
  ];

  return (
    <div className="inventory-nav-container">
      
      {/* Sidebar header/logo */}
      <div className="nav-header">
        <span role="img" aria-label="paw"></span>
        <h2>Healthy Paws</h2>
      </div>

      {/* Nav items */}
      <ul className="Nav-ul">
        {navItems.map(({ path, label, icon }) => (
          <li 
            key={path} 
            className={`Nav-li ${location.pathname === path ? "active" : ""}`}
          >
            <Link to={path}>
              <span className="nav-icon">{icon}</span>
              <span className="nav-text">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default InventoryNav;