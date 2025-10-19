import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from "../../utils/api";
import './AppointmentDisplayDC.css';

function AppointmentDisplayDC() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loadingPay, setLoadingPay] = useState(false);

  useEffect(() => {
    api
      .get(`/careCustomers/${id}`)
      .then((res) => setAppointment(res.data.careCustomer))
      .catch((err) => {
        console.error("Error fetching appointment:", err);
        if (err.response?.status === 401) navigate("/login");
      });
  }, [id, navigate]);

  const handlePayment = async () => {
    if (!appointment?.user) {
      alert("Login required or appointment not linked to user");
      return;
    }
    try {
      setLoadingPay(true);

      const res = await api.post("/api/finance/invoice/daycare", {
        careId: id,
        userID: appointment.user
      });

      const invoice = res.data?.invoice || res.invoice;
      if (invoice?._id) {
        navigate(`/pay/${invoice._id}`);
      } else {
        alert("Invoice not created");
      }
    } catch (err) {
      console.error("Error creating daycare invoice:", err);
      alert(err.response?.data?.message || "Failed to create invoice");
    } finally {
      setLoadingPay(false);
    }
  };

  if (!appointment) return <p>Loading...</p>;

  return (
    <div className="ad-disp-container">
      <h2>Appointment Details</h2>

      <div className="ad-disp-detail-card"><b>Owner Name:</b> {appointment.ownerName}</div>
      <div className="ad-disp-detail-card"><b>Contact Number:</b> {appointment.contactNumber}</div>
      <div className="ad-disp-detail-card"><b>Email:</b> {appointment.email}</div>
      <div className="ad-disp-detail-card"><b>Pet Name:</b> {appointment.petName}</div>
      <div className="ad-disp-detail-card"><b>Species:</b> {appointment.species}</div>
      <div className="ad-disp-detail-card"><b>Drop Off Date:</b> {new Date(appointment.dateStay).toLocaleDateString()}</div>
      <div className="ad-disp-detail-card"><b>Pick Up Date:</b> {new Date(appointment.pickUpDate).toLocaleDateString()}</div>
      <div className="ad-disp-detail-card"><b>Nights Stay:</b> {appointment.nightsStay}</div>
      <div className="ad-disp-detail-card"><b>Drop Off Time:</b> {appointment.dropOffTime}</div>
      <div className="ad-disp-detail-card"><b>Pick Up Time:</b> {appointment.pickUpTime}</div>
      <div className="ad-disp-detail-card"><b>Food Type:</b> {appointment.foodType}</div>
      <div className="ad-disp-detail-card"><b>Feeding Times:</b> {appointment.feedingTimes}</div>
      <div className="ad-disp-detail-card"><b>Grooming:</b> {appointment.grooming ? 'Yes' : 'No'}</div>
      <div className="ad-disp-detail-card"><b>Walking:</b> {appointment.walking ? 'Yes' : 'No'}</div>
      <div className="ad-disp-detail-card"><b>Emergency Action:</b> {appointment.emergencyAction}</div>
      <div className="ad-disp-detail-card"><b>Status:</b> {appointment.status}</div>

      <div className="ad-disp-buttons">
        <button className="ad-disp-btn" onClick={() => navigate(`/updateAppointmentDC/${id}`)}>Update</button>
        
        <button className="ad-disp-btn" onClick={handlePayment} disabled={loadingPay}>
          {loadingPay ? "Preparing Invoice…" : "Payment"}
        </button>
        
        <button className="ad-disp-btn" onClick={() => navigate('/daycare')}>Back to Daycare</button>
      </div>
    </div>
  );
}

export default AppointmentDisplayDC;