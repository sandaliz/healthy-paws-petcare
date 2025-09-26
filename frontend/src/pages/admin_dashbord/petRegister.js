// src/pages/admin_dashbord/PetRegisterPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/adminPetRegister.css"; // 🔥 dedicated admin pet register styles
import AdminSidebar from "./AdminSidebar"; // reuse sidebar for consistency

const PetRegisterPage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pets
  const fetchPets = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/register");
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

  // Delete pet
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pet? 🐾")) return;
    try {
      await axios.delete(`http://localhost:5001/api/register/${id}`);
      setPets(pets.filter((p) => p._id !== id));
    } catch (err) {
      console.error("❌ Error deleting:", err.message);
      alert("Failed to delete pet.");
    }
  };

  if (loading) return <p className="apr-loading">⏳ Loading pets...</p>;

  return (
    <div className="apr-container">
      <AdminSidebar /> {/* ✅ shared sidebar */}

      <main className="apr-content">
        <div className="apr-header">
          <h2>🐕 Pet Registrations</h2>
          <p className="apr-subtitle">Manage and review all registered pets with their owners</p>
        </div>

        {pets.length === 0 ? (
          <p>No pets found.</p>
        ) : (
          <table className="apr-table">
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
                      className="apr-delete-btn"
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