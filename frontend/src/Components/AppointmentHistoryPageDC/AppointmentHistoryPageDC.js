// src/pages/AppointmentHistoryPage.js
import React, { useState, useEffect } from 'react';
import AppointmentCardsContainer from '../AppointmentDC/AppointmentCardsContainer';
import api from '../../utils/api';

function AppointmentHistoryPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/careCustomers');
      setAppointments(res.data.careCustomers || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (appointmentId, newStatus) => {
    // Remove the cancelled appointment from the list
    setAppointments(prev => 
      prev.filter(appt => appt._id !== appointmentId)
    );
  };

  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  return (
    <div className="page-container">
      <h1>Appointment History</h1>
      <AppointmentCardsContainer 
        appointments={appointments}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

export default AppointmentHistoryPage;