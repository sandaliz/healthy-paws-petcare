import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../../styles/adminPetRegister.css";
import AdminSidebar from "./AdminSidebar";

// Chart imports
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

const PetRegisterPage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState([]);
  const [viewType, setViewType] = useState("daily"); // daily | weekly | monthly

  const fetchPets = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/register");
      setPets(res.data.data);
    } catch (err) {
      console.error("Error fetching pets:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/register/stats/registrations?type=${viewType}`
      );
      if (res.data.success) setStats(res.data.data);
    } catch (err) {
      console.error("Error fetching stats:", err.message);
    }
  }, [viewType]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pet?")) return;
    try {
      await axios.delete(`http://localhost:5001/api/register/${id}`);
      setPets((prev) => prev.filter((p) => p._id !== id));
      fetchStats(); // update chart
    } catch (err) {
      alert("Failed to delete pet.");
    }
  };

  const filteredPets = pets.filter(
    (pet) =>
      pet.PetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.OwnerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.OwnerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.PetSpecies?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Chart Data
  const chartData = {
    labels: stats.map((s) => s._id),
    datasets: [
      {
        label: "Registrations",
        data: stats.map((s) => s.count),
        borderColor: "#54413C",
        backgroundColor: "rgba(255, 213, 142, 0.35)",
        pointBackgroundColor: "#FFD58E",
        pointBorderColor: "#54413C",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 14, family: "'Poppins', sans-serif" },
          color: "#3a2d29",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.raw} registrations`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  if (loading) return <p className="apr-loading">Loading pets...</p>;

  return (
    <div className="apr-container">
      <AdminSidebar />
      <main className="apr-main-content">
        <div className="apr-content-area">
          <div className="apr-header">
            <div className="apr-header-content">
              <h2>Pet Registrations</h2>
              <p className="apr-subtitle">
                Manage and review all registered pets with insights
              </p>
            </div>
            <div className="apr-stats">
              <div className="apr-stat-card">
                <span className="apr-stat-number">{pets.length}</span>
                <span className="apr-stat-label">Total Pets</span>
              </div>
            </div>
          </div>

          {/* TABLE FIRST */}
          <div className="apr-controls">
            <div className="apr-search-container">
              <input
                type="text"
                placeholder="Search pets, owners, or species..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="apr-search-input"
              />
              <span className="apr-search-icon">🔍</span>
            </div>
          </div>

          {filteredPets.length === 0 ? (
            <div className="apr-empty-state">
              <h3>No pets found</h3>
              <p>
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "No pets registered yet"}
              </p>
            </div>
          ) : (
            <div className="apr-table-container">
              <table className="apr-table">
                <thead>
                  <tr>
                    <th>Pet Name</th>
                    <th>Species</th>
                    <th>Age</th>
                    <th>Blood Group</th>
                    <th>Owner Name</th>
                    <th>Owner Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPets.map((pet) => (
                    <tr key={pet._id}>
                      <td>{pet.PetName}</td>
                      <td>{pet.PetSpecies}</td>
                      <td>{pet.PetAge} years</td>
                      <td>{pet.BloodGroup}</td>
                      <td>{pet.OwnerName}</td>
                      <td>
                        <a href={`mailto:${pet.OwnerEmail}`}>
                          {pet.OwnerEmail}
                        </a>
                      </td>
                      <td>
                        <button
                          className="apr-delete-btn"
                          onClick={() => handleDelete(pet._id)}
                        >
                          × Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/*CHART  */}
          <div className="apr-insights">
            <h3>📈 Registration Trends</h3>
            <div className="apr-dropdown">
              <label>View by: </label>
              <select
                value={viewType}
                onChange={(e) => setViewType(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {stats.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <p>No data available yet</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PetRegisterPage;