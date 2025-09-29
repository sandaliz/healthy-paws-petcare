// utils/financeFormatters.js
export function toNum(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }

export function fmtLKR(n) {
  try {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(Number(n) || 0);
  } catch { return `LKR ${Number(n || 0).toFixed(2)}`; }
}

export function fmtDate(d) {
  if (!d) return '-';
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return String(d); }
}