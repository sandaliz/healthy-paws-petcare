// src/Components/finance/PaySuccess.js
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from './financeApi';
import './css/clientPay.css';
import html2pdf from 'html2pdf.js';

export default function PaySuccess() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const invoiceId = params.get('invoice') || '';
  const amount = params.get('amount') || '';
  const email = params.get('email') || '';
  const newPaymentId = params.get('new') || '';

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(!!invoiceId);

  const ownerId = localStorage.getItem('hp_ownerId') || '';
  const pdfRef = useRef();

  useEffect(() => {
    let cancelled = false;
    if (!invoiceId) return;
    (async () => {
      try {
        setLoading(true);
        const inv = await api.get(`/invoice/${invoiceId}`);
        if (!cancelled) setInvoice(inv);
      } catch {}
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [invoiceId]);

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

  return (
    <div className="pay-wrap">
      <div className="card">
        <div className="success-hero">
          <div className="success-badge">✓</div>
          <h2>Payment Successful</h2>
          <p className="muted">Thank you! Your payment has been processed.</p>
        </div>

        {/* On‑screen summary */}
        <div className="success-details">
          <div className="kv-row"><span className="kv-label">Invoice</span><span className="kv-value mono">{invoice?.invoiceID || invoiceId || '-'}</span></div>
          <div className="kv-row"><span className="kv-label">Amount Paid</span><span className="kv-value mono">{fmtLKR(amount)}</span></div>
          <div className="kv-row"><span className="kv-label">Receipt Email</span><span className="kv-value">{email || invoice?.userID?.email || '-'}</span></div>
          {loading && <div className="muted psucc-loading">Loading invoice…</div>}
        </div>

        <div className="row wrap end psucc-actions">
          <button className="btn primary" onClick={handleDownloadPdf}>Download PDF</button>
          <button className="btn secondary" onClick={() => nav(`/pay/summary?user=${ownerId}&new=${newPaymentId}`)}>Go to Payment History</button>
          <button className="btn ghost" onClick={() => nav('/')}>Go to Home</button>
        </div>
      </div>

      {/* Hidden Printable PDF Section */}
      <div style={{display:"none"}}>
        <div ref={pdfRef} style={{fontFamily:"'Poppins', sans-serif", padding:"24px"}}>
          {/* Clinic Header */}
          <div style={{textAlign:"center", marginBottom:"20px"}}>
            <h1 style={{margin:"0", fontSize:"24px", color:"#2D2D2D"}}>Healthy Paws 🐾</h1>
            <p style={{margin:"4px 0", color:"#6B7280"}}>Pet Care Clinic & Management System</p>
            <hr style={{marginTop:"16px"}}/>
          </div>

          {/* Invoice Summary */}
          <div style={{marginBottom:"16px"}}>
            <h2 style={{margin:"0 0 8px", fontSize:"20px"}}>Invoice Receipt</h2>
            <p><b>Invoice ID:</b> {invoice?.invoiceID}</p>
            <p><b>Status:</b> {invoice?.status}</p>
            <p><b>Due Date:</b> {invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</p>
            <p><b>Issued To:</b> {invoice?.userID?.OwnerName || 'Customer'}</p>
            <p><b>Email:</b> {email || invoice?.userID?.email}</p>
          </div>

          {/* Itemized Table */}
          <table style={{width:"100%", borderCollapse:"collapse", marginTop:"12px"}}>
            <thead>
              <tr style={{background:"#f3f4f6", textAlign:"left"}}>
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
                  <td style={{...td,textAlign:"center"}}>{li.quantity}</td>
                  <td style={{...td,textAlign:"right"}}>{fmtLKR(li.unitPrice)}</td>
                  <td style={{...td,textAlign:"right"}}>{fmtLKR(li.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{marginTop:"20px", display:"flex", justifyContent:"flex-end"}}>
            <table style={{borderCollapse:"collapse", minWidth:"260px"}}>
              <tbody>
                <tr>
                  <td style={tdStrong}>Subtotal:</td>
                  <td style={tdRight}>{fmtLKR(invoice?.subtotal)}</td>
                </tr>
                <tr>
                  <td style={tdStrong}>Tax:</td>
                  <td style={tdRight}>{fmtLKR(invoice?.tax)}</td>
                </tr>
                {invoice?.discount > 0 && (
                  <tr>
                    <td style={{...tdStrong, color:"green"}}>Coupon {invoice?.couponCode ? `(${invoice.couponCode})` : ""}</td>
                    <td style={{...tdRight, color:"green"}}>- {fmtLKR(invoice?.discount)}</td>
                  </tr>
                )}
                <tr>
                  <td style={{...tdStrong, fontSize:"16px"}}>Total Paid:</td>
                  <td style={{...tdRight, fontSize:"16px"}}>{fmtLKR(amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{marginTop:"40px", textAlign:"center", fontSize:"12px", color:"#666"}}>
            <p>Thank you for trusting Healthy Paws 🐾 with your pet’s care.</p>
            <p>This is a system-generated receipt. For inquiries, please contact our front desk.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const th = { border:"1px solid #ddd", padding:"8px", fontSize:"13px" };
const td = { border:"1px solid #ddd", padding:"8px", fontSize:"13px" };
const tdRight = { border:"1px solid #ddd", padding:"8px", fontSize:"13px", textAlign:"right" };
const tdStrong = { border:"1px solid #ddd", padding:"8px", fontSize:"13px", fontWeight:"600" };

export function fmtLKR(n){
  const num = Number(n);
  if (!Number.isFinite(num)) return String(n || 'LKR 0.00');
  try{ return new Intl.NumberFormat('en-LK',{style:'currency',currency:'LKR',maximumFractionDigits:2}).format(num);}
  catch{ return `LKR ${num.toFixed(2)}`; }
}