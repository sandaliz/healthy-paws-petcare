// src/pages/admin_dashbord/UsersPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ Added for logout redirect
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import "../../styles/admindashbord.css";

ChartJS.register(ArcElement, Tooltip); // Removed legend

// 🔹 Role -> Icon + Gradient Mapping
const roleStyles = {
  ADMIN: {
    icon: "🛠",
    gradient: "linear-gradient(90deg, #2196F3, #21CBF3)", // Blue gradient
  },
  PET_CARE_TAKER: {
    icon: "🐾",
    gradient: "linear-gradient(90deg, #2ECC71, #27AE60)", // Green gradient
  },
  RECEPTIONIST: {
    icon: "📋",
    gradient: "linear-gradient(90deg, #9C27B0, #E040FB)", // Purple/pink
  },
  INVENTORY_MANAGER: {
    icon: "📦",
    gradient: "linear-gradient(90deg, #FF9800, #FF5722)", // Orange
  },
  FINANCE_MANAGER: {
    icon: "💰",
    gradient: "linear-gradient(90deg, #FFC107, #FFD54F)", // Gold
  },
};

const UsersPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate(); // ✅ hook for logout

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Fetch stats data
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/dashboard/admin-dashboard-stats", {
        withCredentials: true,
      })
      .then((res) => {
        // Filter only staff roles
        const filteredStats = {
          ...res.data,
          roleStats: res.data.roleStats.filter((r) =>
            ["ADMIN", "PET_CARE_TAKER", "RECEPTIONIST", "INVENTORY_MANAGER", "FINANCE_MANAGER"].includes(r.role)
          ),
        };
        setStats(filteredStats);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching dashboard stats:", err.response?.data || err.message);
        setErrorMsg("Failed to load role data");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="loading">⏳ Loading role statistics...</p>;
  if (errorMsg) return <p className="error">❌ {errorMsg}</p>;
  if (!stats) return <p className="error">⚠️ No data available</p>;

  // Pie chart data (only staff roles)
  const pieData = {
    labels: stats.roleStats.map((r) => r.role),
    datasets: [
      {
        data: stats.roleStats.map((r) => r.count),
        backgroundColor: ["#2196F3", "#2ECC71", "#9C27B0", "#FF9800", "#FFC107"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">🐾 Admin</h2>
        <ul>
          <li>
            <a href="/admin-dashboard">📊 Dashboard</a>
          </li>
          <li>
            <a href="/admin-dashboard/feedbacks">📝 Feedback</a>
          </li>
          <li>
            <a href="/admin-dashboard/petRegister">🐕 Pet Registration</a>
          </li>
          <li>
            <a href="/admin-dashboard/users">👥 Users</a>
          </li>
        </ul>
        {/* ✅ Logout Button */}
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Staff Overview title */}
        <div className="section-header">
          <h2>👥 Staff Overview</h2>
          <p className="subtitle">A quick look at your management team roles and activity</p>
        </div>

        {/* Top Summary Cards */}
        <section className="stats-cards">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Total Roles</h3>
            <p>{stats.totalRoles}</p>
          </div>
        </section>

        {/* Pie + Custom Legend side by side */}
        <section className="chart-section">
          <div className="chart-flex">
            <div className="pie-chart-container">
              <Pie
                data={pieData}
                options={{
                  plugins: {
                    legend: {
                      display: false, // Remove default Chart.js legend
                    },
                  },
                }}
              />
            </div>
            <div className="chart-details">
              {stats.roleStats.map((r, index) => (
                <div key={r.role} className="chart-legend-item">
                  <span
                    className="legend-dot"
                    style={{ backgroundColor: pieData.datasets[0].backgroundColor[index] }}
                  ></span>
                  {r.role}: <b>{r.count}</b>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Role Cards Section */}
        <section className="role-cards">
          {stats.roleStats.map((r) => {
            const style = roleStyles[r.role] || {};
            return (
              <div className="role-card" key={r.role}>
                {/* Header with gradient + icon */}
                <div className="role-card-header" style={{ background: style.gradient }}>
                  <span className="role-icon">{style.icon}</span>
                  <h3>{r.role}</h3>
                </div>
                <div className="role-card-body">
                  <p>
                    <b>{r.count}</b> User{r.count !== 1 && "s"}
                  </p>
                  <div className="emails">
                    {r.emails.length > 0 ? (
                      r.emails.slice(0, 3).map((email, idx) => <p key={idx}>{email}</p>)
                    ) : (
                      <p>No users assigned yet</p>
                    )}
                    {r.emails.length > 3 && <p>+ {r.emails.length - 3} more</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
};

export default UsersPage;