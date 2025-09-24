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

/* ---------- Refund emails remain the same ---------- */
// ... keep the refund functions as-is, just export at the end

const sendPaymentEmail = async ({ to, invoice, payment, ownerName: ownerNameOverride, ownerEmail: ownerEmailOverride }) => {
  try {
    const ownerName = ownerNameOverride || invoice?.userID?.OwnerName || "Customer";
    const ownerEmail = ownerEmailOverride || invoice?.userID?.OwnerEmail || to;
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
    const ownerName = ownerNameOverride || invoice?.userID?.OwnerName || "Customer";
    const ownerEmail = ownerEmailOverride || invoice?.userID?.OwnerEmail || to;
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
    const ownerName = ownerNameOverride || invoice?.userID?.OwnerName || "Customer";
    const ownerEmail = ownerEmailOverride || invoice?.userID?.OwnerEmail || to;
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
