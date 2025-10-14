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
    <div className="finance-scope">
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

        <div className="card">
          {loadingInv && !invoice && <p className="muted">Loading invoice…</p>}
          {invoiceError && <p className="error">{invoiceError}</p>}
          {invoice && <InvoiceSummary invoice={invoice} showDogTip={showDogTip} setShowDogTip={setShowDogTip} />}

          {invoice && (
            <div className="section choose-method">
              <h2>Choose your method</h2>
              <div className="row wrap">
                <button className="btn primary" onClick={() => setShowOfflineModal(true)}>
                  Pay at Counter (Offline)
                </button>
                <button className="btn dark" onClick={() => {
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

  return (
    <div className="section">
      <div className="invoice-header">
        <h2 className="section-title">Invoice Summary</h2>
        <img
          src={doggie}
          alt="dog"
          className="invoice-dog"
          onMouseEnter={() => setShowDogTip(true)}
          onClick={() => setShowDogTip(true)}
        />
        {showDogTip && (
          <div className="thought-bubble">🐾 Check PawPerks in Profile for offers!</div>
        )}
      </div>

      <div className="summary-grid">
        <div className="summary-item">
          <span className="label">Invoice</span>
          <span className="value mono">{invoice.invoiceID || invoice._id}</span>
        </div>
        <div className="summary-item">
          <span className="label">Status</span>
          <span className={`status-pill ${String(invoice.status).toLowerCase()}`}>{invoice.status}</span>
        </div>
        <div className="summary-item">
          <span className="label">Due Date</span>
          <span className="value">{fmtDate(invoice.dueDate)}</span>
        </div>
      </div>

      <div className="items-wrap">
        <div className="items-header">
          <div>Description</div>
          <div>Qty</div>
          <div>Rate</div>
          <div className="right">Line Total</div>
        </div>
        <div className="items-body">
          {(invoice.lineItems || []).map((li, i) => {
            const qty = toNum(li.quantity);
            const unit = toNum(li.unitPrice);
            const lineTotal = li.total != null ? toNum(li.total) : qty * unit;
            return (
              <div className="items-row" key={i}>
                <div className="desc">{li.description}</div>
                <div>{qty}</div>
                <div>{fmtLKR(unit)}</div>
                <div className="right bold">{fmtLKR(lineTotal)}</div>
              </div>
            );
          })}
        </div>
        <div className="totals">
          <div className="totals-row tax-note">
            <span>+ Tax (8%)</span>
            <span className="mono">{fmtLKR(invoice?.tax ?? total * 0.08)}</span>
          </div>
          <div className="totals-row">
            <span>Subtotal</span>
            <span className="mono">{fmtLKR(total)}</span>
          </div>
          <div className="totals-row grand">
            <span>Amount Due</span>
            <span className="mono">{fmtLKR(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}