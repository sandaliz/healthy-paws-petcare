// src/pages/admin_dashbord/PetRegisterPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/adminPetRegister.css";
import AdminSidebar from "./AdminSidebar";

const PetRegisterPage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch pets
  const fetchPets = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/register");
      setPets(res.data.data);
    } catch (err) {
      console.error("Error fetching pets:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  // Delete pet
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pet?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/register/${id}`);
      setPets(pets.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Error deleting:", err.message);
      alert("Failed to delete pet.");
    }
  };

  // Filter pets based on search term
  const filteredPets = pets.filter(pet =>
    pet.PetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.OwnerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.OwnerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.PetSpecies?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p className="apr-loading">Loading pets...</p>;

  return (
    <div className="apr-container">
      <AdminSidebar />

      <main className="apr-main-content">
        <div className="apr-content-area">
          <div className="apr-header">
            <div className="apr-header-content">
              <h2>Pet Registrations</h2>
              <p className="apr-subtitle">Manage and review all registered pets with their owners</p>
            </div>
            <div className="apr-stats">
              <div className="apr-stat-card">
                <span className="apr-stat-number">{pets.length}</span>
                <span className="apr-stat-label">Total Pets</span>
              </div>
            </div>
          </div>

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
              <div className="apr-empty-icon">🐾</div>
              <h3>No pets found</h3>
              <p>{searchTerm ? "Try adjusting your search terms" : "No pets have been registered yet"}</p>
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
                      <td>
                        <div className="apr-pet-info">
                          <span className="apr-pet-name">{pet.PetName}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`apr-species-badge apr-species-${pet.PetSpecies?.toLowerCase()}`}>
                          {pet.PetSpecies}
                        </span>
                      </td>
                      <td>{pet.PetAge} years</td>
                      <td>
                        <span className="apr-blood-group">{pet.BloodGroup}</span>
                      </td>
                      <td>{pet.OwnerName}</td>
                      <td>
                        <a href={`mailto:${pet.OwnerEmail}`} className="apr-email-link">
                          {pet.OwnerEmail}
                        </a>
                      </td>
                      <td>
                        <button
                          className="apr-delete-btn"
                          onClick={() => handleDelete(pet._id)}
                          title="Delete Pet"
                        >
                          <span className="apr-delete-icon">×</span>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PetRegisterPage;