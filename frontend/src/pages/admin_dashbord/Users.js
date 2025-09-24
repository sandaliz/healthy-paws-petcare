import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import AdminSidebar from "../../pages/admin_dashbord/AdminSidebar";
import "../../styles/adminUsersPage.css"; // ✅ new CSS file

ChartJS.register(ArcElement, Tooltip);

// 🔹 Role -> Icon + Gradient Mapping
const roleStyles = {
  ADMIN: {
    icon: "🛠",
    gradient: "linear-gradient(90deg, #2196F3, #21CBF3)",
  },
  PET_CARE_TAKER: {
    icon: "🐾",
    gradient: "linear-gradient(90deg, #2ECC71, #27AE60)",
  },
  RECEPTIONIST: {
    icon: "📋",
    gradient: "linear-gradient(90deg, #9C27B0, #E040FB)",
  },
  INVENTORY_MANAGER: {
    icon: "📦",
    gradient: "linear-gradient(90deg, #FF9800, #FF5722)",
  },
  FINANCE_MANAGER: {
    icon: "💰",
    gradient: "linear-gradient(90deg, #FFC107, #FFD54F)",
  },
};

const UsersPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch stats data
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/dashboard/admin-dashboard-stats", {
        withCredentials: true,
      })
      .then((res) => {
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

  if (loading) return <p className="aup-loading">⏳ Loading role statistics...</p>;
  if (errorMsg) return <p className="aup-error">❌ {errorMsg}</p>;
  if (!stats) return <p className="aup-error">⚠️ No data available</p>;

  // Pie chart data
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
    <div className="aup-container">
      {/* ✅ Sidebar stays the same */}
      <AdminSidebar />

      {/* ✅ Main Content */}
      <main className="aup-content">
        <div className="aup-header">
          <h1>👥 Staff Overview</h1>
          <p className="aup-subtitle">
            A quick look at your management team roles and activity
          </p>
        </div>

        {/* ✅ Summary Stats */}
        <section className="aup-stats">
          <div className="aup-stat-card">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
          <div className="aup-stat-card">
            <h3>Total Roles</h3>
            <p>{stats.totalRoles}</p>
          </div>
        </section>

        {/* ✅ Pie Chart + Custom Legend */}
        <section className="aup-chart-section">
          <div className="aup-pie">
            <Pie
              data={pieData}
              options={{ plugins: { legend: { display: false } } }}
            />
          </div>
          <div className="aup-legend">
            {stats.roleStats.map((r, index) => (
              <div key={r.role} className="aup-legend-item">
                <span
                  className="aup-legend-dot"
                  style={{
                    backgroundColor: pieData.datasets[0].backgroundColor[index],
                  }}
                ></span>
                {r.role}: <b>{r.count}</b>
              </div>
            ))}
          </div>
        </section>

        {/* ✅ Role Cards */}
        <section className="aup-role-cards">
          {stats.roleStats.map((r) => (
            <div className="aup-role-card" key={r.role}>
              <div
                className="aup-role-card-header"
                style={{ background: roleStyles[r.role]?.gradient }}
              >
                <span className="aup-role-icon">
                  {roleStyles[r.role]?.icon}
                </span>
                <h3>{r.role}</h3>
              </div>
              <div className="aup-role-card-body">
                <p>
                  <b>{r.count}</b> User{r.count !== 1 && "s"}
                </p>
                <div className="aup-role-emails">
                  {r.emails.length > 0 ? (
                    r.emails.slice(0, 3).map((email, idx) => (
                      <p key={idx}>{email}</p>
                    ))
                  ) : (
                    <p>No users assigned yet</p>
                  )}
                  {r.emails.length > 3 && (
                    <p>+ {r.emails.length - 3} more</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default UsersPage;