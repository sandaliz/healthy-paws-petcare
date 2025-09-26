import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { api } from '../financeApi';
import Modal from './components/Modal';
import Card from './components/Card';
import '../css/dashboard.css';

export default function Coupons() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

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
      <div className="page-head">
        <h2>Coupons</h2>
        <button className="btn primary" onClick={openNew}>Add coupon</button>
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
                <button className="btn secondary" onClick={() => openEdit(c)}>Edit</button>
                <button className="btn ghost" onClick={() => askDelete(c)}>Delete</button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <h3 style={{ marginTop: 20 }}>Client Coupons</h3>
      <div className="card">
        <table className="client-coupons-table">
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
                <td>{c.ownerUserID || '-'}</td>
                <td>
                  <span className={`tag-pill ${c.status === "Used" ? "gray" : c.status === "Expired" ? "red" : "green"}`}>
                    {c.status}
                  </span>
                </td>
                <td>{new Date(c.expiryDate).toLocaleDateString()}</td>
                <td className="right">
                  <div className="dropdown">
                    <button className="btn ghost">⋮</button>
                    <div className="dropdown-menu">
                      <button onClick={() => openEdit(c)}>View Details</button>
                      <button className="danger" onClick={() => askDelete(c)}>Delete</button>
                    </div>
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

  return (
    <Modal open={open} onClose={onClose} title={defaultValue ? 'Edit coupon' : 'Add coupon'}>
      <div className="grid-2">
        <div className="field">
          <label>Code</label>
          <input className="input" value={form.code} onChange={e => set('code', e.target.value)} />
        </div>
        <div className="field">
          <label>Type</label>
          <select className="input" value={form.discountType} onChange={e => set('discountType', e.target.value)}>
            <option>Percentage</option>
            <option>Fixed</option>
          </select>
        </div>
      </div>

      <div className="grid-2">
        <div className="field">
          <label>Value</label>
          <input className="input" type="number" value={form.discountValue} onChange={e => set('discountValue', Number(e.target.value))} />
        </div>
        <div className="field">
          <label>Min Amount</label>
          <input className="input" type="number" value={form.minInvoiceAmount} onChange={e => set('minInvoiceAmount', Number(e.target.value))} />
        </div>
      </div>

      <div className="grid-2">
        <div className="field">
          <label>Usage Limit (0 = unlimited)</label>
          <input className="input" type="number" value={form.usageLimit} onChange={e => set('usageLimit', Number(e.target.value))} />
        </div>
        <div className="field">
          <label>Expiry</label>
          <input className="input" type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label>Description</label>
        <textarea className="input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
      </div>

      <div className="row end">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" onClick={() => onSave(form)}>{defaultValue ? 'Update' : 'Create'}</button>
      </div>
    </Modal>
  );
}

function DeleteCouponModal({ coupon, onClose, onDelete, onEdit }) {
  return (
    <Modal open={!!coupon} onClose={onClose} title="Delete Coupon">
      <p style={{ marginBottom: '16px' }}>
        Are you sure you want to delete coupon <b>{coupon?.code}</b>?
      </p>
      <div className="row end fm-delete-coupon-actions">
        <button className="fm-btn ghost" onClick={onClose}>Cancel</button>
        {onEdit && <button className="btn secondary" onClick={onEdit}>Edit Instead</button>}
        <button className="fm-btn danger" onClick={onDelete}>Delete</button>
      </div>
    </Modal>
  );
}