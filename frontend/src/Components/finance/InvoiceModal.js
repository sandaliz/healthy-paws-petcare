import React from "react";
import "./css/InvoiceModal.css";

export default function InvoiceModal({ invoice, onClose }) {
  if (!invoice) return null;

  return (
    <div className="invmodal-overlay">
      <div className="invmodal-box">
        <div className="invmodal-hero">
          <div className="invmodal-badge">✅</div>
          <h2 className="invmodal-title">Order Placed!</h2>
          <p className="invmodal-subtitle">Here are your invoice details.</p>
        </div>

        <div className="invmodal-details">
          <div className="invmodal-row">
            <span className="invmodal-label">Invoice No</span>
            <span className="invmodal-value">{invoice.invoiceID}</span>
          </div>
          <div className="invmodal-row">
            <span className="invmodal-label">Status</span>
            <span className={`invmodal-pill ${invoice.status.toLowerCase()}`}>
              {invoice.status}
            </span>
          </div>
          <div className="invmodal-row">
            <span className="invmodal-label">Due Date</span>
            <span className="invmodal-value">
              {new Date(invoice.dueDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="invmodal-items">
          <h3 className="invmodal-items-title">Items</h3>
          <table className="invmodal-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((li, idx) => (
                <tr key={idx}>
                  <td>{li.description}</td>
                  <td>{li.quantity}</td>
                  <td>LKR {li.unitPrice.toFixed(2)}</td>
                  <td className="invmodal-right">LKR {li.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invmodal-summary">
          <div className="invmodal-row">
            <span>Subtotal</span>
            <span>LKR {invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="invmodal-row">
            <span>Tax (8%)</span>
            <span>LKR {invoice.tax.toFixed(2)}</span>
          </div>
          <div className="invmodal-row grand">
            <span>Total</span>
            <span>LKR {invoice.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="invmodal-footer">
          <button className="invmodal-btn primary">Pay on Delivery</button>
          <button className="invmodal-btn ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}