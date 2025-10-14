import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/financeApi';
import useAuthUser from '../hooks/useAuthUser';
import '../css/clientPay.css';
import html2pdf from 'html2pdf.js';

export default function PaySuccess() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const invoiceId = params.get('invoice') || '';
  const amountParam = params.get('amount') || '';
  const emailParam = params.get('email') || '';
  const newPaymentId = params.get('new') || '';

  const [invoice, setInvoice] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(!!invoiceId);

  const { user: authUser, loading: authLoading, error: authError } = useAuthUser();
  const ownerId = authUser?._id || '';
  const pdfRef = useRef();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);

        if (invoiceId) {
          const inv = await api.get(`/invoice/${invoiceId}`);
          if (!cancelled) setInvoice(inv);
        }

        if (newPaymentId) {
          // Fetch all user payments and match against both _id and business paymentID
          const payRes = await api.get(`/payments?userId=${ownerId}`);
          const match = payRes.payments.find(
            p => String(p._id) === String(newPaymentId) || String(p.paymentID) === String(newPaymentId)
          );
          if (!cancelled) setPayment(match || null);
        }
      } catch (err) {
        console.error("PaySuccess load error", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [invoiceId, newPaymentId, ownerId]);

  const handleDownloadPdf = () => {
    if (!pdfRef.current) return;
    const opt = {
      margin: 0.5,
      filename: `Invoice_${invoice?.invoiceID || invoiceId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(pdfRef.current).set(opt).save();
  };

  const paidAmount = payment?.amount || amountParam;
  const discountAmount = payment?.discount || 0;
  const couponCode = payment?.couponId?.code || null;

  return (
    <div className="finance-scope">
      <div className="pay-wrap">
        <div className="card">
          <div className="success-hero">
            <div className="success-badge">✓</div>
            <h2>Payment Successful</h2>
            <p className="muted">Thank you! Your payment has been processed.</p>
          </div>

          <div className="success-details">
            <div className="kv-row">
              <span className="kv-label">Invoice</span>
              <span className="kv-value mono">
                {invoice?.invoiceID || invoiceId || '-'}
              </span>
            </div>
            <div className="kv-row">
              <span className="kv-label">Amount Paid</span>
              <span className="kv-value mono">{fmtLKR(paidAmount)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="kv-row">
                <span className="kv-label">Discount</span>
                <span className="kv-value mono">
                  - {fmtLKR(discountAmount)} {couponCode ? `(Code: ${couponCode})` : ""}
                </span>
              </div>
            )}
            <div className="kv-row">
              <span className="kv-label">Receipt Email</span>
              <span className="kv-value">
                {emailParam || invoice?.userID?.email || '-'}
              </span>
            </div>
            {loading && <div className="muted psucc-loading">Loading invoice…</div>}
            {authLoading && <div className="muted">Verifying user…</div>}
            {authError && <div className="error">{authError}</div>}
          </div>

          <div className="row wrap end psucc-actions">
            <button className="btn primary" onClick={handleDownloadPdf}>
              Download PDF
            </button>
            {ownerId && (
              <button
                className="btn secondary"
                onClick={() => nav(`/pay/summary?user=${ownerId}&new=${newPaymentId}`)}
              >
                Go to Payment History
              </button>
            )}
            <button className="btn ghost" onClick={() => nav('/')}>
              Go to Home
            </button>
          </div>
        </div>

        {/* Hidden PDF content */}
        <div style={{ display: "none" }}>
          <div ref={pdfRef} style={{ fontFamily: "'Poppins', sans-serif", padding: "24px" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <h1 style={{ margin: "0", fontSize: "24px", color: "#2D2D2D" }}>Healthy Paws 🐾</h1>
              <p style={{ margin: "4px 0", color: "#6B7280" }}>Pet Care Clinic & Management System</p>
              <hr style={{ marginTop: "16px" }} />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <h2 style={{ margin: "0 0 8px", fontSize: "20px" }}>Invoice Receipt</h2>
              <p><b>Invoice ID:</b> {invoice?.invoiceID}</p>
              <p><b>Status:</b> {invoice?.status}</p>
              <p><b>Due Date:</b> {invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</p>
              <p><b>Issued To:</b> {invoice?.userID?.name || 'Customer'}</p>
              <p><b>Email:</b> {emailParam || invoice?.userID?.email}</p>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "12px" }}>
              <thead>
                <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
                  <th style={th}>Description</th>
                  <th style={th}>Qty</th>
                  <th style={th}>Rate</th>
                  <th style={th}>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice?.lineItems?.map((li, idx) => (
                  <tr key={idx}>
                    <td style={td}>{li.description}</td>
                    <td style={{ ...td, textAlign: "center" }}>{li.quantity}</td>
                    <td style={{ ...td, textAlign: "right" }}>{fmtLKR(li.unitPrice)}</td>
                    <td style={{ ...td, textAlign: "right" }}>{fmtLKR(li.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <table style={{ borderCollapse: "collapse", minWidth: "260px" }}>
                <tbody>
                  <tr>
                    <td style={tdStrong}>Subtotal:</td>
                    <td style={tdRight}>{fmtLKR(invoice?.subtotal)}</td>
                  </tr>
                  <tr>
                    <td style={tdStrong}>Tax:</td>
                    <td style={tdRight}>{fmtLKR(invoice?.tax)}</td>
                  </tr>
                  {discountAmount > 0 && (
                    <tr>
                      <td style={{ ...tdStrong, color: "green" }}>
                        Coupon {couponCode ? `(${couponCode})` : ""}
                      </td>
                      <td style={{ ...tdRight, color: "green" }}>- {fmtLKR(discountAmount)}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ ...tdStrong, fontSize: "16px" }}>Total Paid:</td>
                    <td style={{ ...tdRight, fontSize: "16px" }}>{fmtLKR(paidAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "40px", textAlign: "center", fontSize: "12px", color: "#666" }}>
              <p>Thank you for trusting Healthy Paws 🐾 with your pet’s care.</p>
              <p>This is a system-generated receipt. For inquiries, please contact our front desk.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const th = { border: "1px solid #ddd", padding: "8px", fontSize: "13px" };
const td = { border: "1px solid #ddd", padding: "8px", fontSize: "13px" };
const tdRight = { border: "1px solid #ddd", padding: "8px", fontSize: "13px", textAlign: "right" };
const tdStrong = { border: "1px solid #ddd", padding: "8px", fontSize: "13px", fontWeight: "600" };

export function fmtLKR(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return String(n || 'LKR 0.00');
  try {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 2 }).format(num);
  } catch {
    return `LKR ${num.toFixed(2)}`;
  }
}