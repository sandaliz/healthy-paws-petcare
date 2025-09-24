import React, { useEffect, useMemo, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { api } from './financeApi';

export default function CouponWall({ showHeader = true }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userIdInput, setUserIdInput] = useState(localStorage.getItem('hp_ownerId') || '');
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
    const uid = (userIdInput || '').trim();
    if (!uid) return toast.error('Please enter your Account _id to collect');
    localStorage.setItem('hp_ownerId', uid);
    try {
      setCollecting(tpl._id);
      const res = await api.post('/coupon/claim', { userID: uid, templateId: tpl._id });
      if (res?.alreadyClaimed) toast('You already claimed this coupon. It’s in your wallet! 💼');
      else toast.success('Coupon collected! You can apply it at checkout.');
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
    <div style={{ marginTop: 24 }}>
      <Toaster position="top-right" />
      {showHeader && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0 }}>Hot Deals 🔥</h2>
          <span style={{ fontSize: 13, color: '#6b7280' }}>Save them to your wallet and use at checkout</span>
        </div>
      )}

      <div style={{
        display: 'flex', gap: 8, alignItems: 'center',
        marginBottom: 12, background: '#FFFAF1', border: '1px dashed #FED58E',
        padding: '8px 12px', borderRadius: 10
      }}>
        <span style={{ fontWeight: 600, color: '#7A5A50' }}>Your Account _id</span>
        <input
          className="input"
          placeholder="e.g. 66f…"
          value={userIdInput}
          onChange={(e) => setUserIdInput(e.target.value)}
          style={{ flex: '1 1 200px' }}
        />
        <button className="btn" onClick={() => { localStorage.setItem('hp_ownerId', (userIdInput || '').trim()); toast.success('Saved'); }}>
          Save
        </button>
      </div>

      <div style={gridStyle}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', color: '#6b7280' }}>Loading offers…</div>
        ) : cards.length === 0 ? (
          <div style={{ gridColumn: '1/-1', color: '#6b7280' }}>No active coupons right now. Check back soon ✨</div>
        ) : (
          cards.map((c) => {
            const isPercentage = c.discountType === 'Percentage';
            const badgeText = isPercentage ? `${c.discountValue}% OFF` : `LKR ${Number(c.discountValue).toFixed(0)} OFF`;
            const exhausted = c.usageLimit > 0 && Number(c.usedCount || 0) >= c.usageLimit;
            const left = c.usageLimit > 0 ? Math.max(0, c.usageLimit - (c.usedCount || 0)) : null;

            return (
              <div key={c._id} style={cardStyle}>
                <div style={accentStrip} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#2a1f1c', letterSpacing: 0.4 }}>
                    {c.code}
                  </div>
                  <div style={badgeStyle}>{badgeText}</div>
                </div>

                <div style={{ marginTop: 6, color: '#624b44', fontSize: 13 }}>
                  {c.description || 'Limited time offer'}
                </div>

                <div style={{ marginTop: 10, fontSize: 12, color: '#6b7280' }}>
                  <div>Min spend: <b>{fmtLKR(c.minInvoiceAmount || 0)}</b></div>
                  <div>Expires: <b>{fmtDate(c.expiryDate)}</b></div>
                  {c.usageLimit > 0 && <div style={{ marginTop: 2 }}>Supply: {left} left</div>}
                </div>

                <div style={{ marginTop: 12 }}>
                  <button
                    className="btn primary"
                    onClick={() => handleCollect(c)}
                    disabled={exhausted || collecting === c._id}
                    style={{ width: '100%' }}
                  >
                    {exhausted ? 'Sold out' : (collecting === c._id ? 'Collecting…' : 'Collect')}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 };
const cardStyle = { position: 'relative', border: '1px solid #f3f4f6', borderRadius: 14, background: 'linear-gradient(180deg, #FFFDF8 0%, #FFFFFF 60%)', padding: 12, boxShadow: '0 8px 20px rgba(84,65,60,0.07)' };
const accentStrip = { position: 'absolute', top: 0, left: 0, right: 0, height: 6, borderTopLeftRadius: 14, borderTopRightRadius: 14, background: 'linear-gradient(90deg, #FFB86C, #FFD58E, #FFB86C)' };
const badgeStyle = { background: '#2a1f1c', color: '#fff', padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: 0.4 };

function fmtLKR(n) { try { return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(Number(n) || 0); } catch { return `LKR ${Number(n || 0).toFixed(0)}`; } }
function fmtDate(d) { if (!d) return '-'; try { return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }); } catch { return String(d); } }
