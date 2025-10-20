import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { api } from '../services/financeApi';
import Modal from './components/Modal';
import Skeleton from './components/Skeleton';
import {
  Search, RefreshCcw, CheckCircle2, XCircle, Eye,
  ChevronLeft, ChevronRight, Plus
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import '../css/dashboard/refunds.css';
import { fmtDate, fmtDateTime, fmtLKR } from '../utils/financeFormatters';

const PAYOUT_LABELS = {
  NotRequired: 'Auto-paid (online)',
  Pending: 'Awaiting cash payout',
  Paid: 'Paid out',
};

const STATUS_OPTIONS = ['All', 'Pending', 'Approved', 'Rejected'];

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
  const [payoutModal, setPayoutModal] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const hydrated = useRef(false);

  const kpi = useMemo(() => {
    const now = new Date();
    let pendingCount = 0, approved7d = 0;
    const dayMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      dayMap[d.toISOString().slice(0,10)] = 0;
    }

    (items || []).forEach(r => {
      if (r.status === 'Pending') pendingCount++;
      const created = (r.createdAt || '').slice(0,10);
      if (created in dayMap) dayMap[created] += 1;
      if (r.status === 'Approved') {
        const processed = (r.processedAt || r.updatedAt || '').slice(0,10);
        const sixDaysAgo = new Date(now); sixDaysAgo.setDate(now.getDate() - 6);
        if (processed && new Date(processed) >= sixDaysAgo) approved7d++;
      }
    });
    const series = Object.entries(dayMap).map(([date, v]) => ({ date, v }));
    return { pendingCount, approved7d, series };
  }, [items]);

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

  useEffect(() => {
    if (hydrated.current) return;
    const params = new URLSearchParams(location.search);
    const qStatus = params.get('status');
    const qSearch = params.get('q');
    const qPage = parseInt(params.get('page') || '1', 10);

    if (qStatus && STATUS_OPTIONS.includes(qStatus)) setStatus(qStatus);
    if (qSearch) setSearch(qSearch);
    if (!Number.isNaN(qPage) && qPage > 0) setPage(qPage);
    hydrated.current = true;
  }, [location.search]);

  useEffect(() => {
    if (!hydrated.current) return;
    const params = new URLSearchParams();
    if (status !== 'All') params.set('status', status);
    if (search.trim()) params.set('q', search.trim());
    if (page > 1) params.set('page', String(page));
    const next = params.toString();
    const current = location.search.startsWith('?') ? location.search.slice(1) : location.search;
    if (next !== current) {
      navigate({ search: next ? `?${next}` : '' }, { replace: true });
    }
  }, [status, search, page, location.search, navigate]);

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

  const markPaid = async (id, body) => {
    try {
      await api.put(`/refund/payout/${id}`, body);
      toast.success('Refund marked as paid');
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Mark paid failed');
    }
  };

  const getPayoutDisplay = (refund) => {
    const status = refund?.status;
    if (status === 'Pending') {
      return { className: 'pending', label: 'Awaiting approval', showMeta: false };
    }
    if (status === 'Rejected') {
      return { className: 'na', label: 'Not applicable', showMeta: false };
    }
    if (status !== 'Approved') {
      return { className: 'na', label: 'Not applicable', showMeta: false };
    }

    const payoutStatus = refund?.payoutStatus || 'NotRequired';
    return {
      className: (payoutStatus || '').toLowerCase() || 'notrequired',
      label: PAYOUT_LABELS[payoutStatus] || PAYOUT_LABELS.NotRequired,
      showMeta: true,
    };
  };

  return (
    <div>
      <Toaster position="top-right" />
      <div className="rf-head">
        <div className="rf-head-actions">
          <button className="fm-btn"><RefreshCcw size={16} /> Refresh</button>
          <button className="fm-btn-back" onClick={() => setCreateOpen(true)}><Plus size={16} /> New Refund Request</button>
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

      <div className="fm-kpis">
        <div className="fm-kpi">
          <div className="title">Pending</div>
          <div className="value">{kpi.pendingCount}</div>
        </div>
        <div className="fm-kpi">
          <div className="title">Approved (7d)</div>
          <div className="value">{kpi.approved7d}</div>
        </div>
        <div className="fm-kpi">
          <div className="title">Requests (7d)</div>
          <div className="value">{kpi.series.reduce((s, x) => s + x.v, 0)}</div>
          <div className="spark">
            <ResponsiveContainer width="100%" height={40}>
              <AreaChart data={kpi.series} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Area type="monotone" dataKey="v" stroke="#54413C" fill="#FFEBC6" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
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
                  <th>Payout</th>
                  <th className="right">Actions</th>
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
                    <td>
                      <div className="rf-payout-status">
                        {(() => {
                          const payout = getPayoutDisplay(r);
                          return (
                            <>
                              <span className={`tag-pill ${payout.className}`}>{payout.label}</span>
                              {payout.showMeta && (r.payoutHandledBy || r.payoutCompletedAt || r.payoutReference) && (
                                <div className="rf-payout-meta">
                                  {r.payoutHandledBy && (
                                    <div>{r.payoutHandledBy === 'Stripe' ? 'Stripe (auto)' : r.payoutHandledBy}</div>
                                  )}
                                  {r.payoutReference && <div className="mono" title="Reference">{r.payoutReference}</div>}
                                  {r.payoutCompletedAt && <div>{fmtDateTime(r.payoutCompletedAt)}</div>}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="right">
                      <div className="row end rf-actions">
                        <button className="fm-btn fm-btn-ghost" onClick={() => setView(r)}><Eye size={16} /></button>
                        {r.status === 'Pending' && (
                          <>
                            <button
                              className="fm-btn fm-btn-success"
                              onClick={() => setApproveModal(r)}
                            >
                              <CheckCircle2 size={16} /> Approve
                            </button>
                            <button className="fm-btn fm-btn-danger" onClick={() => setRejectModal(r)}>
                              <XCircle size={16} /> Reject
                            </button>
                          </>
                        )}
                        {r.status === 'Approved' && r.payoutStatus === 'Pending' && (
                          <button
                            className="fm-btn fm-btn-primary"
                            onClick={() => setPayoutModal(r)}
                          >
                            Mark Paid
                          </button>
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
        <RejectModal
          open
          onClose={() => setRejectModal(null)}
          onReject={reason => reject(rejectModal._id, reason)}
          r={rejectModal}
        />
      )}
      {createOpen && <CreateRefundModal open onClose={() => setCreateOpen(false)} onCreate={createRefund} />}
      {approveModal && (
        <ApproveModal
          open
          onClose={() => setApproveModal(null)}
          onApprove={(id) => approve(id)}
          r={approveModal}
        />
      )}
      {payoutModal && (
        <PayoutModal
          open
          r={payoutModal}
          onClose={() => setPayoutModal(null)}
          onSubmit={(input) => markPaid(payoutModal._id, input)}
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

function RejectModal({ open, onClose, onReject, r }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const handleReject = async () => {
    if (!reason?.trim()) return toast.error('Reason required');
    try {
      setBusy(true);
      const ret = onReject?.(reason);
      if (ret && typeof ret.then === 'function') await ret;
      onClose?.();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open={open} onClose={onClose} title="Reject refund">
      {r?.reason && (
        <div className="rf-reason-block">
          <strong>Original request reason:</strong>
          <div className="reason-text">{r.reason}</div>
        </div>
      )}
      <div className="field">
        <label>Reason</label>
        <textarea className="input" rows={4} value={reason} onChange={e => setReason(e.target.value)} />
      </div>
      <div className="row end rf-reject-actions">
        <button className="fm-btn fm-btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="fm-btn fm-btn-danger" onClick={handleReject} disabled={busy}>{busy ? 'Rejecting…' : 'Reject'}</button>
      </div>
    </Modal>
  )
}

function CreateRefundModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState({ paymentID: '', reason: '' });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const handleSubmit = async () => {
    try {
      setBusy(true);
      const ret = onCreate?.(form);
      if (ret && typeof ret.then === 'function') await ret;
      onClose?.();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open={open} onClose={onClose} title="New Refund Request">
      <div className="field"><label>Payment ID</label>
        <input className="input" value={form.paymentID} onChange={e => set('paymentID', e.target.value)} /></div>
      <div className="field"><label>Reason</label>
        <textarea className="input" rows={3} value={form.reason} onChange={e => set('reason', e.target.value)} /></div>
      <div className="row end rf-create-actions">
        <button className="fm-btn fm-btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="fm-btn fm-btn-primary" onClick={handleSubmit} disabled={busy}>{busy ? 'Submitting…' : 'Submit'}</button>
      </div>
    </Modal>
  )
}

function ApproveModal({ open, onClose, onApprove, r }) {
  const [busy, setBusy] = useState(false);
  if (!r) return null;
  const handleApprove = async () => {
    try {
      setBusy(true);
      const ret = onApprove?.(r._id);
      if (ret && typeof ret.then === 'function') await ret;
      onClose?.();
    } finally {
      setBusy(false);
    }
  };
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
        <button className="fm-btn fm-btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="fm-btn fm-btn-success" onClick={handleApprove} disabled={busy}>{busy ? 'Approving…' : 'Approve'}</button>
      </div>
    </Modal>
  );
}

function PayoutModal({ open, onClose, onSubmit, r }) {
  const [handledBy, setHandledBy] = useState('');
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);
  if (!r) return null;
  const submit = async () => {
    if (!handledBy.trim()) return toast.error('Handled by is required');
    try {
      setBusy(true);
      const ret = onSubmit?.({ handledBy: handledBy.trim(), reference: reference.trim() || undefined });
      if (ret && typeof ret.then === 'function') await ret;
      onClose?.();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open={open} onClose={onClose} title="Record payout">
      <div className="summary vlist">
        <div className="kv"><span>Invoice</span><b className="mono">{r.paymentID?.invoiceID?.invoiceID || '-'}</b></div>
        <div className="kv"><span>Amount</span><b>{fmtLKR(r.amount)}</b></div>
      </div>
      <div className="field">
        <label>Handled by</label>
        <input className="input" value={handledBy} onChange={e => setHandledBy(e.target.value)} />
      </div>
      <div className="field">
        <label>Reference / Notes</label>
        <input className="input" value={reference} onChange={e => setReference(e.target.value)} placeholder="Optional" />
      </div>
      <div className="row end rf-view-actions">
        <button className="fm-btn fm-btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="fm-btn fm-btn-success" onClick={submit} disabled={busy}>{busy ? 'Saving…' : 'Mark Paid'}</button>
      </div>
    </Modal>
  );
}