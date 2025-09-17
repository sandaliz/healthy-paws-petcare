// src/Components/DashboardDC/AppointmentDCHistory/AppointmentDCHistory.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AppointmentDCHistory.css";

const HISTORY_URL = "http://localhost:5000/checkInOut/history";

function AppointmentDCHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(HISTORY_URL);
      if (res.data && res.data.checkedOutPets) {
        setHistory(res.data.checkedOutPets);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  return (
    <div className="history-container">
      <h2>Appointment History</h2>
      {history.length > 0 ? (
        <table className="history-table">
          <thead>
            <tr>
              <th>Owner</th>
              <th>Pet</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Checked Out By</th>
            </tr>
          </thead>
          <tbody>
            {history.map((rec) => (
              <tr key={rec._id}>
                <td>{rec.appointment.ownerName}</td>
                <td>{rec.appointment.petName}</td>
                <td>{new Date(rec.checkInTime).toLocaleTimeString("en-GB")}</td>
                <td>{new Date(rec.checkOutTime).toLocaleTimeString("en-GB")}</td>
                <td>{rec.checkedOutBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No appointment history yet.</p>
      )}
    </div>
  );
}

export default AppointmentDCHistory;
