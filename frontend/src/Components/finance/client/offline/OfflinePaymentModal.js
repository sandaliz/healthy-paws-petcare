import React, { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../../services/financeApi';
import { fmtDate, fmtLKR, toNum } from '../../utils/financeFormatters';
import '../../css/clientPay.css';

const COUPON_REGEX = /^[A-Za-z0-9._-]{3,32}$/;

export default function OfflinePaymentModal({ invoice, ownerId, onClose, onSuccess, hideSubtitle = false, subtitle }) {
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState({ id: null, discount: 0 });
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [myCoupons, setMyCoupons] = useState([]);
  const [applying, setApplying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [allowCoupon, setAllowCoupon] = useState(false);

  const subtotal = useMemo(() => computeInvoiceTotal(invoice), [invoice]);
  const amountAfterDiscount = Math.max(0, subtotal - (coupon.discount || 0));
  const isCartInvoice = invoice && !invoice.linkedAppointment && !invoice.linkedDaycare;
  const shouldHideSubtitle = hideSubtitle || !!isCartInvoice;

  const handleApplyCode = async () => {
    try {
      if (!couponCode.trim()) return toast.error('Enter coupon code');
      if (!COUPON_REGEX.test(couponCode.trim())) return toast.error('Invalid coupon format');
      setApplying(true);
      const resp = await api.post('/coupon/validate', { code: couponCode, invoiceTotal: subtotal });
      setCoupon({ id: resp.couponId, discount: Number(resp.discount || 0) });
      toast.success(`Discount applied: -${fmtLKR(resp.discount)}`);
    } catch {
      if (!ownerId) return toast.error('Login required to use personal coupons');
      try {
        const res = await api.post('/coupon/validate-user', { code: couponCode, userID: ownerId, invoiceTotal: subtotal });
        setCoupon({ id: res.couponId, discount: Number(res.discount || 0) });
        toast.success(`Personal discount applied: -${fmtLKR(res.discount)}`);
      } catch (e) {
        setCoupon({ id: null, discount: 0 });
        toast.error(e.message || 'Coupon not valid');
      }
    } finally {
      setApplying(false);
    }
  };

  const confirmOffline = async () => {
    try {
      setBusy(true);
      const resp = await api.post('/payment/offline', {
        invoiceID: invoice._id,
        userID: ownerId,
        method: 'Cash',
        couponId: coupon.id || undefined
      });
      toast.success('Payment recorded! Pay at reception.');
      onClose();
      onSuccess(resp.payment._id);
    } catch (e) {
      toast.error(e.message || 'Failed to record offline payment');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="f-offline-modal">
      <div className="f-offline-modal-box">
        <h3>Confirm Offline Payment</h3>
        {!shouldHideSubtitle && (
          <p className="muted offline-msg">
            {subtitle ?? (
              <>This will create a <b>pending payment</b>. Please pay at reception{invoice ? ` before ${fmtDate(invoice.dueDate)}` : ''}.</>
            )}
          </p>
        )}

        <div className="f-offline-coupon-toggle">
          <label>
            <input
              type="checkbox"
              checked={allowCoupon}
              onChange={e => {
                setAllowCoupon(e.target.checked);
                if (e.target.checked) {
                  setLoadingCoupons(true);
                  api
                    .get(`/coupon/user-available?userId=${ownerId}&invoiceTotal=${subtotal}`)
                    .then(res => setMyCoupons(res.coupons || []))
                    .finally(() => setLoadingCoupons(false));
                }
              }}
            />
            Apply coupon?
          </label>
        </div>

        {allowCoupon && (
          <div className="f-offline-coupon-body">
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
                        onClick={() =>
                          setCoupon({ id: c.couponId, discount: c.discountValue })
                        }
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

            <div className="f-offline-promo">
              <input
                className={`input ${couponCode.trim() && !COUPON_REGEX.test(couponCode.trim())
                    ? 'input-error'
                    : ''
                  }`}
                placeholder="Have a promo code?"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
              />
              <button
                className="f-offline-btn"
                onClick={handleApplyCode}
                disabled={applying}
              >
                {applying ? 'Applying…' : 'Apply'}
              </button>
              {coupon.id && (
                <button
                  className="btn ghost"
                  onClick={() => setCoupon({ id: null, discount: 0 })}
                >
                  Clear
                </button>
              )}
            </div>

            {coupon.discount > 0 && (
              <div className="f-offline-applied">
                Discount applied: <b>{fmtLKR(coupon.discount)}</b> — Pay at counter:{' '}
                <b>{fmtLKR(amountAfterDiscount)}</b>
              </div>
            )}
          </div>
        )}

        <div className="row end offline-actions">
          <button className="btn ghost" onClick={onClose}>
            Close
          </button>
          <button
            className="btn primary"
            onClick={confirmOffline}
            disabled={busy}
          >
            {busy ? 'Saving…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

function computeInvoiceTotal(inv) {
  if (!inv) return 0;
  return (inv.lineItems || []).reduce((sum, li) => {
    const qty = toNum(li.quantity);
    const unit = toNum(li.unitPrice);
    return sum + (li.total != null ? toNum(li.total) : qty * unit);
  }, 0);
}