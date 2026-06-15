import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { CRM_COLORS, pageStyle } from "../../components/crmUi";

/* ═══════════════════════════════════════════════════════════════
   ALKOWN GLOBAL — Timatic-style Visa Database Admin
   قاعدة بيانات التأشيرات والإقامات والجنسيات
═══════════════════════════════════════════════════════════════ */

const ENTRY_TYPES = {
  visa_free:      { label: "بدون تأشيرة",       color: "#2d9c5a" },
  visa_on_arrival:{ label: "تأشيرة عند الوصول", color: "#3d6f9f" },
  evisa:          { label: "تأشيرة إلكترونية",  color: "#7c5cbf" },
  visa_required:  { label: "تأشيرة مسبقة",      color: "#c0392b" },
};

const VISA_TYPES = ["tourist", "business", "transit", "student", "work", "family"];
const VISA_TYPES_AR = { tourist: "سياحية", business: "أعمال", transit: "عبور", student: "دراسة", work: "عمل", family: "لم شمل" };
const PROGRAM_TYPES = ["investment", "golden_visa", "employment", "retirement", "family", "naturalization", "descent"];
const PROGRAM_TYPES_AR = { investment: "استثمار", golden_visa: "ذهبية", employment: "عمل", retirement: "تقاعد", family: "لم شمل", naturalization: "تجنيس", descent: "نسب" };

const G = CRM_COLORS.gold;
const B = CRM_COLORS.border;

function Badge({ type }) {
  const e = ENTRY_TYPES[type] || { label: type, color: CRM_COLORS.muted };
  return (
    <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: `${e.color}18`, color: e.color }}>
      {e.label}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#0009", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px #0003" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${B}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: "1rem", color: CRM_COLORS.text }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: CRM_COLORS.muted }}>✕</button>
        </div>
        <div style={{ padding: "20px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: ".8rem", fontWeight: 700, color: CRM_COLORS.muted, marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

const inp = { width: "100%", padding: "9px 12px", border: `1px solid ${B}`, borderRadius: 8, fontSize: ".88rem", outline: "none", boxSizing: "border-box", fontFamily: "'Cairo',sans-serif" };

// ── Country Profiles Panel ────────────────────────────────────
function CountriesPanel() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [modal, setModal]         = useState(null); // null | "add" | row
  const [form, setForm]           = useState({});
  const [saving, setSaving]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("country_profiles").select("*").order("name_ar");
    setCountries(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() { setForm({ region: "Arab" }); setModal("add"); }
  function openEdit(row) { setForm({ ...row }); setModal(row); }

  async function save() {
    setSaving(true);
    if (modal === "add") {
      await supabase.from("country_profiles").insert([form]);
    } else {
      await supabase.from("country_profiles").update(form).eq("id", modal.id);
    }
    setSaving(false);
    setModal(null);
    load();
  }

  async function remove(id) {
    if (!window.confirm("حذف هذا البلد؟")) return;
    await supabase.from("country_profiles").delete().eq("id", id);
    load();
  }

  const filtered = countries.filter(c =>
    c.name_ar.includes(search) || c.name_en.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." style={{ ...inp, maxWidth: 260 }} />
        <button onClick={openAdd} style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontWeight: 700, cursor: "pointer", fontSize: ".85rem" }}>+ إضافة دولة</button>
      </div>

      {loading ? <p style={{ color: CRM_COLORS.muted, textAlign: "center", padding: 40 }}>جارٍ التحميل...</p> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".85rem" }}>
            <thead>
              <tr style={{ background: CRM_COLORS.beige }}>
                {["العلم", "الكود", "الاسم بالعربي", "الاسم بالإنجليزي", "المنطقة", "إجراءات"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: CRM_COLORS.muted, borderBottom: `1px solid ${B}`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: `1px solid ${B}` }}>
                  <td style={{ padding: "10px 12px", fontSize: 20 }}>{c.flag_emoji || "🌍"}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 700, color: G }}>{c.code}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>{c.name_ar}</td>
                  <td style={{ padding: "10px 12px", color: CRM_COLORS.muted }}>{c.name_en}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: ".72rem", background: `${G}18`, color: G }}>{c.region}</span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(c)} style={{ background: "none", border: `1px solid ${B}`, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: ".78rem" }}>تعديل</button>
                      <button onClick={() => remove(c.id)} style={{ background: "none", border: "1px solid #fcc", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: ".78rem", color: "#c0392b" }}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p style={{ color: CRM_COLORS.muted, textAlign: "center", padding: 30 }}>لا توجد نتائج</p>}
        </div>
      )}

      {modal && (
        <Modal title={modal === "add" ? "إضافة دولة" : `تعديل: ${modal.name_ar}`} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField label="كود ISO (2 أحرف)"><input style={inp} value={form.code || ""} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} maxLength={2} /></FormField>
            <FormField label="رمز العلم (Emoji)"><input style={inp} value={form.flag_emoji || ""} onChange={e => setForm(f => ({ ...f, flag_emoji: e.target.value }))} /></FormField>
            <FormField label="الاسم بالعربي"><input style={inp} value={form.name_ar || ""} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} /></FormField>
            <FormField label="الاسم بالإنجليزي"><input style={inp} value={form.name_en || ""} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} /></FormField>
            <FormField label="المنطقة">
              <select style={inp} value={form.region || ""} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}>
                {["GCC", "Arab", "Europe", "Asia", "Americas", "Africa", "Oceania"].map(r => <option key={r}>{r}</option>)}
              </select>
            </FormField>
            <FormField label="العملة"><input style={inp} value={form.currency || ""} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} /></FormField>
            <FormField label="ترتيب جواز السفر"><input style={inp} type="number" value={form.passport_rank || ""} onChange={e => setForm(f => ({ ...f, passport_rank: e.target.value }))} /></FormField>
            <FormField label="دول بدون تأشيرة (عدد)"><input style={inp} type="number" value={form.visa_free_count || ""} onChange={e => setForm(f => ({ ...f, visa_free_count: e.target.value }))} /></FormField>
          </div>
          <FormField label="ملاحظات"><textarea style={{ ...inp, minHeight: 70, resize: "vertical" }} value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></FormField>
          <button onClick={save} disabled={saving} style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "11px 28px", fontWeight: 700, cursor: "pointer", width: "100%", fontSize: ".9rem", opacity: saving ? .7 : 1 }}>
            {saving ? "جارٍ الحفظ..." : "حفظ"}
          </button>
        </Modal>
      )}
    </div>
  );
}

// ── Visa Rules Panel ──────────────────────────────────────────
function VisaRulesPanel({ countries }) {
  const [rules, setRules]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState({ passport: "", destination: "", entry: "" });
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState({});
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("visa_rules").select("*, passport:country_profiles!visa_rules_passport_country_fkey(name_ar,flag_emoji), dest:country_profiles!visa_rules_destination_country_fkey(name_ar,flag_emoji)").order("created_at", { ascending: false });
    setRules(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    setSaving(true);
    const payload = { ...form };
    delete payload.passport; delete payload.dest;
    if (modal === "add") {
      await supabase.from("visa_rules").insert([payload]);
    } else {
      await supabase.from("visa_rules").update(payload).eq("id", modal.id);
    }
    setSaving(false);
    setModal(null);
    load();
  }

  async function remove(id) {
    if (!window.confirm("حذف هذه القاعدة؟")) return;
    await supabase.from("visa_rules").delete().eq("id", id);
    load();
  }

  const filtered = rules.filter(r => {
    if (filter.passport     && r.passport_country    !== filter.passport)     return false;
    if (filter.destination  && r.destination_country !== filter.destination)  return false;
    if (filter.entry        && r.entry_type          !== filter.entry)        return false;
    return true;
  });

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <select style={{ ...inp, maxWidth: 180 }} value={filter.passport} onChange={e => setFilter(f => ({ ...f, passport: e.target.value }))}>
          <option value="">جميع جوازات السفر</option>
          {countries.map(c => <option key={c.code} value={c.code}>{c.flag_emoji} {c.name_ar}</option>)}
        </select>
        <select style={{ ...inp, maxWidth: 180 }} value={filter.destination} onChange={e => setFilter(f => ({ ...f, destination: e.target.value }))}>
          <option value="">جميع الوجهات</option>
          {countries.map(c => <option key={c.code} value={c.code}>{c.flag_emoji} {c.name_ar}</option>)}
        </select>
        <select style={{ ...inp, maxWidth: 180 }} value={filter.entry} onChange={e => setFilter(f => ({ ...f, entry: e.target.value }))}>
          <option value="">جميع أنواع الدخول</option>
          {Object.entries(ENTRY_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <div style={{ marginRight: "auto" }}>
          <button onClick={() => { setForm({ visa_type: "tourist", entry_type: "visa_required" }); setModal("add"); }}
            style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontWeight: 700, cursor: "pointer", fontSize: ".85rem" }}>
            + إضافة قاعدة
          </button>
        </div>
      </div>

      {loading ? <p style={{ color: CRM_COLORS.muted, textAlign: "center", padding: 40 }}>جارٍ التحميل...</p> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".83rem" }}>
            <thead>
              <tr style={{ background: CRM_COLORS.beige }}>
                {["جواز السفر", "الوجهة", "نوع التأشيرة", "نوع الدخول", "المدة", "الرسوم (USD)", "إجراءات"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: CRM_COLORS.muted, borderBottom: `1px solid ${B}`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${B}` }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>{r.passport?.flag_emoji} {r.passport?.name_ar} <span style={{ color: CRM_COLORS.muted, fontSize: 11 }}>({r.passport_country})</span></td>
                  <td style={{ padding: "10px 12px" }}>{r.dest?.flag_emoji} {r.dest?.name_ar}</td>
                  <td style={{ padding: "10px 12px" }}>{VISA_TYPES_AR[r.visa_type] || r.visa_type}</td>
                  <td style={{ padding: "10px 12px" }}><Badge type={r.entry_type} /></td>
                  <td style={{ padding: "10px 12px" }}>{r.stay_duration_days ? `${r.stay_duration_days} يوم` : "—"}</td>
                  <td style={{ padding: "10px 12px" }}>{r.fee_usd ? `$${r.fee_usd}` : "—"}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setForm({ ...r }); setModal(r); }} style={{ background: "none", border: `1px solid ${B}`, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: ".78rem" }}>تعديل</button>
                      <button onClick={() => remove(r.id)} style={{ background: "none", border: "1px solid #fcc", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: ".78rem", color: "#c0392b" }}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p style={{ color: CRM_COLORS.muted, textAlign: "center", padding: 30 }}>لا توجد قواعد مطابقة</p>}
        </div>
      )}

      {modal && (
        <Modal title={modal === "add" ? "إضافة قاعدة تأشيرة" : "تعديل القاعدة"} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField label="جواز السفر">
              <select style={inp} value={form.passport_country || ""} onChange={e => setForm(f => ({ ...f, passport_country: e.target.value }))}>
                <option value="">اختر...</option>
                {countries.map(c => <option key={c.code} value={c.code}>{c.flag_emoji} {c.name_ar}</option>)}
              </select>
            </FormField>
            <FormField label="الوجهة">
              <select style={inp} value={form.destination_country || ""} onChange={e => setForm(f => ({ ...f, destination_country: e.target.value }))}>
                <option value="">اختر...</option>
                {countries.map(c => <option key={c.code} value={c.code}>{c.flag_emoji} {c.name_ar}</option>)}
              </select>
            </FormField>
            <FormField label="نوع التأشيرة">
              <select style={inp} value={form.visa_type || "tourist"} onChange={e => setForm(f => ({ ...f, visa_type: e.target.value }))}>
                {VISA_TYPES.map(t => <option key={t} value={t}>{VISA_TYPES_AR[t]}</option>)}
              </select>
            </FormField>
            <FormField label="نوع الدخول">
              <select style={inp} value={form.entry_type || "visa_required"} onChange={e => setForm(f => ({ ...f, entry_type: e.target.value }))}>
                {Object.entries(ENTRY_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </FormField>
            <FormField label="مدة الإقامة (أيام)"><input style={inp} type="number" value={form.stay_duration_days || ""} onChange={e => setForm(f => ({ ...f, stay_duration_days: e.target.value }))} /></FormField>
            <FormField label="صلاحية التأشيرة (أيام)"><input style={inp} type="number" value={form.validity_days || ""} onChange={e => setForm(f => ({ ...f, validity_days: e.target.value }))} /></FormField>
            <FormField label="وقت المعالجة (من)"><input style={inp} type="number" value={form.processing_days_min || ""} onChange={e => setForm(f => ({ ...f, processing_days_min: e.target.value }))} /></FormField>
            <FormField label="وقت المعالجة (إلى)"><input style={inp} type="number" value={form.processing_days_max || ""} onChange={e => setForm(f => ({ ...f, processing_days_max: e.target.value }))} /></FormField>
            <FormField label="الرسوم (USD)"><input style={inp} type="number" value={form.fee_usd || ""} onChange={e => setForm(f => ({ ...f, fee_usd: e.target.value }))} /></FormField>
            <FormField label="آخر تحقق"><input style={inp} type="date" value={form.last_verified_at || ""} onChange={e => setForm(f => ({ ...f, last_verified_at: e.target.value }))} /></FormField>
          </div>
          <FormField label="ملاحظات"><textarea style={{ ...inp, minHeight: 70, resize: "vertical" }} value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></FormField>
          <button onClick={save} disabled={saving || !form.passport_country || !form.destination_country}
            style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "11px 28px", fontWeight: 700, cursor: "pointer", width: "100%", fontSize: ".9rem", opacity: (saving || !form.passport_country || !form.destination_country) ? .6 : 1 }}>
            {saving ? "جارٍ الحفظ..." : "حفظ"}
          </button>
        </Modal>
      )}
    </div>
  );
}

// ── Residency Programs Panel ──────────────────────────────────
function ResidencyPanel({ countries }) {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState({});
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("residency_programs").select("*, country:country_profiles(name_ar,flag_emoji)").order("country_code");
    setPrograms(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    setSaving(true);
    const payload = { ...form };
    delete payload.country;
    if (modal === "add") {
      await supabase.from("residency_programs").insert([payload]);
    } else {
      await supabase.from("residency_programs").update(payload).eq("id", modal.id);
    }
    setSaving(false);
    setModal(null);
    load();
  }

  async function remove(id) {
    if (!window.confirm("حذف هذا البرنامج؟")) return;
    await supabase.from("residency_programs").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={() => { setForm({ program_type: "investment", renewable: true, leads_to_citizenship: false }); setModal("add"); }}
          style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontWeight: 700, cursor: "pointer", fontSize: ".85rem" }}>
          + إضافة برنامج
        </button>
      </div>

      {loading ? <p style={{ color: CRM_COLORS.muted, textAlign: "center", padding: 40 }}>جارٍ التحميل...</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {programs.map(p => (
            <div key={p.id} style={{ background: "#fff", border: `1px solid ${B}`, borderRadius: 12, padding: "18px 20px", borderTop: `3px solid ${G}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 22 }}>{p.country?.flag_emoji}</div>
                  <div style={{ fontWeight: 800, fontSize: ".92rem", color: CRM_COLORS.text, marginTop: 4 }}>{p.program_name_ar}</div>
                  <div style={{ color: CRM_COLORS.muted, fontSize: ".75rem" }}>{p.country?.name_ar}</div>
                </div>
                <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: ".7rem", fontWeight: 700, background: `${G}18`, color: G }}>
                  {PROGRAM_TYPES_AR[p.program_type] || p.program_type}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                {p.min_investment_usd && <div style={{ fontSize: ".78rem" }}><span style={{ color: CRM_COLORS.muted }}>حد أدنى: </span><strong>${Number(p.min_investment_usd).toLocaleString()}</strong></div>}
                {p.validity_years     && <div style={{ fontSize: ".78rem" }}><span style={{ color: CRM_COLORS.muted }}>صلاحية: </span><strong>{p.validity_years} سنة</strong></div>}
                {p.processing_months_min && <div style={{ fontSize: ".78rem" }}><span style={{ color: CRM_COLORS.muted }}>معالجة: </span><strong>{p.processing_months_min}–{p.processing_months_max} شهر</strong></div>}
                <div style={{ fontSize: ".78rem" }}>{p.leads_to_citizenship ? "✅ يؤدي للجنسية" : "🔵 إقامة فقط"}</div>
              </div>
              {p.benefits?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  {p.benefits.slice(0, 3).map((b, i) => <div key={i} style={{ fontSize: ".72rem", color: "#2d9c5a", marginBottom: 2 }}>✓ {b}</div>)}
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setForm({ ...p }); setModal(p); }} style={{ flex: 1, background: "none", border: `1px solid ${B}`, borderRadius: 7, padding: "6px 0", cursor: "pointer", fontSize: ".78rem" }}>تعديل</button>
                <button onClick={() => remove(p.id)} style={{ background: "none", border: "1px solid #fcc", borderRadius: 7, padding: "6px 12px", cursor: "pointer", fontSize: ".78rem", color: "#c0392b" }}>حذف</button>
              </div>
            </div>
          ))}
          {programs.length === 0 && <p style={{ color: CRM_COLORS.muted, gridColumn: "1/-1", textAlign: "center", padding: 40 }}>لا توجد برامج مضافة</p>}
        </div>
      )}

      {modal && (
        <Modal title={modal === "add" ? "إضافة برنامج إقامة" : `تعديل: ${modal.program_name_ar}`} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField label="الدولة">
              <select style={inp} value={form.country_code || ""} onChange={e => setForm(f => ({ ...f, country_code: e.target.value }))}>
                <option value="">اختر...</option>
                {countries.map(c => <option key={c.code} value={c.code}>{c.flag_emoji} {c.name_ar}</option>)}
              </select>
            </FormField>
            <FormField label="نوع البرنامج">
              <select style={inp} value={form.program_type || "investment"} onChange={e => setForm(f => ({ ...f, program_type: e.target.value }))}>
                {PROGRAM_TYPES.map(t => <option key={t} value={t}>{PROGRAM_TYPES_AR[t]}</option>)}
              </select>
            </FormField>
            <FormField label="الاسم بالعربي"><input style={inp} value={form.program_name_ar || ""} onChange={e => setForm(f => ({ ...f, program_name_ar: e.target.value }))} /></FormField>
            <FormField label="الاسم بالإنجليزي"><input style={inp} value={form.program_name_en || ""} onChange={e => setForm(f => ({ ...f, program_name_en: e.target.value }))} /></FormField>
            <FormField label="أدنى استثمار (USD)"><input style={inp} type="number" value={form.min_investment_usd || ""} onChange={e => setForm(f => ({ ...f, min_investment_usd: e.target.value }))} /></FormField>
            <FormField label="مدة الصلاحية (سنوات)"><input style={inp} type="number" value={form.validity_years || ""} onChange={e => setForm(f => ({ ...f, validity_years: e.target.value }))} /></FormField>
            <FormField label="معالجة من (أشهر)"><input style={inp} type="number" value={form.processing_months_min || ""} onChange={e => setForm(f => ({ ...f, processing_months_min: e.target.value }))} /></FormField>
            <FormField label="معالجة إلى (أشهر)"><input style={inp} type="number" value={form.processing_months_max || ""} onChange={e => setForm(f => ({ ...f, processing_months_max: e.target.value }))} /></FormField>
            <FormField label="قابل للتجديد">
              <select style={inp} value={form.renewable ? "yes" : "no"} onChange={e => setForm(f => ({ ...f, renewable: e.target.value === "yes" }))}>
                <option value="yes">نعم</option><option value="no">لا</option>
              </select>
            </FormField>
            <FormField label="يؤدي للجنسية">
              <select style={inp} value={form.leads_to_citizenship ? "yes" : "no"} onChange={e => setForm(f => ({ ...f, leads_to_citizenship: e.target.value === "yes" }))}>
                <option value="no">لا</option><option value="yes">نعم</option>
              </select>
            </FormField>
          </div>
          <FormField label="الوصف بالعربي"><textarea style={{ ...inp, minHeight: 80, resize: "vertical" }} value={form.description_ar || ""} onChange={e => setForm(f => ({ ...f, description_ar: e.target.value }))} /></FormField>
          <FormField label="المزايا (سطر لكل ميزة)">
            <textarea style={{ ...inp, minHeight: 70, resize: "vertical" }}
              value={(form.benefits || []).join("\n")}
              onChange={e => setForm(f => ({ ...f, benefits: e.target.value.split("\n").filter(Boolean) }))}
              placeholder="ميزة 1&#10;ميزة 2&#10;ميزة 3"
            />
          </FormField>
          <button onClick={save} disabled={saving || !form.country_code || !form.program_name_ar}
            style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "11px 28px", fontWeight: 700, cursor: "pointer", width: "100%", fontSize: ".9rem", opacity: (saving || !form.country_code) ? .6 : 1 }}>
            {saving ? "جارٍ الحفظ..." : "حفظ"}
          </button>
        </Modal>
      )}
    </div>
  );
}

// ── Main VisaDatabase Component ───────────────────────────────
const TABS = [
  { key: "countries",  label: "🌍 الدول" },
  { key: "visa_rules", label: "🛂 قواعد التأشيرة" },
  { key: "residency",  label: "🏡 برامج الإقامة" },
];

export default function VisaDatabase() {
  const [tab, setTab]           = useState("countries");
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    supabase.from("country_profiles").select("code,name_ar,flag_emoji").order("name_ar")
      .then(({ data }) => setCountries(data || []));
  }, []);

  return (
    <div style={{ ...pageStyle, minHeight: "100vh", fontFamily: "'Cairo','Segoe UI',sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: CRM_COLORS.text, margin: 0 }}>قاعدة بيانات التأشيرات</h1>
        <p style={{ color: CRM_COLORS.muted, fontSize: ".85rem", marginTop: 4 }}>إدارة قواعد التأشيرات والإقامات — نمط Timatic</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${B}`, marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ background: "none", border: "none", borderBottom: `2px solid ${tab === t.key ? G : "transparent"}`, color: tab === t.key ? G : CRM_COLORS.muted, padding: "10px 20px", cursor: "pointer", fontWeight: tab === t.key ? 700 : 400, fontSize: ".88rem", transition: "all .2s", fontFamily: "'Cairo',sans-serif" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Panels */}
      {tab === "countries"  && <CountriesPanel />}
      {tab === "visa_rules" && <VisaRulesPanel countries={countries} />}
      {tab === "residency"  && <ResidencyPanel countries={countries} />}
    </div>
  );
}
