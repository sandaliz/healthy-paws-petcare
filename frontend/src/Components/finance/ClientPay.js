import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { api } from './services/financeApi';
import useAuthUser from './hooks/useAuthUser';
import './css/clientPay.css';

const COUPON_REGEX = /^[A-Za-z0-9._-]{3,32}$/;

export default function ClientPay() {
  const nav = useNavigate();
  const { user: authUser, loading: authLoading, error: authError } = useAuthUser();
  const ownerId = authUser?._id;

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

  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loadingInv, setLoadingInv] = useState(false);

  const [offlineCouponCode, setOfflineCouponCode] = useState('');
  const [offlineCouponId, setOfflineCouponId] = useState(null);
  const [offlineDiscount, setOfflineDiscount] = useState(0);
  const [offlineApplying, setOfflineApplying] = useState(false);

  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [busy, setBusy] = useState(false);

  const [invoiceError, setInvoiceError] = useState('');
  const [allowCoupon, setAllowCoupon] = useState(false);
  const [myCoupons, setMyCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  useEffect(() => {
    if (!invoiceId) {
      setInvoice(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoadingInv(true);
        const inv = await api.get(`/invoice/${invoiceId}`);
        if (!cancelled) {
          setInvoice(inv);
          setInvoiceError('');
        }
      } catch (e) {
        if (!cancelled) {
          setInvoice(null);
          setInvoiceError('Invoice not found or invalid ID');
          toast.error(e.message || 'Failed to load invoice');
        }
      } finally {
        if (!cancelled) setLoadingInv(false);
      }
    })();
    return () => { cancelled = true; }
  }, [invoiceId]);

  const applyOfflineCoupon = async () => {
    try {
      if (!invoice) return toast.error('Load an invoice first');
      if (!offlineCouponCode.trim()) return toast.error('Enter a promo code');

      const code = offlineCouponCode.trim();
      if (!COUPON_REGEX.test(code)) {
        return toast.error('Use 3–32 chars: letters, numbers, dash, underscore, dot.');
      }

      setOfflineApplying(true);
      const total = computeInvoiceTotal(invoice);

      try {
        const resp = await api.post('/coupon/validate', { code, invoiceTotal: total });
        setOfflineCouponId(resp.couponId);
        setOfflineDiscount(Number(resp.discount || 0));
        toast.success(`Coupon applied: -${fmtLKR(resp.discount || 0)}`);
      } catch {
        // Fallback to user‑specific coupon
        if (!ownerId) throw new Error('Please login first');
        const res = await api.post('/coupon/validate-user', {
          code,
          userID: ownerId,
          invoiceTotal: total
        });
        setOfflineCouponId(res.couponId);
        setOfflineDiscount(Number(res.discount || 0));
        toast.success(`Personal coupon applied: -${fmtLKR(res.discount || 0)}`);
      }
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
      if (!invoice) return toast.error('Invoice required');
      if (!ownerId) return toast.error('Login required');
      setBusy(true);

      const newPayment = await api.post('/payment/offline', {
        invoiceID: invoice._id,
        userID: ownerId,
        method: 'Cash',
        couponId: offlineCouponId || undefined,
      });

      toast.success('Payment recorded! Pay at reception within 10 days.');
      setShowOfflineModal(false);

      setTimeout(() => {
        nav(`/pay/summary?user=${ownerId}&new=${newPayment.payment._id}`);
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
    <div className="finance-scope">
      <div className="pay-wrap">
        <Toaster position="top-right" />
        <div className="page-header">
          <div>
            <h1>Make a Payment</h1>
            <p className="muted">Review your Invoice, then select how you’d like to pay.</p>
          </div>
        </div>

        {authLoading && <div className="muted">Checking account…</div>}
        {authError && <div className="error">{authError}</div>}
        {!authLoading && !ownerId && <div className="notice">Please log in to create a payment.</div>}

        <div className="card">

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
                  <div>Description</div><div>Qty</div><div>Rate</div><div className="right">Line Total</div>
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
                  <div className="totals-row"><span>Subtotal</span><span className="mono">{fmtLKR(totalBeforeDiscount)}</span></div>
                  <div className="totals-row grand"><span>Amount Due</span><span className="mono">{fmtLKR(totalBeforeDiscount)}</span></div>
                </div>
              </div>
            </div>
          )}

          {invoice && (
            <div className="section">
              <h2 className="section-title">Choose your method</h2>
              <div className="row wrap">
                <button
                  className="btn primary"
                  onClick={() => {
                    setShowOfflineModal(true);
                    setOfflineCouponCode('');
                    setOfflineCouponId(null);
                    setOfflineDiscount(0);
                  }}
                >
                  Pay at Counter (Offline)
                </button>
                <button
                  className="btn dark"
                  onClick={() => {
                    const qp = new URLSearchParams();
                    qp.set('invoice', invoice._id);
                    nav(`/pay/online?${qp.toString()}`);
                  }}
                >
                  Pay Online (Card)
                </button>
              </div>
            </div>
          )}
        </div>

        {showOfflineModal && (
          <div className="f-offline-modal">
            <div className="f-offline-modal-box">
              {showOfflineModal && (
                <div className="f-offline-modal">
                  <div className="f-offline-modal-box">
                    <h3>Confirm offline payment</h3>
                    <p className="muted offline-msg">
                      This will create a <b>pending payment</b>. Please pay at reception
                      {invoice ? ` before ${fmtDate(invoice.dueDate)}` : ''}.
                    </p>

                    {/* ✅ NEW Toggle */}
                    <div className="f-offline-coupon-toggle">
                      <label>
                        <input
                          type="checkbox"
                          checked={allowCoupon}
                          onChange={(e) => {
                            setAllowCoupon(e.target.checked);
                            if (e.target.checked && ownerId && invoice) {
                              setLoadingCoupons(true);
                              api.get(`/coupon/user-available?userId=${ownerId}&invoiceTotal=${invoice.total}`)
                                .then(res => setMyCoupons(res.coupons || []))
                                .catch(() => setMyCoupons([]))
                                .finally(() => setLoadingCoupons(false));
                            }
                          }}
                        />
                        Apply coupon?
                      </label>
                    </div>

                    {allowCoupon && (
                      <div className="f-offline-coupon-body">
                        {/* Show available coupons */}
                        {loadingCoupons ? (
                          <p className="f-offline-hint">Loading coupons…</p>
                        ) : myCoupons.length > 0 ? (
                          <div className="f-offline-coupon-grid">
                            {myCoupons.map(c => (
                              <div key={c.couponId} className="f-offline-coupon-card">
                                <div className="f-offline-coupon-header">
                                  <span className="f-offline-code">{c.code}</span>
                                  <span className="f-offline-type">
                                    {c.discountType} {c.discountValue}
                                  </span>
                                </div>
                                <div className="f-offline-meta">
                                  Min: {fmtLKR(c.minInvoiceAmount)} • Expires: {fmtDate(c.expiryDate)}
                                </div>
                                <div className="row end">
                                  <button
                                    className="f-offline-btn"
                                    onClick={() => {
                                      setOfflineCouponId(c.couponId);
                                      setOfflineDiscount(c.discountValue);
                                      toast.success(`Coupon applied: -${fmtLKR(c.discountValue)}`);
                                    }}
                                  >
                                    Apply
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="f-offline-hint">No coupons available.</p>
                        )}

                        {/* Promo code input */}
                        <div className="f-offline-promo">
                          <input
                            className={`input ${offlineCouponCode.trim() && !COUPON_REGEX.test(offlineCouponCode.trim()) ? 'input-error' : ''}`}
                            placeholder="Or Have a Promo Code? then, Apply here!"
                            value={offlineCouponCode}
                            onChange={(e) => setOfflineCouponCode(e.target.value)}
                          />
                          <button
                            className="f-offline-btn"
                            onClick={applyOfflineCoupon}
                            disabled={!invoice || offlineApplying}
                          >
                            {offlineApplying ? 'Applying…' : 'Apply'}
                          </button>
                          {offlineCouponId && (
                            <button className="btn ghost" onClick={clearOfflineCoupon}>Clear</button>
                          )}
                        </div>

                        {/* Show validation error message */}
                        {offlineCouponCode.trim() && !COUPON_REGEX.test(offlineCouponCode.trim()) && (
                          <div className="error promo-error">
                            Code must be 3–32 chars, only letters, numbers, dash, underscore, dot.
                          </div>
                        )}

                        {offlineDiscount > 0 && (
                          <div className="f-offline-applied">
                            Discount applied: <b>{fmtLKR(offlineDiscount)}</b> —
                            Pay at counter: <b>{fmtLKR(offlineAmountAfterDiscount)}</b>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="row end offline-actions">
                      <button className="btn ghost" onClick={() => setShowOfflineModal(false)}>
                        Close
                      </button>
                      <button className="btn primary" onClick={confirmOffline} disabled={busy}>
                        {busy ? 'Saving…' : 'Confirm'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
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
  } catch { return `LKR ${Number(n || 0).toFixed(2)}`; }
}
function fmtDate(d) {
  if (!d) return '-';
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return String(d); }
}