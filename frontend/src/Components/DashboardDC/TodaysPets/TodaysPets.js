// src/Components/DashboardDC/TodaysPets/TodaysPets.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import "./TodaysPets.css";

function TodaysPets() {
  const [checkedInPets, setCheckedInPets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCheckedInPets();
  }, []);

  const fetchCheckedInPets = async () => {
    try {
      const res = await api.get("/checkinout/current"); // check your backend route
      if (res.data && res.data.checkedInPets) {
        setCheckedInPets(res.data.checkedInPets);
      }
    } catch (err) {
      console.error("Error fetching checked-in pets:", err);
      alert(err.response?.data?.message || "Failed to fetch checked-in pets");
    }
  };

  const handleCheckOut = async (checkInOutId) => {
    if (!window.confirm("Check out this pet?")) return;

    try {
      const res = await api.put(`/checkinout/checkout/${checkInOutId}`);
      if (res.status === 200) {
        alert("Pet checked out successfully!");
        setCheckedInPets((prev) =>
          prev.filter((pet) => pet._id !== checkInOutId)
        );
      }
    } catch (err) {
      console.error("Check-out error:", err);
      alert(err.response?.data?.message || "Error during check-out");
    }
  };

  const viewDetails = (appointmentId) => {
    navigate(`/dashboardDC/appointmentDetailsDC/${appointmentId}`, {
      state: { fromTab: "todaysPets" },
    });
  };

  const addDailyLog = (appointmentId) => {
    navigate(`/dashboardDC/dailyLogs/${appointmentId}`, {
      state: { fromTab: "todaysPets" },
    });
  };

  const handleEmergency = (appointment) => {
    navigate("/dashboardDC/emergency", { state: { appointment } });
  };

  const formatDateTimeSL = (dateTimeStr) => {
    if (!dateTimeStr) return "-";
    const dt = new Date(dateTimeStr);
    return dt.toLocaleString("en-GB", {
      timeZone: "Asia/Colombo",
      hour12: false,
    });
  };

  return (
    <div className="tp-container">
      <h2>Today's Checked-In Pets</h2>
      {checkedInPets.length > 0 ? (
        <table className="tp-table">
          <thead>
            <tr>
              <th>Owner</th>
              <th>Pet</th>
              <th>Check-In Time</th>
              <th>Details</th>
              <th>Daily Logs</th>
              <th>Checkout</th>
              <th>Emergency</th>
            </tr>
          </thead>
          <tbody>
            {checkedInPets.map((pet) => (
              <tr key={pet._id}>
                <td>{pet.appointment.ownerName}</td>
                <td>{pet.appointment.petName}</td>
                <td>{formatDateTimeSL(pet.checkInTime)}</td>
                <td>
                  <button
                    className="tp-btn tp-btn-view"
                    onClick={() => viewDetails(pet.appointment._id)}
                  >
                    View
                  </button>
                </td>
                <td>
                  <button
                    className="tp-btn tp-btn-logs"
                    onClick={() => addDailyLog(pet.appointment._id)}
                  >
                    Add Log
                  </button>
                </td>
                <td>
                  <button
                    className="tp-btn tp-btn-checkout"
                    onClick={() => handleCheckOut(pet._id)}
                  >
                    Check-Out
                  </button>
                </td>
                <td>
                  <button
                    className="tp-btn tp-btn-emergency"
                    onClick={() => handleEmergency(pet.appointment)}
                  >
                    Emergency
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No pets checked in today.</p>
      )}
    </div>
  );
}

export default TodaysPets;
