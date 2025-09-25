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

  const remove = async (id) => {
    if (!window.confirm('Delete coupon?')) return;
    try {
      await api.delete(`/coupon/${id}`);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-head">
        <h2>Coupons</h2>
        <button className="btn primary" onClick={openNew}>Add coupon</button>
      </div>

      <div className="coupon-grid">
        {(items || []).map(c => (
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
                <button className="btn ghost" onClick={() => remove(c._id)}>Delete</button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {open && (
        <CouponModal
          open={open}
          onClose={() => setOpen(false)}
          onSave={save}
          defaultValue={edit}
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