// src/Components/DashboardDC/AppointmentCardsContainer.js
import React from 'react';
import AppointmentDC from './appointmentDC';
import './AppointmentDC.css'; // Same CSS file

function AppointmentCardsContainer({ appointments, onStatusChange }) {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="appointment-cards-container">
        <div className="appointment-cards-empty">
          <h3>No Appointments Found</h3>
          <p>No appointment history available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-cards-container">
      {appointments.map((appointment) => (
        <AppointmentDC
          key={appointment._id}
          careCustomer={appointment}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}

export default AppointmentCardsContainer;