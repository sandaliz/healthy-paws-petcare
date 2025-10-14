import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  FaBoxes, 
  FaBell, 
  FaPrescriptionBottle, 
  FaChartBar, 
  FaStore, 
  FaTruck 
} from "react-icons/fa";
import "./inventoryNav.css";

function InventoryNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    { path: "/product", label: "Product Catalogue", icon: <FaBoxes /> },
    { path: "/alerts", label: "Notification & Alerts", icon: <FaBell /> },
    { path: "/prescription-list", label: "Prescription Management", icon: <FaPrescriptionBottle /> },
    { path: "/insights", label: "Insights", icon: <FaChartBar /> },
    { path: "/shipping-logs", label: "Shipping Logs", icon: <FaTruck /> },
    { path: "/store", label: "Go to Pet Store", icon: <FaStore /> },
  ];

  return (
    <div className="inventory-nav-container">
      {/* Sidebar header/logo */}
      <div className="nav-header">
        <h2>Inventory Dashboard</h2>
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

      {/* Logout button only */}
      <div className="logout-section">
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
}

export default InventoryNav;