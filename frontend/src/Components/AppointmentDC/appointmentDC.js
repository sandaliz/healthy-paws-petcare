import React from 'react';
import './AppointmentDC.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function AppointmentDC({ careCustomer, onDelete }) {
  const {
    _id,
    ownerName,
    contactNumber,
    email,
    petName,
    species,
    healthDetails,
    dateStay,
    pickUpDate,
    nightsStay,
    dropOffTime,
    pickUpTime,
    foodType,
    feedingTimes,
    grooming,
    walking,
    emergencyAction,
    status,
    agree
  } = careCustomer;

  const navigate = useNavigate();

  const deleteHandler = async () => {
    try {
      await axios.delete(`http://localhost:5000/careCustomers/${_id}`);
      onDelete(_id); // update parent state immediately
    } catch (err) {
      console.error("Error deleting appointment:", err);
      alert("Failed to delete appointment. Please try again.");
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return date;
    }
  };

  const handleReschedule = () => {
    console.log('Rescheduling appointment:', _id);
    alert(`Reschedule appointment ${_id}`);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      deleteHandler();
    }
  };

  const handleViewLogs = () => {
    // Navigate to daycare logs page for this appointment
    navigate(`/daycareLogs/${_id}`);
  };

  return (
    <div className="appointment-container">
      <div className="appointment-header">
        <h2>Appointment Details</h2>
        <div className="appointment-id">ID: {_id}</div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <Link to={`/appointmentDC/${_id}`}>
          <button 
            className="btn-reschedule"
            onClick={handleReschedule}
            disabled={status === 'pending'}
          >
            Reschedule
          </button>
        </Link>
        <button 
          className="btn-cancel"
          onClick={handleCancel}
          disabled={status === 'cancelled'}
        >
          Cancel
        </button>
        <button 
          className="btn-view-logs"
          onClick={handleViewLogs}
        >
          View Daycare Logs
        </button>
      </div>

      {/* Status Badge */}
      <div className={`status-badge status-${status}`}>
        {status?.toLowerCase() || 'Pending'}
      </div>

      {/* Contact Information */}
      <div className="appointment-section">
        <h3 className="section-title">Contact Information</h3>
        <div className="detail-grid">
          <div className="detail-item"><span className="detail-label">Owner Name</span><div className="detail-value">{ownerName}</div></div>
          <div className="detail-item"><span className="detail-label">Contact Number</span><div className="detail-value">{contactNumber}</div></div>
          <div className="detail-item"><span className="detail-label">Email</span><div className="detail-value">{email}</div></div>
        </div>
      </div>

      {/* Pet Information */}
      <div className="appointment-section">
        <h3 className="section-title">Pet Information</h3>
        <div className="detail-grid">
          <div className="detail-item"><span className="detail-label">Pet Name</span><div className="detail-value">{petName}</div></div>
          <div className="detail-item"><span className="detail-label">Species</span><div className="detail-value">{species}</div></div>
        </div>
        <div className="detail-item"><span className="detail-label">Health Details</span><div className="detail-value">{healthDetails}</div></div>
      </div>

      {/* Stay Information */}
      <div className="appointment-section">
        <h3 className="section-title">Stay Details</h3>
        <div className="detail-grid">
          <div className="detail-item"><span className="detail-label">Drop off date</span><div className="detail-value">{formatDate(dateStay)}</div></div>
          <div className="detail-item"><span className="detail-label">Pick up date</span><div className="detail-value">{formatDate(pickUpDate)}</div></div>
          <div className="detail-item"><span className="detail-label">Nights Stay</span><div className="detail-value">{nightsStay}</div></div>
          <div className="detail-item"><span className="detail-label">Drop Off Time</span><div className="detail-value">{dropOffTime}</div></div>
          <div className="detail-item"><span className="detail-label">Pick Up Time</span><div className="detail-value">{pickUpTime}</div></div>
        </div>
      </div>

      {/* Feeding Information */}
      <div className="appointment-section">
        <h3 className="section-title">Feeding Information</h3>
        <div className="detail-grid">
          <div className="detail-item"><span className="detail-label">Food Type</span><div className="detail-value">{foodType}</div></div>
          <div className="detail-item"><span className="detail-label">Feeding Times</span><div className="detail-value">{feedingTimes}</div></div>
        </div>
      </div>

      {/* Services */}
      <div className="appointment-section">
        <h3 className="section-title">Additional Services</h3>
        <div className="detail-grid">
          <div className="detail-item"><span className="detail-label">Grooming</span><div className={`detail-value ${grooming ? 'boolean-yes' : 'boolean-no'}`}>{grooming ? 'Yes' : 'No'}</div></div>
          <div className="detail-item"><span className="detail-label">Walking</span><div className={`detail-value ${walking ? 'boolean-yes' : 'boolean-no'}`}>{walking ? 'Yes' : 'No'}</div></div>
        </div>
      </div>

      {/* Emergency & Agreement */}
      <div className="appointment-section">
        <div className="emergency-info"><span className="detail-label">Emergency Action Plan</span><div className="detail-value">{emergencyAction}</div></div>
        <div className="agreement-status"><span className="detail-label">Terms Agreement</span><div className={`detail-value ${agree ? 'boolean-yes' : 'boolean-no'}`}>{agree ? 'Agreed' : 'Not Agreed'}</div></div>
        <div className="emergency-info"><span className="detail-label">Status</span><div className="detail-value">{status}</div></div>
      </div>
    </div>
  );
}

export default AppointmentDC;