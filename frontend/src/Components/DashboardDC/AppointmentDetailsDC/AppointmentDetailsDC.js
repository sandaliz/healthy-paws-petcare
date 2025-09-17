// src/Components/AppointmentDetailsDC/AppointmentDetailsDC.js
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AppointmentDetailsDC.css";

const URL = "http://localhost:5000/careCustomers";

function AppointmentDetailsDC() {
  const { id } = useParams(); // get appointment id from URL
  const [appointment, setAppointment] = useState(null);
  const navigate = useNavigate();

  // ✅ Wrap fetch in useCallback so it can be added to useEffect deps
  const fetchAppointment = useCallback(async () => {
    try {
      const res = await axios.get(`${URL}/${id}`);
      if (res.data && res.data.careCustomer) {
        setAppointment(res.data.careCustomer);
      }
    } catch (err) {
      console.error("Error fetching appointment:", err);
    }
  }, [id]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  const approveHandler = async () => {
    try {
      await axios.put(`${URL}/${id}`, { status: "Approved" });
      navigate("/pending-appointments"); // ✅ corrected route (matches your App.js)
    } catch (err) {
      console.error("Error approving:", err);
    }
  };

  const rejectHandler = async () => {
    try {
      await axios.put(`${URL}/${id}`, { status: "Rejected" });
      navigate("/pending-appointments");
    } catch (err) {
      console.error("Error rejecting:", err);
    }
  };

  if (!appointment) {
    return <p>Loading appointment...</p>;
  }

  return (
    <div className="appointment-details-dc">
      <h2>Appointment Details</h2>

      <p><strong>Owner:</strong> {appointment.ownerName}</p>
      <p><strong>Contact:</strong> {appointment.contactNumber}</p>
      <p><strong>Email:</strong> {appointment.email}</p>

      <p><strong>Pet:</strong> {appointment.petName} ({appointment.species})</p>
      <p>
        <strong>Stay:</strong>{" "}
        {new Date(appointment.dateStay).toLocaleDateString("en-GB")} →{" "}
        {new Date(appointment.pickUpDate).toLocaleDateString("en-GB")}
      </p>
      <p><strong>Nights:</strong> {appointment.nightsStay}</p>

      {/* ✅ Newly Added Fields */}
      <p><strong>Drop Off Time:</strong> {appointment.dropOffTime}</p>
      <p><strong>Pick Up Time:</strong> {appointment.pickUpTime}</p>
      <p><strong>Health Details:</strong> {appointment.healthDetails}</p>
      <p><strong>Food Type:</strong> {appointment.foodType}</p>
      <p><strong>Feeding Times:</strong> {appointment.feedingTimes}</p>
      <p><strong>Grooming:</strong> {appointment.grooming ? "Yes" : "No"}</p>
      <p><strong>Walking:</strong> {appointment.walking ? "Yes" : "No"}</p>

      <p><strong>Status:</strong> {appointment.status}</p>

      <div className="action-btns">
        <button className="btn-approve" onClick={approveHandler}>Approve</button>
        <button className="btn-reject" onClick={rejectHandler}>Reject</button>
      </div>
    </div>
  );
}

export default AppointmentDetailsDC;
