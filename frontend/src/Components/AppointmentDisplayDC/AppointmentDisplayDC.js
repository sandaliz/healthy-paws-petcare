import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AppointmentDisplayDC.css';

function AppointmentDisplayDC() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/careCustomers/${id}`)
            .then(res => setAppointment(res.data.careCustomer))
            .catch(err => console.error(err));
    }, [id]);

    if (!appointment) return <p>Loading...</p>;

    return (
        <div className="appointment-details-container">
  <h2>Appointment Details</h2>

  <div className="detail-card"><b>Owner Name:</b> {appointment.ownerName}</div>
  <div className="detail-card"><b>Contact Number:</b> {appointment.contactNumber}</div>
  <div className="detail-card"><b>Email:</b> {appointment.email}</div>
  <div className="detail-card"><b>Pet Name:</b> {appointment.petName}</div>
  <div className="detail-card"><b>Species:</b> {appointment.species}</div>
  <div className="detail-card"><b>Drop Off Date:</b> {new Date(appointment.dateStay).toLocaleDateString()}</div>
  <div className="detail-card"><b>Pick Up Date:</b> {new Date(appointment.pickUpDate).toLocaleDateString()}</div>
  <div className="detail-card"><b>Nights Stay:</b> {appointment.nightsStay}</div>
  <div className="detail-card"><b>Food Type:</b> {appointment.foodType}</div>
  <div className="detail-card"><b>Feeding Times:</b> {appointment.feedingTimes}</div>
  <div className="detail-card"><b>Grooming:</b> {appointment.grooming ? 'Yes' : 'No'}</div>
  <div className="detail-card"><b>Walking:</b> {appointment.walking ? 'Yes' : 'No'}</div>
  <div className="detail-card"><b>Emergency Action:</b> {appointment.emergencyAction}</div>
  <div className="detail-card"><b>Status:</b> {appointment.status}</div>

  <div className="appointment-buttons">
    <button onClick={() => navigate(`/updateAppointmentDC/${id}`)}>Update</button>
    <button onClick={() => navigate(`/payment/${id}`)}>Payment</button>
    <button onClick={() => navigate('/daycare')}>Back to Daycare</button>
  </div>
</div>
    );
}

export default AppointmentDisplayDC;
