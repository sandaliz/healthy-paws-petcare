// src/Components/DashboardDC/DailyLogsPet/DailyLogsPet.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./DailyLogsPet.css";

const DAILY_LOGS_URL = "http://localhost:5000/dailyLogs";

function DailyLogsPet() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [dailyLogs, setDailyLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${DAILY_LOGS_URL}/appointment/${appointmentId}`);
        setDailyLogs(res.data.dailyLogs || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load daily logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [appointmentId]);

  if (loading) return <p>Loading daily logs...</p>;
  if (error) return <p>{error}</p>;
  if (dailyLogs.length === 0) return <p>No daily logs found for this appointment.</p>;

  return (
    <div className="daily-logs-pet-container">
      <h2>Daycare Logs</h2>

      <button className="btn-back" onClick={() => navigate(-1)}>
        Back to Appointment
      </button>

      <table className="daily-logs-pet-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Feeding</th>
            <th>Note</th>
            <th>Playtime</th>
            <th>Walking</th>
            <th>Grooming</th>
            <th>Mood</th>
            <th>Logged By</th>
          </tr>
        </thead>
        <tbody>
          {dailyLogs.map((log) => (
            <tr key={log._id}>
              <td>{new Date(log.date).toLocaleDateString()}</td>
              <td>{log.feeding}</td>
              <td>{log.note || "-"}</td>
              <td>{log.playtime || "-"}</td>
              <td>{log.walking || "-"}</td>
              <td>{log.grooming || "-"}</td>
              <td>{log.mood}</td>
              <td>{log.loggedBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DailyLogsPet;
