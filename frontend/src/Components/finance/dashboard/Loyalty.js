import React, { useEffect, useMemo, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { api } from '../services/financeApi';
import Modal from './components/Modal';
import Skeleton from './components/Skeleton';
import { Search, RefreshCcw, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import '../css/dashboard/loyalty.css';

const TIERS = [
  { value: "Puppy Pal", label: "Puppy Pal" },
  { value: "Kitty Champ", label: "Kitty Champ" },
  { value: "Guardian Woof", label: "Guardian Woof" },
  { value: "Legendary Lion", label: "Legendary Lion" }
];

const TIER_ORDER = {
  "Puppy Pal": 1,
  "Kitty Champ": 2,
  "Guardian Woof": 3,
  "Legendary Lion": 4
};

export default function Loyalty() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [addModal, setAddModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [tierModal, setTierModal] = useState(null);

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
        const n = (l.userID?.name || '').toLowerCase();
        const e = (l.userID?.email || '').toLowerCase();
        return n.includes(q) || e.includes(q);
      });
    }
    arr = arr.sort((a, b) => {
      const tierA = TIER_ORDER[a.tier] || 0;
      const tierB = TIER_ORDER[b.tier] || 0;
      if (tierA === tierB) return (b.points || 0) - (a.points || 0);
      return tierB - tierA;
    });
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
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="loy-page">
      <Toaster position="top-right" />

      <div className="loy-head">
        <h2 className="loy-title">Loyalty Accounts</h2>
        <button className="loy-btn" onClick={load}>
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      <div className="loy-toolbar">
        <div className="loy-filters">
          <div className="loy-search">
            <Search size={16} />
            <input
              className="loy-search-input"
              placeholder="Search by owner or email"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      <div className="loy-card">
        {loading ? (
          <Skeleton rows={8} />
        ) : (
          <>
            <table className="loy-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Owner</th>
                  <th>Points</th>
                  <th>Tier</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 && (
                  <tr><td colSpan={5} className="muted">No accounts</td></tr>
                )}
                {pageItems.map((l, i) => (
                  <tr key={l._id}>
                    <td className="loy-mono">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td>
                      <div className="loy-owner">
                        <div className="name">{l.userID?.name || '-'}</div>
                        <div className="email">{l.userID?.email || '-'}</div>
                      </div>
                    </td>
                    <td className="loy-mono">{Number(l.points || 0)}</td>
                    <td>
                      <select
                        className="loy-tier-select"
                        value={TIERS.find(t => t.value === l.tier) ? l.tier : "Puppy Pal"}
                        onChange={(e) => setTierModal({ row: l, newTier: e.target.value })}
                      >
                        {TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </td>
                    <td className="right">
                      <div className="loy-actions">
                        <button className="loy-btn-primary" onClick={() => setAddModal(l)}>Add points</button>
                        <button className="loy-btn-danger" onClick={() => setDeleteModal(l)}>
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="loy-pagination">
              <button className="loy-btn-ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={16} /> Prev
              </button>
              <div>Page {page} of {totalPages}</div>
              <button className="loy-btn-ghost" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      {addModal && (
        <AddPointsModal
          open
          onClose={() => setAddModal(null)}
          onAdd={(amt) => addPoints(addModal.userID?._id, amt)}
          ownerName={addModal.userID?.name}
        />
      )}

      {deleteModal && (
        <DeleteConfirmModal
          open
          onClose={() => setDeleteModal(null)}
          onDelete={() => {
            remove(deleteModal._id);
            setDeleteModal(null);
          }}
          owner={deleteModal.userID?.name}
        />
      )}

      {tierModal && (
        <TierConfirmModal
          open
          onClose={() => setTierModal(null)}
          onConfirm={() => {
            updateTier(tierModal.row._id, tierModal.newTier);
            setTierModal(null);
          }}
          currentTier={tierModal.row.tier}
          newTier={tierModal.newTier}
          owner={tierModal.row.userID?.name}
        />
      )}
    </div>
  );
}

/* ------------ Modals ------------ */
function AddPointsModal({ open, onClose, onAdd, ownerName }) {
  const [amount, setAmount] = useState(1000);
  return (
    <Modal open={open} onClose={onClose} title={`Add points — ${ownerName || ''}`} className="loy-modal">
      <div className="loy-field">
        <label>Amount Spent (LKR)</label>
        <input
          className="loy-input"
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>
      <div className="loy-actions">
        <button className="loy-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="loy-btn-primary" onClick={() => onAdd(amount)}>Add points</button>
      </div>
    </Modal>
  );
}

function DeleteConfirmModal({ open, onClose, onDelete, owner }) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Loyalty Record" className="loy-modal">
      <div className="loy-notice error">
        ⚠️ This will permanently remove {owner || 'this user'}’s loyalty record.
      </div>
      <div className="loy-actions">
        <button className="loy-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="loy-btn-danger" onClick={onDelete}>
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </Modal>
  );
}

function TierConfirmModal({ open, onClose, onConfirm, currentTier, newTier, owner }) {
  return (
    <Modal open={open} onClose={onClose} title="Change Loyalty Tier" className="loy-modal">
      <div className="loy-notice">
        {owner ? <b>{owner}</b> : 'This user'} is currently in <b>{currentTier || 'Unknown'}</b> tier.
        You are about to change their tier to <b>{newTier}</b>.
        <br /><br />Are you sure you want to apply this change?
      </div>
      <div className="loy-actions">
        <button className="loy-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="loy-btn-primary" onClick={onConfirm}>Confirm</button>
      </div>
    </Modal>
  );
}