import React, { useState, useEffect } from "react";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../../../apis/appointmentApi";
import Navbar from "../UserHome/components/Nabar";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import "./UserAppointments.css";

const UserAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    petName: "",
    ownerName: "",
    petType: "",
    category: "GENERAL_CHECKUP",
    contact: "",
    contactEmail: "",
    appointmentDate: "",
    appointmentTime: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const response = await getAppointments();
      let appointments = response.appointments || [];
      appointments = appointments.filter(
        (appointment) => appointment.user._id === currentUser._id
      );
      setAppointments(appointments);
    } catch (err) {
      setError("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.petName.trim()) errors.petName = "Pet name is required";
    if (!formData.ownerName.trim()) errors.ownerName = "Owner name is required";
    if (!formData.petType.trim()) errors.petType = "Pet type is required";

    const phoneRegex = /^0\d{9}$/;

    if (!phoneRegex.test(formData.contact))
      errors.contact = "Valid phone number required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail))
      errors.contactEmail = "Valid email required";

    if (!formData.appointmentDate) errors.appointmentDate = "Date is required";

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.appointmentTime))
      errors.appointmentTime = "Valid time required (HH:mm)";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      if (editingAppointment) {
        await updateAppointment(editingAppointment._id, formData);
      } else {
        await createAppointment(formData);
      }
      await fetchAppointments();
      closeModal();
    } catch (err) {
      setError("Failed to save appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      petName: appointment.petName,
      ownerName: appointment.ownerName,
      petType: appointment.petType,
      category: appointment.category,
      contact: appointment.contact,
      contactEmail: appointment.contactEmail,
      appointmentDate: new Date(appointment.appointmentDate)
        .toISOString()
        .split("T")[0],
      appointmentTime: appointment.appointmentTime,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteAppointment(id);
      await fetchAppointments();
    } catch (err) {
      setError("Failed to delete appointment");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAppointment(null);
    setFormData({
      petName: "",
      ownerName: "",
      petType: "",
      category: "GENERAL_CHECKUP",
      contact: "",
      contactEmail: "",
      appointmentDate: "",
      appointmentTime: "",
    });
    setFormErrors({});
  };

  const generateReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Appointments Report", 20, 20);

    const tableData = appointments.map((apt) => [
      apt.petName,
      apt.ownerName,
      apt.petType,
      apt.category,
      new Date(apt.appointmentDate).toLocaleDateString(),
      apt.appointmentTime,
      apt.status,
    ]);

    autoTable(doc, {
      head: [
        ["Pet Name", "Owner", "Pet Type", "Category", "Date", "Time", "Status"],
      ],
      body: tableData,
      startY: 30,
    });

    doc.save("appointments-report.pdf");
  };
  const filteredAppointments = appointments.filter((appointment) =>
    appointment.appointmentId
      ?.toLowerCase()
      .includes(searchTerm.trim().toLowerCase())
  );

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="appointments-container">
        {error && <div className="error-message">{error}</div>}
        <div className="appointments-header">
          <h2>My Appointments</h2>
          <div className="header-actions">
            <input
              type="text"
              placeholder="Search by Appointment ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              New Appointment
            </button>
            <button className="btn-secondary" onClick={generateReport}>
              Generate Report
            </button>
          </div>
        </div>

        <div className="appointments-grid">
          {filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="appointment-card">
              <div className="appointment-header">
                <h3>{appointment.petName}</h3>
                <span className={`status ${appointment.status.toLowerCase()}`}>
                  {appointment.status}
                </span>
              </div>
              <div className="appointment-details">
                <p>
                  <strong>Appointment Id:</strong> {appointment.appointmentId}
                </p>
                <p>
                  <strong>Owner:</strong> {appointment.ownerName}
                </p>
                <p>
                  <strong>Pet Type:</strong> {appointment.petType}
                </p>
                <p>
                  <strong>Category:</strong> {appointment.category}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(appointment.appointmentDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong> {appointment.appointmentTime}
                </p>
                <p>
                  <strong>Contact:</strong> {appointment.contact}
                </p>
              </div>
              <div className="appointment-actions">
                <button
                  className="btn-edit"
                  onClick={() => handleEdit(appointment)}
                >
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(appointment._id)}
                >
                  Delete
                </button>
                <button
                  className="btn-edit"
                  onClick={() => {}}
                >
                  Pay
                </button>
                <button
                  className="btn-delete"
                  onClick={() =>{}}
                >
                  Prescription
                </button>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>
                  {editingAppointment ? "Edit Appointment" : "New Appointment"}
                </h3>
                <button className="modal-close" onClick={closeModal}>
                  &times;
                </button>
              </div>
              <div className="appointment-form">
                <div className="form-group">
                  <label>Pet Name</label>
                  <input
                    type="text"
                    value={formData.petName}
                    onChange={(e) =>
                      setFormData({ ...formData, petName: e.target.value })
                    }
                    className={formErrors.petName ? "error" : ""}
                  />
                  {formErrors.petName && (
                    <span className="error-text">{formErrors.petName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Owner Name</label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) =>
                      setFormData({ ...formData, ownerName: e.target.value })
                    }
                    className={formErrors.ownerName ? "error" : ""}
                  />
                  {formErrors.ownerName && (
                    <span className="error-text">{formErrors.ownerName}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Pet Type</label>
                  <select
                    value={formData.petType}
                    onChange={(e) =>
                      setFormData({ ...formData, petType: e.target.value })
                    }
                    className={formErrors.petType ? "error" : ""}
                  >
                    <option value="">Select a pet type</option>
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                  </select>
                  {formErrors.petType && (
                    <span className="error-text">{formErrors.petType}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="VACCINE">VACCINE</option>
                    <option value="SURGERY">SURGERY</option>
                    <option value="DENTAL">DENTAL</option>
                    <option value="GENERAL_CHECKUP">GENERAL_CHECKUP</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Contact</label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) =>
                      setFormData({ ...formData, contact: e.target.value })
                    }
                    className={formErrors.contact ? "error" : ""}
                  />
                  {formErrors.contact && (
                    <span className="error-text">{formErrors.contact}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                    className={formErrors.contactEmail ? "error" : ""}
                  />
                  {formErrors.contactEmail && (
                    <span className="error-text">
                      {formErrors.contactEmail}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={formData.appointmentDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appointmentDate: e.target.value,
                      })
                    }
                    className={formErrors.appointmentDate ? "error" : ""}
                  />
                  {formErrors.appointmentDate && (
                    <span className="error-text">
                      {formErrors.appointmentDate}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appointmentTime: e.target.value,
                      })
                    }
                    className={formErrors.appointmentTime ? "error" : ""}
                  />
                  {formErrors.appointmentTime && (
                    <span className="error-text">
                      {formErrors.appointmentTime}
                    </span>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleSubmit}
                  >
                    {editingAppointment ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAppointments;
