import { useEffect, useState } from "react";
import {
  fetchCountries, checkVisa, codeToFlag,
} from "../../lib/visaIntelligenceService";

// ─── Constants ────────────────────────────────────────────────────────────────
const GOLD   = "#c9a84c";
const DARK   = "#0f0d09";
const CARD   = "#1a1510";
const BORDER = "rgba(201,168,76,.18)";
const MUTED  = "rgba(255,255,255,.45)";
const FF     = "'Cairo','Noto Naskh Arabic',sans-serif";

const VISA_ICON = {
  visa_free:       "✅",
  visa_on_arrival: "🟡",
  evisa:           "💻",
  eta:             "📋",
  visa_required:   "🔴",
  embassy_visa:    "🔴",
};

// ─── Searchable Country Select ────────────────────────────────────────────────
function CountrySelect({ label, value, onChange, countries, placeholder }) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");

  const selected = countries.find(c => c.code === value);
  const filtered = countries.filter(c =>
    c.name_ar.includes(search) || c.name_en.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search.toUpperCase())
  );

  function pick(code) { onChange(code); setOpen(false); setSearch(""); }

  return (
    <div style={{ position:"relative", flex:1 }}>
      <div style={{ fontSize:".75rem", color: GOLD, marginBottom:6, fontWeight:700, letterSpacing:".08em" }}>{label}</div>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          background:"rgba(255,255,255,.04)", border:`1px solid ${open ? GOLD : BORDER}`,
          borderRadius:10, padding:"12px 16px", cursor:"pointer", userSelect:"none",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          transition:"border .2s",
        }}
      >
        {selected
          ? <span style={{ fontWeight:700 }}>{codeToFlag(selected.code)} {selected.name_ar}</span>
          : <span style={{ color: MUTED }}>{placeholder}</span>
        }
        <span style={{ color: GOLD, fontSize:".75rem" }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{
          position:"absolute", top:"100%", right:0, left:0, zIndex:100,
          background:"#1e1912", border:`1px solid ${BORDER}`, borderRadius:10,
          marginTop:4, maxHeight:240, overflowY:"auto", boxShadow:"0 16px 40px rgba(0,0,0,.6)",
        }}>
          <div style={{ padding:"8px 10px", borderBottom:`1px solid ${BORDER}` }}>
            <input
              autoFocus
              placeholder="بحث…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width:"100%", background:"transparent", border:"none", outline:"none",
                color:"#fff", fontFamily: FF, fontSize:".88rem",
              }}
            />
          </div>
          {filtered.length === 0
            ? <div style={{ padding:"14px", color: MUTED, fontSize:".82rem", textAlign:"center" }}>لا توجد نتائج</div>
            : filtered.map(c => (
              <div
                key={c.code}
                onClick={() => pick(c.code)}
                style={{
                  padding:"10px 14px", cursor:"pointer", display:"flex", alignItems:"center", gap:10,
                  background: c.code === value ? "rgba(201,168,76,.1)" : "transparent",
                  borderBottom:`1px solid rgba(255,255,255,.04)`,
                  transition:"background .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,.08)"}
                onMouseLeave={e => e.currentTarget.style.background = c.code === value ? "rgba(201,168,76,.1)" : "transparent"}
              >
                <span style={{ fontSize:"1.2rem" }}>{codeToFlag(c.code)}</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:".88rem" }}>{c.name_ar}</div>
                  <div style={{ color: MUTED, fontSize:".72rem" }}>{c.name_en}</div>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────
function ResultCard({ result, onReset }) {
  if (!result.found) return (
    <div style={{
      ...cardSt, borderTop:`3px solid #888`, textAlign:"center", padding:"40px 32px",
    }}>
      <div style={{ fontSize:"2rem", marginBottom:12 }}>🔍</div>
      <div style={{ color:"#fff", fontWeight:800, fontSize:"1.1rem", marginBottom:8 }}>لا توجد بيانات لهذه الرحلة</div>
      <div style={{ color: MUTED, fontSize:".88rem", marginBottom:24, lineHeight:1.7 }}>
        {result.message_ar || "لم يتم العثور على معلومات تأشيرة. يرجى التواصل معنا مباشرة."}
      </div>
      <a href="/booking" style={{ ...ctaBtnSt, textDecoration:"none" }}>
        📞 احجز استشارة مجانية
      </a>
    </div>
  );

  const color = result.color;

  return (
    <div style={{ ...cardSt, borderTop:`3px solid ${color}` }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ color: MUTED, fontSize:".78rem", marginBottom:6 }}>
            {codeToFlag(result.nationality?.code)} {result.nationality?.name_ar}
            {result.residence && ` · مقيم في ${codeToFlag(result.residence.code)} ${result.residence.name_ar}`}
            {" → "}
            {codeToFlag(result.destination?.code)} {result.destination?.name_ar}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:"1.6rem" }}>{VISA_ICON[result.visa_requirement]}</span>
            <div>
              <div style={{ color, fontWeight:900, fontSize:"1.3rem" }}>{result.label_ar}</div>
              <div style={{ color: MUTED, fontSize:".78rem" }}>{result.label_en}</div>
            </div>
          </div>
        </div>
        <button onClick={onReset} style={{
          background:"transparent", border:`1px solid ${BORDER}`, color: MUTED,
          borderRadius:8, padding:"6px 14px", cursor:"pointer", fontFamily: FF, fontSize:".78rem",
        }}>
          ← بحث جديد
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"flex", gap:12, marginBottom:24, flexWrap:"wrap" }}>
        {result.stay_days != null && (
          <StatChip icon="📅" label="مدة الإقامة" value={result.stay_text} />
        )}
        {result.processing_text && (
          <StatChip icon="⏳" label="وقت المعالجة" value={result.processing_text} />
        )}
        {result.fee_text && (
          <StatChip icon="💵" label="الرسوم" value={result.fee_text} color={result.fee_usd ? GOLD : "#22c55e"} />
        )}
      </div>

      {/* Documents */}
      {result.documents?.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <div style={{ color: GOLD, fontWeight:700, fontSize:".88rem", marginBottom:12 }}>📋 المستندات المطلوبة</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {result.documents.map((doc, i) => (
              <div key={i} style={{
                background:"rgba(255,255,255,.03)", border:`1px solid ${BORDER}`,
                borderRadius:8, padding:"10px 12px",
              }}>
                <div style={{ fontWeight:700, fontSize:".83rem", color:"#fff", marginBottom: doc.notes_ar ? 4 : 0 }}>
                  ✓ {doc.label_ar}
                </div>
                {doc.notes_ar && (
                  <div style={{ color: MUTED, fontSize:".72rem", lineHeight:1.5 }}>{doc.notes_ar}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {result.notes_ar && (
        <div style={{
          background:"rgba(201,168,76,.06)", border:`1px solid rgba(201,168,76,.2)`,
          borderRadius:8, padding:"14px 16px", marginBottom:24,
        }}>
          <div style={{ color: GOLD, fontWeight:700, fontSize:".82rem", marginBottom:6 }}>ℹ️ ملاحظات مهمة</div>
          <div style={{ color:"rgba(255,255,255,.8)", fontSize:".85rem", lineHeight:1.8 }}>{result.notes_ar}</div>
        </div>
      )}

      {/* CTA */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        <a href="/booking" style={{ ...ctaBtnSt, textDecoration:"none" }}>
          ✈️ قدّم طلبك الآن
        </a>
        <a href="/portal" style={{
          ...ctaBtnSt, background:"transparent",
          border:`1px solid ${BORDER}`, color:"rgba(255,255,255,.7)",
          textDecoration:"none",
        }}>
          📞 تواصل مع خبير
        </a>
      </div>

      <div style={{ color: MUTED, fontSize:".7rem", marginTop:16 }}>
        آخر تحديث: {result.last_verified || "2025"} · المعلومات استرشادية، يُنصح بالتحقق من السفارة
      </div>
    </div>
  );
}

function StatChip({ icon, label, value, color = "rgba(255,255,255,.85)" }) {
  return (
    <div style={{
      background:"rgba(255,255,255,.04)", border:`1px solid ${BORDER}`,
      borderRadius:10, padding:"12px 16px", flex:"1 1 120px", textAlign:"center",
    }}>
      <div style={{ fontSize:"1.2rem", marginBottom:4 }}>{icon}</div>
      <div style={{ color: MUTED, fontSize:".68rem", marginBottom:3 }}>{label}</div>
      <div style={{ color, fontWeight:800, fontSize:".95rem" }}>{value}</div>
    </div>
  );
}

// ─── Popular Routes ───────────────────────────────────────────────────────────
function PopularRoutes({ countries, onSelect }) {
  const popular = [
    { from:"SY", to:"TR" }, { from:"SY", to:"AE" }, { from:"SY", to:"GE" },
    { from:"JO", to:"AE" }, { from:"SA", to:"AE" }, { from:"EG", to:"TR" },
    { from:"PK", to:"AE" }, { from:"IQ", to:"TR" }, { from:"LB", to:"TR" },
    { from:"SY", to:"JP" }, { from:"SA", to:"DE" }, { from:"JO", to:"DE" },
  ];

  const cc = Object.fromEntries(countries.map(c => [c.code, c]));

  return (
    <div style={{ marginTop:40 }}>
      <div style={{ textAlign:"center", color: MUTED, fontSize:".8rem", marginBottom:16, letterSpacing:".12em" }}>
        ✦ وجهات شائعة
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" }}>
        {popular.filter(p => cc[p.from] && cc[p.to]).map((p, i) => (
          <button
            key={i}
            onClick={() => onSelect(p.from, p.to)}
            style={{
              background:"rgba(255,255,255,.04)", border:`1px solid ${BORDER}`,
              borderRadius:20, padding:"8px 16px", cursor:"pointer", color:"rgba(255,255,255,.75)",
              fontFamily: FF, fontSize:".8rem", transition:"all .2s",
              display:"flex", alignItems:"center", gap:6,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,.1)"; e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.04)"; e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = "rgba(255,255,255,.75)"; }}
          >
            {codeToFlag(p.from)} → {codeToFlag(p.to)}
            <span style={{ color: MUTED }}>·</span>
            <span>{cc[p.from].name_ar} → {cc[p.to].name_ar}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const cardSt = {
  background: CARD, border:`1px solid ${BORDER}`,
  borderRadius:16, padding:"28px 28px",
};
const ctaBtnSt = {
  background: `linear-gradient(135deg,${GOLD},#a87d2e)`,
  color:"#1a1510", border:"none", borderRadius:10, padding:"12px 24px",
  cursor:"pointer", fontFamily: FF, fontWeight:800, fontSize:".9rem",
  display:"inline-block",
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VisaChecker() {
  const [countries,    setCountries]    = useState([]);
  const [nationality,  setNationality]  = useState("");
  const [destination,  setDestination]  = useState("");
  const [residence,    setResidence]    = useState("");
  const [result,       setResult]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [loadingInit,  setLoadingInit]  = useState(true);

  useEffect(() => {
    fetchCountries()
      .then(setCountries)
      .catch(console.warn)
      .finally(() => setLoadingInit(false));
  }, []);

  async function handleCheck(e) {
    e?.preventDefault();
    if (!nationality || !destination) return;
    setLoading(true); setResult(null);
    try {
      const res = await checkVisa({
        nationalityCode: nationality,
        destinationCode: destination,
        residenceCode:   residence || null,
      });
      setResult(res);
      setTimeout(() => document.getElementById("visa-result")?.scrollIntoView({ behavior:"smooth" }), 100);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  function handlePopularSelect(from, to) {
    setNationality(from); setDestination(to); setResidence(""); setResult(null);
  }

  function handleReset() { setResult(null); setNationality(""); setDestination(""); setResidence(""); }

  return (
    <div style={{
      minHeight:"100vh", background: DARK, color:"#fff",
      fontFamily: FF, direction:"rtl",
    }}>
      {/* Hero */}
      <div style={{
        background:`linear-gradient(160deg,#1a1510 0%,#0f0d09 60%,#1a1008 100%)`,
        borderBottom:`1px solid ${BORDER}`,
        padding:"60px 24px 48px",
        textAlign:"center",
      }}>
        <div style={{ maxWidth:800, margin:"0 auto" }}>
          <div style={{ color: GOLD, letterSpacing:".18em", fontSize:".75rem", marginBottom:12, textTransform:"uppercase" }}>
            Alkown Global · نظام التأشيرات الذكي
          </div>
          <h1 style={{ fontWeight:900, fontSize:"clamp(1.6rem,4vw,2.6rem)", margin:"0 0 12px", lineHeight:1.3 }}>
            هل تحتاج تأشيرة؟
          </h1>
          <p style={{ color: MUTED, fontSize:"1rem", lineHeight:1.8, margin:"0 0 40px" }}>
            اكتشف متطلبات التأشيرة، المستندات المطلوبة، وأوقات المعالجة لأي رحلة حول العالم
          </p>

          {/* Search Form */}
          {loadingInit ? (
            <div style={{ color: MUTED, padding:24 }}>جار التحميل…</div>
          ) : (
            <form onSubmit={handleCheck} style={{
              background: CARD, border:`1px solid ${BORDER}`,
              borderRadius:16, padding:"28px",
              display:"flex", flexDirection:"column", gap:16,
            }}>
              <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                <CountrySelect
                  label="الجنسية *"
                  value={nationality}
                  onChange={setNationality}
                  countries={countries}
                  placeholder="اختر جنسيتك"
                />
                <CountrySelect
                  label="الوجهة *"
                  value={destination}
                  onChange={setDestination}
                  countries={countries}
                  placeholder="اختر الوجهة"
                />
                <CountrySelect
                  label="بلد الإقامة (اختياري)"
                  value={residence}
                  onChange={setResidence}
                  countries={[{ code:"", name_ar:"بدون تحديد", name_en:"No residence", flag:"🌍" }, ...countries]}
                  placeholder="بلد إقامتك الحالي"
                />
              </div>
              <button
                type="submit"
                disabled={!nationality || !destination || loading}
                style={{
                  ...ctaBtnSt,
                  opacity: (!nationality || !destination) ? .5 : 1,
                  padding:"14px 32px", fontSize:"1rem",
                }}
              >
                {loading ? "جار البحث…" : "🔍 فحص متطلبات التأشيرة"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Results */}
      <div id="visa-result" style={{ maxWidth:800, margin:"0 auto", padding:"40px 24px 80px" }}>
        {result && <ResultCard result={result} onReset={handleReset} />}

        {!result && !loadingInit && (
          <PopularRoutes countries={countries} onSelect={handlePopularSelect} />
        )}
      </div>
    </div>
  );
}
