// src/Components/DashboardDC/AppointmentDCHistory/AppointmentDCHistory.js
import React, { useEffect, useState, useCallback } from "react";
import api from "../../../utils/api";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import "./AppointmentDCHistory.css";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const [cioRes, rejectedRes, cancelledRes] = await Promise.all([
        api.get("/checkInOut/history"),
        api.get("/careCustomers/status/Rejected"),
        api.get("/careCustomers/status/Cancelled"),
      ]);

      const cioHistory = (cioRes.data.history || []).map((rec) => {
        const appointmentId =
          rec.appointment?._id ||
          (typeof rec.appointment === "string" ? rec.appointment : null) ||
          rec.appointment?.id ||
          rec.appointment;

        return {
          _id: rec._id,
          appointmentId,
          ownerName: rec.appointment?.ownerName || "-",
          petName: rec.appointment?.petName || "-",
          status: rec.appointment?.status || "Completed",
          checkInTime: rec.checkInTime,
          checkOutTime: rec.checkOutTime,
          createdAt: rec.checkInTime,
          services: [
            rec.appointment?.grooming ? "Grooming" : null,
            rec.appointment?.walking ? "Walking" : null,
          ].filter(Boolean),
        };
      });

      const rejectedCancelled = [
        ...(rejectedRes.data.careCustomers || []),
        ...(cancelledRes.data.careCustomers || []),
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
          appt.walking ? "Walking" : null,
        ].filter(Boolean),
      }));

      setHistory([...cioHistory, ...rejectedCancelled]);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load appointment history");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.delete(`/careCustomers/${id}`);
      setHistory((prev) => prev.filter((rec) => rec._id !== id));
      alert("Record deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Failed to delete record");
    }
  };

  const applyFilters = useCallback(() => {
    let data = [...history];

    if (statusFilter !== "All")
      data = data.filter((rec) => rec.status === statusFilter);

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
        return (
          dt.getFullYear() === Number(year) &&
          dt.getMonth() + 1 === Number(month)
        );
      });
    }

    data.sort(
      (a, b) =>
        new Date(b.checkOutTime || b.checkInTime || b.createdAt) -
        new Date(a.checkOutTime || a.checkInTime || a.createdAt)
    );

    setFiltered(data);
    setCurrentPage(1); // reset pagination when filters change
  }, [history, search, statusFilter, monthFilter]);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filtered.slice(indexOfFirstRecord, indexOfLastRecord);

  const nextPage = () => currentPage < totalPages && setCurrentPage((p) => p + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);

  // Export to Excel
  const exportToExcel = () => {
    try {
      const ws = utils.json_to_sheet(
        filtered.map((rec) => ({
          Owner: rec.ownerName,
          Pet: rec.petName,
          Status: rec.status,
          "Check-In": formatDateTimeSL(rec.checkInTime),
          "Check-Out": formatDateTimeSL(rec.checkOutTime),
          Services: rec.services.join(", ") || "-",
        }))
      );
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "AppointmentHistory");
      writeFile(wb, "AppointmentHistory.xlsx");
      alert("Excel file downloaded successfully!");
    } catch (err) {
      console.error("Excel export error:", err);
      alert("Error exporting to Excel");
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const logo = new Image();
      logo.src = `${window.location.origin}/images/HPlogo.png`;

      logo.onload = () => {
        doc.addImage(logo, "PNG", 14, 10, 25, 25);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Appointment History Report", 105, 20, { align: "center" });

        doc.setFontSize(10);
        const generatedDate = new Date().toLocaleString("en-GB", {
          timeZone: "Asia/Colombo",
        });
        doc.text(`Generated on: ${generatedDate}`, 195, 12, { align: "right" });

        doc.setLineWidth(0.5);
        doc.line(14, 38, 195, 38);

        autoTable(doc, {
          startY: 45,
          head: [["Owner", "Pet", "Status", "Check-In", "Check-Out", "Services"]],
          body: filtered.map((rec) => [
            rec.ownerName,
            rec.petName,
            rec.status,
            formatDateTimeSL(rec.checkInTime),
            formatDateTimeSL(rec.checkOutTime),
            rec.services.join(", ") || "-",
          ]),
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [84, 65, 60], textColor: 255 },
        });

        doc.save("AppointmentHistory.pdf");
        alert("PDF file downloaded successfully!");
      };
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Error exporting to PDF");
    }
  };

  if (loading)
    return (
      <div className="Ahistory-container">
        <p>Loading appointment history...</p>
      </div>
    );

  if (error)
    return (
      <div className="Ahistory-container">
        <p>{error}</p>
        <button onClick={fetchHistory}>Try Again</button>
      </div>
    );

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
          <option value="All">All Status</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Rejected">Rejected</option>
        </select>
        <input
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        />
        <div className="export-buttons">
          <button onClick={exportToExcel}>Export Excel</button>
          <button onClick={exportToPDF}>Export PDF</button>
        </div>
      </div>

      {currentRecords.length > 0 ? (
        <>
          <table className="history-table">
            <thead>
              <tr>
                <th>Owner</th>
                <th>Pet</th>
                <th>Status</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Services</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((rec) => (
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
                  <td>
                    {rec.status === "Completed" && (
                      <button
                        className="DC-btn-approve"
                        onClick={() =>
                          navigate(`/dashboardDC/dailylog-history/${rec.appointmentId || rec._id}`)
                        }
                      >
                        Daily Logs
                      </button>
                    )}
                    <button
                      className="DC-btn-reject"
                      onClick={() => handleDelete(rec._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button onClick={prevPage} disabled={currentPage === 1}>
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button onClick={nextPage} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </>
      ) : (
        <p>No appointment history found matching your filters.</p>
      )}
    </div>
  );
}

export default AppointmentDCHistory;
