// src/Components/DashboardDC/PendingAppointmentsDC/PendingAppointmentsDC.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PendingAppointmentsDC.css";

const URL = "http://localhost:5000/careCustomers";

function PendingAppointments() {
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
    try {
      await axios.put(`${URL}/${id}`, { status: "Approved" });
      setPendingAppointments((prev) => prev.filter((appt) => appt._id !== id));
    } catch (err) {
      console.error("Error approving appointment:", err);
    }
  };

  const rejectHandler = async (id) => {
    try {
      await axios.put(`${URL}/${id}`, { status: "Rejected" });
      setPendingAppointments((prev) => prev.filter((appt) => appt._id !== id));
    } catch (err) {
      console.error("Error rejecting appointment:", err);
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
                  onClick={() => rejectHandler(appt._id)}
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
