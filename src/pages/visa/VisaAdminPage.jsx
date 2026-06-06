// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Visa Admin Panel (Arabic)
// إدارة طلبات التأشيرة وقواعدها بالكامل
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { COUNTRIES } from "../../data/countries";
import { VISA_RULES } from "../../data/visaRules";

const C = {
  gold: "#c9a84c", goldLight: "#f0d080",
  g400: "#7a6e5a", g600: "#3d342a", g800: "#1e1810",
  dark: "#1e1a14", darkMid: "#2a2418",
  beige: "#f5f0e8", warmWhite: "#fffdf8",
};

const ff = "'Cairo','Noto Naskh Arabic',sans-serif";

const VISA_TYPES_AR = {
  visa_free: "بدون تأشيرة",
  visa_on_arrival: "تأشيرة عند الوصول",
  e_visa: "تأشيرة إلكترونية",
  embassy_visa: "تأشيرة سفارة",
  entry_refused: "الدخول مرفوض",
};

const STATUS_COLORS = {
  new: "#e8a020", reviewing: "#3498db",
  approved: "#27ae60", rejected: "#c0392b", completed: "#8e44ad",
};
const STATUS_AR = {
  new: "جديد", reviewing: "قيد المراجعة",
  approved: "موافق عليه", rejected: "مرفوض", completed: "مكتمل",
};

const TABS = [
  { k: "applications", label: "📋 الطلبات" },
  { k: "rules", label: "🗺 قواعد التأشيرة" },
  { k: "countries", label: "🌍 الدول" },
];

// ── مكوّن إدخال ──────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", color: C.g400, fontSize: ".75rem", letterSpacing: ".1em", marginBottom: 6, fontWeight: 600 }}>{label}</label>
      {children}
    </div>
  );
}

const inp = { width: "100%", padding: "10px 14px", border: `1px solid rgba(201,168,76,.25)`, background: C.beige, color: C.g800, fontSize: ".9rem", borderRadius: 6, fontFamily: ff, outline: "none", boxSizing: "border-box" };

// ── نموذج إضافة/تعديل قاعدة تأشيرة ──────────────────────────
function RuleForm({ rule, onSave, onCancel }) {
  const empty = {
    from_country: "", residence: "", to_country: "",
    visa_type: "embassy_visa", stay_duration: "", processing_time: "",
    fee_amount: 0, fee_currency: "USD", fee_note_ar: "",
    notes_ar: "", documents_ar: [""], is_popular: false, is_active: true,
  };
  const [form, setForm] = useState(rule || empty);
  const [saving, setSaving] = useState(false);
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const addDoc = () => setForm(f => ({ ...f, documents_ar: [...f.documents_ar, ""] }));
  const updDoc = (i, v) => setForm(f => ({ ...f, documents_ar: f.documents_ar.map((d, j) => j === i ? v : d) }));
  const removeDoc = (i) => setForm(f => ({ ...f, documents_ar: f.documents_ar.filter((_, j) => j !== i) }));

  const handleSave = async () => {
    if (!form.from_country || !form.to_country || !form.visa_type) return alert("اختر دولة المغادرة والوجهة ونوع التأشيرة");
    setSaving(true);
    const payload = { ...form, documents_ar: form.documents_ar.filter(d => d.trim()) };
    let error;
    if (form.id) {
      ({ error } = await supabase.from("visa_rules_db").update(payload).eq("id", form.id));
    } else {
      ({ error } = await supabase.from("visa_rules_db").insert([payload]));
    }
    setSaving(false);
    if (error) return alert("خطأ: " + error.message);
    onSave();
  };

  return (
    <div style={{ background: "#fff", border: `1px solid rgba(201,168,76,.2)`, borderRadius: 12, padding: 28, marginBottom: 24 }}>
      <h3 style={{ color: C.g800, marginBottom: 20, fontSize: "1rem" }}>{form.id ? "✏️ تعديل قاعدة تأشيرة" : "➕ إضافة قاعدة تأشيرة جديدة"}</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 4 }}>
        <Field label="دولة الجنسية *">
          <select value={form.from_country} onChange={upd("from_country")} style={inp}>
            <option value="">اختر...</option>
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.nameAr}</option>)}
          </select>
        </Field>
        <Field label="دولة الإقامة (اختياري)">
          <select value={form.residence} onChange={upd("residence")} style={inp}>
            <option value="">لا يوجد</option>
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.nameAr}</option>)}
          </select>
        </Field>
        <Field label="دولة الوجهة *">
          <select value={form.to_country} onChange={upd("to_country")} style={inp}>
            <option value="">اختر...</option>
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.nameAr}</option>)}
          </select>
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="نوع التأشيرة *">
          <select value={form.visa_type} onChange={upd("visa_type")} style={inp}>
            {Object.entries(VISA_TYPES_AR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="مدة الإقامة المسموحة">
          <input value={form.stay_duration} onChange={upd("stay_duration")} placeholder="مثال: 30 يوم" style={inp} />
        </Field>
        <Field label="مدة المعالجة">
          <input value={form.processing_time} onChange={upd("processing_time")} placeholder="مثال: 5-10 أيام عمل" style={inp} />
        </Field>
        <Field label="الرسوم">
          <div style={{ display: "flex", gap: 8 }}>
            <input type="number" value={form.fee_amount} onChange={upd("fee_amount")} placeholder="0" style={{ ...inp, flex: 1 }} />
            <select value={form.fee_currency} onChange={upd("fee_currency")} style={{ ...inp, width: "auto" }}>
              {["USD", "EUR", "GBP", "AED", "SAR", "JPY"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </Field>
        <Field label="ملاحظة الرسوم">
          <input value={form.fee_note_ar} onChange={upd("fee_note_ar")} placeholder="مثال: غير قابل للاسترداد" style={inp} />
        </Field>
      </div>

      <Field label="ملاحظات ومعلومات التأشيرة (بالعربي)">
        <textarea rows={4} value={form.notes_ar} onChange={upd("notes_ar")} placeholder="اكتب وصفاً شاملاً لمتطلبات التأشيرة..." style={{ ...inp, resize: "vertical" }} />
      </Field>

      <Field label="المستندات المطلوبة">
        {form.documents_ar.map((doc, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={doc} onChange={e => updDoc(i, e.target.value)} placeholder={`المستند ${i + 1}`} style={{ ...inp, flex: 1 }} />
            <button onClick={() => removeDoc(i)} style={{ padding: "0 12px", background: "rgba(192,57,43,.1)", border: "1px solid rgba(192,57,43,.2)", borderRadius: 6, cursor: "pointer", color: "#c0392b", fontSize: "1rem" }}>×</button>
          </div>
        ))}
        <button onClick={addDoc} style={{ padding: "7px 16px", background: "rgba(201,168,76,.1)", border: `1px solid rgba(201,168,76,.3)`, borderRadius: 6, cursor: "pointer", color: C.gold, fontSize: ".85rem", fontFamily: ff }}>
          + إضافة مستند
        </button>
      </Field>

      <div style={{ display: "flex", gap: 16, marginTop: 4, alignItems: "center" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: C.g600, fontSize: ".9rem" }}>
          <input type="checkbox" checked={form.is_popular} onChange={upd("is_popular")} style={{ accentColor: C.gold }} />
          مسار شائع (يظهر في الصفحة الرئيسية)
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: C.g600, fontSize: ".9rem" }}>
          <input type="checkbox" checked={form.is_active} onChange={upd("is_active")} style={{ accentColor: C.gold }} />
          مفعّل
        </label>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <button onClick={handleSave} disabled={saving} style={{ padding: "11px 28px", background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, border: "none", borderRadius: 6, cursor: saving ? "not-allowed" : "pointer", color: C.dark, fontFamily: ff, fontWeight: 700, fontSize: ".9rem", opacity: saving ? .7 : 1 }}>
          {saving ? "جاري الحفظ..." : "💾 حفظ"}
        </button>
        <button onClick={onCancel} style={{ padding: "11px 22px", background: "#fff", border: `1px solid rgba(201,168,76,.3)`, borderRadius: 6, cursor: "pointer", color: C.g600, fontFamily: ff, fontSize: ".9rem" }}>
          إلغاء
        </button>
      </div>
    </div>
  );
}

// ── الصفحة الرئيسية ───────────────────────────────────────────
export default function VisaAdminPage() {
  const [tab, setTab] = useState("applications");
  const [applications, setApplications] = useState([]);
  const [rules, setRules] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [loadingRules, setLoadingRules] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [appSearch, setAppSearch] = useState("");

  const loadApplications = useCallback(async () => {
    setLoadingApps(true);
    const { data } = await supabase.from("visa_applications").select("*").order("created_at", { ascending: false }).limit(100);
    setApplications(data || []);
    setLoadingApps(false);
  }, []);

  const loadRules = useCallback(async () => {
    setLoadingRules(true);
    const { data } = await supabase.from("visa_rules_db").select("*").order("created_at", { ascending: false });
    setRules(data || []);
    setLoadingRules(false);
  }, []);

  useEffect(() => {
    if (tab === "applications") loadApplications();
    if (tab === "rules") loadRules();
  }, [tab, loadApplications, loadRules]);

  const updateAppStatus = async (id, status) => {
    await supabase.from("visa_applications").update({ status }).eq("id", id);
    setApplications(apps => apps.map(a => a.id === id ? { ...a, status } : a));
    if (selectedApp?.id === id) setSelectedApp(a => ({ ...a, status }));
  };

  const deleteApp = async (id) => {
    if (!window.confirm("هل تريد حذف هذا الطلب نهائياً؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    await supabase.from("visa_applications").delete().eq("id", id);
    setApplications(apps => apps.filter(a => a.id !== id));
    if (selectedApp?.id === id) setSelectedApp(null);
  };

  const deleteRule = async (id) => {
    if (!window.confirm("هل تريد حذف هذه القاعدة؟")) return;
    await supabase.from("visa_rules_db").delete().eq("id", id);
    setRules(r => r.filter(x => x.id !== id));
  };

  const [importing, setImporting] = useState(false);
  const importDefaultRules = async () => {
    if (!window.confirm("سيتم استيراد جميع القواعد الافتراضية إلى قاعدة البيانات. هل تريد المتابعة؟")) return;
    setImporting(true);
    const rows = Object.values(VISA_RULES).map(r => ({
      from_country: r.from,
      residence: r.residence || null,
      to_country: r.to,
      visa_type: r.type,
      stay_duration: r.stay || "",
      processing_time: r.processing || "",
      fee_amount: r.fee?.amount || 0,
      fee_currency: r.fee?.currency || "USD",
      fee_note_ar: r.feeAr?.note || r.fee?.note || "",
      notes_ar: r.notes?.ar || r.notes?.en || "",
      documents_ar: (r.documents || []).map(d => d.ar || d.en || ""),
      is_popular: r.popular || false,
      is_active: true,
    }));
    const { error } = await supabase.from("visa_rules_db").insert(rows);
    setImporting(false);
    if (error) return alert("خطأ: " + error.message);
    alert(`✅ تم استيراد ${rows.length} قاعدة بنجاح`);
    loadRules();
  };

  const filteredApps = applications.filter(a =>
    !appSearch || a.full_name?.toLowerCase().includes(appSearch.toLowerCase()) ||
    a.email?.includes(appSearch) || a.phone?.includes(appSearch)
  );

  const countryName = code => COUNTRIES.find(c => c.code === code);

  // ── إحصائيات ──────────────────────────────────────────────
  const stats = [
    { icon: "📋", label: "إجمالي الطلبات", value: applications.length, color: C.gold },
    { icon: "🟡", label: "طلبات جديدة", value: applications.filter(a => a.status === "new" || !a.status).length, color: "#e8a020" },
    { icon: "✅", label: "موافق عليها", value: applications.filter(a => a.status === "approved").length, color: "#27ae60" },
    { icon: "🗺", label: "قواعد التأشيرة", value: rules.length, color: "#3498db" },
  ];

  return (
    <div style={{ fontFamily: ff, direction: "rtl", background: C.warmWhite, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.dark}, ${C.darkMid})`, padding: "28px clamp(20px,4vw,48px)" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ color: "#fff", fontWeight: 400, fontSize: "1.4rem", marginBottom: 4 }}>🛂 لوحة إدارة مركز التأشيرات</h1>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: ".82rem" }}>إدارة الطلبات وقواعد التأشيرة والدول</p>
          </div>
          <a href="/" style={{ color: C.gold, fontSize: ".82rem", textDecoration: "none", border: `1px solid rgba(201,168,76,.3)`, padding: "8px 16px", borderRadius: 6 }}>
            ← العودة للموقع
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "28px clamp(20px,4vw,48px)" }}>
        {/* إحصائيات */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 28 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: "#fff", border: `1px solid rgba(201,168,76,.12)`, borderRadius: 10, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: "1.6rem" }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: C.g400, fontSize: ".78rem", marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: `2px solid rgba(201,168,76,.12)`, marginBottom: 24 }}>
          {TABS.map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{
              padding: "12px 22px", background: "none", border: "none", cursor: "pointer",
              color: tab === t.k ? C.gold : C.g400,
              borderBottom: tab === t.k ? `2px solid ${C.gold}` : "2px solid transparent",
              marginBottom: -2, fontFamily: ff, fontSize: ".9rem", fontWeight: tab === t.k ? 700 : 400,
            }}>{t.label}</button>
          ))}
        </div>

        {/* ═══ تبويب الطلبات ═══ */}
        {tab === "applications" && (
          <div style={{ display: "grid", gridTemplateColumns: selectedApp ? "1fr 380px" : "1fr", gap: 20 }}>
            <div>
              {/* بحث */}
              <div style={{ marginBottom: 16 }}>
                <input value={appSearch} onChange={e => setAppSearch(e.target.value)}
                  placeholder="ابحث بالاسم أو الإيميل أو رقم الهاتف..."
                  style={{ ...inp, maxWidth: 400 }} />
              </div>

              {loadingApps ? (
                <div style={{ textAlign: "center", padding: 60, color: C.g400 }}>جاري التحميل...</div>
              ) : filteredApps.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60 }}>
                  <div style={{ fontSize: "3rem", marginBottom: 12 }}>📭</div>
                  <p style={{ color: C.g400 }}>لا توجد طلبات بعد</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".88rem" }}>
                    <thead>
                      <tr style={{ background: C.beige }}>
                        {["الاسم", "الإيميل", "رقم الهاتف", "الجنسية", "الوجهة", "تاريخ السفر", "الحالة", "إجراء"].map(h => (
                          <th key={h} style={{ padding: "12px 14px", textAlign: "right", color: C.g400, fontSize: ".72rem", letterSpacing: ".08em", fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApps.map(app => {
                        const from = countryName(app.nationality);
                        const to = countryName(app.destination);
                        const isSelected = selectedApp?.id === app.id;
                        return (
                          <tr key={app.id}
                            onClick={() => setSelectedApp(isSelected ? null : app)}
                            style={{ borderBottom: `1px solid rgba(201,168,76,.08)`, cursor: "pointer", background: isSelected ? "rgba(201,168,76,.05)" : "transparent" }}
                            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(201,168,76,.03)"; }}
                            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
                            <td style={{ padding: "12px 14px", color: C.g800, fontWeight: 600 }}>{app.full_name}</td>
                            <td style={{ padding: "12px 14px" }}>
                              <a href={`mailto:${app.email}`} style={{ color: C.gold, textDecoration: "none", fontSize: ".83rem" }} onClick={e => e.stopPropagation()}>{app.email}</a>
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <a href={`https://wa.me/${app.phone?.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" style={{ color: "#25d366", textDecoration: "none", fontSize: ".83rem" }} onClick={e => e.stopPropagation()}>
                                {app.phone}
                              </a>
                            </td>
                            <td style={{ padding: "12px 14px", color: C.g600 }}>{from?.flag} {from?.nameAr || app.nationality}</td>
                            <td style={{ padding: "12px 14px", color: C.g600 }}>{to?.flag} {to?.nameAr || app.destination}</td>
                            <td style={{ padding: "12px 14px", color: C.g400, whiteSpace: "nowrap" }}>{app.travel_date || "—"}</td>
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, background: `${STATUS_COLORS[app.status] || "#aaa"}18`, color: STATUS_COLORS[app.status] || "#aaa", fontSize: ".75rem", fontWeight: 700 }}>
                                {STATUS_AR[app.status] || "جديد"}
                              </span>
                            </td>
                            <td style={{ padding: "12px 14px" }} onClick={e => e.stopPropagation()}>
                              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                <select value={app.status || "new"} onChange={e => updateAppStatus(app.id, e.target.value)}
                                  style={{ padding: "5px 8px", border: `1px solid rgba(201,168,76,.25)`, borderRadius: 4, background: "#fff", color: C.g800, fontSize: ".78rem", cursor: "pointer", fontFamily: ff }}>
                                  {Object.entries(STATUS_AR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                                <button
                                  onClick={() => deleteApp(app.id)}
                                  title="حذف الطلب"
                                  style={{ padding: "5px 8px", background: "rgba(192,57,43,.1)", border: "1px solid rgba(192,57,43,.25)", borderRadius: 4, cursor: "pointer", color: "#c0392b", fontSize: ".85rem", lineHeight: 1 }}>
                                  🗑
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* تفاصيل الطلب */}
            {selectedApp && (
              <div style={{ background: "#fff", border: `1px solid rgba(201,168,76,.15)`, borderRadius: 12, padding: 24, height: "fit-content", position: "sticky", top: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ color: C.g800, fontSize: ".95rem", fontWeight: 700 }}>تفاصيل الطلب</h3>
                  <button onClick={() => setSelectedApp(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.g400, fontSize: "1.2rem" }}>×</button>
                </div>

                {[
                  ["👤 الاسم", selectedApp.full_name],
                  ["📧 الإيميل", selectedApp.email],
                  ["📞 الهاتف", selectedApp.phone],
                  ["💬 واتساب", selectedApp.whatsapp || selectedApp.phone],
                  ["🌍 الجنسية", `${countryName(selectedApp.nationality)?.flag || ""} ${countryName(selectedApp.nationality)?.nameAr || selectedApp.nationality}`],
                  ["🏠 الإقامة", selectedApp.residence ? `${countryName(selectedApp.residence)?.flag || ""} ${countryName(selectedApp.residence)?.nameAr || selectedApp.residence}` : "—"],
                  ["✈️ الوجهة", `${countryName(selectedApp.destination)?.flag || ""} ${countryName(selectedApp.destination)?.nameAr || selectedApp.destination}`],
                  ["📅 تاريخ السفر", selectedApp.travel_date || "—"],
                  ["🎯 الغرض", selectedApp.trip_purpose || "—"],
                  ["📝 ملاحظات", selectedApp.notes || "—"],
                  ["🕐 تاريخ التقديم", new Date(selectedApp.created_at).toLocaleString("ar")],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid rgba(201,168,76,.07)`, gap: 8 }}>
                    <span style={{ color: C.g400, fontSize: ".82rem", flexShrink: 0 }}>{label}</span>
                    <span style={{ color: C.g800, fontSize: ".85rem", fontWeight: 500, textAlign: "left", wordBreak: "break-all" }}>{value}</span>
                  </div>
                ))}

                <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a href={`https://wa.me/${(selectedApp.whatsapp || selectedApp.phone)?.replace(/\D/g, "")}`}
                    target="_blank" rel="noreferrer"
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", background: "rgba(37,211,102,.1)", border: "1px solid rgba(37,211,102,.3)", borderRadius: 8, color: "#25d366", textDecoration: "none", fontFamily: ff, fontWeight: 600, fontSize: ".82rem" }}>
                    💬 واتساب
                  </a>
                  <a href={`mailto:${selectedApp.email}`}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", background: "rgba(201,168,76,.1)", border: `1px solid rgba(201,168,76,.3)`, borderRadius: 8, color: C.gold, textDecoration: "none", fontFamily: ff, fontWeight: 600, fontSize: ".82rem" }}>
                    ✉️ إيميل
                  </a>
                </div>
                <button
                  onClick={() => deleteApp(selectedApp.id)}
                  style={{ width: "100%", marginTop: 10, padding: "10px", background: "rgba(192,57,43,.08)", border: "1px solid rgba(192,57,43,.2)", borderRadius: 8, cursor: "pointer", color: "#c0392b", fontFamily: ff, fontWeight: 600, fontSize: ".82rem" }}>
                  🗑 حذف هذا الطلب
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══ تبويب قواعد التأشيرة ═══ */}
        {tab === "rules" && (
          <div>
            {!showRuleForm && (
              <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
                <button
                  onClick={() => { setEditingRule(null); setShowRuleForm(true); }}
                  style={{ padding: "11px 24px", background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, border: "none", borderRadius: 8, cursor: "pointer", color: C.dark, fontFamily: ff, fontWeight: 700, fontSize: ".9rem" }}>
                  ➕ إضافة قاعدة جديدة
                </button>
                {rules.length === 0 && (
                  <button
                    onClick={importDefaultRules}
                    disabled={importing}
                    style={{ padding: "11px 24px", background: "#fff", border: `1px solid rgba(201,168,76,.4)`, borderRadius: 8, cursor: importing ? "not-allowed" : "pointer", color: C.gold, fontFamily: ff, fontWeight: 700, fontSize: ".9rem", opacity: importing ? .7 : 1 }}>
                    {importing ? "جاري الاستيراد..." : "📥 استيراد القواعد الافتراضية"}
                  </button>
                )}
                {rules.length > 0 && (
                  <span style={{ color: C.g400, fontSize: ".82rem" }}>
                    {rules.length} قاعدة في قاعدة البيانات
                  </span>
                )}
              </div>
            )}

            {showRuleForm && (
              <RuleForm
                rule={editingRule}
                onSave={() => { setShowRuleForm(false); setEditingRule(null); loadRules(); }}
                onCancel={() => { setShowRuleForm(false); setEditingRule(null); }}
              />
            )}

            {loadingRules ? (
              <div style={{ textAlign: "center", padding: 60, color: C.g400 }}>جاري التحميل...</div>
            ) : rules.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60 }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>🗺</div>
                <p style={{ color: C.g400 }}>لا توجد قواعد محفوظة. أضف قاعدتك الأولى من الزر أعلاه.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
                {rules.map(rule => {
                  const from = countryName(rule.from_country);
                  const to = countryName(rule.to_country);
                  const res = rule.residence ? countryName(rule.residence) : null;
                  return (
                    <div key={rule.id} style={{ background: "#fff", border: `1px solid rgba(201,168,76,${rule.is_active ? ".18" : ".06"})`, borderRadius: 10, padding: "18px 20px", opacity: rule.is_active ? 1 : .55 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: "1.4rem" }}>{from?.flag}</span>
                        <span style={{ color: C.g400 }}>←</span>
                        <span style={{ fontSize: "1.4rem" }}>{to?.flag}</span>
                        {res && <span style={{ fontSize: ".72rem", color: C.g400, background: C.beige, padding: "2px 7px", borderRadius: 10 }}>عبر {res.nameAr}</span>}
                        {!rule.is_active && <span style={{ fontSize: ".7rem", color: "#c0392b", marginRight: "auto" }}>معطّل</span>}
                      </div>
                      <div style={{ fontWeight: 700, color: C.g800, marginBottom: 6 }}>
                        {from?.nameAr} → {to?.nameAr}
                      </div>
                      <div style={{ color: C.g400, fontSize: ".82rem", marginBottom: 6 }}>
                        {VISA_TYPES_AR[rule.visa_type]} · {rule.stay_duration || "—"}
                      </div>
                      <div style={{ color: C.gold, fontSize: ".82rem", marginBottom: 14 }}>
                        {rule.fee_amount === 0 ? "مجاناً" : `${rule.fee_amount} ${rule.fee_currency}`} · {rule.processing_time || "—"}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => { setEditingRule(rule); setShowRuleForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          style={{ flex: 1, padding: "7px", background: "rgba(201,168,76,.1)", border: `1px solid rgba(201,168,76,.25)`, borderRadius: 6, cursor: "pointer", color: C.gold, fontFamily: ff, fontSize: ".82rem", fontWeight: 600 }}>
                          ✏️ تعديل
                        </button>
                        <button
                          onClick={() => deleteRule(rule.id)}
                          style={{ padding: "7px 12px", background: "rgba(192,57,43,.08)", border: "1px solid rgba(192,57,43,.2)", borderRadius: 6, cursor: "pointer", color: "#c0392b", fontSize: ".82rem" }}>
                          🗑
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ تبويب الدول ═══ */}
        {tab === "countries" && <CountriesManager />}

      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// مكوّن إدارة الدول الكاملة
// ══════════════════════════════════════════════════════════════
const REGIONS_AR = ["الشرق الأوسط", "أوروبا", "الأمريكتان", "آسيا", "أفريقيا", "أوقيانوسيا", "أخرى"];

function CountriesManager() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const emptyForm = { code: "", name_en: "", name_ar: "", flag: "", region: "الشرق الأوسط", is_active: true };
  const [form, setForm] = useState(emptyForm);
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("countries_db").select("*").order("name_ar");
    setCountries(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // استيراد الدول الافتراضية
  const importDefaults = async () => {
    if (!window.confirm("سيتم استيراد جميع الدول الافتراضية. هل تريد المتابعة؟")) return;
    setImporting(true);
    const regionMap = { "Middle East": "الشرق الأوسط", "Europe": "أوروبا", "Americas": "الأمريكتان", "Asia": "آسيا", "Africa": "أفريقيا", "Oceania": "أوقيانوسيا" };
    const rows = COUNTRIES.map(c => ({
      code: c.code, name_en: c.name, name_ar: c.nameAr,
      flag: c.flag, region: regionMap[c.region] || "أخرى", is_active: true,
    }));
    const { error } = await supabase.from("countries_db").upsert(rows, { onConflict: "code" });
    setImporting(false);
    if (error) return alert("خطأ: " + error.message);
    alert(`✅ تم استيراد ${rows.length} دولة بنجاح`);
    load();
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (c) => { setEditing(c); setForm({ code: c.code, name_en: c.name_en, name_ar: c.name_ar, flag: c.flag || "", region: c.region || "أخرى", is_active: c.is_active }); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const save = async () => {
    if (!form.code || !form.name_ar || !form.name_en) return alert("الرمز والاسم بالعربي والإنجليزي مطلوبة");
    setSaving(true);
    let error;
    if (editing) {
      ({ error } = await supabase.from("countries_db").update(form).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("countries_db").insert([form]));
    }
    setSaving(false);
    if (error) return alert("خطأ: " + error.message);
    setShowForm(false); setEditing(null); load();
  };

  const toggleActive = async (c) => {
    await supabase.from("countries_db").update({ is_active: !c.is_active }).eq("id", c.id);
    setCountries(cs => cs.map(x => x.id === c.id ? { ...x, is_active: !x.is_active } : x));
  };

  const deleteCountry = async (id) => {
    if (!window.confirm("هل تريد حذف هذه الدولة؟")) return;
    setDeleting(id);
    await supabase.from("countries_db").delete().eq("id", id);
    setCountries(cs => cs.filter(c => c.id !== id));
    setDeleting(null);
  };

  const filtered = countries.filter(c =>
    !search || c.name_ar?.includes(search) || c.name_en?.toLowerCase().includes(search.toLowerCase()) || c.code?.includes(search.toUpperCase())
  );

  return (
    <div>
      {/* نموذج الإضافة/التعديل */}
      {showForm && (
        <div style={{ background: "#fff", border: `1px solid rgba(201,168,76,.2)`, borderRadius: 12, padding: 28, marginBottom: 24 }}>
          <h3 style={{ color: C.g800, marginBottom: 20, fontSize: "1rem", fontFamily: ff }}>
            {editing ? "✏️ تعديل دولة" : "➕ إضافة دولة جديدة"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
            <Field label="رمز الدولة (ISO) *">
              <input value={form.code} onChange={upd("code")} placeholder="مثال: SY" maxLength={2}
                style={{ ...inp, textTransform: "uppercase", fontWeight: 700, letterSpacing: ".1em" }}
                disabled={!!editing} />
            </Field>
            <Field label="الاسم بالعربي *">
              <input value={form.name_ar} onChange={upd("name_ar")} placeholder="مثال: سوريا" style={inp} />
            </Field>
            <Field label="الاسم بالإنجليزي *">
              <input value={form.name_en} onChange={upd("name_en")} placeholder="مثال: Syria" style={inp} />
            </Field>
            <Field label="العلم (emoji)">
              <input value={form.flag} onChange={upd("flag")} placeholder="مثال: 🇸🇾" style={{ ...inp, fontSize: "1.4rem" }} />
            </Field>
            <Field label="المنطقة">
              <select value={form.region} onChange={upd("region")} style={inp}>
                {REGIONS_AR.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: C.g600, fontSize: ".9rem", marginBottom: 20, fontFamily: ff }}>
            <input type="checkbox" checked={form.is_active} onChange={upd("is_active")} style={{ accentColor: C.gold }} />
            مفعّلة (تظهر في القوائم)
          </label>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={save} disabled={saving}
              style={{ padding: "11px 28px", background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, border: "none", borderRadius: 6, cursor: saving ? "not-allowed" : "pointer", color: C.dark, fontFamily: ff, fontWeight: 700, opacity: saving ? .7 : 1 }}>
              {saving ? "جاري الحفظ..." : "💾 حفظ"}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); }}
              style={{ padding: "11px 22px", background: "#fff", border: `1px solid rgba(201,168,76,.3)`, borderRadius: 6, cursor: "pointer", color: C.g600, fontFamily: ff }}>
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* شريط الأدوات */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={openAdd}
          style={{ padding: "10px 22px", background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, border: "none", borderRadius: 8, cursor: "pointer", color: C.dark, fontFamily: ff, fontWeight: 700, fontSize: ".9rem" }}>
          ➕ إضافة دولة
        </button>
        {countries.length === 0 && (
          <button onClick={importDefaults} disabled={importing}
            style={{ padding: "10px 22px", background: "#fff", border: `1px solid rgba(201,168,76,.4)`, borderRadius: 8, cursor: importing ? "not-allowed" : "pointer", color: C.gold, fontFamily: ff, fontWeight: 700, fontSize: ".9rem", opacity: importing ? .7 : 1 }}>
            {importing ? "جاري الاستيراد..." : "📥 استيراد الدول الافتراضية"}
          </button>
        )}
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ابحث عن دولة..."
          style={{ ...inp, maxWidth: 260 }} />
        <span style={{ color: C.g400, fontSize: ".82rem", marginRight: "auto" }}>
          {filtered.length} دولة
        </span>
      </div>

      {/* الجدول */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: C.g400, fontFamily: ff }}>جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🌍</div>
          <p style={{ color: C.g400, fontFamily: ff }}>
            {countries.length === 0 ? "لا توجد دول. اضغط \"استيراد الدول الافتراضية\" لإضافتها دفعةً واحدة." : "لا توجد نتائج للبحث."}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".88rem", fontFamily: ff }}>
            <thead>
              <tr style={{ background: C.beige }}>
                {["العلم", "الاسم بالعربي", "الاسم بالإنجليزي", "الرمز", "المنطقة", "الحالة", "إجراءات"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "right", color: C.g400, fontSize: ".72rem", letterSpacing: ".08em", fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: `1px solid rgba(201,168,76,.07)` }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,.03)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "10px 14px", fontSize: "1.5rem" }}>{c.flag}</td>
                  <td style={{ padding: "10px 14px", color: C.g800, fontWeight: 600 }}>{c.name_ar}</td>
                  <td style={{ padding: "10px 14px", color: C.g600 }}>{c.name_en}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ background: C.beige, color: C.gold, padding: "2px 10px", borderRadius: 20, fontSize: ".8rem", fontWeight: 700 }}>{c.code}</span>
                  </td>
                  <td style={{ padding: "10px 14px", color: C.g400, fontSize: ".82rem" }}>{c.region}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <button onClick={() => toggleActive(c)}
                      style={{ padding: "3px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: ".75rem", fontWeight: 700, fontFamily: ff,
                        background: c.is_active ? "rgba(39,174,96,.12)" : "rgba(192,57,43,.1)",
                        color: c.is_active ? "#27ae60" : "#c0392b" }}>
                      {c.is_active ? "✓ مفعّلة" : "✗ معطّلة"}
                    </button>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(c)}
                        style={{ padding: "5px 12px", background: "rgba(201,168,76,.1)", border: `1px solid rgba(201,168,76,.25)`, borderRadius: 6, cursor: "pointer", color: C.gold, fontSize: ".8rem", fontFamily: ff }}>
                        ✏️ تعديل
                      </button>
                      <button onClick={() => deleteCountry(c.id)} disabled={deleting === c.id}
                        style={{ padding: "5px 10px", background: "rgba(192,57,43,.08)", border: "1px solid rgba(192,57,43,.2)", borderRadius: 6, cursor: "pointer", color: "#c0392b", fontSize: ".8rem", opacity: deleting === c.id ? .5 : 1 }}>
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
