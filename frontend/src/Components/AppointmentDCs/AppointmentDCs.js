import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import AppointmentCardsContainer from '../AppointmentDC/AppointmentCardsContainer'; // Import the container



function AppointmentDCs() {
  const [careCustomers, setCareCustomers] = useState([]);

  const fetchHandler = async () => {
    try {
      const res = await api.get('/careCustomers');
      return res.data;
    } catch (err) {
      console.error('Error fetching appointments:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchHandler().then((data) => {
      if (data && data.careCustomers) {
        setCareCustomers(data.careCustomers);
      }
    });
  }, []);

  // CHANGED: Updated to handle status changes (cancelled appointments)
  const handleStatusChange = (appointmentId, newStatus) => {
    setCareCustomers((prev) => prev.filter((cust) => cust._id !== appointmentId));
  };

  return (
    <div className="appointment-history-page-dc">
      {/* ADDED: Page title */}
      <div className="page-header-dc">
        <h1 className="page-title-dc">Appointment History</h1>
        <p className="page-subtitle-dc">View and manage all your pet care appointments</p>
      </div>

      <AppointmentCardsContainer
        appointments={careCustomers}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

export default AppointmentDCs;