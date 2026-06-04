const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.CONTACT_NOTIFY_TO || "info@alkowngroup.com";
  const from = process.env.CONTACT_NOTIFY_FROM || "Alkown Group <onboarding@resend.dev>";

  if (!apiKey) {
    return { statusCode: 200, headers, body: JSON.stringify({ skipped: true, message: "RESEND_API_KEY not configured" }) };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const { type = "new_request" } = payload;

    if (type === "status_update") {
      await sendStatusUpdate(apiKey, from, adminEmail, payload);
    } else {
      await sendNewRequest(apiKey, from, adminEmail, payload);
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

// ── إشعار طلب جديد ────────────────────────────────────────────
async function sendNewRequest(apiKey, from, adminEmail, payload) {
  const { requestNumber, client = {}, form = {}, service = {} } = payload;
  const clientName = form.name || client.full_name || "العميل";
  const clientEmail = form.email || client.email || "";
  const clientPhone = form.phone || client.phone || "";
  const clientWhatsapp = form.whatsapp || clientPhone;
  const serviceName = service.name || form.service || "—";
  const servicePrice = service.price || "";
  const notes = form.msg || "";

  // إيميل للإدارة
  await sendEmail(apiKey, {
    from,
    to: adminEmail,
    subject: `طلب جديد ${requestNumber} — ${clientName}`,
    html: adminEmailHtml({ requestNumber, clientName, clientEmail, clientPhone, clientWhatsapp, serviceName, servicePrice, notes })
  });

  // فاتورة للعميل
  if (clientEmail) {
    await sendEmail(apiKey, {
      from,
      to: clientEmail,
      subject: `تأكيد طلبك — ${requestNumber} | Alkown Group`,
      html: clientInvoiceHtml({ requestNumber, clientName, clientEmail, clientPhone, serviceName, servicePrice, notes })
    });
  }
}

// ── تحديث حالة الطلب ──────────────────────────────────────────
async function sendStatusUpdate(apiKey, from, adminEmail, payload) {
  const { requestNumber, client = {}, form = {}, status = "" } = payload;
  const clientEmail = client.email || form.email || "";
  const clientName = client.full_name || form.name || "العميل";
  const serviceName = form.service || "—";

  await sendEmail(apiKey, {
    from,
    to: adminEmail,
    subject: `تحديث حالة ${requestNumber} → ${status}`,
    html: `<p>تم تحديث حالة الطلب <strong>${requestNumber}</strong> إلى: <strong>${status}</strong></p>`
  });

  if (clientEmail) {
    await sendEmail(apiKey, {
      from,
      to: clientEmail,
      subject: `تحديث طلبك ${requestNumber} — ${status} | Alkown Group`,
      html: statusUpdateHtml({ requestNumber, clientName, serviceName, status })
    });
  }
}

async function sendEmail(apiKey, { from, to, subject, html }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }
}

// ── قوالب الإيميل ─────────────────────────────────────────────
function baseLayout(content) {
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;color:#e0e0e0;direction:rtl}
    .wrap{max-width:600px;margin:0 auto;padding:40px 20px}
    .logo{text-align:center;padding:32px 0 20px;letter-spacing:4px;font-size:22px;font-weight:900;color:#c9a84c}
    .card{background:#111;border:1px solid #222;border-radius:16px;padding:32px;margin-bottom:20px}
    .gold{color:#c9a84c}
    .muted{color:#666;font-size:13px}
    .row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #1e1e1e}
    .row:last-child{border-bottom:none}
    .badge{display:inline-block;background:rgba(201,168,76,.15);color:#c9a84c;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:700}
    .bank-box{background:#0d0d0d;border:1px solid #c9a84c33;border-radius:12px;padding:20px;margin-top:16px}
    .bank-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1a1a1a;font-size:14px}
    .bank-row:last-child{border:none}
    .footer{text-align:center;color:#444;font-size:12px;padding:24px 0}
    h1{font-size:20px;color:#fff;margin-bottom:8px}
    h2{font-size:16px;color:#c9a84c;margin-bottom:16px}
  </style></head><body><div class="wrap">
    <div class="logo">ALKOWN GROUP</div>
    ${content}
    <div class="footer">alkowngroup.com · info@alkowngroup.com<br>© 2026 Alkown Group. All rights reserved.</div>
  </div></body></html>`;
}

function clientInvoiceHtml({ requestNumber, clientName, clientEmail, clientPhone, serviceName, servicePrice, notes }) {
  const now = new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
  const priceDisplay = servicePrice ? `$${Number(servicePrice).toLocaleString()} USD` : "سيتم التحديد";

  return baseLayout(`
    <div class="card">
      <h1>شكراً ${escapeHtml(clientName)} 🎉</h1>
      <p class="muted" style="margin-top:6px;margin-bottom:20px">تم استلام طلبك بنجاح وهو الآن قيد المراجعة.</p>
      <span class="badge">${escapeHtml(requestNumber)}</span>
    </div>

    <div class="card">
      <h2>تفاصيل الطلب</h2>
      <div class="row"><span class="muted">رقم الطلب</span><strong class="gold">${escapeHtml(requestNumber)}</strong></div>
      <div class="row"><span class="muted">الخدمة</span><span>${escapeHtml(serviceName)}</span></div>
      <div class="row"><span class="muted">المبلغ</span><strong>${priceDisplay}</strong></div>
      <div class="row"><span class="muted">التاريخ</span><span>${now}</span></div>
      <div class="row"><span class="muted">الاسم</span><span>${escapeHtml(clientName)}</span></div>
      <div class="row"><span class="muted">البريد</span><span>${escapeHtml(clientEmail)}</span></div>
      <div class="row"><span class="muted">الهاتف</span><span>${escapeHtml(clientPhone)}</span></div>
      ${notes ? `<div class="row"><span class="muted">ملاحظات</span><span>${escapeHtml(notes)}</span></div>` : ""}
    </div>

    <div class="card">
      <h2>💳 بيانات التحويل البنكي</h2>
      <p class="muted" style="margin-bottom:12px">يرجى التحويل إلى الحساب التالي وإرفاق إيصال الدفع:</p>
      <div class="bank-box">
        <div class="bank-row"><span class="muted">اسم البنك</span><strong>مصرف رويا</strong></div>
        <div class="bank-row"><span class="muted">اسم الحساب</span><strong>Alkown Group LLC</strong></div>
        <div class="bank-row"><span class="muted">IBAN</span><strong>AE27 1325 4490 9522 0000 001</strong></div>
        <div class="bank-row"><span class="muted">المرجع</span><strong class="gold">${escapeHtml(requestNumber)}</strong></div>
      </div>
      <p class="muted" style="margin-top:14px;font-size:12px">⚠️ يرجى ذكر رقم الطلب كمرجع للتحويل</p>
    </div>

    <div class="card" style="text-align:center">
      <p class="muted" style="margin-bottom:16px">تابع حالة طلبك في أي وقت</p>
      <a href="https://alkowngroup.com/track-request" style="display:inline-block;background:#c9a84c;color:#000;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700">تتبّع طلبك</a>
    </div>
  `);
}

function adminEmailHtml({ requestNumber, clientName, clientEmail, clientPhone, clientWhatsapp, serviceName, servicePrice, notes }) {
  return baseLayout(`
    <div class="card">
      <h1>طلب جديد 📋</h1>
      <span class="badge">${escapeHtml(requestNumber)}</span>
    </div>
    <div class="card">
      <h2>بيانات العميل</h2>
      <div class="row"><span class="muted">الاسم</span><strong>${escapeHtml(clientName)}</strong></div>
      <div class="row"><span class="muted">البريد</span><span>${escapeHtml(clientEmail)}</span></div>
      <div class="row"><span class="muted">الهاتف</span><span>${escapeHtml(clientPhone)}</span></div>
      <div class="row"><span class="muted">واتساب</span><span>${escapeHtml(clientWhatsapp)}</span></div>
      <div class="row"><span class="muted">الخدمة</span><strong>${escapeHtml(serviceName)}</strong></div>
      ${servicePrice ? `<div class="row"><span class="muted">السعر</span><strong>$${Number(servicePrice).toLocaleString()}</strong></div>` : ""}
      ${notes ? `<div class="row"><span class="muted">ملاحظات</span><span>${escapeHtml(notes)}</span></div>` : ""}
    </div>
    <div class="card" style="text-align:center">
      <a href="https://alkowngroup.com/dashboard" style="display:inline-block;background:#c9a84c;color:#000;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700">فتح لوحة التحكم</a>
    </div>
  `);
}

function statusUpdateHtml({ requestNumber, clientName, serviceName, status }) {
  const statusAr = {
    "New": "جديد", "In Progress": "قيد التنفيذ",
    "Pending Documents": "بانتظار وثائق", "Approved": "موافق عليه",
    "Rejected": "مرفوض", "Completed": "مكتمل"
  }[status] || status;

  return baseLayout(`
    <div class="card">
      <h1>تحديث على طلبك</h1>
      <p class="muted" style="margin-top:6px">مرحباً ${escapeHtml(clientName)}، تم تحديث حالة طلبك.</p>
    </div>
    <div class="card">
      <div class="row"><span class="muted">رقم الطلب</span><strong class="gold">${escapeHtml(requestNumber)}</strong></div>
      <div class="row"><span class="muted">الخدمة</span><span>${escapeHtml(serviceName)}</span></div>
      <div class="row"><span class="muted">الحالة الجديدة</span><span class="badge">${escapeHtml(statusAr)}</span></div>
    </div>
    <div class="card" style="text-align:center">
      <a href="https://alkowngroup.com/track-request" style="display:inline-block;background:#c9a84c;color:#000;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700">تتبّع طلبك</a>
    </div>
  `);
}

function escapeHtml(v) {
  return String(v || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
