import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/petownerregister.css";

// ✅ Import background image via ES6
import bgImage from "../../assets/registration_bg.png";

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
    if (!ownerData.OwnerName.trim())
      tempErrors.OwnerName = "Owner name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerData.OwnerEmail))
      tempErrors.OwnerEmail = "Valid email is required";
    if (!/^\d{10}$/.test(ownerData.OwnerPhone))
      tempErrors.OwnerPhone = "Enter a valid 10-digit phone number";
    if (!/^\d{10}$/.test(ownerData.EmergencyContact))
      tempErrors.EmergencyContact = "Enter a valid 10-digit emergency contact";
    if (!ownerData.OwnerAddress.trim())
      tempErrors.OwnerAddress = "Address is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("⚠️ Please fill all the details correctly!");
      return;
    }
    sessionStorage.setItem("ownerData", JSON.stringify(ownerData));
    navigate("/register/pet");
  };

  return (
    <main className="register-page">
      {/* ✅ Scoped Toast */}
      <div className="register-toast-wrapper">
        <ToastContainer />
      </div>

      {/* ✅ Background image */}
      <img src={bgImage} alt="background" className="register-bg-image" />

      {/* ✅ Overlay container */}
      <div className="register-form-overlay">
        <div className="glass-header">
          <h2>Owner Information</h2>
          <p>
            Please provide your personal information. This helps us contact
            you quickly in case of emergencies and care updates.
          </p>
        </div>

        {/* Progress bar */}
        <div className="registration-progress">
          <div className="progress-step active"></div>
          <div className="progress-step"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleNext} className="register-form">
          <div className="form-section">
            <div className="form-section-title">Contact Details</div>

            {/* Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="OwnerName">
                Owner Name<span className="required-field">*</span>
              </label>
              <input
                id="OwnerName"
                className={`form-input ${errors.OwnerName ? "error" : ""}`}
                name="OwnerName"
                placeholder="Enter full name"
                value={ownerData.OwnerName}
                onChange={handleChange}
              />
              {errors.OwnerName && (
                <p className="error-text">{errors.OwnerName}</p>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="OwnerEmail">
                Email<span className="required-field">*</span>
              </label>
              <input
                id="OwnerEmail"
                className={`form-input ${errors.OwnerEmail ? "error" : ""}`}
                type="email"
                name="OwnerEmail"
                placeholder="name@example.com"
                value={ownerData.OwnerEmail}
                onChange={handleChange}
              />
              {errors.OwnerEmail && (
                <p className="error-text">{errors.OwnerEmail}</p>
              )}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label" htmlFor="OwnerPhone">
                Phone<span className="required-field">*</span>
              </label>
              <input
                id="OwnerPhone"
                className={`form-input ${errors.OwnerPhone ? "error" : ""}`}
                name="OwnerPhone"
                placeholder="07XXXXXXXX"
                value={ownerData.OwnerPhone}
                onChange={handleChange}
              />
              {errors.OwnerPhone && (
                <p className="error-text">{errors.OwnerPhone}</p>
              )}
            </div>

            {/* Emergency Contact */}
            <div className="form-group">
              <label className="form-label" htmlFor="EmergencyContact">
                Emergency Contact<span className="required-field">*</span>
              </label>
              <input
                id="EmergencyContact"
                className={`form-input ${errors.EmergencyContact ? "error" : ""}`}
                name="EmergencyContact"
                placeholder="Emergency contact number"
                value={ownerData.EmergencyContact}
                onChange={handleChange}
              />
              {errors.EmergencyContact && (
                <p className="error-text">{errors.EmergencyContact}</p>
              )}
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="OwnerAddress">
                Address<span className="required-field">*</span>
              </label>
              <input
                id="OwnerAddress"
                className={`form-input ${errors.OwnerAddress ? "error" : ""}`}
                name="OwnerAddress"
                placeholder="Street, City"
                value={ownerData.OwnerAddress}
                onChange={handleChange}
              />
              {errors.OwnerAddress && (
                <p className="error-text">{errors.OwnerAddress}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="submit" className="register-btn">
              Next: Pet Info →
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default RegisterOwner;