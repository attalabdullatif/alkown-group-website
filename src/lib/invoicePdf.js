/**
 * invoicePdf.js — Client-side PDF invoice generator
 * Uses the browser's print dialog with a styled full-page template.
 * Generates a QR code via the Google Charts API (no dependency needed).
 */

function qrUrl(text, size = 120) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
}

function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("ar-SA", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount || 0);
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
}

const STATUS_AR = {
  Draft: "مسودة", Sent: "مُرسلة", Paid: "مدفوعة",
  "Partially Paid": "مدفوعة جزئياً", Overdue: "متأخرة", Cancelled: "ملغية"
};

const STATUS_COLORS = {
  Draft: "#888", Sent: "#3d6f9f", Paid: "#2d9c5a",
  "Partially Paid": "#c28a25", Overdue: "#c0392b", Cancelled: "#999"
};

export function printInvoicePDF(invoice, client, request = null) {
  const verifyUrl = `${window.location.origin}/verify-invoice?n=${invoice.invoice_number}`;
  const qr = qrUrl(verifyUrl, 100);
  const statusColor = STATUS_COLORS[invoice.status] || "#888";
  const statusText = STATUS_AR[invoice.status] || invoice.status;

  const items = invoice.items || [
    { description: invoice.description || invoice.notes || "خدمات مهنية", qty: 1, unit_price: invoice.amount }
  ];
  const subtotal = items.reduce((s, it) => s + (it.qty || 1) * (it.unit_price || 0), 0);
  const tax = invoice.tax_amount || 0;
  const discount = invoice.discount_amount || 0;
  const total = subtotal + tax - discount;
  const paidAmount = invoice.paid_amount || (invoice.status === "Paid" ? total : 0);
  const balance = total - paidAmount;

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>فاتورة ${invoice.invoice_number}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Cairo', Arial, sans-serif; background: #fff; color: #1a1a1a; font-size: 13px; }
    .page { max-width: 800px; margin: 0 auto; padding: 40px 48px; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #c8922a; }
    .brand-name { font-size: 28px; font-weight: 800; color: #c8922a; }
    .brand-sub  { font-size: 11px; color: #888; letter-spacing: 3px; text-transform: uppercase; margin-top: 2px; }
    .invoice-meta { text-align: left; }
    .invoice-title { font-size: 22px; font-weight: 800; color: #1a1a1a; }
    .invoice-num   { font-size: 13px; color: #c8922a; font-weight: 700; margin-top: 2px; }

    /* Status badge */
    .status-badge { display: inline-block; padding: 4px 14px; border-radius: 99px; font-size: 11px; font-weight: 700; background: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}44; margin-top: 8px; }

    /* Grid */
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .info-box { background: #faf7f2; border: 1px solid #ede5d8; border-radius: 6px; padding: 18px 20px; }
    .info-box h4 { font-size: 10px; color: #888; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
    .info-box .name  { font-weight: 700; font-size: 15px; color: #1a1a1a; }
    .info-box .detail { font-size: 12px; color: #666; margin-top: 3px; }

    /* Dates row */
    .dates-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
    .date-cell { text-align: center; background: #fff; border: 1px solid #ede5d8; border-radius: 6px; padding: 14px; }
    .date-cell .label { font-size: 10px; color: #888; letter-spacing: 1px; text-transform: uppercase; }
    .date-cell .value { font-size: 14px; font-weight: 700; color: #1a1a1a; margin-top: 4px; }

    /* Table */
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #1e1508; color: #f5c842; font-size: 11px; letter-spacing: 1px; padding: 11px 14px; text-align: right; font-weight: 700; }
    td { padding: 11px 14px; border-bottom: 1px solid #f0ebe0; font-size: 13px; }
    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) td { background: #faf7f2; }

    /* Totals */
    .totals { margin-right: auto; width: 280px; margin-bottom: 32px; }
    .totals-row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #f0ebe0; font-size: 13px; }
    .totals-row.total { font-weight: 800; font-size: 16px; color: #c8922a; border-bottom: 2px solid #c8922a; padding-bottom: 10px; margin-top: 6px; }
    .totals-row.balance { font-weight: 700; color: ${balance > 0 ? "#c0392b" : "#2d9c5a"}; }

    /* Bottom */
    .bottom { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 24px; border-top: 1px solid #ede5d8; }
    .qr-section { text-align: center; }
    .qr-section img { display: block; margin: 0 auto 6px; }
    .qr-section .qr-label { font-size: 9px; color: #aaa; letter-spacing: 1px; }
    .bank-info { background: #0d0b08; color: #ccc; border-radius: 8px; padding: 16px 20px; font-size: 12px; width: 300px; }
    .bank-info h4 { color: #c8922a; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
    .bank-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #1a1a1a; }
    .bank-row .bk { color: #555; }
    .bank-row .bv { color: #fff; font-weight: 600; }
    .footer-bar { text-align: center; margin-top: 32px; font-size: 10px; color: #aaa; letter-spacing: 1px; }
    .gold-bar { height: 3px; background: linear-gradient(90deg,#8a6010,#c8922a,#f5c842,#c8922a,#8a6010); margin-bottom: 24px; border-radius: 2px; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 20px 32px; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="gold-bar"></div>

  <!-- Header -->
  <div class="header">
    <div>
      <div class="brand-name">الكون</div>
      <div class="brand-sub">ALKOWN GLOBAL</div>
      <div style="font-size:11px;color:#888;margin-top:6px;">info@alkownglobal.com</div>
      <div style="font-size:11px;color:#888;">+971 54 490 9522 | +90 534 764 1249</div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-title">فاتورة</div>
      <div class="invoice-num">${invoice.invoice_number}</div>
      <div><span class="status-badge">${statusText}</span></div>
    </div>
  </div>

  <!-- Parties -->
  <div class="grid-2">
    <div class="info-box">
      <h4>العميل</h4>
      <div class="name">${client?.full_name || "—"}</div>
      ${client?.email ? `<div class="detail">✉️ ${client.email}</div>` : ""}
      ${client?.phone ? `<div class="detail">📞 ${client.phone}</div>` : ""}
    </div>
    <div class="info-box">
      <h4>تفاصيل الفاتورة</h4>
      ${request ? `<div class="detail">الطلب: ${request.request_number || ""}</div>` : ""}
      ${invoice.payment_terms ? `<div class="detail">شروط الدفع: ${invoice.payment_terms}</div>` : ""}
    </div>
  </div>

  <!-- Dates -->
  <div class="dates-row">
    <div class="date-cell">
      <div class="label">تاريخ الإصدار</div>
      <div class="value">${formatDate(invoice.issue_date || invoice.created_at)}</div>
    </div>
    <div class="date-cell">
      <div class="label">تاريخ الاستحقاق</div>
      <div class="value">${formatDate(invoice.due_date)}</div>
    </div>
    <div class="date-cell">
      <div class="label">المرجع</div>
      <div class="value" style="color:#c8922a;">${invoice.invoice_number}</div>
    </div>
  </div>

  <!-- Line items -->
  <table>
    <thead>
      <tr>
        <th style="width:50%">الوصف</th>
        <th style="text-align:center">الكمية</th>
        <th style="text-align:left">سعر الوحدة</th>
        <th style="text-align:left">المجموع</th>
      </tr>
    </thead>
    <tbody>
      ${items.map(it => `
      <tr>
        <td>${it.description || it.name || "خدمة"}</td>
        <td style="text-align:center">${it.qty || 1}</td>
        <td style="text-align:left">${formatCurrency(it.unit_price)}</td>
        <td style="text-align:left;font-weight:600;">${formatCurrency((it.qty || 1) * (it.unit_price || 0))}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <!-- Totals -->
  <div style="display:flex;justify-content:flex-end;">
    <div class="totals">
      <div class="totals-row"><span>المجموع الفرعي</span><span>${formatCurrency(subtotal)}</span></div>
      ${discount > 0 ? `<div class="totals-row"><span>الخصم</span><span style="color:#2d9c5a;">- ${formatCurrency(discount)}</span></div>` : ""}
      ${tax > 0 ? `<div class="totals-row"><span>الضريبة</span><span>${formatCurrency(tax)}</span></div>` : ""}
      <div class="totals-row total"><span>الإجمالي</span><span>${formatCurrency(total)}</span></div>
      ${paidAmount > 0 ? `<div class="totals-row"><span>المدفوع</span><span style="color:#2d9c5a;">- ${formatCurrency(paidAmount)}</span></div>` : ""}
      ${paidAmount > 0 ? `<div class="totals-row balance"><span>الرصيد المتبقي</span><span>${formatCurrency(balance)}</span></div>` : ""}
    </div>
  </div>

  <!-- Bottom: Bank + QR -->
  <div class="bottom">
    <div class="bank-info">
      <h4>بيانات التحويل البنكي</h4>
      <div class="bank-row"><span class="bk">البنك</span><span class="bv">مصرف رويا</span></div>
      <div class="bank-row"><span class="bk">اسم الحساب</span><span class="bv">Alkown Group LLC</span></div>
      <div class="bank-row"><span class="bk">IBAN</span><span class="bv">AE27 1325 4490 9522 0000 001</span></div>
      <div class="bank-row"><span class="bk">المرجع</span><span class="bv" style="color:#c8922a;">${invoice.invoice_number}</span></div>
    </div>
    <div class="qr-section">
      <img src="${qr}" width="100" height="100" alt="QR" />
      <div class="qr-label">امسح للتحقق من الفاتورة</div>
      <div style="font-size:9px;color:#ccc;margin-top:2px;">${invoice.invoice_number}</div>
    </div>
  </div>

  ${invoice.notes ? `<div style="margin-top:20px;padding:14px 18px;background:#faf7f2;border-right:3px solid #c8922a;border-radius:4px;font-size:12px;color:#666;"><strong>ملاحظات:</strong> ${invoice.notes}</div>` : ""}

  <div class="footer-bar">مجموعة الكون · alkownglobal.com · ${new Date().getFullYear()}</div>
</div>
<script>
  window.addEventListener('load', function() {
    // Wait for QR image to load
    var img = document.querySelector('img[alt="QR"]');
    if (img && !img.complete) { img.onload = function() { window.print(); }; }
    else { setTimeout(function() { window.print(); }, 300); }
  });
</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) { alert("يرجى السماح بفتح النوافذ المنبثقة"); return; }
  win.document.write(html);
  win.document.close();
}
