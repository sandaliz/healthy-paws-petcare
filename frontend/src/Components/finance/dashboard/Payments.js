// import React, { useEffect, useMemo, useState } from 'react';
// import { Toaster, toast } from 'react-hot-toast';
// import { api } from '../services/financeApi';
// import Modal from './components/Modal';
// import Tag from './components/Tag';
// import Skeleton from './components/Skeleton';
// import {
//   Search, RefreshCcw, CheckCircle2, Eye, Copy, ChevronLeft, ChevronRight, ExternalLink
// } from 'lucide-react';
// import '../css/dashboard.css';
// import { fmtDate, fmtLKR } from '../utils/financeFormatters'

// const METHOD_OPTIONS = ['All', 'Cash', 'Card', 'BankTransfer', 'Stripe'];
// const STATUS_OPTIONS = ['All', 'Pending', 'Completed', 'Failed', 'Refunded'];

// export default function Payments() {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [search, setSearch] = useState('');
//   const [method, setMethod] = useState('All');
//   const [status, setStatus] = useState('All');
//   const [excludeFailed, setExcludeFailed] = useState(true);
//   const [page, setPage] = useState(1);
//   const PAGE_SIZE = 10;

//   const [view, setView] = useState(null);
//   const [invoiceView, setInvoiceView] = useState(null);
//   const [confirmPay, setConfirmPay] = useState(null);
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { api } from '../services/financeApi';
import Modal from './components/Modal';
import Tag from './components/Tag';
import Skeleton from './components/Skeleton';
import { Search, RefreshCcw, CheckCircle2, Eye, Copy, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import '../css/dashboard/payments.css';
import { fmtDate, fmtLKR } from '../utils/financeFormatters';

//   const load = async () => {
//     try {
//       setLoading(true);
//       const params = excludeFailed ? '?excludeFailed=1' : '';
//       const data = await api.get(`/payments${params}`);
//       setPayments(data.payments || []);
//     } catch {
//       toast.error('Failed to load payments');
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => { load(); }, [excludeFailed]);

//   const filtered = useMemo(() => {
//     let arr = payments || [];
//     if (method !== 'All') arr = arr.filter(p => (p.method || '') === method);
//     if (status !== 'All') arr = arr.filter(p => (p.status || '') === status);
//     if (search.trim()) {
//       const q = search.toLowerCase();
//       arr = arr.filter(p => {
//         const pid = (p.paymentID || '').toLowerCase();
//         const inv = (p.invoiceID?.invoiceID || '').toLowerCase();
//         const owner = (p.userID?.name || p.invoiceID?.userID?.name || '').toLowerCase();
//         const email = (p.userID?.email || p.invoiceID?.userID?.email || '').toLowerCase();
//         return pid.includes(q) || inv.includes(q) || owner.includes(q) || email.includes(q);
//       });
//     }
//     return arr.sort((a, b) => {
//       const aNeedConfirm = a.status === 'Pending' && a.method !== 'Stripe';
//       const bNeedConfirm = b.status === 'Pending' && b.method !== 'Stripe';
//       if (aNeedConfirm && !bNeedConfirm) return -1;
//       if (bNeedConfirm && !aNeedConfirm) return 1;
//       return new Date(b.createdAt) - new Date(a.createdAt);
//     });
//   }, [payments, method, status, search]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
//   const pageItems = useMemo(() =>
//     filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

//   const confirmOffline = async (p) => {
//     try {
//       await api.put(`/payment/offline/confirm/${p._id}`);
//       toast.success('Offline payment confirmed');
//       setConfirmPay(null);
//       load();
//     } catch (e) {
//       toast.error(e?.response?.data?.message || 'Confirm failed');
//     }
//   };

//   const copyInvoiceLink = async (invId) => {
//     const url = `${window.location.origin}/pay/online?invoice=${invId}`;
//     try {
//       await navigator.clipboard.writeText(url);
//       toast.success('Payment link copied');
//     } catch {
//       toast.error('Copy failed');
//     }
//   };

//   const viewInvoice = async (invoiceRef) => {
//     try {
//       const id = typeof invoiceRef === 'string' ? invoiceRef : invoiceRef?._id;
//       const res = await api.get(`/invoice/${id}`);
//       const invoice = res.data?.invoice || res.invoice || res;
//       if (!invoice) throw new Error("No invoice returned");
//       setInvoiceView(invoice);
//     } catch (e) {
//       toast.error('Failed to load invoice details');
//     }
//   };

//   return (
//     <div>
//       <Toaster position="top-right" />
//       <div className="page-head">
//         <h2>Payments</h2>
//         <div className="row">
//           <button className="fm-btn" onClick={load}><RefreshCcw size={16} /> Refresh</button>
//         </div>
//       </div>

//       <div className="pm-filters">
//         <div className="filters-left">
//           <div className="pm-search">
//             <Search size={16} />
//             <input
//               className="pm-search-input"
//               placeholder="Search by payment, invoice, name, email"
//               value={search}
//               onChange={(e) => { setSearch(e.target.value); setPage(1); }}
//             />
//           </div>
//           <div className="pm-filter">
//             <label>Method:</label>
//             <select value={method} onChange={e => { setMethod(e.target.value); setPage(1); }}>
//               {METHOD_OPTIONS.map(m => <option key={m}>{m}</option>)}
//             </select>
//           </div>
//           <div className="pm-filter">
//             <label>Status:</label>
//             <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
//               {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
//             </select>
//           </div>
//         </div>

//         <div className="exclude-toggle">
//           <span>Exclude failed</span>
//           <div className={`toggle-radio ${excludeFailed ? 'on' : 'off'}`}
//             onClick={() => { setExcludeFailed(!excludeFailed); setPage(1); }}>
//             <div className="circle"></div>
//           </div>
//         </div>
//       </div>

//       <div className="fm-card">
//         {loading ? <Skeleton rows={8} /> : (
//           <>
//             <table className="fm-table">
//               <thead>
//                 <tr>
//                   <th>Invoice</th>
//                   <th>Owner</th>
//                   <th>Method</th>
//                   <th>Amount</th>
//                   <th>Status</th>
//                   <th className="right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {pageItems.length === 0 && (
//                   <tr><td colSpan={6} className="muted">No payments found</td></tr>
//                 )}
//                 {pageItems.map(p => (
//                   <tr key={p._id}>
//                     <td className="mono">{p.invoiceID?.invoiceID || '-'}</td>
//                     <td>
//                       <div className="owner">
//                         <div className="name">{p.userID?.name || p.invoiceID?.userID?.name || '-'}</div>
//                         <div className="email">{p.userID?.email || p.invoiceID?.userID?.email || '-'}</div>
//                       </div>
//                     </td>
//                     <td><MethodPill method={p.method} /></td>
//                     <td className="mono">{fmtLKR(p.amount)}</td>
//                     <td><Tag status={p.status} /></td>
//                     <td className="right">
//                       <div className="pm-actions">
//                         <button className="fm-btn fm-btn-ghost" onClick={() => setView(p)}><Eye size={16} /></button>
//                         <button className="fm-btn fm-btn-ghost" onClick={() => copyInvoiceLink(p.invoiceID?._id)}><Copy size={16} /></button>
//                         {p.status === 'Pending' && p.method !== 'Stripe' && (
//                           <button
//                             className="billing-confirm-btn"
//                             onClick={() => setConfirmPay(p)}
//                           >
//                             <CheckCircle2 size={16} /> Confirm
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             <div className="fm-pagination">
//               <button className="fm-btn fm-btn-ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
//                 <ChevronLeft size={16} /> Prev</button>
//               <div>Page {page} of {totalPages}</div>
//               <button className="fm-btn fm-btn-ghost" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
//                 Next <ChevronRight size={16} /></button>
//             </div>
//           </>
//         )}
//       </div>

//       {view && (
//         <PaymentModal
//           p={view}
//           onClose={() => setView(null)}
//           onViewInvoice={viewInvoice}
//         />
//       )}

//       {invoiceView && (
//         <InvoiceModal
//           open
//           onClose={() => setInvoiceView(null)}
//           invoice={invoiceView}
//         />
//       )}

//       {confirmPay && <ConfirmModal onClose={() => setConfirmPay(null)} onConfirm={() => confirmOffline(confirmPay)} />}
//     </div>
//   )
// }

// function PaymentModal({ p, onClose, onViewInvoice }) {
//   return (
//     <Modal open onClose={onClose} title={`Payment ${p.paymentID}`}>
//       <div className="summary vlist">
//         <div className="kv"><span>Owner</span><b>{p.userID?.name}</b></div>
//         <div className="kv"><span>Email</span><b>{p.userID?.email}</b></div>
//         <div className="kv"><span>Method</span><b><MethodPill method={p.method} /></b></div>
//         <div className="kv"><span>Status</span><b><Tag status={p.status} /></b></div>
//         <div className="kv"><span>Amount</span><b>{fmtLKR(p.amount)}</b></div>
//         <div className="kv"><span>Invoice</span><b>{p.invoiceID?.invoiceID}</b></div>
//       </div>
//       <div className="pm-actions">
//         <button className="fm-btn" onClick={() => onViewInvoice(p.invoiceID)}>
//           <ExternalLink size={16} /> View Invoice
//         </button>
//         <button className="fm-btn fm-btn-ghost" onClick={onClose}>Close</button>
//       </div>
//     </Modal>
//   )
// }

// function InvoiceModal({ open, onClose, invoice }) {
//   const subtotal = Number(invoice.subtotal || 0);
//   const tax = Number(invoice.tax || 0);
//   const total = Number(invoice.total || 0);

//   return (
//     <Modal open={open} onClose={onClose} title={`Invoice ${invoice.invoiceID || invoice._id}`}>
//       <div className="summary vlist">
//         <div className="kv"><span>Owner</span><b>{invoice.userID?.name || '-'}</b></div>
//         <div className="kv"><span>Email</span><b>{invoice.userID?.email || '-'}</b></div>
//         <div className="kv"><span>Status</span><b><Tag status={invoice.status} /></b></div>
//         <div className="kv"><span>Due</span><b>{fmtDate(invoice.dueDate)}</b></div>
//       </div>

//       <div className="items-card inv-items-card">
//         <div className="items-header">Items</div>
//         <ul className="items-list">
//           {(invoice.lineItems || []).map((li, i) => (
//             <li className="item-row" key={i}>
//               <div className="item-title">{li.description}</div>
//               <div className="item-meta">{li.quantity} × {fmtLKR(li.unitPrice)}</div>
//               <div className="item-amount">{fmtLKR(li.total)}</div>
//             </li>
//           ))}
//         </ul>

//         <div className="totals-right">
//           <table className="totals-table">
//             <tbody>
//               <tr><td>Subtotal</td><td className="num">{fmtLKR(subtotal)}</td></tr>
//               <tr><td>Tax</td><td className="num">{fmtLKR(tax)}</td></tr>
//               <tr className="em"><td>Total</td><td className="num">{fmtLKR(total)}</td></tr>
//             </tbody>
//           </table>
//         </div>
//       </div>

//       <div className="pm-actions">
//         <button className="fm-btn fm-btn-primary" onClick={() => {
//           const url = `${window.location.origin}/pay/online?invoice=${invoice._id}`;
//           navigator.clipboard.writeText(url).then(() => toast.success('Client payment link copied'));
//         }}><Copy size={16} /> Copy client link</button>
//         <button className="fm-btn fm-btn-ghost" onClick={onClose}>Close</button>
//       </div>
//     </Modal>
//   );
// }

// function ConfirmModal({ onClose, onConfirm }) {
//   return (
//     <Modal open onClose={onClose} title="Confirm offline payment">
//       <div>Mark this payment as Completed?</div>
//       <div className="pm-actions">
//         <button className="fm-btn fm-btn-ghost" onClick={onClose}>Cancel</button>
//         <button className="billing-confirm-btn" onClick={onConfirm}>Confirm</button>
//       </div>
//     </Modal>
//   )
// }

// function MethodPill({ method }) {
//   const m = (method || '').toLowerCase()
//   let cls = 'method-pill'
//   if (m === 'cash') cls += ' cash'
//   if (m === 'card') cls += ' card'
//   if (m === 'banktransfer') cls += ' bank'
//   if (m === 'stripe') cls += ' stripe'
//   return <span className={cls}>{method}</span>
// }

// removed duplicate import block

const METHOD_OPTIONS = ['All', 'Cash', 'Card', 'BankTransfer', 'Stripe'];
const STATUS_OPTIONS = ['All', 'Pending', 'Completed', 'Failed', 'Refunded'];

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('All');
  const [status, setStatus] = useState('All');
  const [excludeFailed, setExcludeFailed] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [view, setView] = useState(null);
  const [invoiceView, setInvoiceView] = useState(null);
  const [confirmPay, setConfirmPay] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = excludeFailed ? '?excludeFailed=1' : '';
      const data = await api.get(`/payments${params}`);
      setPayments(data.payments || []);
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [excludeFailed]);

  useEffect(() => { load(); }, [load]);

  const kpi = useMemo(() => {
    const now = new Date();
    let pending = 0, completed = 0, revenue7d = 0;
    const dayMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      dayMap[d.toISOString().slice(0, 10)] = 0;
    }
    (payments || []).forEach(p => {
      if (p.status === 'Pending') pending++;
      if (p.status === 'Completed') {
        completed++;
        const created = (p.createdAt || '').slice(0, 10);
        if (created in dayMap) {
          const amt = Number(p.amount || 0);
          dayMap[created] += amt;
          revenue7d += amt;
        }
      }
    });
    const series = Object.entries(dayMap).map(([date, v]) => ({ date, v }));
    return { pending, completed, revenue7d, series };
  }, [payments]);

  const filtered = useMemo(() => {
    let arr = payments || [];
    if (method !== 'All') arr = arr.filter(p => (p.method || '') === method);
    if (status !== 'All') arr = arr.filter(p => (p.status || '') === status);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(p => {
        const pid = (p.paymentID || '').toLowerCase();
        const inv = (p.invoiceID?.invoiceID || '').toLowerCase();
        const owner = (p.userID?.name || p.invoiceID?.userID?.name || '').toLowerCase();
        const email = (p.userID?.email || p.invoiceID?.userID?.email || '').toLowerCase();
        return pid.includes(q) || inv.includes(q) || owner.includes(q) || email.includes(q);
      });
    }
    return arr.sort((a, b) => {
      const aNeedConfirm = a.status === 'Pending' && a.method !== 'Stripe';
      const bNeedConfirm = b.status === 'Pending' && b.method !== 'Stripe';
      if (aNeedConfirm && !bNeedConfirm) return -1;
      if (bNeedConfirm && !aNeedConfirm) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [payments, method, status, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const confirmOffline = async (p) => {
    try {
      await api.put(`/payment/offline/confirm/${p._id}`);
      toast.success('Offline payment confirmed');
      setConfirmPay(null);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Confirm failed');
    }
  };

  const copyInvoiceLink = async (invId) => {
    const url = `${window.location.origin}/pay/online?invoice=${invId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Payment link copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  const viewInvoice = async (invoiceRef) => {
    try {
      const id = typeof invoiceRef === 'string' ? invoiceRef : invoiceRef?._id;
      const res = await api.get(`/invoice/${id}`);
      const invoice = res.data?.invoice || res.invoice || res;
      if (!invoice) throw new Error('No invoice returned');
      setInvoiceView(invoice);
    } catch {
      toast.error('Failed to load invoice details');
    }
  };

  return (
    <div className="bf-payments-page">
      <Toaster position="top-right" />

      <div className="bf-payments-head">
        <div className="bf-payments-row">
          <button className="fm-btn" onClick={load}>
            <RefreshCcw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="bf-payments-filters">
        <div className="bf-payments-filters-left">
          <div className="bf-payments-search">
            <Search size={16} />
            <input
              className="bf-payments-search-input"
              placeholder="Search by payment, invoice, name, email"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="bf-payments-filter">
            <label>Method:</label>
            <select value={method} onChange={e => { setMethod(e.target.value); setPage(1); }}>
              {METHOD_OPTIONS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="bf-payments-filter">
            <label>Status:</label>
            <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="bf-payments-exclude">
          <span>Exclude failed</span>
          <div
            className={`bf-payments-toggle ${excludeFailed ? 'on' : 'off'}`}
            onClick={() => { setExcludeFailed(!excludeFailed); setPage(1); }}
          >
            <div className="circle"></div>
          </div>
        </div>
      </div>

      <div className="fm-kpis">
        <div className="fm-kpi">
          <div className="title">Pending</div>
          <div className="value">{kpi.pending}</div>
        </div>
        <div className="fm-kpi">
          <div className="title">Completed</div>
          <div className="value">{kpi.completed}</div>
        </div>
        <div className="fm-kpi">
          <div className="title">Revenue (7d)</div>
          <div className="value">{fmtLKR(kpi.revenue7d)}</div>
          <div className="spark">
            <ResponsiveContainer width="100%" height={40}>
              <AreaChart data={kpi.series} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Area type="monotone" dataKey="v" stroke="#54413C" fill="#FFEBC6" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bf-payments-card">
        {loading ? <Skeleton rows={8} /> : (
          <>
            <table className="fm-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Owner</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 && (
                  <tr><td colSpan={6} className="muted">No payments found</td></tr>
                )}
                {pageItems.map(p => (
                  <tr key={p._id}>
                    <td className="mono">{p.invoiceID?.invoiceID || '-'}</td>
                    <td>
                      <div>
                        <div className="bf-payments-owner-name">{p.userID?.name || p.invoiceID?.userID?.name || '-'}</div>
                        <div className="bf-payments-owner-email">{p.userID?.email || p.invoiceID?.userID?.email || '-'}</div>
                      </div>
                    </td>
                    <td><MethodPill method={p.method} /></td>
                    <td className="mono">{fmtLKR(p.amount)}</td>
                    <td><Tag status={p.status} /></td>
                    <td className="right">
                      <div className="bf-payments-actions">
                        <button className="fm-btn fm-btn-ghost" onClick={() => setView(p)}><Eye size={16} /></button>
                        <button className="fm-btn fm-btn-ghost" onClick={() => copyInvoiceLink(p.invoiceID?._id)}><Copy size={16} /></button>
                        {p.status === 'Pending' && p.method !== 'Stripe' && (
                          <button
                            className="fm-btn fm-btn-success"
                            onClick={() => setConfirmPay(p)}
                          >
                            <CheckCircle2 size={16} /> Confirm
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bf-payments-pagination">
              <button
                className="fm-btn fm-btn-ghost"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <div>Page {page} of {totalPages}</div>
              <button
                className="fm-btn fm-btn-ghost"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      {view && (
        <PaymentModal
          p={view}
          onClose={() => setView(null)}
          onViewInvoice={viewInvoice}
        />
      )}

      {invoiceView && (
        <InvoiceModal
          open
          onClose={() => setInvoiceView(null)}
          invoice={invoiceView}
        />
      )}

      {confirmPay && (
        <ConfirmModal
          onClose={() => setConfirmPay(null)}
          onConfirm={() => confirmOffline(confirmPay)}
        />
      )}
    </div>
  );
}

/* ===== MODALS ===== */

function PaymentModal({ p, onClose, onViewInvoice }) {
  return (
    <Modal open onClose={onClose} title={`Payment ${p.paymentID}`}>
      <div className="bf-payments-summary">
        <div className="bf-payments-kv"><span>Owner</span><b>{p.userID?.name}</b></div>
        <div className="bf-payments-kv"><span>Email</span><b>{p.userID?.email}</b></div>
        <div className="bf-payments-kv"><span>Method</span><b><MethodPill method={p.method} /></b></div>
        <div className="bf-payments-kv"><span>Status</span><b><Tag status={p.status} /></b></div>
        <div className="bf-payments-kv"><span>Amount</span><b>{fmtLKR(p.amount)}</b></div>
        <div className="bf-payments-kv"><span>Invoice</span><b>{p.invoiceID?.invoiceID}</b></div>
      </div>

      <div className="bf-payments-actions">
        <button className="fm-btn fm-btn-primary" onClick={() => onViewInvoice(p.invoiceID)}>
          <ExternalLink size={16} /> View Invoice
        </button>
        <button className="fm-btn fm-btn-ghost" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

function InvoiceModal({ open, onClose, invoice }) {
  const subtotal = Number(invoice.subtotal || 0);
  const tax = Number(invoice.tax || 0);
  const total = Number(invoice.total || 0);

  return (
    <Modal open={open} onClose={onClose} title={`Invoice ${invoice.invoiceID || invoice._id}`}>
      <div className="bf-payments-summary">
        <div className="bf-payments-kv"><span>Owner</span><b>{invoice.userID?.name || '-'}</b></div>
        <div className="bf-payments-kv"><span>Email</span><b>{invoice.userID?.email || '-'}</b></div>
        <div className="bf-payments-kv"><span>Status</span><b><Tag status={invoice.status} /></b></div>
        <div className="bf-payments-kv"><span>Due</span><b>{fmtDate(invoice.dueDate)}</b></div>
      </div>

      <div className="bf-payments-items-card">
        <div className="bf-payments-items-header">Items</div>
        <ul className="bf-payments-items-list">
          {(invoice.lineItems || []).map((li, i) => (
            <li className="bf-payments-item-row" key={i}>
              <div className="bf-payments-item-title">{li.description}</div>
              <div className="bf-payments-item-meta">{li.quantity} × {fmtLKR(li.unitPrice)}</div>
              <div className="bf-payments-item-amount">{fmtLKR(li.total)}</div>
            </li>
          ))}
        </ul>

        <div className="bf-payments-totals">
          <table className="bf-payments-totals-table">
            <tbody>
              <tr><td>Subtotal</td><td className="bf-payments-totals-num">{fmtLKR(subtotal)}</td></tr>
              <tr><td>Tax</td><td className="bf-payments-totals-num">{fmtLKR(tax)}</td></tr>
              <tr className="bf-payments-totals-em"><td>Total</td><td className="bf-payments-totals-num">{fmtLKR(total)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bf-payments-actions">
        <button
          className="fm-btn fm-btn-primary"
          onClick={() => {
            const url = `${window.location.origin}/pay/online?invoice=${invoice._id}`;
            navigator.clipboard.writeText(url).then(() => toast.success('Client payment link copied'));
          }}
        >
          <Copy size={16} /> Copy client link
        </button>
        <button className="fm-btn fm-btn-ghost" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

function ConfirmModal({ onClose, onConfirm }) {
  const [busy, setBusy] = useState(false);
  const handleConfirm = async () => {
    try {
      setBusy(true);
      const ret = onConfirm?.();
      if (ret && typeof ret.then === 'function') await ret;
      onClose?.();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open onClose={onClose} title="Confirm offline payment">
      <div>Mark this payment as Completed?</div>
      <div className="bf-payments-actions">
        <button className="fm-btn fm-btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="fm-btn fm-btn-success" onClick={handleConfirm} disabled={busy}>{busy ? 'Confirming…' : 'Confirm'}</button>
      </div>
    </Modal>
  );
}

/* ===== Utility component ===== */
function MethodPill({ method }) {
  const m = (method || '').toLowerCase();
  let cls = 'bf-payments-method-pill';
  if (m === 'cash') cls += ' cash';
  if (m === 'card') cls += ' card';
  if (m === 'banktransfer') cls += ' bank';
  if (m === 'stripe') cls += ' stripe';
  return <span className={cls}>{method}</span>;
}