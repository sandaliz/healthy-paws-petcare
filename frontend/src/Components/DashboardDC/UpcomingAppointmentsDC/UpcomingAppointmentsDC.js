// src/Components/DashboardDC/UpcomingAppointmentsDC/UpcomingAppointmentsDC.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import "./UpcomingAppointmentsDC.css";

function UpcomingAppointmentsDC() {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUpcomingAppointments();
  }, []);

  const fetchUpcomingAppointments = async () => {
    try {
      const res = await api.get("/careCustomers/status/Approved");
      if (res.data && res.data.careCustomers) {
        setUpcomingAppointments(res.data.careCustomers);
      }
    } catch (err) {
      console.error("Error fetching upcoming appointments:", err);
      alert(err.response?.data?.message || "Failed to fetch upcoming appointments");
    }
  };

  const handleCheckIn = async (appointmentId) => {
    if (!window.confirm("Check in this pet?")) return;

    try {
      const res = await api.post("/checkInOut/checkin", {
        appointmentId,
        checkedInBy: "Receptionist",
      });

      if (res.status === 201) {
        alert("Pet checked in successfully!");
        // Remove checked-in appointment from upcoming list
        setUpcomingAppointments((prev) =>
          prev.filter((appt) => appt._id !== appointmentId)
        );
        // Navigate to TodaysPets page
        navigate("/dashboardDC/todaysPets");
      }
    } catch (err) {
      console.error("Check-in error:", err);
      alert(err.response?.data?.message || "Error during check-in");
    }
  };

  const viewDetails = (appointmentId) => {
    navigate(`/dashboardDC/appointmentDetailsDC/${appointmentId}`, {
      state: { fromTab: "upcomingAppointments" },
    });
  };

  return (
    <div className="uaDC-container">
      <h2 className="uaDC-title">Upcoming Appointments</h2>
      {upcomingAppointments.length > 0 ? (
        <ul className="uaDC-list">
          {upcomingAppointments.map((appt) => (
            <li key={appt._id} className="uaDC-item">
              <div className="uaDC-info">
                <strong>Owner:</strong> {appt.ownerName} |{" "}
                <strong>Pet:</strong> {appt.petName} |{" "}
                <strong>Date:</strong>{" "}
                {new Date(appt.dateStay).toLocaleDateString("en-GB")} |{" "}
                <strong>Status:</strong> {appt.status}
              </div>
              <div className="uaDC-actions">
                <button
                  className="uaDC-btn uaDC-btn-view"
                  onClick={() => viewDetails(appt._id)}
                >
                  View
                </button>
                <button
                  className="uaDC-btn uaDC-btn-checkin"
                  onClick={() => handleCheckIn(appt._id)}
                >
                  Check-In
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="uaDC-empty">No upcoming appointments.</p>
      )}
    </div>
  );
}

export default UpcomingAppointmentsDC;
