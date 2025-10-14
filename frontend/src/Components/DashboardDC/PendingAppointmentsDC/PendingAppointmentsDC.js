// src/Components/DashboardDC/PendingAppointmentsDC/PendingAppointmentsDC.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import "./PendingAppointmentsDC.css";

function PendingAppointments({ onHistoryUpdate }) {
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingAppointments();
  }, []);

  // Fetch all pending appointments
  const fetchPendingAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/careCustomers");
      if (res.data && res.data.careCustomers) {
        const filtered = res.data.careCustomers.filter(
          (appt) => appt.status?.toLowerCase() === "pending"
        );
        setPendingAppointments(filtered);
      }
    } catch (err) {
      console.error("Error fetching pending appointments:", err);
      setError(err.response?.data?.message || "Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  // Approve appointment
  const approveHandler = async (id) => {
    const confirm = window.confirm("Do you want to approve this appointment?");
    if (!confirm) return;

    try {
      await api.put(`/careCustomers/${id}/status`, { status: "Approved" });
      alert("Appointment approved successfully");
      setPendingAppointments((prev) => prev.filter((appt) => appt._id !== id));

      if (onHistoryUpdate) onHistoryUpdate(); // refresh history
    } catch (err) {
      console.error("Error approving appointment:", err);
      alert(err.response?.data?.message || "Error approving appointment");
    }
  };

  // Reject appointment
  const rejectHandler = async (appt) => {
    const confirm = window.confirm(`Reject appointment of ${appt.petName}?`);
    if (!confirm) return;

    try {
      await api.put(`/careCustomers/${appt._id}/status`, { status: "Rejected" });
      alert("Appointment rejected successfully");
      setPendingAppointments((prev) => prev.filter((a) => a._id !== appt._id));

      if (onHistoryUpdate) onHistoryUpdate(); // refresh history
    } catch (err) {
      console.error("Error rejecting appointment:", err);
      alert(err.response?.data?.message || "Error rejecting appointment");
    }
  };

  // View appointment details
  const viewDetails = (appointmentId) => {
    navigate(`/dashboardDC/appointmentDetailsDC/${appointmentId}`, {
      state: { fromTab: "pendingAppointments" },
    });
  };

  // Format date in Sri Lanka timezone
  const formatDateSL = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB", { timeZone: "Asia/Colombo" });
  };

  if (loading) {
    return (
      <div className="pending-container">
        <div className="pending-loading"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pending-container">
        <div className="pending-message error">
          <p>Error: {error}</p>
          <button onClick={fetchPendingAppointments} className="DC-btn-view">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pending-container">
      <h2>Pending Appointments</h2>
      {pendingAppointments.length > 0 ? (
        <ul className="pending-list">
          {pendingAppointments.map((appt) => (
            <li key={appt._id} className="pending-item">
              <div>
                <strong>Owner:</strong> {appt.ownerName} |{" "}
                <strong>Pet:</strong> {appt.petName} |{" "}
                <strong>Stay Date:</strong> {formatDateSL(appt.dateStay)}
              </div>
              <div className="DC-action-btns">
                <button className="DC-btn-view" onClick={() => viewDetails(appt._id)}>
                  View
                </button>
                <button className="DC-btn-approve" onClick={() => approveHandler(appt._id)}>
                  Approve
                </button>
                <button className="DC-btn-reject" onClick={() => rejectHandler(appt)}>
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending appointments found. All appointments have been processed! ✅</p>
      )}
    </div>
  );
}

export default PendingAppointments;