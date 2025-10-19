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
      .get("http://localhost:5001/api/dashboard/admin-dashboard-stats", {
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
        borderWidth: 2,
        borderColor: "#FFFFFF",
        hoverBorderWidth: 3,
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
            <div className="aup-header-content">
              <h1>Staff Overview</h1>
              <p className="aup-subtitle">
                A comprehensive view of your management team roles and distribution
              </p>
            </div>
            <div className="aup-header-stats">
              <div className="aup-header-stat">
                <span className="aup-header-stat-label">Total Users</span>
                <span className="aup-header-stat-value">{stats.totalUsers}</span>
              </div>
              <div className="aup-header-stat">
                <span className="aup-header-stat-label">Total Roles</span>
                <span className="aup-header-stat-value">{stats.totalRoles}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="aup-main-grid">
          {/* Chart Section */}
          <div className="aup-chart-section">
            <div className="aup-card">
              <div className="aup-card-header">
                <h2>Role Distribution</h2>
                <p>Visual breakdown of staff roles across the organization</p>
              </div>
              <div className="aup-pie-container">
                <Pie
                  data={pieData}
                  options={{
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                          pointStyle: 'circle',
                          font: {
                            family: 'Poppins',
                            size: 12,
                            weight: '600'
                          }
                        }
                      },
                      tooltip: {
                        backgroundColor: '#54413C',
                        titleFont: { family: 'Poppins', size: 13 },
                        bodyFont: { family: 'Roboto', size: 12 },
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: true
                      }
                    },
                    cutout: '55%',
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Roles Grid Section */}
          <div className="aup-roles-section">
            <div className="aup-card">
              <div className="aup-card-header">
                <h2>Team Roles & Assignments</h2>
                <p>Detailed breakdown of each role and assigned personnel</p>
              </div>
              <div className="aup-roles-grid">
                {stats.roleStats.map((r) => (
                  <div key={r.role} className="aup-role-card">
                    <div 
                      className="aup-role-card-header"
                      style={{ background: roleConfig[r.role]?.gradient }}
                    >
                      <div className="aup-role-title">
                        <h3>{roleConfig[r.role]?.name || r.role.replace('_', ' ')}</h3>
                        <span className="aup-role-count">{r.count} users</span>
                      </div>
                    </div>
                    <div className="aup-role-card-body">
                      <div className="aup-staff-section">
                        <h4>ASSIGNED STAFF</h4>
                        <div className="aup-staff-list">
                          {r.emails.length > 0 ? (
                            <>
                              {r.emails.slice(0, 3).map((email, idx) => (
                                <div key={idx} className="aup-staff-item">
                                  <div className="aup-staff-avatar">
                                    {email.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="aup-staff-email">{email}</span>
                                </div>
                              ))}
                              {r.emails.length > 3 && (
                                <div className="aup-staff-more">
                                  + {r.emails.length - 3} more users
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="aup-no-staff">
                              <span>No users assigned to this role</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UsersPage;