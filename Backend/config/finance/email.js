const nodemailer = require("nodemailer");

const { EMAIL_USER, EMAIL_PASS } = process.env;
if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn("⚠️ EMAIL_USER/EMAIL_PASS not set. Payment/Refund emails will fail.");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
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

  // This is the totals table we'll align to the right (below services)
  const totalsTable = `
    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse; min-width:360px;">
      <tbody>
        <tr>
          <td style="padding:6px 8px;">Subtotal</td>
          <td style="padding:6px 8px; text-align:right;">${formatCurrency(subtotal)}</td>
        </tr>
        <tr>
          <td style="padding:6px 8px;">Tax</td>
          <td style="padding:6px 8px; text-align:right;">${formatCurrency(tax)}</td>
        </tr>
        <tr>
          <td style="padding:6px 8px;"><b>Gross Total</b></td>
          <td style="padding:6px 8px; text-align:right;"><b>${formatCurrency(grossTotal)}</b></td>
        </tr>
        ${discount > 0 ? `
        <tr>
          <td style="padding:6px 8px; color:#16a34a;">Coupon${couponCode ? ` (${couponCode})` : ""}</td>
          <td style="padding:6px 8px; text-align:right; color:#16a34a;">- ${formatCurrency(discount)}</td>
        </tr>` : ""}
        <tr>
          <td style="padding:6px 8px; border-top:1px solid #eee;"><b>Amount Paid</b></td>
          <td style="padding:6px 8px; text-align:right; border-top:1px solid #eee;"><b>${formatCurrency(paidAmount)}</b></td>
        </tr>
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

        <!-- Info block (unchanged) -->
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
        <!-- Services table (unchanged) -->
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

        <!-- Totals below services, aligned to the right (email-safe) -->
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

/* ---------- Refund confirmation email (unchanged layout) ---------- */
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

/* ---------- Senders ---------- */
const sendPaymentEmail = async ({ to, invoice, payment }) => {
  try {
    const ownerName = invoice?.userID?.OwnerName || "Customer";
    const ownerEmail = invoice?.userID?.OwnerEmail || to;
    if (!ownerEmail) return;

    const html = buildPaymentHtml({ ownerName, ownerEmail, invoice, payment });
    const text = buildPaymentText({ ownerName, ownerEmail, invoice, payment });

    await transporter.sendMail({
      from: `"Healthy Paws 🐾" <${EMAIL_USER}>`,
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

const sendRefundEmail = async ({ to, invoice, payment, refundAmount, stripeRefundId, mode }) => {
  try {
    const ownerName = invoice?.userID?.OwnerName || "Customer";
    const ownerEmail = invoice?.userID?.OwnerEmail || to;
    if (!ownerEmail) return;

    const html = buildRefundHtml({ ownerName, ownerEmail, invoice, payment, refundAmount, stripeRefundId, mode });
    const text = buildRefundText({ ownerName, ownerEmail, invoice, payment, refundAmount, stripeRefundId, mode });

    await transporter.sendMail({
      from: `"Healthy Paws 🐾" <${EMAIL_USER}>`,
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

function buildRefundRejectedHtml({ ownerName, ownerEmail, invoice, payment, refundAmount, reasonProvided, reasonRejected }) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif; color:#111; line-height:1.5; padding:16px;">
    <div style="max-width:720px; margin:0 auto; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden;">
      <div style="background:#FED58E; color:#fff; padding:16px 20px;">
        <h2 style="margin:0;">Healthy Paws 🐾 — Refund Request Update</h2>
      </div>

      <div style="padding:20px;">
        <p style="margin:0 0 12px;">Hello ${ownerName},</p>
        <p style="margin:0 0 16px;">We reviewed your refund request and unfortunately had to decline it.</p>

        <div style="border:1px solid #eee; border-radius:8px; padding:12px; margin: 8px 0 16px;">
          <div><b>Name:</b> ${ownerName}</div>
          <div><b>Email:</b> ${ownerEmail || "-"}</div>
          <div><b>Invoice ID:</b> ${invoice?.invoiceID || "-"}</div>
          <div><b>Invoice Status:</b> ${invoice?.status || "-"}</div>
          <div><b>Payment Method:</b> ${payment?.method || "-"}</div>
          <div><b>Requested Refund:</b> ${formatCurrency(refundAmount)}</div>
        </div>

        <h3 style="margin: 16px 0 8px; font-size:16px;">Reasons</h3>
        <div style="border:1px solid #eee; border-radius:8px; padding:12px; margin-bottom:12px;">
          <div><b>Your reason:</b></div>
          <div style="white-space:pre-wrap; margin-top:6px;">${reasonProvided || "-"}</div>
        </div>
        <div style="border:1px solid #fee2e2; background:#fef2f2; color:#991b1b; border-radius:8px; padding:12px;">
          <div><b>Our decision:</b></div>
          <div style="white-space:pre-wrap; margin-top:6px;">${reasonRejected || "-"}</div>
        </div>

        <p style="margin:16px 0 0; font-size:14px; color:#374151;">
          If you believe this was a mistake or you have additional information, please reply to this email and our team will re-check your request.
        </p>
      </div>

      <div style="background:#f8fafc; color:#6b7280; padding:10px 20px; font-size:12px;">
        Healthy Paws Clinic • This is an automated message.
      </div>
    </div>
  </div>`;
}

function buildRefundRejectedText({ ownerName, ownerEmail, invoice, payment, refundAmount, reasonProvided, reasonRejected }) {
  return `Healthy Paws - Refund Request Update

Hello ${ownerName},

Name: ${ownerName}
Email: ${ownerEmail || "-"}
Invoice: ${invoice?.invoiceID || "-"}
Invoice Status: ${invoice?.status || "-"}
Payment Method: ${payment?.method || "-"}
Requested Refund: ${formatCurrency(refundAmount)}

Your reason:
${reasonProvided || "-"}

Our decision:
${reasonRejected || "-"}

If you believe this was a mistake or you have more details, reply to this email and our team will re-check your request.
`;
}

const sendRefundRejectedEmail = async ({ to, invoice, payment, refundAmount, reasonProvided, reasonRejected }) => {
  try {
    const ownerName = invoice?.userID?.OwnerName || "Customer";
    const ownerEmail = invoice?.userID?.OwnerEmail || to;
    if (!ownerEmail) return;

    const html = buildRefundRejectedHtml({ ownerName, ownerEmail, invoice, payment, refundAmount, reasonProvided, reasonRejected });
    const text = buildRefundRejectedText({ ownerName, ownerEmail, invoice, payment, refundAmount, reasonProvided, reasonRejected });

    await transporter.sendMail({
      from: `"Healthy Paws 🐾" <${EMAIL_USER}>`,
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

module.exports = { sendPaymentEmail, sendRefundEmail, sendRefundRejectedEmail };