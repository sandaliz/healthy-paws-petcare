import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from './financeApi';
import './css/clientPay.css';

export default function PaySuccess() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const invoiceId = params.get('invoice') || '';
  const pi = params.get('pi') || '';
  const amount = params.get('amount') || '';
  const email = params.get('email') || '';

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(!!invoiceId);

  useEffect(() => {
    let cancelled = false;
    if (!invoiceId) return;

    (async () => {
      try {
        setLoading(true);
        const inv = await api.get(`/invoice/${invoiceId}`);
        if (!cancelled) setInvoice(inv);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [invoiceId]);

  const shortPi = pi ? `…${pi.slice(-8)}` : '-';

  return (
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
            <span className="kv-value mono">{invoice?.invoiceID || invoiceId || '-'}</span>
          </div>
          <div className="kv-row">
            <span className="kv-label">Amount Paid</span>
            <span className="kv-value mono">{fmtLKR(amount)}</span>
          </div>
          <div className="kv-row">
            <span className="kv-label">Payment Intent</span>
            <span className="kv-value mono">{shortPi}</span>
          </div>
          <div className="kv-row">
            <span className="kv-label">Receipt Email</span>
            <span className="kv-value">{email || invoice?.userID?.OwnerEmail || '-'}</span>
          </div>
          {loading && <div className="muted" style={{ marginTop: 8 }}>Loading invoice…</div>}
        </div>

        <div className="row wrap end" style={{ marginTop: 16 }}>
          <button className="btn ghost" onClick={() => nav('/pay')}>Back to Payment Options</button>
          <button className="btn primary" onClick={() => window.print()}>Print</button>
          <button className="btn secondary" onClick={() => nav('/')}>Go to Home</button>
        </div>
      </div>
    </div>
  );
}

export function fmtLKR(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return String(n || 'LKR 0.00');
  try {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 2 }).format(num);
  } catch {
    return `LKR ${num.toFixed(2)}`;
  }
}
