// src/Components/DashboardDC/DailyLogHistory/DailyLogHistory.js
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../utils/api";

function DailyLogHistory() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch appointment details
  const fetchAppointment = useCallback(async () => {
    if (!appointmentId) return;
    try {
      const res = await api.get(`/careCustomers/${appointmentId}`);
      setAppointment(res.data.careCustomer || null);
    } catch (err) {
      console.error("Error fetching appointment:", err);
      setError("Failed to fetch appointment details.");
    }
  }, [appointmentId]);

  // Fetch daily logs
  const fetchLogs = useCallback(async () => {
    if (!appointmentId) return;
    try {
      const res = await api.get(`/dailyLogs/appointment/${appointmentId}`);
      setDailyLogs(res.data.dailyLogs || []);
    } catch (err) {
      console.error("Error fetching daily logs:", err);
      setError(err.response?.data?.message || "Failed to load daily logs.");
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    fetchAppointment();
    fetchLogs();
  }, [fetchAppointment, fetchLogs]);

  if (loading) return <div className="daily-logs-container">Loading daily logs...</div>;

  if (error)
    return (
      <div className="daily-logs-container text-red-600">
        {appointment && (
        <div className="appointment-details">
          <h3>Appointment Details</h3>
          <p><strong>Owner:</strong> {appointment.ownerName}</p>
          <p><strong>Pet:</strong> {appointment.petName} ({appointment.species})</p>
          <p><strong>Health Notes:</strong> {appointment.healthDetails || "-"}</p>
          <p><strong>Grooming:</strong> {appointment.grooming ? "Yes" : "No"}</p>
          <p><strong>Walking:</strong> {appointment.walking ? "Yes" : "No"}</p>
          <p><strong>Feeding Times:</strong> {appointment.feedingTimes || "-"}</p>
        </div>
      )}
        {error} <button className="Em-btn-retry" onClick={() => { setLoading(true); fetchLogs(); }}>Retry</button>
      </div>
    );

  return (
    <div className="daily-logs-container">
      <h2>Daily Logs History</h2>

      {/* Appointment Details */}
      {appointment && (
        <div className="appointment-details">
          <h3>Appointment Details</h3>
          <p><strong>Owner:</strong> {appointment.ownerName}</p>
          <p><strong>Pet:</strong> {appointment.petName} ({appointment.species})</p>
          <p><strong>Health Notes:</strong> {appointment.healthDetails || "-"}</p>
          <p><strong>Grooming:</strong> {appointment.grooming ? "Yes" : "No"}</p>
          <p><strong>Walking:</strong> {appointment.walking ? "Yes" : "No"}</p>
          <p><strong>Feeding Times:</strong> {appointment.feedingTimes || "-"}</p>
        </div>
      )}

      {/* Daily Logs Table */}
      {dailyLogs.length > 0 ? (
        <table className="daily-logs-table">
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
            {dailyLogs.map(log => (
              <tr key={log._id}>
                <td>{new Date(log.date).toLocaleDateString()}</td>
                <td>{log.feeding}</td>
                <td>{log.note || "-"}</td>
                <td>{log.playtime}</td>
                <td>{log.walking}</td>
                <td>{log.grooming}</td>
                <td>{log.mood}</td>
                <td>{log.loggedBy}</td>
                
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No daily logs yet for this appointment.</p>
      )}

      <div className="mt-4">
        <button
          className="btn-back"
          onClick={() => navigate("/dashboardDC/appointmentHistory")}
        >
          Back to Appointment History
        </button>
      </div>
    </div>
  );
}

export default DailyLogHistory;
