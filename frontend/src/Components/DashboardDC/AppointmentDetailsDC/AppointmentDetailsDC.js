// src/Components/DashboardDC/AppointmentDetailsDC/AppointmentDetailsDC.js
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../../../utils/api"; // centralized API with JWT
import "./AppointmentDetailsDC.css";

function AppointmentDetailsDC() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);

  // Sri Lanka timezone formatting
  const formatDateSL = (dateStr) => {
    if (!dateStr) return "-";
    const dt = new Date(dateStr);
    return dt.toLocaleDateString("en-GB", { timeZone: "Asia/Colombo" });
  };

  const fetchAppointment = useCallback(async () => {
    try {
      const res = await api.get(`/careCustomers/${id}`);
      if (res.data && res.data.careCustomer) {
        setAppointment(res.data.careCustomer);
      }
    } catch (err) {
      console.error("Error fetching appointment:", err);
      alert(err.response?.data?.message || "Failed to fetch appointment");
    }
  }, [id]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  if (!appointment) {
    return <p>Loading appointment...</p>;
  }

  return (
    <div className="ad-dc-container">
      <h2>Appointment Details</h2>

      <p><strong>Owner:</strong> {appointment.ownerName}</p>
      <p><strong>Contact:</strong> {appointment.contactNumber}</p>
      <p><strong>Email:</strong> {appointment.email}</p>

      <p><strong>Pet:</strong> {appointment.petName} ({appointment.species})</p>
      <p>
        <strong>Stay:</strong>{" "}
        {formatDateSL(appointment.dateStay)} → {formatDateSL(appointment.pickUpDate)}
      </p>
      <p><strong>Nights:</strong> {appointment.nightsStay}</p>

      <p><strong>Drop Off Time:</strong> {appointment.dropOffTime}</p>
      <p><strong>Pick Up Time:</strong> {appointment.pickUpTime}</p>
      <p><strong>Health Details:</strong> {appointment.healthDetails}</p>
      <p><strong>Food Type:</strong> {appointment.foodType}</p>
      <p><strong>Feeding Times:</strong> {appointment.feedingTimes}</p>
      <p><strong>Grooming:</strong> {appointment.grooming ? "Yes" : "No"}</p>
      <p><strong>Walking:</strong> {appointment.walking ? "Yes" : "No"}</p>

      <p><strong>Status:</strong> {appointment.status}</p>
    </div>
  );
}

export default AppointmentDetailsDC;
