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

  return (
    <div>
      <h1>Owner details</h1>
      {careCustomers && careCustomers.map((careCustomer, i) => (
          <div key={i}>
            <AppointmentDC user={careCustomer} />
          </div>
        ))
      }
    </div>
  );
}

export default AppointmentDCs;