// src/pages/RegisterOwner.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/theme.css";
import "../../styles/validation.css";

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

  // ✅ pre-fill email if user is logged in
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
    <main className="owner-page">
      <div className="owner-container">
        <header className="owner-header">
          <h2>Owner Information</h2>
        </header>

        <div className="glass-wrap">
          <div className="glass-card">
            <form onSubmit={handleNext} noValidate className="form-grid">
              <div className="section-title">Contact Details</div>

              <div>
                <label className="label" htmlFor="OwnerName">Owner Name</label>
                <input
                  id="OwnerName"
                  className={`input ${errors.OwnerName ? "error" : ""}`}
                  name="OwnerName"
                  placeholder="Enter full name"
                  value={ownerData.OwnerName}
                  onChange={handleChange}
                />
                {errors.OwnerName && <p className="error-text">{errors.OwnerName}</p>}
              </div>

              <div>
                <label className="label" htmlFor="OwnerEmail">Email</label>
                <input
                  id="OwnerEmail"
                  className={`input ${errors.OwnerEmail ? "error" : ""}`}
                  type="text"
                  name="OwnerEmail"
                  placeholder="name@example.com"
                  value={ownerData.OwnerEmail}
                  onChange={handleChange}
                />
                {errors.OwnerEmail && <p className="error-text">{errors.OwnerEmail}</p>}
              </div>

              <div>
                <label className="label" htmlFor="OwnerPhone">Phone</label>
                <input
                  id="OwnerPhone"
                  className={`input ${errors.OwnerPhone ? "error" : ""}`}
                  name="OwnerPhone"
                  placeholder="07XXXXXXXX"
                  value={ownerData.OwnerPhone}
                  onChange={handleChange}
                />
                {errors.OwnerPhone && <p className="error-text">{errors.OwnerPhone}</p>}
              </div>

              <div>
                <label className="label" htmlFor="EmergencyContact">Emergency Contact</label>
                <input
                  id="EmergencyContact"
                  className={`input ${errors.EmergencyContact ? "error" : ""}`}
                  name="EmergencyContact"
                  placeholder="Emergency contact number"
                  value={ownerData.EmergencyContact}
                  onChange={handleChange}
                />
                {errors.EmergencyContact && (
                  <p className="error-text">{errors.EmergencyContact}</p>
                )}
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label className="label" htmlFor="OwnerAddress">Address</label>
                <input
                  id="OwnerAddress"
                  className={`input ${errors.OwnerAddress ? "error" : ""}`}
                  name="OwnerAddress"
                  placeholder="Street, City"
                  value={ownerData.OwnerAddress}
                  onChange={handleChange}
                />
                {errors.OwnerAddress && <p className="error-text">{errors.OwnerAddress}</p>}
              </div>

              <div className="actions">
                <button type="submit" className="btn-primary">
                  Next: Pet Info →
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RegisterOwner;