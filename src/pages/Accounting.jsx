import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  CRM_COLORS, buttonStyle, cardStyle, formatDate,
  inputStyle, outlineButtonStyle, pageStyle,
} from "../components/crmUi";
import {
  fetchInvoices, createInvoice, updateInvoice, deleteInvoice,
  fetchPayments, recordPayment, deletePayment,
  fetchExpenses, createExpense, deleteExpense,
  computeDashboard, clientFinancials,
} from "../lib/accounting";

// ─── Constants ────────────────────────────────────────────────────────────────
const INVOICE_STATUSES = ["Draft","Sent","Paid","Partially Paid","Overdue"];
const PAYMENT_METHODS  = ["Cash","Bank Transfer","Card","Online Payment"];
const EXPENSE_CATS     = ["Embassy Fees","Courier","Translation","Medical","Marketing","Operations"];

const STATUS_COLOR = {
  Draft:           "#888",
  Sent:            "#4a90d9",
  Paid:            CRM_COLORS.success,
  "Partially Paid":"#c28a25",
  Overdue:         CRM_COLORS.danger,
};
const STATUS_AR = {
  Draft:           "مسودة",
  Sent:            "مُرسلة",
  Paid:            "مدفوعة",
  "Partially Paid":"مدفوعة جزئياً",
  Overdue:         "متأخرة",
};
const METHOD_AR = {
  Cash:            "نقداً",
  "Bank Transfer": "تحويل بنكي",
  Card:            "بطاقة",
  "Online Payment":"دفع إلكتروني",
};
const CAT_AR = {
  "Embassy Fees":  "رسوم سفارة",
  Courier:         "بريد سريع",
  Translation:     "ترجمة",
  Medical:         "طبي",
  Marketing:       "تسويق",
  Operations:      "عمليات",
};
const TABS = ["dashboard","invoices","payments","expenses","reports"];
const TAB_AR = {
  dashboard: "📊 لوحة المحاسبة",
  invoices:  "🧾 الفواتير",
  payments:  "💰 المدفوعات",
  expenses:  "📤 المصاريف",
  reports:   "📈 التقارير",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = n => Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const USD = v => `$ ${fmt(v)}`;
const today = () => new Date().toISOString().slice(0, 10);

function StatusBadge({ status }) {
  return (
    <span style={{
      display:"inline-block", padding:"2px 10px", borderRadius:20, fontSize:".75rem", fontWeight:700,
      background: STATUS_COLOR[status] + "22",
      color: STATUS_COLOR[status],
      border: `1px solid ${STATUS_COLOR[status]}44`,
    }}>
      {STATUS_AR[status] || status}
    </span>
  );
}

function SummaryCard({ label, value, accent, sub }) {
  return (
    <div style={{
      ...cardStyle,
      flex:"1 1 200px", minWidth:180,
      borderTop:`3px solid ${accent}`,
      textAlign:"center",
    }}>
      <div style={{ color: CRM_COLORS.textMuted, fontSize:".8rem", marginBottom:4 }}>{label}</div>
      <div style={{ color: accent, fontSize:"1.55rem", fontWeight:800 }}>{value}</div>
      {sub && <div style={{ color: CRM_COLORS.textMuted, fontSize:".72rem", marginTop:4 }}>{sub}</div>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Accounting() {
  const [tab, setTab]           = useState("dashboard");
  const [invoices,  setInvoices]  = useState([]);
  const [payments,  setPayments]  = useState([]);
  const [expenses,  setExpenses]  = useState([]);
  const [clients,   setClients]   = useState([]);
  const [requests,  setRequests]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true); setError("");
    try {
      const [inv, pay, exp, cli, req] = await Promise.all([
        fetchInvoices(),
        fetchPayments(),
        fetchExpenses(),
        supabase.from("clients").select("id, full_name").order("full_name").then(r => r.data || []),
        supabase.from("requests").select("id, request_number, client_id, clients(full_name), services(name)").order("created_at", { ascending: false }).then(r => r.data || []),
      ]);
      setInvoices(inv); setPayments(pay); setExpenses(exp); setClients(cli); setRequests(req);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  const dashboard = computeDashboard(invoices, expenses);

  return (
    <div style={{ ...pageStyle, direction:"rtl", fontFamily:"'Cairo','Noto Naskh Arabic',sans-serif" }}>
      <h2 style={{ color: CRM_COLORS.gold, fontWeight:800, fontSize:"1.4rem", marginBottom:16 }}>
        💼 المحاسبة المالية
      </h2>

      {error && (
        <div style={{ background:"rgba(185,74,72,.12)", border:"1px solid rgba(185,74,72,.3)", color:"#e07070",
          borderRadius:8, padding:"10px 16px", marginBottom:12, fontSize:".85rem" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Tab Bar */}
      <div style={{ display:"flex", gap:4, marginBottom:20, borderBottom:`1px solid ${CRM_COLORS.border}`, paddingBottom:0 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background:"none", border:"none", cursor:"pointer",
            padding:"10px 18px", fontSize:".85rem", fontWeight: tab===t ? 800 : 500,
            color: tab===t ? CRM_COLORS.gold : CRM_COLORS.textMuted,
            borderBottom: tab===t ? `2px solid ${CRM_COLORS.gold}` : "2px solid transparent",
            fontFamily:"inherit", whiteSpace:"nowrap",
          }}>
            {TAB_AR[t]}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:"center", color: CRM_COLORS.textMuted, padding:40 }}>جار التحميل…</div>
      ) : (
        <>
          {tab === "dashboard" && <DashboardTab dashboard={dashboard} invoices={invoices} expenses={expenses} clients={clients} />}
          {tab === "invoices"  && <InvoicesTab  invoices={invoices}  clients={clients}  requests={requests} reload={loadAll} setError={setError} />}
          {tab === "payments"  && <PaymentsTab  payments={payments}  invoices={invoices} clients={clients} reload={loadAll} setError={setError} />}
          {tab === "expenses"  && <ExpensesTab  expenses={expenses}  reload={loadAll} setError={setError} />}
          {tab === "reports"   && <ReportsTab   invoices={invoices}  payments={payments} expenses={expenses} />}
        </>
      )}
    </div>
  );
}

// ─── Dashboard Tab ─────────────────────────────────────────────────────────────
function DashboardTab({ dashboard, invoices, clients }) {
  const overdue = invoices.filter(i => i.status === "Overdue" || (i.status !== "Paid" && i.due_date && i.due_date < today()));
  const recent  = invoices.slice(0, 6);

  return (
    <div>
      {/* Summary Cards */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:14, marginBottom:24 }}>
        <SummaryCard label="إجمالي الإيرادات"    value={USD(dashboard.totalRevenue)}  accent={CRM_COLORS.gold}    />
        <SummaryCard label="إجمالي المصاريف"      value={USD(dashboard.totalExpenses)} accent={CRM_COLORS.danger}  />
        <SummaryCard label="الفواتير المعلّقة"    value={USD(dashboard.outstanding)}   accent="#4a90d9"            />
        <SummaryCard label="صافي ربح الشهر"       value={USD(dashboard.monthProfit)}   accent={dashboard.monthProfit >= 0 ? CRM_COLORS.success : CRM_COLORS.danger} sub="تقديري" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Recent Invoices */}
        <div style={cardStyle}>
          <h3 style={{ color: CRM_COLORS.gold, fontSize:".95rem", fontWeight:700, marginBottom:12 }}>🧾 آخر الفواتير</h3>
          {recent.length === 0 ? <Empty /> : recent.map(inv => (
            <div key={inv.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"8px 0", borderBottom:`1px solid ${CRM_COLORS.border}` }}>
              <div>
                <div style={{ fontWeight:700, fontSize:".85rem", color: CRM_COLORS.text }}>{inv.invoice_number}</div>
                <div style={{ fontSize:".75rem", color: CRM_COLORS.textMuted }}>{inv.clients?.full_name || "—"}</div>
              </div>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontWeight:700, color: CRM_COLORS.gold, fontSize:".85rem" }}>{USD(inv.amount)}</div>
                <StatusBadge status={inv.status} />
              </div>
            </div>
          ))}
        </div>

        {/* Overdue */}
        <div style={cardStyle}>
          <h3 style={{ color: CRM_COLORS.danger, fontSize:".95rem", fontWeight:700, marginBottom:12 }}>⚠️ فواتير متأخرة ({overdue.length})</h3>
          {overdue.length === 0
            ? <div style={{ color: CRM_COLORS.success, fontSize:".85rem" }}>✅ لا توجد فواتير متأخرة</div>
            : overdue.slice(0,6).map(inv => (
              <div key={inv.id} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0",
                borderBottom:`1px solid ${CRM_COLORS.border}` }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:".83rem", color: CRM_COLORS.text }}>{inv.clients?.full_name || "—"}</div>
                  <div style={{ fontSize:".72rem", color: CRM_COLORS.textMuted }}>{inv.service_name}</div>
                </div>
                <div style={{ color: CRM_COLORS.danger, fontWeight:800, fontSize:".85rem" }}>
                  {USD(Number(inv.amount) - Number(inv.paid_amount || 0))}
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Client Financial Overview */}
      {clients.length > 0 && (
        <div style={{ ...cardStyle, marginTop:16 }}>
          <h3 style={{ color: CRM_COLORS.gold, fontSize:".95rem", fontWeight:700, marginBottom:12 }}>👥 ملخص العملاء المالي</h3>
          <ClientFinancialTable invoices={invoices} clients={clients} />
        </div>
      )}
    </div>
  );
}

function ClientFinancialTable({ invoices, clients }) {
  const rows = clients
    .map(c => ({ ...c, ...clientFinancials(invoices, c.id) }))
    .filter(r => r.invoiceCount > 0)
    .sort((a,b) => b.balance - a.balance);

  if (rows.length === 0) return <Empty />;

  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:".82rem" }}>
        <thead>
          <tr style={{ borderBottom:`1px solid ${CRM_COLORS.border}` }}>
            {["العميل","عدد الفواتير","إجمالي الفواتير","المدفوع","الرصيد المتبقي"].map(h => (
              <th key={h} style={{ padding:"6px 10px", color: CRM_COLORS.textMuted, fontWeight:600, textAlign:"right" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} style={{ borderBottom:`1px solid ${CRM_COLORS.border}` }}>
              <td style={{ padding:"7px 10px", fontWeight:700, color: CRM_COLORS.text }}>{r.full_name}</td>
              <td style={{ padding:"7px 10px", color: CRM_COLORS.textMuted }}>{r.invoiceCount}</td>
              <td style={{ padding:"7px 10px", color: CRM_COLORS.text }}>{USD(r.totalInvoiced)}</td>
              <td style={{ padding:"7px 10px", color: CRM_COLORS.success }}>{USD(r.totalPaid)}</td>
              <td style={{ padding:"7px 10px", fontWeight:800, color: r.balance > 0 ? CRM_COLORS.danger : CRM_COLORS.success }}>
                {USD(r.balance)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Invoices Tab ──────────────────────────────────────────────────────────────
const emptyInv = { client_id:"", request_id:"", service_name:"", description:"", amount:"", due_date:"", status:"Draft", notes:"" };

function InvoicesTab({ invoices, clients, requests, reload, setError }) {
  const [form,    setForm]    = useState(emptyInv);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [filter,  setFilter]  = useState("all");
  const [search,  setSearch]  = useState("");

  function handleRequestSelect(reqId) {
    const req = requests.find(r => r.id === reqId);
    setForm(f => ({
      ...f,
      request_id:   reqId,
      client_id:    req?.client_id || f.client_id,
      service_name: req?.services?.name || f.service_name,
    }));
  }

  function startEdit(inv) {
    setEditing(inv);
    setForm({
      client_id:   inv.client_id || "",
      request_id:  inv.request_id || "",
      service_name:inv.service_name || "",
      description: inv.description || "",
      amount:      inv.amount ?? "",
      due_date:    inv.due_date || "",
      status:      inv.status || "Draft",
      notes:       inv.notes || "",
    });
  }

  function reset() { setEditing(null); setForm(emptyInv); }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.service_name || !form.amount) { setError("اسم الخدمة والمبلغ مطلوبان."); return; }
    setSaving(true); setError("");
    try {
      const payload = {
        client_id:    form.client_id || null,
        request_id:   form.request_id || null,
        service_name: form.service_name,
        description:  form.description,
        amount:       Number(form.amount),
        due_date:     form.due_date || null,
        status:       form.status,
        notes:        form.notes,
      };
      if (editing) await updateInvoice(editing.id, payload);
      else         await createInvoice(payload);
      reset(); await reload();
    } catch (e) { setError(e.message); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("حذف هذه الفاتورة؟")) return;
    try { await deleteInvoice(id); await reload(); }
    catch (e) { setError(e.message); }
  }

  function handlePrint(inv) {
    const clientName  = inv.clients?.full_name || "—";
    const clientPhone = inv.clients?.phone     || "—";
    const clientEmail = inv.clients?.email     || "—";
    const reqNumber   = inv.requests?.request_number || "—";
    const date = new Date(inv.created_at).toLocaleDateString("ar-SA", { year:"numeric", month:"long", day:"numeric" });
    const verifyUrl = `https://www.alkownglobal.com/verify-invoice?inv=${inv.invoice_number}&amt=${inv.amount}&client=${encodeURIComponent(clientName)}&date=${new Date(inv.created_at).toISOString().split("T")[0]}`;

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>فاتورة ${inv.invoice_number}</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Segoe UI',Arial,sans-serif; color:#1a1a1a; background:#fff; direction:rtl; }
  .page { max-width:780px; margin:0 auto; padding:40px 48px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #c9a84c; padding-bottom:24px; margin-bottom:32px; }
  .logo-sub { color:#888; font-size:12px; margin-top:8px; line-height:1.9; }
  .inv-title { font-size:26px; font-weight:900; text-align:left; }
  .inv-meta { font-size:13px; color:#555; text-align:left; margin-top:8px; line-height:2; }
  .status-badge { display:inline-block; padding:4px 12px; border-radius:4px; font-weight:700; font-size:12px; background:${inv.status==="Paid"?"#d4edda":"#fff3cd"}; color:${inv.status==="Paid"?"#155724":"#856404"}; }
  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:32px; }
  .info-box { background:#f8f6f2; border-radius:8px; padding:18px 20px; border-right:4px solid #c9a84c; }
  .info-box-2 { border-right-color:#1a1a1a; }
  .info-label { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#888; margin-bottom:10px; }
  .info-name { font-weight:800; font-size:16px; margin-bottom:4px; }
  .info-row { color:#555; font-size:13px; margin-bottom:2px; }
  table { width:100%; border-collapse:collapse; margin-bottom:28px; }
  thead tr { background:#1a1a1a; color:#fff; }
  th { padding:12px 16px; font-size:13px; }
  th:first-child { text-align:right; } th:last-child { text-align:left; } th:nth-child(2) { text-align:center; }
  td { padding:14px 16px; font-size:14px; border-bottom:1px solid #eee; }
  td:first-child { text-align:right; } td:last-child { text-align:left; font-weight:700; } td:nth-child(2) { text-align:center; }
  tfoot tr { background:#f8f6f2; }
  tfoot td { font-weight:900; font-size:17px; }
  tfoot td:last-child { color:#c9a84c; }
  .footer { border-top:2px solid #c9a84c; padding-top:24px; display:flex; justify-content:space-between; align-items:flex-end; margin-top:24px; }
  .footer-info { font-size:12px; color:#888; line-height:1.9; }
  .qr-label { font-size:10px; color:#888; text-align:center; margin-top:4px; }
  @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <img src="/logo.png" alt="Alkown Global" style="height:64px;display:block;object-fit:contain;margin-bottom:6px" onerror="this.style.display='none'" />
      <div style="font-size:13px;color:#c9a84c;font-weight:700;letter-spacing:1px">بوابتك نحو العالم</div>
      <div class="logo-sub">
        🌐 www.alkownglobal.com<br>
        ✉️ info@alkownglobal.com<br>
        📞 +90 534 764 1249<br>
        📞 +971 54 490 9522<br>
        📞 +963 980 631 952<br>
        📍 إسطنبول · دبي · حلب
      </div>
    </div>
    <div>
      <div class="inv-title">فاتورة</div>
      <div class="inv-meta">
        رقم الفاتورة: <strong style="color:#c9a84c">${inv.invoice_number}</strong><br>
        التاريخ: ${date}<br>
        <span class="status-badge">${STATUS_AR[inv.status] || inv.status}</span>
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
      <div class="info-name">${inv.service_name || "—"}</div>
      ${reqNumber !== "—" ? `<div class="info-row">رقم الطلب: <strong>${reqNumber}</strong></div>` : ""}
      ${inv.due_date ? `<div class="info-row">تاريخ الاستحقاق: ${inv.due_date}</div>` : ""}
    </div>
  </div>

  <table>
    <thead><tr><th>الوصف</th><th>الكمية</th><th>المبلغ</th></tr></thead>
    <tbody>
      <tr>
        <td>${inv.service_name || "—"}${inv.description ? `<br><small style="color:#888">${inv.description}</small>` : ""}</td>
        <td style="text-align:center">1</td>
        <td>$${Number(inv.amount).toLocaleString("en-US", {minimumFractionDigits:2})} USD</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2" style="text-align:right;font-size:15px">الإجمالي</td>
        <td>$${Number(inv.amount).toLocaleString("en-US", {minimumFractionDigits:2})} USD</td>
      </tr>
      ${Number(inv.paid_amount) > 0 ? `
      <tr>
        <td colspan="2" style="text-align:right;font-size:13px;color:#888">المدفوع</td>
        <td style="color:#155724;font-size:15px">$${Number(inv.paid_amount).toLocaleString("en-US", {minimumFractionDigits:2})} USD</td>
      </tr>
      <tr>
        <td colspan="2" style="text-align:right;font-size:13px;color:#888">المتبقي</td>
        <td style="color:#c9a84c;font-size:15px">$${(Number(inv.amount)-Number(inv.paid_amount)).toLocaleString("en-US", {minimumFractionDigits:2})} USD</td>
      </tr>` : ""}
    </tfoot>
  </table>

  ${inv.notes ? `<div style="border:1px solid #eee;border-radius:8px;padding:14px 16px;margin-bottom:24px;font-size:14px;color:#555"><strong>ملاحظات:</strong> ${inv.notes}</div>` : ""}

  <div class="footer">
    <div class="footer-info">
      <div style="font-size:11px;color:#aaa">هذه الفاتورة وثيقة رسمية صادرة عن Alkown Global · www.alkownglobal.com</div>
    </div>
    <div style="text-align:center">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(verifyUrl)}" width="90" height="90" alt="QR" />
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

  const filtered = invoices
    .filter(i => filter === "all" || i.status === filter)
    .filter(i => !search || i.invoice_number?.includes(search) || i.clients?.full_name?.includes(search) || i.service_name?.includes(search));

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:16, alignItems:"start" }}>
      {/* List */}
      <div style={cardStyle}>
        <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
          <input
            placeholder="🔍 بحث…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, flex:1, minWidth:150 }}
          />
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...inputStyle, width:"auto" }}>
            <option value="all">كل الحالات</option>
            {INVOICE_STATUSES.map(s => <option key={s} value={s}>{STATUS_AR[s]}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? <Empty /> : filtered.map(inv => (
          <div key={inv.id} style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"10px 0", borderBottom:`1px solid ${CRM_COLORS.border}`,
          }}>
            <div>
              <div style={{ fontWeight:700, color: CRM_COLORS.text, fontSize:".88rem" }}>{inv.invoice_number}</div>
              <div style={{ fontSize:".78rem", color: CRM_COLORS.textMuted }}>{inv.clients?.full_name || "—"} · {inv.service_name}</div>
              {inv.due_date && (
                <div style={{ fontSize:".72rem", color: inv.due_date < today() && inv.status !== "Paid" ? CRM_COLORS.danger : CRM_COLORS.textMuted }}>
                  استحقاق: {formatDate(inv.due_date)}
                </div>
              )}
            </div>
            <div style={{ textAlign:"left", display:"flex", flexDirection:"column", gap:4, alignItems:"flex-end" }}>
              <div style={{ fontWeight:800, color: CRM_COLORS.gold }}>{USD(inv.amount)}</div>
              {inv.paid_amount > 0 && inv.paid_amount < inv.amount && (
                <div style={{ fontSize:".72rem", color: CRM_COLORS.textMuted }}>مدفوع: {USD(inv.paid_amount)}</div>
              )}
              <StatusBadge status={inv.status} />
              <div style={{ display:"flex", gap:6, marginTop:4 }}>
                <button onClick={() => startEdit(inv)} style={{ ...outlineButtonStyle, padding:"3px 10px", fontSize:".72rem" }}>تعديل</button>
                <button onClick={() => handlePrint(inv)} style={{ ...outlineButtonStyle, padding:"3px 10px", fontSize:".72rem" }}>🖨️</button>
                <button onClick={() => handleDelete(inv.id)} style={{ ...outlineButtonStyle, padding:"3px 10px", fontSize:".72rem", borderColor: CRM_COLORS.danger, color: CRM_COLORS.danger }}>حذف</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div style={{ ...cardStyle, position:"sticky", top:16 }}>
        <h3 style={{ color: CRM_COLORS.gold, fontWeight:700, marginBottom:14, fontSize:".95rem" }}>
          {editing ? "✏️ تعديل فاتورة" : "➕ فاتورة جديدة"}
        </h3>
        <form onSubmit={handleSave} style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {/* Optional: link to an existing request (auto-fills client + service) */}
          {requests.length > 0 && (
            <select value={form.request_id} onChange={e => handleRequestSelect(e.target.value)} style={{ ...inputStyle, fontSize:".8rem" }}>
              <option value="">— ربط بطلب موجود (اختياري) —</option>
              {requests.map(r => (
                <option key={r.id} value={r.id}>
                  {r.request_number} · {r.clients?.full_name || "—"} {r.services?.name ? `· ${r.services.name}` : ""}
                </option>
              ))}
            </select>
          )}
          <select value={form.client_id} onChange={e => setForm(f => ({...f, client_id: e.target.value}))} style={inputStyle}>
            <option value="">— اختر عميلاً —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </select>
          <input required placeholder="اسم الخدمة *" value={form.service_name}
            onChange={e => setForm(f => ({...f, service_name: e.target.value}))} style={inputStyle} />
          <textarea placeholder="وصف اختياري" value={form.description}
            onChange={e => setForm(f => ({...f, description: e.target.value}))}
            style={{ ...inputStyle, minHeight:60, resize:"vertical" }} />
          <input required type="number" min="0" step="0.01" placeholder="المبلغ ($) *" value={form.amount}
            onChange={e => setForm(f => ({...f, amount: e.target.value}))} style={inputStyle} />
          <input type="date" placeholder="تاريخ الاستحقاق" value={form.due_date}
            onChange={e => setForm(f => ({...f, due_date: e.target.value}))} style={inputStyle} />
          <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} style={inputStyle}>
            {INVOICE_STATUSES.map(s => <option key={s} value={s}>{STATUS_AR[s]}</option>)}
          </select>
          <textarea placeholder="ملاحظات" value={form.notes}
            onChange={e => setForm(f => ({...f, notes: e.target.value}))}
            style={{ ...inputStyle, minHeight:50, resize:"vertical" }} />
          <div style={{ display:"flex", gap:8 }}>
            <button type="submit" disabled={saving} style={{ ...buttonStyle, flex:1 }}>
              {saving ? "جار الحفظ…" : editing ? "حفظ التعديلات" : "إنشاء الفاتورة"}
            </button>
            {editing && (
              <button type="button" onClick={reset} style={{ ...outlineButtonStyle, flex:1 }}>إلغاء</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Payments Tab ──────────────────────────────────────────────────────────────
const emptyPay = { invoice_id:"", client_id:"", amount:"", payment_date: today(), method:"Cash", reference:"", notes:"" };

function PaymentsTab({ payments, invoices, clients, reload, setError }) {
  const [form,   setForm]   = useState(emptyPay);
  const [saving, setSaving] = useState(false);

  const unpaidInvoices = invoices.filter(i => ["Sent","Partially Paid","Overdue"].includes(i.status));

  function handleInvoiceSelect(invId) {
    const inv = invoices.find(i => i.id === invId);
    setForm(f => ({
      ...f,
      invoice_id: invId,
      client_id: inv?.client_id || "",
      amount: inv ? String(Number(inv.amount) - Number(inv.paid_amount || 0)) : "",
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.invoice_id || !form.amount) { setError("الفاتورة والمبلغ مطلوبان."); return; }
    setSaving(true); setError("");
    try {
      await recordPayment({
        invoice_id:   form.invoice_id,
        client_id:    form.client_id || null,
        amount:       Number(form.amount),
        payment_date: form.payment_date,
        method:       form.method,
        reference:    form.reference,
        notes:        form.notes,
      });
      setForm(emptyPay); await reload();
    } catch (e) { setError(e.message); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("حذف هذا الدفع؟ لن يتم تعديل رصيد الفاتورة تلقائياً.")) return;
    try { await deletePayment(id); await reload(); }
    catch (e) { setError(e.message); }
  }

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:16, alignItems:"start" }}>
      {/* List */}
      <div style={cardStyle}>
        <h3 style={{ color: CRM_COLORS.gold, fontSize:".9rem", fontWeight:700, marginBottom:12 }}>سجل المدفوعات ({payments.length})</h3>
        {payments.length === 0 ? <Empty /> : payments.map(p => (
          <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"9px 0", borderBottom:`1px solid ${CRM_COLORS.border}` }}>
            <div>
              <div style={{ fontWeight:700, fontSize:".85rem", color: CRM_COLORS.text }}>
                {p.acc_invoices?.invoice_number || "—"}
              </div>
              <div style={{ fontSize:".75rem", color: CRM_COLORS.textMuted }}>
                {p.clients?.full_name || "—"} · {METHOD_AR[p.method] || p.method}
              </div>
              <div style={{ fontSize:".72rem", color: CRM_COLORS.textMuted }}>{formatDate(p.payment_date)}</div>
              {p.reference && <div style={{ fontSize:".7rem", color: CRM_COLORS.textMuted }}>مرجع: {p.reference}</div>}
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
              <div style={{ fontWeight:800, color: CRM_COLORS.success, fontSize:".9rem" }}>{USD(p.amount)}</div>
              <button onClick={() => handleDelete(p.id)} style={{ ...outlineButtonStyle, padding:"3px 10px", fontSize:".7rem", borderColor: CRM_COLORS.danger, color: CRM_COLORS.danger }}>حذف</button>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div style={{ ...cardStyle, position:"sticky", top:16 }}>
        <h3 style={{ color: CRM_COLORS.gold, fontWeight:700, marginBottom:14, fontSize:".95rem" }}>💰 تسجيل دفعة</h3>
        <form onSubmit={handleSave} style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <select required value={form.invoice_id} onChange={e => handleInvoiceSelect(e.target.value)} style={inputStyle}>
            <option value="">— اختر فاتورة —</option>
            {unpaidInvoices.map(i => (
              <option key={i.id} value={i.id}>
                {i.invoice_number} · {i.clients?.full_name || "—"} · {USD(Number(i.amount) - Number(i.paid_amount||0))}
              </option>
            ))}
          </select>
          <input required type="number" min="0.01" step="0.01" placeholder="المبلغ المدفوع ($) *" value={form.amount}
            onChange={e => setForm(f => ({...f, amount: e.target.value}))} style={inputStyle} />
          <input required type="date" value={form.payment_date}
            onChange={e => setForm(f => ({...f, payment_date: e.target.value}))} style={inputStyle} />
          <select value={form.method} onChange={e => setForm(f => ({...f, method: e.target.value}))} style={inputStyle}>
            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{METHOD_AR[m]}</option>)}
          </select>
          <input placeholder="رقم مرجعي (اختياري)" value={form.reference}
            onChange={e => setForm(f => ({...f, reference: e.target.value}))} style={inputStyle} />
          <textarea placeholder="ملاحظات" value={form.notes}
            onChange={e => setForm(f => ({...f, notes: e.target.value}))}
            style={{ ...inputStyle, minHeight:50, resize:"vertical" }} />
          <button type="submit" disabled={saving} style={buttonStyle}>
            {saving ? "جار الحفظ…" : "تسجيل الدفعة"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Expenses Tab ──────────────────────────────────────────────────────────────
const emptyExp = { category:"Embassy Fees", description:"", amount:"", expense_date: today(), reference:"", notes:"" };

function ExpensesTab({ expenses, reload, setError }) {
  const [form,    setForm]    = useState(emptyExp);
  const [saving,  setSaving]  = useState(false);
  const [catFilter, setCatFilter] = useState("all");

  async function handleSave(e) {
    e.preventDefault();
    if (!form.description || !form.amount) { setError("الوصف والمبلغ مطلوبان."); return; }
    setSaving(true); setError("");
    try {
      await createExpense({
        category:     form.category,
        description:  form.description,
        amount:       Number(form.amount),
        expense_date: form.expense_date,
        reference:    form.reference,
        notes:        form.notes,
      });
      setForm(emptyExp); await reload();
    } catch (e) { setError(e.message); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("حذف هذا المصروف؟")) return;
    try { await deleteExpense(id); await reload(); }
    catch (e) { setError(e.message); }
  }

  const filtered = catFilter === "all" ? expenses : expenses.filter(e => e.category === catFilter);

  // Category totals for mini chart
  const catTotals = EXPENSE_CATS.map(cat => ({
    cat, total: expenses.filter(e => e.category === cat).reduce((s, e) => s + Number(e.amount), 0),
  })).filter(c => c.total > 0).sort((a,b) => b.total - a.total);
  const maxTotal = catTotals[0]?.total || 1;

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:16, alignItems:"start" }}>
      <div>
        {/* Category Bars */}
        {catTotals.length > 0 && (
          <div style={{ ...cardStyle, marginBottom:14 }}>
            <h3 style={{ color: CRM_COLORS.gold, fontSize:".88rem", fontWeight:700, marginBottom:10 }}>توزيع المصاريف</h3>
            {catTotals.map(({ cat, total }) => (
              <div key={cat} style={{ marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:".78rem", marginBottom:3 }}>
                  <span style={{ color: CRM_COLORS.text }}>{CAT_AR[cat]}</span>
                  <span style={{ color: CRM_COLORS.gold, fontWeight:700 }}>{USD(total)}</span>
                </div>
                <div style={{ height:6, background: CRM_COLORS.border, borderRadius:4 }}>
                  <div style={{ height:6, width:`${(total/maxTotal)*100}%`, background: CRM_COLORS.gold, borderRadius:4, transition:"width .4s" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List */}
        <div style={cardStyle}>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ ...inputStyle, flex:1 }}>
              <option value="all">كل الفئات</option>
              {EXPENSE_CATS.map(c => <option key={c} value={c}>{CAT_AR[c]}</option>)}
            </select>
          </div>
          {filtered.length === 0 ? <Empty /> : filtered.map(exp => (
            <div key={exp.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"9px 0", borderBottom:`1px solid ${CRM_COLORS.border}` }}>
              <div>
                <div style={{ fontWeight:700, fontSize:".85rem", color: CRM_COLORS.text }}>{exp.description}</div>
                <div style={{ fontSize:".75rem", color: CRM_COLORS.textMuted }}>{CAT_AR[exp.category]} · {formatDate(exp.expense_date)}</div>
                {exp.reference && <div style={{ fontSize:".7rem", color: CRM_COLORS.textMuted }}>مرجع: {exp.reference}</div>}
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                <div style={{ fontWeight:800, color: CRM_COLORS.danger, fontSize:".9rem" }}>{USD(exp.amount)}</div>
                <button onClick={() => handleDelete(exp.id)} style={{ ...outlineButtonStyle, padding:"3px 10px", fontSize:".7rem", borderColor: CRM_COLORS.danger, color: CRM_COLORS.danger }}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={{ ...cardStyle, position:"sticky", top:16 }}>
        <h3 style={{ color: CRM_COLORS.gold, fontWeight:700, marginBottom:14, fontSize:".95rem" }}>📤 تسجيل مصروف</h3>
        <form onSubmit={handleSave} style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} style={inputStyle}>
            {EXPENSE_CATS.map(c => <option key={c} value={c}>{CAT_AR[c]}</option>)}
          </select>
          <input required placeholder="الوصف *" value={form.description}
            onChange={e => setForm(f => ({...f, description: e.target.value}))} style={inputStyle} />
          <input required type="number" min="0.01" step="0.01" placeholder="المبلغ ($) *" value={form.amount}
            onChange={e => setForm(f => ({...f, amount: e.target.value}))} style={inputStyle} />
          <input required type="date" value={form.expense_date}
            onChange={e => setForm(f => ({...f, expense_date: e.target.value}))} style={inputStyle} />
          <input placeholder="رقم مرجعي (فاتورة، إيصال…)" value={form.reference}
            onChange={e => setForm(f => ({...f, reference: e.target.value}))} style={inputStyle} />
          <textarea placeholder="ملاحظات" value={form.notes}
            onChange={e => setForm(f => ({...f, notes: e.target.value}))}
            style={{ ...inputStyle, minHeight:50, resize:"vertical" }} />
          <button type="submit" disabled={saving} style={buttonStyle}>
            {saving ? "جار الحفظ…" : "حفظ المصروف"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Reports Tab ───────────────────────────────────────────────────────────────
function ReportsTab({ invoices, payments, expenses }) {
  const [period, setPeriod] = useState("month");

  function filterByPeriod(items, dateField) {
    const now = new Date();
    const from = period === "month"
      ? new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10)
      : period === "quarter"
        ? new Date(now.getFullYear(), Math.floor(now.getMonth()/3)*3, 1).toISOString().slice(0,10)
        : new Date(now.getFullYear(), 0, 1).toISOString().slice(0,10);
    return items.filter(i => (i[dateField] || "").slice(0,10) >= from);
  }

  const paidInvoices    = filterByPeriod(invoices.filter(i => i.paid_amount > 0), "updated_at");
  const periodPayments  = filterByPeriod(payments, "payment_date");
  const periodExpenses  = filterByPeriod(expenses, "expense_date");

  const totalRevenue    = periodPayments.reduce((s, p) => s + Number(p.amount), 0);
  const totalExpenses   = periodExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const outstanding     = invoices.filter(i => ["Sent","Partially Paid","Overdue"].includes(i.status));
  const outstandingAmt  = outstanding.reduce((s, i) => s + (Number(i.amount) - Number(i.paid_amount||0)), 0);

  // Revenue by service
  const byService = {};
  paidInvoices.forEach(i => {
    byService[i.service_name] = (byService[i.service_name] || 0) + Number(i.paid_amount || 0);
  });
  const serviceRows = Object.entries(byService).sort((a,b) => b[1]-a[1]);

  // Expenses by category
  const byCat = {};
  periodExpenses.forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + Number(e.amount); });
  const catRows = Object.entries(byCat).sort((a,b) => b[1]-a[1]);

  const PERIOD_AR = { month:"هذا الشهر", quarter:"هذا الربع", year:"هذا العام" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Period Selector */}
      <div style={{ display:"flex", gap:8 }}>
        {["month","quarter","year"].map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{
            ...outlineButtonStyle,
            ...(period===p ? { background: CRM_COLORS.gold, color:"#1a1510", borderColor: CRM_COLORS.gold } : {}),
          }}>
            {PERIOD_AR[p]}
          </button>
        ))}
      </div>

      {/* Summary Row */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
        <SummaryCard label={`الإيرادات · ${PERIOD_AR[period]}`}  value={USD(totalRevenue)}                        accent={CRM_COLORS.gold}    />
        <SummaryCard label={`المصاريف · ${PERIOD_AR[period]}`}   value={USD(totalExpenses)}                       accent={CRM_COLORS.danger}  />
        <SummaryCard label="صافي الربح"                           value={USD(totalRevenue - totalExpenses)}        accent={totalRevenue-totalExpenses >= 0 ? CRM_COLORS.success : CRM_COLORS.danger} />
        <SummaryCard label="مستحقات غير محصّلة"                  value={USD(outstandingAmt)}                      accent="#4a90d9" sub={`${outstanding.length} فاتورة`} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Revenue by Service */}
        <div style={cardStyle}>
          <h3 style={{ color: CRM_COLORS.gold, fontSize:".9rem", fontWeight:700, marginBottom:12 }}>📊 الإيرادات حسب الخدمة</h3>
          {serviceRows.length === 0 ? <Empty label="لا توجد إيرادات في هذه الفترة" /> : (
            <table style={{ width:"100%", fontSize:".82rem", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${CRM_COLORS.border}` }}>
                  <th style={{ padding:"5px 8px", color: CRM_COLORS.textMuted, textAlign:"right", fontWeight:600 }}>الخدمة</th>
                  <th style={{ padding:"5px 8px", color: CRM_COLORS.textMuted, textAlign:"left",  fontWeight:600 }}>المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {serviceRows.map(([svc, amt]) => (
                  <tr key={svc} style={{ borderBottom:`1px solid ${CRM_COLORS.border}` }}>
                    <td style={{ padding:"7px 8px", color: CRM_COLORS.text }}>{svc}</td>
                    <td style={{ padding:"7px 8px", color: CRM_COLORS.gold, fontWeight:700, textAlign:"left" }}>{USD(amt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Expenses by Category */}
        <div style={cardStyle}>
          <h3 style={{ color: CRM_COLORS.danger, fontSize:".9rem", fontWeight:700, marginBottom:12 }}>📤 المصاريف حسب الفئة</h3>
          {catRows.length === 0 ? <Empty label="لا توجد مصاريف في هذه الفترة" /> : (
            <table style={{ width:"100%", fontSize:".82rem", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${CRM_COLORS.border}` }}>
                  <th style={{ padding:"5px 8px", color: CRM_COLORS.textMuted, textAlign:"right", fontWeight:600 }}>الفئة</th>
                  <th style={{ padding:"5px 8px", color: CRM_COLORS.textMuted, textAlign:"left",  fontWeight:600 }}>المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {catRows.map(([cat, amt]) => (
                  <tr key={cat} style={{ borderBottom:`1px solid ${CRM_COLORS.border}` }}>
                    <td style={{ padding:"7px 8px", color: CRM_COLORS.text }}>{CAT_AR[cat] || cat}</td>
                    <td style={{ padding:"7px 8px", color: CRM_COLORS.danger, fontWeight:700, textAlign:"left" }}>{USD(amt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Outstanding Invoices */}
        <div style={{ ...cardStyle, gridColumn:"1 / -1" }}>
          <h3 style={{ color:"#4a90d9", fontSize:".9rem", fontWeight:700, marginBottom:12 }}>
            📋 المستحقات غير المحصّلة ({outstanding.length})
          </h3>
          {outstanding.length === 0 ? <Empty label="لا توجد مستحقات" /> : (
            <table style={{ width:"100%", fontSize:".82rem", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${CRM_COLORS.border}` }}>
                  {["رقم الفاتورة","العميل","الخدمة","إجمالي","مدفوع","المتبقي","الاستحقاق","الحالة"].map(h => (
                    <th key={h} style={{ padding:"5px 8px", color: CRM_COLORS.textMuted, textAlign:"right", fontWeight:600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {outstanding.map(inv => (
                  <tr key={inv.id} style={{ borderBottom:`1px solid ${CRM_COLORS.border}` }}>
                    <td style={{ padding:"7px 8px", color: CRM_COLORS.text, fontWeight:700 }}>{inv.invoice_number}</td>
                    <td style={{ padding:"7px 8px", color: CRM_COLORS.text }}>{inv.clients?.full_name || "—"}</td>
                    <td style={{ padding:"7px 8px", color: CRM_COLORS.textMuted }}>{inv.service_name}</td>
                    <td style={{ padding:"7px 8px", color: CRM_COLORS.gold, fontWeight:700 }}>{USD(inv.amount)}</td>
                    <td style={{ padding:"7px 8px", color: CRM_COLORS.success }}>{USD(inv.paid_amount)}</td>
                    <td style={{ padding:"7px 8px", color: CRM_COLORS.danger, fontWeight:800 }}>{USD(Number(inv.amount) - Number(inv.paid_amount||0))}</td>
                    <td style={{ padding:"7px 8px", color: inv.due_date && inv.due_date < today() ? CRM_COLORS.danger : CRM_COLORS.textMuted }}>
                      {inv.due_date ? formatDate(inv.due_date) : "—"}
                    </td>
                    <td style={{ padding:"7px 8px" }}><StatusBadge status={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function Empty({ label = "لا توجد بيانات" }) {
  return <div style={{ color: CRM_COLORS.textMuted, fontSize:".82rem", padding:"16px 0", textAlign:"center" }}>{label}</div>;
}
