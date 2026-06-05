// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Visa Center Landing Page
// Premium world-class visa information hub
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from "react";
import { COUNTRIES } from "../../data/countries";
import { getPopularRoutes } from "../../services/visaService";
import { VISA_TYPE_COLORS, VISA_TYPE_LABELS } from "../../data/visaRules";

const C = {
  gold: "#c9a84c", goldLight: "#f0d080", goldGlow: "rgba(201,168,76,0.25)",
  cream: "#faf8f4", warmWhite: "#fffdf8", beige: "#f5f0e8",
  g100: "#f0ece4", g400: "#7a6e5a", g600: "#3d342a", g800: "#1e1810",
  dark: "#1e1a14", darkMid: "#2a2418",
};

// ── COUNTRY SELECT COMPONENT ───────────────────────────────────
function CountrySelect({ value, onChange, placeholder, placeholderAr, lang, ff }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const ar = lang === "ar";

  const filtered = COUNTRIES.filter(c => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.nameAr.includes(search);
  });

  const selected = COUNTRIES.find(c => c.code === value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", flex: 1 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", padding: "16px 20px", background: "rgba(255,253,248,.08)",
          border: `1px solid rgba(201,168,76,${open ? ".6" : ".25"})`,
          borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center",
          gap: 10, color: selected ? "#fff" : "rgba(255,255,255,.5)",
          fontFamily: ff, fontSize: ".95rem", transition: "all .25s", textAlign: "left",
          backdropFilter: "blur(10px)",
        }}
      >
        {selected ? (
          <><span style={{ fontSize: "1.4rem" }}>{selected.flag}</span>
            <span>{ar ? selected.nameAr : selected.name}</span></>
        ) : (
          <span>{ar ? placeholderAr : placeholder}</span>
        )}
        <span style={{ marginLeft: "auto", opacity: .6, fontSize: ".8rem" }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 9999,
          background: C.dark, border: `1px solid rgba(201,168,76,.3)`, borderRadius: 8,
          boxShadow: "0 20px 60px rgba(0,0,0,.5)", maxHeight: 280, display: "flex", flexDirection: "column",
        }}>
          <div style={{ padding: "10px 12px", borderBottom: `1px solid rgba(201,168,76,.15)` }}>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={ar ? "ابحث عن دولة..." : "Search country..."}
              style={{
                width: "100%", padding: "8px 12px", background: "rgba(255,255,255,.06)",
                border: `1px solid rgba(201,168,76,.2)`, borderRadius: 4, color: "#fff",
                fontFamily: ff, fontSize: ".9rem", outline: "none",
              }}
            />
          </div>
          <div style={{ overflowY: "auto", maxHeight: 220 }}>
            {filtered.map(c => (
              <button
                key={c.code}
                onClick={() => { onChange(c.code); setOpen(false); setSearch(""); }}
                style={{
                  width: "100%", padding: "10px 16px", background: c.code === value ? "rgba(201,168,76,.15)" : "transparent",
                  border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                  color: c.code === value ? C.gold : "rgba(255,255,255,.8)", fontFamily: ff,
                  fontSize: ".9rem", textAlign: "left", transition: "background .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,.1)"}
                onMouseLeave={e => e.currentTarget.style.background = c.code === value ? "rgba(201,168,76,.15)" : "transparent"}
              >
                <span style={{ fontSize: "1.2rem" }}>{c.flag}</span>
                <span>{ar ? c.nameAr : c.name}</span>
                <span style={{ marginLeft: "auto", fontSize: ".75rem", color: "rgba(255,255,255,.3)" }}>{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────
export default function VisaCenterPage({ lang, ff, setPage, setVisaParams }) {
  const [nationality, setNationality] = useState("");
  const [residence, setResidence] = useState("");
  const [destination, setDestination] = useState("");
  const [error, setError] = useState("");
  const ar = lang === "ar";
  const popularRoutes = getPopularRoutes();

  const handleCheck = () => {
    if (!nationality || !destination) {
      setError(ar ? "يرجى اختيار الجنسية والوجهة على الأقل" : "Please select at least nationality and destination");
      return;
    }
    setError("");
    setVisaParams({ nationality, residence, destination });
    setPage("visa-result");
  };

  const handlePopularRoute = (route) => {
    setVisaParams({ nationality: route.from, residence: route.res?.code || "", destination: route.to });
    setPage("visa-result");
  };

  return (
    <div style={{ fontFamily: ff, direction: ar ? "rtl" : "ltr" }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{
        minHeight: "92vh", background: `linear-gradient(145deg, ${C.dark} 0%, #2a1f10 50%, #1a1206 100%)`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "80px clamp(20px,6vw,80px) 60px", position: "relative",
      }}>
        {/* Background decoration */}
        <div style={{
          position: "absolute", inset: 0, backgroundImage:
            "radial-gradient(ellipse at 20% 50%, rgba(201,168,76,.08) 0%, transparent 60%)," +
            "radial-gradient(ellipse at 80% 20%, rgba(201,168,76,.05) 0%, transparent 50%)",
          pointerEvents: "none",
        }} />

        {/* Grid pattern */}
        <div style={{
          position: "absolute", inset: 0, opacity: .04,
          backgroundImage: "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 860, width: "100%", textAlign: "center" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(201,168,76,.12)", border: `1px solid rgba(201,168,76,.3)`,
            borderRadius: 40, padding: "7px 20px", marginBottom: 28,
          }}>
            <span style={{ color: C.gold, fontSize: ".72rem", letterSpacing: ".22em", textTransform: "uppercase", fontWeight: 700 }}>
              {ar ? "مركز التأشيرات العالمي" : "Global Visa Intelligence Center"}
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(2.2rem,6vw,4.5rem)", fontWeight: 300, color: "#fff",
            lineHeight: 1.1, marginBottom: 20, letterSpacing: "-.02em",
          }}>
            {ar ? "اعرف تأشيرتك\n" : "Know Your Visa\n"}
            <span style={{ color: C.gold, fontStyle: "italic" }}>
              {ar ? "قبل أن تحجز" : "Before You Book"}
            </span>
          </h1>

          <p style={{ color: "rgba(255,255,255,.6)", fontSize: "clamp(.9rem,2vw,1.1rem)", lineHeight: 1.8, marginBottom: 48, maxWidth: 580, margin: "0 auto 48px" }}>
            {ar
              ? "أداة فحص التأشيرات الأكثر دقة للمسافرين العرب. تحقق فورياً من المتطلبات والمستندات والرسوم."
              : "The most precise visa checker for Arab travelers. Instantly verify requirements, documents, and fees for any route."}
          </p>

          {/* Search Card */}
          <div style={{
            background: "rgba(255,255,255,.04)", backdropFilter: "blur(20px)",
            border: `1px solid rgba(201,168,76,.2)`, borderRadius: 16,
            padding: "clamp(24px,4vw,40px)", boxShadow: "0 40px 80px rgba(0,0,0,.4)",
          }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              <CountrySelect value={nationality} onChange={setNationality}
                placeholder="Your Nationality" placeholderAr="جنسيتك"
                lang={lang} ff={ff} />
              <CountrySelect value={residence} onChange={setResidence}
                placeholder="Country of Residence (optional)" placeholderAr="بلد الإقامة (اختياري)"
                lang={lang} ff={ff} />
              <CountrySelect value={destination} onChange={setDestination}
                placeholder="Destination Country" placeholderAr="الوجهة"
                lang={lang} ff={ff} />
            </div>

            {error && (
              <p style={{ color: "#e74c3c", fontSize: ".85rem", marginBottom: 12, textAlign: "center" }}>{error}</p>
            )}

            <button
              onClick={handleCheck}
              style={{
                width: "100%", padding: "17px 32px",
                background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 50%, ${C.gold} 100%)`,
                border: "none", borderRadius: 8, cursor: "pointer",
                color: C.dark, fontFamily: ff, fontSize: "1rem", fontWeight: 700,
                letterSpacing: ".06em", textTransform: "uppercase",
                boxShadow: `0 8px 30px rgba(201,168,76,.35)`,
                transition: "all .3s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 40px rgba(201,168,76,.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(201,168,76,.35)"; }}
            >
              {ar ? "🔍 فحص متطلبات التأشيرة" : "🔍 Check Visa Requirements"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ position: "relative", zIndex: 0, display: "flex", gap: "clamp(24px,6vw,80px)", marginTop: 52, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { n: "195+", l: ar ? "دولة" : "Countries" },
            { n: "10K+", l: ar ? "مسار تأشيرة" : "Visa Routes" },
            { n: "24/7", l: ar ? "دعم فوري" : "Instant Results" },
            { n: "98%", l: ar ? "دقة البيانات" : "Data Accuracy" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 300, color: C.gold }}>{s.n}</div>
              <div style={{ fontSize: ".75rem", color: "rgba(255,255,255,.4)", letterSpacing: ".12em", textTransform: "uppercase" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── POPULAR ROUTES ─────────────────────────────────────── */}
      <section style={{ padding: "80px clamp(20px,6vw,80px)", background: C.warmWhite }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ display: "inline-block", background: `rgba(201,168,76,.1)`, border: `1px solid rgba(201,168,76,.25)`, borderRadius: 40, padding: "5px 18px", marginBottom: 16 }}>
              <span style={{ color: C.gold, fontSize: ".7rem", letterSpacing: ".22em", textTransform: "uppercase" }}>
                {ar ? "المسارات الشائعة" : "Popular Routes"}
              </span>
            </div>
            <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 300, color: C.g800, marginBottom: 12 }}>
              {ar ? "مسارات يبحث عنها عملاؤنا" : "Routes Our Clients Search Most"}
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
            {popularRoutes.map((route, i) => {
              const typeColor = VISA_TYPE_COLORS[route.rule.type] || C.gold;
              const typeLabel = VISA_TYPE_LABELS[lang][route.rule.type];
              return (
                <button
                  key={i}
                  onClick={() => handlePopularRoute({ from: route.from?.code, res: route.res, to: route.to?.code })}
                  style={{
                    background: "#fff", border: `1px solid rgba(201,168,76,.15)`,
                    borderRadius: 12, padding: "22px 24px", cursor: "pointer", textAlign: "left",
                    transition: "all .3s", boxShadow: "0 2px 12px rgba(0,0,0,.06)",
                    display: "flex", flexDirection: "column", gap: 14,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,.12)"; e.currentTarget.style.borderColor = "rgba(201,168,76,.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.06)"; e.currentTarget.style.borderColor = "rgba(201,168,76,.15)"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "1.8rem" }}>{route.from?.flag}</span>
                    <div style={{ color: C.g400, fontSize: "1rem" }}>→</div>
                    <span style={{ fontSize: "1.8rem" }}>{route.to?.flag}</span>
                    {route.res && (
                      <span style={{ fontSize: ".7rem", color: C.g400, marginLeft: "auto", background: C.beige, padding: "3px 8px", borderRadius: 20 }}>
                        {ar ? `من ${route.res.nameAr}` : `via ${route.res.name}`}
                      </span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: C.g800, fontSize: ".95rem", marginBottom: 4 }}>
                      {ar ? `${route.from?.nameAr} ← ${route.to?.nameAr}` : `${route.from?.name} → ${route.to?.name}`}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: typeColor }} />
                      <span style={{ fontSize: ".8rem", color: C.g400 }}>{typeLabel}</span>
                      <span style={{ marginLeft: "auto", color: C.gold, fontSize: ".8rem", fontWeight: 600 }}>
                        {route.rule.stay}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHY ALKOWN ────────────────────────────────────────── */}
      <section style={{ padding: "80px clamp(20px,6vw,80px)", background: C.dark }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 300, color: "#fff", marginBottom: 52 }}>
            {ar ? "لماذا مركز التأشيرات من الكون؟" : "Why ALKOWN Visa Center?"}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 24 }}>
            {[
              { icon: "🎯", en: "Precision Data", ar: "بيانات دقيقة", descEn: "Real-time verified requirements from official embassy sources.", descAr: "متطلبات محدّثة من مصادر السفارات الرسمية." },
              { icon: "⚡", en: "Instant Results", ar: "نتائج فورية", descEn: "Get complete visa info in seconds, no waiting.", descAr: "احصل على معلومات التأشيرة كاملة في ثوانٍ." },
              { icon: "🌍", en: "195 Countries", ar: "195 دولة", descEn: "Comprehensive coverage for all nationalities and destinations.", descAr: "تغطية شاملة لجميع الجنسيات والوجهات." },
              { icon: "🤝", en: "Expert Support", ar: "دعم الخبراء", descEn: "Our specialists handle complex cases and submissions.", descAr: "متخصصونا يتولون الحالات المعقدة وتقديم الطلبات." },
            ].map((item, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,.04)", border: `1px solid rgba(201,168,76,.15)`,
                borderRadius: 12, padding: "32px 24px", textAlign: "center",
                transition: "all .3s",
              }}>
                <div style={{ fontSize: "2.2rem", marginBottom: 16 }}>{item.icon}</div>
                <div style={{ color: C.gold, fontWeight: 700, marginBottom: 10, fontSize: "1rem" }}>
                  {ar ? item.ar : item.en}
                </div>
                <div style={{ color: "rgba(255,255,255,.5)", fontSize: ".88rem", lineHeight: 1.7 }}>
                  {ar ? item.descAr : item.descEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section style={{ padding: "72px clamp(20px,6vw,80px)", background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 50%, ${C.gold} 100%)` }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, color: C.dark, marginBottom: 12 }}>
            {ar ? "تحتاج مساعدة في التأشيرة؟" : "Need Expert Visa Assistance?"}
          </h2>
          <p style={{ color: "rgba(30,24,16,.7)", marginBottom: 28, fontSize: ".95rem", lineHeight: 1.7 }}>
            {ar
              ? "فريقنا من الخبراء يتولى طلبك كاملاً من البداية للنهاية."
              : "Our expert team handles your entire application from start to finish."}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setPage("visa-apply")}
              style={{
                padding: "14px 36px", background: C.dark, color: C.gold,
                border: "none", borderRadius: 6, cursor: "pointer",
                fontFamily: ff, fontSize: ".9rem", fontWeight: 700,
                letterSpacing: ".08em", transition: "all .3s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              {ar ? "قدّم طلبك الآن" : "Start Your Application"}
            </button>
            <button
              onClick={() => setPage("visa-track")}
              style={{
                padding: "14px 28px", background: "transparent", color: C.dark,
                border: `2px solid ${C.dark}`, borderRadius: 6, cursor: "pointer",
                fontFamily: ff, fontSize: ".9rem", fontWeight: 700, transition: "all .3s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(30,24,16,.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              {ar ? "🔍 تتبع طلبي" : "🔍 Track My Application"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
