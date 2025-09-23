import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AppointmentDC from '../AppointmentDC/appointmentDC';

const URL = "http://localhost:5000/careCustomers";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
}

function AppointmentDCs() {
  const [careCustomers, setCareCustomers] = useState([]);

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