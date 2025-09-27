import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/petownerregister.css"; 


const RegisterPet = () => {
  const navigate = useNavigate();
  const API_BASE = "http://localhost:5000";

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

  const handleChange = (e) =>
    setPetData({ ...petData, [e.target.name]: e.target.value });

  const validate = () => {
    let tempErrors = {};
    if (!petData.PetName.trim()) tempErrors.PetName = "Pet name is required";
    if (!petData.PetBreed.trim()) tempErrors.PetBreed = "Breed is required";
    if (!petData.PetAge || petData.PetAge <= 0)
      tempErrors.PetAge = "Please enter a valid pet age";
    if (!petData.PetWeight || petData.PetWeight <= 0)
      tempErrors.PetWeight = "Please enter a valid pet weight";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ownerData = JSON.parse(sessionStorage.getItem("ownerData")) || {};

    if (!validate()) {
      toast.error("⚠️ Please fill all the details correctly!");
      return;
    }

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
      PetAge: Number(petData.PetAge),
      PetWeight: Number(petData.PetWeight),
      BloodGroup: petData.BloodGroup,
      PetGender: petData.PetGender,
      SpecialNotes: petData.SpecialNotes,
      userId: user?._id,
    };

    try {
      const res = await axios.post(`${API_BASE}/api/register`, payload);
      if (res.data.success) {
        toast.success("Pet registered successfully!");
        const newId = res.data?.data?._id;
        setTimeout(() => {
          sessionStorage.removeItem("ownerData");
          navigate(newId ? `/register/view/${newId}` : "/register/list");
        }, 800);
      }
    } catch (err) {
      toast.error("❌ Failed to register. Please check again.");
    }
  };

  return (
    <main className="register-page">
      <ToastContainer />

      {/* ✅ background image */}
      <img
        src={require("../../assets/registration_bg.png")}
        alt="background"
        className="register-bg-image"
      />

      {/* ✅ overlay card */}
      <div className="register-form-overlay">
        <div className="glass-header">
          <h2>Pet Information</h2>
          <p>
            Tell us a little about your furry friend. This helps us give the
            best possible care during treatment.
          </p>
        </div>

        <div className="registration-progress">
          <div className="progress-step completed"></div>
          <div className="progress-step active"></div>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-section">
            <div className="form-section-title">Pet Details</div>

            <div className="form-group">
              <label className="form-label" htmlFor="PetName">
                Pet Name<span className="required-field" />
              </label>
              <input
                id="PetName"
                className={`form-input ${errors.PetName ? "error" : ""}`}
                name="PetName"
                placeholder="Enter your pet's name"
                value={petData.PetName}
                onChange={handleChange}
              />
              {errors.PetName && (
                <p className="error-text">{errors.PetName}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="PetSpecies">
                Species
              </label>
              <select
                id="PetSpecies"
                className="form-input form-select"
                name="PetSpecies"
                value={petData.PetSpecies}
                onChange={handleChange}
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="PetBreed">
                Breed<span className="required-field" />
              </label>
              <input
                id="PetBreed"
                className={`form-input ${errors.PetBreed ? "error" : ""}`}
                name="PetBreed"
                placeholder="Breed"
                value={petData.PetBreed}
                onChange={handleChange}
              />
              {errors.PetBreed && (
                <p className="error-text">{errors.PetBreed}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="PetAge">
                Age (years)<span className="required-field" />
              </label>
              <input
                id="PetAge"
                className={`form-input ${errors.PetAge ? "error" : ""}`}
                type="number"
                min="0"
                name="PetAge"
                value={petData.PetAge}
                onChange={handleChange}
              />
              {errors.PetAge && <p className="error-text">{errors.PetAge}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="PetWeight">
                Weight (kg)<span className="required-field" />
              </label>
              <input
                id="PetWeight"
                className={`form-input ${errors.PetWeight ? "error" : ""}`}
                type="number"
                step="0.1"
                min="0"
                name="PetWeight"
                value={petData.PetWeight}
                onChange={handleChange}
              />
              {errors.PetWeight && (
                <p className="error-text">{errors.PetWeight}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="BloodGroup">
                Blood Group
              </label>
              <select
                id="BloodGroup"
                className="form-input form-select"
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
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="PetGender">
                Gender
              </label>
              <select
                id="PetGender"
                className="form-input form-select"
                name="PetGender"
                value={petData.PetGender}
                onChange={handleChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="SpecialNotes">
                Special Notes
              </label>
              <textarea
                id="SpecialNotes"
                className="form-input form-textarea"
                name="SpecialNotes"
                placeholder="Any medical conditions, allergies..."
                value={petData.SpecialNotes}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="register-btn">
              Submit Registration →
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default RegisterPet;
