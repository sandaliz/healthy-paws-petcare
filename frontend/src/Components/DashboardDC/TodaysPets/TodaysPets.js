import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./TodaysPets.css";

const CHECKED_IN_URL = "http://localhost:5001/checkInOut/current";
const CHECKOUT_URL = "http://localhost:5001/checkInOut/checkout";

function TodaysPets() {
  const [checkedInPets, setCheckedInPets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCheckedInPets();
  }, []);

  const fetchCheckedInPets = async () => {
    try {
      const res = await axios.get(CHECKED_IN_URL);
      if (res.data && res.data.checkedInPets) {
        setCheckedInPets(res.data.checkedInPets);
      }
    } catch (err) {
      console.error("Error fetching checked-in pets:", err);
    }
  };

  const handleCheckOut = async (checkInOutId) => {
    try {
      const res = await axios.put(`${CHECKOUT_URL}/${checkInOutId}`, {
        checkOutTime: new Date()
      });

      if (res.status === 200) {
        alert("Pet checked out successfully!");
        setCheckedInPets(prev => prev.filter(pet => pet._id !== checkInOutId));
      }
    } catch (err) {
      console.error("Error during check-out:", err);
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

  // Format date as DD/MM/YYYY HH:mm
  function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return "-";
    const dt = new Date(dateTimeStr);
    const day = String(dt.getDate()).padStart(2, "0");
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const year = dt.getFullYear();
    const hours = String(dt.getHours()).padStart(2, "0");
    const minutes = String(dt.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

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
            </tr>
          </thead>
          <tbody>
            {checkedInPets.map((pet) => (
              <tr key={pet._id}>
                <td>{pet.appointment.ownerName}</td>
                <td>{pet.appointment.petName}</td>
                <td>{formatDateTime(pet.checkInTime)}</td>
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