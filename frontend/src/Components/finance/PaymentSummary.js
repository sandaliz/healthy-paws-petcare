import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { api } from './financeApi';
import Modal from './dashboard/components/Modal';
import './css/clientPay.css';

const REFUND_WINDOW_DAYS = 7;

export default function PaymentSummary() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const userId = params.get('user') || localStorage.getItem('hp_ownerId') || '';
  const newPaymentId = params.get('new') || '';

  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(false);

  const [viewInvId, setViewInvId] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loadingInv, setLoadingInv] = useState(false);

  const [refundPayment, setRefundPayment] = useState(null);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const [refundView, setRefundView] = useState(null);

  useEffect(() => {
    if (!userId) {
      toast.error('Missing Account ID. Go to Payment Options to set it.');
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const [pays, reqs] = await Promise.all([
          api.get(`/payments?userId=${userId}`),
          api.get(`/refunds?userId=${userId}`),
        ]);
        setPayments(pays?.payments || []);
        setRefunds((reqs?.requests || []).filter(r => r.userID?._id === userId));
      } catch (e) {
        toast.error(e.message || 'Failed to load your data');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const refundByPayment = useMemo(() => {
    const m = {};
    for (const r of refunds) {
      const pid = r.paymentID?._id || r.paymentID;
      if (!pid) continue;
      const prev = m[pid];
      if (!prev || new Date(r.createdAt) > new Date(prev.createdAt)) m[pid] = r;
    }
    return m;
  }, [refunds]);

  const highlighted = useMemo(
    () => payments.find(p => p._id === newPaymentId) || null,
    [payments, newPaymentId]
  );
  const others = useMemo(
    () => payments.filter(p => p._id !== newPaymentId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [payments, newPaymentId]
  );

  const openInvoice = async (invoiceMongoId) => {
    try {
      setLoadingInv(true);
      setViewInvId(invoiceMongoId);
      const inv = await api.get(`/invoice/${invoiceMongoId}`);
      setInvoice(inv);
    } catch (e) {
      toast.error(e.message || 'Failed to load invoice');
    } finally {
      setLoadingInv(false);
    }
  };

  function isRefundable(p) {
    if (!p || p.status !== 'Completed') return false;
    const daysSince = (Date.now() - new Date(p.createdAt).getTime()) / 86400000;
    const left = Math.max(0, Number(p.amount || 0) - Number(p.refundedAmount || 0));
    return daysSince <= REFUND_WINDOW_DAYS && left > 0;
  }

  function canRequestRefund(p, existing) {
    if (!isRefundable(p)) return false;
    if (existing) return false;
    return true;
  }

  const startRefund = (p) => {
    const left = Math.max(0, Number(p.amount || 0) - Number(p.refundedAmount || 0));
    setRefundPayment(p);
    setRefundAmount(left);
    setRefundReason('');
  };

  const submitRefund = async () => {
    if (!refundPayment || !userId) return;
    if (!(refundAmount > 0)) return toast.error('Amount must be > 0');
    if (!refundReason.trim()) return toast.error('Please enter a reason');

    try {
      setSubmittingRefund(true);
      await api.post('/refund', {
        paymentID: refundPayment._id,
        userID: userId,
        amount: Number(refundAmount),
        reason: refundReason.trim(),
      });
      toast.success('Refund request submitted');
      setRefundPayment(null);
      const [pays, reqs] = await Promise.all([
        api.get(`/payments?userId=${userId}`),
        api.get(`/refunds?userId=${userId}`),
      ]);
      setPayments(pays?.payments || []);
      setRefunds((reqs?.requests || []).filter(r => r.userID?._id === userId));
    } catch (e) {
      toast.error(e.message || 'Failed to submit refund');
    } finally {
      setSubmittingRefund(false);
    }
  };

  return (
    <div className="pay-wrap">
      <Toaster position="top-right" />
      <div className="page-header">
        <div>
          <h1>Your Payments</h1>
          <p className="muted">Pending offline payments show in yellow. Refunds show their status and details.</p>
        </div>
        <button className="btn ghost" onClick={() => nav('/pay')}>Back to Payment Options</button>
      </div>

      {highlighted && (
        <div className="card psum-highlight-card">
          <h3 className="psum-highlight-title">Pending offline payment</h3>
          <div className="summary-grid">
            <div className="summary-item"><span className="label">Payment</span><span className="value mono">{highlighted.paymentID}</span></div>
            <div className="summary-item"><span className="label">Invoice</span><span className="value mono">{highlighted.invoiceID?.invoiceID || '-'}</span></div>
            <div className="summary-item"><span className="label">Method</span><span className="value">{highlighted.method}</span></div>
            <div className="summary-item"><span className="label">Status</span><span className="value"><StatusPill status={highlighted.status} /></span></div>
            <div className="summary-item"><span className="label">Amount</span><span className="value mono">{fmtLKR(highlighted.amount)}</span></div>
            <div className="summary-item"><span className="label">Created</span><span className="value">{fmtDateTime(highlighted.createdAt)}</span></div>
          </div>
          <div className="muted psum-highlight-note">
            Finance will confirm and email your receipt.
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="psum-all-title">All payments</h3>
        <div className="table-wrap">
          <table className="fm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Invoice</th>
                <th>Method</th>
                <th className="right">Amount</th>
                <th>Status</th>
                <th>Refund</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {others.length === 0 && (
                <tr><td colSpan={7} className="muted">No payments yet</td></tr>
              )}
              {others.map(p => {
                const invId = p.invoiceID?._id || null;
                const rr = refundByPayment[p._id];
                const left = Math.max(0, Number(p.amount || 0) - Number(p.refundedAmount || 0));
                return (
                  <tr key={p._id}>
                    <td>{fmtDateTime(p.createdAt)}</td>
                    <td className="mono">{p.invoiceID?.invoiceID || '-'}</td>
                    <td>{p.method}</td>
                    <td className="mono right">{fmtLKR(p.amount)}</td>
                    <td><StatusPill status={p.status} /></td>
                    <td>
                      {rr ? (
                        <button className={`status-pill ${pillClass(rr.status)}`} onClick={() => setRefundView(rr)}>
                          {rr.status}
                        </button>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td className="right">
                      <div className="row end">
                        {invId ? (
                          <button className="btn ghost" onClick={() => openInvoice(invId)}>View</button>
                        ) : (
                          <span className="muted">—</span>
                        )}
                        {canRequestRefund(p, rr) ? (
                          <button className="btn secondary" onClick={() => startRefund(p)}>Request refund</button>
                        ) : rr ? (
                          <button className="btn ghost" onClick={() => setRefundView(rr)}>View refund</button>
                        ) : (
                          <span className="muted">{p.status === 'Completed' ? `Refundable left: ${fmtLKR(left)}` : '—'}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!viewInvId} onClose={() => { setViewInvId(null); setInvoice(null); }} title={`Invoice details`}>
        {loadingInv && <div className="muted">Loading…</div>}
        {invoice && (
          <div>
            <div className="summary vlist">
              <div className="kv"><span>Invoice</span><b className="mono">{invoice.invoiceID || invoice._id}</b></div>
              <div className="kv"><span>Status</span><b><StatusPill status={invoice.status} /></b></div>
              <div className="kv"><span>Due</span><b>{fmtDate(invoice.dueDate)}</b></div>
              <div className="kv"><span>Owner</span><b>{invoice.userID?.name || '-'}</b></div>
              <div className="kv"><span>Email</span><b>{invoice.userID?.email || '-'}</b></div>
            </div>
            <div className="items-wrap psum-invoice-items">
              <div className="items-header">
                <div>Description</div><div>Qty</div><div>Rate</div><div className="right">Line Total</div>
              </div>
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
                <div className="totals-row"><span>Subtotal</span><span className="mono">{fmtLKR(invoice.subtotal)}</span></div>
                <div className="totals-row"><span>Tax</span><span className="mono">{fmtLKR(invoice.tax)}</span></div>
                <div className="totals-row grand"><span>Total</span><span className="mono">{fmtLKR(invoice.total)}</span></div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!refundPayment} onClose={() => setRefundPayment(null)} title={`Request refund — ${refundPayment?.paymentID || ''}`}>
        {refundPayment && (
          <>
            <div className="summary vlist">
              <div className="kv"><span>Method</span><b>{refundPayment.method}</b></div>
              <div className="kv"><span>Status</span><b><StatusPill status={refundPayment.status} /></b></div>
              <div className="kv"><span>Paid</span><b className="mono">{fmtLKR(refundPayment.amount)}</b></div>
              <div className="kv"><span>Refunded</span><b className="mono">{fmtLKR(refundPayment.refundedAmount || 0)}</b></div>
              <div className="kv"><span>Date</span><b>{fmtDateTime(refundPayment.createdAt)}</b></div>
            </div>
            <div className="field">
              <label>Amount to refund</label>
              <input className="input" type="number" min="0" step="0.01" value={refundAmount} onChange={(e) => setRefundAmount(Number(e.target.value))} />
              <div className="hint">Max: {fmtLKR(Math.max(0, Number(refundPayment.amount||0) - Number(refundPayment.refundedAmount||0)))}</div>
            </div>
            <div className="field">
              <label>Reason</label>
              <textarea className="input" rows={4} placeholder="Tell us why you’re requesting a refund" value={refundReason} onChange={(e) => setRefundReason(e.target.value)} />
            </div>
            <div className="row end psum-refund-actions">
              <button className="btn ghost" onClick={() => setRefundPayment(null)}>Cancel</button>
              <button className="btn primary" onClick={submitRefund} disabled={submittingRefund}>{submittingRefund ? 'Submitting…' : 'Submit request'}</button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={!!refundView} onClose={() => setRefundView(null)} title={`Refund request — ${refundView?.paymentID?.paymentID || ''}`}>
        {refundView && (
          <div className="summary vlist">
            <div className="kv"><span>Status</span><b className={`status-pill ${pillClass(refundView.status)}`}>{refundView.status}</b></div>
            <div className="kv"><span>Amount</span><b className="mono">{fmtLKR(refundView.amount)}</b></div>
            <div className="kv"><span>Reason</span><b className="pre-wrap">{refundView.reason || '-'}</b></div>
            {refundView.status === 'Rejected' && (
              <div className="kv"><span>Rejection</span><b className="pre-wrap">{refundView.reasonRejected || '-'}</b></div>
            )}
            <div className="kv"><span>Requested</span><b>{fmtDateTime(refundView.createdAt)}</b></div>
            {refundView.processedAt && <div className="kv"><span>Processed</span><b>{fmtDateTime(refundView.processedAt)}</b></div>}
            {refundView.status === 'Pending' && (
              <div className="notice psum-refund-pending">Your refund is being reviewed by Finance.</div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function pillClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'pending') return 'pending';
  if (s === 'approved') return 'paid';
  if (s === 'rejected') return 'refunded';
  return '';
}

function StatusPill({ status }) {
  const s = (status || '').toLowerCase();
  let cls = 'status-pill';
  if (s.includes('pending')) cls += ' pending';
  else if (s.includes('completed') || s.includes('paid')) cls += ' paid';
  else if (s.includes('refunded')) cls += ' refunded';
  return <span className={cls}>{status || '-'}</span>;
}

function fmtLKR(n) { 
  try { return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 2 }).format(Number(n) || 0); } 
  catch { return `LKR ${Number(n || 0).toFixed(2)}`; } 
}
function toNum(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function fmtDate(d) { if (!d) return '-'; try { return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }); } catch { return String(d); } }
function fmtDateTime(d) { if (!d) return '-'; try { return new Date(d).toLocaleString(); } catch { return String(d); } }