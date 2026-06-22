import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  fetchCountries, codeToFlag,
  REQUIREMENT_AR, REQUIREMENT_COLOR, // eslint-disable-line no-unused-vars
} from "../../lib/visaIntelligenceService";
// formatDate unused in this component
import { CSVImporter, JSONImporter } from "../../lib/visaDataImporter";
import {
  CRM_COLORS, buttonStyle, cardStyle, inputStyle,
  outlineButtonStyle, pageStyle,
} from "../../components/crmUi";

const VISA_TYPES = ["visa_free","visa_on_arrival","evisa","eta","embassy_visa",
  "electronic_authorization","restricted","special_permission"];
const REGIONS    = ["Middle East","Europe","Europe/Asia","Asia","Americas","Africa","Oceania"];

// AR labels for the engine's extended visa types (falls back to REQUIREMENT_AR).
const EXTRA_REQ_AR = { electronic_authorization:"تصريح إلكتروني", restricted:"مقيّد", special_permission:"تصريح خاص" };
const reqLabel = (t) => REQUIREMENT_AR[t] || EXTRA_REQ_AR[t] || t;

// Engine accuracy fields (migration 023).
const ENTRY_TYPES   = ["unknown","single","multiple","single_or_multiple"];
const ENTRY_AR      = { unknown:"نوع الدخول: غير معروف", single:"دخول واحد", multiple:"دخول متعدد", single_or_multiple:"واحد أو متعدد" };
const SOURCE_TYPES  = ["","government","mfa","embassy","evisa_portal","border_control","secondary"];
const SOURCE_AR     = { "":"— نوع المصدر —", government:"حكومي رسمي", mfa:"وزارة خارجية", embassy:"سفارة", evisa_portal:"بوابة eVisa", border_control:"جوازات/حدود", secondary:"ثانوي (مراجعة)" };
const CONFIDENCE    = ["LOW","MEDIUM","HIGH"];
const CONFIDENCE_AR = { LOW:"ثقة: منخفضة", MEDIUM:"ثقة: متوسطة", HIGH:"ثقة: عالية" };
const REVIEW_STATUSES = ["REQUIRES_MANUAL_REVIEW","VERIFIED","CONFLICT"];
const REVIEW_AR     = { REQUIRES_MANUAL_REVIEW:"الحالة: بحاجة لمراجعة", VERIFIED:"الحالة: موثّقة ✅", CONFLICT:"الحالة: تعارض" };

const emptyRule = {
  nationality_code:"", destination_code:"", residence_code:"",
  visa_requirement:"embassy_visa",
  stay_days:"", processing_min:"", processing_max:"", fee_usd:"",
  passport_validity_months:"", entry_type:"unknown",
  notes_ar:"", notes_en:"", is_popular:false,
  official_website:"", source_type:"", source_url:"", source_name:"",
  confidence_level:"LOW", review_status:"REQUIRES_MANUAL_REVIEW",
};

const emptyCountry = { code:"", name_en:"", name_ar:"", flag:"", region:"Middle East", is_active:true };

function StatusBadge({ req }) {
  return (
    <span style={{
      display:"inline-block", padding:"2px 10px", borderRadius:20, fontSize:".72rem", fontWeight:700,
      background: (REQUIREMENT_COLOR[req] || "#888") + "22",
      color:       REQUIREMENT_COLOR[req] || "#888",
      border:`1px solid ${(REQUIREMENT_COLOR[req] || "#888")}44`,
    }}>
      {REQUIREMENT_AR[req] || req}
    </span>
  );
}

// ─── Countries Tab ────────────────────────────────────────────────────────────
function CountriesTab() {
  const [countries, setCountries] = useState([]);
  const [form,    setForm]    = useState(emptyCountry);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from("vis_countries").select("*").order("name_ar");
    setCountries(data || []);
  }

  function startEdit(c) { setEditing(c); setForm({ code:c.code, name_en:c.name_en, name_ar:c.name_ar, flag:c.flag||"", region:c.region||"Middle East", is_active:c.is_active }); }
  function reset() { setEditing(null); setForm(emptyCountry); }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.code || !form.name_en || !form.name_ar) { setError("الكود والاسمان مطلوبان."); return; }
    setSaving(true); setError("");
    try {
      const payload = { code: form.code.toUpperCase(), name_en: form.name_en, name_ar: form.name_ar, flag: form.flag, region: form.region, is_active: form.is_active };
      if (editing) {
        const { error: updateErr } = await supabase.from("vis_countries").update(payload).eq("id", editing.id);
        if (updateErr) throw new Error(updateErr.message);
      } else {
        const { error: insertErr } = await supabase.from("vis_countries").insert([payload]);
        if (insertErr) throw new Error(insertErr.message);
      }
      reset(); await load();
    } catch (err) { setError("❌ " + (err.message || "حدث خطأ")); }
    setSaving(false);
  }

  async function toggleActive(c) {
    await supabase.from("vis_countries").update({ is_active: !c.is_active }).eq("id", c.id);
    await load();
  }

  async function deleteCountry(id) {
    if (!window.confirm("حذف هذا البلد؟")) return;
    await supabase.from("vis_countries").delete().eq("id", id);
    await load();
  }

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16, alignItems:"start" }}>
      <div style={cardStyle}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <span style={{ color: CRM_COLORS.textMuted, fontSize:".82rem" }}>{countries.length} دولة</span>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:".82rem" }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${CRM_COLORS.border}` }}>
                {["الكود","الدولة","العربية","المنطقة","الحالة",""].map(h => (
                  <th key={h} style={{ padding:"6px 10px", color: CRM_COLORS.textMuted, textAlign:"right", fontWeight:600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {countries.map(c => (
                <tr key={c.id} style={{ borderBottom:`1px solid ${CRM_COLORS.border}` }}>
                  <td style={{ padding:"7px 10px", fontWeight:800, color: CRM_COLORS.gold }}>{c.code}</td>
                  <td style={{ padding:"7px 10px" }}>{codeToFlag(c.code)} {c.name_en}</td>
                  <td style={{ padding:"7px 10px" }}>{c.name_ar}</td>
                  <td style={{ padding:"7px 10px", color: CRM_COLORS.textMuted, fontSize:".75rem" }}>{c.region}</td>
                  <td style={{ padding:"7px 10px" }}>
                    <span style={{ color: c.is_active ? CRM_COLORS.success : CRM_COLORS.danger, fontWeight:700, fontSize:".75rem" }}>
                      {c.is_active ? "✓ نشط" : "✗ موقوف"}
                    </span>
                  </td>
                  <td style={{ padding:"7px 10px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => startEdit(c)} style={{ ...outlineButtonStyle, padding:"2px 8px", fontSize:".7rem" }}>تعديل</button>
                      <button onClick={() => toggleActive(c)} style={{ ...outlineButtonStyle, padding:"2px 8px", fontSize:".7rem", borderColor: c.is_active ? CRM_COLORS.danger : CRM_COLORS.success, color: c.is_active ? CRM_COLORS.danger : CRM_COLORS.success }}>
                        {c.is_active ? "إيقاف" : "تفعيل"}
                      </button>
                      <button onClick={() => deleteCountry(c.id)} style={{ ...outlineButtonStyle, padding:"2px 8px", fontSize:".7rem", borderColor: CRM_COLORS.danger, color: CRM_COLORS.danger }}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ ...cardStyle, position:"sticky", top:16 }}>
        <h3 style={{ color: CRM_COLORS.gold, fontWeight:700, fontSize:".9rem", marginBottom:14 }}>
          {editing ? "✏️ تعديل دولة" : "➕ دولة جديدة"}
        </h3>
        {error && <div style={{ color: CRM_COLORS.danger, fontSize:".8rem", marginBottom:10 }}>{error}</div>}
        <form onSubmit={handleSave} style={{ display:"flex", flexDirection:"column", gap:9 }}>
          <input required maxLength={2} placeholder="كود ISO (مثال: SY)" value={form.code}
            onChange={e => setForm(f=>({...f,code:e.target.value.toUpperCase()}))} style={inputStyle} />
          <input required placeholder="الاسم بالإنجليزية" value={form.name_en}
            onChange={e => setForm(f=>({...f,name_en:e.target.value}))} style={inputStyle} />
          <input required placeholder="الاسم بالعربية" value={form.name_ar}
            onChange={e => setForm(f=>({...f,name_ar:e.target.value}))} style={inputStyle} />
          <input placeholder="كود البلد (مثال: SY) — العلم يُولَّد تلقائياً" value={form.flag}
            onChange={e => setForm(f=>({...f,flag:e.target.value.toUpperCase()}))} style={inputStyle} />
          <select value={form.region} onChange={e => setForm(f=>({...f,region:e.target.value}))} style={inputStyle}>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:".83rem", cursor:"pointer" }}>
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(f=>({...f,is_active:e.target.checked}))} />
            نشط
          </label>
          <div style={{ display:"flex", gap:8 }}>
            <button type="submit" disabled={saving} style={{ ...buttonStyle, flex:1 }}>
              {saving ? "جار الحفظ…" : editing ? "حفظ" : "إضافة"}
            </button>
            {editing && <button type="button" onClick={reset} style={{ ...outlineButtonStyle, flex:1 }}>إلغاء</button>}
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Visa Rules Tab ───────────────────────────────────────────────────────────
function VisaRulesTab({ countries }) {
  const [rules,   setRules]   = useState([]);
  const [form,    setForm]    = useState(emptyRule);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [filter,  setFilter]  = useState({ nat:"", dest:"", req:"all" });

  useEffect(() => { load(); }, []);

  const countryMap = Object.fromEntries(countries.map(c => [c.code, c]));

  async function load() {
    const { data } = await supabase.from("vis_rules").select("*").order("nationality_code").order("destination_code");
    setRules(data || []);
  }

  function startEdit(r) {
    setEditing(r);
    setForm({
      nationality_code: r.nationality_code, destination_code: r.destination_code,
      residence_code: r.residence_code || "", visa_requirement: r.visa_requirement,
      stay_days: r.stay_days ?? "", processing_min: r.processing_min ?? "",
      processing_max: r.processing_max ?? "", fee_usd: r.fee_usd ?? "",
      passport_validity_months: r.passport_validity_months ?? "",
      entry_type: r.entry_type || "unknown",
      notes_ar: r.notes_ar || "", notes_en: r.notes_en || "",
      is_popular: r.is_popular || false,
      official_website: r.official_website || "",
      source_type: r.source_type || "", source_url: r.source_url || "", source_name: r.source_name || "",
      confidence_level: r.confidence_level || "LOW",
      review_status: r.review_status || "REQUIRES_MANUAL_REVIEW",
    });
  }
  function reset() { setEditing(null); setForm(emptyRule); }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.nationality_code || !form.destination_code || !form.visa_requirement) {
      setError("الجنسية والوجهة ونوع التأشيرة مطلوبة."); return;
    }
    setSaving(true); setError("");
    try {
      // residence_code is NOT NULL DEFAULT '' in DB — must send '' not null
      const residenceCode = form.residence_code ? form.residence_code.toUpperCase() : "";

      const payload = {
        nationality_code: form.nationality_code.toUpperCase(),
        destination_code: form.destination_code.toUpperCase(),
        residence_code:   residenceCode,
        visa_requirement: form.visa_requirement,
        stay_days:        form.stay_days    !== "" ? parseInt(form.stay_days)    : null,
        processing_min:   form.processing_min !== "" ? parseInt(form.processing_min) : null,
        processing_max:   form.processing_max !== "" ? parseInt(form.processing_max) : null,
        fee_usd:          form.fee_usd !== "" ? parseFloat(form.fee_usd) : null,
        passport_validity_months: form.passport_validity_months !== "" ? parseInt(form.passport_validity_months) : null,
        entry_type:       form.entry_type || "unknown",
        notes_ar:         form.notes_ar || null,
        notes_en:         form.notes_en || null,
        is_popular:       !!form.is_popular,
        is_active:        true,
        official_website: form.official_website || null,
        source_type:      form.source_type || null,
        source_url:       form.source_url || null,
        source_name:      form.source_name || null,
        confidence_level: form.confidence_level || "LOW",
        review_status:    form.review_status || "REQUIRES_MANUAL_REVIEW",
        last_verified:    form.review_status === "VERIFIED" ? new Date().toISOString().slice(0,10) : undefined,
      };

      if (editing) {
        const { error: updateErr } = await supabase
          .from("vis_rules").update(payload).eq("id", editing.id);
        if (updateErr) throw new Error(updateErr.message);
      } else {
        // UNIQUE(nationality_code, destination_code, residence_code) — use upsert
        const { error: upsertErr } = await supabase
          .from("vis_rules")
          .upsert([payload], { onConflict: "nationality_code,destination_code,residence_code" });
        if (upsertErr) throw new Error(upsertErr.message);
      }

      reset();
      await load();
    } catch (err) {
      setError("❌ " + (err.message || "حدث خطأ غير متوقع"));
    }
    setSaving(false);
  }

  async function toggleActive(r) {
    await supabase.from("vis_rules").update({ is_active: !r.is_active }).eq("id", r.id);
    await load();
  }

  async function deleteRule(id) {
    if (!window.confirm("حذف هذه القاعدة؟")) return;
    await supabase.from("vis_rules").delete().eq("id", id);
    await load();
  }

  const countryName = code => countryMap[code]?.name_ar || code;

  const filtered = rules.filter(r =>
    (filter.nat  === "" || r.nationality_code === filter.nat) &&
    (filter.dest === "" || r.destination_code === filter.dest) &&
    (filter.req  === "all" || r.visa_requirement === filter.req)
  );

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:16, alignItems:"start" }}>
      <div style={cardStyle}>
        {/* Filters */}
        <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
          <select value={filter.nat} onChange={e => setFilter(f=>({...f,nat:e.target.value}))} style={{ ...inputStyle, flex:1, minWidth:120 }}>
            <option value="">كل الجنسيات</option>
            {countries.map(c => <option key={c.code} value={c.code}>{codeToFlag(c.code)} {c.name_ar}</option>)}
          </select>
          <select value={filter.dest} onChange={e => setFilter(f=>({...f,dest:e.target.value}))} style={{ ...inputStyle, flex:1, minWidth:120 }}>
            <option value="">كل الوجهات</option>
            {countries.map(c => <option key={c.code} value={c.code}>{codeToFlag(c.code)} {c.name_ar}</option>)}
          </select>
          <select value={filter.req} onChange={e => setFilter(f=>({...f,req:e.target.value}))} style={{ ...inputStyle, flex:1, minWidth:120 }}>
            <option value="all">كل الأنواع</option>
            {VISA_TYPES.map(t => <option key={t} value={t}>{reqLabel(t)}</option>)}
          </select>
        </div>
        <div style={{ color: CRM_COLORS.textMuted, fontSize:".78rem", marginBottom:10 }}>{filtered.length} قاعدة</div>

        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:".8rem" }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${CRM_COLORS.border}` }}>
                {["الجنسية","الوجهة","الإقامة","النوع","الإقامة/أيام","معالجة","الرسوم","شائع",""].map(h => (
                  <th key={h} style={{ padding:"6px 8px", color: CRM_COLORS.textMuted, textAlign:"right", fontWeight:600, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ borderBottom:`1px solid ${CRM_COLORS.border}`, opacity: r.is_active ? 1 : .5 }}>
                  <td style={{ padding:"7px 8px", fontWeight:700 }}>{codeToFlag(r.nationality_code)} {countryName(r.nationality_code)}</td>
                  <td style={{ padding:"7px 8px" }}>{codeToFlag(r.destination_code)} {countryName(r.destination_code)}</td>
                  <td style={{ padding:"7px 8px", color: CRM_COLORS.textMuted, fontSize:".72rem" }}>
                    {r.residence_code ? `${codeToFlag(r.residence_code)} ${r.residence_code}` : "—"}
                  </td>
                  <td style={{ padding:"7px 8px", whiteSpace:"nowrap" }}>
                    <StatusBadge req={r.visa_requirement} />
                    {r.review_status === "VERIFIED"
                      ? <span title="موثّقة" style={{ marginInlineStart:5 }}>✅</span>
                      : r.review_status === "CONFLICT"
                        ? <span title="تعارض بين المصادر" style={{ marginInlineStart:5 }}>⚠️</span>
                        : <span title="بحاجة لمراجعة" style={{ marginInlineStart:5, opacity:.7 }}>🔍</span>}
                  </td>
                  <td style={{ padding:"7px 8px", color: CRM_COLORS.textMuted }}>{r.stay_days ? `${r.stay_days}y` : "—"}</td>
                  <td style={{ padding:"7px 8px", color: CRM_COLORS.textMuted, fontSize:".72rem" }}>
                    {r.processing_min === 0 && r.processing_max === 0 ? "فوري" : r.processing_max ? `${r.processing_min}-${r.processing_max}y` : "—"}
                  </td>
                  <td style={{ padding:"7px 8px", color: CRM_COLORS.gold }}>
                    {r.fee_usd ? `$${r.fee_usd}` : "مجاناً"}
                  </td>
                  <td style={{ padding:"7px 8px", textAlign:"center" }}>{r.is_popular ? "⭐" : ""}</td>
                  <td style={{ padding:"7px 8px" }}>
                    <div style={{ display:"flex", gap:5 }}>
                      <button onClick={() => startEdit(r)} style={{ ...outlineButtonStyle, padding:"2px 8px", fontSize:".7rem" }}>تعديل</button>
                      <button onClick={() => toggleActive(r)} style={{ ...outlineButtonStyle, padding:"2px 8px", fontSize:".7rem", borderColor: r.is_active ? CRM_COLORS.danger : CRM_COLORS.success, color: r.is_active ? CRM_COLORS.danger : CRM_COLORS.success }}>
                        {r.is_active ? "إيقاف" : "تفعيل"}
                      </button>
                      <button onClick={() => deleteRule(r.id)} style={{ ...outlineButtonStyle, padding:"2px 8px", fontSize:".7rem", borderColor: CRM_COLORS.danger, color: CRM_COLORS.danger }}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form */}
      <div style={{ ...cardStyle, position:"sticky", top:16 }}>
        <h3 style={{ color: CRM_COLORS.gold, fontWeight:700, fontSize:".9rem", marginBottom:14 }}>
          {editing ? "✏️ تعديل قاعدة" : "➕ قاعدة جديدة"}
        </h3>
        {error && <div style={{ color: CRM_COLORS.danger, fontSize:".8rem", marginBottom:10 }}>{error}</div>}
        <form onSubmit={handleSave} style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <select required value={form.nationality_code} onChange={e => setForm(f=>({...f,nationality_code:e.target.value}))} style={inputStyle}>
            <option value="">— الجنسية * —</option>
            {countries.map(c => <option key={c.code} value={c.code}>{codeToFlag(c.code)} {c.name_ar}</option>)}
          </select>
          <select required value={form.destination_code} onChange={e => setForm(f=>({...f,destination_code:e.target.value}))} style={inputStyle}>
            <option value="">— الوجهة * —</option>
            {countries.map(c => <option key={c.code} value={c.code}>{codeToFlag(c.code)} {c.name_ar}</option>)}
          </select>
          <select value={form.residence_code} onChange={e => setForm(f=>({...f,residence_code:e.target.value}))} style={inputStyle}>
            <option value="">— بلد الإقامة (اختياري) —</option>
            {countries.map(c => <option key={c.code} value={c.code}>{codeToFlag(c.code)} {c.name_ar}</option>)}
          </select>
          <select required value={form.visa_requirement} onChange={e => setForm(f=>({...f,visa_requirement:e.target.value}))} style={inputStyle}>
            {VISA_TYPES.map(t => <option key={t} value={t}>{reqLabel(t)}</option>)}
          </select>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            <input type="number" placeholder="مدة (أيام)" value={form.stay_days} onChange={e => setForm(f=>({...f,stay_days:e.target.value}))} style={inputStyle} />
            <input type="number" placeholder="معالجة من" value={form.processing_min} onChange={e => setForm(f=>({...f,processing_min:e.target.value}))} style={inputStyle} />
            <input type="number" placeholder="معالجة حتى" value={form.processing_max} onChange={e => setForm(f=>({...f,processing_max:e.target.value}))} style={inputStyle} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <input type="number" step="0.01" placeholder="الرسوم بالدولار (0 = مجاني)" value={form.fee_usd} onChange={e => setForm(f=>({...f,fee_usd:e.target.value}))} style={inputStyle} />
            <input type="number" placeholder="صلاحية الجواز (أشهر)" value={form.passport_validity_months} onChange={e => setForm(f=>({...f,passport_validity_months:e.target.value}))} style={inputStyle} />
          </div>
          <select value={form.entry_type} onChange={e => setForm(f=>({...f,entry_type:e.target.value}))} style={inputStyle}>
            {ENTRY_TYPES.map(t => <option key={t} value={t}>{ENTRY_AR[t]}</option>)}
          </select>
          <textarea placeholder="ملاحظات عربية" value={form.notes_ar} onChange={e => setForm(f=>({...f,notes_ar:e.target.value}))} style={{ ...inputStyle, minHeight:60, resize:"vertical" }} />
          <textarea placeholder="Notes (English)" value={form.notes_en} onChange={e => setForm(f=>({...f,notes_en:e.target.value}))} style={{ ...inputStyle, minHeight:50, resize:"vertical" }} />
          <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:".83rem", cursor:"pointer" }}>
            <input type="checkbox" checked={form.is_popular} onChange={e => setForm(f=>({...f,is_popular:e.target.checked}))} />
            ⭐ وجهة شائعة
          </label>

          {/* ── Verification & source (engine accuracy fields) ── */}
          <div style={{ borderTop:`1px solid ${CRM_COLORS.gold}33`, marginTop:6, paddingTop:10, display:"flex", flexDirection:"column", gap:8 }}>
            <div style={{ color: CRM_COLORS.gold, fontSize:".76rem", fontWeight:700 }}>🔐 التحقّق والمصدر</div>
            <input placeholder="الموقع الرسمي (official_website)" value={form.official_website} onChange={e => setForm(f=>({...f,official_website:e.target.value}))} style={inputStyle} />
            <input placeholder="رابط المصدر الرسمي (source_url)" value={form.source_url} onChange={e => setForm(f=>({...f,source_url:e.target.value}))} style={inputStyle} />
            <input placeholder="اسم الجهة المصدر (source_name)" value={form.source_name} onChange={e => setForm(f=>({...f,source_name:e.target.value}))} style={inputStyle} />
            <select value={form.source_type} onChange={e => setForm(f=>({...f,source_type:e.target.value}))} style={inputStyle}>
              {SOURCE_TYPES.map(t => <option key={t||"none"} value={t}>{SOURCE_AR[t]}</option>)}
            </select>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <select value={form.confidence_level} onChange={e => setForm(f=>({...f,confidence_level:e.target.value}))} style={inputStyle}>
                {CONFIDENCE.map(t => <option key={t} value={t}>{CONFIDENCE_AR[t]}</option>)}
              </select>
              <select value={form.review_status} onChange={e => setForm(f=>({...f,review_status:e.target.value}))} style={inputStyle}>
                {REVIEW_STATUSES.map(t => <option key={t} value={t}>{REVIEW_AR[t]}</option>)}
              </select>
            </div>
            <div style={{ fontSize:".72rem", color: CRM_COLORS.danger, lineHeight:1.6 }}>
              ⚠️ لا تضع «موثّقة» إلا بعد التحقّق من مصدر رسمي (حكومي/سفارة/بوابة eVisa) ووضع رابطه.
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button type="submit" disabled={saving} style={{ ...buttonStyle, flex:1 }}>
              {saving ? "جار الحفظ…" : editing ? "حفظ" : "إضافة"}
            </button>
            {editing && <button type="button" onClick={reset} style={{ ...outlineButtonStyle, flex:1 }}>إلغاء</button>}
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Import Tab ───────────────────────────────────────────────────────────────
function ImportTab() {
  const [type,   setType]   = useState("json");
  const [input,  setInput]  = useState("");
  const [result, setResult] = useState(null);
  const [busy,   setBusy]   = useState(false);

  const JSON_SAMPLE = JSON.stringify([{
    nationality_code:"SY", destination_code:"TR", visa_requirement:"visa_on_arrival",
    stay_days:90, processing_min:0, processing_max:0, fee_usd:0,
    notes_ar:"تأشيرة عند الوصول", notes_en:"Visa on arrival", is_popular:true,
  }], null, 2);

  const CSV_SAMPLE = `nationality_code,destination_code,residence_code,visa_requirement,stay_days,processing_min,processing_max,fee_usd,notes_ar,notes_en,is_popular
SY,TR,,visa_on_arrival,90,0,0,0,تأشيرة عند الوصول,Visa on arrival,true`;

  async function handleImport() {
    if (!input.trim()) return;
    setBusy(true); setResult(null);
    try {
      let summary;
      if (type === "json") {
        const importer = new JSONImporter();
        summary = await importer.import(JSON.parse(input));
      } else {
        const importer = new CSVImporter();
        summary = await importer.importCSV(input);
      }
      setResult(summary);
    } catch (e) { setResult({ error: e.message }); }
    setBusy(false);
  }

  return (
    <div style={{ maxWidth:760 }}>
      <div style={cardStyle}>
        <h3 style={{ color: CRM_COLORS.gold, fontWeight:700, fontSize:".95rem", marginBottom:4 }}>📥 استيراد قواعد التأشيرة</h3>
        <p style={{ color: CRM_COLORS.textMuted, fontSize:".82rem", marginBottom:20, lineHeight:1.7 }}>
          استورد قواعد تأشيرة بشكل جماعي عبر JSON أو CSV. ستُضاف القواعد الجديدة وتُحدَّث الموجودة تلقائياً.
          <br />مستقبلاً: Timatic API، حكومية، مزودون خارجيون.
        </p>

        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          {["json","csv"].map(t => (
            <button key={t} onClick={() => { setType(t); setInput(""); }} style={{
              ...outlineButtonStyle,
              ...(type===t ? { background: CRM_COLORS.gold, color:"#1a1510", borderColor: CRM_COLORS.gold } : {}),
            }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ marginBottom:10 }}>
          <button onClick={() => setInput(type==="json" ? JSON_SAMPLE : CSV_SAMPLE)} style={{ ...outlineButtonStyle, fontSize:".75rem", padding:"4px 12px" }}>
            تحميل مثال
          </button>
        </div>

        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`الصق بيانات ${type.toUpperCase()} هنا…`}
          style={{ ...inputStyle, width:"100%", minHeight:200, resize:"vertical", fontFamily:"monospace", fontSize:".8rem" }}
        />

        <button onClick={handleImport} disabled={busy || !input.trim()} style={{ ...buttonStyle, marginTop:10 }}>
          {busy ? "جار الاستيراد…" : "▶ استيراد البيانات"}
        </button>

        {result && (
          <div style={{
            marginTop:16, padding:"14px 16px", borderRadius:8,
            background: result.error ? "rgba(185,74,72,.1)" : "rgba(47,143,91,.1)",
            border:`1px solid ${result.error ? CRM_COLORS.danger : CRM_COLORS.success}44`,
          }}>
            {result.error
              ? <div style={{ color: CRM_COLORS.danger }}>{result.error}</div>
              : <>
                <div style={{ color: CRM_COLORS.success, fontWeight:700, marginBottom:6 }}>✅ تم الاستيراد بنجاح</div>
                <div style={{ color: CRM_COLORS.textMuted, fontSize:".82rem" }}>
                  مُستورد: {result.imported} · تم تجاوزه: {result.skipped}
                  {result.errors?.length > 0 && <div style={{ color: CRM_COLORS.danger }}>أخطاء: {result.errors.join(", ")}</div>}
                </div>
              </>
            }
          </div>
        )}
      </div>

      <div style={{ ...cardStyle, marginTop:16 }}>
        <h4 style={{ color: CRM_COLORS.gold, fontSize:".88rem", fontWeight:700, marginBottom:10 }}>🔌 نقاط التكامل المستقبلية</h4>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[
            { name:"Timatic (IATA)", status:"قريباً", icon:"✈️", desc:"قاعدة بيانات التأشيرات الرسمية للطيران" },
            { name:"CSV حكومي",      status:"جاهز",   icon:"📄", desc:"استيراد من ملفات CSV الحكومية" },
            { name:"JSON API",       status:"جاهز",   icon:"🔗", desc:"أي API تُعيد JSON بالصيغة المحددة" },
            { name:"Sherpa/iVisa",   status:"قريباً",  icon:"🌐", desc:"منصات تأشيرات إلكترونية تجارية" },
          ].map(({ name, status, icon, desc }) => (
            <div key={name} style={{ background:"rgba(255,255,255,.03)", border:`1px solid ${CRM_COLORS.border}`, borderRadius:8, padding:"12px 14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontWeight:700, fontSize:".85rem" }}>{icon} {name}</span>
                <span style={{ fontSize:".7rem", color: status==="جاهز" ? CRM_COLORS.success : "#c28a25", fontWeight:700 }}>{status}</span>
              </div>
              <div style={{ color: CRM_COLORS.textMuted, fontSize:".75rem" }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function VisaAdminIntelligence() {
  const [tab,       setTab]       = useState("rules");
  const [countries, setCountries] = useState([]);

  useEffect(() => { fetchCountries({ activeOnly: false }).then(setCountries).catch(console.warn); }, []);

  const TABS = [
    { key:"rules",     label:"📋 قواعد التأشيرة" },
    { key:"countries", label:"🌍 الدول" },
    { key:"import",    label:"📥 الاستيراد" },
  ];

  return (
    <div style={{ ...pageStyle, direction:"rtl", fontFamily:"'Cairo','Noto Naskh Arabic',sans-serif" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <h2 style={{ color: CRM_COLORS.gold, fontWeight:800, fontSize:"1.3rem", margin:0 }}>
          🛂 محرك التأشيرات الذكي
        </h2>
        <a href="/visa-checker" target="_blank" style={{
          background:"transparent", border:`1px solid ${CRM_COLORS.border}`,
          color: CRM_COLORS.textMuted, borderRadius:8, padding:"6px 14px",
          textDecoration:"none", fontSize:".8rem",
        }}>
          🔗 فتح الفاحص العام
        </a>
      </div>

      <div style={{ display:"flex", gap:4, borderBottom:`1px solid ${CRM_COLORS.border}`, marginBottom:20, paddingBottom:0 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            background:"none", border:"none", cursor:"pointer", fontFamily:"inherit",
            padding:"10px 18px", fontSize:".85rem", fontWeight: tab===t.key ? 800 : 500,
            color: tab===t.key ? CRM_COLORS.gold : CRM_COLORS.textMuted,
            borderBottom: tab===t.key ? `2px solid ${CRM_COLORS.gold}` : "2px solid transparent",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "rules"     && <VisaRulesTab countries={countries} />}
      {tab === "countries" && <CountriesTab />}
      {tab === "import"    && <ImportTab />}
    </div>
  );
}
