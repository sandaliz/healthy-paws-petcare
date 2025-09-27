import React, { useState, useEffect } from 'react';
//import axios from 'axios';
import api from '../../utils/api';
import AppointmentDC from '../AppointmentDC/appointmentDC';



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

  
  const handleDelete = (id) => {
    setCareCustomers((prev) => prev.filter((cust) => cust._id !== id));
  };

  return (
    <div>
      {careCustomers && careCustomers.length > 0 ? (
        careCustomers.map((careCustomer) => (
          <div key={careCustomer._id}>
            <AppointmentDC careCustomer={careCustomer} onDelete={handleDelete} />
          </div>
        ))
      ) : (
        <p>No appointments found.</p>
      )}
    </div>
  );
}

export default AppointmentDCs;