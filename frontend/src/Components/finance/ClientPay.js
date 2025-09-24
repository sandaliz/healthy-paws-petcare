import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { api } from './financeApi.js';
import './css/clientPay.css';

export default function ClientPay() {
  const nav = useNavigate();

  // inject Google fonts once
  useEffect(() => {
    const id = 'hp-fonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Roboto:wght@400;500&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const [ownerId, setOwnerId] = useState(localStorage.getItem('hp_ownerId') || '');
  const [invoiceId, setInvoiceId] = useState('');
  const [invoice, setInvoice] = useState(null);
  const [loadingInv, setLoadingInv] = useState(false);

  // Offline coupon (shown only in modal)
  const [offlineCouponCode, setOfflineCouponCode] = useState('');
  const [offlineCouponId, setOfflineCouponId] = useState(null);
  const [offlineDiscount, setOfflineDiscount] = useState(0);
  const [offlineApplying, setOfflineApplying] = useState(false);

  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [busy, setBusy] = useState(false);

  // fetch invoice when invoiceId set
  useEffect(() => {
    if (!invoiceId) { setInvoice(null); return; }
    let cancelled = false;
    (async () => {
      try {
        setLoadingInv(true);
        const inv = await api.get(`/invoice/${invoiceId}`);
        if (!cancelled) setInvoice(inv);
      } catch (e) {
        if (!cancelled) {
          setInvoice(null);
          toast.error(e.message || 'Failed to load invoice');
        }
      } finally {
        if (!cancelled) setLoadingInv(false);
      }
    })();
    return () => { cancelled = true; }
  }, [invoiceId]);

  const saveOwner = () => {
    if (!ownerId.trim()) return toast.error('Enter your Account _id');
    localStorage.setItem('hp_ownerId', ownerId.trim());
    toast.success('Saved your ID');
  };

  const applyOfflineCoupon = async () => {
    try {
      if (!invoice) return toast.error('Load an invoice first');
      if (!offlineCouponCode.trim()) return toast.error('Enter a coupon code');
      setOfflineApplying(true);
      const total = computeInvoiceTotal(invoice);
      const resp = await api.post('/coupon/validate', { code: offlineCouponCode.trim(), invoiceTotal: total });
      setOfflineCouponId(resp.couponId);
      setOfflineDiscount(Number(resp.discount || 0));
      toast.success(`Coupon applied: -${fmtLKR(resp.discount || 0)}`);
    } catch (e) {
      setOfflineCouponId(null);
      setOfflineDiscount(0);
      toast.error(e.message || 'Coupon not applicable');
    } finally {
      setOfflineApplying(false);
    }
  };

  const clearOfflineCoupon = () => {
    setOfflineCouponId(null);
    setOfflineDiscount(0);
    setOfflineCouponCode('');
  };

  const confirmOffline = async () => {
    try {
      if (!invoice || !ownerId) return toast.error('Owner and invoice required');
      setBusy(true);
      const newPayment = await api.post('/payment/offline', {
        invoiceID: invoice._id,
        userID: ownerId,
        method: 'Cash',
        couponId: offlineCouponId || undefined,
      });
      toast.success('Recorded: Pay at counter within 10 days!');
      setShowOfflineModal(false);
      setTimeout(() => {
        nav(`/pay/summary?user=${ownerId}&new=${newPayment._id}`);
        }, 900);
    } catch (e) {
      toast.error(e.message || 'Failed to record offline payment');
    } finally {
      setBusy(false);
    }
  };

  const totalBeforeDiscount = useMemo(() => computeInvoiceTotal(invoice), [invoice]);
  const offlineAmountAfterDiscount = useMemo(() => {
    const val = Math.max(0, Number(totalBeforeDiscount || 0) - Number(offlineDiscount || 0));
    return Math.round(val * 100) / 100;
  }, [totalBeforeDiscount, offlineDiscount]);

  const statusColor = (s) => {
    if (!s) return 'neutral';
    const x = String(s).toLowerCase();
    if (x.includes('paid')) return 'paid';
    if (x.includes('overdue')) return 'overdue';
    if (x.includes('pending')) return 'pending';
    return 'neutral';
  };

  return (
    <div className="pay-wrap">
      <Toaster position="top-right" />
      <div className="page-header">
        <div>
          <h1>Make a Payment</h1>
          <p className="muted">Enter your details, review your invoice, and choose how you’d like to pay.</p>
        </div>
      </div>

      <div className="card">
        {/* Section: IDs */}
        <div className="section">
          <h2 className="section-title">Your Details</h2>
          <div className="field">
            <label>Your Account ID (Mongo _id)</label>
            <div className="row">
              <input
                className="input"
                placeholder="e.g. 66f…"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
              />
              <button className="btn secondary" onClick={saveOwner}>Save</button>
            </div>
          </div>

          <div className="field">
            <label>Invoice ID (Mongo _id)</label>
            <input
              className="input"
              placeholder="e.g. 66f…"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
            />
            {loadingInv && <div className="muted" style={{ marginTop: 8 }}>Loading invoice…</div>}
          </div>
        </div>

        {/* Section: Invoice */}
        {!!invoice && !loadingInv && (
          <div className="section">
            <h2 className="section-title">Invoice Summary</h2>

            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Invoice</span>
                <span className="value mono">{invoice.invoiceID || invoice._id}</span>
              </div>
              <div className="summary-item">
                <span className="label">Status</span>
                <span className={`status-pill ${statusColor(invoice.status)}`}>{invoice.status}</span>
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
                <div className="totals-row">
                  <span>Subtotal</span>
                  <span className="mono">{fmtLKR(totalBeforeDiscount)}</span>
                </div>
                <div className="totals-row grand">
                  <span>Amount Due</span>
                  <span className="mono">{fmtLKR(totalBeforeDiscount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section: Actions (coupon now only shown after choosing method) */}
        <div className="section">
          <h2 className="section-title">Choose your method</h2>
          <div className="row wrap">
            <button
              className="btn primary"
              onClick={() => {
                setShowOfflineModal(true);
                // reset offline coupon on open
                setOfflineCouponCode('');
                setOfflineCouponId(null);
                setOfflineDiscount(0);
              }}
              disabled={!invoice || !ownerId}
            >
              Pay at Counter (Offline)
            </button>
            <button
              className="btn dark"
              onClick={() => {
                if (!invoice || !ownerId) return toast.error('Enter owner and invoice first');
                const qp = new URLSearchParams();
                qp.set('invoice', invoice._id);
                // No coupon in main page now; handled on online page
                nav(`/pay/online?${qp.toString()}`);
              }}
              disabled={!invoice || !ownerId}
            >
              Pay Online (Card)
            </button>
          </div>
        </div>
      </div>

      {/* Offline modal with coupon support */}
      {showOfflineModal && (
        <div className="modal">
          <div className="modal-box">
            <h3>Confirm offline payment</h3>
            <p className="muted" style={{ marginTop: 4 }}>
              This will create a pending payment. Please pay at Healthy Paws clinic
              {invoice ? ` before ${fmtDate(invoice.dueDate)}` : ''}.
            </p>

            {/* Coupon row inside modal */}
            <div className="modal-coupon">
              <label className="modal-coupon-label">Have a coupon?</label>
              <div className="row">
                <input
                  className="input"
                  placeholder="Enter coupon code"
                  value={offlineCouponCode}
                  onChange={(e) => setOfflineCouponCode(e.target.value)}
                />
                <button className="btn" onClick={applyOfflineCoupon} disabled={!invoice || offlineApplying}>
                  {offlineApplying ? 'Applying…' : 'Apply'}
                </button>
                {offlineCouponId && (
                  <button className="btn ghost" onClick={clearOfflineCoupon}>Clear</button>
                )}
              </div>

              {offlineDiscount > 0 && (
                <div className="applied" style={{ marginTop: 6 }}>
                  Discount applied: <b>{fmtLKR(offlineDiscount)}</b> — Pay at counter: <b>{fmtLKR(offlineAmountAfterDiscount)}</b>
                </div>
              )}
            </div>

            <div className="row end" style={{ marginTop: 12 }}>
              <button className="btn ghost" onClick={() => setShowOfflineModal(false)}>Close</button>
              <button className="btn primary" onClick={confirmOffline} disabled={busy || !invoice || !ownerId}>
                {busy ? 'Saving…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function computeInvoiceTotal(inv) {
  if (!inv) return 0;
  const t = Number(inv.total);
  if (Number.isFinite(t) && t > 0) return t;
  return (inv.lineItems || []).reduce((sum, li) => {
    const qty = toNum(li.quantity);
    const unit = toNum(li.unitPrice);
    const lineTotal = li.total != null ? toNum(li.total) : qty * unit;
    return sum + lineTotal;
  }, 0);
}
function toNum(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function fmtLKR(n) {
  try {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 2 }).format(Number(n) || 0);
  } catch {
    return `LKR ${Number(n || 0).toFixed(2)}`;
  }
}
function fmtDate(d) {
  if (!d) return '-';
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return String(d); }
}