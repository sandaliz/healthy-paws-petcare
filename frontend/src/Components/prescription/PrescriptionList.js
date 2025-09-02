import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import { QRCodeCanvas } from "qrcode.react";
import "./PrescriptionList.css";   

Modal.setAppElement("#root");

function PrescriptionList() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [email, setEmail] = useState("");
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/prescriptions")
      .then((res) => setPrescriptions(res.data))
      .catch((err) => console.error("Error fetching prescriptions:", err));
  }, []);

  const openQR = (prescription) => {
    setSelectedPrescription(prescription);
    setShowQR(true);
  };

  const closeQR = () => {
    setShowQR(false);
    setEmail("");
    setSelectedPrescription(null);
  };

  const sendEmail = async () => {
    try {
      await axios.post("http://localhost:5000/send-prescription", {
        email,
        prescriptionId: selectedPrescription._id,
      });
      alert("✅ QR sent to customer successfully!");
      closeQR();
    } catch (err) {
      console.error("Error sending email:", err);
      alert("❌ Failed to send email");
    }
  };

  if (!prescriptions.length) {
    return <h3 style={{ padding: "20px" }}>No prescriptions available ❌</h3>;
  }

  return (
    <div className="prescription-table-wrapper">
      <h2>Prescription List</h2>
      <table className="prescription-table">
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
                  className={`status-badge ${
                    p.status === "paid" ? "status-paid" : "status-pending"
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
                <div className="action-buttons">
                  {p.status === "pending" ? (
                    <button className="btn-send" onClick={() => openQR(p)}>
                      Send to Customer
                    </button>
                  ) : (
                    <button className="btn-paid" disabled>
                      Paid 
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ QR Modal */}
      <Modal
        isOpen={showQR}
        onRequestClose={closeQR}
        contentLabel="Send Prescription QR"
        style={{
          content: {
            padding: "20px",
            maxWidth: "400px",
            margin: "auto",
            borderRadius: "10px",
          },
        }}
      >
        <h3>Send Prescription</h3>
        {selectedPrescription && (
          <>
            <QRCodeCanvas
              value={`http://localhost:3000/cart/${selectedPrescription._id}`}
              size={200}
              includeMargin={true}
            />
            <p style={{ marginTop: "10px" }}>
              Scan this QR or click the link in your email to view your
              prescription.
            </p>
            <input
              type="email"
              placeholder="Enter Customer Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                display: "block",
                margin: "10px 0",
                padding: "6px",
                width: "100%",
              }}
            />
            <button onClick={sendEmail} className="btn-send">
              Send QR
            </button>
            <button onClick={closeQR} style={{ marginLeft: "10px", padding: "6px 10px" }}>
              Cancel
            </button>
          </>
        )}
      </Modal>
    </div>
  );
}

export default PrescriptionList;