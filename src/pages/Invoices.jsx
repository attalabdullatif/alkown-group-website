import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  CRM_COLORS, buttonStyle, cardStyle, formatDate,
  inputStyle, outlineButtonStyle, pageStyle,
} from "../components/crmUi";

const INVOICE_STATUSES = ["Pending", "Paid", "Cancelled"];
const PAYMENT_METHODS = ["bank_transfer", "cash", "card", "cheque"];
const PAYMENT_AR = { bank_transfer: "تحويل بنكي", cash: "نقداً", card: "بطاقة", cheque: "شيك" };

const STATUS_COLORS = { Pending: "#c28a25", Paid: CRM_COLORS.success, Cancelled: CRM_COLORS.danger };
const STATUS_BG = { Pending: "rgba(194,138,37,.12)", Paid: "rgba(47,143,91,.12)", Cancelled: "rgba(185,74,72,.1)" };
const STATUS_AR = { Pending: "معلّقة", Paid: "مدفوعة", Cancelled: "ملغية" };

const emptyForm = { request_id: "", client_id: "", amount: "", status: "Pending", payment_method: "bank_transfer", notes: "" };

function generateInvoiceNumber() {
  const d = new Date();
  return `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Date.now().toString().slice(-4)}`;
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [printInvoice, setPrintInvoice] = useState(null);
  const printRef = useRef();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [invRes, reqRes, cliRes] = await Promise.all([
      supabase.from("invoices").select("*, requests(request_number, client_id, clients(full_name, email, phone), services(name))").order("created_at", { ascending: false }),
      supabase.from("requests").select("id, request_number, client_id, clients(full_name)").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, full_name").order("full_name"),
    ]);
    if (invRes.error) setError(invRes.error.message);
    setInvoices(invRes.data || []);
    setRequests(reqRes.data || []);
    setClients(cliRes.data || []);
    setLoading(false);
  }

  function editInvoice(inv) {
    setSelected(inv);
    setForm({
      request_id: inv.request_id || "",
      client_id: inv.client_id || inv.requests?.client_id || "",
      amount: inv.amount ?? "",
      status: inv.status || "Pending",
      payment_method: inv.payment_method || "bank_transfer",
      notes: inv.notes || "",
    });
  }

  function resetForm() {
    setSelected(null);
    setForm(emptyForm);
  }

  async function saveInvoice(e) {
    e.preventDefault();
    if (!form.amount) { setError("المبلغ مطلوب."); return; }
    setSaving(true);
    setError("");
    const payload = {
      request_id: form.request_id || null,
      client_id: form.client_id || null,
      amount: Number(form.amount),
      status: form.status,
      payment_method: form.payment_method,
      notes: form.notes,
      ...(!selected && { invoice_number: generateInvoiceNumber() }),
    };
    const result = selected
      ? await supabase.from("invoices").update(payload).eq("id", selected.id)
      : await supabase.from("invoices").insert([payload]);
    setSaving(false);
    if (result.error) { setError(result.error.message); return; }
    resetForm();
    await loadData();
  }

  async function deleteInvoice(inv) {
    if (!window.confirm(`حذف الفاتورة ${inv.invoice_number || inv.id.slice(0, 8)}؟`)) return;
    await supabase.from("invoices").delete().eq("id", inv.id);
    if (selected?.id === inv.id) resetForm();
    await loadData();
  }

  async function toggleStatus(inv) {
    const next = inv.status === "Paid" ? "Pending" : "Paid";
    await supabase.from("invoices").update({ status: next }).eq("id", inv.id);
    await loadData();
  }

  function handleRequestChange(reqId) {
    const req = requests.find(r => r.id === reqId);
    setForm(f => ({ ...f, request_id: reqId, client_id: req?.client_id || f.client_id }));
  }

  function handlePrint(inv) {
    const verifyUrl = `https://www.alkownglobal.com/verify-invoice?inv=${inv.invoice_number}&amt=${inv.amount}&client=${encodeURIComponent(inv.requests?.clients?.full_name || "")}&date=${new Date(inv.created_at).toISOString().split("T")[0]}`;
    const clientName = inv.requests?.clients?.full_name || "—";
    const clientPhone = inv.requests?.clients?.phone || "—";
    const clientEmail = inv.requests?.clients?.email || "—";
    const serviceName = inv.requests?.services?.name || "—";
    const reqNumber = inv.requests?.request_number || "—";
    const date = new Date(inv.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
    const statusLabel = { Paid: "مدفوعة", Pending: "معلّقة", Cancelled: "ملغية" }[inv.status] || inv.status;
    const paymentLabel = { bank_transfer: "تحويل بنكي", cash: "نقداً", card: "بطاقة", cheque: "شيك" }[inv.payment_method] || "—";

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>فاتورة ${inv.invoice_number}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; direction: rtl; }
  .page { max-width: 780px; margin: 0 auto; padding: 40px 48px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #c9a84c; padding-bottom: 24px; margin-bottom: 32px; }
  .logo { font-size: 30px; font-weight: 900; letter-spacing: 4px; color: #c9a84c; }
  .logo-sub { color: #888; font-size: 12px; margin-top: 4px; line-height: 1.8; }
  .inv-title { font-size: 26px; font-weight: 900; text-align: left; }
  .inv-meta { font-size: 13px; color: #555; text-align: left; margin-top: 8px; line-height: 2; }
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: 700; font-size: 12px; background: ${inv.status === "Paid" ? "#d4edda" : "#fff3cd"}; color: ${inv.status === "Paid" ? "#155724" : "#856404"}; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
  .info-box { background: #f8f6f2; border-radius: 8px; padding: 18px 20px; border-right: 4px solid #c9a84c; }
  .info-box-2 { border-right-color: #1a1a1a; }
  .info-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #888; margin-bottom: 10px; }
  .info-name { font-weight: 800; font-size: 16px; margin-bottom: 4px; }
  .info-row { color: #555; font-size: 13px; margin-bottom: 2px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
  thead tr { background: #1a1a1a; color: #fff; }
  th { padding: 12px 16px; font-size: 13px; }
  th:first-child { text-align: right; }
  th:last-child { text-align: left; }
  th:nth-child(2) { text-align: center; }
  td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid #eee; }
  td:first-child { text-align: right; }
  td:last-child { text-align: left; font-weight: 700; }
  td:nth-child(2) { text-align: center; }
  tfoot tr { background: #f8f6f2; }
  tfoot td { font-weight: 900; font-size: 17px; }
  tfoot td:last-child { color: #c9a84c; }
  .bank { background: #0a0a0a; color: #fff; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px; }
  .bank-title { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #c9a84c; margin-bottom: 12px; }
  .bank-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; font-size: 13px; }
  .bank-key { color: #888; }
  .bank-val { font-weight: 700; }
  .ref { color: #c9a84c !important; }
  .footer { border-top: 2px solid #c9a84c; padding-top: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
  .footer-info { font-size: 12px; color: #888; line-height: 1.9; }
  .footer-logo { font-size: 15px; font-weight: 900; color: #c9a84c; margin-bottom: 4px; }
  .qr-label { font-size: 10px; color: #888; text-align: center; margin-top: 4px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="logo">ALKOWN GLOBAL</div>
      <div class="logo-sub" style="font-size:16px;color:#c9a84c;font-weight:700;margin-top:6px">بوابتك نحو العالم</div>
    </div>
    <div>
      <div class="inv-title">فاتورة</div>
      <div class="inv-meta">
        رقم الفاتورة: <strong style="color:#c9a84c">${inv.invoice_number}</strong><br>
        التاريخ: ${date}<br>
        <span class="status-badge">${statusLabel}</span>
      </div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <div class="info-label">معلومات العميل</div>
      <div class="info-name">${clientName}</div>
      <div class="info-row">📞 ${clientPhone}</div>
      ${clientEmail !== "—" ? `<div class="info-row">✉️ ${clientEmail}</div>` : ""}
    </div>
    <div class="info-box info-box-2">
      <div class="info-label">تفاصيل الخدمة</div>
      <div class="info-name">${serviceName}</div>
      <div class="info-row">رقم الطلب: <strong>${reqNumber}</strong></div>
      <div class="info-row">طريقة الدفع: ${paymentLabel}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr><th>الوصف</th><th>الكمية</th><th>المبلغ</th></tr>
    </thead>
    <tbody>
      <tr><td>${serviceName}</td><td style="text-align:center">1</td><td>$${Number(inv.amount).toLocaleString()} USD</td></tr>
    </tbody>
    <tfoot>
      <tr><td colspan="2" style="text-align:right;font-size:15px">الإجمالي</td><td>$${Number(inv.amount).toLocaleString()} USD</td></tr>
    </tfoot>
  </table>

  <div style="border:1px solid #eee;border-radius:8px;padding:14px 20px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;font-size:14px;">
    <span style="color:#888">طريقة الدفع</span>
    <strong>${paymentLabel}</strong>
  </div>

  ${inv.notes ? `<div style="border:1px solid #eee;border-radius:8px;padding:14px 16px;margin-bottom:24px;font-size:14px;color:#555"><strong>ملاحظات:</strong> ${inv.notes}</div>` : ""}

  <div class="footer">
    <div class="footer-info">
      <div class="footer-logo">ALKOWN GLOBAL</div>
      <div style="color:#c9a84c;font-size:13px;font-weight:700;margin-bottom:2px">بوابتك نحو العالم</div>
      <div>🌐 www.alkownglobal.com</div>
      <div>✉️ info@alkowngroup.com | 📞 +90 534 764 1249</div>
      <div>📍 إسطنبول · دبي · حلب</div>
      <div style="margin-top:8px;font-size:11px;color:#aaa">هذه الفاتورة وثيقة رسمية صادرة عن Alkown Global</div>
    </div>
    <div style="text-align:center">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(verifyUrl)}" width="100" height="100" alt="QR" />
      <div class="qr-label">امسح للتحقق</div>
    </div>
  </div>
</div>
<script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

    const win = window.open("", "_blank", "width=900,height=700");
    win.document.write(html);
    win.document.close();
  }

  const totalPaid = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + Number(i.amount), 0);
  const totalPending = invoices.filter(i => i.status === "Pending").reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div style={pageStyle}>

      <div className="no-print">
        <Header />
        {error && <Alert message={error} />}

        {/* إحصائيات */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          <StatCard label="إجمالي الفواتير" value={invoices.length} color={CRM_COLORS.goldDark} />
          <StatCard label="المدفوع" value={`$${totalPaid.toLocaleString()}`} color={CRM_COLORS.success} />
          <StatCard label="المعلّق" value={`$${totalPending.toLocaleString()}`} color="#c28a25" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(300px,.7fr)", gap: 22 }}>
          {/* الجدول */}
          <section style={{ ...cardStyle, padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <span style={{ color: CRM_COLORS.muted, fontSize: 14 }}>{invoices.length} فاتورة</span>
              <button style={outlineButtonStyle} onClick={loadData}>تحديث</button>
            </div>
            {loading ? <p style={{ color: CRM_COLORS.muted }}>جارٍ التحميل...</p> : (
              <div style={{ overflowX: "auto" }}>
                <table width="100%" cellPadding="12" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "right", color: CRM_COLORS.muted, borderBottom: `1px solid ${CRM_COLORS.border}`, fontSize: 12, textTransform: "uppercase" }}>
                      <th>رقم الفاتورة</th><th>العميل</th><th>المبلغ</th><th>الحالة</th><th>الدفع</th><th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id} style={{ borderBottom: `1px solid ${CRM_COLORS.border}`, background: selected?.id === inv.id ? `${CRM_COLORS.gold}08` : "transparent" }}>
                        <td style={{ fontWeight: 700, color: CRM_COLORS.goldDark, fontSize: 13 }}>{inv.invoice_number || inv.id.slice(0, 8)}</td>
                        <td style={{ fontSize: 13 }}>{inv.requests?.clients?.full_name || "—"}</td>
                        <td style={{ fontWeight: 700 }}>${Number(inv.amount).toLocaleString()} <span style={{ color: CRM_COLORS.muted, fontSize: 11 }}>USD</span></td>
                        <td>
                          <span style={{ background: STATUS_BG[inv.status], color: STATUS_COLORS[inv.status], padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                            {STATUS_AR[inv.status] || inv.status}
                          </span>
                        </td>
                        <td style={{ color: CRM_COLORS.muted, fontSize: 12 }}>{PAYMENT_AR[inv.payment_method] || "—"}</td>
                        <td>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <button style={outlineButtonStyle} onClick={() => editInvoice(inv)}>تعديل</button>
                            <button style={{ ...outlineButtonStyle, color: inv.status === "Paid" ? "#c28a25" : CRM_COLORS.success }} onClick={() => toggleStatus(inv)}>
                              {inv.status === "Paid" ? "إلغاء الدفع" : "دفعت"}
                            </button>
                            <button style={{ ...outlineButtonStyle, color: CRM_COLORS.info || "#3d6f9f" }} onClick={() => handlePrint(inv)}>🖨️</button>
                            <button style={{ ...outlineButtonStyle, color: CRM_COLORS.danger }} onClick={() => deleteInvoice(inv)}>حذف</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!invoices.length && (
                      <tr><td colSpan="6" style={{ color: CRM_COLORS.muted, textAlign: "center", padding: 40 }}>لا توجد فواتير.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* الفورم */}
          <aside>
            <section style={{ ...cardStyle, padding: 22 }}>
              <h2 style={{ marginTop: 0, fontSize: 18 }}>{selected ? "تعديل الفاتورة" : "فاتورة جديدة"}</h2>
              <form onSubmit={saveInvoice} style={{ display: "grid", gap: 12 }}>
                <select value={form.request_id} onChange={e => handleRequestChange(e.target.value)} style={inputStyle}>
                  <option value="">اختر الطلب (اختياري)</option>
                  {requests.map(r => (
                    <option key={r.id} value={r.id}>{r.request_number} — {r.clients?.full_name || "عميل"}</option>
                  ))}
                </select>
                <select value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))} style={inputStyle}>
                  <option value="">اختر العميل</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
                <input type="number" placeholder="المبلغ (USD)" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={inputStyle} />
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inputStyle}>
                  {INVOICE_STATUSES.map(s => <option key={s} value={s}>{STATUS_AR[s]}</option>)}
                </select>
                <select value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))} style={inputStyle}>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{PAYMENT_AR[m]}</option>)}
                </select>
                <textarea placeholder="ملاحظات" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inputStyle, resize: "vertical" }} />
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="submit" style={buttonStyle} disabled={saving}>
                    {saving ? "جارٍ الحفظ..." : selected ? "حفظ التعديلات" : "إنشاء الفاتورة"}
                  </button>
                  {selected && <button type="button" style={outlineButtonStyle} onClick={resetForm}>جديد</button>}
                </div>
              </form>
            </section>

            {selected && (
              <section style={{ ...cardStyle, padding: 22, marginTop: 18 }}>
                <h2 style={{ marginTop: 0, fontSize: 17 }}>تفاصيل الفاتورة</h2>
                <Detail label="رقم الفاتورة" value={selected.invoice_number} />
                <Detail label="العميل" value={selected.requests?.clients?.full_name} />
                <Detail label="الخدمة" value={selected.requests?.services?.name} />
                <Detail label="المبلغ" value={`$${Number(selected.amount).toLocaleString()} USD`} />
                <Detail label="الحالة" value={STATUS_AR[selected.status]} />
                <Detail label="طريقة الدفع" value={PAYMENT_AR[selected.payment_method]} />
                <Detail label="ملاحظات" value={selected.notes} />
                <Detail label="تاريخ الإنشاء" value={formatDate(selected.created_at)} />
                <button style={{ ...buttonStyle, marginTop: 16, width: "100%" }} onClick={() => handlePrint(selected)}>
                  🖨️ طباعة الفاتورة
                </button>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ ...cardStyle, padding: "18px 22px" }}>
      <div style={{ color: CRM_COLORS.muted, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

function Header() {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ color: CRM_COLORS.goldDark, letterSpacing: ".22em", textTransform: "uppercase", fontSize: 11 }}>Alkown Global CRM</div>
      <h1 style={{ margin: "6px 0", fontSize: 32 }}>الفواتير</h1>
      <p style={{ color: CRM_COLORS.muted, margin: 0 }}>إدارة فواتير العملاء وتتبّع المدفوعات.</p>
    </div>
  );
}

function Alert({ message }) {
  return (
    <div style={{ ...cardStyle, borderColor: "rgba(185,74,72,.35)", color: CRM_COLORS.danger, padding: 14, marginBottom: 18 }}>
      {message}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div style={{ borderBottom: `1px solid ${CRM_COLORS.border}`, padding: "10px 0" }}>
      <div style={{ color: CRM_COLORS.muted, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ marginTop: 4 }}>{value || "-"}</div>
    </div>
  );
}
