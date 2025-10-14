import React, { useEffect, useMemo, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { api } from '../services/financeApi';
import Modal from './components/Modal';
import Skeleton from './components/Skeleton';
import {
  Search, RefreshCcw, CheckCircle2, XCircle, Eye,
  ChevronLeft, ChevronRight, Plus
} from 'lucide-react';
import '../css/dashboard/refunds.css';
import { fmtDate, fmtLKR } from '../utils/financeFormatters'

const STATUS_OPTIONS = ['All', 'Pending', 'Approved', 'Rejected', 'Refunded'];

export default function Refunds() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [view, setView] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [approveModal, setApproveModal] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.get('/refunds');
      setItems(data.requests || []);
    } catch {
      toast.error('Failed to load refunds');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let arr = items || [];

    if (status !== 'All') arr = arr.filter(r => (r.status || '') === status);

    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(r => {
        const owner = (r.userID?.name || '').toLowerCase();
        const pid = (r.paymentID?.paymentID || '').toLowerCase();
        const inv = (r.paymentID?.invoiceID?.invoiceID || '').toLowerCase();
        return owner.includes(q) || pid.includes(q) || inv.includes(q);
      });
    }

    // Sort: Pending first, then by createdAt desc within
    arr = [...arr].sort((a, b) => {
      const isPendingA = a.status === 'Pending';
      const isPendingB = b.status === 'Pending';
      if (isPendingA && !isPendingB) return -1;
      if (isPendingB && !isPendingA) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return arr;
  }, [items, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const approve = async id => {
    try {
      await api.put(`/refund/approve/${id}`);
      toast.success('Refund approved');
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Approve failed');
    }
  };

  const reject = async (id, reasonRejected) => {
    if (!reasonRejected?.trim()) return toast.error('Reason required');
    try {
      await api.put(`/refund/reject/${id}`, { reasonRejected });
      toast.success('Refund rejected');
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Reject failed');
    }
  };

  const createRefund = async form => {
    try {
      await api.post('/refund', form);
      toast.success('Refund request created');
      setCreateOpen(false);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Create failed');
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      <div className="rf-head">
        <h2>Refunds</h2>
        <div className="rf-head-actions">
          <button className="fm-btn"><RefreshCcw size={16} /> Refresh</button>
          <button className="fm-btn-back"><Plus size={16} /> New Refund Request</button>
        </div>
      </div>

      <div className="rf-filters">
        <div className="rf-search">
          <Search size={16} />
          <input
            className="rf-search-input"
            placeholder="Search by owner, payment, invoice"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="rf-filter">
          <label>Status:</label>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="fm-card">
        {loading ? <Skeleton rows={8} /> : (
          <>
            <table className="fm-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Owner</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="right" style={{ width: "240px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 && (
                  <tr><td colSpan={5} className="muted">No refund requests</td></tr>
                )}
                {pageItems.map(r => (
                  <tr key={r._id}>
                    <td className="mono">{r.paymentID?.invoiceID?.invoiceID || '-'}</td>
                    <td>
                      <div className="owner">
                        <div className="name">{r.userID?.name || '-'}</div>
                        <div className="email">{r.userID?.email || '-'}</div>
                      </div>
                    </td>
                    <td className="mono">{fmtLKR(r.amount)}</td>
                    <td><span className={`tag-pill ${r.status?.toLowerCase()}`}>{r.status}</span></td>
                    <td className="right">
                      <div className="row end">
                        <button className="fm-btn fm-btn-ghost" onClick={() => setView(r)}><Eye size={16} /></button>
                        {r.status === 'Pending' && (
                          <>
                            <button
                              className="rf-approve-btn"
                              onClick={() => setApproveModal(r)}
                            >
                              <CheckCircle2 size={16} /> Approve
                            </button>
                            <button className="rf-reject-btn" onClick={() => setRejectModal(r)}>
                              <XCircle size={16} /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="fm-pagination">
              <button className="fm-btn fm-btn-ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={16} /> Prev
              </button>
              <div>Page {page} of {totalPages}</div>
              <button className="fm-btn fm-btn-ghost" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next <ChevronRight size={16} /></button>
            </div>
          </>
        )}
      </div>

      {view && <RefundViewModal open onClose={() => setView(null)} r={view} />}
      {rejectModal && (
        <RejectModal open onClose={() => setRejectModal(null)} onReject={reason => reject(rejectModal._id, reason)} />
      )}
      {createOpen && <CreateRefundModal open onClose={() => setCreateOpen(false)} onCreate={createRefund} />}
      {approveModal && (
        <ApproveModal
          open
          onClose={() => setApproveModal(null)}
          onApprove={(id) => {
            approve(id);
            setApproveModal(null);
          }}
          r={approveModal}
        />
      )}
    </div>
  );
}

function RefundViewModal({ open, onClose, r }) {
  return (
    <Modal open={open} onClose={onClose} title="Refund details">
      <div className="summary vlist">
        <div className="kv"><span>Payment</span><b className="mono">{r.paymentID?.paymentID || '-'}</b></div>
        <div className="kv"><span>Invoice</span><b className="mono">{r.paymentID?.invoiceID?.invoiceID || '-'}</b></div>
        <div className="kv"><span>Owner</span><b>{r.userID?.name || '-'}</b></div>
        <div className="kv"><span>Email</span><b>{r.userID?.email || '-'}</b></div>
        <div className="kv"><span>Amount</span><b>{fmtLKR(r.amount)}</b></div>
        <div className="kv"><span>Status</span><b><span className={`tag-pill ${r.status?.toLowerCase()}`}>{r.status}</span></b></div>
      </div>

      {r.reason && (
        <div className="rf-reason-block">
          <strong>Reason:</strong>
          <div className="reason-text">{r.reason}</div>
        </div>
      )}

      {r.reasonRejected && (
        <div className="rf-reason-block rejected">
          <strong>Rejected Reason:</strong>
          <div className="reason-text">{r.reasonRejected}</div>
        </div>
      )}

      <div className="summary vlist">
        <div className="kv"><span>Submitted</span><b>{fmtDate(r.createdAt)}</b></div>
        {r.processedAt && <div className="kv"><span>Processed</span><b>{fmtDate(r.processedAt)}</b></div>}
      </div>

      <div className="row end rf-view-actions">
        <button className="fm-btn fm-btn-ghost" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

function RejectModal({ open, onClose, onReject }) {
  const [reason, setReason] = useState('');
  return (
    <Modal open={open} onClose={onClose} title="Reject refund">
      <div className="field">
        <label>Reason</label>
        <textarea className="input" rows={4} value={reason} onChange={e => setReason(e.target.value)} />
      </div>
      <div className="row end rf-reject-actions">
        <button className="rf-cancel-btn" onClick={onClose}>Cancel</button>
        <button className="rf-reject-btn" onClick={() => onReject(reason)}>Reject</button>
      </div>
    </Modal>
  )
}

function CreateRefundModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState({ paymentID: '', reason: '' });
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  return (
    <Modal open={open} onClose={onClose} title="New Refund Request">
      <div className="field"><label>Payment ID</label>
        <input className="input" value={form.paymentID} onChange={e => set('paymentID', e.target.value)} /></div>
      <div className="field"><label>Reason</label>
        <textarea className="input" rows={3} value={form.reason} onChange={e => set('reason', e.target.value)} /></div>
      <div className="row end rf-create-actions">
        <button className="rf-cancel-btn" onClick={onClose}>Cancel</button>
        <button className="rf-submit-btn" onClick={() => onCreate(form)}>Submit</button>
      </div>
    </Modal>
  )
}

function ApproveModal({ open, onClose, onApprove, r }) {
  if (!r) return null;
  return (
    <Modal open={open} onClose={onClose} title="Approve Refund Request">
      <div className="summary vlist">
        <div className="kv">
          <span>Invoice</span>
          <b className="mono">{r.paymentID?.invoiceID?.invoiceID || '-'}</b>
        </div>
        <div className="kv">
          <span>Owner</span>
          <b>{r.userID?.name || '-'}</b>
        </div>
        <div className="kv">
          <span>Amount</span>
          <b className="mono">{fmtLKR(r.amount)}</b>
        </div>
      </div>
      <div className="rf-reason-block">
        <strong>Reason for refund:</strong>
        <div className="reason-text">{r.reason || '-'}</div>
      </div>
      <div className="notice">
        Are you sure you want to approve this refund request?
      </div>
      <div className="row end rf-view-actions" style={{ marginTop: '12px' }}>
        <button className="rf-cancel-btn" onClick={onClose}>Cancel</button>
        <button className="rf-approve-btn" onClick={() => onApprove(r._id)}>Approve</button>
      </div>
    </Modal>
  );
}