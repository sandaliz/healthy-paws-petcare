// src/pages/RegisterOwner.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/validation.css";
import "../../styles/theme.css";

const RegisterOwner = ({ user }) => {
  const navigate = useNavigate();

  const [ownerData, setOwnerData] = useState({
    OwnerName: "",
    OwnerEmail: user?.email || "",
    OwnerPhone: "",
    EmergencyContact: "",
    OwnerAddress: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user?.email) {
      setOwnerData((prev) => ({ ...prev, OwnerEmail: user.email }));
    }
  }, [user?.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOwnerData({ ...ownerData, [name]: value });
  };

  const validate = () => {
    let tempErrors = {};
    if (!ownerData.OwnerName.trim()) tempErrors.OwnerName = "Owner name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerData.OwnerEmail))
      tempErrors.OwnerEmail = "Valid email is required";
    if (!/^\d{10}$/.test(ownerData.OwnerPhone))
      tempErrors.OwnerPhone = "Enter a valid 10-digit phone number";
    if (!/^\d{10}$/.test(ownerData.EmergencyContact))
      tempErrors.EmergencyContact = "Enter a valid 10-digit emergency contact";
    if (!ownerData.OwnerAddress.trim())
      tempErrors.OwnerAddress = "Address is required";

    setErrors(tempErrors);

    if (Object.keys(tempErrors).length > 0) {
      toast.error("⚠️ Please fill all the details correctly!");
      return false;
    }
    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Save in session storage for next step
    sessionStorage.setItem("ownerData", JSON.stringify(ownerData));
    navigate("/register/pet");
  };

  return (
    <main className="ro-page">
      <div className="ro-container">
        <header className="ro-header">
          <h2>Owner Information</h2>
        </header>

        <div className="ro-glass-wrap">
          <form onSubmit={handleNext} noValidate className="ro-form-grid">
            <div className="ro-section-title">Contact Details</div>

            <div>
              <label className="ro-label" htmlFor="OwnerName">Owner Name</label>
              <input
                id="OwnerName"
                className={`ro-input ${errors.OwnerName ? "error" : ""}`}
                name="OwnerName"
                placeholder="Enter full name"
                value={ownerData.OwnerName}
                onChange={handleChange}
              />
              {errors.OwnerName && <p className="ro-error-text">{errors.OwnerName}</p>}
            </div>

            <div>
              <label className="ro-label" htmlFor="OwnerEmail">Email</label>
              <input
                id="OwnerEmail"
                className={`ro-input ${errors.OwnerEmail ? "error" : ""}`}
                type="text"
                name="OwnerEmail"
                placeholder="name@example.com"
                value={ownerData.OwnerEmail}
                onChange={handleChange}
              />
              {errors.OwnerEmail && <p className="ro-error-text">{errors.OwnerEmail}</p>}
            </div>

            <div>
              <label className="ro-label" htmlFor="OwnerPhone">Phone</label>
              <input
                id="OwnerPhone"
                className={`ro-input ${errors.OwnerPhone ? "error" : ""}`}
                name="OwnerPhone"
                placeholder="07XXXXXXXX"
                value={ownerData.OwnerPhone}
                onChange={handleChange}
              />
              {errors.OwnerPhone && <p className="ro-error-text">{errors.OwnerPhone}</p>}
            </div>

            <div>
              <label className="ro-label" htmlFor="EmergencyContact">Emergency Contact</label>
              <input
                id="EmergencyContact"
                className={`ro-input ${errors.EmergencyContact ? "error" : ""}`}
                name="EmergencyContact"
                placeholder="Emergency contact number"
                value={ownerData.EmergencyContact}
                onChange={handleChange}
              />
              {errors.EmergencyContact && <p className="ro-error-text">{errors.EmergencyContact}</p>}
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="ro-label" htmlFor="OwnerAddress">Address</label>
              <input
                id="OwnerAddress"
                className={`ro-input ${errors.OwnerAddress ? "error" : ""}`}
                name="OwnerAddress"
                placeholder="Street, City"
                value={ownerData.OwnerAddress}
                onChange={handleChange}
              />
              {errors.OwnerAddress && <p className="ro-error-text">{errors.OwnerAddress}</p>}
            </div>

            <div className="actions">
              <button type="submit" className="ro-btn-primary">
                Next: Pet Info →
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default RegisterOwner;