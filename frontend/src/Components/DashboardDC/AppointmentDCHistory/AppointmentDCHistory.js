// src/Components/DashboardDC/AppointmentDCHistory/AppointmentDCHistory.js
import React, { useEffect, useState, useCallback } from "react";
import api from "../../../utils/api";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./AppointmentDCHistory.css";

// Format datetime in Sri Lanka timezone
const formatDateTimeSL = (dateTimeStr) => {
  if (!dateTimeStr) return "-";
  const dt = new Date(dateTimeStr);
  return dt.toLocaleString("en-GB", { timeZone: "Asia/Colombo", hour12: false });
};

function AppointmentDCHistory() {
  const [history, setHistory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("");

  const fetchHistory = async () => {
    try {
      // Multiple API calls: completed, rejected, cancelled
      const [cioRes, rejectedRes, cancelledRes] = await Promise.all([
        api.get("/checkInOut/history"), // Completed
        api.get("/careCustomers/status/Rejected"),
        api.get("/careCustomers/status/Cancelled")
      ]);

      const cioHistory = (cioRes.data.history || []).map((rec) => ({
        _id: rec._id,
        ownerName: rec.appointment?.ownerName || "-",
        petName: rec.appointment?.petName || "-",
        status: rec.appointment?.status || "Completed",
        checkInTime: rec.checkInTime,
        checkOutTime: rec.checkOutTime,
        createdAt: rec.checkInTime,
        services: [
          rec.appointment?.grooming ? "Grooming" : null,
          rec.appointment?.walking ? "Walking" : null
        ].filter(Boolean)
      }));

      const rejectedCancelled = [
        ...(rejectedRes.data.careCustomers || []),
        ...(cancelledRes.data.careCustomers || [])
      ].map((appt) => ({
        _id: appt._id,
        ownerName: appt.ownerName,
        petName: appt.petName,
        status: appt.status,
        checkInTime: null,
        checkOutTime: null,
        createdAt: appt.createdAt,
        services: [
          appt.grooming ? "Grooming" : null,
          appt.walking ? "Walking" : null
        ].filter(Boolean)
      }));

      setHistory([...cioHistory, ...rejectedCancelled]);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const applyFilters = useCallback(() => {
    let data = [...history];

    if (statusFilter !== "All") data = data.filter((rec) => rec.status === statusFilter);

    if (search.trim()) {
      data = data.filter(
        (rec) =>
          rec.ownerName.toLowerCase().includes(search.toLowerCase()) ||
          rec.petName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (monthFilter) {
      const [year, month] = monthFilter.split("-");
      data = data.filter((rec) => {
        const date = rec.checkOutTime || rec.checkInTime || rec.createdAt;
        const dt = new Date(date);
        return dt.getFullYear() === Number(year) && dt.getMonth() + 1 === Number(month);
      });
    }

    data.sort(
      (a, b) =>
        new Date(b.checkOutTime || b.checkInTime || b.createdAt) -
        new Date(a.checkOutTime || a.checkInTime || a.createdAt)
    );

    setFiltered(data);
  }, [history, search, statusFilter, monthFilter]);

  useEffect(() => { fetchHistory(); }, []);
  useEffect(() => { applyFilters(); }, [applyFilters]);

  const exportToExcel = () => {
    const ws = utils.json_to_sheet(
      filtered.map((rec) => ({
        Owner: rec.ownerName,
        Pet: rec.petName,
        Status: rec.status,
        "Check-In": formatDateTimeSL(rec.checkInTime),
        "Check-Out": formatDateTimeSL(rec.checkOutTime),
        Services: rec.services.join(", ") || "-"
      }))
    );
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "AppointmentHistory");
    writeFile(wb, "AppointmentHistory.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Appointment History Report", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [["Owner", "Pet", "Status", "Check-In", "Check-Out", "Services"]],
      body: filtered.map((rec) => [
        rec.ownerName,
        rec.petName,
        rec.status,
        formatDateTimeSL(rec.checkInTime),
        formatDateTimeSL(rec.checkOutTime),
        rec.services.join(", ") || "-"
      ])
    });
    doc.save("AppointmentHistory.pdf");
  };

  return (
    <div className="Ahistory-container">
      <h2>Appointment History</h2>
      <div className="history-controls">
        <input
          type="text"
          placeholder="Search by owner or pet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Rejected">Rejected</option>
        </select>
        <input
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        />
        <button onClick={exportToExcel}>Export Excel</button>
        <button onClick={exportToPDF}>Export PDF</button>
      </div>

      {filtered.length > 0 ? (
        <table className="history-table">
          <thead>
            <tr>
              <th>Owner</th>
              <th>Pet</th>
              <th>Status</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Services</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((rec) => (
              <tr key={rec._id}>
                <td>{rec.ownerName}</td>
                <td>{rec.petName}</td>
                <td>
                  <span className={`status-badge ${rec.status.toLowerCase()}`}>
                    {rec.status}
                  </span>
                </td>
                <td>{formatDateTimeSL(rec.checkInTime)}</td>
                <td>{formatDateTimeSL(rec.checkOutTime)}</td>
                <td>{rec.services.length > 0 ? rec.services.join(", ") : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No appointment history found.</p>
      )}
    </div>
  );
}

export default AppointmentDCHistory;
