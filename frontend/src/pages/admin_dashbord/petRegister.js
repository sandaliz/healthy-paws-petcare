// src/pages/admin_dashbord/PetRegisterPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ for logout redirect
import "../../styles/petRegister.css";

const PetRegisterPage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅

  const handleLogout = () => {
    localStorage.removeItem("user"); // clear session
    navigate("/login");              // send back to login page
  };

  const fetchPets = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/register");
      setPets(res.data.data);
    } catch (err) {
      console.error("❌ Error fetching pets:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pet? 🐾")) return;
    try {
      await axios.delete(`http://localhost:5000/api/register/${id}`);
      setPets(pets.filter((p) => p._id !== id));
    } catch (err) {
      console.error("❌ Error deleting:", err.message);
      alert("Failed to delete pet.");
    }
  };

  if (loading) return <p className="loading">⏳ Loading pets...</p>;

  return (
    <div className="dashboard-container">
      {/* Sidebar same across Admin pages + ✅ Logout */}
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
            <a href="/admin-dashboard/pet-registration">🐕 Pet Registration</a>
          </li>
          <li>
            <a href="/admin-dashboard/users">👥 Users</a>
          </li>
        </ul>
        {/* ✅ Logout Button */}
        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Styled topic like UsersPage */}
        <div className="section-header">
          <h2>🐕 Pet Registrations</h2>
          <p className="subtitle">Manage and review all registered pets with their owners</p>
        </div>

        {pets.length === 0 ? (
          <p>No pets found.</p>
        ) : (
          <table className="pet-table">
            <thead>
              <tr>
                <th>Pet Name</th>
                <th>Species</th>
                <th>Breed</th>
                <th>Age</th>
                <th>Weight</th>
                <th>Blood Group</th>
                <th>Owner Name</th>
                <th>Owner Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((pet) => (
                <tr key={pet._id}>
                  <td>{pet.PetName}</td>
                  <td>{pet.PetSpecies}</td>
                  <td>{pet.PetBreed}</td>
                  <td>{pet.PetAge}</td>
                  <td>{pet.PetWeight} kg</td>
                  <td>{pet.BloodGroup}</td>
                  <td>{pet.OwnerName}</td>
                  <td>{pet.OwnerEmail}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(pet._id)}
                      title="Delete Pet"
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
};

export default PetRegisterPage;