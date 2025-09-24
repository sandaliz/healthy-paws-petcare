import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../styles/adminSidebar.css"; // unique css just for sidebar

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="sidebar-container">
      <h2 className="sidebar-logo"> Admin</h2>
      <ul className="sidebar-menu">
        <li><NavLink to="/admin-dashboard">Dashboard</NavLink></li>
        <li><NavLink to="/admin-dashboard/feedbacks">Feedback</NavLink></li>
        <li><NavLink to="/admin-dashboard/petRegister">Pet Registration</NavLink></li>
        <li><NavLink to="/admin-dashboard/users">Users</NavLink></li>
      </ul>
      <button className="sidebar-logout-btn" onClick={handleLogout}>Logout</button>
    </aside>
  );
};

export default AdminSidebar;