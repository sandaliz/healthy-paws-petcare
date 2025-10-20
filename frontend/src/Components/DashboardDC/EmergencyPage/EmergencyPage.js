import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../../../utils/api";
import "./EmergencyPage.css";

const EmergencyPage = () => {
  const { state } = useLocation();
  const appointment = state?.appointment;
  const [treatment, setTreatment] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);


  // Always call hooks
  useEffect(() => {
    const fetchHistory = async () => {
      if (!appointment?._id) return; // handle missing appointment

      try {
        setLoadingHistory(true);
        const res = await api.get(`/api/emergencies/history/${appointment._id}`);
        setHistory(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch emergency history:", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [appointment]);

  if (!appointment) {
    return <p>No appointment data found.</p>;
  }

  const reportEmergency = async (actionType) => {
    try {
      const payload = {
        appointmentID: appointment._id,
        treatmentGiven: actionType === "authorize-treatment" ? treatment : "",
        emergencyAction: actionType,
      };

      const res = await api.post("/api/emergencies/send", payload);

      if (res.status === 200) {
        alert("Emergency reported successfully!");
        setTreatment("");
        // Refresh history
        const updatedHistory = await api.get(`/api/emergencies/history/${appointment._id}`);
        setHistory(updatedHistory.data.data || []);
      }
    } catch (err) {
      console.error("Failed to report emergency:", err);
      alert(err.response?.data?.message || "Failed to report emergency. Check console.");
    }
  };

  return (
    <div className="emergency-page">
      <h2>Report Emergency for {appointment.petName}</h2>
      <p>
        <strong>Owner:</strong> {appointment.ownerName} <br />
        <strong>Species:</strong> {appointment.species} <br />
        <strong>Email:</strong> {appointment.email} <br />
        <strong>Emergency Action:</strong> {appointment.emergencyAction}
      </p>

      <div className="emergency-actions">
        <button
          className="emergency-btn contact-owner"
          onClick={() => reportEmergency("contact-owner")}
        >
          Contact Owner First
        </button>

        <div className="authorize-treatment-section">
          <textarea
            placeholder="Enter treatment details"
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
          />
          <button
            className="emergency-btn authorize-treatment"
            onClick={() => reportEmergency("authorize-treatment")}
          >
            Authorize Treatment
          </button>
        </div>
      </div>

      <div className="emergency-history">
        <h3> Emergency History</h3>
        {loadingHistory ? (
          <p>Loading history...</p>
        ) : history.length === 0 ? (
          <p>No emergency records found for this pet.</p>
        ) : (
          <table className="emergency-history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Action</th>
                <th>Treatment Given</th>
                <th>Email Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr key={record._id}>
                  <td>{new Date(record.createdAt).toLocaleString()}</td>
                  <td>{record.actionTaken}</td>
                  <td>{record.treatmentGiven || "—"}</td>
                  <td>{record.emailStatus || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EmergencyPage;
