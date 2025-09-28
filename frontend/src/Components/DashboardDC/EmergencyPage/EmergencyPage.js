// src/Components/DashboardDC/TodaysPets/EmergencyPage.js
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import "./EmergencyPage.css";

const EmergencyPage = () => {
  const { state } = useLocation();
  const appointment = state?.appointment;
  const [treatment, setTreatment] = useState("");
  const navigate = useNavigate();

  if (!appointment) {
    return <p>No appointment data found.</p>;
  }

  const reportEmergency = async (actionType) => {
    try {
      // Send the correct emergencyAction to the backend
      await api.post("/emergency/send", {
        appointmentID: appointment._id,
        treatmentGiven: actionType === "authorize-treatment" ? treatment : "",
        emergencyAction: actionType,
      });

      alert("Emergency reported successfully!");
      navigate("/dashboardDC/todaysPets");
    } catch (err) {
      console.error("Failed to report emergency:", err);
      const msg =
        err.response?.data?.message || "Failed to report emergency. Check console.";
      alert(msg);
    }
  };

  return (
    <div className="emergency-page">
      <h2>Report Emergency for {appointment.petName}</h2>

      <div className="emergency-actions">
        <button
          className="emergency-btn contact-owner"
          onClick={() => reportEmergency("contact-owner")}
        >
          Contact Owner First
        </button>

        <div className="authorize-treatment-section">
          <textarea
            placeholder="Enter treatment details"
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
          />
          <button
            className="emergency-btn authorize-treatment"
            onClick={() => reportEmergency("authorize-treatment")}
          >
            Authorize Treatment
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPage;
