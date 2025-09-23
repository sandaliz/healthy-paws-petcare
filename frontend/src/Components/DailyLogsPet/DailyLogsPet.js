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

    <div className="daily-logs-grid">
      {dailyLogs.map((log) => (
        <div key={log._id} className="daily-log-card">
          <div className="daily-log-date">
            {new Date(log.date).toLocaleDateString()}
          </div>
          <p className="daily-log-item"><strong>Feeding:</strong> {log.feeding}</p>
          <p className="daily-log-item"><strong>Note:</strong> {log.note || "-"}</p>
          <p className="daily-log-item"><strong>Playtime:</strong> {log.playtime || "-"}</p>
          <p className="daily-log-item"><strong>Walking:</strong> {log.walking || "-"}</p>
          <p className="daily-log-item"><strong>Grooming:</strong> {log.grooming || "-"}</p>
          <p className={`daily-log-item mood-${log.mood?.toLowerCase()}`}>
            <strong>Mood:</strong> {log.mood}
          </p>
          <p className="daily-log-item"><strong>Logged By:</strong> {log.loggedBy}</p>
        </div>
      ))}
    </div>
  </div>
);
}

export default DailyLogsPet;
