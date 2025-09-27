import React, { useEffect, useState } from "react";
import { api } from "./services/financeApi";  
import { Toaster, toast } from "react-hot-toast";
import useAuthUser from "./hooks/useAuthUser"; 
import "./css/PromotionTab.css";

export default function PromotionTab() {
  const { user: authUser, loading: authLoading, error: authError } = useAuthUser();
  const ownerId = authUser?._id;

  const [loyalty, setLoyalty] = useState(null);
  const [myCoupons, setMyCoupons] = useState([]);
  const [globalCoupons, setGlobalCoupons] = useState([]);

  useEffect(() => {
    if (!ownerId) return;
    (async () => {
      try {
        const lRes = await api.get(`/loyalty/${ownerId}`);
        setLoyalty(lRes.loyalty || null);

        const uRes = await api.get(`/coupon/user-available?userId=${ownerId}`);
        setMyCoupons(uRes.coupons || []);

        const gRes = await api.get(`/coupons?scope=GLOBAL`);
        setGlobalCoupons(gRes.coupons || []);
      } catch (err) {
        toast.error(err.message || "Failed to load PawPerks");
      }
    })();
  }, [ownerId]);

  const handleClaim = async (tpl) => {
    try {
      const res = await api.post("/coupon/claim", { userID: ownerId, templateId: tpl._id });
      toast.success(res.alreadyClaimed ? "Already in your wallet 💼" : "Coupon claimed! 🎉");
      const uRes = await api.get(`/coupon/user-available?userId=${ownerId}`);
      setMyCoupons(uRes.coupons || []);
    } catch (err) {
      toast.error(err.message || "Failed to claim coupon");
    }
  };

  const pointsToNextTier = (points) => {
    if (points >= 2000) return 0;
    if (points >= 1000) return 2000 - points;
    if (points >= 500) return 1000 - points;
    return 500 - points;
  };

  const isExpired = (expiry) => new Date(expiry) < new Date();

  const sortedMyCoupons = [...myCoupons].sort((a, b) => {
    const aExpired = isExpired(a.expiryDate) || a.status !== "Available";
    const bExpired = isExpired(b.expiryDate) || b.status !== "Available";
    return aExpired === bExpired ? 0 : aExpired ? 1 : -1;
  });

  const sortedGlobalCoupons = [...globalCoupons].sort((a, b) => {
    const aExpired = isExpired(a.expiryDate) || (a.usageLimit > 0 && a.usedCount >= a.usageLimit);
    const bExpired = isExpired(b.expiryDate) || (b.usageLimit > 0 && b.usedCount >= b.usageLimit);
    return aExpired === bExpired ? 0 : aExpired ? 1 : -1;
  });

  return (
    <div className="pawperks-shell">
      <Toaster position="top-right" />
      
      {/* PawPerks header */}
      <div className="pawperks-header">
        <h2 className="pawperks-title">🐾 PawPerks</h2>
        <p className="muted">Your tail‑wagging hub for rewards, coupons, and loyalty points.</p>
      </div>

      {authLoading && <div className="muted">Loading your PawPerks…</div>}
      {authError && <div className="error">{authError}</div>}
      {!authLoading && !ownerId && <div className="notice">Please log in to view your perks.</div>}

      {/* Loyalty */}
      {loyalty && (
        <div className="pawperks-loyalty-card">
          <h3> Your PawPoints :) </h3>
          <div className="pawpoints">{loyalty.points} pts</div>
          <div className="loyalty-bar">
            <div
              className={`bar-fill tier-${loyalty.tier.toLowerCase()}`}
              style={{ width: `${Math.min(loyalty.points / 20, 100)}%` }}
            />
          </div>
          <div className="tier-label">Current Tier: {loyalty.tier}</div>
          {pointsToNextTier(loyalty.points) > 0 && (
            <p className="next-tier">{pointsToNextTier(loyalty.points)} pts to next tier!</p>
          )}
          {loyalty.tier === "Platinum" && (
            <p className="next-tier">💎 Platinum unlocked! You’re top of the pack!</p>
          )}
        </div>
      )}

      {/* My Coupons */}
      <section className="pawperks-section">
        <h3>My Coupons</h3>
        {sortedMyCoupons.length === 0 ? (
          <div className="notice">No active coupons. Grab some from offers below 👇</div>
        ) : (
          <div className="coupon-grid">
            {sortedMyCoupons.map((c) => {
              const expired = isExpired(c.expiryDate);
              const used = c.status !== "Available";
              return (
                <div className={`coupon-card ${expired ? "expired" : used ? "claimed" : "active"}`} key={c.couponId}>
                  <div className="code">{c.code}</div>
                  <div className="discount">
                    {c.discountType === "Percentage" ? `${c.discountValue}% OFF` : `LKR ${c.discountValue} OFF`}
                  </div>
                  <div className="meta">Min {fmtLKR(c.minInvoiceAmount)} • Expires {fmtDate(c.expiryDate)}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Global / Available Coupons */}
      <section className="pawperks-section">
        <h3> Claim New Offers!</h3>
        <div className="coupon-grid">
          {sortedGlobalCoupons.map((c) => {
            const expired = isExpired(c.expiryDate);
            const exhausted = c.usageLimit > 0 && c.usedCount >= c.usageLimit;
            return (
              <div className={`coupon-card ${expired ? "expired" : exhausted ? "claimed" : "active"}`} key={c._id}>
                <div className="code">{c.code}</div>
                <div className="discount">{c.discountType === "Percentage" ? `${c.discountValue}%` : `LKR ${c.discountValue}`}</div>
                <div className="meta">Min {fmtLKR(c.minInvoiceAmount)} • Expires {fmtDate(c.expiryDate)}</div>
                <button className="btn secondary" disabled={expired || exhausted} onClick={() => handleClaim(c)}>
                  {expired ? "Expired" : exhausted ? "Claimed" : "Claim"}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function fmtLKR(n) {
  return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(Number(n) || 0);
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}