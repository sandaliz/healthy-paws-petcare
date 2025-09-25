import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import AdminSidebar from "../../pages/admin_dashbord/AdminSidebar";
import "../../styles/adminUsersPage.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const roleConfig = {
  ADMIN: {
    name: "Admin",
    gradient: "linear-gradient(135deg, #54413C 0%, #7A635C 100%)",
  },
  PET_CARE_TAKER: {
    name: "Pet Care Taker",
    gradient: "linear-gradient(135deg, #FFD58E 0%, #E6C07D 100%)",
  },
  RECEPTIONIST: {
    name: "Receptionist",
    gradient: "linear-gradient(135deg, #54413C 0%, #8A736A 100%)",
  },
  INVENTORY_MANAGER: {
    name: "Inventory Manager",
    gradient: "linear-gradient(135deg, #FFD58E 0%, #E6C07D 100%)",
  },
  FINANCE_MANAGER: {
    name: "Finance Manager",
    gradient: "linear-gradient(135deg, #54413C 0%, #6D5954 100%)",
  },
};

const UsersPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

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
        setErrorMsg("Failed to load role data. Please try again.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="aup-loading-container"><div className="aup-loading">Loading role statistics...</div></div>;
  if (errorMsg) return <div className="aup-error-container"><div className="aup-error">{errorMsg}</div></div>;
  if (!stats) return <div className="aup-error-container"><div className="aup-error">No data available</div></div>;

  const pieData = {
    labels: stats.roleStats.map((r) => roleConfig[r.role]?.name || r.role),
    datasets: [
      {
        data: stats.roleStats.map((r) => r.count),
        backgroundColor: ["#54413C", "#FFD58E", "#7A635C", "#E6C07D", "#6D5954"],
        borderWidth: 0,
        hoverBorderWidth: 0,
      },
    ],
  };

  return (

  <div className="aup-container aup-container-fixed">
    <AdminSidebar />
    <main className="aup-content">
       {/* Header Container */}
        <div className="aup-header-container">
          <div className="aup-header">
            <h1>Staff Overview</h1>
            <p className="aup-subtitle">
              A quick look at your management team roles and activity
            </p>
          </div>
        </div>

        {/* Stats Container */}
        <div className="aup-stats-container">
          <div className="aup-stats-grid">
            <div className="aup-stat-item">
              <div className="aup-stat-content">
                <h3>TOTAL USERS</h3>
                <div className="aup-stat-number">{stats.totalUsers}</div>
              </div>
            </div>
            <div className="aup-stat-item">
              <div className="aup-stat-content">
                <h3>TOTAL ROLES</h3>
                <div className="aup-stat-number">{stats.totalRoles}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="aup-main-container">
          {/* Chart Container */}
          <div className="aup-chart-container">
            <div className="aup-section-header">
              <h2>Role Distribution</h2>
              <p>Visual breakdown of staff roles</p>
            </div>
            <div className="aup-pie-wrapper">
              <Pie
                data={pieData}
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                          family: 'Poppins',
                          size: 12
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: '#54413C',
                      titleFont: { family: 'Poppins' },
                      bodyFont: { family: 'Roboto' },
                      padding: 12,
                      cornerRadius: 8
                    }
                  },
                  cutout: '60%',
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>

          {/* Roles Container */}
          <div className="aup-roles-container">
            <div className="aup-section-header">
              <h2>Team Roles</h2>
              <p>Detailed breakdown of each role and assigned staff</p>
            </div>
            <div className="aup-roles-grid">
              {stats.roleStats.map((r) => (
                <div key={r.role} className="aup-role-item">
                  <div 
                    className="aup-role-header"
                    style={{ background: roleConfig[r.role]?.gradient }}
                  >
                    <h3>{roleConfig[r.role]?.name || r.role.replace('_', ' ')}</h3>
                    <div className="aup-role-count">{r.count}</div>
                  </div>
                  <div className="aup-role-body">
                    <div className="aup-staff-section">
                      <h4>ASSIGNED STAFF</h4>
                      <div className="aup-staff-list">
                        {r.emails.length > 0 ? (
                          <>
                            {r.emails.slice(0, 4).map((email, idx) => (
                              <div key={idx} className="aup-staff-member">
                                <span className="aup-staff-email">{email}</span>
                              </div>
                            ))}
                            {r.emails.length > 4 && (
                              <div className="aup-staff-more">
                                + {r.emails.length - 4} more staff members
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="aup-no-staff">No users assigned to this role</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UsersPage;