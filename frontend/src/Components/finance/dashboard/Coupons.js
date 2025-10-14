import React, { useEffect, useState, useMemo } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { api } from '../services/financeApi';
import Modal from './components/Modal';
import Card from './components/Card';
import '../css/dashboard/coupons.css';

export default function Coupons() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [timePeriod, setTimePeriod] = useState("day");

  // Compute top coupon user
  const topUser = useMemo(() => {
    if (!items?.length) return null;

    const usedCoupons = items.filter(c => c.scope === "ISSUED" && c.status === "Used");
    if (!usedCoupons.length) return null;

    const now = new Date();
    let cutoff = timePeriod === "day"
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
      : new Date(now.getFullYear(), now.getMonth(), 1);

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
        <h2>Coupons</h2>
        <div className="cp-head-actions">
          <button className="fm-btn fm-btn-primary" onClick={openNew}>➕ Add Coupon</button>
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
                <button className="billing-confirm-btn" onClick={() => openEdit(c)}>Edit</button>
                <button className="rf-reject-btn" onClick={() => askDelete(c)}>Delete</button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <h3 style={{ marginTop: 20 }}>Client Coupons</h3>
      <div className="card">
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
                    <button className="cp-btn-view" onClick={() => openEdit(c)}>View</button>
                    <button className="rf-reject-btn" onClick={() => askDelete(c)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

  const validateAndSave = () => {
    if (!form.code.trim()) return toast.error('Coupon code is required');
    if (form.discountValue <= 0) return toast.error('Discount value must be greater than 0');
    if (!form.expiryDate) return toast.error('Expiry date is required');
    if (new Date(form.expiryDate) < new Date()) return toast.error('Expiry must be in the future');
    if (form.usageLimit < 0) return toast.error('Usage limit cannot be negative');
    if (form.minInvoiceAmount < 0) return toast.error('Min invoice amount cannot be negative');
    onSave(form);
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

      <div className="coupon-modal-actions">
        <button className="coupon-btn ghost" onClick={onClose}>Cancel</button>
        <button className="coupon-btn primary" onClick={validateAndSave}>
          {defaultValue ? 'Update' : 'Create'}
        </button>
      </div>
    </Modal>
  );
}

function DeleteCouponModal({ coupon, onClose, onDelete, onEdit }) {
  return (
    <Modal open={!!coupon} onClose={onClose} title="Delete Coupon" className="delete-coupon-modal">
      <p className="delete-coupon-text">
        Are you sure you want to delete coupon <b>{coupon?.code}</b>?
      </p>
      <div className="delete-coupon-actions">
        <button className="coupon-btn ghost" onClick={onClose}>Cancel</button>
        {onEdit && <button className="coupon-btn secondary" onClick={onEdit}>Edit Instead</button>}
        <button className="coupon-btn danger" onClick={onDelete}>Delete</button>
      </div>
    </Modal>
  );
}