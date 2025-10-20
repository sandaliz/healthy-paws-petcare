import React, { useEffect, useMemo, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { api } from '../services/financeApi';
import Modal from './components/Modal';
import Tag from './components/Tag';
import Skeleton from './components/Skeleton';
import {
  Plus, Search, Filter, MoreVertical, Pencil, Trash2, Eye, ExternalLink, Copy, ChevronLeft, ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import '../css/dashboard/invoices.css';
import { toNum, round2, fmtDate, fmtLKR } from '../utils/financeFormatters'

const STATUS_OPTIONS = ['All', 'Pending', 'Overdue', 'Cancelled', 'Paid', 'Refunded'];
const ALLOWED_STATUS_UPDATE = ['Pending', 'Overdue', 'Cancelled'];

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [view, setView] = useState(null);
  const [edit, setEdit] = useState(null);
  const [statusEdit, setStatusEdit] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteInv, setDeleteInv] = useState(null);

  const [openMenu, setOpenMenu] = useState(null);

  const kpi = useMemo(() => {
    const now = new Date();
    let pending = 0, overdue = 0, revenue7d = 0;
    const dayMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dayMap[key] = 0;
    }
    (invoices || []).forEach(i => {
      const st = i.status;
      if (st === 'Pending') pending++;
      if (st === 'Overdue') overdue++;
      const created = (i.createdAt || '').slice(0,10);
      if (i.status === 'Paid' && created in dayMap) {
        const amt = Number(i.total || 0);
        dayMap[created] += amt;
        revenue7d += amt;
      }
    });
    const series = Object.entries(dayMap).map(([date, v]) => ({ date, v }));
    return { pending, overdue, revenue7d, series };
  }, [invoices]);

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
        const name = (i.userID?.name || '').toLowerCase();
        const email = (i.userID?.email || '').toLowerCase();
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

  

  const deleteInvoiceConfirmed = async (id) => {
    const inv = invoices.find(i => i._id === id);
    if (!inv) return toast.error('Invoice not found');
    if (['Paid', 'Refunded'].includes(inv.status)) {
      return toast.error(`Cannot delete invoice because it is ${inv.status}.`);
    }
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
        return toast.error(`Status "${next}" is not manually settable. Use payments/refunds flow for that.`);
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
      <div className="inv-head">
        <div className="inv-head-actions">
          <button className="fm-btn" onClick={load}><Filter size={16} /> Refresh</button>
          <button className="fm-btn-back" onClick={() => setCreateOpen(true)}><Plus size={16} /> New Invoice</button>
        </div>
      </div>

      <div className="fm-toolbar">
        <div className="fm-filters">
          <div className="fm-i-search">
            <Search size={16} />
            <input
              className="fm-i-search-input"
              placeholder="Search by invoice ID, owner or email"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="fm-i-status-filter">
            <label htmlFor="invoiceStatus" className="fm-i-status-label">Status:</label>
            <select
              id="invoiceStatus"
              className="fm-i-status-select"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="fm-kpis">
        <div className="fm-kpi">
          <div className="title">Pending</div>
          <div className="value">{kpi.pending}</div>
        </div>
        <div className="fm-kpi">
          <div className="title">Overdue</div>
          <div className="value">{kpi.overdue}</div>
        </div>
        <div className="fm-kpi">
          <div className="title">Revenue (7d)</div>
          <div className="value">{fmtLKR(kpi.revenue7d)}</div>
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
                        <div className="name">{inv.userID?.name || '-'}</div>
                        <div className="email">{inv.userID?.email || '-'}</div>
                      </div>
                    </td>
                    <td className="mono">{fmtLKR(inv.total)}</td>
                    <td><Tag status={inv.status} /></td>
                    <td>{fmtDate(inv.dueDate)}</td>
                    <td>{fmtDate(inv.createdAt)}</td>
                    <td className="right">
                      <div className="row end">
                        {/* View */}
                        <button
                          className="fm-btn fm-btn-ghost"
                          title="View"
                          onClick={() => setView(inv)}
                        >
                          <Eye size={16} />
                        </button>

                        {/* Edit */}
                        <button
                          className={`fm-btn fm-btn-ghost ${['Paid', 'Refunded'].includes(inv.status) ? 'fm-btn-disabled' : ''}`}
                          title="Edit"
                          onClick={() => {
                            if (['Paid', 'Refunded'].includes(inv.status)) {
                              return toast.error(`Editing not allowed: invoice is ${inv.status}`);
                            }
                            setEdit(inv);
                          }}
                        >
                          <Pencil size={16} />
                        </button>

                        {!['Paid', 'Refunded'].includes(inv.status) && (
                          <div className="fm-dropdown">
                            <button
                              className="fm-btn fm-btn-ghost"
                              onClick={() => setOpenMenu(openMenu === inv._id ? null : inv._id)}
                            >
                              <MoreVertical size={16} />
                            </button>

                            {openMenu === inv._id && (
                              <div className="fm-dropdown-menu">
                                <button onClick={() => setStatusEdit(inv)}>
                                  <ExternalLink size={14} /> Set status
                                </button>
                                <button onClick={() => onCopyClientLink(inv)}>
                                  <Copy size={14} /> Copy client link
                                </button>
                                <button
                                  className="fm-btn-danger"
                                  onClick={() => {
                                    if (['Paid', 'Refunded'].includes(inv.status)) {
                                      return toast.error(`Cannot delete a ${inv.status} invoice`);
                                    }
                                    setDeleteInv(inv);
                                  }}
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
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

      {deleteInv && (
        <DeleteInvoiceModal
          open={!!deleteInv}
          onClose={() => setDeleteInv(null)}
          invoice={deleteInv}
          onDelete={async () => {
            await deleteInvoiceConfirmed(deleteInv._id);
            setDeleteInv(null);
          }}
        />
      )}
    </div>
  );
}

/* Create Invoice */
const OFFLINE_METHODS = ['Cash', 'Card', 'BankTransfer'];

function CreateInvoiceModal({ open, onClose, onCreated }) {
  const [userID, setUserID] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [resolvedUser, setResolvedUser] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [openSuggest, setOpenSuggest] = useState(false);
  const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0 }]);
  const [busy, setBusy] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const subtotal = items.reduce((s, it) => s + (toNum(it.quantity) * toNum(it.unitPrice)), 0);
  const tax = round2(subtotal * 0.08);
  const total = round2(subtotal + tax);

  const addItem = () => setItems(prev => [...prev, { description: '', quantity: 1, unitPrice: 0 }]);
  const setItem = (i, k, v) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [k]: k === 'description' ? v : toNum(v) } : it));
  const rmItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    if (!userID.trim()) return toast.error('Please enter a valid User ID');
    if (items.length === 0) return toast.error('Add at least one line item');
    if (items.some(it => !it.description.trim())) return toast.error('Each line item needs a description');
    if (items.some(it => it.quantity <= 0)) return toast.error('Quantities must be at least 1');
    if (items.some(it => it.unitPrice <= 0)) return toast.error('Unit price must be greater than 0');
    if (!OFFLINE_METHODS.includes(paymentMethod)) return toast.error('Select a valid offline payment method');
    if (subtotal <= 0) return toast.error('Invoice total must be greater than 0');
    try {
      setBusy(true);
      await api.post('/invoice', {
        userID,
        lineItems: items.map(it => ({
          description: it.description,
          quantity: toNum(it.quantity),
          unitPrice: toNum(it.unitPrice)
        })),
        paymentMethod
      });
      toast.success('Invoice created');
      onCreated?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Create failed');
    } finally {
      setBusy(false);
    }
  };

  // Debounced typeahead search against /api/finance/users/search
  useEffect(() => {
    let alive = true;
    if (!userQuery || userQuery.trim().length < 2) {
      setSuggestions([]);
      setOpenSuggest(false);
      return () => { alive = false; };
    }
    const id = setTimeout(async () => {
      try {
        setResolving(true);
        const data = await api.get(`/users/search?q=${encodeURIComponent(userQuery.trim())}`);
        if (!alive) return;
        setSuggestions(data.users || []);
        setOpenSuggest(true);
      } catch (e) {
        if (!alive) return;
        setSuggestions([]);
        setOpenSuggest(false);
      } finally {
        if (alive) setResolving(false);
      }
    }, 300);
    return () => { alive = false; clearTimeout(id); };
  }, [userQuery]);

  const selectUser = (u) => {
    setResolvedUser(u);
    setUserID(u._id);
    setUserQuery(`${u.name || ''} (${u.email || ''})`);
    setOpenSuggest(false);
    toast.success('User selected');
  };

  return (
    <Modal open={open} onClose={onClose} title="New Invoice">
      <div className="field bf-inv-lookup">
        <label>User name/email (lookup)</label>
        <input
          className="input"
          value={userQuery}
          onChange={e => setUserQuery(e.target.value)}
          placeholder="e.g. owner@example.com or Jane"
          onFocus={() => { if (suggestions.length) setOpenSuggest(true); }}
        />
        {openSuggest && suggestions.length > 0 && (
          <div className="bf-inv-suggestions">
            {suggestions.map(u => (
              <div key={u._id} className="itm" onMouseDown={() => selectUser(u)}>
                <div className="name">{u.name || '-'}</div>
                <div className="email">{u.email || ''}</div>
              </div>
            ))}
          </div>
        )}
        {resolving && <div className="muted" style={{ marginTop: 6 }}>Searching…</div>}
        {resolvedUser && (
          <div className="notice" style={{ marginTop: '8px' }}>
            Selected: <b>{resolvedUser.name || resolvedUser.email}</b> — <span className="mono">{resolvedUser._id}</span>
          </div>
        )}
      </div>
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
              <button className="fm-btn fm-btn-ghost" onClick={() => rmItem(i)}><Trash2 size={16} /></button>
            </div>
          );
        })}
        <div className="row end inv-add-item">
          <button className="fm-btn fm-btn-primary" onClick={addItem}><Plus size={16} /> Add item</button>
        </div>
      </div>

      <div className="field">
        <label>Offline payment method</label>
        <select className="input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
          {OFFLINE_METHODS.map(method => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
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

      <div className="row end">
        <button className="fm-btn fm-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="fm-btn fm-btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Create'}</button>
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
        <div className="kv"><span>Owner</span><b>{invoice.userID?.name || '-'}</b></div>
        <div className="kv"><span>Email</span><b>{invoice.userID?.email || '-'}</b></div>
        <div className="kv"><span>Status</span><b><Tag status={invoice.status} /></b></div>
        <div className="kv"><span>Due</span><b>{fmtDate(invoice.dueDate)}</b></div>
      </div>

      <div className="items-card inv-items-card">
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

      <div className="row end inv-view-actions">
        <button className="fm-btn fm-btn-primary" onClick={() => {
          const url = `${window.location.origin}/pay/online?invoice=${invoice._id}`;
          navigator.clipboard.writeText(url).then(() => toast.success('Client payment link copied'));
        }}><Copy size={16} /> Copy client link</button>
        <button className="fm-btn fm-btn-ghost" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* Edit Invoice */
function EditInvoiceModal({ open, onClose, invoice, onSaved }) {
  const restricted = ['Paid', 'Refunded'].includes(invoice.status);
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
    if (restricted) {
      return toast.error(`This invoice is ${invoice.status}. Editing is only allowed for Pending/Overdue/Cancelled invoices.`);
    }
    if (items.length === 0) return toast.error('Add at least one line item');
    if (items.some(it => !it.description.trim())) return toast.error('Each line must include a description');
    if (items.some(it => it.quantity <= 0)) return toast.error('Quantities must be ≥ 1');
    if (items.some(it => it.unitPrice <= 0)) return toast.error('Unit price must be greater than 0');
    if (subtotal <= 0) return toast.error('Invoice total must be positive');
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
        <div className="notice error inv-edit-notice">
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
              <button className="fm-btn fm-btn-ghost" onClick={() => rmItem(i)} disabled={restricted}><Trash2 size={16} /></button>
            </div>
          );
        })}
        {!restricted && (
          <div className="row end inv-add-item">
            <button className="fm-btn fm-btn-primary" onClick={addItem}><Plus size={16} /> Add item</button>
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

      <div className="row end inv-totals-actions">
        <button className="fm-btn fm-btn-ghost" onClick={onClose}>Close</button>
        {!restricted && <button className="fm-btn fm-btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>}
      </div>
    </Modal>
  );
}

/* Status picker modal */
function StatusModal({ open, onClose, invoice, onUpdate }) {
  const [next, setNext] = useState(() => ALLOWED_STATUS_UPDATE.includes(invoice.status) ? invoice.status : 'Pending');
  const [busy, setBusy] = useState(false);

  const handleUpdate = async () => {
    try {
      setBusy(true);
      const ret = onUpdate?.(invoice._id, next);
      if (ret && typeof ret.then === 'function') await ret;
      onClose?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Set status — ${invoice.invoiceID || invoice._id}`}>
      <div className="field">
        <label>Status</label>
        <select className="input" value={next} onChange={e => setNext(e.target.value)}>
          {ALLOWED_STATUS_UPDATE.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="notice inv-status-notice">
        Paid and Refunded are set via payment/refund flows only.
      </div>
      <div className="row end inv-status-actions">
        <button className="fm-btn fm-btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="fm-btn fm-btn-primary" onClick={handleUpdate} disabled={busy}>{busy ? 'Updating…' : 'Update'}</button>
      </div>
    </Modal>
  );
}

/* Delete confirm modal */
function DeleteInvoiceModal({ open, onClose, invoice, onDelete }) {
  const [busy, setBusy] = useState(false);
  if (!invoice) return null;
  const handleDelete = async () => {
    try {
      setBusy(true);
      const ret = onDelete?.();
      if (ret && typeof ret.then === 'function') await ret;
      onClose?.();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open={open} onClose={onClose} title="Delete Invoice">
      <div className="notice inv-edit-notice">
        Are you sure you want to delete invoice <b>{invoice.invoiceID || invoice._id}</b>? This action cannot be undone.
      </div>
      <div className="row end inv-status-actions">
        <button className="fm-btn fm-btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="fm-btn fm-btn-danger" onClick={handleDelete} disabled={busy}>{busy ? 'Deleting…' : 'Delete'}</button>
      </div>
    </Modal>
  );
}
