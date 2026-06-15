import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { CRM_COLORS, pageStyle } from "../../components/crmUi";

const CHANNELS = ["email", "whatsapp", "sms", "in_app"];
const CHANNEL_AR = { email: "البريد الإلكتروني", whatsapp: "واتساب", sms: "رسالة نصية", in_app: "داخل التطبيق" };
const CHANNEL_ICON = { email: "✉️", whatsapp: "📲", sms: "💬", in_app: "🔔" };

const NOTIF_TYPES = [
  { key: "status_update",    ar: "تحديث حالة الطلب",   icon: "🔄" },
  { key: "new_message",      ar: "رسالة جديدة",         icon: "💬" },
  { key: "invoice_ready",    ar: "فاتورة جاهزة",        icon: "🧾" },
  { key: "document_request", ar: "طلب وثيقة",           icon: "📎" },
  { key: "approval",         ar: "موافقة",               icon: "✅" },
  { key: "rejection",        ar: "رفض",                  icon: "❌" },
  { key: "general",          ar: "إشعار عام",            icon: "📣" },
];

const TABS = ["history", "compose", "templates"];
const TAB_AR = { history: "سجل الإشعارات", compose: "إرسال إشعار", templates: "القوالب" };

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function typeBadge(type) {
  const t = NOTIF_TYPES.find(x => x.key === type) || { icon: "📣", ar: type };
  return (
    <span style={{ padding: "2px 10px", borderRadius: 99, fontSize: ".67rem", fontWeight: 700, background: `${CRM_COLORS.gold}18`, color: CRM_COLORS.goldDark }}>
      {t.icon} {t.ar}
    </span>
  );
}

// ── Compose Modal ──────────────────────────────────────────────
function ComposeNotification({ clients, onSent }) {
  const [form, setForm] = useState({ client_id: "", type: "general", title_ar: "", title_en: "", body_ar: "", body_en: "", channel: "in_app" });
  const [sending, setSending] = useState(false);
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const lbl = { display: "block", fontSize: ".68rem", color: CRM_COLORS.muted, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 6 };
  const inp = { width: "100%", padding: "9px 12px", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 6, fontSize: ".88rem", background: "#fff" };

  async function send() {
    if (!form.title_ar.trim()) return alert("العنوان بالعربية مطلوب");
    setSending(true);
    // Save in-app notification to DB
    if (form.client_id) {
      await supabase.from("client_notifications").insert([{
        client_id: form.client_id,
        type: form.type,
        title_ar: form.title_ar,
        title_en: form.title_en || form.title_ar,
        body_ar: form.body_ar,
        body_en: form.body_en || form.body_ar,
      }]);
    }
    // Fire external notification if not in-app
    if (form.channel !== "in_app") {
      const client = clients.find(c => c.id === form.client_id);
      await fetch("/api/send-contact-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "general", channel: form.channel, client, message: { title: form.title_ar, body: form.body_ar } })
      }).catch(() => {});
    }
    setSending(false);
    onSent();
    setForm({ client_id: "", type: "general", title_ar: "", title_en: "", body_ar: "", body_en: "", channel: "in_app" });
    alert("تم الإرسال بنجاح ✓");
  }

  return (
    <div style={{ maxWidth: 680, background: "#fff", borderRadius: 10, border: `1px solid ${CRM_COLORS.border}`, padding: 28 }}>
      <h3 style={{ margin: "0 0 20px", color: CRM_COLORS.text, fontWeight: 700 }}>إرسال إشعار جديد</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
        <div>
          <label style={lbl}>العميل</label>
          <select value={form.client_id} onChange={upd("client_id")} style={inp}>
            <option value="">— إرسال للكل (قريباً) —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>نوع الإشعار</label>
          <select value={form.type} onChange={upd("type")} style={inp}>
            {NOTIF_TYPES.map(t => <option key={t.key} value={t.key}>{t.icon} {t.ar}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>القناة</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CHANNELS.map(ch => (
            <button key={ch} onClick={() => setForm(f => ({ ...f, channel: ch }))} style={{
              padding: "6px 14px", borderRadius: 99, fontSize: ".78rem", fontWeight: form.channel === ch ? 700 : 400,
              border: `1.5px solid ${form.channel === ch ? CRM_COLORS.gold : CRM_COLORS.border}`,
              background: form.channel === ch ? `${CRM_COLORS.gold}14` : "transparent",
              color: form.channel === ch ? CRM_COLORS.goldDark : CRM_COLORS.muted, cursor: "pointer"
            }}>{CHANNEL_ICON[ch]} {CHANNEL_AR[ch]}</button>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div>
          <label style={lbl}>العنوان (عربي)</label>
          <input value={form.title_ar} onChange={upd("title_ar")} style={inp} placeholder="عنوان الإشعار" />
        </div>
        <div>
          <label style={lbl}>العنوان (إنجليزي)</label>
          <input value={form.title_en} onChange={upd("title_en")} style={inp} placeholder="Notification title" />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div>
          <label style={lbl}>النص (عربي)</label>
          <textarea rows={3} value={form.body_ar} onChange={upd("body_ar")} style={{ ...inp, resize: "vertical" }} />
        </div>
        <div>
          <label style={lbl}>النص (إنجليزي)</label>
          <textarea rows={3} value={form.body_en} onChange={upd("body_en")} style={{ ...inp, resize: "vertical" }} />
        </div>
      </div>
      <button onClick={send} disabled={sending} style={{ padding: "10px 28px", borderRadius: 8, border: "none", background: CRM_COLORS.gold, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: ".9rem" }}>
        {sending ? "جارٍ الإرسال..." : `${CHANNEL_ICON[form.channel]} إرسال`}
      </button>
    </div>
  );
}

// ── Templates Panel ────────────────────────────────────────────
const TEMPLATES = [
  { key: "status_approved", label: "تمت الموافقة", icon: "✅", title_ar: "تمت الموافقة على طلبك", body_ar: "يسعدنا إبلاغك بأنه تمت الموافقة على طلبك. تواصل معنا للخطوات التالية." },
  { key: "docs_request",   label: "طلب وثائق",    icon: "📎", title_ar: "وثائق مطلوبة",        body_ar: "يرجى تقديم الوثائق المطلوبة لإكمال معالجة طلبك." },
  { key: "invoice_ready",  label: "فاتورة جاهزة",  icon: "🧾", title_ar: "فاتورتك جاهزة",       body_ar: "تم إعداد فاتورتك. يمكنك الاطلاع عليها من بوابة العملاء." },
  { key: "appointment",    label: "تذكير بموعد",   icon: "📅", title_ar: "تذكير: موعدك غداً",   body_ar: "نذكّرك بموعدك الاستشاري المقرر غداً. يرجى الحضور في الوقت المحدد." },
  { key: "rejected",       label: "رفض الطلب",     icon: "❌", title_ar: "اعتذار عن طلبك",      body_ar: "نأسف لإبلاغك بأنه لم يتمكن من تلبية طلبك في الوقت الحالي. يمكننا مناقشة البدائل." },
];

function TemplatesPanel() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {TEMPLATES.map(t => (
        <div key={t.key} style={{ background: "#fff", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontWeight: 700, color: CRM_COLORS.text, marginBottom: 4 }}>{t.icon} {t.label}</div>
              <div style={{ fontSize: ".82rem", color: CRM_COLORS.muted, marginBottom: 4 }}><strong>العنوان:</strong> {t.title_ar}</div>
              <div style={{ fontSize: ".82rem", color: CRM_COLORS.muted }}>{t.body_ar}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// NOTIFICATION CENTER
// ══════════════════════════════════════════════════════════════
export default function NotificationCenter() {
  const [tab, setTab] = useState("history");
  const [notifications, setNotifications] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: n }, { data: c }] = await Promise.all([
      supabase.from("client_notifications").select("*, clients(full_name)").order("created_at", { ascending: false }).limit(200),
      supabase.from("clients").select("id, full_name").order("full_name")
    ]);
    setNotifications(n || []);
    setClients(c || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = notifications.filter(n => {
    const matchType = filterType === "all" || n.type === filterType;
    const matchSearch = !search || (n.title_ar || "").includes(search) || (n.clients?.full_name || "").includes(search);
    return matchType && matchSearch;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div style={{ ...pageStyle, minHeight: "100vh", fontFamily: "'Cairo','Segoe UI',sans-serif" }}>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: CRM_COLORS.text, margin: 0 }}>مركز الإشعارات</h1>
          <p style={{ color: CRM_COLORS.muted, fontSize: ".85rem", marginTop: 4 }}>
            {notifications.length} إشعار إجمالي · {unreadCount > 0 ? <span style={{ color: "#c0392b", fontWeight: 700 }}>{unreadCount} غير مقروء</span> : "الكل مقروء"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: `2px solid ${CRM_COLORS.border}`, marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "10px 22px", border: "none", background: "transparent", cursor: "pointer",
            fontWeight: tab === t ? 700 : 400, color: tab === t ? CRM_COLORS.gold : CRM_COLORS.muted,
            borderBottom: `2px solid ${tab === t ? CRM_COLORS.gold : "transparent"}`, marginBottom: -2,
            fontSize: ".88rem", fontFamily: "'Cairo','Segoe UI',sans-serif"
          }}>{TAB_AR[t]}</button>
        ))}
      </div>

      {/* HISTORY TAB */}
      {tab === "history" && (
        <>
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <input placeholder="بحث في الإشعارات..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200, padding: "9px 14px", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 8, fontSize: ".88rem" }} />
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              style={{ padding: "9px 14px", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 8, fontSize: ".88rem" }}>
              <option value="all">كل الأنواع</option>
              {NOTIF_TYPES.map(t => <option key={t.key} value={t.key}>{t.icon} {t.ar}</option>)}
            </select>
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: CRM_COLORS.muted }}>جارٍ التحميل...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map(n => (
                <div key={n.id} style={{
                  background: n.is_read ? "#fff" : `${CRM_COLORS.gold}06`,
                  border: `1px solid ${n.is_read ? CRM_COLORS.border : CRM_COLORS.gold}`,
                  borderRadius: 8, padding: "14px 18px",
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      {typeBadge(n.type)}
                      {!n.is_read && <span style={{ width: 8, height: 8, borderRadius: "50%", background: CRM_COLORS.gold, display: "inline-block" }} />}
                    </div>
                    <div style={{ fontWeight: 700, color: CRM_COLORS.text, fontSize: ".9rem", marginBottom: 2 }}>{n.title_ar}</div>
                    {n.body_ar && <div style={{ fontSize: ".8rem", color: CRM_COLORS.muted, marginBottom: 4 }}>{n.body_ar}</div>}
                    <div style={{ fontSize: ".72rem", color: CRM_COLORS.muted }}>{n.clients?.full_name || "—"} · {formatDate(n.created_at)}</div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0", color: CRM_COLORS.muted, fontSize: ".9rem" }}>لا توجد إشعارات</div>
              )}
            </div>
          )}
        </>
      )}

      {tab === "compose" && <ComposeNotification clients={clients} onSent={load} />}
      {tab === "templates" && <TemplatesPanel />}
    </div>
  );
}
