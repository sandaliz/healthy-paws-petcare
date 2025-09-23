import React from 'react';
import './SideBarDC.css';

function SideBarDC({ activeTab, setActiveTab, todaysPetsCount, pendingAppointmentsCount }) {
  const menuItems = [
    { id: 'todaysPets', label: `Today's Pets (${todaysPetsCount})` },
    
    { id: 'history', label: 'Appointment History' },
    
    { id: 'pending', label: `Pending Appointments (${pendingAppointmentsCount})` },
    { id: 'upcoming', label: 'Upcoming Appointments' },
    { id: 'reviews', label: 'Reviews' },
    
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>HealthyPaws Daycare 🐾</h2>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map(item => (
            <li key={item.id}>
              <button
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <p>Daycare Management System</p>
      </div>
    </aside>
  );
}

export default SideBarDC;
