import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";
import "./PrescriptionForm.css"; // ✅ custom CSS file

function PrescriptionForm() {
  const { appointmentId } = useParams();
  const location = useLocation();
  const ownerEmail = location.state?.ownerEmail || "";

  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ productMongoId: "", quantity: 1 }]);
  const [existingPrescriptions, setExistingPrescriptions] = useState([]);
  const [message, setMessage] = useState("");

  // ✅ Fetch products
  useEffect(() => {
    axios
      .get("http://localhost:5000/products")
      .then((res) => {
        if (Array.isArray(res.data)) setProducts(res.data);
        else if (Array.isArray(res.data.products)) setProducts(res.data.products);
        else setProducts([]);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setProducts([]);
      });
  }, []);

  // ✅ Fetch prescriptions for appointment
  useEffect(() => {
    axios
      .get(`http://localhost:5000/prescriptions/appointment/${appointmentId}`)
      .then((res) => setExistingPrescriptions(res.data))
      .catch((err) => {
        console.error("Error fetching prescriptions:", err);
        setExistingPrescriptions([]);
      });
  }, [appointmentId]);

  // Add row
  const addRow = () => {
    setItems([...items, { productMongoId: "", quantity: 1 }]);
  };

  // Update field
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Submit new prescription
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { appointmentId, ownerEmail, items };

    try {
      await axios.post("http://localhost:5000/prescriptions", payload);
      setMessage("✅ Prescription saved successfully!");
      setItems([{ productMongoId: "", quantity: 1 }]);

      // Refresh prescriptions
      const updated = await axios.get(
        `http://localhost:5000/prescriptions/appointment/${appointmentId}`
      );
      setExistingPrescriptions(updated.data);
    } catch (err) {
      console.error("Error saving prescription:", err);
      setMessage("❌ Failed to save prescription");
    }
  };

  return (
    <div className="pf-container">
      <h2>Create Prescription</h2>

      <div className="pf-context-info">
        <p><strong>Appointment ID:</strong> {appointmentId}</p>
        <p><strong>Owner Email:</strong> {ownerEmail}</p>
      </div>

      {message && (
        <p className={`pf-message ${message.startsWith("✅") ? "success" : "error"}`}>
          {message}
        </p>
      )}

      {/* Form */}
      <form className="pf-form" onSubmit={handleSubmit}>
        {items.map((item, i) => (
          <div key={i} className="pf-form-row">
            <select
              value={item.productMongoId}
              onChange={(e) => updateItem(i, "productMongoId", e.target.value)}
              required
            >
              <option value="">Select Medicine</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (Stock: {p.currantStock})
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
              required
            />

            {i === items.length - 1 && (
              <button type="button" className="pf-add-btn" onClick={addRow}>
                +
              </button>
            )}
          </div>
        ))}

        <button type="submit" className="pf-save-btn">Save Prescription</button>
      </form>

      {/* Existing Prescription List */}
      <div className="pf-existing">
        <h3>Existing Prescriptions</h3>
        {existingPrescriptions.length > 0 ? (
          existingPrescriptions.map((p, index) => (
            <div key={p._id} className="pf-prescription">
              <p>
                <strong>Prescription #{index + 1}</strong> —{" "}
                {new Date(p.createdAt).toLocaleString()}
              </p>
              <ul>
                {p.items.map((it, idx) => (
                  <li key={idx}>
                    {it.productName} × {it.quantity} — Rs.{it.cost}
                  </li>
                ))}
              </ul>
              <p>
                Status:{" "}
                <span className={`pf-status ${p.status.toLowerCase()}`}>
                  {p.status}
                </span>
              </p>
            </div>
          ))
        ) : (
          <p>No prescriptions yet for this appointment ❌</p>
        )}
      </div>
    </div>
  );
}

export default PrescriptionForm;