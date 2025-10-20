import { useState } from "react";
import "./DoctorDashboard.css";
import DoctorEvents from "../doctor-events/DoctorEvents";
import DoctorAppontments from "../doctor-appointments/DoctorAppontments";
import DoctorQuesions from "../doctor_quesions/DoctorQuesions";

const DoctorDashboard = () => {
  const [activeKey, setActiveKey] = useState("overview");

  const menuItems = [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "event-management", label: "Event Management", icon: "📅" },
    { key: "appointment-management", label: "Appointment Management", icon: "📋" },
    { key: "question-management", label: "Question Management", icon: "❓" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">🐾</div>
            <h2>Healthy Paws</h2>
          </div>
        </div>
        
        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <div
              key={item.key}
              className={`menu-item ${activeKey === item.key ? "active" : ""}`}
              onClick={() => setActiveKey(item.key)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="logout-button" onClick={handleLogout}>
            <span className="menu-icon">🚪</span>
            <span className="menu-label">Logout</span>
          </div>
        </div>
      </div>
      
      <div className="main-content">
        <div className="content-area">
          {activeKey === "overview" && (
            <div className="overview-section">
              <h1>Welcome to Healthy Paws Dashboard</h1>
              <p>Select a menu item to get started.</p>
            </div>
          )}
          {activeKey === "event-management" && <DoctorEvents />}
          {activeKey === "appointment-management" && <DoctorAppontments />}
          {activeKey === "question-management" && <DoctorQuesions />}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
