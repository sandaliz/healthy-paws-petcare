import React, { useEffect, useMemo, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { api } from '../financeApi';
import Tag from './components/Tag';
import Skeleton from './components/Skeleton';
import Modal from './components/Modal';
import {
  Search, RefreshCcw, CheckCircle2, Eye, Copy, ChevronLeft, ChevronRight
} from 'lucide-react';
import '../css/dashboard.css';

const METHOD_OPTIONS = ['All', 'Cash', 'Card', 'BankTransfer', 'Stripe'];
const STATUS_OPTIONS = ['All', 'Pending', 'Completed', 'Failed', 'Refunded'];

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('All');
  const [status, setStatus] = useState('All');
  const [excludeFailed, setExcludeFailed] = useState(true);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [view, setView] = useState(null);
  const [confirmPay, setConfirmPay] = useState(null); // confirm popup

  const load = async () => {
    try {
      setLoading(true);
      const params = excludeFailed ? '?excludeFailed=1' : '';
      const data = await api.get(`/payments${params}`);
      setPayments(data.payments || []);
    } catch (e) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [excludeFailed]);

  const filtered = useMemo(() => {
    let arr = payments || [];
    if (method !== 'All') arr = arr.filter(p => (p.method || '') === method);
    if (status !== 'All') arr = arr.filter(p => (p.status || '') === status);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(p => {
        const pid = (p.paymentID || '').toLowerCase();
        const inv = (p.invoiceID?.invoiceID || '').toLowerCase();
        const owner = (p.userID?.OwnerName || p.invoiceID?.userID?.OwnerName || '').toLowerCase();
        const email = (p.userID?.OwnerEmail || p.invoiceID?.userID?.OwnerEmail || '').toLowerCase();
        return pid.includes(q) || inv.includes(q) || owner.includes(q) || email.includes(q);
      });
    }
    return arr;
  }, [payments, method, status, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const confirmOffline = async (p) => {
    try {
      await api.put(`/payment/offline/confirm/${p._id}`);
      toast.success('Offline payment confirmed');
      setConfirmPay(null);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Confirm failed');
    }
  };

  const copyInvoiceLink = async (invId) => {
    const url = `${window.location.origin}/pay/online?invoice=${invId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Payment link copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-head">
        <h2>Payments</h2>
        <div className="row">
          <button className="btn" onClick={load}><RefreshCcw size={16} /> Refresh</button>
        </div>
      </div>

      <div className="fm-toolbar">
        <div className="fm-filters">
          <div className="fm-search">
            <Search size={16} />
            <input
              className="input"
              placeholder="Search payment ID, invoice, owner, email"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="input" value={method} onChange={(e) => { setMethod(e.target.value); setPage(1); }}>
            {METHOD_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="input" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <label className="check" style={{ marginLeft: 6 }}>
            <input type="checkbox" checked={excludeFailed} onChange={(e) => { setExcludeFailed(e.target.checked); setPage(1); }} />
            <span>Exclude failed</span>
          </label>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <Skeleton rows={8} />
        ) : (
          <>
            <table className="fm-table">
              <thead>
                <tr>
                  <th>Payment</th>
                  <th>Invoice</th>
                  <th>Owner</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 && (
                  <tr><td colSpan={7} className="muted">No payments found</td></tr>
                )}
                {pageItems.map(p => (
                  <tr key={p._id}>
                    <td className="mono">{p.paymentID}</td>
                    <td className="mono">{p.invoiceID?.invoiceID || '-'}</td>
                    <td>
                      <div className="owner">
                        <div className="name">
                          {p.userID?.OwnerName || p.invoiceID?.userID?.OwnerName || '-'}
                        </div>
                        <div className="email">
                          {p.userID?.OwnerEmail || p.invoiceID?.userID?.OwnerEmail || '-'}
                        </div>
                      </div>
                    </td>
                    <td><MethodPill method={p.method} /></td>
                    <td className="mono">{fmtLKR(p.amount)}</td>
                    <td><Tag status={p.status} /></td>
                    <td className="right">
                      <div className="row end">
                        <button className="btn ghost" title="View" onClick={() => setView(p)}><Eye size={16} /></button>
                        <button className="btn ghost" title="Copy client link" onClick={() => copyInvoiceLink(p.invoiceID?._id)}><Copy size={16} /></button>
                        {p.status === 'Pending' && p.method !== 'Stripe' && (
                          <button className="btn secondary" title="Confirm offline" onClick={() => setConfirmPay(p)}>
                            <CheckCircle2 size={16} /> Confirm
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="fm-pagination">
              <button className="btn ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={16} /> Prev
              </button>
              <div>Page {page} of {totalPages}</div>
              <button className="btn ghost" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      {view && <PaymentModal open={!!view} onClose={() => setView(null)} p={view} />}

      {confirmPay && (
        <ConfirmModal
          open={!!confirmPay}
          onClose={() => setConfirmPay(null)}
          title="Confirm offline payment"
          message={`Confirm marking ${confirmPay.paymentID} as Completed?`}
          onConfirm={() => confirmOffline(confirmPay)}
        />
      )}
    </div>
  );
}

function PaymentModal({ open, onClose, p }) {
  return (
    <Modal open={open} onClose={onClose} title={`Payment ${p.paymentID}`}>
      <div className="summary vlist">
        <div className="kv"><span>Owner</span><b>{p.userID?.OwnerName || p.invoiceID?.userID?.OwnerName || '-'}</b></div>
        <div className="kv"><span>Email</span><b>{p.userID?.OwnerEmail || p.invoiceID?.userID?.OwnerEmail || '-'}</b></div>
        <div className="kv"><span>Method</span><b><MethodPill method={p.method} /></b></div>
        <div className="kv"><span>Status</span><b><Tag status={p.status} /></b></div>
        <div className="kv"><span>Amount</span><b>{fmtLKR(p.amount)}</b></div>
        <div className="kv"><span>Invoice</span><b className="mono">{p.invoiceID?.invoiceID || '-'}</b></div>
        <div className="kv"><span>Created</span><b>{fmtDate(p.createdAt)}</b></div>
      </div>
      <div className="row end" style={{ marginTop: 10 }}>
        <button className="btn ghost" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

function ConfirmModal({ open, onClose, title, message, onConfirm }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="vlist"><div className="kv"><b>{message}</b></div></div>
      <div className="row end" style={{ marginTop: 10 }}>
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" onClick={onConfirm}>Yes, proceed</button>
      </div>
    </Modal>
  );
}

function MethodPill({ method }) {
  const m = (method || '').toLowerCase();
  let cls = 'method-pill';
  if (m === 'cash') cls += ' cash';
  else if (m === 'card') cls += ' card';
  else if (m === 'banktransfer') cls += ' bank';
  else if (m === 'stripe') cls += ' stripe';
  return <span className={cls}>{method}</span>;
}

function fmtLKR(n) {
  try { return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(Number(n) || 0); }
  catch { return `LKR ${Number(n || 0).toFixed(2)}`; }
}
function fmtDate(d) {
  if (!d) return '-';
  try { return new Date(d).toLocaleString(); } catch { return String(d); }
}