// src/Components/DashboardDC/PendingAppointmentsDC/PendingAppointmentsDC.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PendingAppointmentsDC.css";

const URL = "http://localhost:5000/careCustomers";

function PendingAppointments({ onReject }) {
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingAppointments();
  }, []);

  const fetchPendingAppointments = async () => {
    try {
      const res = await axios.get(URL);
      if (res.data && res.data.careCustomers) {
        const filtered = res.data.careCustomers.filter(
          (appt) => appt.status?.toLowerCase() === "pending"
        );
        setPendingAppointments(filtered);
      }
    } catch (err) {
      console.error("Error fetching pending appointments:", err);
    }
  };

    const approveHandler = async (id) => {
    const confirm = window.confirm("Do you want to approve this appointment?");
    if (!confirm) return;

    try {
      await axios.put(`${URL}/${id}/status`, { status: "Approved" });
      alert("Appointment approved successfully ");
      setPendingAppointments((prev) => prev.filter((appt) => appt._id !== id));
    } catch (err) {
      console.error("Error approving appointment:", err);
      alert(err.response?.data?.message || "Error approving appointment");
    }
  };


  const rejectHandler = async (appt) => {
  const confirm = window.confirm(`Reject appointment of ${appt.petName}?`);
  if (!confirm) return;

  try {
    const res = await axios.put(`http://localhost:5000/checkinout/reject/${appt._id}`);
    const rejectedAppt = res.data.careCustomer;

    const rejectedRecord = {
      _id: rejectedAppt._id,
      ownerName: rejectedAppt.ownerName,
      petName: rejectedAppt.petName,
      status: rejectedAppt.status, // "Rejected"
      checkInTime: null,
      checkOutTime: null,
      createdAt: new Date(),
      services: [
        rejectedAppt.grooming ? "Grooming" : null,
        rejectedAppt.walking ? "Walking" : null,
      ].filter(Boolean),
    };

    // Notify parent to immediately add to history
    if (onReject) onReject(rejectedRecord);
    alert("Appointment rejected successfully ");
    // Remove from pending list
    setPendingAppointments((prev) => prev.filter((a) => a._id !== appt._id));
  } catch (err) {
    console.error("Error rejecting appointment:", err);
    alert(err.response?.data?.message || "Error rejecting appointment");
  }
};


  const viewDetails = (appointmentId) => {
    navigate(`/dashboardDC/appointmentDetailsDC/${appointmentId}`, {
      state: { fromTab: "pendingAppointments" },
    });
  };

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
                <strong>Stay Date:</strong>{" "}
                {new Date(appt.dateStay).toLocaleDateString("en-GB")}
              </div>
              <div className="action-btns">
                <button
                  className="btn-view"
                  onClick={() => viewDetails(appt._id)}
                >
                  View
                </button>
                <button
                  className="btn-approve"
                  onClick={() => approveHandler(appt._id)}
                >
                  Approve
                </button>
                <button
                  className="btn-reject"
                  onClick={() => rejectHandler(appt)}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending appointments found.</p>
      )}
    </div>
  );
}

export default PendingAppointments;
