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

  const [refundView, setRefundView] = useState(null); // view existing request

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
          api.get('/refunds'),
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
    () => payments.filter(p => p._id !== newPaymentId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)),
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
        api.get('/refunds'),
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
      {/* …Rest of your JSX including tables and modals… */}
    </div>
  );
}

export function pillClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'pending') return 'pending';
  if (s === 'approved') return 'paid';
  if (s === 'rejected') return 'refunded';
  return '';
}

export function StatusPill({ status }) {
  const s = (status || '').toLowerCase();
  let cls = 'status-pill';
  if (s.includes('pending')) cls += ' pending';
  else if (s.includes('completed') || s.includes('paid')) cls += ' paid';
  else if (s.includes('refunded')) cls += ' refunded';
  return <span className={cls}>{status || '-'}</span>;
}

export function fmtLKR(n) {
  try { return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 2 }).format(Number(n) || 0); } 
  catch { return `LKR ${Number(n || 0).toFixed(2)}`; }
}
export function toNum(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
export function fmtDate(d) { if (!d) return '-'; try { return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }); } catch { return String(d); } }
export function fmtDateTime(d) { if (!d) return '-'; try { return new Date(d).toLocaleString(); } catch { return String(d); } }
