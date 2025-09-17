import React, { useEffect, useMemo, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { api } from '../financeApi';
import Modal from './components/Modal';
import Tag from './components/Tag';
import Skeleton from './components/Skeleton';
import {
  Plus, Search, Filter, MoreVertical, Pencil, Trash2, Eye, ExternalLink, Copy, ChevronLeft, ChevronRight
} from 'lucide-react';
import '../css/dashboard.css';

const STATUS_OPTIONS = ['All', 'Pending', 'Overdue', 'Cancelled', 'Paid', 'Refunded'];
const ALLOWED_STATUS_UPDATE = ['Pending', 'Overdue', 'Cancelled']; // Paid/Refunded are set via payment/refund flows

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [view, setView] = useState(null);            // invoice to view
  const [edit, setEdit] = useState(null);            // invoice to edit
  const [statusEdit, setStatusEdit] = useState(null);// invoice to update status
  const [createOpen, setCreateOpen] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.get('/invoices');
      setInvoices(data.invoices || []);
    } catch (e) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let arr = invoices || [];
    if (status !== 'All') arr = arr.filter(i => (i.status || '').toLowerCase() === status.toLowerCase());
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(i => {
        const inv = (i.invoiceID || '').toLowerCase();
        const name = (i.userID?.OwnerName || '').toLowerCase();
        const email = (i.userID?.OwnerEmail || '').toLowerCase();
        return inv.includes(q) || name.includes(q) || email.includes(q);
      });
    }
    return arr;
  }, [invoices, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const onDelete = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await api.delete(`/invoice/${id}`);
      toast.success('Invoice deleted');
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Delete failed');
    }
  };

  const onCopyClientLink = async (inv) => {
    const url = `${window.location.origin}/pay/online?invoice=${inv._id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Client payment link copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  const onUpdateStatus = async (id, next) => {
    try {
      if (!ALLOWED_STATUS_UPDATE.includes(next)) {
        return toast.error(`Not allowed here: ${next}`);
      }
      await api.put(`/invoice/${id}`, { status: next });
      toast.success('Status updated');
      load();
      setStatusEdit(null);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-head">
        <h2>Invoices</h2>
        <div className="row">
          <button className="btn" onClick={load}><Filter size={16} /> Refresh</button>
          <button className="btn primary" onClick={() => setCreateOpen(true)}><Plus size={16} /> New Invoice</button>
        </div>
      </div>

      <div className="fm-toolbar">
        <div className="fm-filters">
          <div className="fm-search">
            <Search size={16} />
            <input
              className="input"
              placeholder="Search by invoice ID, owner or email"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="input fm-status-filter"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
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
                  <th>Invoice</th>
                  <th>Owner</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Due</th>
                  <th>Created</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 && (
                  <tr><td colSpan={7} className="muted">No invoices found</td></tr>
                )}
                {pageItems.map((inv) => (
                  <tr key={inv._id}>
                    <td className="mono">{inv.invoiceID || inv._id}</td>
                    <td>
                      <div className="owner">
                        <div className="name">{inv.userID?.OwnerName || '-'}</div>
                        <div className="email">{inv.userID?.OwnerEmail || '-'}</div>
                      </div>
                    </td>
                    <td className="mono">{fmtLKR(inv.total)}</td>
                    <td><Tag status={inv.status} /></td>
                    <td>{fmtDate(inv.dueDate)}</td>
                    <td>{fmtDate(inv.createdAt)}</td>
                    <td className="right">
                      <div className="row end">
                        <button className="btn ghost" title="View" onClick={() => setView(inv)}><Eye size={16} /></button>
                        <button className="btn ghost" title="Edit" onClick={() => setEdit(inv)} disabled={['Paid','Refunded'].includes(inv.status)}><Pencil size={16} /></button>
                        <div className="dropdown">
                          <button className="btn ghost"><MoreVertical size={16} /></button>
                          <div className="dropdown-menu">
                            <button onClick={() => setStatusEdit(inv)}><ExternalLink size={14} /> Set status</button>
                            <button onClick={() => onCopyClientLink(inv)}><Copy size={14} /> Copy client link</button>
                            <button className="danger" onClick={() => onDelete(inv._id)}><Trash2 size={14} /> Delete</button>
                          </div>
                        </div>
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

      {createOpen && (
        <CreateInvoiceModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={() => { setCreateOpen(false); load(); }}
        />
      )}

      {view && (
        <ViewInvoiceModal
          open={!!view}
          onClose={() => setView(null)}
          invoice={view}
        />
      )}

      {edit && (
        <EditInvoiceModal
          open={!!edit}
          onClose={() => setEdit(null)}
          invoice={edit}
          onSaved={() => { setEdit(null); load(); }}
        />
      )}

      {statusEdit && (
        <StatusModal
          open={!!statusEdit}
          onClose={() => setStatusEdit(null)}
          invoice={statusEdit}
          onUpdate={onUpdateStatus}
        />
      )}
    </div>
  );
}

/* Create Invoice */
function CreateInvoiceModal({ open, onClose, onCreated }) {
  const [userID, setUserID] = useState('');
  const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0 }]);
  const [busy, setBusy] = useState(false);

  const subtotal = items.reduce((s, it) => s + (toNum(it.quantity) * toNum(it.unitPrice)), 0);
  const tax = round2(subtotal * 0.08);
  const total = round2(subtotal + tax);

  const addItem = () => setItems(prev => [...prev, { description: '', quantity: 1, unitPrice: 0 }]);
  const setItem = (i, k, v) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [k]: k === 'description' ? v : toNum(v) } : it));
  const rmItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    if (!userID.trim()) return toast.error('Enter user Register _id');
    if (items.length === 0) return toast.error('Add at least one line item');
    try {
      setBusy(true);
      await api.post('/invoice', {
        userID,
        lineItems: items.map(it => ({
          description: it.description,
          quantity: toNum(it.quantity),
          unitPrice: toNum(it.unitPrice)
        }))
      });
      toast.success('Invoice created');
      onCreated?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Create failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New Invoice">
      <div className="field">
        <label>User Register Mongo _id</label>
        <input className="input" value={userID} onChange={e => setUserID(e.target.value)} placeholder="e.g. 66f..." />
      </div>

      <div className="items-editor">
        <div className="ie-head">
          <div>Description</div><div>Qty</div><div>Rate</div><div>Line Total</div><div />
        </div>
        {items.map((it, i) => {
          const line = round2(toNum(it.quantity) * toNum(it.unitPrice));
          return (
            <div className="ie-row" key={i}>
              <input className="input" value={it.description} onChange={e => setItem(i, 'description', e.target.value)} placeholder="Description" />
              <input className="input" type="number" min="1" value={it.quantity} onChange={e => setItem(i, 'quantity', e.target.value)} />
              <input className="input" type="number" min="0" step="0.01" value={it.unitPrice} onChange={e => setItem(i, 'unitPrice', e.target.value)} />
              <div className="mono">{fmtLKR(line)}</div>
              <button className="btn ghost" onClick={() => rmItem(i)}><Trash2 size={16} /></button>
            </div>
          );
        })}
        <div className="row end" style={{ marginTop: 8 }}>
          <button className="btn" onClick={addItem}><Plus size={16} /> Add item</button>
        </div>
      </div>

      <div className="totals-right">
        <table className="totals-table">
          <tbody>
            <tr><td>Subtotal</td><td className="num">{fmtLKR(subtotal)}</td></tr>
            <tr><td>Tax</td><td className="num">{fmtLKR(tax)}</td></tr>
            <tr className="em"><td>Total</td><td className="num">{fmtLKR(total)}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="row end" style={{ marginTop: 10 }}>
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Create'}</button>
      </div>
    </Modal>
  );
}

/* View Invoice */
function ViewInvoiceModal({ open, onClose, invoice }) {
  const subtotal = Number(invoice.subtotal || 0);
  const tax = Number(invoice.tax || 0);
  const total = Number(invoice.total || 0);

  return (
    <Modal open={open} onClose={onClose} title={`Invoice ${invoice.invoiceID || invoice._id}`}>
      <div className="summary vlist">
        <div className="kv"><span>Owner</span><b>{invoice.userID?.OwnerName || '-'}</b></div>
        <div className="kv"><span>Email</span><b>{invoice.userID?.OwnerEmail || '-'}</b></div>
        <div className="kv"><span>Status</span><b><Tag status={invoice.status} /></b></div>
        <div className="kv"><span>Due</span><b>{fmtDate(invoice.dueDate)}</b></div>
      </div>

      <div className="items-card" style={{ marginTop: 8 }}>
        <div className="items-header">Items</div>
        <ul className="items-list">
          {(invoice.lineItems || []).map((li, i) => (
            <li className="item-row" key={i}>
              <div className="item-title">{li.description}</div>
              <div className="item-meta">{li.quantity} × {fmtLKR(li.unitPrice)}</div>
              <div className="item-amount">{fmtLKR(li.total)}</div>
            </li>
          ))}
        </ul>

        <div className="totals-right">
          <table className="totals-table">
            <tbody>
              <tr><td>Subtotal</td><td className="num">{fmtLKR(subtotal)}</td></tr>
              <tr><td>Tax</td><td className="num">{fmtLKR(tax)}</td></tr>
              <tr className="em"><td>Total</td><td className="num">{fmtLKR(total)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="row end" style={{ marginTop: 10 }}>
        <button className="btn primary" onClick={() => {
          const url = `${window.location.origin}/pay/online?invoice=${invoice._id}`;
          navigator.clipboard.writeText(url).then(() => toast.success('Client payment link copied'));
        }}><Copy size={16} /> Copy client link</button>
        <button className="btn ghost" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* Edit Invoice (line items only; restricted if Paid/Refunded) */
function EditInvoiceModal({ open, onClose, invoice, onSaved }) {
  const restricted = ['Paid','Refunded'].includes(invoice.status);
  const [items, setItems] = useState(() => (invoice.lineItems || []).map(li => ({
    description: li.description, quantity: Number(li.quantity), unitPrice: Number(li.unitPrice)
  })));
  const [busy, setBusy] = useState(false);

  const subtotal = items.reduce((s, it) => s + (toNum(it.quantity) * toNum(it.unitPrice)), 0);
  const tax = round2(subtotal * 0.08);
  const total = round2(subtotal + tax);

  const addItem = () => setItems(prev => [...prev, { description: '', quantity: 1, unitPrice: 0 }]);
  const setItem = (i, k, v) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [k]: k === 'description' ? v : toNum(v) } : it));
  const rmItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    if (restricted) return toast.error('Cannot edit a finalized invoice');
    try {
      setBusy(true);
      await api.put(`/invoice/${invoice._id}`, {
        lineItems: items.map(it => ({
          description: it.description,
          quantity: toNum(it.quantity),
          unitPrice: toNum(it.unitPrice)
        }))
      });
      toast.success('Invoice updated');
      onSaved?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Edit Invoice ${invoice.invoiceID || invoice._id}`}>
      {restricted && (
        <div className="notice error" style={{ marginBottom: 10 }}>
          This invoice is {invoice.status}. Line items cannot be edited.
        </div>
      )}

      <div className="items-editor">
        <div className="ie-head">
          <div>Description</div><div>Qty</div><div>Rate</div><div>Line Total</div><div />
        </div>
        {items.map((it, i) => {
          const line = round2(toNum(it.quantity) * toNum(it.unitPrice));
          return (
            <div className="ie-row" key={i}>
              <input className="input" value={it.description} onChange={e => setItem(i, 'description', e.target.value)} placeholder="Description" disabled={restricted} />
              <input className="input" type="number" min="1" value={it.quantity} onChange={e => setItem(i, 'quantity', e.target.value)} disabled={restricted} />
              <input className="input" type="number" min="0" step="0.01" value={it.unitPrice} onChange={e => setItem(i, 'unitPrice', e.target.value)} disabled={restricted} />
              <div className="mono">{fmtLKR(line)}</div>
              <button className="btn ghost" onClick={() => rmItem(i)} disabled={restricted}><Trash2 size={16} /></button>
            </div>
          );
        })}
        {!restricted && (
          <div className="row end" style={{ marginTop: 8 }}>
            <button className="btn" onClick={addItem}><Plus size={16} /> Add item</button>
          </div>
        )}
      </div>

      <div className="totals-right">
        <table className="totals-table">
          <tbody>
            <tr><td>Subtotal</td><td className="num">{fmtLKR(subtotal)}</td></tr>
            <tr><td>Tax</td><td className="num">{fmtLKR(tax)}</td></tr>
            <tr className="em"><td>Total</td><td className="num">{fmtLKR(total)}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="row end" style={{ marginTop: 10 }}>
        <button className="btn ghost" onClick={onClose}>Close</button>
        {!restricted && <button className="btn primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>}
      </div>
    </Modal>
  );
}

/* Status picker */
function StatusModal({ open, onClose, invoice, onUpdate }) {
  const [next, setNext] = useState(() => ALLOWED_STATUS_UPDATE.includes(invoice.status) ? invoice.status : 'Pending');

  return (
    <Modal open={open} onClose={onClose} title={`Set status — ${invoice.invoiceID || invoice._id}`}>
      <div className="field">
        <label>Status</label>
        <select className="input" value={next} onChange={e => setNext(e.target.value)}>
          {ALLOWED_STATUS_UPDATE.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="notice" style={{ marginTop: 6 }}>
        Paid and Refunded are set via payment/refund flows only.
      </div>
      <div className="row end" style={{ marginTop: 10 }}>
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" onClick={() => onUpdate(invoice._id, next)}>Update</button>
      </div>
    </Modal>
  );
}

/* utils */
function toNum(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function round2(n) { return Math.round((Number(n)||0) * 100) / 100; }
function fmtLKR(n) {
  try { return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(Number(n) || 0); }
  catch { return `LKR ${Number(n || 0).toFixed(2)}`; }
}
function fmtDate(d) {
  if (!d) return '-';
  try { return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }); }
  catch { return String(d); }
}