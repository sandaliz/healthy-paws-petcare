import React, { useEffect, useState } from "react";
import { api } from "../services/financeApi";
import { Toaster, toast } from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";
import { fmtLKR, fmtDate } from "../utils/financeFormatters";
import "../css/PromotionTab.css";
import "../css/PawPerksGuide.css";

const TIER_CONFIG = {
  "Puppy Pal": {
    icon: "🐶",
    nextAt: 500,
    color: "#facc15",
    story: "You've joined the pack as a playful Puppy Pal! Earn treats by caring for your pets 💕",
  },
  "Kitty Champ": {
    icon: "😺",
    nextAt: 1000,
    color: "#C0C0C0",
    story: "Graceful and clever — Kitty Champs know how to pounce on pawsome deals 🐾",
  },
  "Guardian Woof": {
    icon: "🦴",
    nextAt: 2000,
    color: "#FFD700",
    story: "Loyal and mighty, Guardians protect their pets with unbeatable perks 🛡️",
  },
  "Legendary Lion": {
    icon: "🦁",
    nextAt: null,
    color: "#E5E4E2",
    story: "The King of PawPerks! Rule the jungle of rewards with ultimate benefits 👑",
  },
};

function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (isLocked) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isLocked]);
}

const progressPercent = (points, tier) => {
  const cfg = TIER_CONFIG[tier];
  if (!cfg || !cfg.nextAt) return 100;
  const prev =
    tier === "Puppy Pal" ? 0 :
    tier === "Kitty Champ" ? 500 :
    tier === "Guardian Woof" ? 1000 : 2000;
  return Math.min(((points - prev) / (cfg.nextAt - prev)) * 100, 100);
};

// 👇 NEW: Prevent rapid clicks / double claims
const useDebounceAction = (action, delay = 800) => {
  const [pending, setPending] = useState(false);

  return async (...args) => {
    if (pending) return;
    setPending(true);
    try {
      await action(...args);
    } finally {
      setTimeout(() => setPending(false), delay);
    }
  };
};

export default function PromotionTab() {
  const { user: authUser, loading: authLoading, error: authError } = useAuthUser();
  const ownerId = authUser?._id;

  const [loyalty, setLoyalty] = useState(null);
  const [myCoupons, setMyCoupons] = useState([]);
  const [globalCoupons, setGlobalCoupons] = useState([]);
  const [showGuide, setShowGuide] = useState(false);
  const [loading, setLoading] = useState(true);

  useBodyScrollLock(showGuide);

  // 👇 Debounced claim handler
  const handleClaim = useDebounceAction(async (tpl) => {
    try {
      const optimisticCoupon = {
        ...tpl,
        status: "Available",
        code: tpl.code + "-TEMP",
        _id: "temp-" + Date.now(),
      };
      setMyCoupons(prev => [...prev, optimisticCoupon]);

      const res = await api.post("/coupon/claim", { userID: ownerId, templateId: tpl._id });
      
      toast.success(res.alreadyClaimed ? "Already in your wallet 💼" : "Coupon claimed! 🎉");

      const uRes = await api.get(`/coupon/user-available?userId=${ownerId}`);
      setMyCoupons(uRes.coupons || []);
    } catch (err) {
      toast.error(err.message || "Failed to claim coupon");
      setMyCoupons(prev => prev.filter(c => !c._id?.startsWith("temp-")));
    }
  });

  const isExpired = (expiry) => new Date(expiry) < new Date();

  const couponOrder = (c, now) => {
    const expired = isExpired(c.expiryDate);
    const inactive = c.status !== "Available";
    if (expired) return 3; // Expired last
    if (inactive) return 2; // Used/claimed middle
    return 1; // Active first
  };

  const sortedMyCoupons = [...myCoupons].sort((a, b) => {
    const now = new Date();
    const orderA = couponOrder(a, now);
    const orderB = couponOrder(b, now);
    if (orderA !== orderB) return orderA - orderB;
    const dateA = new Date(a.createdAt || a.expiryDate || 0);
    const dateB = new Date(b.createdAt || b.expiryDate || 0);
    return dateB - dateA;
  });

  const sortedGlobalCoupons = [...globalCoupons].sort((a, b) => {
    const now = new Date();
    const orderA = couponOrder(a, now);
    const orderB = couponOrder(b, now);
    if (orderA !== orderB) return orderA - orderB;
    const dateA = new Date(a.createdAt || a.expiryDate || 0);
    const dateB = new Date(b.createdAt || b.expiryDate || 0);
    return dateB - dateA;
  });

  useEffect(() => {
    if (!ownerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
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
      } finally {
        setLoading(false);
      }
    })();
  }, [ownerId]);

  // 👇 Helper: Forecast next tier
  const getNextTierForecast = () => {
    if (!loyalty || !TIER_CONFIG[loyalty.tier]?.nextAt) return null;
    const needed = TIER_CONFIG[loyalty.tier].nextAt - loyalty.points;
    const visitsNeeded = Math.ceil(needed / 50); // assume 50 pts per visit avg
    return `${visitsNeeded} more visit${visitsNeeded > 1 ? 's' : ''} to reach next tier!`;
  };

  return (
    <div className="pawperks-shell">
      <Toaster position="top-right" />

      <div className="pawperks-header">
        <div className="pawperks-header-top">
          <h2 className="pawperks-title">🐾 PawPerks</h2>
          <button
            className="pawguide-info-btn"
            onClick={() => setShowGuide(true)}
            aria-label="Open PawPerks Guide"
          >
            🐾
          </button>
        </div>
        <p className="muted">Your tail‑wagging hub for rewards, coupons, and loyalty points.</p>
      </div>

      {authLoading && <div className="loading-skeleton">Loading your PawPerks…</div>}
      {authError && <div className="error-banner">{authError}</div>}
      {!authLoading && !ownerId && (
        <div className="notice-card">
          <div> Please log in to unlock your PawPerks!</div>
        </div>
      )}

      {loading && !authLoading && ownerId && (
        <div className="skeleton-card">
          <div className="skeleton-bar"></div>
          <div className="skeleton-text"></div>
        </div>
      )}

      {loyalty && !loading && (
        <div className="pawperks-loyalty-card">
          <h3>Your PawPoints</h3>
          <div className="pawpoints">{loyalty.points.toLocaleString()} pts</div>
          <div className="loyalty-bar">
            <div
              className="bar-fill"
              style={{
                width: `${progressPercent(loyalty.points, loyalty.tier)}%`,
                background: `linear-gradient(90deg, ${TIER_CONFIG[loyalty.tier]?.color}, #f97316)`,
              }}
            />
          </div>
          <div className="tier-label">
            Current Tier: <strong>{loyalty.tier}</strong> {TIER_CONFIG[loyalty.tier]?.icon}
          </div>
          {TIER_CONFIG[loyalty.tier]?.nextAt ? (
            <>
              <p className="next-tier">
                {TIER_CONFIG[loyalty.tier].nextAt - loyalty.points} pts to reach next level
              </p>
              <p className="forecast-hint">{getNextTierForecast()}</p>
            </>
          ) : (
            <p className="next-tier celebratory">
              {TIER_CONFIG[loyalty.tier]?.icon}Legendary Lion unlocked! You’re top of the jungle!
            </p>
          )}
          <div className="how-to-earn">
            <em>Earn points by paying invoices • Unlock tiers and redeem coupons at checkout</em>
          </div>
        </div>
      )}

      {/* --- My Coupons --- */}
      <section className="pawperks-section">
        <h3>My Coupons</h3>
        {sortedMyCoupons.length === 0 && !loading ? (
          <div className="empty-state">
            <div>No active coupons yet!</div>
            <div>Grab some exciting offers below!</div>
          </div>
        ) : (
          <div className="coupon-grid">
            {sortedMyCoupons.map((c) => {
              const expired = isExpired(c.expiryDate);
              const used = c.status !== "Available";
              return (
                <div
                  className={`coupon-card ${expired ? "expired" : used ? "claimed" : "active"}`}
                  key={c._id || c.couponId}
                  tabIndex={0}
                  aria-label={`Coupon ${c.code}, ${expired ? 'expired' : used ? 'already used' : 'active'}, expires ${fmtDate(c.expiryDate)}`}
                >
                  <div className="code">{c.code}</div>
                  <div className="discount">
                    {c.discountType === "Percentage"
                      ? `${c.discountValue}% OFF`
                      : `${fmtLKR(c.discountValue)} OFF`}
                  </div>
                  <div className="meta">
                    Min {fmtLKR(c.minInvoiceAmount)} • Expires {fmtDate(c.expiryDate)}
                  </div>
                  {c.invoiceID && (
                    <div className="source-link">
                      Earned from <a href={`/invoices/${c.invoiceID}`}>Invoice #{c.invoiceID.slice(-6)}</a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* --- Global Coupons --- */}
      <section className="pawperks-section">
        <h3>Claim New Offers!</h3>
        {globalCoupons.length === 0 && !loading ? (
          <div className="empty-state">
            <div> No global offers available right now.</div>
            <div>Check back soon for seasonal surprises!</div>
          </div>
        ) : (
          <div className="coupon-grid">
            {sortedGlobalCoupons.map((c) => {
              const expired = isExpired(c.expiryDate);
              const exhausted = c.usageLimit > 0 && c.usedCount >= c.usageLimit;
              const disabled = expired || exhausted;
              return (
                <div
                  className={`coupon-card ${expired ? "expired" : exhausted ? "claimed" : "active"}`}
                  key={c._id}
                  tabIndex={0}
                >
                  <div className="code">{c.code}</div>
                  <div className="discount">
                    {c.discountType === "Percentage"
                      ? `${c.discountValue}% OFF`
                      : `${fmtLKR(c.discountValue)} OFF`}
                  </div>
                  <div className="meta">
                    Min {fmtLKR(c.minInvoiceAmount)} • Expires {fmtDate(c.expiryDate)}
                  </div>
                  <button
                    className="btn secondary"
                    disabled={disabled}
                    onClick={() => handleClaim(c)}
                    aria-label={disabled ? "Coupon not available" : `Claim coupon ${c.code}`}
                  >
                    {expired ? "Expired" : exhausted ? "Claimed" : "Claim"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* --- Tier Guide Modal --- */}
      {showGuide && (
        <div className="pawguide-modal" onClick={() => setShowGuide(false)} role="dialog" aria-modal="true">
          <div className="pawguide-map" onClick={(e) => e.stopPropagation()}>
            <button
              className="pawguide-close"
              onClick={() => setShowGuide(false)}
              aria-label="Close PawPerks Guide"
            >
              ✖
            </button>
            <h3 className="pawguide-title">The PawPerks Treasure Map</h3>

            <div className="pawguide-map-canvas">
              <svg className="pawguide-path" preserveAspectRatio="none">
                <path d="M0 1 L1600 1" fill="none" />
              </svg>

              {Object.entries(TIER_CONFIG).map(([tier, cfg], idx) => (
                <div className="pawguide-tier-spot" key={tier} style={{ borderColor: cfg.color }}>
                  <div className="pawguide-tier-icon">{cfg.icon}</div>
                  <div className="pawguide-tier-name">{tier}</div>
                  <div className="pawguide-threshold">
                    {cfg.nextAt ? `Reach ${cfg.nextAt.toLocaleString()} pts` : "🏆 Final Treasure"}
                  </div>
                  <div className="pawguide-story" title={cfg.story}>
                    {cfg.story}
                  </div>
                  {idx === Object.keys(TIER_CONFIG).length - 1 && (
                    <div className="pawguide-xmark" aria-hidden="true">
                      X
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pawguide-footer-hint">
              Earn points by paying invoices • redeem coupons at checkout • Every pet deserves perks!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}