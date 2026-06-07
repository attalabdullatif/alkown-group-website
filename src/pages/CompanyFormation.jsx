// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Company Formation Page
// تصميم موحد مع باقي الموقع — يستخدم CSS variables الديناميكية
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo } from "react";
import { setSEOMeta } from "../services/seoService";
import { useContent } from "../context/ContentContext";

// ── بيانات الصفحة ──────────────────────────────────────────────
const PACKAGES = [
  {
    nameAr: "باقة المبتدئ",   nameEn: "Starter Package",
    icon: "🚀", popular: false,
    priceAr: "يبدأ من 3,500 درهم", priceEn: "From AED 3,500",
    featuresAr: ["تسجيل الشركة","رخصة تجارية","عنوان تجاري","خدمة العملاء"],
    featuresEn: ["Company Registration","Trade License","Business Address","Customer Support"],
  },
  {
    nameAr: "باقة الأعمال",   nameEn: "Business Package",
    icon: "💼", popular: true,
    priceAr: "يبدأ من 7,000 درهم", priceEn: "From AED 7,000",
    featuresAr: ["كل ما في المبتدئ","فيزا المدير","حساب بنكي","مستشار قانوني","خدمة PRO"],
    featuresEn: ["All Starter features","Manager Visa","Bank Account","Legal Advisor","PRO Services"],
  },
  {
    nameAr: "باقة المستثمر",  nameEn: "Investor Package",
    icon: "👑", popular: false,
    priceAr: "حسب الطلب", priceEn: "Custom Pricing",
    featuresAr: ["كل ما في الأعمال","إقامة المستثمر","الفيزا الذهبية","خدمة VIP كاملة","مستشار ضريبي"],
    featuresEn: ["All Business features","Investor Residency","Golden Visa","Full VIP Service","Tax Advisor"],
  },
];

const JURISDICTIONS = [
  { nameAr:"دبي — البر الرئيسي", nameEn:"Dubai Mainland",    flag:"🇦🇪", timeAr:"5-10 أيام",    timeEn:"5-10 days",    benefitsAr:"تجارة محلية حرة، بدون قيود قطاعية",           benefitsEn:"Free local trade, no sector restrictions" },
  { nameAr:"دبي — المنطقة الحرة",nameEn:"Dubai Free Zone",   flag:"🏢", timeAr:"3-7 أيام",     timeEn:"3-7 days",     benefitsAr:"ملكية 100%، إعفاء ضريبي 50 عاماً",             benefitsEn:"100% ownership, 50-year tax exemption" },
  { nameAr:"تركيا",               nameEn:"Turkey",             flag:"🇹🇷", timeAr:"7-14 يوم",    timeEn:"7-14 days",    benefitsAr:"بيئة أعمال قوية، سوق أوروبي وآسيوي",          benefitsEn:"Strong business environment, EU & Asian market" },
  { nameAr:"المملكة المتحدة",     nameEn:"United Kingdom",     flag:"🇬🇧", timeAr:"24-48 ساعة",  timeEn:"24-48 hours",  benefitsAr:"أسرع تسجيل شركات في العالم، سمعة عالمية",     benefitsEn:"Fastest registration globally, worldwide reputation" },
];

const STEPS = {
  ar: [
    { icon:"💬", t:"استشارة مجانية" },
    { icon:"🏢", t:"اختيار نوع الشركة" },
    { icon:"📄", t:"تجهيز الوثائق" },
    { icon:"✅", t:"التسجيل الرسمي" },
    { icon:"📋", t:"الحصول على الرخصة" },
    { icon:"🏦", t:"فتح حساب بنكي" },
  ],
  en: [
    { icon:"💬", t:"Free Consultation" },
    { icon:"🏢", t:"Choose Company Type" },
    { icon:"📄", t:"Document Preparation" },
    { icon:"✅", t:"Official Registration" },
    { icon:"📋", t:"License Issuance" },
    { icon:"🏦", t:"Bank Account Opening" },
  ],
};

const WHY = {
  ar: [
    { icon:"⚡", t:"تأسيس سريع",      d:"خلال 48 ساعة لبعض الأنواع مع الوثائق الكاملة" },
    { icon:"🛡", t:"امتثال قانوني",    d:"جميع الإجراءات معتمدة ومرخصة رسمياً" },
    { icon:"💼", t:"خدمة متكاملة",    d:"من التسجيل حتى الحساب البنكي والفيزا" },
    { icon:"🌍", t:"4 مناطق قضائية", d:"الإمارات وتركيا والمملكة المتحدة وأكثر" },
    { icon:"👑", t:"دعم VIP",          d:"مستشارك الشخصي متاح طوال العملية" },
    { icon:"💰", t:"أسعار تنافسية",   d:"باقات مرنة تناسب جميع أحجام الأعمال" },
  ],
  en: [
    { icon:"⚡", t:"Fast Setup",         d:"As fast as 48 hours with full documentation" },
    { icon:"🛡", t:"Legal Compliance",   d:"All procedures are officially certified and licensed" },
    { icon:"💼", t:"End-to-End Service", d:"From registration to bank account and visa" },
    { icon:"🌍", t:"4 Jurisdictions",    d:"UAE, Turkey, UK and more" },
    { icon:"👑", t:"VIP Support",        d:"Your personal advisor available throughout" },
    { icon:"💰", t:"Competitive Pricing",d:"Flexible packages for all business sizes" },
  ],
};

// ── مكونات مساعدة ────────────────────────────────────────────
function SectionLabel({ text }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:10 }}>
      <div style={{ width:28, height:1, background:"linear-gradient(90deg,transparent,var(--gold))" }} />
      <span style={{ color:"var(--gold)", fontSize:".7rem", letterSpacing:".25em", textTransform:"uppercase", fontWeight:700 }}>{text}</span>
      <div style={{ width:28, height:1, background:"linear-gradient(90deg,var(--gold),transparent)" }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function CompanyFormation({ lang, ff, setPage }) {
  const ar = lang === "ar";
  const { get, getSection } = useContent();
  const g  = (key) => get("company_formation", key, lang) || "";
  const gd = (key, def) => g(key) || def; // with fallback

  // ── helper: parse JSON card from DB ────────────────────────
  const sec = getSection("company_formation", "ar"); // JSON has both langs
  const parseCard = (raw, def) => {
    if (!raw) return def;
    try {
      const d = JSON.parse(raw);
      return { ...def, flag: d.icon||def.flag, nameAr: d.title_ar||def.nameAr, nameEn: d.title_en||def.nameEn,
        timeAr: d.sub_ar||def.timeAr, timeEn: d.sub_en||def.timeEn,
        benefitsAr: d.desc_ar||def.benefitsAr, benefitsEn: d.desc_en||def.benefitsEn };
    } catch { return def; }
  };
  const parseStep = (raw, def) => {
    if (!raw) return def;
    try { const d=JSON.parse(raw); return {icon:d.icon||def.icon, t:lang==="ar"?(d.title_ar||def.t):(d.title_en||def.t)}; }
    catch { return def; }
  };
  const parsePkg = (raw, def) => {
    if (!raw) return def;
    try {
      const d = JSON.parse(raw);
      return { ...def, icon:d.icon||def.icon, nameAr:d.name_ar||def.nameAr, nameEn:d.name_en||def.nameEn,
        priceAr:d.price_ar||def.priceAr, priceEn:d.price_en||def.priceEn,
        popular: d.popular??def.popular,
        featuresAr: d.features_ar?.length ? d.features_ar : def.featuresAr,
        featuresEn: d.features_en?.length ? d.features_en : def.featuresEn,
        bg_color: d.bg_color||"", bg_image: d.bg_image||"",
      };
    } catch { return def; }
  };

  // ── Load arrays from DB ────────────────────────────────────
  const sortedKeys = (prefix) =>
    Object.keys(sec).filter(k=>k.startsWith(prefix+"_"))
      .sort((a,b)=>(parseInt(a.split("_").pop())||0)-(parseInt(b.split("_").pop())||0));

  const dbJurisdictions = useMemo(() => {
    const keys = sortedKeys("jurisdiction");
    return keys.length
      ? keys.map((k,i) => parseCard(sec[k], JURISDICTIONS[i]||JURISDICTIONS[0]))
      : JURISDICTIONS;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sec, lang]);

  const dbSteps = useMemo(() => {
    const keys = sortedKeys("step");
    const defaults = ar ? STEPS.ar : STEPS.en;
    return keys.length
      ? keys.map((k,i) => parseStep(sec[k], defaults[i]||defaults[0]))
      : defaults;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sec, lang]);

  const dbPackages = useMemo(() => {
    const keys = sortedKeys("package");
    return keys.length
      ? keys.map((k,i) => parsePkg(sec[k], PACKAGES[i]||PACKAGES[0]))
      : PACKAGES;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sec]);

  const dbWhy = useMemo(() => {
    const keys = sortedKeys("why");
    const defaults = ar ? WHY.ar : WHY.en;
    if (!keys.length) return defaults;
    return keys.map((k,i) => {
      const raw = sec[k]; const def = defaults[i]||defaults[0];
      if (!raw) return def;
      try { const d=JSON.parse(raw); return {icon:d.icon||def.icon, t:lang==="ar"?(d.title_ar||def.t):(d.title_en||def.t), d:lang==="ar"?(d.desc_ar||def.d):(d.desc_en||def.d)}; }
      catch { return def; }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sec, lang]);

  // Stats from DB (with fallback)
  const stats = [
    { n: gd("stat1_value","500+"), lAr: gd("stat1_label","شركة مؤسسة"),   lEn: gd("stat1_label","Companies Founded") },
    { n: gd("stat2_value","48h"),  lAr: gd("stat2_label","أسرع تأسيس"),   lEn: gd("stat2_label","Fastest Setup") },
    { n: gd("stat3_value","4"),    lAr: gd("stat3_label","دول نعمل فيها"),lEn: gd("stat3_label","Jurisdictions") },
    { n: gd("stat4_value","98%"),  lAr: gd("stat4_label","نسبة النجاح"),  lEn: gd("stat4_label","Success Rate") },
  ];

  useEffect(() => {
    setSEOMeta({
      title: ar ? "تأسيس الشركات في الإمارات وتركيا" : "Company Formation in UAE & Turkey",
      description: ar
        ? "خدمات تأسيس الشركات في الإمارات وتركيا والمملكة المتحدة. ترخيص كامل، حساب بنكي، وإقامة مستثمر."
        : "Company formation services in UAE, Turkey & UK. Full licensing, bank account, and investor residency.",
      lang, canonical:"/company-formation",
    });
  }, [ar, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ fontFamily:ff, direction:ar?"rtl":"ltr" }}>

      {/* ══ HERO ═══════════════════════════════════════════════ */}
      <section style={{
        background:"linear-gradient(145deg,var(--dark) 0%,#1d1205 100%)",
        padding:"100px clamp(20px,6vw,80px) 80px",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(ellipse at 70% 30%,rgba(201,168,76,.08) 0%,transparent 55%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,var(--gold),transparent)", opacity:.3 }} />

        <div style={{ maxWidth:860, margin:"0 auto", textAlign:"center", position:"relative" }} className="fu">

          {/* Badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(201,168,76,.1)", border:"1px solid rgba(201,168,76,.3)", borderRadius:40, padding:"6px 22px", marginBottom:24 }}>
            <span style={{ color:"var(--gold)", fontSize:".7rem", letterSpacing:".22em", textTransform:"uppercase", fontWeight:700 }}>
              🏢 {gd("hero_badge", ar?"تأسيس الشركات":"Company Formation")}
            </span>
          </div>

          <h1 className="shimmer fu2" style={{ fontWeight:800, fontSize:"clamp(2rem,4.5vw,3.4rem)", marginBottom:18, lineHeight:1.2 }}>
            {gd("hero_title", ar?"أسّس شركتك في الإمارات وتركيا":"Start Your Company in UAE & Turkey")}
          </h1>

          <p className="fu3" style={{ color:"rgba(255,255,255,.6)", fontSize:"1rem", lineHeight:1.85, maxWidth:620, margin:"0 auto 40px" }}>
            {gd("hero_subtitle", ar?"نتولى كل خطوة من التسجيل حتى الترخيص وفتح الحساب البنكي.":"We handle every step from registration to licensing and bank account opening.")}
          </p>

          <div className="fu4" style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <button className="gbtn" style={{ fontFamily:ff }} onClick={() => setPage("booking")}>
              {gd("hero_cta1", ar?"احصل على استشارة مجانية":"Get Free Consultation")}
            </button>
            <a href="https://wa.me/971544909522" target="_blank" rel="noreferrer"
              style={{ padding:"14px 28px", background:"rgba(37,211,102,.1)", border:"1.5px solid rgba(37,211,102,.35)", borderRadius:4, color:"#25d366", fontFamily:ff, fontWeight:700, fontSize:".88rem", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:8, transition:"all .3s" }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(37,211,102,.18)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(37,211,102,.1)"}
            >💬 WhatsApp</a>
          </div>
        </div>
      </section>

      {/* ══ STATS ══════════════════════════════════════════════ */}
      <div style={{ background:"var(--bgWarm,#faf7f2)", borderBottom:"1px solid rgba(201,168,76,.1)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))" }}>
          {stats.map((s,i,arr) => (
            <div key={i} style={{
              textAlign:"center", padding:"30px 16px",
              borderInlineEnd: i<arr.length-1 ? "1px solid rgba(201,168,76,.12)" : "none",
            }}>
              <div style={{ fontSize:"2.2rem", fontWeight:800, color:"var(--gold)", fontFamily:ff }}>{s.n}</div>
              <div style={{ fontSize:".75rem", color:"var(--g400,#7a6b50)", marginTop:5, letterSpacing:".1em" }}>{ar?s.lAr:s.lEn}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ JURISDICTIONS ══════════════════════════════════════ */}
      <section style={{ padding:"80px clamp(20px,6vw,72px)", background:"#fff" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <SectionLabel text={ar?"المناطق المتاحة":"Available Jurisdictions"} />
            <h2 style={{ fontSize:"clamp(1.6rem,3.5vw,2.4rem)", fontWeight:800, color:"var(--g800,#1e1508)", marginTop:8 }}>
              {ar ? "نؤسس شركتك في" : "We Register Your Company In"}
            </h2>
            <div className="gl" style={{ margin:"16px auto 0" }} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:20 }}>
            {dbJurisdictions.map((j,i) => (
              <div key={i} className="card" style={{ padding:"28px 24px", borderRadius:12 }}>
                <div style={{ fontSize:"2.4rem", marginBottom:14 }}>{j.flag}</div>
                <h3 style={{ fontWeight:700, color:"var(--g800,#1e1508)", marginBottom:8, fontSize:"1rem" }}>{ar?j.nameAr:j.nameEn}</h3>
                <div className="gl" />
                <div style={{ color:"var(--gold)", fontSize:".82rem", marginBottom:8 }}>⏱ {ar?j.timeAr:j.timeEn}</div>
                <p style={{ color:"var(--g400,#7a6b50)", fontSize:".83rem", lineHeight:1.65 }}>{ar?j.benefitsAr:j.benefitsEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═══════════════════════════════════════ */}
      <section style={{ padding:"80px clamp(20px,6vw,72px)", background:"var(--bgWarm,#faf7f2)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <SectionLabel text={ar?"خطوات التأسيس":"The Process"} />
            <h2 style={{ fontSize:"clamp(1.6rem,3.5vw,2.4rem)", fontWeight:800, color:"var(--g800,#1e1508)", marginTop:8 }}>
              {ar ? "كيف نؤسس شركتك؟" : "How We Set Up Your Company"}
            </h2>
            <div className="gl" style={{ margin:"16px auto 0" }} />
          </div>
          <div style={{ background:`linear-gradient(135deg,var(--dark,#16100a),#1d1205)`, borderRadius:16, padding:"52px clamp(20px,4vw,52px)", border:"1px solid rgba(201,168,76,.15)" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:32 }}>
              {dbSteps.map((step,i) => (
                <div key={i} style={{ textAlign:"center" }}>
                  <div style={{ position:"relative", marginBottom:16 }}>
                    <div style={{ width:56, height:56, borderRadius:"50%", background:`linear-gradient(135deg,var(--goldD,#8a6010),var(--gold,#c9a84c))`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto", fontSize:"1.3rem", boxShadow:`0 4px 18px rgba(201,168,76,.3)` }}>
                      {step.icon}
                    </div>
                    <div style={{ position:"absolute", top:-6, insetInlineEnd:-4, width:22, height:22, borderRadius:"50%", background:"var(--gold,#c9a84c)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".65rem", fontWeight:800, color:"var(--dark,#16100a)" }}>
                      {i+1}
                    </div>
                  </div>
                  <div style={{ color:"rgba(255,255,255,.8)", fontSize:".88rem", lineHeight:1.5, fontWeight:500 }}>{step.t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ PACKAGES ═══════════════════════════════════════════ */}
      <section style={{ padding:"80px clamp(20px,6vw,72px)", background:"#fff" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <SectionLabel text={ar?"باقاتنا":"Our Packages"} />
            <h2 style={{ fontSize:"clamp(1.6rem,3.5vw,2.4rem)", fontWeight:800, color:"var(--g800,#1e1508)", marginTop:8 }}>
              {ar ? "اختر الباقة المناسبة لك" : "Choose the Right Package"}
            </h2>
            <div className="gl" style={{ margin:"16px auto 0" }} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:24 }}>
            {dbPackages.map((pkg,i) => (
              <div key={i} style={{
                background:"#fff",
                border:`2px solid ${pkg.popular?"var(--gold,#c9a84c)":"rgba(201,168,76,.14)"}`,
                borderRadius:14, padding:"34px 28px", position:"relative",
                boxShadow: pkg.popular?"0 12px 48px rgba(201,168,76,.18)":"none",
                transition:"all .3s",
              }}
                onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-6px)"; e.currentTarget.style.boxShadow="0 20px 60px rgba(201,168,76,.2)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=pkg.popular?"0 12px 48px rgba(201,168,76,.18)":"none"; }}
              >
                {pkg.popular && (
                  <div style={{
                    position:"absolute", top:-13, left:"50%", transform:"translateX(-50%)",
                    background:`linear-gradient(135deg,var(--goldD,#8a6010),var(--gold,#c9a84c))`,
                    color:"var(--dark,#16100a)", padding:"5px 18px", borderRadius:20,
                    fontSize:".7rem", fontWeight:800, letterSpacing:".1em", whiteSpace:"nowrap",
                  }}>⭐ {ar?"الأكثر طلباً":"Most Popular"}</div>
                )}
                <div style={{ fontSize:"2.4rem", marginBottom:14 }}>{pkg.icon}</div>
                <h3 style={{ fontWeight:800, fontSize:"1.1rem", color:"var(--g800,#1e1508)", marginBottom:6 }}>{ar?pkg.nameAr:pkg.nameEn}</h3>
                <div className="gl" />
                <div style={{ color:"var(--gold,#c9a84c)", fontWeight:700, fontSize:"1.05rem", marginBottom:22 }}>{ar?pkg.priceAr:pkg.priceEn}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
                  {(ar?pkg.featuresAr:pkg.featuresEn).map((f,j) => (
                    <div key={j} style={{ display:"flex", alignItems:"center", gap:10, color:"var(--g600,#3d3020)", fontSize:".88rem" }}>
                      <span style={{ color:"var(--gold,#c9a84c)", fontWeight:800, fontSize:".9rem" }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setPage("booking")}
                  className={pkg.popular ? "gbtn" : "obtn"}
                  style={{ width:"100%", fontFamily:ff, fontSize:".88rem" }}>
                  {ar ? "ابدأ الآن" : "Get Started"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHY US ═════════════════════════════════════════════ */}
      <section style={{ padding:"80px clamp(20px,6vw,72px)", background:"var(--bgWarm,#faf7f2)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <SectionLabel text={ar?"لماذا الكون":"Why Alkown"} />
            <h2 style={{ fontSize:"clamp(1.6rem,3.5vw,2.4rem)", fontWeight:800, color:"var(--g800,#1e1508)", marginTop:8 }}>
              {ar ? "ما يميزنا عن غيرنا" : "What Sets Us Apart"}
            </h2>
            <div className="gl" style={{ margin:"16px auto 0" }} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:20 }}>
            {dbWhy.map((w,i) => (
              <div key={i} className="card" style={{ padding:"30px 26px", display:"flex", gap:18, alignItems:"flex-start" }}>
                <div style={{ width:50, height:50, flexShrink:0, borderRadius:3, background:"rgba(201,168,76,.08)", border:"1px solid rgba(201,168,76,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem" }}>
                  {w.icon}
                </div>
                <div>
                  <h4 style={{ fontWeight:700, color:"var(--g800,#1e1508)", marginBottom:6, fontSize:".98rem" }}>{w.t}</h4>
                  <div className="gl" style={{ marginBottom:8 }} />
                  <p style={{ color:"var(--g400,#7a6b50)", fontSize:".84rem", lineHeight:1.7 }}>{w.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════════════ */}
      <section style={{ padding:"80px clamp(20px,6vw,72px)", background:`linear-gradient(135deg,var(--dark,#16100a),#1d1205)`, textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(ellipse at 50% 0%,rgba(201,168,76,.08),transparent 60%)", pointerEvents:"none" }} />
        <div style={{ maxWidth:700, margin:"0 auto", position:"relative" }}>
          <SectionLabel text={ar?"ابدأ اليوم":"Start Today"} />
          <h2 className="shimmer" style={{ fontSize:"clamp(1.8rem,4vw,2.8rem)", fontWeight:800, margin:"12px 0 16px" }}>
            {gd("cta_title", ar?"جاهز لتأسيس شركتك؟":"Ready to Start Your Company?")}
          </h2>
          <p style={{ color:"rgba(255,255,255,.55)", lineHeight:1.85, marginBottom:36, fontSize:".98rem" }}>
            {gd("cta_subtitle", ar?"تواصل معنا اليوم واحصل على استشارة مجانية.":"Contact us today for a free consultation.")}
          </p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <button className="gbtn" style={{ fontFamily:ff }} onClick={() => setPage("booking")}>
              {gd("cta_btn1", ar?"احجز استشارة مجانية":"Book Free Consultation")}
            </button>
            <button className="obtn" style={{ fontFamily:ff }} onClick={() => setPage("contact")}>
              {gd("cta_btn2", ar?"تواصل معنا":"Contact Us")}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
