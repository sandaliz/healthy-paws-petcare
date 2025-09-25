import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/Pet_RegisterEdit.css";

const RegisterEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE = "http://localhost:5000";

  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/register/${id}`)
      .then((res) => {
        if (res.data.success) setForm(res.data.data);
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let tempErrors = {};
    
    // Owner validation
    if (!form.OwnerName?.trim()) tempErrors.OwnerName = "Owner name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.OwnerEmail))
      tempErrors.OwnerEmail = "Valid email is required";
    if (!/^\d{10}$/.test(form.OwnerPhone))
      tempErrors.OwnerPhone = "Enter a valid 10-digit phone number";
    if (!/^\d{10}$/.test(form.EmergencyContact))
      tempErrors.EmergencyContact = "Enter a valid 10-digit emergency contact";
    if (!form.OwnerAddress?.trim())
      tempErrors.OwnerAddress = "Address is required";

    // Pet validation
    if (!form.PetName?.trim()) tempErrors.PetName = "Pet name is required";
    if (!form.PetBreed?.trim()) tempErrors.PetBreed = "Breed is required";
    if (!form.PetAge || form.PetAge <= 0)
      tempErrors.PetAge = "Please enter a valid pet age";
    if (!form.PetWeight || form.PetWeight <= 0)
      tempErrors.PetWeight = "Please enter a valid pet weight";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fill all the details correctly!");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const payload = {
        ...form,
        PetAge: form.PetAge ? Number(form.PetAge) : 0,
        PetWeight: form.PetWeight ? Number(form.PetWeight) : 0,
        userId: user?._id,
      };

      await axios.put(`${API_BASE}/api/register/${id}`, payload);
      toast.success("Registration updated successfully!");
      
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      console.error(err?.response?.data || err);
      toast.error("Update failed, please check inputs");
    }
  };

  if (!form) {
    return (
      <main className="registration-edit-page">
        <img
          src={require("../../assets/registration_bg.png")}
          alt="background"
          className="registration-edit-bg"
        />
        <div className="registration-edit-overlay">
          <div className="registration-loading">
            <p>Loading registration data...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="registration-edit-page">
      <ToastContainer />
      
      <img
        src={require("../../assets/registration_bg.png")}
        alt="background"
        className="registration-edit-bg"
      />

      <div className="registration-edit-overlay">
        <div className="registration-edit-header">
          <h2>Edit Registration</h2>
          <p>
            Update the registration information for your pet below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="registration-edit-form">
          <div className="registration-edit-section">
            <div className="registration-section-title">Owner Information</div>

            <div className="registration-form-group">
              <label className="registration-form-label" htmlFor="OwnerName">
                Owner Name<span className="registration-required-field">*</span>
              </label>
              <input
                id="OwnerName"
                className={`registration-form-input ${errors.OwnerName ? "registration-input-error" : ""}`}
                name="OwnerName"
                placeholder="Enter full name"
                value={form.OwnerName || ""}
                onChange={handleChange}
              />
              {errors.OwnerName && (
                <p className="registration-error-text">{errors.OwnerName}</p>
              )}
            </div>

            <div className="registration-form-group">
              <label className="registration-form-label" htmlFor="OwnerEmail">
                Email<span className="registration-required-field">*</span>
              </label>
              <input
                id="OwnerEmail"
                className={`registration-form-input ${errors.OwnerEmail ? "registration-input-error" : ""}`}
                type="email"
                name="OwnerEmail"
                placeholder="name@example.com"
                value={form.OwnerEmail || ""}
                onChange={handleChange}
              />
              {errors.OwnerEmail && (
                <p className="registration-error-text">{errors.OwnerEmail}</p>
              )}
            </div>

            <div className="registration-form-group">
              <label className="registration-form-label" htmlFor="OwnerPhone">
                Phone<span className="registration-required-field">*</span>
              </label>
              <input
                id="OwnerPhone"
                className={`registration-form-input ${errors.OwnerPhone ? "registration-input-error" : ""}`}
                name="OwnerPhone"
                placeholder="07XXXXXXXX"
                value={form.OwnerPhone || ""}
                onChange={handleChange}
              />
              {errors.OwnerPhone && (
                <p className="registration-error-text">{errors.OwnerPhone}</p>
              )}
            </div>

            <div className="registration-form-group">
              <label className="registration-form-label" htmlFor="EmergencyContact">
                Emergency Contact<span className="registration-required-field">*</span>
              </label>
              <input
                id="EmergencyContact"
                className={`registration-form-input ${errors.EmergencyContact ? "registration-input-error" : ""}`}
                name="EmergencyContact"
                placeholder="Emergency contact number"
                value={form.EmergencyContact || ""}
                onChange={handleChange}
              />
              {errors.EmergencyContact && (
                <p className="registration-error-text">{errors.EmergencyContact}</p>
              )}
            </div>

            <div className="registration-form-group">
              <label className="registration-form-label" htmlFor="OwnerAddress">
                Address<span className="registration-required-field">*</span>
              </label>
              <input
                id="OwnerAddress"
                className={`registration-form-input ${errors.OwnerAddress ? "registration-input-error" : ""}`}
                name="OwnerAddress"
                placeholder="Street, City"
                value={form.OwnerAddress || ""}
                onChange={handleChange}
              />
              {errors.OwnerAddress && (
                <p className="registration-error-text">{errors.OwnerAddress}</p>
              )}
            </div>
          </div>

          <div className="registration-edit-section">
            <div className="registration-section-title">Pet Information</div>

            <div className="registration-form-group">
              <label className="registration-form-label" htmlFor="PetName">
                Pet Name<span className="registration-required-field">*</span>
              </label>
              <input
                id="PetName"
                className={`registration-form-input ${errors.PetName ? "registration-input-error" : ""}`}
                name="PetName"
                placeholder="Enter your pet's name"
                value={form.PetName || ""}
                onChange={handleChange}
              />
              {errors.PetName && (
                <p className="registration-error-text">{errors.PetName}</p>
              )}
            </div>

            <div className="registration-form-group">
              <label className="registration-form-label" htmlFor="PetSpecies">
                Species
              </label>
              <select
                id="PetSpecies"
                className="registration-form-input registration-form-select"
                name="PetSpecies"
                value={form.PetSpecies || "dog"}
                onChange={handleChange}
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
            </div>

            <div className="registration-form-group">
              <label className="registration-form-label" htmlFor="PetBreed">
                Breed<span className="registration-required-field">*</span>
              </label>
              <input
                id="PetBreed"
                className={`registration-form-input ${errors.PetBreed ? "registration-input-error" : ""}`}
                name="PetBreed"
                placeholder="Breed"
                value={form.PetBreed || ""}
                onChange={handleChange}
              />
              {errors.PetBreed && (
                <p className="registration-error-text">{errors.PetBreed}</p>
              )}
            </div>

            <div className="registration-form-group">
              <label className="registration-form-label" htmlFor="PetAge">
                Age (years)<span className="registration-required-field">*</span>
              </label>
              <input
                id="PetAge"
                className={`registration-form-input ${errors.PetAge ? "registration-input-error" : ""}`}
                type="number"
                min="0"
                name="PetAge"
                value={form.PetAge || ""}
                onChange={handleChange}
              />
              {errors.PetAge && <p className="registration-error-text">{errors.PetAge}</p>}
            </div>

            <div className="registration-form-group">
              <label className="registration-form-label" htmlFor="PetWeight">
                Weight (kg)<span className="registration-required-field">*</span>
              </label>
              <input
                id="PetWeight"
                className={`registration-form-input ${errors.PetWeight ? "registration-input-error" : ""}`}
                type="number"
                step="0.1"
                min="0"
                name="PetWeight"
                value={form.PetWeight || ""}
                onChange={handleChange}
              />
              {errors.PetWeight && (
                <p className="registration-error-text">{errors.PetWeight}</p>
              )}
            </div>

            <div className="registration-form-group">
              <label className="registration-form-label" htmlFor="BloodGroup">
                Blood Group
              </label>
              <select
                id="BloodGroup"
                className="registration-form-input registration-form-select"
                name="BloodGroup"
                value={form.BloodGroup || "O+"}
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

            <div className="registration-form-group">
              <label className="registration-form-label" htmlFor="PetGender">
                Gender
              </label>
              <select
                id="PetGender"
                className="registration-form-input registration-form-select"
                name="PetGender"
                value={form.PetGender || "Male"}
                onChange={handleChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="registration-form-group">
              <label className="registration-form-label" htmlFor="SpecialNotes">
                Special Notes
              </label>
              <textarea
                id="SpecialNotes"
                className="registration-form-input registration-form-textarea"
                name="SpecialNotes"
                placeholder="Any medical conditions, allergies..."
                value={form.SpecialNotes || ""}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </div>

          <div className="registration-edit-actions">
            <button 
              type="button" 
              className="registration-cancel-btn"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button type="submit" className="registration-submit-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default RegisterEdit;