import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../styles/adminSidebar.css";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="sidebar-container">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">Admin Panel</h2>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          <li>
            <NavLink to="/admin-dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span className="nav-icon"></span>
              <span className="nav-text">Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin-dashboard/feedbacks" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span className="nav-icon"></span>
              <span className="nav-text">Feedback</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin-dashboard/petRegister" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span className="nav-icon"></span>
              <span className="nav-text">Pet Registration</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin-dashboard/users" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span className="nav-icon"></span>
              <span className="nav-text">Users</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <span className="logout-icon"></span>
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;