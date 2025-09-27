// src/Components/DashboardDC/DailyLogs/DailyLogs.js
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./DailyLogs.css";

const DAILY_LOGS_URL = "http://localhost:5000/dailyLogs";
const CARE_CUSTOMER_URL = "http://localhost:5000/careCustomers";

function DailyLogs() {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [formData, setFormData] = useState({
    feeding: "",
    note: "",
    playtime: "",
    walking: "",
    grooming: "",
    mood: "good",
    loggedBy: ""
  });

  // Fetch appointment details
  const fetchAppointment = useCallback(async () => {
    if (!appointmentId) return;
    try {
      const res = await axios.get(`${CARE_CUSTOMER_URL}/${appointmentId}`, { withCredentials: true });
      setAppointment(res.data.careCustomer || null);
    } catch (err) {
      console.error("Error fetching appointment:", err);
    }
  }, [appointmentId]);

  // Fetch daily logs
  const fetchLogs = useCallback(async () => {
    if (!appointmentId) return;
    try {
      const res = await axios.get(`${DAILY_LOGS_URL}/appointment/${appointmentId}`, { withCredentials: true });
      setDailyLogs(res.data.dailyLogs || []);
    } catch (err) {
      console.error("Error fetching daily logs:", err);
    }
  }, [appointmentId]);

  useEffect(() => {
    fetchAppointment();
    fetchLogs();
  }, [fetchAppointment, fetchLogs]);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(DAILY_LOGS_URL, { appointment: appointmentId, ...formData }, { withCredentials: true });
      if (res.status === 201) {
        alert("Daily log added successfully!");
        setFormData({
          feeding: "",
          note: "",
          playtime: "",
          walking: "",
          grooming: "",
          mood: "good",
          loggedBy: ""
        });
        fetchLogs();
      }
    } catch (err) {
      console.error("Error adding daily log:", err);
      alert(err.response?.data?.message || "Error adding daily log");
    }
  };

  const handleUpdateLog = async (id, field) => {
    const value = prompt(`Update ${field}:`, dailyLogs.find(log => log._id === id)?.[field] || "");
    if (value === null) return;
    try {
      await axios.put(`${DAILY_LOGS_URL}/${id}`, { [field]: value }, { withCredentials: true });
      fetchLogs();
    } catch (err) {
      console.error("Error updating daily log:", err);
      alert(err.response?.data?.message || "Error updating daily log");
    }
  };

  return (
    <div className="daily-logs-container">
      <h2>Daily Logs</h2>

      {/* ---------------- Appointment Details ---------------- */}
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

      {/* ---------------- Daily Log Form ---------------- */}
      <form className="daily-log-form" onSubmit={handleAddLog}>
        <div className="form-row">
          <input
            type="text"
            name="feeding"
            placeholder="Feeding *"
            value={formData.feeding}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="loggedBy"
            placeholder="Logged by *"
            value={formData.loggedBy}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-row">
          <input
            type="text"
            name="note"
            placeholder="Notes"
            value={formData.note}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="playtime"
            placeholder="Playtime"
            value={formData.playtime}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-row">
          <input
            type="text"
            name="walking"
            placeholder="Walking"
            value={formData.walking}
            onChange={handleInputChange}
            disabled={!appointment?.walking}
          />
          <input
            type="text"
            name="grooming"
            placeholder="Grooming"
            value={formData.grooming}
            onChange={handleInputChange}
            disabled={!appointment?.grooming}
          />
        </div>

        <div className="form-row">
          <label>Mood:
            <select name="mood" value={formData.mood} onChange={handleInputChange}>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="okay">Okay</option>
              <option value="poor">Poor</option>
            </select>
          </label>
        </div>

        <button type="submit" className="btn-add-log">Add Log</button>
      </form>

      {/* ---------------- Daily Logs Table ---------------- */}
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dailyLogs.map(log => (
              <tr key={log._id}>
                <td>{new Date(log.date).toLocaleDateString()}</td>
                <td>{log.feeding}</td>
                <td>{log.note}</td>
                <td>{log.playtime}</td>
                <td>{log.walking}</td>
                <td>{log.grooming}</td>
                <td>{log.mood}</td>
                <td>{log.loggedBy}</td>
                <td>
                  {["feeding", "note", "playtime", "walking", "grooming", "mood"].map(field => (
                    <button key={field} onClick={() => handleUpdateLog(log._id, field)}>
                      Update {field}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No daily logs yet for this appointment.</p>
      )}
    </div>
  );
}

export default DailyLogs;
