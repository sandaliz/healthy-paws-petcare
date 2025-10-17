import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { api } from '../../services/financeApi';
import useAuthUser from '../../hooks/useAuthUser';
import doggie from '../../images/doggie.png';
import OfflinePaymentModal from './OfflinePaymentModal';
import { fmtDate, fmtLKR, toNum } from '../../utils/financeFormatters';

import '../../css/clientPay.css';

export default function ClientPay() {
  const nav = useNavigate();
  const { invoiceId } = useParams();
  const { user, loading: authLoading, error: authError } = useAuthUser();
  const ownerId = user?._id;

  const [invoice, setInvoice] = useState(null);
  const [loadingInv, setLoadingInv] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');
  const [showDogTip, setShowDogTip] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  // Load invoice
  useEffect(() => {
    if (!invoiceId) { setInvoice(null); return; }
    let cancelled = false;
    (async () => {
      try {
        setLoadingInv(true);
        const inv = await api.get(`/invoice/${invoiceId}`);
        if (!cancelled) setInvoice(inv);
      } catch (e) {
        !cancelled && setInvoiceError('Invoice not found or invalid');
        toast.error(e.message || 'Failed to load invoice');
      } finally {
        !cancelled && setLoadingInv(false);
      }
    })();
    return () => { cancelled = true; }
  }, [invoiceId]);

  console.log(invoice)

  // Dog tip auto-hide logic
  useEffect(() => {
    if (!showDogTip) return;
    const clickOutside = e => {
      if (!e.target.closest('.invoice-dog') && !e.target.closest('.thought-bubble'))
        setShowDogTip(false);
    };
    const timer = setTimeout(() => setShowDogTip(false), 5000);
    document.addEventListener('click', clickOutside);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', clickOutside);
    };
  }, [showDogTip]);

  return (
    <div className="finance-scope cp-bg cp-full">
      <div className="pay-wrap">
        <Toaster position="top-right" />

        <div className="page-header">
          <div>
            <h1>Make a Payment</h1>
            <p className="muted">Choose your method and complete checkout securely.</p>
          </div>
          <button className="fm-btn-back" onClick={() => nav(-1)}>← Go back</button>
        </div>

        {authLoading && <p className="muted">Checking account…</p>}
        {authError && <p className="error">{authError}</p>}
        {!authLoading && !ownerId && <p className="notice">Please log in to continue.</p>}

        <div className="cp-card">
          {loadingInv && !invoice && <p className="muted">Loading invoice…</p>}
          {invoiceError && <p className="error">{invoiceError}</p>}
          {invoice && <InvoiceSummary invoice={invoice} showDogTip={showDogTip} setShowDogTip={setShowDogTip} />}

          {invoice && (
            <div className="cp-section cp-choose-method">
              <h2 className="cp-section-title">Choose your method</h2>
              <div className="cp-row cp-wrap cp-end">
                <button className="cp-btn cp-btn-primary" onClick={() => setShowOfflineModal(true)}>
                  Pay at Counter (Offline)
                </button>
                <button className="cp-btn cp-btn-dark" onClick={() => {
                  const qp = new URLSearchParams({ invoice: invoice._id });
                  nav(`/pay/online?${qp.toString()}`);
                }}>
                  Pay Online (Card)
                </button>
              </div>
            </div>
          )}
        </div>

        {showOfflineModal && (
          <OfflinePaymentModal
            invoice={invoice}
            ownerId={ownerId}
            onClose={() => setShowOfflineModal(false)}
            onSuccess={(paymentId) => nav(`/pay/summary?user=${ownerId}&new=${paymentId}`)}
          />
        )}
      </div>
    </div>
  );
}

function InvoiceSummary({ invoice, showDogTip, setShowDogTip }) {
  const total = (invoice.lineItems || []).reduce((sum, li) => {
    const qty = toNum(li.quantity);
    const rate = toNum(li.unitPrice);
    return sum + (li.total != null ? toNum(li.total) : qty * rate);
  }, 0);

  // Determine display status (treat past-due unpaid as Overdue)
  const rawStatus = String(invoice.status || '').trim();
  const normalized = rawStatus.toLowerCase();
  const isFinalized = /paid|refunded|cancelled/.test(normalized);
  let isOverdue = false;
  try {
    if (!isFinalized && invoice.dueDate) {
      const due = new Date(invoice.dueDate);
      const today = new Date();
      // zero time for date-only comparison
      due.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      isOverdue = due < today;
    }
  } catch {}
  const displayStatus = isOverdue ? 'Overdue' : (rawStatus || 'Pending');
  const pillClass = isOverdue ? 'overdue' : normalized;

  return (
    <div className="cp-section">
      <div className="invoice-header">
        <h2 className="cp-section-title">Invoice Summary</h2>
        <img
          src={doggie}
          alt="dog"
          className="invoice-dog"
          onMouseEnter={() => setShowDogTip(true)}
          onClick={() => setShowDogTip(true)}
        />
        {showDogTip && (
          <div className="thought-bubble">🐾 Check PawPerks in your profile for exciting offers!</div>
        )}
      </div>

      <div className="cp-summary-grid">
        <div className="cp-summary-item">
          <span className="cp-label">Invoice</span>
          <span className="cp-value mono">{invoice.invoiceID || invoice._id}</span>
        </div>
        <div className="cp-summary-item">
          <span className="cp-label">Status</span>
          <span className={`status-pill ${pillClass}`}>{displayStatus}</span>
        </div>
        <div className="cp-summary-item">
          <span className="cp-label">Due Date</span>
          <span className="cp-value">{fmtDate(invoice.dueDate)}</span>
        </div>
      </div>

      <div className="cp-items-wrap">
        <div className="cp-items-header">
          <div>Description</div>
          <div>Qty</div>
          <div>Rate</div>
          <div className="cp-right">Line Total</div>
        </div>
        <div className="cp-items-body">
          {(invoice.lineItems || []).map((li, i) => {
            const qty = toNum(li.quantity);
            const unit = toNum(li.unitPrice);
            const lineTotal = li.total != null ? toNum(li.total) : qty * unit;
            return (
              <div className="cp-items-row" key={i}>
                <div className="cp-desc">{li.description}</div>
                <div>{qty}</div>
                <div>{fmtLKR(unit)}</div>
                <div className="cp-right cp-bold">{fmtLKR(lineTotal)}</div>
              </div>
            );
          })}
        </div>
        <div className="cp-totals">
          <div className="cp-totals-row cp-tax-note">
            <span>+ Tax (8%)</span>
            <span className="mono">{fmtLKR(invoice?.tax ?? total * 0.08)}</span>
          </div>
          <div className="cp-totals-row">
            <span>Subtotal</span>
            <span className="mono">{fmtLKR(total)}</span>
          </div>
          <div className="cp-totals-row cp-grand">
            <span>Amount Due</span>
            <span className="mono">{fmtLKR(invoice.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}