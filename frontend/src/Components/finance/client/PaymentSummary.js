import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { api } from '../services/financeApi';
import useAuthUser from '../hooks/useAuthUser';
import Modal from '../dashboard/components/Modal';
import Navbar from '../../Home/Navbar'
import '../css/clientPay.css';
import { fmtLKR, fmtDate, fmtDateTime } from '../utils/financeFormatters';

import {
  PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, Tooltip
} from 'recharts';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

const REFUND_WINDOW_DAYS = 7;
const PALETTE = {
  Stripe: "#3b82f6",
  Cash: "#22c55e",
  BankTransfer: "#f97316"
};

function deriveInvoiceTotals(inv, paymentRecords = [], fallbackDiscount = null) {
  if (!inv) return {
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    source: 'invoice'
  };

  const baseSubtotal = inv.subtotal ?? null;
  const baseTax = inv.tax ?? null;
  const baseDiscount = inv.discountAmount ?? inv.discount ?? null;
  const baseTotal = inv.total ?? null;

  if (baseSubtotal != null && baseTax != null && baseTotal != null) {
    return {
      subtotal: Number(baseSubtotal) || 0,
      tax: Number(baseTax) || 0,
      discount: Number(baseDiscount) || 0,
      total: Number(baseTotal) || 0,
      source: 'invoice'
    };
  }

  const matchedPayment = paymentRecords.find(p => {
    const pid = p.invoiceID;
    if (!pid) return false;
    return String(pid._id || pid) === String(inv._id || inv.invoiceID);
  });

  const paymentAmount = matchedPayment?.amount != null ? Number(matchedPayment.amount) : null;
  const paymentDiscount = matchedPayment?.discount != null ? Number(matchedPayment.discount) : null;
  const discountToUse = paymentDiscount ?? fallbackDiscount ?? 0;
  const subtotal = baseSubtotal != null
    ? Number(baseSubtotal)
    : paymentAmount != null
      ? Math.max(0, Number(paymentAmount) + Number(inv.tax || 0) + discountToUse)
      : (Number(inv.total) || 0);
  const tax = baseTax != null
    ? Number(baseTax)
    : Number(inv.tax || 0);
  const total = baseTotal != null
    ? Number(baseTotal)
    : paymentAmount != null
      ? Number(paymentAmount)
      : Math.max(0, subtotal - discountToUse + tax);

  return {
    subtotal,
    tax,
    discount: discountToUse,
    total,
    source: paymentAmount != null ? 'payment' : 'fallback'
  };
}

export default function PaymentSummary({ embedded = false }) {
  const [params] = useSearchParams();
  const newPaymentId = params.get('new') || '';
  const { user: authUser } = useAuthUser();
  const userId = authUser?._id;

  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);

  // MODAL states
  const [viewInvId, setViewInvId] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loadingInv, setLoadingInv] = useState(false);

  const [refundPayment, setRefundPayment] = useState(null);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const [refundView, setRefundView] = useState(null);

  // :: FETCH data
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const [pays, reqs] = await Promise.all([
          api.get(`/payments?userId=${userId}`),
          api.get(`/refunds?userId=${userId}`)
        ]);
        setPayments(pays?.payments || []);
        setRefunds((reqs?.requests || []).filter(r => r.userID?._id === userId));
      } catch (e) {
        toast.error(e.message || 'Failed to load your PawLedger');
      }
    })();
  }, [userId]);

  // refund mapping
  const refundByPayment = useMemo(() => {
    const m = {};
    for (const r of refunds) {
      const pid = r.paymentID?._id || r.paymentID;
      if (!pid) continue;
      const prev = m[pid];
      if (!prev || new Date(r.createdAt) > new Date(prev.createdAt)) m[pid] = r;
    }
    return m;
  }, [refunds]);

  const others = useMemo(
    () => payments.filter(p => p._id !== newPaymentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [payments, newPaymentId]
  );

  // KPI Stats
  const totalPaid = payments.filter(p => p.status === 'Completed')
    .reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const pendingCount = payments.filter(p => p.status === 'Pending').length;
  const refundedCount = payments.filter(p => p.status === 'Refunded').length;
  const refundRequests = refunds.length;

  // Charts Data
  const methodData = [
    { name: "Stripe", value: payments.filter(p => p.method === "Stripe").length },
    { name: "Cash", value: payments.filter(p => p.method === "Cash").length },
    { name: "BankTransfer", value: payments.filter(p => p.method === "BankTransfer").length }
  ];
  const paymentTrend = payments.map(p => ({
    date: fmtDate(p.createdAt),
    value: p.status === "Completed" ? p.amount : 0
  }));

  // --- Modal helpers
  const openInvoice = async (invoiceMongoId) => {
    try {
      setLoadingInv(true);
      setViewInvId(invoiceMongoId);
      const inv = await api.get(`/invoice/${invoiceMongoId}`);
      setInvoice(inv);
    } catch (e) {
      toast.error(e.message || 'Failed to load invoice');
    } finally {
      setLoadingInv(false);
    }
  };

  function isRefundable(p) {
    if (!p || p.status !== 'Completed') return false;
    const daysSince = (Date.now() - new Date(p.createdAt).getTime()) / 86400000;
    const left = Math.max(0, Number(p.amount) - Number(p.refundedAmount || 0));
    return daysSince <= REFUND_WINDOW_DAYS && left > 0;
  }

  const startRefund = (p) => {
    const left = Math.max(0, Number(p.amount) - Number(p.refundedAmount || 0));
    setRefundPayment(p);
    setRefundAmount(left);
    setRefundReason('');
  };

  const submitRefund = async () => {
    if (!refundPayment || !userId) return;
    if (!(refundAmount > 0)) return toast.error('Amount must be > 0');
    if (!refundReason.trim()) return toast.error('Please enter a reason');
    try {
      setSubmittingRefund(true);
      await api.post('/refund', {
        paymentID: refundPayment._id,
        userID: userId,
        amount: refundAmount,
        reason: refundReason.trim()
      });
      toast.success('Refund requested');
      setRefundPayment(null);
      // re-fetch state
      const [pays, reqs] = await Promise.all([
        api.get(`/payments?userId=${userId}`),
        api.get(`/refunds?userId=${userId}`)
      ]);
      setPayments(pays?.payments || []);
      setRefunds((reqs?.requests || []).filter(r => r.userID?._id === userId));
    } catch (e) {
      toast.error(e.message || 'Failed to submit refund');
    } finally {
      setSubmittingRefund(false);
    }
  };

  // :: PDF Export
  const handleGenerateReport = async () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Healthy Paws - Payment Report", 14, 20);

    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`User: ${authUser?.name || "Current User"} (${authUser?.email || ""})`, 14, 36);

    // Overview
    doc.setFontSize(13);
    doc.text("Overview:", 14, 50);
    doc.setFontSize(11);
    doc.text(`• Total Paid: ${fmtLKR(totalPaid)}`, 20, 58);
    doc.text(`• Pending: ${pendingCount}`, 20, 64);
    doc.text(`• Refunded: ${refundedCount}`, 20, 70);
    doc.text(`• Refund Requests: ${refundRequests}`, 20, 76);

    let yOffset = 90;

    // Chart screenshot
    const chartEl = document.getElementById("pdf-charts");
    if (chartEl) {
      const canvas = await html2canvas(chartEl, { backgroundColor: "#fff", scale: 2 });
      doc.addImage(canvas.toDataURL("image/png"), "PNG", 14, yOffset, 180, 80);
      yOffset += 95;
    }

    // Build rows with refund highlight
    const tableRows = payments.map(p => {
      const rr = refundByPayment[p._id];
      return {
        row: [
          fmtDateTime(p.createdAt),
          p.invoiceID?.invoiceID || "-",
          p.method,
          fmtLKR(p.amount),
          p.status,
          rr ? rr.status : "-"
        ],
        isPendingRefund: rr && rr.status === "Pending"
      };
    });

    autoTable(doc, {
      head: [["Date", "Invoice", "Method", "Amount", "Status", "Refund"]],
      body: tableRows.map(r => r.row),
      startY: yOffset,
      theme: "grid",
      headStyles: { fillColor: [247, 200, 91], textColor: 33 },
      didParseCell: function (data) {
        if (data.row.index >= 0) {
          const rowData = tableRows[data.row.index];
          if (rowData && rowData.isPendingRefund) {
            data.cell.styles.fillColor = [255, 246, 229]; // highlight in orange
          }
        }
      }
    });

    if (tableRows.some(r => r.isPendingRefund)) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        "Note: Highlighted rows have refund requests pending. Finance team will review and notify you.",
        14,
        doc.lastAutoTable.finalY + 7,
        { maxWidth: 180 }
      );
    }

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("System-generated by Healthy Paws", 14, doc.lastAutoTable.finalY + 15);
    doc.save("Payment_Report.pdf");
  };

  const scopeClasses = embedded ? "finance-scope finance-scope-embedded" : "finance-scope finance-nav-page ps-bg ps-full";
  const shellClasses = embedded ? "pawledger-shell pawledger-shell--embedded" : "pawledger-shell";
  const invoiceTotals = useMemo(
    () => deriveInvoiceTotals(invoice, payments),
    [invoice, payments]
  );
  const { subtotal: invSubtotal, tax: invTax, discount: invDiscount, total: invTotal } = invoiceTotals;

  return (
    <>
    <div className="finance-nav-shell">
      {!embedded && <Navbar />}
    <div className={scopeClasses}>
      <div className={shellClasses}>
        <Toaster position="top-right" />
        <div className="page-header">
          <div>
            <h1>Your Payment Ledger</h1>
            <p className="muted">Track your invoices, payments & refunds here.</p>
          </div>
          <div className="row">
            <button className="fm-btn fm-btn-primary" onClick={handleGenerateReport}>
              Export report PDF
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <h3>All Transactions</h3>
          <table className="pawledger-table">
            <thead>
              <tr><th>Date</th><th>Invoice</th><th>Method</th><th>Amount</th><th>Status</th><th>Refund</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {others.length === 0 && (
                <tr><td colSpan={7} className="muted">No payments yet</td></tr>
              )}
              {others.map(p => {
                const rr = refundByPayment[p._id];
                return (
                  <tr
                    key={p._id}
                    className={rr && rr.status === "Pending" ? "highlight-refund-row" : ""}
                  >
                    <td>{fmtDateTime(p.createdAt)}</td>
                    <td>{p.invoiceID?.invoiceID}</td>
                    <td>{p.method}</td>
                    <td>{fmtLKR(p.amount)}</td>
                    <td>
                      <StatusPill status={p.invoiceID?.status || p.status} />
                    </td>
                    <td>{rr ? rr.status : "—"}</td>
                    <td>
                      {p.invoiceID && (
                        <button
                          className="fm-btn fm-btn-ghost"
                          onClick={() => openInvoice(p.invoiceID?._id)}
                        >
                          Invoice
                        </button>
                      )}

                      {isRefundable(p) && !rr && (
                        <button
                          className="fm-btn fm-btn-secondary"
                          onClick={() => startRefund(p)}
                        >
                          Request Refund
                        </button>
                      )}

                      {/* 👇 NEW: allow user to open refundView modal if refund exists */}
                      {rr && (
                        <button
                          className="fm-btn fm-btn-refundview"
                          onClick={() => setRefundView(rr)}
                        >
                          View Refund
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {refunds.some(r => r.status === "Pending") && (
            <p className="muted" style={{ marginTop: "10px", fontSize: "0.85rem" }}>
              Note: Highlighted rows have <b>refund requests pending</b>. Finance team will review and notify you soon.
            </p>
          )}
        </div>

        {/* Invoice Modal */}
        <Modal open={!!viewInvId} onClose={() => { setViewInvId(null); setInvoice(null); }} title="Invoice">
          {loadingInv && <div className="muted">Loading invoice…</div>}
          {invoice && (
            <div className="invoice-box">
              <h3>Invoice #{invoice.invoiceID}</h3>
              <p><b>Status:</b> <StatusPill status={invoice.status} /></p>
              <p><b>Due Date:</b> {fmtDate(invoice.dueDate)}</p>
              <p><b>Owner:</b> {invoice.userID?.name} ({invoice.userID?.email})</p>
              <h4>Items</h4>
              <div className="invoice-items-head">
                <span>Description</span>
                <span>Qty</span>
                <span>Rate</span>
                <span>Total</span>
              </div>
              <ul>
                {(invoice.lineItems || []).map((li, i) => (
                  <li key={i}>
                    <span className="inv-desc">{li.description}</span>
                    <span className="inv-qty">{li.quantity}</span>
                    <span className="inv-rate">{fmtLKR(li.unitPrice)}</span>
                    <span className="inv-total">{fmtLKR(li.total)}</span>
                  </li>
                ))}
              </ul>
              <div className="invoice-summary-grid">
                <div>
                  <span>Subtotal</span>
                  <span>{fmtLKR(invSubtotal)}</span>
                </div>
                <div>
                  <span>Tax</span>
                  <span>{fmtLKR(invTax)}</span>
                </div>
                {invDiscount > 0 && (
                  <div className="discount-row">
                    <span>Discount</span>
                    <span>- {fmtLKR(invDiscount)}</span>
                  </div>
                )}
                <div className="grand-total">
                  <span>Total</span>
                  <span>{fmtLKR(invTotal)}</span>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Refund Request Modal */}
        <Modal open={!!refundPayment} onClose={() => setRefundPayment(null)} title="Request Refund">
          {refundPayment && (
            <>
              <div className="summary vlist">
                <div><b>Paid:</b> {fmtLKR(refundPayment.amount)}</div>
                <div><b>Refunded:</b> {fmtLKR(refundPayment.refundedAmount || 0)}</div>
              </div>
              <div className="field">
                <label>Amount</label>
                <input type="number" className="input" value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))} />
              </div>
              <div className="field">
                <label>Reason</label>
                <textarea className="input" value={refundReason} onChange={(e) => setRefundReason(e.target.value)} />
              </div>
              <div className="row end">
                <button className="fm-btn fm-btn-ghost" onClick={() => setRefundPayment(null)}>Cancel</button>
                <button className="fm-btn fm-btn-primary" onClick={submitRefund} disabled={submittingRefund}>
                  {submittingRefund ? 'Submitting…' : 'Submit'}
                </button>
              </div>
            </>
          )}
        </Modal>

        {/* Refund View Modal */}
        {/* Refund View Modal */}
        <Modal open={!!refundView} onClose={() => setRefundView(null)} title="Refund Request">
          {refundView && (
            <div className="summary vlist">
              <div>
                <b>Status:</b>{" "}
                <span className={`status-pill ${pillClass(refundView.status)}`}>
                  {refundView.status}
                </span>
              </div>
              <div><b>Amount:</b> {fmtLKR(refundView.amount)}</div>
              <div><b>Request Reason:</b> {refundView.reason}</div>

              {/* 👇 NEW: show rejection note only when rejected */}
              {refundView.status?.toLowerCase() === "rejected" && refundView.rejectionReason && (
                <div className="refund-reason-note">
                  <b>Rejection Note:</b>
                  <p style={{ marginTop: "4px" }}>{refundView.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Hidden Charts for PDF */}
        <div id="pdf-charts" style={{
          position: "fixed", top: "-9999px", left: "-9999px",
          width: "820px", height: "300px", background: "#fff", display: "flex", gap: "20px"
        }}>
          <div style={{ width: "400px", textAlign: "center" }}>
            <h4>Payment Method Breakdown</h4>
            <PieChart width={380} height={220}>
              <Pie data={methodData} dataKey="value" nameKey="name" outerRadius={90} label>
                {methodData.map((entry) => (
                  <Cell key={entry.name} fill={PALETTE[entry.name]} />
                ))}
              </Pie>
            </PieChart>
            <div style={{ fontSize: "0.8rem", marginTop: "6px" }}>
              {Object.entries(PALETTE).map(([method, color]) => (
                <span key={method} style={{ margin: "0 8px" }}>
                  <span style={{
                    display: "inline-block", width: 12, height: 12,
                    background: color, marginRight: 5
                  }}></span>
                  {method}
                </span>
              ))}
            </div>
          </div>
          <div style={{ width: "400px", textAlign: "center" }}>
            <h4>My Payments Over Time</h4>
            <AreaChart data={paymentTrend} width={380} height={220} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <XAxis dataKey="date" tick={{ fontSize: 9 }} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#bfdbfe" />
            </AreaChart>
          </div>
        </div>
      </div>
    </div>
    </div>
    </>
  );
}

/* Helpers */
function pillClass(s) {
  s = (s || '').toLowerCase();
  if (s === 'pending') return 'pending';
  if (s === 'approved' || s === 'completed' || s === 'paid') return 'paid';
  if (s === 'rejected') return 'rejected';
  if (s === 'refunded') return 'refunded';
  if (s === 'overdue') return 'overdue';
  if (s === 'cancelled' || s === 'canceled') return 'cancelled';
  return '';
}

function StatusPill({ status }) {
  return <span className={`status-pill ${pillClass(status)}`}>{status}</span>;
}
