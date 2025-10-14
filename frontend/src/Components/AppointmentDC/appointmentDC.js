// src/Components/DashboardDC/AppointmentDC.js
import React from "react";
import "./AppointmentDC.css";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

function AppointmentDC({ careCustomer, onStatusChange }) {
  const {
    _id,
    ownerName,
    petName,
    dateStay,
    pickUpDate,
    status,
  } = careCustomer;

  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        timeZone: "Asia/Colombo",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const res = await api.put(`/careCustomers/${_id}/status`, { status: "Cancelled" });
      if (res.status === 200) {
        alert("Appointment cancelled successfully!");
        if (onStatusChange) onStatusChange(_id, "Cancelled");
      }
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      alert("Failed to cancel appointment. Please try again.");
    }
  };

  const handleReschedule = () => {
    navigate(`/updateApphisDC/${_id}`);
  };

  const handleViewLogs = () => {
    navigate(`/daycareLogs/${_id}`);
  };

  const handleViewDetails = () => {
    navigate(`/appHisDetailsDC/${_id}`);
  };

  const canModify = status === "Pending";

  return (
    <div className="appointment-card">

      <div className="dc-his-header">
        <h3>Appointment History</h3>
      </div>
      
      <div className="card-header-dc">
        <h3>{ownerName}</h3>
        <span className="pet-name-dc">🐾 {petName}</span>
      </div>

      <div className="card-body-dc">
        <p>
          <strong>Stay:</strong> {formatDate(dateStay)} → {formatDate(pickUpDate)}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span className={`status-badge-dc status-${status.toLowerCase()}`}>
            {status}
          </span>
        </p>
      </div>

      <div className="card-actions-dc">
        <button className="btn-view-dc" onClick={handleViewDetails}>
          View
        </button>
        <button
          className="btn-reschedule-dc"
          onClick={handleReschedule}
          disabled={!canModify}
        >
          Reschedule
        </button>
        <button
          className="btn-cancel-dc"
          onClick={handleCancel}
          disabled={!canModify}
        >
          Cancel
        </button>
        <button className="btn-logs-dc" onClick={handleViewLogs}>
          View Logs
        </button>
      </div>
    </div>
  );
}

export default AppointmentDC;
