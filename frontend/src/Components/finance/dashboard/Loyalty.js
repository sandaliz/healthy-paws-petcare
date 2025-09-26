import React, { useEffect, useMemo, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { api } from '../financeApi';
import Modal from './components/Modal';
import Skeleton from './components/Skeleton';
import { Search, RefreshCcw, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import '../css/dashboard.css';

const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum'];

export default function Loyalty() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [addModal, setAddModal] = useState(null); // holds userID for add points

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.get('/loyalty');
      setRows(data.loyalties || []);
    } catch {
      toast.error('Failed to load loyalty accounts');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let arr = rows || [];
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(l => {
        const name = (l.userID?.OwnerName || '').toLowerCase();
        const email = (l.userID?.OwnerEmail || '').toLowerCase();
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

  const addPoints = async (userID, amountSpent) => {
    try {
      await api.post('/loyalty/add-points', { userID, amountSpent: Number(amountSpent) });
      toast.success('Points added');
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to add points');
    }
  };

  const updateTier = async (id, tier) => {
    try {
      await api.put(`/loyalty/update-tier/${id}`, { tier });
      toast.success('Tier updated');
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update tier');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete loyalty record?')) return;
    try {
      await api.delete(`/loyalty/${id}`);
      toast.success('Deleted');
      load();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-head">
        <h2>Loyalty Accounts</h2>
        <button className="btn" onClick={load}><RefreshCcw size={16} /> Refresh</button>
      </div>

      <div className="fm-toolbar">
        <div className="fm-filters">
          <div className="fm-search">
            <Search size={16} />
            <input
              className="input"
              placeholder="Search by owner or email"
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
                  <th>Owner</th>
                  <th>Points</th>
                  <th>Tier</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 && (
                  <tr><td colSpan={4} className="muted">No accounts</td></tr>
                )}
                {pageItems.map(l => (
                  <tr key={l._id}>
                    <td>
                      <div className="owner">
                        <div className="name">{l.userID?.OwnerName || '-'}</div>
                        <div className="email">{l.userID?.OwnerEmail || '-'}</div>
                      </div>
                    </td>
                    <td className="mono">{Number(l.points || 0)}</td>
                    <td>
                      <select className="input" value={l.tier} onChange={(e) => updateTier(l._id, e.target.value)}>
                        {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className="right">
                      <div className="row end">
                        <button className="btn primary" onClick={() => setAddModal(l)}>Add points</button>
                        <button className="btn ghost" onClick={() => remove(l._id)}><Trash2 size={16} /> Delete</button>
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

      {addModal && (
        <AddPointsModal
          open={!!addModal}
          onClose={() => setAddModal(null)}
          onAdd={(amt) => addPoints(addModal.userID?._id, amt)}
          ownerName={addModal.userID?.OwnerName}
        />
      )}
    </div>
  );
}

function AddPointsModal({ open, onClose, onAdd, ownerName }) {
  const [amount, setAmount] = useState(1000);
  return (
    <Modal open={open} onClose={onClose} title={`Add points — ${ownerName || ''}`}>
      <div className="field">
        <label>Amount Spent (LKR)</label>
        <input className="input" type="number" min="0" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
      </div>
      <div className="row end loyalty-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" onClick={() => onAdd(amount)}>Add points</button>
      </div>
    </Modal>
  );
}