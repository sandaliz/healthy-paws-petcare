// src/Components/DashboardDC/DailyLogs/DailyLogs.js
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./DailyLogs.css";

const DAILY_LOGS_URL = "http://localhost:5000/dailyLogs";

function DailyLogs() {
  const { appointmentId } = useParams(); 
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

  // ✅ Wrap in useCallback so it’s stable across renders
  const fetchLogs = useCallback(async () => {
    if (!appointmentId) return;
    try {
      const res = await axios.get(`${DAILY_LOGS_URL}/appointment/${appointmentId}`);
      if (res.data && res.data.dailyLogs) {
        setDailyLogs(res.data.dailyLogs);
      } else {
        setDailyLogs([]);
      }
    } catch (err) {
      console.error("Error fetching daily logs:", err);
    }
  }, [appointmentId]);

  // ✅ Depend on fetchLogs
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(DAILY_LOGS_URL, { appointment: appointmentId, ...formData });
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
        fetchLogs(); // ✅ refresh logs after add
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
      await axios.put(`${DAILY_LOGS_URL}/${id}`, { [field]: value });
      fetchLogs();
    } catch (err) {
      console.error("Error updating daily log:", err);
      alert(err.response?.data?.message || "Error updating daily log");
    }
  };

  return (
    <div className="daily-logs-container">
      <h2>Daily Logs</h2>

      <form className="daily-log-form" onSubmit={handleAddLog}>
        <div className="form-row">
          <input type="text" name="feeding" placeholder="Feeding *" value={formData.feeding} onChange={handleInputChange} required />
          <input type="text" name="loggedBy" placeholder="Logged by *" value={formData.loggedBy} onChange={handleInputChange} required />
        </div>
        <div className="form-row">
          <input type="text" name="note" placeholder="Notes" value={formData.note} onChange={handleInputChange} />
          <input type="text" name="playtime" placeholder="Playtime" value={formData.playtime} onChange={handleInputChange} />
        </div>
        <div className="form-row">
          <input type="text" name="walking" placeholder="Walking" value={formData.walking} onChange={handleInputChange} />
          <input type="text" name="grooming" placeholder="Grooming" value={formData.grooming} onChange={handleInputChange} />
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
