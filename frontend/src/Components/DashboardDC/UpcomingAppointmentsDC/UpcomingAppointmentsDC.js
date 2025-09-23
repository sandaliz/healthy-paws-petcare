// src/Components/DashboardDC/UpcomingAppointmentsDC/UpcomingAppointmentsDC.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./UpcomingAppointmentsDC.css";

const URL = "http://localhost:5000/careCustomers";
const CHECKIN_URL = "http://localhost:5000/checkInOut/checkin";

function UpcomingAppointmentsDC() {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUpcomingAppointments();
  }, []);

  const fetchUpcomingAppointments = async () => {
    try {
      const res = await axios.get(`${URL}/status/Approved`);
      if (res.data && res.data.careCustomers) {
        setUpcomingAppointments(res.data.careCustomers);
      }
    } catch (err) {
      console.error("Error fetching upcoming appointments:", err);
    }
  };

  const handleCheckIn = async (appointmentId) => {
    try {
      const res = await axios.post(CHECKIN_URL, {
        appointmentId,              
        checkedInBy: "Receptionist" 
      });

      if (res.status === 201) {
        alert("Pet checked in successfully!");
        setUpcomingAppointments((prev) =>
          prev.filter((appt) => appt._id !== appointmentId)
        );
      }
    } catch (err) {
      console.error("Error checking in pet:", err);
      alert(err.response?.data?.message || "Error during check-in");
    }
  };

  const viewDetails = (appointmentId) => {
    navigate(`/dashboardDC/appointmentDetailsDC/${appointmentId}`, {
      state: { fromTab: "upcomingAppointments" },
    });
  };

  return (
    <div className="upcoming-container">
      <h2>Upcoming Appointments</h2>
      {upcomingAppointments.length > 0 ? (
        <ul className="upcoming-list">
          {upcomingAppointments.map((appt) => (
            <li key={appt._id} className="upcoming-item">
              <div className="upcoming-info">
                <strong>Owner:</strong> {appt.ownerName} |{" "}
                <strong>Pet:</strong> {appt.petName} |{" "}
                <strong>Date:</strong>{" "}
                {new Date(appt.dateStay).toLocaleDateString("en-GB")} |{" "}
                <strong>Status:</strong> {appt.status}
              </div>
              <div className="action-btns">
                <button
                  className="btn-view"
                  onClick={() => viewDetails(appt._id)}
                >
                  View
                </button>
                <button
                  className="btn-checkin"
                  onClick={() => handleCheckIn(appt._id)}
                >
                  Check-In
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No upcoming appointments.</p>
      )}
    </div>
  );
}

export default UpcomingAppointmentsDC;