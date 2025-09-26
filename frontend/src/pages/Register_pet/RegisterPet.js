// src/pages/Register_pet/RegisterPet.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/validation.css";
import "../../styles/theme.css";

// ✅ Background image (no longer unused!)
const bgUrl =
  "https://images.unsplash.com/photo-1558944351-208ebd80c955?q=80&w=1600&auto=format&fit=crop";

const RegisterPet = () => {
  const navigate = useNavigate();
  const API_BASE = "http://localhost:5001";

  const [petData, setPetData] = useState({
    PetName: "",
    PetSpecies: "dog",
    PetBreed: "",
    PetAge: "",
    PetWeight: "",
    BloodGroup: "O+",
    PetGender: "Male",
    SpecialNotes: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPetData({ ...petData, [name]: value });
  };

  const validate = () => {
    let tempErrors = {};
    if (!petData.PetName.trim()) tempErrors.PetName = "Pet name is required";
    if (!petData.PetBreed.trim()) tempErrors.PetBreed = "Breed is required";
    if (!petData.PetAge || petData.PetAge <= 0)
      tempErrors.PetAge = "Please enter a valid Pet age";
    if (!petData.PetWeight || petData.PetWeight <= 0)
      tempErrors.PetWeight = "Please enter a valid Pet weight";
    if (!petData.BloodGroup)
      tempErrors.BloodGroup = "Please select a blood group";
    if (!petData.PetGender) tempErrors.PetGender = "Please select gender";

    setErrors(tempErrors);

    if (Object.keys(tempErrors).length > 0) {
      toast.error("⚠️ Please fill all the details correctly!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ownerData = JSON.parse(sessionStorage.getItem("ownerData")) || {};
    if (!validate()) return;

    const user = JSON.parse(localStorage.getItem("user"));
    const payload = {
      OwnerName: ownerData.OwnerName,
      OwnerEmail: ownerData.OwnerEmail,
      OwnerPhone: ownerData.OwnerPhone,
      EmergencyContact: ownerData.EmergencyContact,
      OwnerAddress: ownerData.OwnerAddress,
      PetName: petData.PetName,
      PetSpecies: petData.PetSpecies,
      PetBreed: petData.PetBreed,
      PetAge: petData.PetAge ? Number(petData.PetAge) : 0,
      PetWeight: petData.PetWeight ? Number(petData.PetWeight) : 0,
      BloodGroup: petData.BloodGroup,
      PetGender: petData.PetGender,
      SpecialNotes: petData.SpecialNotes || "",
      userId: user?._id,
    };

    try {
      const res = await axios.post(`${API_BASE}/api/register`, payload);
      if (res.data.success) {
        toast.success("Pet registered successfully!");
        const newId = res.data?.data?._id;
        setTimeout(() => {
          if (newId) navigate(`/register/view/${newId}`);
          else navigate("/register/list");
        }, 800);
        sessionStorage.removeItem("ownerData");
      }
    } catch (err) {
      console.error("Error submitting:", err.response?.data || err);
      toast.error("❌ Failed to register. Please check again.");
    }
  };

  return (
    <main className="rp-page">
      <ToastContainer />
      <div className="rp-container">
        <header className="rp-header">
          <h2>Pet Information</h2>
        </header>

        {/* ✅ Glass-morphism card with background image applied */}
        <div
          className="rp-glass-wrap"
          style={{
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: "overlay",
          }}
        >
          <form onSubmit={handleSubmit} noValidate className="rp-form-grid">
            <div className="rp-section-title">Pet Details</div>

            <div>
              <label className="rp-label" htmlFor="PetName">Pet Name</label>
              <input
                id="PetName"
                className="rp-input"
                name="PetName"
                placeholder="Enter pet name"
                value={petData.PetName}
                onChange={handleChange}
              />
              {errors.PetName && <p className="rp-error-text">{errors.PetName}</p>}
            </div>

            <div>
              <label className="rp-label" htmlFor="PetSpecies">Species</label>
              <select
                id="PetSpecies"
                className="rp-select"
                name="PetSpecies"
                value={petData.PetSpecies}
                onChange={handleChange}
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
            </div>

            <div>
              <label className="rp-label" htmlFor="PetBreed">Breed</label>
              <input
                id="PetBreed"
                className="rp-input"
                name="PetBreed"
                placeholder="Breed"
                value={petData.PetBreed}
                onChange={handleChange}
              />
              {errors.PetBreed && <p className="rp-error-text">{errors.PetBreed}</p>}
            </div>

            <div>
              <label className="rp-label" htmlFor="PetAge">Age (years)</label>
              <input
                id="PetAge"
                className="rp-input"
                type="number"
                min="0"
                name="PetAge"
                placeholder="0"
                value={petData.PetAge}
                onChange={handleChange}
              />
              {errors.PetAge && <p className="rp-error-text">{errors.PetAge}</p>}
            </div>

            <div>
              <label className="rp-label" htmlFor="PetWeight">Weight (kg)</label>
              <input
                id="PetWeight"
                className="rp-input"
                type="number"
                step="0.1"
                min="0"
                name="PetWeight"
                placeholder="0.0"
                value={petData.PetWeight}
                onChange={handleChange}
              />
              {errors.PetWeight && <p className="rp-error-text">{errors.PetWeight}</p>}
            </div>

            <div>
              <label className="rp-label" htmlFor="BloodGroup">Blood Group</label>
              <select
                id="BloodGroup"
                className="rp-select"
                name="BloodGroup"
                value={petData.BloodGroup}
                onChange={handleChange}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              {errors.BloodGroup && <p className="rp-error-text">{errors.BloodGroup}</p>}
            </div>

            <div>
              <label className="rp-label" htmlFor="PetGender">Gender</label>
              <select
                id="PetGender"
                className="rp-select"
                name="PetGender"
                value={petData.PetGender}
                onChange={handleChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.PetGender && <p className="rp-error-text">{errors.PetGender}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="rp-label" htmlFor="SpecialNotes">Special Notes</label>
              <textarea
                id="SpecialNotes"
                className="rp-textarea"
                name="SpecialNotes"
                placeholder="Any medical conditions, allergies..."
                value={petData.SpecialNotes}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="md:col-span-2" style={{ marginTop: 8 }}>
              <button type="submit" className="rp-btn-primary">
                Submit Registration →
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default RegisterPet;