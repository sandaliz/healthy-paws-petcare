import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PrescriptionList.css";

function PrescriptionList() {
  const [prescriptions, setPrescriptions] = useState([]);

  const fetchPrescriptions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/prescriptions");
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPrescriptions(sorted);
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  // ✅ Send email directly to ownerEmail
  const sendToCustomer = async (prescription) => {
    if (!prescription.ownerEmail) {
      alert("❌ No customer email found for this prescription.");
      return;
    }

    // ✅ Confirmation box before sending
    const confirmSend = window.confirm(
      `Do you want to send this prescription to ${prescription.ownerEmail}?`
    );

    if (!confirmSend) return;

    try {
      await axios.post("http://localhost:5000/send-prescription", {
        email: prescription.ownerEmail,
        prescriptionId: prescription._id,
      });
      alert(`✅ Prescription sent to ${prescription.ownerEmail}`);
      fetchPrescriptions(); // refresh list
    } catch (err) {
      console.error("Error sending email:", err);
      alert("❌ Failed to send prescription");
    }
  };

  if (!prescriptions.length) {
    return <h3 style={{ padding: "20px" }}>No prescriptions available ❌</h3>;
  }

  return (
    <div className="pl-table-wrapper">
      <h2>Prescription List</h2>
      <table className="pl-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Items</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {prescriptions.map((p) => (
            <tr key={p._id}>
              <td>{p._id.slice(0, 6)}</td>
              <td>
                <span
                  className={`pl-status-badge ${
                    p.status === "paid" ? "pl-status-paid" : "pl-status-pending"
                  }`}
                >
                  {p.status}
                </span>
              </td>
              <td>
                <ul>
                  {p.items.map((item, i) => (
                    <li key={i}>
                      {item.productName} × {item.quantity} | Rs.{item.cost}
                    </li>
                  ))}
                </ul>
              </td>
              <td>
                <div className="pl-action-buttons">
                  {p.status === "pending" ? (
                    <button
                      className="pl-btn-send"
                      onClick={() => sendToCustomer(p)}
                    >
                      Send to Customer
                    </button>
                  ) : (
                    <button className="pl-btn-paid" disabled>
                      Paid
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PrescriptionList;