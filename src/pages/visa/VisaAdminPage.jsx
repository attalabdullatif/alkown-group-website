// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Visa Admin Panel (Arabic)
// إدارة طلبات التأشيرة وقواعدها بالكامل
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { COUNTRIES } from "../../data/countries";

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

  const deleteRule = async (id) => {
    if (!window.confirm("هل تريد حذف هذه القاعدة؟")) return;
    await supabase.from("visa_rules_db").delete().eq("id", id);
    setRules(r => r.filter(x => x.id !== id));
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
                              <select value={app.status || "new"} onChange={e => updateAppStatus(app.id, e.target.value)}
                                style={{ padding: "5px 8px", border: `1px solid rgba(201,168,76,.25)`, borderRadius: 4, background: "#fff", color: C.g800, fontSize: ".78rem", cursor: "pointer", fontFamily: ff }}>
                                {Object.entries(STATUS_AR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                              </select>
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
              </div>
            )}
          </div>
        )}

        {/* ═══ تبويب قواعد التأشيرة ═══ */}
        {tab === "rules" && (
          <div>
            {!showRuleForm && (
              <button
                onClick={() => { setEditingRule(null); setShowRuleForm(true); }}
                style={{ padding: "11px 24px", background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, border: "none", borderRadius: 8, cursor: "pointer", color: C.dark, fontFamily: ff, fontWeight: 700, fontSize: ".9rem", marginBottom: 20 }}>
                ➕ إضافة قاعدة تأشيرة جديدة
              </button>
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
        {tab === "countries" && (
          <div>
            <div style={{ background: "rgba(201,168,76,.06)", border: `1px solid rgba(201,168,76,.2)`, borderRadius: 8, padding: "14px 18px", marginBottom: 20 }}>
              <p style={{ color: C.g600, fontSize: ".85rem" }}>
                💡 قائمة الدول محفوظة في ملف <code style={{ color: C.gold }}>src/data/countries.js</code>. يمكنك إضافة دول جديدة من الملف مباشرة.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
              {COUNTRIES.map(c => (
                <div key={c.code} style={{ background: "#fff", border: `1px solid rgba(201,168,76,.1)`, borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "1.4rem" }}>{c.flag}</span>
                  <div>
                    <div style={{ color: C.g800, fontSize: ".88rem", fontWeight: 600 }}>{c.nameAr}</div>
                    <div style={{ color: C.g400, fontSize: ".75rem" }}>{c.name} · {c.code}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
