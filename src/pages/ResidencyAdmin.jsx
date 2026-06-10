// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Residency & Citizenship Admin Panel
// إدارة صفحة برامج الإقامة والجنسية من الداشبورد
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const ff = "'Dubai','Cairo','Noto Naskh Arabic',sans-serif";

const C = {
  gold: "#c9a84c", goldD: "#8a6010",
  g400: "#7a6b50", g600: "#3d3020", g800: "#1e1508",
  dark: "#16100a", beige: "#faf7f2",
  success: "#27ae60", error: "#e74c3c", info: "#3498db",
  bg: "#fff",
};

const inp = {
  width: "100%", padding: "10px 14px",
  border: "1px solid rgba(201,168,76,.25)",
  background: C.beige, color: C.g800,
  fontSize: ".9rem", borderRadius: 6,
  fontFamily: ff, outline: "none",
  boxSizing: "border-box", lineHeight: 1.7,
};

const textarea = { ...inp, resize: "vertical", minHeight: 80 };

const btn = (variant = "primary") => ({
  padding: "10px 22px", borderRadius: 6, border: "none",
  cursor: "pointer", fontFamily: ff, fontWeight: 700,
  fontSize: ".88rem", transition: "all .2s",
  ...(variant === "primary" ? {
    background: `linear-gradient(135deg,${C.goldD},${C.gold})`,
    color: C.dark,
  } : variant === "danger" ? {
    background: "rgba(231,76,60,.1)",
    color: C.error,
    border: "1px solid rgba(231,76,60,.25)",
  } : {
    background: "rgba(201,168,76,.1)",
    color: C.gold,
    border: `1px solid rgba(201,168,76,.25)`,
  }),
});

const label = {
  fontSize: ".78rem", fontWeight: 700,
  color: C.g400, letterSpacing: ".08em",
  display: "block", marginBottom: 5,
};

// ── Default empty program template ─────────────────────────────
const emptyResidencyProgram = () => ({
  id: `prog-${Date.now()}`,
  flag: "🏳",
  nameAr: "", nameEn: "",
  tagAr: "", tagEn: "",
  popular: false,
  typeAr: "", typeEn: "",
  durationAr: "", durationEn: "",
  investmentAr: "", investmentEn: "",
  visaFreeAr: "", visaFreeEn: "",
  stayRequiredAr: "", stayRequiredEn: "",
  pathToCitizenshipAr: "", pathToCitizenshipEn: "",
  featuresAr: [""], featuresEn: [""],
  investmentOptionsAr: [], investmentOptionsEn: [],
  costsAr: [], costsEn: [],
  familyMembersAr: [], familyMembersEn: [],
});

const emptyCitizenshipProgram = () => ({
  id: `cit-${Date.now()}`,
  flag: "🏳",
  nameAr: "", nameEn: "",
  tagAr: "", tagEn: "",
  popular: false,
  typeAr: "", typeEn: "",
  durationAr: "", durationEn: "",
  investmentAr: "", investmentEn: "",
  visaFreeAr: "", visaFreeEn: "",
  requirementsAr: [""], requirementsEn: [""],
  featuresAr: [""], featuresEn: [""],
  investmentOptionsAr: [], investmentOptionsEn: [],
  costsAr: [], costsEn: [],
  familyMembersAr: [], familyMembersEn: [],
});

// ── Reusable list editor ───────────────────────────────────────
function ListEditor({ label: lbl, items = [], onChange }) {
  const update = (i, val) => {
    const next = [...items];
    next[i] = val;
    onChange(next);
  };
  const add = () => onChange([...items, ""]);
  const remove = (i) => onChange(items.filter((_, j) => j !== i));

  return (
    <div style={{ marginBottom: 16 }}>
      <span style={label}>{lbl}</span>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
          <input
            style={{ ...inp, flex: 1 }}
            value={item}
            onChange={e => update(i, e.target.value)}
            placeholder={`${lbl} ${i + 1}`}
          />
          <button onClick={() => remove(i)} style={btn("danger")}>✕</button>
        </div>
      ))}
      <button onClick={add} style={{ ...btn("outline"), fontSize: ".78rem", padding: "6px 14px" }}>
        + إضافة
      </button>
    </div>
  );
}

// ── Single Program Editor (Accordion) ─────────────────────────
function ProgramEditor({ prog, onChange, onDelete, index, type }) {
  const [open, setOpen] = useState(index === 0);

  const set = (field, val) => onChange({ ...prog, [field]: val });

  const fields = [
    ["flag", "الرمز/العلم (emoji)", "text"],
    ["nameAr", "الاسم عربي", "text"],
    ["nameEn", "الاسم إنجليزي", "text"],
    ["tagAr", "الوسم عربي (اختياري)", "text"],
    ["tagEn", "الوسم إنجليزي", "text"],
    ["typeAr", "نوع البرنامج عربي", "text"],
    ["typeEn", "نوع البرنامج إنجليزي", "text"],
    ["durationAr", "المدة عربي", "text"],
    ["durationEn", "المدة إنجليزي", "text"],
    ["investmentAr", "الاستثمار عربي", "text"],
    ["investmentEn", "الاستثمار إنجليزي", "text"],
    ["visaFreeAr", "دول بدون تأشيرة عربي", "text"],
    ["visaFreeEn", "Visa-Free Countries", "text"],
    ...(type === "residency" ? [
      ["stayRequiredAr", "متطلب الإقامة عربي", "text"],
      ["stayRequiredEn", "Stay Required", "text"],
      ["pathToCitizenshipAr", "مسار الجنسية عربي", "text"],
      ["pathToCitizenshipEn", "Path to Citizenship", "text"],
    ] : []),
  ];

  return (
    <div style={{ border: "1px solid rgba(201,168,76,.2)", borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 18px", background: open ? "rgba(201,168,76,.06)" : C.beige,
          border: "none", cursor: "pointer", fontFamily: ff,
          fontWeight: 700, color: C.g800, textAlign: "right",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "1.4rem" }}>{prog.flag || "🏳"}</span>
          <span>{prog.nameAr || `برنامج ${index + 1}`}</span>
          {prog.popular && (
            <span style={{ background: `linear-gradient(135deg,${C.goldD},${C.gold})`, color: C.dark, fontSize: ".65rem", padding: "2px 8px", borderRadius: 12, fontWeight: 800 }}>
              ⭐ مميز
            </span>
          )}
        </span>
        <span style={{ color: C.gold, fontSize: "1.2rem", transform: open ? "rotate(45deg)" : "none", transition: "transform .2s" }}>+</span>
      </button>

      {open && (
        <div style={{ padding: "20px 18px", background: "#fff", direction: "rtl" }}>
          {/* Popular toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, padding: "10px 14px", background: C.beige, borderRadius: 8 }}>
            <input
              type="checkbox" id={`pop-${prog.id}`}
              checked={!!prog.popular}
              onChange={e => set("popular", e.target.checked)}
              style={{ width: 16, height: 16, cursor: "pointer" }}
            />
            <label htmlFor={`pop-${prog.id}`} style={{ ...label, margin: 0, cursor: "pointer" }}>
              ⭐ برنامج مميز (يظهر بإطار ذهبي)
            </label>
          </div>

          {/* Text fields — two columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px", marginBottom: 16 }}>
            {fields.map(([field, lbl]) => (
              <div key={field}>
                <span style={label}>{lbl}</span>
                <input style={inp} value={prog[field] || ""} onChange={e => set(field, e.target.value)} />
              </div>
            ))}
          </div>

          <hr style={{ border: "none", borderTop: "1px solid rgba(201,168,76,.15)", margin: "16px 0" }} />

          {/* List editors */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            <ListEditor label="✅ المميزات (عربي)" items={prog.featuresAr || []} onChange={v => set("featuresAr", v)} />
            <ListEditor label="✅ Features (English)" items={prog.featuresEn || []} onChange={v => set("featuresEn", v)} />
          </div>

          {type === "citizenship" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
              <ListEditor label="📋 شروط الأهلية (عربي)" items={prog.requirementsAr || []} onChange={v => set("requirementsAr", v)} />
              <ListEditor label="📋 Requirements (English)" items={prog.requirementsEn || []} onChange={v => set("requirementsEn", v)} />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            <ListEditor label="💼 خيارات الاستثمار (عربي)" items={prog.investmentOptionsAr || []} onChange={v => set("investmentOptionsAr", v)} />
            <ListEditor label="💼 Investment Options (English)" items={prog.investmentOptionsEn || []} onChange={v => set("investmentOptionsEn", v)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            <ListEditor label="💵 التكاليف (عربي)" items={prog.costsAr || []} onChange={v => set("costsAr", v)} />
            <ListEditor label="💵 Costs (English)" items={prog.costsEn || []} onChange={v => set("costsEn", v)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            <ListEditor label="👨‍👩‍👧 أفراد الأسرة (عربي)" items={prog.familyMembersAr || []} onChange={v => set("familyMembersAr", v)} />
            <ListEditor label="👨‍👩‍👧 Family Members (English)" items={prog.familyMembersEn || []} onChange={v => set("familyMembersEn", v)} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button onClick={onDelete} style={btn("danger")}>🗑 حذف هذا البرنامج</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN ADMIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function ResidencyAdmin() {
  const { role } = useAuth();
  const [tab, setTab] = useState("residency");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const [heroTitleAr, setHeroTitleAr] = useState("إقامتك وجنسيتك الثانية\nفي متناول يدك");
  const [heroTitleEn, setHeroTitleEn] = useState("Your Residency & Second\nCitizenship Within Reach");
  const [heroDescAr, setHeroDescAr] = useState("نقدّم أشمل برامج الإقامة والجنسية في الإمارات وأوروبا والكاريبي.");
  const [heroDescEn, setHeroDescEn] = useState("We offer the most comprehensive residency and citizenship programs.");

  const [residencyProgs, setResidencyProgs] = useState([]);
  const [citizenshipProgs, setCitizenshipProgs] = useState([]);

  // Load from Supabase
  useEffect(() => {
    supabase
      .from("residency_page_content")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setHeroTitleAr(data.hero_title_ar || heroTitleAr);
          setHeroTitleEn(data.hero_title_en || heroTitleEn);
          setHeroDescAr(data.hero_desc_ar || heroDescAr);
          setHeroDescEn(data.hero_desc_en || heroDescEn);
          if (data.residency_programs) setResidencyProgs(JSON.parse(data.residency_programs));
          if (data.citizenship_programs) setCitizenshipProgs(JSON.parse(data.citizenship_programs));
        }
        setLoaded(true);
      });
  }, []);

  const flash = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("residency_page_content")
      .upsert({
        id: 1,
        hero_title_ar: heroTitleAr,
        hero_title_en: heroTitleEn,
        hero_desc_ar: heroDescAr,
        hero_desc_en: heroDescEn,
        residency_programs: residencyProgs.length > 0 ? JSON.stringify(residencyProgs) : null,
        citizenship_programs: citizenshipProgs.length > 0 ? JSON.stringify(citizenshipProgs) : null,
        updated_at: new Date().toISOString(),
      });
    setSaving(false);
    if (error) flash("❌ خطأ في الحفظ: " + error.message, "error");
    else flash("✅ تم الحفظ بنجاح! سيظهر التغيير فوراً على الموقع.");
  };

  const handleReset = async () => {
    if (!window.confirm("هل تريد إعادة تعيين الصفحة للبيانات الافتراضية؟ سيتم حذف كل التعديلات.")) return;
    setSaving(true);
    const { error } = await supabase
      .from("residency_page_content")
      .upsert({ id: 1, residency_programs: null, citizenship_programs: null, updated_at: new Date().toISOString() });
    setSaving(false);
    if (!error) {
      setResidencyProgs([]);
      setCitizenshipProgs([]);
      flash("🔄 تم إعادة التعيين — الصفحة تستخدم البيانات الافتراضية الآن.");
    }
  };

  const addProgram = () => {
    if (tab === "residency") setResidencyProgs(p => [...p, emptyResidencyProgram()]);
    else setCitizenshipProgs(p => [...p, emptyCitizenshipProgram()]);
  };

  const updateProgram = useCallback((id, updated) => {
    if (tab === "residency") setResidencyProgs(p => p.map(x => x.id === id ? updated : x));
    else setCitizenshipProgs(p => p.map(x => x.id === id ? updated : x));
  }, [tab]);

  const deleteProgram = (id) => {
    if (!window.confirm("حذف هذا البرنامج؟")) return;
    if (tab === "residency") setResidencyProgs(p => p.filter(x => x.id !== id));
    else setCitizenshipProgs(p => p.filter(x => x.id !== id));
  };

  const moveProgram = (id, dir) => {
    const setter = tab === "residency" ? setResidencyProgs : setCitizenshipProgs;
    setter(progs => {
      const arr = [...progs];
      const i = arr.findIndex(x => x.id === id);
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
  };

  if (!["admin", "manager"].includes(role)) {
    return (
      <div style={{ padding: 48, textAlign: "center", fontFamily: ff, direction: "rtl" }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔒</div>
        <h2 style={{ color: C.g800 }}>غير مصرح بالوصول</h2>
        <p style={{ color: C.g400 }}>هذه الصفحة متاحة للمسؤولين فقط</p>
      </div>
    );
  }

  const activeProgs = tab === "residency" ? residencyProgs : citizenshipProgs;
  const defaultCount = tab === "residency" ? 11 : 6;

  return (
    <div style={{ fontFamily: ff, direction: "rtl", padding: "32px clamp(16px,4vw,48px)", maxWidth: 1200, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ color: C.g800, fontWeight: 800, fontSize: "1.5rem", marginBottom: 6 }}>
            🌍 إدارة صفحة الإقامة والجنسية
          </h1>
          <p style={{ color: C.g400, fontSize: ".88rem" }}>
            تحرير محتوى الصفحة العامة — التغييرات تظهر فوراً للزوار
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={handleReset} style={btn("outline")}>🔄 إعادة تعيين</button>
          <button onClick={handleSave} disabled={saving} style={{ ...btn("primary"), opacity: saving ? .7 : 1 }}>
            {saving ? "⏳ جاري الحفظ..." : "💾 حفظ التغييرات"}
          </button>
        </div>
      </div>

      {/* Flash message */}
      {msg && (
        <div style={{
          padding: "12px 20px", borderRadius: 8, marginBottom: 24,
          background: msg.type === "error" ? "rgba(231,76,60,.1)" : "rgba(39,174,96,.1)",
          border: `1px solid ${msg.type === "error" ? "rgba(231,76,60,.3)" : "rgba(39,174,96,.3)"}`,
          color: msg.type === "error" ? C.error : C.success,
          fontWeight: 700,
        }}>
          {msg.text}
        </div>
      )}

      {/* ── Hero Section ─────────────────────────────────────── */}
      <section style={{ background: C.beige, border: "1px solid rgba(201,168,76,.2)", borderRadius: 12, padding: "24px 28px", marginBottom: 28 }}>
        <h2 style={{ color: C.g800, fontWeight: 800, marginBottom: 20, fontSize: "1rem" }}>🏠 قسم الهيرو (أعلى الصفحة)</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 28px" }}>
          <div>
            <span style={label}>العنوان (عربي)</span>
            <textarea style={textarea} value={heroTitleAr} onChange={e => setHeroTitleAr(e.target.value)} rows={2} />
          </div>
          <div>
            <span style={label}>Title (English)</span>
            <textarea style={textarea} value={heroTitleEn} onChange={e => setHeroTitleEn(e.target.value)} rows={2} />
          </div>
          <div>
            <span style={label}>الوصف (عربي)</span>
            <textarea style={textarea} value={heroDescAr} onChange={e => setHeroDescAr(e.target.value)} rows={3} />
          </div>
          <div>
            <span style={label}>Description (English)</span>
            <textarea style={textarea} value={heroDescEn} onChange={e => setHeroDescEn(e.target.value)} rows={3} />
          </div>
        </div>
      </section>

      {/* ── Programs Section ──────────────────────────────────── */}
      <section style={{ background: "#fff", border: "1px solid rgba(201,168,76,.2)", borderRadius: 12, padding: "24px 28px" }}>
        {/* Tab switcher */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 4, background: C.beige, padding: 4, borderRadius: 10, border: "1px solid rgba(201,168,76,.2)" }}>
            {[
              { key: "residency", label: "🏡 برامج الإقامة" },
              { key: "citizenship", label: "🌍 برامج الجنسية" },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: "8px 20px", borderRadius: 8, border: "none",
                  cursor: "pointer", fontFamily: ff, fontWeight: 700,
                  fontSize: ".85rem", transition: "all .2s",
                  background: tab === t.key ? `linear-gradient(135deg,${C.goldD},${C.gold})` : "transparent",
                  color: tab === t.key ? C.dark : C.g400,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: ".8rem", color: C.g400 }}>
              {activeProgs.length === 0
                ? `يستخدم ${defaultCount} برنامج افتراضي`
                : `${activeProgs.length} برنامج مخصص`}
            </span>
            <button onClick={addProgram} style={btn("primary")}>
              + إضافة برنامج
            </button>
          </div>
        </div>

        {activeProgs.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "48px 24px",
            border: "2px dashed rgba(201,168,76,.2)", borderRadius: 12,
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>
              {tab === "residency" ? "🏡" : "🌍"}
            </div>
            <p style={{ color: C.g400, marginBottom: 16 }}>
              الصفحة تستخدم البيانات الافتراضية ({defaultCount} برنامج)
            </p>
            <p style={{ color: C.g400, fontSize: ".84rem", marginBottom: 20 }}>
              أضف برنامجاً لتخصيص القائمة وتجاوز البيانات الافتراضية
            </p>
            <button onClick={addProgram} style={btn("primary")}>
              + إضافة أول برنامج
            </button>
          </div>
        ) : (
          <div>
            {activeProgs.map((prog, i) => (
              <div key={prog.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                {/* Reorder buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 14, flexShrink: 0 }}>
                  <button
                    onClick={() => moveProgram(prog.id, -1)}
                    disabled={i === 0}
                    style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(201,168,76,.2)", background: "transparent", cursor: "pointer", color: C.gold, fontSize: ".8rem", opacity: i === 0 ? .3 : 1 }}
                  >▲</button>
                  <button
                    onClick={() => moveProgram(prog.id, 1)}
                    disabled={i === activeProgs.length - 1}
                    style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(201,168,76,.2)", background: "transparent", cursor: "pointer", color: C.gold, fontSize: ".8rem", opacity: i === activeProgs.length - 1 ? .3 : 1 }}
                  >▼</button>
                </div>
                <div style={{ flex: 1 }}>
                  <ProgramEditor
                    prog={prog}
                    index={i}
                    type={tab}
                    onChange={updated => updateProgram(prog.id, updated)}
                    onDelete={() => deleteProgram(prog.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Save button bottom */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24, gap: 12 }}>
        <button onClick={handleReset} style={btn("outline")}>🔄 إعادة تعيين للافتراضي</button>
        <button onClick={handleSave} disabled={saving} style={{ ...btn("primary"), opacity: saving ? .7 : 1, padding: "12px 32px" }}>
          {saving ? "⏳ جاري الحفظ..." : "💾 حفظ كل التغييرات"}
        </button>
      </div>
    </div>
  );
}
