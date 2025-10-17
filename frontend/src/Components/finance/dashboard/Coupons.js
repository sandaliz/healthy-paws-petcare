import React, { useEffect, useState, useMemo } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { api } from '../services/financeApi';
import Modal from './components/Modal';
import Card from './components/Card';
import '../css/dashboard/coupons.css';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import Skeleton from './components/Skeleton';

export default function Coupons() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [timePeriod, setTimePeriod] = useState("day");

  const kpi = useMemo(() => {
    const now = new Date();
    let activeTemplates = 0, used7dTotal = 0;
    const dayMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      dayMap[d.toISOString().slice(0, 10)] = 0;
    }
    (items || []).forEach(c => {
      if (c.scope === 'GLOBAL') {
        const exp = c.expiryDate ? new Date(c.expiryDate) : null;
        const okDate = !exp || exp >= new Date(new Date().toDateString());
        const limit = Number(c.usageLimit || 0);
        const used = Number(c.usedCount || 0);
        const okLimit = limit <= 0 || used < limit;
        if (okDate && okLimit) activeTemplates++;
      }
      if (c.scope === 'ISSUED' && c.status === 'Used') {
        const when = c.updatedAt || c.createdAt || '';
        const day = String(when).slice(0, 10);
        if (day in dayMap) {
          dayMap[day] += 1;
          used7dTotal += 1;
        }
      }
    });
    const series = Object.entries(dayMap).map(([date, v]) => ({ date, v }));
    return { activeTemplates, used7dTotal, series };
  }, [items]);

  // Compute top coupon user
  const topUser = useMemo(() => {
    if (!items?.length) return null;

    const usedCoupons = items.filter(c => c.scope === "ISSUED" && c.status === "Used");
    if (!usedCoupons.length) return null;

    const now = new Date();
    let cutoff;
    if (timePeriod === "day") {
      cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timePeriod === "month") {
      cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timePeriod === "3m") {
      cutoff = new Date(now);
      cutoff.setMonth(cutoff.getMonth() - 3);
      cutoff.setHours(0, 0, 0, 0);
    } else {
      cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const counts = {};
    usedCoupons.forEach(c => {
      const usedAt = c.updatedAt || c.createdAt;
      if (new Date(usedAt) >= cutoff) {
        const userId = c.ownerUserID?._id || c.ownerUserID;
        if (!counts[userId]) {
          counts[userId] = { count: 0, user: c.ownerUserID };
        }
        counts[userId].count++;
      }
    });

    let max = null;
    Object.values(counts).forEach(val => {
      if (!max || val.count > max.count) max = val;
    });
    return max;
  }, [items, timePeriod]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.get('/coupons');
      setItems(data.coupons || []);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEdit(null); setOpen(true); };
  const openEdit = (c) => { setEdit(c); setOpen(true); };

  const save = async (form) => {
    try {
      if (edit?._id) {
        await api.put(`/coupon/${edit._id}`, form);
        toast.success('Coupon updated');
      } else {
        await api.post('/coupon', form);
        toast.success('Coupon created');
      }
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e.message || 'Failed to save');
    }
  };

  const askDelete = (coupon) => {
    setConfirmDelete(coupon);
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/coupon/${confirmDelete._id}`);
      toast.success('Deleted');
      setConfirmDelete(null);
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const globals = items.filter(c => c.scope === "GLOBAL");
  const clientCoupons = items.filter(c => c.scope === "ISSUED");

  return (
    <div>
      <Toaster position="top-right" />
      <div className="cp-head">
        <div className="cp-head-actions">
          <button className="fm-btn fm-btn-primary" onClick={openNew}>➕ Add Coupon</button>
        </div>
      </div>

      <div className="fm-kpis">
        <div className="fm-kpi">
          <div className="title">Active Templates</div>
          <div className="value">{kpi.activeTemplates}</div>
        </div>
        <div className="fm-kpi">
          <div className="title">Used (7d)</div>
          <div className="value">{kpi.used7dTotal}</div>
          <div className="spark">
            <ResponsiveContainer width="100%" height={40}>
              <AreaChart data={kpi.series} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Area type="monotone" dataKey="v" stroke="#54413C" fill="#FFEBC6" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="cp-highlight">
        <div className="cp-highlight-head">
          <h3>Top Coupon User</h3>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className="cp-highlight-select"
          >
            <option value="day">Today</option>
            <option value="month">This Month</option>
            <option value="3m">Last 3 Months</option>
          </select>
        </div>
        {topUser ? (
          <div className="cp-highlight-body">
            <div className="owner">
              <div className="name">{topUser.user?.name || 'Unknown'}</div>
              <div className="email">{topUser.user?.email || ''}</div>
            </div>
            <div className="cp-highlight-count">
              * {topUser.count} coupons used
            </div>
          </div>
        ) : (
          <div className="cp-highlight-empty">No coupons used in this {timePeriod}.</div>
        )}
      </div>

      <h3>Global Coupons</h3>
      {loading ? (
        <div className="fm-card"><Skeleton rows={6} /></div>
      ) : (
        <div className="coupon-grid">
          {globals.map(c => (
            <Card key={c._id}>
              <div className="coupon-card">
                <div className="coupon-code">{c.code}</div>
                <div className="coupon-meta">
                  Type: <b>{c.discountType}</b> • Value: <b>{c.discountValue}</b>
                </div>
                <div className="coupon-meta">
                  Min: {c.minInvoiceAmount || 0} • Limit: {c.usageLimit || '∞'} • Used: {c.usedCount || 0}
                </div>
                <div className="coupon-meta">
                  Expires: {new Date(c.expiryDate).toLocaleDateString()}
                </div>
                <div className="coupon-actions">
                  <button className="fm-btn fm-btn-primary" onClick={() => openEdit(c)}>Edit</button>
                  <button className="fm-btn fm-btn-danger" onClick={() => askDelete(c)}>Delete</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <h3 style={{ marginTop: 20 }}>Client Coupons</h3>
      <div className="fm-card">
        {loading ? (
          <Skeleton rows={8} />
        ) : (
          <table className="fm-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Expiry</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clientCoupons.map(c => (
                <tr key={c._id}>
                  <td className="mono">{c.code}</td>
                  <td>
                    <div className="owner">
                      <div className="name">{c.ownerUserID?.name || '-'}</div>
                      <div className="email">{c.ownerUserID?.email || '-'}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`tag-pill ${c.status === "Used" ? "gray" : c.status === "Expired" ? "red" : "green"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>{new Date(c.expiryDate).toLocaleDateString()}</td>
                  <td className="right">
                    <div className="cp-actions">
                      <button className="fm-btn fm-btn-ghost" onClick={() => openEdit(c)}>View</button>
                      <button className="fm-btn fm-btn-danger" onClick={() => askDelete(c)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <CouponModal
          open={open}
          onClose={() => setOpen(false)}
          onSave={save}
          defaultValue={edit}
        />
      )}

      {confirmDelete && (
        <DeleteCouponModal
          coupon={confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onDelete={doDelete}
          onEdit={() => { setEdit(confirmDelete); setConfirmDelete(null); setOpen(true); }}
        />
      )}
    </div>
  );
}


function CouponModal({ open, onClose, onSave, defaultValue }) {
  const [form, setForm] = useState(() =>
    defaultValue
      ? {
        code: defaultValue.code,
        discountType: defaultValue.discountType,
        discountValue: defaultValue.discountValue,
        minInvoiceAmount: defaultValue.minInvoiceAmount || 0,
        usageLimit: defaultValue.usageLimit || 0,
        expiryDate: defaultValue.expiryDate
          ? new Date(defaultValue.expiryDate).toISOString().slice(0, 10)
          : '',
        description: defaultValue.description || '',
      }
      : {
        code: '',
        discountType: 'Percentage',
        discountValue: 10,
        minInvoiceAmount: 0,
        usageLimit: 0,
        expiryDate: '',
        description: '',
      }
  );

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const [busy, setBusy] = useState(false);
  const todayStr = (() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  const validateAndSave = async () => {
    if (!form.code.trim()) return toast.error('Coupon code is required');
    if (form.discountValue <= 0) return toast.error('Discount value must be greater than 0');
    if (!form.expiryDate) return toast.error('Expiry date is required');
    {
      const exp = new Date(form.expiryDate);
      const today = new Date();
      exp.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      if (exp < today) return toast.error('Expiry must be today or later');
    }
    if (form.usageLimit < 0) return toast.error('Usage limit cannot be negative');
    if (form.minInvoiceAmount < 0) return toast.error('Min invoice amount cannot be negative');
    try {
      setBusy(true);
      const ret = onSave?.(form);
      if (ret && typeof ret.then === 'function') await ret;
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={defaultValue ? 'Edit Coupon' : 'Add Coupon'}
      className="coupon-modal"
    >
      <div className="coupon-modal-body">
        <div className="coupon-grid-2">
          <div className="coupon-field">
            <label>Code</label>
            <input
              className="coupon-input"
              value={form.code}
              onChange={e => set('code', e.target.value)}
            />
          </div>
          <div className="coupon-field">
            <label>Type</label>
            <select
              className="coupon-input"
              value={form.discountType}
              onChange={e => set('discountType', e.target.value)}
            >
              <option>Percentage</option>
              <option>Fixed</option>
            </select>
          </div>
        </div>

        <div className="coupon-grid-2">
          <div className="coupon-field">
            <label>Value</label>
            <input
              className="coupon-input"
              type="number"
              min="1"
              value={form.discountValue}
              onChange={e => set('discountValue', Number(e.target.value))}
            />
          </div>
          <div className="coupon-field">
            <label>Min Amount</label>
            <input
              className="coupon-input"
              type="number"
              min="0"
              value={form.minInvoiceAmount}
              onChange={e => set('minInvoiceAmount', Number(e.target.value))}
            />
          </div>
        </div>

        <div className="coupon-grid-2">
          <div className="coupon-field">
            <label>Usage Limit (0 = unlimited)</label>
            <input
              className="coupon-input"
              type="number"
              min="0"
              value={form.usageLimit}
              onChange={e => set('usageLimit', Number(e.target.value))}
            />
          </div>
          <div className="coupon-field">
            <label>Expiry</label>
            <input
              className="coupon-input"
              type="date"
              min={todayStr}
              value={form.expiryDate}
              onChange={e => set('expiryDate', e.target.value)}
            />
          </div>
        </div>

        <div className="coupon-field">
          <label>Description</label>
          <textarea
            rows={3}
            className="coupon-input"
            value={form.description}
            onChange={e => set('description', e.target.value)}
          />
        </div>
      </div>

      <div className="row end coupon-modal-actions">
        <button className="fm-btn fm-btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="fm-btn fm-btn-primary" onClick={validateAndSave} disabled={busy}>
          {busy ? (defaultValue ? 'Updating…' : 'Creating…') : (defaultValue ? 'Update' : 'Create')}
        </button>
      </div>
    </Modal>
  );
}

function DeleteCouponModal({ coupon, onClose, onDelete, onEdit }) {
  const [busy, setBusy] = useState(false);
  const handleDelete = async () => {
    try {
      setBusy(true);
      const ret = onDelete?.();
      if (ret && typeof ret.then === 'function') await ret;
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open={!!coupon} onClose={onClose} title="Delete Coupon" className="delete-coupon-modal">
      <p className="delete-coupon-text">
        Are you sure you want to delete coupon <b>{coupon?.code}</b>?
      </p>
      <div className="row end delete-coupon-actions">
        <button className="fm-btn fm-btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
        {onEdit && <button className="fm-btn fm-btn-info" onClick={onEdit} disabled={busy}>Edit Instead</button>}
        <button className="fm-btn fm-btn-danger" onClick={handleDelete} disabled={busy}>{busy ? 'Deleting…' : 'Delete'}</button>
      </div>
    </Modal>
  );
}