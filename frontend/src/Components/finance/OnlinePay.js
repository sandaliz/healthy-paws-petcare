import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  useElements,
  useStripe,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement
} from '@stripe/react-stripe-js';
import { api } from './financeApi';
import './css/clientPay.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

export default function OnlinePay() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const invoiceParam = params.get('invoice') || '';
  const couponParam = params.get('coupon') || '';

  const [ownerId] = useState(localStorage.getItem('hp_ownerId') || '');
  const [invoice, setInvoice] = useState(null);
  const [loadingInv, setLoadingInv] = useState(false);

  const [showCoupon, setShowCoupon] = useState(!!couponParam);
  const [couponCode, setCouponCode] = useState(couponParam);
  const [couponId, setCouponId] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [err, setErr] = useState('');

  // Load invoice
  useEffect(() => {
    if (!invoiceParam) return;
    let cancelled = false;
    (async () => {
      try {
        setLoadingInv(true);
        setErr('');
        const inv = await api.get(`/invoice/${invoiceParam}`);
        if (!cancelled) setInvoice(inv);
      } catch (e) {
        if (!cancelled) {
          setInvoice(null);
          setErr(e.message || 'Failed to load invoice');
        }
      } finally {
        if (!cancelled) setLoadingInv(false);
      }
    })();
    return () => { cancelled = true; };
  }, [invoiceParam]);

  const totalBeforeDiscount = useMemo(() => computeInvoiceTotal(invoice), [invoice]);
  const amountAfterDiscount = useMemo(
    () => Math.max(0, totalBeforeDiscount - (discount || 0)),
    [totalBeforeDiscount, discount]
  );

  const applyCoupon = async () => {
    try {
      if (!invoice) return toast.error('Invoice not loaded');
      if (!couponCode.trim()) return toast.error('Enter a coupon code');
      const resp = await api.post('/coupon/validate', {
        code: couponCode.trim(),
        invoiceTotal: totalBeforeDiscount
      });
      setCouponId(resp.couponId);
      setDiscount(Number(resp.discount || 0));
      toast.success(`Coupon applied: -${fmtLKR(resp.discount || 0)}`);
    } catch (e) {
      setCouponId(null);
      setDiscount(0);
      toast.error(e.message || 'Coupon not applicable');
    }
  };

  useEffect(() => {
    if (couponParam && invoice && !couponId) applyCoupon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice]);

  return (
    <div className="pay-wrap">
      <Toaster position="top-right" />
      <div className="page-header">
        <div>
          <h1>Pay Online</h1>
          <p className="muted">Review your invoice and complete a secure card payment.</p>
        </div>
        <button className="btn ghost" onClick={() => nav('/pay')}>Back to Payment Options</button>
      </div>

      <div className="card">
        {!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY && (
          <div className="notice error" style={{ marginBottom: 12 }}>
            Stripe key missing. Set REACT_APP_STRIPE_PUBLISHABLE_KEY
          </div>
        )}

        {/* Invoice */}
        <div className="section">
          <h2 className="section-title">Invoice</h2>
          {!invoiceParam && <div className="muted">No invoice id in URL.</div>}
          {loadingInv && <div className="muted">Loading invoice…</div>}
          {err && <div className="error">{err}</div>}

          {invoice && (
            <>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">Invoice</span>
                  <span className="value mono">{invoice.invoiceID || invoice._id}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Status</span>
                  <span className="value"><span className={`status-pill ${statusColor(invoice.status)}`}>{invoice.status}</span></span>
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
                  {discount > 0 && (
                    <div className="totals-row">
                      <span>Discount</span>
                      <span className="mono">- {fmtLKR(discount)}</span>
                    </div>
                  )}
                  <div className="totals-row grand">
                    <span>Amount to Pay</span>
                    <span className="mono">{fmtLKR(amountAfterDiscount)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Card Payment */}
        <div className="section">
          <h2 className="section-title">Card Payment</h2>

          {/* Coupon toggle area (more vertical space, brown button) */}
          <div className="coupon-toggle">
            <button
              className={`btn ${showCoupon ? 'secondary' : 'secondary'}`}
              onClick={() => setShowCoupon(v => !v)}
              type="button"
            >
              {showCoupon ? 'Hide coupon' : 'I have a coupon'}
            </button>
          </div>

          {showCoupon && (
            <div className="coupon-block">
              <div className="row wrap">
                <input
                  className="input"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{ flex: '1 1 260px' }}
                />
                <button className="btn secondary" onClick={applyCoupon} disabled={!invoice}>Apply</button>
                {couponId && (
                  <button
                    className="btn ghost"
                    onClick={() => { setCouponId(null); setDiscount(0); setCouponCode(''); }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="hint">Coupon reduces the amount above. It updates securely on the server.</p>
            </div>
          )}

          {/* Highlighted card payment panel */}
          <div className="panel panel-peach">
            {!invoice && <div className="muted">Load an invoice to continue.</div>}
            {invoice && ownerId && (
              <StripePayBox
                invoice={invoice}
                ownerId={ownerId}
                couponId={couponId}
                onSuccess={({ paymentIntentId, amount, email }) => {
                  const qp = new URLSearchParams();
                  qp.set('invoice', invoice._id);
                  qp.set('pi', paymentIntentId);
                  qp.set('amount', String(amount));
                  if (email) qp.set('email', email);
                  nav(`/pay/success?${qp.toString()}`);
                }}
              />
            )}
            {!ownerId && <div className="notice">Please go back and save your Account ID first.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StripePayBox({ invoice, ownerId, couponId, onSuccess }) {
  const [clientSecret, setClientSecret] = useState('');
  const [serverAmount, setServerAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const resp = await api.post('/payment/stripe', {
          invoiceID: invoice._id,
          userID: ownerId,
          currency: 'lkr',
          couponId: couponId || undefined,
        });
        if (cancelled) return;
        setClientSecret(resp.clientSecret);
        if (resp.amount != null) setServerAmount(resp.amount);
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Failed to initialize payment');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [invoice?._id, ownerId, couponId]);

  const appearance = useMemo(() => ({ appearance: { theme: 'stripe' } }), []);
  if (!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY) {
    return <div className="muted">Stripe key missing. Set REACT_APP_STRIPE_PUBLISHABLE_KEY</div>;
  }
  if (loading) return <div className="muted">Preparing secure payment…</div>;
  if (err) return <div className="error">{err}</div>;
  if (!clientSecret) return <div className="error">No client secret</div>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, ...appearance }}>
      <StripeCard
        clientSecret={clientSecret}
        amount={serverAmount}
        invoice={invoice}
        onSuccess={onSuccess}
      />
    </Elements>
  );
}

function StripeCard({ clientSecret, amount, invoice, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState(invoice?.userID?.OwnerName || '');
  const [email, setEmail] = useState(invoice?.userID?.OwnerEmail || '');
  const [postal, setPostal] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const pay = async () => {
    if (!stripe || !elements) return;
    setBusy(true);
    setErr('');
    try {
      const cardNumberEl = elements.getElement(CardNumberElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberEl,
          billing_details: {
            name: name || 'Guest',
            email: email || undefined,
            address: postal ? { postal_code: postal } : undefined,
          },
        },
      });
      if (result.error) {
        setErr(result.error.message || 'Payment failed');
        setBusy(false);
        return;
      }
      const pi = result.paymentIntent;
      if (pi.status !== 'succeeded') {
        setErr(`Payment status: ${pi.status}`);
        setBusy(false);
        return;
      }
      await api.post('/payment/stripe/confirm', { paymentIntentId: pi.id });
      onSuccess?.({ paymentIntentId: pi.id, amount, email });
    } catch (e) {
      setErr(e.message || 'Payment error');
    } finally {
      setBusy(false);
    }
  };

  const elStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#54413C',
        '::placeholder': { color: '#8B6A5F' },
        fontFamily: 'Roboto, sans-serif',
      },
      invalid: { color: '#b91c1c' },
    }
  };

  return (
    <>
      <div className="charge-line charge-pill">
        You will be charged: <b>{fmtLKR(amount)}</b>
      </div>

      <div className="grid-2">
        <div className="field">
          <label>Name on card</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
        </div>
        <div className="field">
          <label>Email (for receipt)</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
        </div>
      </div>

      <div className="field">
        <label>Card number</label>
        <div className="stripe-control">
          <CardNumberElement options={elStyle} />
        </div>
      </div>

      <div className="stripe-grid-3">
        <div className="field">
          <label>Expiry (MM/YY)</label>
          <div className="stripe-control">
            <CardExpiryElement options={elStyle} />
          </div>
        </div>
        <div className="field">
          <label>CVC</label>
          <div className="stripe-control">
            <CardCvcElement options={elStyle} />
          </div>
        </div>
        <div className="field">
          <label>ZIP / Postal</label>
          <input
            className="input"
            placeholder="e.g. 10115"
            value={postal}
            onChange={(e) => setPostal(e.target.value)}
          />
        </div>
      </div>

      {err && <div className="error">{err}</div>}
      <div className="row end" style={{ marginTop: 8 }}>
        <button className="btn ghost" onClick={() => window.history.back()}>Cancel</button>
        <button className="btn secondary" onClick={pay} disabled={busy || !stripe}>
          {busy ? 'Processing…' : 'Pay now'}
        </button>
      </div>
    </>
  );
}

/* utils */
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
function statusColor(s) {
  if (!s) return 'neutral';
  const x = String(s).toLowerCase();
  if (x.includes('paid')) return 'paid';
  if (x.includes('overdue')) return 'overdue';
  if (x.includes('pending')) return 'pending';
  return 'neutral';
}