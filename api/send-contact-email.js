// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Vercel Serverless Notification Function
// /api/send-contact-email
// Handles: new_request | status_update | invoice_ready |
//          new_message | document_request
// ═══════════════════════════════════════════════════════════════

const { applyCors } = require("./_cors");

module.exports = async (req, res) => {
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  const RESEND_KEY  = process.env.RESEND_API_KEY;
  const ADMIN_EMAIL = process.env.CONTACT_NOTIFY_TO   || "info@alkownglobal.com";
  const FROM_EMAIL  = process.env.CONTACT_NOTIFY_FROM || "Alkown Global <onboarding@resend.dev>";
  const WA_FROM     = process.env.TWILIO_WHATSAPP_FROM;
  const WA_SID      = process.env.TWILIO_ACCOUNT_SID;
  const WA_TOKEN    = process.env.TWILIO_AUTH_TOKEN;

  if (!RESEND_KEY) {
    console.log("[Notifications] RESEND_API_KEY not set — skipped");
    return res.status(200).json({ skipped: true });
  }

  try {
    // Vercel parses req.body automatically when Content-Type is application/json
    const payload = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { type = "new_request" } = payload;

    const ctx = { RESEND_KEY, FROM_EMAIL, ADMIN_EMAIL, WA_FROM, WA_SID, WA_TOKEN };

    switch (type) {
      case "status_update":    await handleStatusUpdate(ctx, payload);    break;
      case "invoice_ready":    await handleInvoiceReady(ctx, payload);    break;
      case "new_message":      await handleNewMessage(ctx, payload);      break;
      case "document_request": await handleDocumentRequest(ctx, payload); break;
      case "new_request":
      default:                 await handleNewRequest(ctx, payload);      break;
    }

    return res.status(200).json({ ok: true, type });
  } catch (err) {
    console.error("[Notifications] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ══════════════════════════════════════════════════════════════
// Handlers
// ══════════════════════════════════════════════════════════════

async function handleNewRequest(ctx, payload) {
  const { requestNumber, client = {}, form = {}, service = {} } = payload;
  const clientName   = form.name     || client.full_name || "العميل";
  const clientEmail  = form.email    || client.email     || "";
  const clientPhone  = form.phone    || client.phone     || "";
  const clientWA     = form.whatsapp || clientPhone;
  const serviceName  = service.name  || form.service     || "—";
  const servicePrice = service.price || "";
  const notes        = form.msg      || "";

  await sendEmail(ctx, {
    to: ctx.ADMIN_EMAIL,
    subject: `📋 طلب جديد ${requestNumber} — ${clientName}`,
    html: adminNewRequestHtml({ requestNumber, clientName, clientEmail, clientPhone, clientWA, serviceName, servicePrice, notes }),
  });

  if (clientEmail) {
    await sendEmail(ctx, {
      to: clientEmail,
      subject: `✅ تأكيد طلبك ${requestNumber} | Alkown Global`,
      html: clientConfirmHtml({ requestNumber, clientName, clientEmail, clientPhone, serviceName, servicePrice, notes }),
    });
  }

  if (ctx.WA_SID && clientWA) {
    const waNum = clientWA.replace(/\D/g, "").replace(/^00/, "+").replace(/^(?!\+)/, "+");
    await sendWhatsApp(ctx, {
      to: `whatsapp:${waNum}`,
      body: `مرحباً ${clientName} 👋\nتم استلام طلبك *${requestNumber}* بنجاح.\nسيتواصل معك فريقنا قريباً.\n\nتتبع طلبك: https://alkownglobal.com/track-request`,
    });
  }
}

async function handleStatusUpdate(ctx, payload) {
  const { requestNumber, client = {}, form = {}, status = "", note = "" } = payload;
  const clientEmail = client.email     || form.email || "";
  const clientName  = client.full_name || form.name  || "العميل";
  const clientPhone = client.phone     || "";
  const serviceName = form.service     || "—";

  await sendEmail(ctx, {
    to: ctx.ADMIN_EMAIL,
    subject: `🔄 ${requestNumber} → ${STATUS_AR[status] || status}`,
    html: baseLayout(`
      <div class="card">
        <h2>تحديث حالة طلب</h2>
        <div class="row"><span class="muted">رقم الطلب</span><strong class="gold">${esc(requestNumber)}</strong></div>
        <div class="row"><span class="muted">العميل</span><span>${esc(clientName)}</span></div>
        <div class="row"><span class="muted">الحالة الجديدة</span>
          <span style="background:${statusColor(status)}22;color:${statusColor(status)};padding:5px 16px;border-radius:20px;font-weight:700;font-size:13px">
            ${esc(STATUS_AR[status] || status)}
          </span>
        </div>
        ${note ? `<div class="row"><span class="muted">ملاحظة</span><span>${esc(note)}</span></div>` : ""}
      </div>
      <div class="card" style="text-align:center">
        <a href="https://alkownglobal.com/dashboard" class="btn">فتح لوحة التحكم</a>
      </div>
    `),
  });

  if (clientEmail) {
    await sendEmail(ctx, {
      to: clientEmail,
      subject: `🔄 تحديث طلبك ${requestNumber} | Alkown Global`,
      html: statusUpdateHtml({ requestNumber, clientName, serviceName, status, note }),
    });
  }

  if (ctx.WA_SID && clientPhone) {
    const waNum = clientPhone.replace(/\D/g, "").replace(/^00/, "+").replace(/^(?!\+)/, "+");
    await sendWhatsApp(ctx, {
      to: `whatsapp:${waNum}`,
      body: `مرحباً ${clientName} 👋\nتم تحديث طلبك *${requestNumber}*\nالحالة: *${STATUS_AR[status] || status}*\n${note ? `\nملاحظة: ${note}\n` : ""}\nتتبع طلبك: https://alkownglobal.com/track-request`,
    });
  }
}

async function handleInvoiceReady(ctx, payload) {
  const { invoiceNumber, client = {}, serviceName = "—", amount = 0, dueDate = "", notes = "" } = payload;
  const clientEmail = client.email     || "";
  const clientName  = client.full_name || "العميل";
  const clientPhone = client.phone     || "";

  await sendEmail(ctx, {
    to: ctx.ADMIN_EMAIL,
    subject: `💰 فاتورة جديدة ${invoiceNumber} — ${clientName}`,
    html: baseLayout(`
      <div class="card">
        <h2>💰 فاتورة جديدة</h2>
        <div class="row"><span class="muted">رقم الفاتورة</span><strong class="gold">${esc(invoiceNumber)}</strong></div>
        <div class="row"><span class="muted">العميل</span><span>${esc(clientName)}</span></div>
        <div class="row"><span class="muted">الخدمة</span><span>${esc(serviceName)}</span></div>
        <div class="row"><span class="muted">المبلغ</span><strong>$${Number(amount).toLocaleString()} USD</strong></div>
        ${dueDate ? `<div class="row"><span class="muted">الاستحقاق</span><span>${esc(dueDate)}</span></div>` : ""}
      </div>
    `),
  });

  if (clientEmail) {
    await sendEmail(ctx, {
      to: clientEmail,
      subject: `💰 فاتورة جديدة ${invoiceNumber} | Alkown Global`,
      html: invoiceReadyHtml({ invoiceNumber, clientName, serviceName, amount, dueDate, notes }),
    });
  }

  if (ctx.WA_SID && clientPhone) {
    const waNum = clientPhone.replace(/\D/g, "").replace(/^00/, "+").replace(/^(?!\+)/, "+");
    await sendWhatsApp(ctx, {
      to: `whatsapp:${waNum}`,
      body: `مرحباً ${clientName} 👋\nتم إنشاء فاتورة جديدة بمبلغ *$${Number(amount).toLocaleString()} USD*\nرقم الفاتورة: *${invoiceNumber}*\n${dueDate ? `تاريخ الاستحقاق: ${dueDate}` : ""}`,
    });
  }
}

async function handleNewMessage(ctx, payload) {
  const { client = {}, message = "", requestNumber = "" } = payload;
  const clientName  = client.full_name || "عميل";
  const clientPhone = client.phone     || "";

  await sendEmail(ctx, {
    to: ctx.ADMIN_EMAIL,
    subject: `💬 رسالة جديدة من ${clientName}${requestNumber ? ` — ${requestNumber}` : ""}`,
    html: baseLayout(`
      <div class="card">
        <h2>💬 رسالة جديدة من عميل</h2>
        <div class="row"><span class="muted">من</span><strong>${esc(clientName)}</strong></div>
        ${client.email  ? `<div class="row"><span class="muted">البريد</span><span>${esc(client.email)}</span></div>`  : ""}
        ${clientPhone   ? `<div class="row"><span class="muted">الهاتف</span><span>${esc(clientPhone)}</span></div>`   : ""}
        ${requestNumber ? `<div class="row"><span class="muted">الطلب</span><span class="gold">${esc(requestNumber)}</span></div>` : ""}
        <div style="margin-top:16px;background:#0d0d0d;border-right:3px solid #c9a84c;border-radius:8px;padding:14px 16px">
          <p style="color:#ccc;line-height:1.7;font-size:14px">${esc(message)}</p>
        </div>
      </div>
      <div class="card" style="text-align:center;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <a href="https://alkownglobal.com/dashboard" class="btn">فتح لوحة التحكم</a>
        ${clientPhone ? `<a href="https://wa.me/${clientPhone.replace(/\D/g,"")}" class="btn-ghost">💬 رد واتساب</a>` : ""}
      </div>
    `),
  });
}

async function handleDocumentRequest(ctx, payload) {
  const { client = {}, requestNumber = "", documents = [], message = "" } = payload;
  const clientEmail = client.email     || "";
  const clientName  = client.full_name || "العميل";
  const clientPhone = client.phone     || "";
  const docList     = Array.isArray(documents) && documents.length
    ? documents.map(d => `<li style="padding:6px 0;color:#ccc">${esc(d)}</li>`).join("")
    : "<li style='color:#888'>الوثائق المطلوبة — يرجى التواصل</li>";

  if (!clientEmail) return;

  await sendEmail(ctx, {
    to: clientEmail,
    subject: `📄 وثائق مطلوبة للطلب ${requestNumber} | Alkown Global`,
    html: baseLayout(`
      <div class="card">
        <h1>📄 وثائق مطلوبة</h1>
        <p class="muted" style="margin-top:6px">مرحباً ${esc(clientName)}، نحتاج منك رفع الوثائق التالية.</p>
      </div>
      <div class="card">
        <div class="row"><span class="muted">رقم الطلب</span><strong class="gold">${esc(requestNumber)}</strong></div>
        <div style="margin-top:16px">
          <p style="color:#c9a84c;font-weight:700;margin-bottom:10px">الوثائق المطلوبة:</p>
          <ul style="padding-right:16px;list-style:disc">${docList}</ul>
        </div>
        ${message ? `<div style="margin-top:14px;background:#0d0d0d;border-right:3px solid #c9a84c;padding:12px;border-radius:8px;font-size:13px;color:#aaa">${esc(message)}</div>` : ""}
      </div>
      <div class="card" style="text-align:center">
        <a href="https://alkownglobal.com/portal" class="btn">رفع الوثائق الآن</a>
      </div>
    `),
  });

  if (ctx.WA_SID && clientPhone) {
    const waNum = clientPhone.replace(/\D/g, "").replace(/^00/, "+").replace(/^(?!\+)/, "+");
    const docText = Array.isArray(documents) && documents.length ? documents.map(d => `• ${d}`).join("\n") : "يرجى التواصل لمعرفة الوثائق المطلوبة";
    await sendWhatsApp(ctx, {
      to: `whatsapp:${waNum}`,
      body: `مرحباً ${clientName} 📄\nالوثائق المطلوبة للطلب *${requestNumber}*:\n\n${docText}\n\nارفعها: https://alkownglobal.com/portal`,
    });
  }
}

// ══════════════════════════════════════════════════════════════
// Senders
// ══════════════════════════════════════════════════════════════

async function sendEmail(ctx, { to, subject, html }) {
  const res = await fetch("https://api.resend.com/emails", {
    method:  "POST",
    headers: { Authorization: `Bearer ${ctx.RESEND_KEY}`, "Content-Type": "application/json" },
    body:    JSON.stringify({ from: ctx.FROM_EMAIL, to, subject, html }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Resend: ${JSON.stringify(err)}`);
  }
}

async function sendWhatsApp(ctx, { to, body }) {
  if (!ctx.WA_SID || !ctx.WA_TOKEN || !ctx.WA_FROM) return;
  try {
    const url  = `https://api.twilio.com/2010-04-01/Accounts/${ctx.WA_SID}/Messages.json`;
    const auth = Buffer.from(`${ctx.WA_SID}:${ctx.WA_TOKEN}`).toString("base64");
    await fetch(url, {
      method:  "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body:    new URLSearchParams({ From: ctx.WA_FROM, To: to, Body: body }).toString(),
    });
  } catch (e) {
    console.warn("[WhatsApp] Error:", e.message);
  }
}

// ══════════════════════════════════════════════════════════════
// Templates
// ══════════════════════════════════════════════════════════════

function baseLayout(content) {
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#0a0a0a;font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#e0e0e0;direction:rtl}
    .wrap{max-width:600px;margin:0 auto;padding:40px 20px}
    .logo{text-align:center;padding:28px 0 22px;letter-spacing:4px;font-size:22px;font-weight:900;color:#c9a84c}
    .card{background:#111;border:1px solid #1e1e1e;border-radius:16px;padding:24px 28px;margin-bottom:16px}
    .gold{color:#c9a84c}.muted{color:#666;font-size:13px}
    .row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #1a1a1a;gap:10px}
    .row:last-child{border-bottom:none}
    .badge{display:inline-block;background:rgba(201,168,76,.15);color:#c9a84c;padding:5px 16px;border-radius:20px;font-size:13px;font-weight:700}
    .bank-box{background:#0d0d0d;border:1px solid rgba(201,168,76,.2);border-radius:10px;padding:16px;margin-top:12px}
    .bank-row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #1a1a1a;font-size:13px}
    .bank-row:last-child{border:none}
    .btn{display:inline-block;background:#c9a84c;color:#000!important;padding:12px 26px;border-radius:10px;text-decoration:none;font-weight:800;font-size:14px}
    .btn-ghost{display:inline-block;background:transparent;color:#c9a84c!important;border:1px solid rgba(201,168,76,.4);padding:11px 22px;border-radius:10px;text-decoration:none;font-weight:700;font-size:13px}
    .footer{text-align:center;color:#333;font-size:12px;padding:20px 0;border-top:1px solid #1a1a1a;margin-top:6px;line-height:1.9}
    h1{font-size:20px;color:#fff;margin-bottom:8px;font-weight:800}
    h2{font-size:15px;color:#c9a84c;margin-bottom:14px;font-weight:700}
    @media(max-width:600px){.card{padding:16px}}
  </style></head>
  <body><div class="wrap">
    <div class="logo">ALKOWN GLOBAL</div>
    ${content}
    <div class="footer">
      🌐 alkownglobal.com &nbsp;·&nbsp; ✉️ info@alkownglobal.com<br>
      📞 UAE +971 54 490 9522 &nbsp;·&nbsp; 📞 TR +90 534 764 1249<br>
      © ${new Date().getFullYear()} Alkown Global · All rights reserved.
    </div>
  </div></body></html>`;
}

function clientConfirmHtml({ requestNumber, clientName, clientEmail, clientPhone, serviceName, servicePrice, notes }) {
  const now   = new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
  const price = servicePrice ? `$${Number(servicePrice).toLocaleString()} USD` : "سيتم التحديد قريباً";
  return baseLayout(`
    <div class="card" style="border-color:rgba(201,168,76,.3)">
      <h1>شكراً ${esc(clientName)} 🎉</h1>
      <p style="color:#999;font-size:14px;margin:6px 0 16px">تم استلام طلبك. سيتواصل معك فريقنا خلال 24 ساعة.</p>
      <span class="badge">✅ ${esc(requestNumber)}</span>
    </div>
    <div class="card">
      <h2>تفاصيل الطلب</h2>
      <div class="row"><span class="muted">رقم الطلب</span><strong class="gold">${esc(requestNumber)}</strong></div>
      <div class="row"><span class="muted">الخدمة</span><span>${esc(serviceName)}</span></div>
      <div class="row"><span class="muted">المبلغ المبدئي</span><strong>${price}</strong></div>
      <div class="row"><span class="muted">التاريخ</span><span>${now}</span></div>
      ${notes ? `<div class="row"><span class="muted">ملاحظاتك</span><span style="max-width:55%;text-align:end">${esc(notes)}</span></div>` : ""}
    </div>
    <div class="card">
      <h2>💳 بيانات التحويل البنكي</h2>
      <div class="bank-box">
        <div class="bank-row"><span class="muted">اسم البنك</span><strong>مصرف رويا</strong></div>
        <div class="bank-row"><span class="muted">اسم الحساب</span><strong>Alkown Group LLC</strong></div>
        <div class="bank-row"><span class="muted">IBAN</span><strong>AE27 1325 4490 9522 0000 001</strong></div>
        <div class="bank-row"><span class="muted">المرجع</span><strong class="gold">${esc(requestNumber)}</strong></div>
      </div>
    </div>
    <div class="card" style="text-align:center;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <a href="https://alkownglobal.com/track-request" class="btn">تتبّع طلبي</a>
      <a href="https://wa.me/971544909522?text=مرحباً، طلبي ${esc(requestNumber)}" class="btn-ghost">💬 واتساب</a>
    </div>
  `);
}

function adminNewRequestHtml({ requestNumber, clientName, clientEmail, clientPhone, clientWA, serviceName, servicePrice, notes }) {
  return baseLayout(`
    <div class="card" style="border-color:rgba(201,168,76,.3)">
      <h1>📋 طلب جديد</h1>
      <span class="badge">${esc(requestNumber)}</span>
    </div>
    <div class="card">
      <h2>بيانات العميل</h2>
      <div class="row"><span class="muted">الاسم</span><strong>${esc(clientName)}</strong></div>
      <div class="row"><span class="muted">البريد</span><span>${esc(clientEmail) || "—"}</span></div>
      <div class="row"><span class="muted">الهاتف</span><span>${esc(clientPhone) || "—"}</span></div>
      <div class="row"><span class="muted">الخدمة</span><strong>${esc(serviceName)}</strong></div>
      ${servicePrice ? `<div class="row"><span class="muted">السعر</span><strong class="gold">$${Number(servicePrice).toLocaleString()}</strong></div>` : ""}
      ${notes ? `<div class="row"><span class="muted">ملاحظات</span><span style="max-width:55%;text-align:end">${esc(notes)}</span></div>` : ""}
    </div>
    <div class="card" style="text-align:center;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <a href="https://alkownglobal.com/dashboard" class="btn">فتح لوحة التحكم</a>
      ${clientPhone ? `<a href="https://wa.me/${clientPhone.replace(/\D/g,"")}?text=مرحباً ${esc(clientName)}، بخصوص طلبك ${esc(requestNumber)}" class="btn-ghost">💬 رد واتساب</a>` : ""}
    </div>
  `);
}

function statusUpdateHtml({ requestNumber, clientName, serviceName, status, note }) {
  const statusAr    = STATUS_AR[status] || status;
  const color       = statusColor(status);
  const isCompleted = status === "Completed";
  const isRejected  = status === "Rejected";
  const emoji       = isCompleted ? "✅" : isRejected ? "❌" : "🔄";
  return baseLayout(`
    <div class="card" style="border-color:${color}44">
      <h1>${emoji} تحديث على طلبك</h1>
      <p style="color:#999;font-size:14px;margin:6px 0">مرحباً ${esc(clientName)}.</p>
    </div>
    <div class="card">
      <div class="row"><span class="muted">رقم الطلب</span><strong class="gold">${esc(requestNumber)}</strong></div>
      <div class="row"><span class="muted">الخدمة</span><span>${esc(serviceName)}</span></div>
      <div class="row"><span class="muted">الحالة</span>
        <span style="background:${color}22;color:${color};padding:5px 16px;border-radius:20px;font-weight:700;font-size:13px">${esc(statusAr)}</span>
      </div>
      ${note ? `<div class="row"><span class="muted">ملاحظة</span><span style="max-width:55%;text-align:end;color:#ccc">${esc(note)}</span></div>` : ""}
    </div>
    ${isCompleted ? `<div class="card" style="background:rgba(47,143,91,.06);border-color:rgba(47,143,91,.2);text-align:center"><p style="color:#2f8f5b;font-weight:700">🎉 تهانينا! تم إتمام طلبك بنجاح</p></div>` : ""}
    ${isRejected  ? `<div class="card" style="background:rgba(185,74,72,.06);border-color:rgba(185,74,72,.2)"><p style="color:#e07070;font-size:14px">للاستفسار أو إعادة التقديم تواصل معنا.</p></div>` : ""}
    <div class="card" style="text-align:center;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <a href="https://alkownglobal.com/track-request" class="btn">تتبّع طلبي</a>
      <a href="https://wa.me/971544909522" class="btn-ghost">💬 تواصل معنا</a>
    </div>
  `);
}

function invoiceReadyHtml({ invoiceNumber, clientName, serviceName, amount, dueDate, notes }) {
  return baseLayout(`
    <div class="card" style="border-color:rgba(201,168,76,.3)">
      <h1>💰 فاتورة جديدة</h1>
      <p style="color:#999;font-size:14px;margin-top:6px">مرحباً ${esc(clientName)}.</p>
    </div>
    <div class="card">
      <div class="row"><span class="muted">رقم الفاتورة</span><strong class="gold">${esc(invoiceNumber)}</strong></div>
      <div class="row"><span class="muted">الخدمة</span><span>${esc(serviceName)}</span></div>
      <div class="row"><span class="muted">المبلغ</span><strong style="font-size:18px">$${Number(amount).toLocaleString()} USD</strong></div>
      ${dueDate ? `<div class="row"><span class="muted">تاريخ الاستحقاق</span><span style="color:#c28a25;font-weight:700">${esc(dueDate)}</span></div>` : ""}
      ${notes   ? `<div class="row"><span class="muted">ملاحظات</span><span>${esc(notes)}</span></div>` : ""}
    </div>
    <div class="card">
      <h2>💳 بيانات التحويل</h2>
      <div class="bank-box">
        <div class="bank-row"><span class="muted">اسم البنك</span><strong>مصرف رويا</strong></div>
        <div class="bank-row"><span class="muted">الحساب</span><strong>Alkown Group LLC</strong></div>
        <div class="bank-row"><span class="muted">IBAN</span><strong>AE27 1325 4490 9522 0000 001</strong></div>
        <div class="bank-row"><span class="muted">المرجع</span><strong class="gold">${esc(invoiceNumber)}</strong></div>
      </div>
    </div>
    <div class="card" style="text-align:center;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <a href="https://alkownglobal.com/portal" class="btn">عرض الفاتورة</a>
      <a href="https://wa.me/971544909522" class="btn-ghost">💬 استفسار</a>
    </div>
  `);
}

// ══════════════════════════════════════════════════════════════
// Constants & Helpers
// ══════════════════════════════════════════════════════════════

const STATUS_AR = {
  "New": "جديد", "In Progress": "قيد التنفيذ",
  "Pending Documents": "بانتظار وثائق", "Approved": "موافق عليه",
  "Rejected": "مرفوض", "Completed": "مكتمل",
  "Lead": "عميل محتمل", "Consultation": "استشارة",
  "Ready For Submission": "جاهز للتقديم", "Submitted": "تم التقديم",
  "Processing": "قيد المعالجة", "Documents Pending": "بانتظار وثائق",
};

function statusColor(s) {
  return { Completed:"#2f8f5b", Approved:"#2f8f5b", Rejected:"#b94a48",
    "In Progress":"#3d6f9f", Submitted:"#2563eb", Processing:"#7c3aed",
    "Pending Documents":"#c28a25", "Documents Pending":"#c28a25",
    "Ready For Submission":"#0d9488", Consultation:"#3d6f9f", Lead:"#8b5cf6",
  }[s] || "#c9a84c";
}

function esc(v) {
  return String(v || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
