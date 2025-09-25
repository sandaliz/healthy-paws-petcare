import React, { useEffect, useMemo, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { api } from '../financeApi';
import Modal from './components/Modal';
import Skeleton from './components/Skeleton';
import { Search, RefreshCcw, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import '../css/dashboard.css';

export default function Salaries() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.get('/salaries');
      setRows(data.salaries || []);
    } catch {
      toast.error('Failed to load salaries');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let arr = rows || [];
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(s => {
        const name = (s.employee?.OwnerName || s.employeeID?.OwnerName || '').toLowerCase();
        const email = (s.employee?.OwnerEmail || s.employeeID?.OwnerEmail || '').toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    }
    return arr;
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const toggleStatus = async (s) => {
    try {
      const next = s.status === 'Pending' ? 'Paid' : 'Pending';
      await api.put(`/salary/${s._id}`, { status: next });
      toast.success('Status updated');
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Update failed');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete salary record?')) return;
    try {
      await api.delete(`/salary/${id}`);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-head">
        <h2>Salaries</h2>
        <div className="row">
          <button className="btn" onClick={load}><RefreshCcw size={16} /> Refresh</button>
          <button className="btn primary" onClick={() => setCreateOpen(true)}><Plus size={16} /> New salary</button>
        </div>
      </div>

      <div className="fm-toolbar">
        <div className="fm-filters">
          <div className="fm-search">
            <Search size={16} />
            <input
              className="input"
              placeholder="Search by employee or email"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
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
                  <th>Employee</th>
                  <th>Base</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net</th>
                  <th>Month</th>
                  <th>Status</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 && (
                  <tr><td colSpan={8} className="muted">No salary records</td></tr>
                )}
                {pageItems.map(s => (
                  <tr key={s._id}>
                    <td>
                      <div className="owner">
                        <div className="name">{s.employee?.OwnerName || s.employeeID?.OwnerName || '-'}</div>
                        <div className="email">{s.employee?.OwnerEmail || s.employeeID?.OwnerEmail || '-'}</div>
                      </div>
                    </td>
                    <td className="mono">{fmtLKR(s.baseSalary)}</td>
                    <td className="mono">{fmtLKR(s.allowances || 0)}</td>
                    <td className="mono">{fmtLKR(s.deductions || 0)}</td>
                    <td className="mono"><b>{fmtLKR(s.netSalary || 0)}</b></td>
                    <td>{(s.month || '-')}/{s.year || '-'}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td className="right">
                      <div className="row end">
                        <button className="btn ghost" onClick={() => setEditRow(s)}><Pencil size={16} /> Edit</button>
                        <button className="btn" onClick={() => toggleStatus(s)}>{s.status === 'Pending' ? 'Mark Paid' : 'Mark Pending'}</button>
                        <button className="btn ghost" onClick={() => remove(s._id)}><Trash2 size={16} /> Delete</button>
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
        <CreateSalaryModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSaved={() => { setCreateOpen(false); load(); }}
        />
      )}

      {editRow && (
        <EditSalaryModal
          open={!!editRow}
          onClose={() => setEditRow(null)}
          s={editRow}
          onSaved={() => { setEditRow(null); load(); }}
        />
      )}
    </div>
  );
}

function CreateSalaryModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState({
    employeeID: '',
    baseSalary: 100000,
    allowances: 0,
    deductions: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const save = async () => {
    try {
      await api.post('/salary', { ...form });
      toast.success('Salary created');
      onSaved?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Create failed');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New salary">
      <div className="grid-2">
        <div className="field"><label>Employee Register _id</label><input className="input" value={form.employeeID} onChange={e => set('employeeID', e.target.value)} /></div>
        <div className="field"><label>Base salary</label><input className="input" type="number" value={form.baseSalary} onChange={e => set('baseSalary', Number(e.target.value))} /></div>
      </div>
      <div className="grid-2">
        <div className="field"><label>Allowances</label><input className="input" type="number" value={form.allowances} onChange={e => set('allowances', Number(e.target.value))} /></div>
        <div className="field"><label>Deductions</label><input className="input" type="number" value={form.deductions} onChange={e => set('deductions', Number(e.target.value))} /></div>
      </div>
      <div className="grid-2">
        <div className="field"><label>Month</label><input className="input" type="number" min="1" max="12" value={form.month} onChange={e => set('month', Number(e.target.value))} /></div>
        <div className="field"><label>Year</label><input className="input" type="number" value={form.year} onChange={e => set('year', Number(e.target.value))} /></div>
      </div>
      <div className="row end sal-create-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" onClick={save}>Create</button>
      </div>
    </Modal>
  );
}

function EditSalaryModal({ open, onClose, s, onSaved }) {
  const [form, setForm] = useState({
    allowances: s.allowances || 0,
    deductions: s.deductions || 0,
    status: s.status || 'Pending',
  });
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const save = async () => {
    try {
      await api.put(`/salary/${s._id}`, { ...form });
      toast.success('Salary updated');
      onSaved?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Update failed');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Edit salary — ${s.employee?.OwnerName || s.employeeID?.OwnerName || ''}`}>
      <div className="grid-2">
        <div className="field"><label>Allowances</label><input className="input" type="number" value={form.allowances} onChange={e => set('allowances', Number(e.target.value))} /></div>
        <div className="field"><label>Deductions</label><input className="input" type="number" value={form.deductions} onChange={e => set('deductions', Number(e.target.value))} /></div>
      </div>
      <div className="field">
        <label>Status</label>
        <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
          <option>Pending</option>
          <option>Paid</option>
        </select>
      </div>
      <div className="row end sal-edit-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" onClick={save}>Save</button>
      </div>
    </Modal>
  );
}

function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();
  let cls = 'tag-pill';
  if (s === 'paid') cls += ' green';
  else if (s === 'pending') cls += ' yellow';
  return <span className={cls}>{status}</span>;
}

function fmtLKR(n) {
  try { return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(Number(n) || 0); }
  catch { return `LKR ${Number(n || 0).toFixed(2)}`; }
}