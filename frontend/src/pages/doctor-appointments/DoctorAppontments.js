import React, { useState, useEffect } from "react";
import { getAppointments, updateAppointment } from "../../apis/appointmentApi";
import "./DoctorAppointments.css";
import jsPDF from "jspdf";
import {autoTable}from "jspdf-autotable";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    // Filter appointments based on search term (owner name or appointment ID)
    if (searchTerm.trim() === "") {
      setFilteredAppointments(appointments);
    } else {
      const searchTermLower = searchTerm.toLowerCase();
      const filtered = appointments.filter(
        (apt) =>
          apt.appointmentId.toLowerCase().includes(searchTermLower) ||
          apt.ownerName.toLowerCase().includes(searchTermLower)
      );
      setFilteredAppointments(filtered);
    }
  }, [searchTerm, appointments]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAppointments();
      setAppointments(response.appointments || []);
      setFilteredAppointments(response.appointments || []);
    } catch (err) {
      setError("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      setUpdating(appointmentId);
      await updateAppointment(appointmentId, { status: newStatus });
      setAppointments(
        appointments.map((apt) =>
          apt._id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );
    } catch (err) {
      setError("Failed to update appointment status");
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const time = new Date();
    time.setHours(hours, minutes);
    return time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "#ffc107";
      case "CONFIRMED":
        return "#28a745";
      case "CANCELLED":
        return "#dc3545";
      case "COMPLETED":
        return "#007bff";
      default:
        return "#6c757d";
    }
  };

  const handlePrescription = (appointmentId) => {
    console.log("Prescription for appointment:", appointmentId);
    // Future implementation: Navigate to prescription page or open prescription modal
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(84, 65, 60); // Dark Brown - secondary color
    doc.text("Patient Appointments Report", 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Define the table columns
    const tableColumn = [
      "Appointment ID", 
      "Pet Name", 
      "Owner", 
      "Date", 
      "Time", 
      "Category", 
      "Status"
    ];
    
    // Define the table rows
    const tableRows = [];
    
    // Add data to rows
    filteredAppointments.forEach(appointment => {
      const appointmentData = [
        appointment.appointmentId,
        appointment.petName,
        appointment.ownerName,
        formatDate(appointment.appointmentDate),
        formatTime(appointment.appointmentTime),
        appointment.category.replace("_", " "),
        appointment.status
      ];
      tableRows.push(appointmentData);
    });
    
    // Generate the table
    autoTable(doc,{
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [200, 200, 200]
      },
      headStyles: {
        fillColor: [84, 65, 60], // Dark Brown - secondary color
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Add summary
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setTextColor(84, 65, 60);
    doc.text(`Total Appointments: ${filteredAppointments.length}`, 14, finalY);
    doc.text(`Pending: ${filteredAppointments.filter(apt => apt.status === "PENDING").length}`, 14, finalY + 7);
    doc.text(`Confirmed: ${filteredAppointments.filter(apt => apt.status === "CONFIRMED").length}`, 14, finalY + 14);
    doc.text(`Completed: ${filteredAppointments.filter(apt => apt.status === "COMPLETED").length}`, 14, finalY + 21);
    doc.text(`Cancelled: ${filteredAppointments.filter(apt => apt.status === "CANCELLED").length}`, 14, finalY + 28);
    
    // Save the PDF
    doc.save("appointments-report.pdf");
  };

  if (loading) return <div className="loading">Loading appointments...</div>;

  return (
    <div className="doctor-appointments-container">
      <div className="appointments-header">
        <h1>Appointments</h1>
        <div className="header-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by Owner Name or Appointment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="search-button">
              <i className="search-icon">🔍</i>
            </button>
          </div>
       
          <div className="stats">
            <div className="stat-item">
              <span className="stat-number">{filteredAppointments.length}</span>
              <span className="stat-label">Showing</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{appointments.length}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {appointments.filter((apt) => apt.status === "PENDING").length}
              </span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{appointments.filter((apt) => apt.status === "CONFIRMED").length}</span>
              <span className="stat-label">Confirmed</span>
            </div>
          </div>
        </div>
      </div>
   <div style={{display: "flex", justifyContent: "flex-end",marginBottom:10}}>
    <button className="generate-pdf-button" onClick={generatePDF}>
            Generate PDF Report
          </button>
   </div>
      {error && <div className="error-message">{error}</div>}

      <div className="appointments-table">
        <div className="table-header">
          <div className="header-cell">Appointment ID</div>
          <div className="header-cell">Pet Info</div>
          <div className="header-cell">Owner Info</div>
          <div className="header-cell">Appointment</div>
          <div className="header-cell">Category</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Actions</div>
          <div className="header-cell">Prescription</div>
        </div>

        {filteredAppointments.map((appointment) => (
          <div key={appointment._id} className="table-row">
            <div className="cell appointment-id">
              <div className="appointment-id-value">
                {appointment.appointmentId}
              </div>
            </div>

            <div className="cell pet-info">
              <div className="pet-name">{appointment.petName}</div>
              <div className="pet-type">{appointment.petType}</div>
            </div>

            <div className="cell owner-info">
              <div className="owner-name">{appointment.ownerName}</div>
              <div className="owner-contact">{appointment.contact}</div>
              <div className="owner-email">{appointment.contactEmail}</div>
            </div>

            <div className="cell appointment-info">
              <div className="appointment-date">
                {formatDate(appointment.appointmentDate)}
              </div>
              <div className="appointment-time">
                {formatTime(appointment.appointmentTime)}
              </div>
            </div>

            <div className="cell category">
              <span
                className={`category-badge ${appointment.category.toLowerCase()}`}
              >
                {appointment.category.replace("_", " ")}
              </span>
            </div>

            <div className="cell status">
              <span
                className={`status-badge ${appointment.status.toLowerCase()}`}
                style={{ backgroundColor: getStatusColor(appointment.status) }}
              >
                {appointment.status}
              </span>
            </div>

            <div className="cell actions">
              <select
                className="status-dropdown"
                value={appointment.status}
                onChange={(e) =>
                  handleStatusUpdate(appointment._id, e.target.value)
                }
                disabled={updating === appointment._id}
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
              {updating === appointment._id && (
                <div className="updating-spinner">Updating...</div>
              )}
            </div>
            
            <div className="cell prescription">
              <button 
                className="prescription-button"
                onClick={() => handlePrescription(appointment._id)}
              >
                Prescription
              </button>
            </div>
          </div>
        ))}

        {filteredAppointments.length === 0 && (
          <div className="no-appointments">
            <h3>
              {searchTerm
                ? "No matching appointments found"
                : "No appointments found"}
            </h3>
            <p>
              {searchTerm
                ? `No appointments found matching "${searchTerm}"`
                : "No patient appointments to display"}
            </p>
            {searchTerm && (
              <button
                className="clear-search-button"
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
