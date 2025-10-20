import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { api } from '../../services/financeApi';
import useAuthUser from "../../hooks/useAuthUser";
import Navbar from "../../../Home/Navbar"
import '../../css/clientPay.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

const COUPON_REGEX = /^[A-Za-z0-9._-]{3,32}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POSTAL_REGEX = /^[0-9]{5}$/;

export default function OnlinePay() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const invoiceParam = params.get('invoice') || '';
  const couponParam = params.get('coupon') || '';

  const { user: authUser, loading: authLoading, error: authError } = useAuthUser();
  const ownerId = authUser?._id || '';

  const [invoice, setInvoice] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const [couponCode, setCouponCode] = useState(couponParam);
  const [couponId, setCouponId] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');

  const [myCoupons, setMyCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [selectedIssuedId, setSelectedIssuedId] = useState('');
  const [appliedIssuedCode, setAppliedIssuedCode] = useState('');

  const [showCoupons, setShowCoupons] = useState(false);
  const [showPromoCode, setShowPromoCode] = useState(false);
  const [allowCoupon, setAllowCoupon] = useState(false);

  const [paying, setPaying] = useState(false);

  const autoAppliedRef = useRef('');

  useEffect(() => {
    if (!invoiceParam) return;
    let cancelled = false;
    (async () => {
      try {
        setLoadingInvoice(true);
        setError('');
        const inv = await api.get(`/invoice/${invoiceParam}`);
        if (!cancelled) setInvoice(inv);
      } catch (e) {
        if (!cancelled) {
          setInvoice(null);
          setError(e.message || 'Failed to load invoice');
        }
      } finally {
        if (!cancelled) setLoadingInvoice(false);
      }
    })();
    return () => { cancelled = true; };
  }, [invoiceParam]);

  useEffect(() => {
    if (!invoice || !ownerId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoadingCoupons(true);
        const total = computeInvoiceTotal(invoice);
        const res = await api.get(`/coupon/user-available?userId=${ownerId}&invoiceTotal=${total}`);
        if (!cancelled) {
          setMyCoupons(Array.isArray(res.coupons) ? res.coupons.filter(c => c.status === "Available") : []);
        }
      } catch (err) {
        if (!cancelled) setMyCoupons([]);
      } finally {
        if (!cancelled) setLoadingCoupons(false);
      }
    })();
    return () => { cancelled = true; };
  }, [invoice, ownerId]);

  const totalBeforeDiscount = useMemo(() => computeInvoiceTotal(invoice), [invoice]);
  const amountAfterDiscount = useMemo(
    () => Math.max(0, totalBeforeDiscount - (discount || 0)),
    [totalBeforeDiscount, discount]
  );

  const applyCoupon = useCallback(async (overrideCode) => {
    if (!invoice) {
      toast.error('Invoice not loaded');
      return;
    }
    if (selectedIssuedId) {
      toast.error('Clear selected wallet coupon first');
      return;
    }
    const raw = typeof overrideCode === 'string' ? overrideCode : couponCode;
    const code = raw.trim();
    if (!code) {
      toast.error('Enter code');
      return;
    }
    if (!COUPON_REGEX.test(code)) {
      toast.error('Use 3–32 characters: letters, numbers, - _ .');
      return;
    }
    try {
      const resp = await api.post('/coupon/validate', {
        code,
        invoiceTotal: totalBeforeDiscount,
        userID: invoice.userID
      });
      const normalized = code.toUpperCase();
      setCouponId(resp.couponId);
      setDiscount(Number(resp.discount || 0));
      setSelectedIssuedId('');
      setAppliedIssuedCode(normalized);
      setCouponCode(normalized);
      toast.success(`Coupon applied: -${fmtLKR(resp.discount || 0)}`);
    } catch (e) {
      setCouponId(null);
      setDiscount(0);
      toast.error(e.message || 'Coupon not applicable');
    }
  }, [couponCode, invoice, selectedIssuedId, totalBeforeDiscount]);

  const applyIssued = async (coupon) => {
    if (!invoice) return toast.error('Invoice not loaded');
    if (couponCode.trim()) return toast.error('Clear typed code before applying wallet coupon');
    try {
      const res = await api.post('/coupon/validate-user', {
        couponId: coupon.couponId,
        userID: invoice.userID,
        invoiceTotal: totalBeforeDiscount,
      });
      setCouponId(res.couponId);
      setDiscount(Number(res.discount || 0));
      setSelectedIssuedId(coupon.couponId);
      setAppliedIssuedCode(coupon.code);
      setCouponCode('');
      toast.success(`Coupon applied: -${fmtLKR(res.discount || 0)}`);
    } catch (e) {
      toast.error(e.message || 'Coupon not applicable');
    }
  };

  useEffect(() => {
    if (!couponParam || !invoice || couponId) return;
    if (autoAppliedRef.current === couponParam) return;
    autoAppliedRef.current = couponParam;
    setCouponCode(couponParam);
    applyCoupon(couponParam);
  }, [applyCoupon, couponId, couponParam, invoice]);

  const invoiceBlocked = invoice && ["Paid", "Refunded", "Cancelled"].includes(String(invoice.status));

  return (
      <>
      <div className="finance-nav-shell">
      <Navbar />
    <div className="finance-scope op-bg op-full">
      <div className="pay-wrap">
        <Toaster position="top-right" containerStyle={{ top: 96 }} />
        <div className="page-header">
          <div>
            <h1>Pay Online</h1>
            <p className="muted">Enter your card details to confirm and complete this payment.</p>
          </div>
          <button className="fm-btn-back" onClick={() => navigate(-1)}>← Back to Payment Options</button>
        </div>

        <div className="op-card">
          {!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY && (
            <div className="notice error notice-stripe-missing">
              Stripe key missing. Set REACT_APP_STRIPE_PUBLISHABLE_KEY
            </div>
          )}

          <div className="section">
            <h2 className="section-title">Card Payment</h2>

            {authLoading && <div className="muted">Checking authentication…</div>}
            {authError && <div className="error">{authError}</div>}
            {!authLoading && !ownerId && <div className="notice">Please log in to continue.</div>}

            <div className={`panel coupon-panel ${paying ? "disabled" : ""}`}>
              <h3 className="coupon-panel-title">Coupons & Codes</h3>
              {invoice && ownerId && (
                <>
                  <label className="coupon-toggle-label">
                    <input
                      type="checkbox"
                      checked={allowCoupon}
                      onChange={e => setAllowCoupon(e.target.checked)}
                      disabled={paying}
                    />
                    Use a coupon or a code?
                  </label>

                  {allowCoupon && (
                    <>
                      {myCoupons.length > 0 && (
                        <div className="wallet-coupons-wrap">
                          <button
                            className="btn big-coupon-toggle"
                            type="button"
                            onClick={() => setShowCoupons(p => !p)}
                            disabled={paying}
                          >
                            {showCoupons ? 'Hide Coupons' : 'Show My Coupons'}
                          </button>

                          {showCoupons && (
                            <div className="onpay-coupon-grid">
                              {myCoupons.map(c => {
                                const active = selectedIssuedId === c.couponId;
                                return (
                                  <div key={c.couponId} className={`coupon-card${active ? ' active' : ''}`}>
                                    <div className="coupon-card-header">
                                      <div className="coupon-code">{c.code}</div>
                                      <div className="coupon-type">{c.discountType} {c.discountValue}</div>
                                    </div>
                                    <div className="coupon-meta">
                                      Min: {fmtLKR(c.minInvoiceAmount)} • Expires: {fmtDate(c.expiryDate)}
                                    </div>
                                    <div className="row end coupon-actions">
                                      {active ? (
                                        <>
                                          <span className="applied-label"> Applied</span>
                                          <button
                                            className="btn ghost"
                                            onClick={() => {
                                              setCouponId(null); setDiscount(0);
                                              setSelectedIssuedId(''); setAppliedIssuedCode('');
                                            }}
                                          >
                                            Clear
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          className="btn secondary"
                                          onClick={() => applyIssued(c)}
                                        >
                                          Apply
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                      {loadingCoupons && (
                        <div className="muted">Loading available coupons…</div>
                      )}
                      {!loadingCoupons && myCoupons.length === 0 && (
                        <div className="muted">No coupons available for this invoice.</div>
                      )}

                      <div className="promo-toggle">
                        <button
                          className="btn big-promo-toggle"
                          type="button"
                          onClick={() => setShowPromoCode(p => !p)}
                        >
                          {showPromoCode ? 'Hide Promo Code' : 'Have a promo code?'}
                        </button>

                        {showPromoCode && (
                          <div className="promo-code-wrap">
                            <div className="row">
                              <input
                                className="input"
                                placeholder="Enter code"
                                value={couponCode}
                                onChange={e => setCouponCode(e.target.value)}
                                disabled={paying}
                                aria-invalid={
                                  couponCode.trim() && !COUPON_REGEX.test(couponCode.trim())
                                }
                              />
                              <button
                                className="btn secondary"
                                onClick={() => applyCoupon()}
                                disabled={!invoice || invoiceBlocked}
                              >
                                Apply
                              </button>
                              {(couponId || selectedIssuedId) && (
                                <button
                                  className="btn ghost"
                                  onClick={() => {
                                    setCouponId(null); setDiscount(0);
                                    setCouponCode(''); setSelectedIssuedId(''); setAppliedIssuedCode('');
                                  }}
                                >
                                  Clear
                                </button>
                              )}
                            </div>

                            {couponCode.trim() && !COUPON_REGEX.test(couponCode.trim()) && (
                              <div className="error promo-error">
                                Use 3–32 characters: letters, numbers, - _ .
                              </div>
                            )}
                            {/* {appliedIssuedCode && discount > 0 && (
                  <p className="hint applied-hint">
                    Applied {appliedIssuedCode}: -{fmtLKR(discount)}
                  </p>
                )} */}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="panel panel-peach stripe-panel">
              {!invoice && <div className="muted">Load an invoice to continue.</div>}
              {invoice && invoiceBlocked && <div className="notice error">This invoice cannot be paid.</div>}
              {invoice && ownerId && !invoiceBlocked && (
                <StripePayBox
                  key={invoice._id}
                  invoice={invoice}
                  ownerId={ownerId}
                  couponId={couponId}
                  amountToCharge={amountAfterDiscount}
                  onSuccess={({ paymentIntentId, amount, email }) => {
                    const qp = new URLSearchParams();
                    qp.set('invoice', invoice._id);
                    qp.set('pi', paymentIntentId);
                    qp.set('amount', String(amount));
                    if (email) qp.set('email', email);
                    navigate(`/pay/success?${qp.toString()}`);
                  }}
                  onPayStateChange={setPaying}
                />
              )}
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">Review Invoice</h2>
            {!invoiceParam && <div className="muted">No invoice id in URL.</div>}
            {loadingInvoice && <div className="muted">Loading invoice…</div>}
            {error && <div className="error">{error}</div>}

            {invoice && (
              <>
                <div className="summary-grid">
                  <div className="summary-item"><span className="label">Invoice</span><span className="value mono">{invoice.invoiceID || invoice._id}</span></div>
                  <div className="summary-item"><span className="label">Status</span><span className="value"><span className={`status-pill ${statusColor(invoice.status)}`}>{invoice.status}</span></span></div>
                  <div className="summary-item"><span className="label">Due Date</span><span className="value">{fmtDate(invoice.dueDate)}</span></div>
                </div>

                <div className="items-wrap">
                  <div className="items-header"><div>Description</div><div>Qty</div><div>Rate</div><div className="right">Line Total</div></div>
                  <div className="items-body">
                    {(invoice.lineItems || []).map((li, i) => {
                      const qty = toNum(li.quantity), unit = toNum(li.unitPrice);
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
                      <span className="mono">{fmtLKR(invoice?.tax ?? totalBeforeDiscount * 0.08)}</span>
                    </div>
                    <div className="totals-row"><span>Subtotal</span><span className="mono">{fmtLKR(totalBeforeDiscount)}</span></div>
                    {discount > 0 && <div className="totals-row"><span>Discount{appliedIssuedCode ? ` (${appliedIssuedCode})` : ''}</span><span className="mono">- {fmtLKR(discount)}</span></div>}
                    <div className="totals-row grand"><span>Amount to Pay</span><span className="mono">{fmtLKR(amountAfterDiscount)}</span></div>
                  </div>

                  {invoiceBlocked && (
                    <div className="notice error invoice-blocked">
                      This invoice is {invoice.status} and cannot be paid.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>


        </div>
      </div>
    </div>
    </div>
    </>
  );
}

function StripePayBox({ invoice, ownerId, couponId, amountToCharge, onSuccess, onPayStateChange }) {
  const [clientSecret, setClientSecret] = useState('');
  const [serverAmount, setServerAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!invoice) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const resp = await api.post('/payment/stripe', { invoiceID: invoice._id, userID: ownerId, couponId: couponId || undefined });
        if (!cancelled) {
          setClientSecret(resp.clientSecret);
          if (resp.amount != null) setServerAmount(resp.amount);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to initialize payment');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [couponId, invoice, ownerId]);

  const appearance = useMemo(() => ({ appearance: { theme: 'stripe' } }), []);
  if (!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY) return <div className="muted">Stripe key missing</div>;
  if (loading) return <div className="muted">Preparing secure payment…</div>;
  if (error) return <div className="error">{error}</div>;
  if (!clientSecret) return <div className="error">No client secret</div>;
  if (amountToCharge <= 0) return <div className="error">The payable amount is zero after discounts. Remove a coupon to continue.</div>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, ...appearance }}>
      <StripeCard clientSecret={clientSecret} amount={serverAmount} invoice={invoice} onSuccess={onSuccess} onPayStateChange={onPayStateChange} />
    </Elements>
  );
}

function StripeCard({ clientSecret, amount, invoice, onSuccess, onPayStateChange }) {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [postal, setPostal] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false, postal: false });
  const [cardComplete, setCardComplete] = useState({ number: false, expiry: false, cvc: false });
  const [expiredPast, setExpiredPast] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [paying, setPaying] = useState(false);
  const [showAbortConfirm, setShowAbortConfirm] = useState(false);

  useEffect(() => {
    if (!invoice) return;
    const nm = invoice?.userID?.name || invoice?.user?.name || '';
    const em = invoice?.userID?.email || invoice?.user?.email || '';
    if (nm) setName(prev => prev || nm);
    if (em) setEmail(prev => prev || em);
  }, [invoice]);

  useEffect(() => {
    const handler = (e) => {
      if (paying) {
        e.preventDefault();
        e.returnValue = 'Payment is processing. Are you sure you want to leave?';
        return e;
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [paying]);

  const errors = useMemo(() => {
    const e = {};
    if (!name || name.trim().length < 2) e.name = 'Enter the name on card (min 2 characters).';
    if ((email && !EMAIL_REGEX.test(email)) || (submitAttempted && !email)) e.email = 'Enter a valid email address.';
    if (postal && !POSTAL_REGEX.test(postal)) e.postal = 'Must be exactly 5 digits (e.g. 10115).';
    if (submitAttempted) {
      if (!cardComplete.number) e.number = 'Card number is incomplete.';
      if (!cardComplete.expiry) e.expiry = 'Expiry is incomplete.';
      if (!cardComplete.cvc) e.cvc = 'CVC is incomplete.';
    }
    if (expiredPast) e.expiry = 'Expiry date is in the past.';
    return e;
  }, [name, email, postal, cardComplete, submitAttempted, expiredPast]);

  const formValid = useMemo(() => {
    return (
      name.trim().length >= 2 &&
      EMAIL_REGEX.test(email) &&
      cardComplete.number &&
      cardComplete.expiry &&
      cardComplete.cvc &&
      (!postal || POSTAL_REGEX.test(postal))
    );
  }, [name, email, cardComplete, postal]);

  useEffect(() => {
    onPayStateChange?.(paying);   // bubble up to OnlinePay whenever paying changes
  }, [paying, onPayStateChange]);

  const pay = async () => {
    if (!stripe || !elements) return;
    setSubmitAttempted(true);
    setTouched(t => ({ ...t, name: true, email: true }));
    if (Object.keys(errors).length > 0) { toast.error('Please fix the highlighted fields.'); return; }
    try {
      setPaying(true);
      const cardNumberEl = elements.getElement(CardNumberElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberEl,
          billing_details: {
            name: name.trim(),
            email: email.trim(),
            address: postal ? { postal_code: postal.trim() } : undefined,
          },
        },
      });
      if (result.error) { toast.error(result.error.message || 'Payment failed'); setPaying(false); return; }
      const pi = result.paymentIntent;
      if (pi.status !== 'succeeded') { toast.error(`Payment status: ${pi.status}`); setPaying(false); return; }
      await api.post('/payment/stripe/confirm', { paymentIntentId: pi.id, email: email.trim() });
      onSuccess?.({ paymentIntentId: pi.id, amount, email });
    } catch (e) {
      toast.error(e.message || 'Payment error');
      setPaying(false);
    }
  };

  const handleCancelClick = () => {
    if (paying) setShowAbortConfirm(true);
    else window.history.back();
  };

  const elStyle = { style: { base: { fontSize: '16px', color: '#54413C', '::placeholder': { color: '#8B6A5F' }, fontFamily: 'Roboto, sans-serif' }, invalid: { color: '#b91c1c' } } };

  return (
    <>
      <div className="charge-line charge-pill">
        You will be charged: <b>{fmtLKR(amount)}</b>
        {invoice && invoice.total && amount < invoice.total && (
          <span className="discount-note">
            (discount applied: -{fmtLKR(invoice.total - amount)})
          </span>
        )}
      </div>
      <div className="grid-2">
        <div className="field">
          <label>Name on card</label>
          <input className={`input ${touched.name && errors.name ? 'input-error' : ''}`} value={name} onBlur={() => setTouched(t => ({ ...t, name: true }))} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" aria-invalid={touched.name && !!errors.name} />
          {touched.name && errors.name && <div className="error">{errors.name}</div>}
        </div>
        <div className="field">
          <label>Email (for receipt)</label>
          <input className={`input ${(touched.email || email) && errors.email ? 'input-error' : ''}`} value={email} onBlur={() => setTouched(t => ({ ...t, email: true }))} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" aria-invalid={(touched.email || !!email) && !!errors.email} />
          {(touched.email || !!email) && errors.email && <div className="error">{errors.email}</div>}
        </div>
      </div>
      <div className="field">
        <label>Card number</label>
        <div className={`stripe-control ${submitAttempted && errors.number ? 'input-error' : ''}`}><CardNumberElement options={elStyle} onChange={(e) => setCardComplete(c => ({ ...c, number: e.complete }))} /></div>
        {submitAttempted && errors.number && <div className="error">{errors.number}</div>}
      </div>
      <div className="stripe-grid-3">
        <div className="field">
          <label>Expiry (MM/YY)</label>
          <div className={`stripe-control ${errors.expiry ? 'input-error' : ''}`}><CardExpiryElement options={elStyle} onChange={(e) => { setCardComplete(c => ({ ...c, expiry: e.complete })); const msg = e?.error?.message || ''; setExpiredPast(e.complete && /past/i.test(msg)); }} /></div>
          {errors.expiry && <div className="error">{errors.expiry}</div>}
        </div>
        <div className="field">
          <label>CVC</label>
          <div className={`stripe-control ${submitAttempted && errors.cvc ? 'input-error' : ''}`}>
            <CardCvcElement
              options={elStyle}
              onChange={(e) => setCardComplete(c => ({ ...c, cvc: e.complete }))}
            />
          </div>
          {submitAttempted && errors.cvc && <div className="error">{errors.cvc}</div>}
          <div className="fm-p-hint">3 digits on the back of your card</div>
        </div>
        <div className="field">
          <label>ZIP / Postal</label>
          <input
            className={`input ${touched.postal && errors.postal ? 'input-error' : ''}`}
            placeholder="e.g. 10115"
            value={postal}
            onBlur={() => setTouched(t => ({ ...t, postal: true }))}
            onChange={(e) => {
              // only allow numbers, and max 5 characters
              const raw = e.target.value.replace(/\D/g, ''); // strip non-digits
              if (raw.length <= 5) setPostal(raw);          // store up to 5 digits
            }}
            maxLength={5}  // also enforces at HTML level
            pattern="\d{5}" // for native browser validation / mobile keyboards
            inputMode="numeric" // better mobile numeric keypad
            aria-invalid={touched.postal && !!errors.postal}
          />
          {touched.postal && errors.postal && <div className="error">{errors.postal}</div>}
        </div>
      </div>
      <div className="row end pay-actions">
        <button className="btn ghost" onClick={handleCancelClick}>Cancel</button>
        <button
          className="btn secondary"
          onClick={pay}
          disabled={!stripe || !elements || paying}
          title={!formValid ? "Please fill all required details" : ""}
        >
          {paying ? 'Processing…' : 'Pay now'}
        </button>
      </div>
      {showAbortConfirm && (
        <div className="modal">
          <div className="modal-box">
            <h3>Abort Payment?</h3>
            <p>A payment is currently processing. Do you want to abort it?</p>
            <div className="row end">
              <button className="btn ghost" onClick={() => setShowAbortConfirm(false)}>Keep waiting</button>
              <button className="btn danger" onClick={() => { setPaying(false); setShowAbortConfirm(false); window.history.back(); }}>
                Abort Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
function fmtLKR(n) { try { return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 2 }).format(Number(n) || 0); } catch { return `LKR ${Number(n || 0).toFixed(2)}`; } }
function fmtDate(d) { if (!d) return '-'; try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return String(d); } }
function statusColor(s) { if (!s) return 'neutral'; const x = String(s).toLowerCase(); if (x.includes('paid')) return 'paid'; if (x.includes('overdue')) return 'overdue'; if (x.includes('pending')) return 'pending'; if (x.includes('refunded')) return 'refunded'; if (x.includes('cancel')) return 'cancelled'; return 'neutral'; }