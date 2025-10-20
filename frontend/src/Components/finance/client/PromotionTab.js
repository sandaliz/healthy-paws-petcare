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

const TIER_ORDER = ["Puppy Pal", "Kitty Champ", "Guardian Woof", "Legendary Lion"];
const tierRank = TIER_ORDER.reduce((acc, tier, idx) => ({ ...acc, [tier]: idx }), {});

const STATUS_META = {
  available: { label: "Ready to use", pill: "success", card: "active", order: 0 },
  blocked: { label: "Blocked", pill: "warn", card: "blocked", order: 1 },
  claimed: { label: "In your wallet", pill: "muted", card: "claimed", order: 2 },
  used: { label: "Used", pill: "muted", card: "claimed", order: 2 },
  exhausted: { label: "Fully claimed", pill: "muted", card: "claimed", order: 2 },
  expired: { label: "Expired", pill: "danger", card: "expired", order: 3 },
  revoked: { label: "Revoked", pill: "danger", card: "expired", order: 3 },
};

const getStatusMeta = (key) => STATUS_META[key] || STATUS_META.available;

const normalizeCouponState = (coupon) => {
  const derivedRaw = coupon?.derivedStatus || coupon?.status || "Available";
  const derived = String(derivedRaw).toLowerCase();
  const expiresAt = coupon?.expiryDate ? new Date(coupon.expiryDate) : null;
  const expired = coupon?.expired ?? (expiresAt ? expiresAt < new Date() : false);
  const meetsInvoiceRequirement = coupon?.meetsInvoiceRequirement;
  const blockedReason =
    coupon?.blockedReason || (meetsInvoiceRequirement === false ? "Invoice minimum not met" : null);
  let key = derived;
  if (derived === "available" && (blockedReason || coupon?.readyToUse === false)) {
    key = "blocked";
  }
  if (derived === "available" && coupon?.canApplyNow === false) {
    key = "blocked";
  }
  const meta = getStatusMeta(key);
  return {
    key,
    meta,
    expired,
    blockedReason,
    derivedRaw,
  };
};

const getGlobalCouponState = (coupon, walletCoupons, userTier) => {
  const expired = new Date(coupon.expiryDate) < new Date();
  const exhausted = coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit;
  const alreadyClaimed = walletCoupons.some((c) => (c.parentTemplateId || c.parentId) === coupon._id);
  const requiredTier = coupon.minTier || "Puppy Pal";
  const userRank = tierRank[userTier || "Puppy Pal"] ?? 0;
  const requiredRank = tierRank[requiredTier] ?? 0;
  let key = "available";
  let blockedReason = null;
  if (expired) {
    key = "expired";
  } else if (exhausted) {
    key = "exhausted";
    blockedReason = "All claimed";
  } else if (userRank < requiredRank) {
    key = "blocked";
    blockedReason = `Unlocks at ${requiredTier}`;
  } else if (alreadyClaimed) {
    key = "claimed";
  }
  return {
    key,
    meta: getStatusMeta(key),
    expired,
    exhausted,
    alreadyClaimed,
    blockedReason,
  };
};

const couponOrder = (c, now, state) => {
  const metaOrder = state.meta.order ?? 9;
  const expiresAt = c.expiryDate ? new Date(c.expiryDate) : null;
  const expiryTime = expiresAt ? expiresAt.getTime() : Infinity;
  return metaOrder * 1e13 + (expiryTime || Infinity) - now.getTime();
};

const sortCoupons = (list, stateGetter = normalizeCouponState) => {
  const now = new Date();
  return [...list].sort((a, b) => {
    const stateA = stateGetter(a);
    const stateB = stateGetter(b);
    const orderA = couponOrder(a, now, stateA);
    const orderB = couponOrder(b, now, stateB);
    if (orderA !== orderB) return orderA - orderB;
    const dateA = new Date(a.createdAt || a.expiryDate || 0);
    const dateB = new Date(b.createdAt || b.expiryDate || 0);
    return dateB - dateA;
  });
};

export default function PromotionTab() {
  const { user: authUser, loading: authLoading, error: authError } = useAuthUser();
  const ownerId = authUser?._id;

  const [loyalty, setLoyalty] = useState(null);
  const [myCoupons, setMyCoupons] = useState([]);
  const [globalCoupons, setGlobalCoupons] = useState([]);
  const [showGuide, setShowGuide] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTreasureHint, setShowTreasureHint] = useState(false);

  useBodyScrollLock(showGuide);

  // 👇 Debounced claim handler
  const handleClaim = useDebounceAction(async (tpl) => {
    try {
      const optimisticCoupon = {
        ...tpl,
        status: "Available",
        code: tpl.code + "-TEMP",
        _id: "temp-" + Date.now(),
        parentTemplateId: tpl._id,
        derivedStatus: "Available",
        readyToUse: true,
        canApplyNow: true,
        blockedReason: null,
        createdAt: new Date().toISOString(),
      };
      setMyCoupons(prev => [...prev, optimisticCoupon]);

      const res = await api.post("/coupon/claim", { userID: ownerId, templateId: tpl._id });
      
      toast.success(res.alreadyClaimed ? "Already in your wallet 💼" : "Coupon claimed! 🎉");

      const uRes = await api.get(`/coupon/user-available?userId=${ownerId}&mode=wallet`);
      setMyCoupons(uRes.coupons || []);
    } catch (err) {
      toast.error(err.message || "Failed to claim coupon");
      setMyCoupons(prev => prev.filter(c => !c._id?.startsWith("temp-")));
    }
  });

  const userTier = loyalty?.tier || "Puppy Pal";
  const userRank = tierRank[userTier] ?? 0;

  const sortedMyCoupons = sortCoupons(myCoupons);
  const sortedGlobalCoupons = sortCoupons(globalCoupons, (coupon) => getGlobalCouponState(coupon, myCoupons, userTier));

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
        const uRes = await api.get(`/coupon/user-available?userId=${ownerId}&mode=wallet`);
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
      <Toaster position="top-right" containerStyle={{ top: 96 }} />

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
        <p className="muted">Track loyalty points, claim clinic offers, and see what’s already in your wallet.</p>
      </div>

      <section className="pawperks-info">
        <div className="pawperks-info-card" role="note">
          <h3>How PawPerks works</h3>
          <ul>
            <li><strong>Earn</strong> 1 point for every Rs.500 spent on completed invoices.</li>
            <li><strong>Unlock</strong> higher tiers for bonus rewards and early access to coupons.</li>
            <li><strong>Claim</strong> clinic-wide offers below; they’ll move into your wallet immediately.</li>
            <li><strong>Redeem</strong> coupons at checkout. Minimum spend and expiry are listed on each card.</li>
          </ul>
        </div>
        <aside className="pawperks-info-card pawperks-info-card--tips">
          <h4>Tips</h4>
          <ul>
            <li>Coupons that appear blocked usually need a higher invoice total or may already be in your wallet.</li>
            <li className={`pawperks-scratch ${showTreasureHint ? "pawperks-scratch--revealed" : ""}`}>
              {showTreasureHint ? (
                <span className="pawperks-scratch-text">Click the paw icon to open the PawPerks treasure map.</span>
              ) : (
                <span
                  role="button"
                  tabIndex={0}
                  className="pawperks-scratch-teaser"
                  onClick={() => setShowTreasureHint(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setShowTreasureHint(true);
                  }}
                >
                  psst… a hidden clue glows softly here
                </span>
              )}
            </li>
          </ul>
        </aside>
      </section>

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
        <h3>My Wallet</h3>
        <p className="pawperks-section-subtext">
          Claimed coupons appear here. They can be applied during checkout on both online and offline payments.
        </p>
        {loading && myCoupons.length === 0 ? (
          <div className="coupon-grid">
            {[...Array(3)].map((_, idx) => (
              <div className="coupon-card skeleton" key={idx}>
                <div className="pawperks-status-row">
                  <span className="pawperks-status-pill pawperks-status-pill--muted">Loading…</span>
                </div>
                <div className="pawperks-card-top">
                  <div className="code skeleton-text"></div>
                  <div className="discount skeleton-text"></div>
                </div>
                <div className="pawperks-card-divider" aria-hidden="true"></div>
                <div className="pawperks-card-meta">
                  <span className="meta-item">
                    <span className="meta-label">Min Spend</span>
                    <span className="meta-value skeleton-text"></span>
                  </span>
                  <span className="meta-item">
                    <span className="meta-label">Expires</span>
                    <span className="meta-value skeleton-text"></span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="coupon-grid">
            {sortedMyCoupons.map((c) => {
              const state = normalizeCouponState(c);
              return (
                <div
                  className={`coupon-card ${state.meta.card}`}
                  key={c._id || c.couponId}
                  tabIndex={0}
                  aria-label={`Coupon ${c.code}, ${state.meta.label}, expires ${fmtDate(c.expiryDate)}`}
                >
                  <div className="pawperks-status-row">
                    <span className={`pawperks-status-pill pawperks-status-pill--${state.meta.pill}`}>
                      {state.meta.label}
                    </span>
                    {state.blockedReason && state.blockedReason !== state.meta.label && (
                      <span className="pawperks-status-pill pawperks-status-pill--muted">
                        {state.blockedReason}
                      </span>
                    )}
                  </div>
                  <div className="pawperks-card-top">
                    <div className="code">{c.code}</div>
                    <div className="discount">
                      {c.discountType === "Percentage"
                        ? `${c.discountValue}% OFF`
                        : `${fmtLKR(c.discountValue)} OFF`}
                    </div>
                  </div>
                  <div className="pawperks-tier-row">
                    <span className="pawperks-tier-badge">Requires {c.minTier || "Puppy Pal"}</span>
                    {userRank < (tierRank[c.minTier || "Puppy Pal"] ?? 0) && (
                      <span className="pawperks-tier-note">You’re currently {userTier}</span>
                    )}
                  </div>
                  <div className="pawperks-card-divider" aria-hidden="true"></div>
                  <div className="pawperks-card-meta">
                    <span className="meta-item">
                      <span className="meta-label">Min Spend</span>
                      <span className="meta-value">{fmtLKR(c.minInvoiceAmount)}</span>
                    </span>
                    <span className="meta-item">
                      <span className="meta-label">Expires</span>
                      <span className="meta-value">{fmtDate(c.expiryDate)}</span>
                    </span>
                  </div>
                  {c.description && (
                    <div className="pawperks-card-description">{c.description}</div>
                  )}
                  <div className="pawperks-card-foot">
                    {state.key === "used" && c.usedAt && (
                      <span className="pawperks-card-note">Used on {fmtDate(c.usedAt)}</span>
                    )}
                    {state.key === "expired" && (
                      <span className="pawperks-card-note">Expired on {fmtDate(c.expiryDate)}</span>
                    )}
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
              const state = getGlobalCouponState(c, myCoupons, userTier);
              const disabled = state.key !== "available";
              const slotsLeft = c.usageLimit > 0 ? Math.max(c.usageLimit - c.usedCount, 0) : null;
              return (
                <div
                  className={`coupon-card ${state.meta.card}`}
                  key={c._id}
                  tabIndex={0}
                >
                  <div className="pawperks-status-row">
                    <span className={`pawperks-status-pill pawperks-status-pill--${state.meta.pill}`}>
                      {state.meta.label}
                    </span>
                    {state.blockedReason && state.blockedReason !== state.meta.label && (
                      <span className="pawperks-status-pill pawperks-status-pill--muted">
                        {state.blockedReason}
                      </span>
                    )}
                  </div>
                  <div className="pawperks-card-top">
                    <div className="code">{c.code}</div>
                    <div className="discount">
                      {c.discountType === "Percentage"
                        ? `${c.discountValue}% OFF`
                        : `${fmtLKR(c.discountValue)} OFF`}
                    </div>
                  </div>
                  <div className="pawperks-card-divider" aria-hidden="true"></div>
                  <div className="pawperks-card-meta">
                    <span className="meta-item">
                      <span className="meta-label">Min Spend</span>
                      <span className="meta-value">{fmtLKR(c.minInvoiceAmount)}</span>
                    </span>
                    <span className="meta-item">
                      <span className="meta-label">Expires</span>
                      <span className="meta-value">{fmtDate(c.expiryDate)}</span>
                    </span>
                    {slotsLeft != null && (
                      <span className="meta-item">
                        <span className="meta-label">Claims Left</span>
                        <span className="meta-value">{slotsLeft}</span>
                      </span>
                    )}
                  </div>
                  <div className="pawperks-card-foot">
                    {slotsLeft != null && (
                      <span className="pawperks-card-note">{slotsLeft} of {c.usageLimit} left</span>
                    )}
                    {state.key === "exhausted" && (
                      <span className="pawperks-card-note">Claimed {c.usedCount} times</span>
                    )}
                  </div>
                  <button
                    className="btn secondary"
                    disabled={disabled}
                    onClick={() => handleClaim(c)}
                    aria-label={disabled ? "Coupon not available" : `Claim coupon ${c.code}`}
                  >
                    {state.key === "available"
                      ? "Claim"
                      : state.key === "claimed"
                        ? "In Wallet"
                        : state.key === "blocked"
                          ? state.blockedReason || "Locked"
                        : state.key === "exhausted"
                          ? "Fully Claimed"
                          : "Expired"}
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