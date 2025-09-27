import React, { useEffect, useMemo, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { api } from './services/financeApi';
import useAuthUser from './hooks/useAuthUser'; 
import './css/clientPay.css';

export default function CouponWall({ showHeader = true }) {
  const { user: authUser, loading: authLoading, error: authError } = useAuthUser();
  const ownerId = authUser?._id;

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [collecting, setCollecting] = useState(null);

  async function loadCoupons() {
    try {
      setLoading(true);
      const data = await api.get('/coupons?scope=GLOBAL');
      const all = data?.coupons || [];
      const globals = all.filter(c => (c.scope === 'GLOBAL' || c.scope == null));
      globals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTemplates(globals);
    } catch (e) {
      toast.error(e.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCoupons(); }, []);

  const handleCollect = async (tpl) => {
    if (!ownerId) {
      toast.error('Please log in to collect coupons');
      return;
    }
    try {
      setCollecting(tpl._id);
      const res = await api.post('/coupon/claim', { userID: ownerId, templateId: tpl._id });
      if (res?.alreadyClaimed) {
        toast('Already in your wallet 💼');
      } else {
        toast.success('Coupon collected! 🎉');
      }
    } catch (e) {
      const msg = (e?.message || '').toLowerCase();
      if (msg.includes('expired') || msg.includes('exhausted')) {
        toast('Ah snap! This coupon is out of stock now. More coming soon ✨');
      } else {
        toast.error(e.message || 'Could not collect coupon');
      }
    } finally {
      setCollecting(null);
    }
  };

  const cards = useMemo(() => (templates || []), [templates]);

  return (
    <div className="finance-scope">
      <div className="cwall-root">
        <Toaster position="top-right" />
        {showHeader && (
          <div className="cwall-header">
            <h2 className="cwall-title">Hot Deals 🔥</h2>
            <span className="muted" style={{ fontSize: 13 }}>
              Save them to your wallet and use at checkout
            </span>
          </div>
        )}

        {authLoading && <div className="muted">Loading account…</div>}
        {authError && <div className="error">{authError}</div>}
        {!authLoading && !ownerId && (
          <div className="notice">Log in to collect and save coupons.</div>
        )}

        <div className="cwall-cards-grid">
          {loading ? (
            <div className="muted" style={{ gridColumn: '1/-1' }}>Loading offers…</div>
          ) : cards.length === 0 ? (
            <div className="muted" style={{ gridColumn: '1/-1' }}>
              No active coupons right now. Check back soon ✨
            </div>
          ) : (
            cards.map((c) => {
              const isPercentage = c.discountType === 'Percentage';
              const badgeText = isPercentage
                ? `${c.discountValue}% OFF`
                : `LKR ${Number(c.discountValue).toFixed(0)} OFF`;
              const exhausted = c.usageLimit > 0 && Number(c.usedCount || 0) >= c.usageLimit;
              const left = c.usageLimit > 0 ? Math.max(0, c.usageLimit - (c.usedCount || 0)) : null;

              return (
                <div key={c._id} className="cwall-card">
                  <div className="cwall-card-accent" />
                  <div className="cwall-card-head">
                    <div className="cwall-card-code">{c.code}</div>
                    <div className="cwall-card-badge">{badgeText}</div>
                  </div>

                  <div className="cwall-card-desc">{c.description || 'Limited time offer'}</div>

                  <div className="cwall-card-meta">
                    <div>Min spend: <b>{fmtLKR(c.minInvoiceAmount || 0)}</b></div>
                    <div>Expires: <b>{fmtDate(c.expiryDate)}</b></div>
                    {c.usageLimit > 0 && (
                      <div className="cwall-card-supply">Supply: {left} left</div>
                    )}
                  </div>

                  <div className="cwall-card-actions">
                    <button
                      className="btn primary cwall-card-btn"
                      onClick={() => handleCollect(c)}
                      disabled={exhausted || collecting === c._id || !ownerId}
                    >
                      {!ownerId
                        ? 'Log in required'
                        : exhausted
                          ? 'Sold out'
                          : (collecting === c._id ? 'Collecting…' : 'Collect')}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function fmtLKR(n) {
  try {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0
    }).format(Number(n) || 0);
  } catch {
    return `LKR ${Number(n || 0).toFixed(0)}`;
  }
}
function fmtDate(d) {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return String(d);
  }
}