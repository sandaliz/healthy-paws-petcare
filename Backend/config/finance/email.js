import nodemailer from "nodemailer";

const { FM_EMAIL_USER, FM_EMAIL_PASS } = process.env;
if (!FM_EMAIL_USER || !FM_EMAIL_PASS) {
  console.warn("⚠️ FM_EMAIL_USER/FM_EMAIL_PASS not set. Payment/Refund emails will fail.");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: FM_EMAIL_USER, pass: FM_EMAIL_PASS },
});

// Always format in LKR
function formatCurrency(n) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "LKR" }).format(Number(n) || 0);
  } catch (_) {
    return `LKR ${Number(n || 0).toFixed(2)}`;
  }
}

function lineItemsHtml(invoice) {
  const items = Array.isArray(invoice?.lineItems) ? invoice.lineItems : [];
  if (!items.length) {
    return "<tr><td colspan='4' style='padding:8px;border:1px solid #eee;'>No items</td></tr>";
  }
  return items.map((li, idx) => `
    <tr>
      <td style="padding:8px;border:1px solid #eee;">${idx + 1}</td>
      <td style="padding:8px;border:1px solid #eee;">${li.description || "-"}</td>
      <td style="padding:8px;border:1px solid #eee; text-align:right;">${li.quantity ?? 0}</td>
      <td style="padding:8px;border:1px solid #eee; text-align:right;">${formatCurrency(li.total ?? (li.quantity * li.unitPrice))}</td>
    </tr>
  `).join("");
}

/* ---------- Payment receipt email ---------- */
function buildPaymentHtml({ ownerName, ownerEmail, invoice, payment }) {
  const paidAmount = payment?.amount ?? invoice?.total ?? 0;
  const discount = payment?.discount || 0;
  const couponCode = payment?.couponId?.code || null;
  const subtotal = invoice?.subtotal ?? 0;
  const tax = invoice?.tax ?? 0;
  const grossTotal = invoice?.total ?? (Number(subtotal) + Number(tax));
  const paidAt = payment?.updatedAt || payment?.createdAt || new Date();

  const totalsTable = `
    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse; min-width:360px;">
      <tbody>
        <tr><td style="padding:6px 8px;">Subtotal</td><td style="padding:6px 8px; text-align:right;">${formatCurrency(subtotal)}</td></tr>
        <tr><td style="padding:6px 8px;">Tax</td><td style="padding:6px 8px; text-align:right;">${formatCurrency(tax)}</td></tr>
        <tr><td style="padding:6px 8px;"><b>Gross Total</b></td><td style="padding:6px 8px; text-align:right;"><b>${formatCurrency(grossTotal)}</b></td></tr>
        ${discount > 0 ? `<tr><td style="padding:6px 8px; color:#16a34a;">Coupon${couponCode ? ` (${couponCode})` : ""}</td><td style="padding:6px 8px; text-align:right; color:#16a34a;">- ${formatCurrency(discount)}</td></tr>` : ""}
        <tr><td style="padding:6px 8px; border-top:1px solid #eee;"><b>Amount Paid</b></td><td style="padding:6px 8px; text-align:right; border-top:1px solid #eee;"><b>${formatCurrency(paidAmount)}</b></td></tr>
      </tbody>
    </table>
  `;

  return `
  <div style="font-family:Arial,Helvetica,sans-serif; color:#111; line-height:1.5; padding:16px;">
    <div style="max-width:720px; margin:0 auto; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden;">
      <div style="background:#FED58E; color:#fff; padding:16px 20px;">
        <h2 style="margin:0;">Healthy Paws 🐾 — Payment Receipt</h2>
      </div>

      <div style="padding:20px;">
        <p style="margin:0 0 12px;">Hello ${ownerName},</p>
        <p style="margin:0 0 16px;">Thank you for your payment. Your receipt details are below.</p>

        <div style="border:1px solid #eee; border-radius:8px; padding:12px; margin: 8px 0 16px;">
          <div><b>Name:</b> ${ownerName}</div>
          <div><b>Email:</b> ${ownerEmail || "-"}</div>
          <div><b>Invoice ID:</b> ${invoice?.invoiceID || "-"}</div>
          <div><b>Status:</b> ${invoice?.status || "-"}</div>
          <div><b>Due:</b> ${invoice?.dueDate ? new Date(invoice.dueDate).toDateString() : "-"}</div>
          <div><b>Method:</b> ${payment?.method || "-"}</div>
          <div><b>Paid at:</b> ${new Date(paidAt).toLocaleString()}</div>
        </div>

        <h3 style="margin: 16px 0 8px; font-size:16px;">Services</h3>
        <table style="width:100%; border-collapse:collapse; border:1px solid #eee;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:8px;border:1px solid #eee; text-align:left;">#</th>
              <th style="padding:8px;border:1px solid #eee; text-align:left;">Description</th>
              <th style="padding:8px;border:1px solid #eee; text-align:right;">Qty</th>
              <th style="padding:8px;border:1px solid #eee; text-align:right;">Line Total</th>
            </tr>
          </thead>
          <tbody>
            ${lineItemsHtml(invoice)}
          </tbody>
        </table>

        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse; margin-top:12px;">
          <tr>
            <td style="padding:0;"></td>
            <td style="padding:0;" align="right">
              <div style="border:1px solid #eee; border-radius:8px; padding:12px; display:inline-block;">
                ${totalsTable}
              </div>
            </td>
          </tr>
        </table>

        <p style="margin:16px 0 0; font-size:14px; color:#374151;">If you have any questions, just reply to this email. Thanks for choosing Healthy Paws 🐾.</p>
      </div>

      <div style="background:#f8fafc; color:#6b7280; padding:10px 20px; font-size:12px;">
        Healthy Paws Clinic • This is an automated receipt.
      </div>
    </div>
  </div>`;
}

function buildPaymentText({ ownerName, ownerEmail, invoice, payment }) {
  const paidAmount = payment?.amount ?? invoice?.total ?? 0;
  const discount = payment?.discount || 0;
  const couponCode = payment?.couponId?.code || null;
  const subtotal = invoice?.subtotal ?? 0;
  const tax = invoice?.tax ?? 0;
  const grossTotal = invoice?.total ?? (Number(subtotal) + Number(tax));
  const paidAt = payment?.updatedAt || payment?.createdAt || new Date();

  let items = "";
  for (const [i, li] of (invoice?.lineItems || []).entries()) {
    const line = li.total ?? (li.quantity * li.unitPrice);
    items += `  ${i + 1}. ${li.description} — ${li.quantity} x ${formatCurrency(li.unitPrice)} = ${formatCurrency(line)}\n`;
  }

  return `Healthy Paws - Payment Receipt

Hello ${ownerName},

Name: ${ownerName}
Email: ${ownerEmail || "-"}
Invoice: ${invoice?.invoiceID || "-"}
Status: ${invoice?.status || "-"}
Due: ${invoice?.dueDate ? new Date(invoice.dueDate).toDateString() : "-"}
Method: ${payment?.method || "-"}
Paid at: ${new Date(paidAt).toLocaleString()}

Items:
${items || "  (no items)"}

Subtotal: ${formatCurrency(subtotal)}
Tax: ${formatCurrency(tax)}
Gross Total: ${formatCurrency(grossTotal)}
${discount > 0 ? `Coupon${couponCode ? ` (${couponCode})` : ""}: -${formatCurrency(discount)}\n` : ""}Amount Paid: ${formatCurrency(paidAmount)}

If you have any questions, reply to this email.
Thank you for choosing Healthy Paws 🐾.
`;
}

function buildRefundHtml({ ownerName, ownerEmail, invoice, payment, refundAmount, stripeRefundId, mode }) {
  const subtotal = invoice?.subtotal ?? 0;
  const tax = invoice?.tax ?? 0;
  const grossTotal = invoice?.total ?? (Number(subtotal) + Number(tax));
  const discount = payment?.discount || 0;
  const couponCode = payment?.couponId?.code || null;
  const paidAmount = payment?.amount ?? grossTotal - discount;
  const refundedTotal = Number(payment?.refundedAmount || 0);
  const refundedNow = Number(refundAmount || 0);
  const netPaidAfter = Math.max(0, paidAmount - refundedTotal);

  const offlineNote = mode === "offline"
    ? `<p style="margin:12px 0 0; padding:12px; background:#fffbeb; border:1px solid #fde68a; border-radius:8px; color:#92400e;">
         Your refund of <b>${formatCurrency(refundedNow)}</b> is ready for collection at our clinic counter.
         Please bring your Invoice ID (${invoice?.invoiceID || "-"}) and a valid ID. Counter hours: 9.00 AM – 6.00 PM.
       </p>`
    : "";

  return `
  <div style="font-family:Arial,Helvetica,sans-serif; color:#111; line-height:1.5; padding:16px;">
    <div style="max-width:720px; margin:0 auto; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden;">
      <div style="background:#FED58E; color:#fff; padding:16px 20px;">
        <h2 style="margin:0;">Healthy Paws 🐾 — Refund Confirmation</h2>
      </div>

      <div style="padding:20px;">
        <p style="margin:0 0 12px;">Hello ${ownerName},</p>
        <p style="margin:0 0 16px;">We have processed your refund. Details are below.</p>

        <div style="border:1px solid #eee; border-radius:8px; padding:12px; margin: 8px 0 16px;">
          <div><b>Name:</b> ${ownerName}</div>
          <div><b>Email:</b> ${ownerEmail || "-"}</div>
          <div><b>Invoice ID:</b> ${invoice?.invoiceID || "-"}</div>
          <div><b>Invoice Status:</b> ${invoice?.status || "-"}</div>
          <div><b>Method:</b> ${payment?.method || "-"}</div>
          <div><b>Refunded at:</b> ${new Date().toLocaleString()}</div>
          ${stripeRefundId ? `<div><b>Stripe Refund ID:</b> ${stripeRefundId}</div>` : ""}
        </div>

        <h3 style="margin: 16px 0 8px; font-size:16px;">Summary</h3>
        <table style="min-width:360px; border-collapse:collapse;">
          <tbody>
            <tr><td style="padding:6px 8px;">Subtotal</td><td style="padding:6px 8px; text-align:right;">${formatCurrency(subtotal)}</td></tr>
            <tr><td style="padding:6px 8px;">Tax</td><td style="padding:6px 8px; text-align:right;">${formatCurrency(tax)}</td></tr>
            <tr><td style="padding:6px 8px;"><b>Gross Total</b></td><td style="padding:6px 8px; text-align:right;"><b>${formatCurrency(grossTotal)}</b></td></tr>
            ${discount > 0 ? `<tr><td style="padding:6px 8px; color:#16a34a;">Coupon${couponCode ? ` (${couponCode})` : ""}</td><td style="padding:6px 8px; text-align:right; color:#16a34a;">- ${formatCurrency(discount)}</td></tr>` : ""}
            <tr><td style="padding:6px 8px;">Amount Paid</td><td style="padding:6px 8px; text-align:right;">${formatCurrency(paidAmount)}</td></tr>
            <tr><td style="padding:6px 8px; color:#ef4444;">Refund (this request)</td><td style="padding:6px 8px; text-align:right; color:#ef4444;">- ${formatCurrency(refundedNow)}</td></tr>
            <tr><td style="padding:6px 8px; border-top:1px solid #eee;"><b>Net Paid after refund</b></td><td style="padding:6px 8px; text-align:right; border-top:1px solid #eee;"><b>${formatCurrency(netPaidAfter)}</b></td></tr>
          </tbody>
        </table>

        ${offlineNote}

        <p style="margin:16px 0 0; font-size:14px; color:#374151;">If you have any questions, reply to this email. Thanks for choosing Healthy Paws 🐾.</p>
      </div>

      <div style="background:#f8fafc; color:#6b7280; padding:10px 20px; font-size:12px;">
        Healthy Paws Clinic • This is an automated message.
      </div>
    </div>
  </div>`;
}

function buildRefundText({ ownerName, ownerEmail, invoice, payment, refundAmount, stripeRefundId, mode }) {
  const subtotal = invoice?.subtotal ?? 0;
  const tax = invoice?.tax ?? 0;
  const grossTotal = invoice?.total ?? (Number(subtotal) + Number(tax));
  const discount = payment?.discount || 0;
  const couponCode = payment?.couponId?.code || null;
  const paidAmount = payment?.amount ?? grossTotal - discount;
  const refundedTotal = Number(payment?.refundedAmount || 0);
  const refundedNow = Number(refundAmount || 0);
  const netPaidAfter = Math.max(0, paidAmount - refundedTotal);

  return `Healthy Paws - Refund Confirmation

Hello ${ownerName},

Name: ${ownerName}
Email: ${ownerEmail || "-"}
Invoice: ${invoice?.invoiceID || "-"}
Invoice Status: ${invoice?.status || "-"}
Method: ${payment?.method || "-"}
Refunded at: ${new Date().toLocaleString()}
${stripeRefundId ? `Stripe Refund ID: ${stripeRefundId}\n` : ""}

Subtotal: ${formatCurrency(subtotal)}
Tax: ${formatCurrency(tax)}
Gross Total: ${formatCurrency(grossTotal)}
${discount > 0 ? `Coupon${couponCode ? ` (${couponCode})` : ""}: -${formatCurrency(discount)}\n` : ""}Amount Paid: ${formatCurrency(paidAmount)}
Refund (this request): -${formatCurrency(refundedNow)}
Net Paid after refund: ${formatCurrency(netPaidAfter)}

${mode === "offline"
  ? "Your refund is ready for collection at our clinic counter. Please bring your Invoice ID and a valid ID. Counter hours: 9.00 AM – 6.00 PM."
  : ""}

If you have any questions, reply to this email.
Thank you for choosing Healthy Paws 🐾.
`;
}

function buildRefundRejectedHtml({ ownerName, ownerEmail, invoice, payment, refundAmount, reasonProvided, reasonRejected }) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif; color:#111; line-height:1.5; padding:16px;">
      <div style="max-width:720px; margin:0 auto; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden;">
        <div style="background:#ef4444; color:#fff; padding:16px 20px;">
          <h2 style="margin:0;">Healthy Paws 🐾 — Refund Request Rejected</h2>
        </div>
        <div style="padding:20px;">
          <p>Hello ${ownerName},</p>
          <p>Your refund request of <b>${formatCurrency(refundAmount)}</b> 
             for invoice <b>${invoice?.invoiceID || '-'}</b> has been <b>rejected</b>.</p>
          <p><b>Your reason:</b> ${reasonProvided || '-'}</p>
          <p><b>Clinic response:</b> ${reasonRejected || 'Not provided'}</p>
          <p style="margin-top:12px; font-size:14px; color:#374151;">If you have questions, please reply to this email.</p>
        </div>
        <div style="background:#f8fafc; color:#6b7280; padding:10px 20px; font-size:12px;">
          Healthy Paws Clinic • This is an automated message.
        </div>
      </div>
    </div>
  `;
}

function buildRefundRejectedText({ ownerName, invoice, refundAmount, reasonProvided, reasonRejected }) {
  return `Healthy Paws - Refund Request Rejected

Hello ${ownerName},

Your refund request of ${formatCurrency(refundAmount)} 
for invoice ${invoice?.invoiceID || '-'} was rejected.

Your reason: ${reasonProvided || '-'}
Clinic response: ${reasonRejected || 'Not provided'}

If you have any questions, reply to this email.`;
}

const sendPaymentEmail = async ({ to, invoice, payment, ownerName: ownerNameOverride, ownerEmail: ownerEmailOverride }) => {
  try {
    const ownerName = ownerNameOverride || invoice?.userID?.name || "Customer";
    const ownerEmail = ownerEmailOverride || invoice?.userID?.email || to;
    if (!ownerEmail) return;

    const html = buildPaymentHtml({ ownerName, ownerEmail, invoice, payment });
    const text = buildPaymentText({ ownerName, ownerEmail, invoice, payment });

    await transporter.sendMail({
      from: `"Healthy Paws 🐾" <${FM_EMAIL_USER}>`,
      to: ownerEmail,
      subject: `Payment Receipt — Invoice ${invoice?.invoiceID || ""}`,
      text,
      html,
    });
    console.log(`📧 Payment receipt sent to ${ownerEmail}`);
  } catch (err) {
    console.error("❌ Failed to send payment email:", err);
  }
};

const sendRefundEmail = async ({ to, invoice, payment, refundAmount, stripeRefundId, mode, ownerName: ownerNameOverride, ownerEmail: ownerEmailOverride }) => {
  try {
    const ownerName = ownerNameOverride || invoice?.userID?.name || "Customer";
    const ownerEmail = ownerEmailOverride || invoice?.userID?.email || to;
    if (!ownerEmail) return;

    const html = buildRefundHtml({ ownerName, ownerEmail, invoice, payment, refundAmount, stripeRefundId, mode });
    const text = buildRefundText({ ownerName, ownerEmail, invoice, payment, refundAmount, stripeRefundId, mode });

    await transporter.sendMail({
      from: `"Healthy Paws 🐾" <${FM_EMAIL_USER}>`,
      to: ownerEmail,
      subject: `Refund Confirmation — Invoice ${invoice?.invoiceID || ""}`,
      text,
      html,
    });
    console.log(`📧 Refund email sent to ${ownerEmail}`);
  } catch (err) {
    console.error("❌ Failed to send refund email:", err);
  }
};

const sendRefundRejectedEmail = async ({ to, invoice, payment, refundAmount, reasonProvided, reasonRejected, ownerName: ownerNameOverride, ownerEmail: ownerEmailOverride }) => {
  try {
    const ownerName = ownerNameOverride || invoice?.userID?.name || "Customer";
    const ownerEmail = ownerEmailOverride || invoice?.userID?.email || to;
    if (!ownerEmail) return;

    const html = buildRefundRejectedHtml({ ownerName, ownerEmail, invoice, payment, refundAmount, reasonProvided, reasonRejected });
    const text = buildRefundRejectedText({ ownerName, ownerEmail, invoice, payment, refundAmount, reasonProvided, reasonRejected });

    await transporter.sendMail({
      from: `"Healthy Paws 🐾" <${FM_EMAIL_USER}>`,
      to: ownerEmail,
      subject: `Refund Request Rejected — Invoice ${invoice?.invoiceID || ""}`,
      text,
      html,
    });
    console.log(`📧 Refund rejection email sent to ${ownerEmail}`);
  } catch (err) {
    console.error("❌ Failed to send refund rejection email:", err);
  }
};

export { sendPaymentEmail, sendRefundEmail, sendRefundRejectedEmail };
