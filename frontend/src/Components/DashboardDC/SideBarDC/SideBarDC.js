import React from 'react';
import { useNavigate } from "react-router-dom";
import './SideBarDC.css';



function SideBarDC({ activeTab, setActiveTab, todaysPetsCount, pendingAppointmentsCount }) {
  const menuItems = [
    { id: 'analyticDC', label: `Overview` },
    { id: 'todaysPets', label: `Today's Pets` },
    { id: 'history', label: 'Appointment History' },
    { id: 'pending', label: `Pending Appointments` },
    { id: 'upcoming', label: 'Upcoming Appointments' },
    { id: 'reviews', label: 'Reviews' },

  ];

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="sidebar-dc">
      <div className="sidebar-header-dc">
        <h2>HealthyPaws Daycare</h2>
      </div>

      <nav className="sidebar-nav-dc">
        <ul>
          {menuItems.map(item => (
            <li key={item.id}>
              <button
                className={`nav-item-dc ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="nav-icon-dc">{item.icon}</span>
                <span className="nav-label-dc">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <button className="sidebar-logout-btn" onClick={handleLogout}>
        <span className="logout-icon"></span>
        <span className="logout-text">Logout</span>
      </button>

      <div className="sidebar-footer-dc">
        <p>Daycare Management System</p>
      </div>
    </aside>
  );
}

export default SideBarDC;
