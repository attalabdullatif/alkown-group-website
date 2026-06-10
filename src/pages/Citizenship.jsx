// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Citizenship Programs Page
// برامج الجنسية بالاستثمار
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { setSEOMeta } from "../services/seoService";

const PROGRAMS = [
  {
    country: "Malta", countryAr: "مالطا", flag: "🇲🇹",
    badge: "الأسرع في أوروبا", badgeEn: "Fastest in Europe",
    investment: "€690,000+", time: "12-14 شهر", timeEn: "12-14 months",
    passportRank: 8, visaFree: 186,
    color: "#c9284d",
    features: ["جنسية أوروبية كاملة","الإقامة في أي دولة EU","تأشيرة بدون قيود","أفضل نظام رعاية صحية"],
    featuresEn: ["Full EU citizenship","Live in any EU country","Unrestricted travel","Top healthcare system"],
    investment_options: [
      { type: "تبرع حكومي", amount: "€600,000" },
      { type: "عقار", amount: "€700,000" },
      { type: "سندات", amount: "€10,000" },
    ],
  },
  {
    country: "Grenada", countryAr: "غرينادا", flag: "🇬🇩",
    badge: "الأقل تكلفة", badgeEn: "Most Affordable",
    investment: "$150,000+", time: "4-6 أشهر", timeEn: "4-6 months",
    passportRank: 31, visaFree: 144,
    color: "#2f8f5b",
    features: ["دخول مجاني للصين","برنامج E-2 الأمريكي","لا ضريبة دخل","جواز قوي في الكاريبي"],
    featuresEn: ["Visa-free China access","US E-2 Treaty","No income tax","Strong Caribbean passport"],
    investment_options: [
      { type: "صندوق وطني", amount: "$150,000" },
      { type: "مشروع معتمد", amount: "$220,000" },
    ],
  },
  {
    country: "Turkey", countryAr: "تركيا", flag: "🇹🇷",
    badge: "الأسهل للعرب", badgeEn: "Easiest for Arabs",
    investment: "$400,000+", time: "3-6 أشهر", timeEn: "3-6 months",
    passportRank: 50, visaFree: 111,
    color: "#c9a84c",
    features: ["لا يلزم الإقامة","تعدد الجنسيات مسموح","اقتصاد قوي","موقع استراتيجي"],
    featuresEn: ["No residency required","Dual nationality allowed","Strong economy","Strategic location"],
    investment_options: [
      { type: "عقار", amount: "$400,000" },
      { type: "استثمار", amount: "$500,000" },
    ],
  },
  {
    country: "Vanuatu", countryAr: "فانواتو", flag: "🇻🇺",
    badge: "الأسرع عالمياً", badgeEn: "World's Fastest",
    investment: "$130,000+", time: "30-60 يوم", timeEn: "30-60 days",
    passportRank: 42, visaFree: 96,
    color: "#3d6f9f",
    features: ["لا ضريبة على الإطلاق","أسرع جنسية في العالم","لا اختبار لغة","حياة هادئة"],
    featuresEn: ["Zero tax","World's fastest citizenship","No language test","Peaceful lifestyle"],
    investment_options: [
      { type: "تبرع حكومي", amount: "$130,000" },
    ],
  },
  {
    country: "Portugal", countryAr: "البرتغال", flag: "🇵🇹",
    badge: "الأفضل في أوروبا", badgeEn: "Best in Europe",
    investment: "€250,000+", time: "18-24 شهر", timeEn: "18-24 months",
    passportRank: 4, visaFree: 188,
    color: "#7c3aed",
    features: ["جواز أوروبي #4 عالمياً","الإقامة أولاً ثم الجنسية","بيئة معيشة ممتازة","ضرائب منخفضة"],
    featuresEn: ["#4 passport globally","Residency then citizenship","Excellent living","Low taxes"],
    investment_options: [
      { type: "صندوق استثماري", amount: "€500,000" },
      { type: "بحث علمي", amount: "€250,000" },
    ],
  },
  {
    country: "Jordan", countryAr: "الأردن", flag: "🇯🇴",
    badge: "الأنسب للعرب", badgeEn: "Best for Arabs",
    investment: "$750,000+", time: "3-6 أشهر", timeEn: "3-6 months",
    passportRank: 65, visaFree: 51,
    color: "#059669",
    features: ["الإقامة في قلب المنطقة","هوية عربية","استقرار سياسي","تعليم عالمي المستوى"],
    featuresEn: ["Heart of the region","Arab identity","Political stability","World-class education"],
    investment_options: [
      { type: "استثمار مباشر", amount: "$750,000" },
      { type: "وديعة بنكية", amount: "$1,000,000" },
    ],
  },
];

const PASSPORT_COMPARE = [
  { rank: 1,  country: "Schengen (EU)", ar: "دول شنغن", visa_free: 190, color: "#2f8f5b" },
  { rank: 4,  country: "Portugal",      ar: "البرتغال",  visa_free: 188, color: "#7c3aed" },
  { rank: 8,  country: "Malta",         ar: "مالطا",     visa_free: 186, color: "#c9284d" },
  { rank: 31, country: "Grenada",       ar: "غرينادا",   visa_free: 144, color: "#059669" },
  { rank: 50, country: "Turkey",        ar: "تركيا",     visa_free: 111, color: "#c9a84c" },
];

const STEPS_AR = [
  { icon: "💬", t: "استشارة مجانية وتقييم الملف" },
  { icon: "🔍", t: "اختيار البرنامج المناسب" },
  { icon: "📄", t: "تجهيز الوثائق والترجمة" },
  { icon: "💰", t: "تنفيذ الاستثمار" },
  { icon: "✅", t: "تقديم الطلب الرسمي" },
  { icon: "🛂", t: "استلام الجواز" },
];

export default function Citizenship() {
  const [lang, setLang] = useState("ar");
  const ar = lang === "ar";

  useEffect(() => {
    setSEOMeta({
      title:       ar ? "برامج الجنسية بالاستثمار | الكون العالمية" : "Citizenship by Investment | Alkown Global",
      description: ar ? "احصل على جنسية ثانية عبر الاستثمار — مالطا، البرتغال، تركيا، غرينادا وأكثر"
                      : "Get a second citizenship through investment — Malta, Portugal, Turkey, Grenada and more",
      keywords:    "citizenship by investment, second passport, جنسية بالاستثمار, جواز سفر ثاني",
    });
  }, [ar]);

  return (
    <div style={{ fontFamily: "'Cairo','Dubai','Noto Naskh Arabic',sans-serif", direction: ar ? "rtl" : "ltr", background: "var(--bg, #f5f0e8)", minHeight: "100vh" }}>

      {/* Hero */}
      <section style={{
        background: "linear-gradient(135deg, #0d0b08 0%, #1a1510 50%, #0d0b08 100%)",
        padding: "80px 24px 60px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(201,168,76,.08) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", maxWidth: 780, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,168,76,.12)", border: "1px solid rgba(201,168,76,.3)", borderRadius: 30, padding: "6px 18px", marginBottom: 24 }}>
            <span>🌍</span>
            <span style={{ color: "#c9a84c", fontSize: ".82rem", fontWeight: 700, letterSpacing: ".08em" }}>
              {ar ? "برامج الجنسية بالاستثمار" : "Citizenship by Investment Programs"}
            </span>
          </div>
          <h1 style={{ margin: "0 0 20px", fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 900, color: "#fff", lineHeight: 1.25 }}>
            {ar ? <>جواز سفر ثانٍ<br /><span style={{ color: "#c9a84c" }}>يفتح لك العالم</span></> : <>A Second Passport<br /><span style={{ color: "#c9a84c" }}>Opens the World</span></>}
          </h1>
          <p style={{ margin: "0 0 32px", color: "rgba(255,255,255,.65)", fontSize: "1.05rem", lineHeight: 1.8 }}>
            {ar ? "حرية السفر لـ 186+ دولة · حماية الثروة · التخطيط الضريبي · ضمان مستقبل عائلتك"
                : "Travel to 186+ countries · Wealth protection · Tax planning · Secure your family's future"}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#programs" style={{ background: "#c9a84c", color: "#000", padding: "13px 28px", borderRadius: 12, fontWeight: 800, textDecoration: "none", fontSize: ".95rem" }}>
              {ar ? "🌍 استكشف البرامج" : "🌍 Explore Programs"}
            </a>
            <a href="/track-request" style={{ background: "transparent", color: "#c9a84c", border: "1px solid rgba(201,168,76,.4)", padding: "13px 28px", borderRadius: 12, fontWeight: 700, textDecoration: "none", fontSize: ".95rem" }}>
              {ar ? "💬 استشارة مجانية" : "💬 Free Consultation"}
            </a>
          </div>
        </div>

        {/* Lang toggle */}
        <button onClick={() => setLang(l => l === "ar" ? "en" : "ar")} style={{
          position: "absolute", top: 20, left: ar ? 20 : "auto", right: ar ? "auto" : 20,
          background: "rgba(201,168,76,.15)", border: "1px solid rgba(201,168,76,.3)",
          color: "#c9a84c", borderRadius: 8, padding: "6px 14px", cursor: "pointer",
          fontFamily: "inherit", fontSize: ".8rem", fontWeight: 700,
        }}>
          {ar ? "EN" : "عر"}
        </button>
      </section>

      {/* Stats Bar */}
      <div style={{ background: "#1a1510", padding: "18px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "center", gap: "clamp(24px,5vw,60px)", flexWrap: "wrap" }}>
          {[
            { n: "6+",    l: ar ? "برامج معتمدة" : "Approved Programs" },
            { n: "186+",  l: ar ? "دولة بدون تأشيرة" : "Visa-Free Countries" },
            { n: "30 يوم",l: ar ? "أسرع جنسية" : "Fastest Citizenship" },
            { n: "500+",  l: ar ? "عميل حاصل على جنسية" : "Clients Naturalized" },
          ].map(s => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#c9a84c" }}>{s.n}</div>
              <div style={{ fontSize: ".75rem", color: "rgba(255,255,255,.5)", marginTop: 3 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 20px" }}>

        {/* Programs Grid */}
        <section id="programs">
          <SectionHeader
            tag={ar ? "البرامج المتاحة" : "Available Programs"}
            title={ar ? "اختر برنامجك المثالي" : "Choose Your Ideal Program"}
            sub={ar ? "كل برنامج مناسب لظروف وأهداف مختلفة — فريقنا يساعدك تختار الأنسب"
                    : "Each program suits different circumstances — our team helps you choose the right one"}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px,1fr))", gap: 22, marginTop: 32 }}>
            {PROGRAMS.map(p => <ProgramCard key={p.country} p={p} ar={ar} />)}
          </div>
        </section>

        {/* Passport Ranking */}
        <section style={{ marginTop: 60 }}>
          <SectionHeader
            tag={ar ? "مقارنة الجوازات" : "Passport Comparison"}
            title={ar ? "قوة جواز السفر" : "Passport Power"}
            sub={ar ? "كلما كان الترتيب أعلى، زادت حرية تنقلك" : "The higher the rank, the greater your travel freedom"}
          />
          <div style={{ ...card, marginTop: 28, padding: "24px 28px" }}>
            {PASSPORT_COMPARE.map((p, i) => (
              <div key={p.country} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < PASSPORT_COMPARE.length - 1 ? "1px solid rgba(201,168,76,.12)" : "none" }}>
                <div style={{ width: 32, fontWeight: 800, fontSize: ".85rem", color: "#c9a84c", flexShrink: 0, textAlign: "center" }}>#{p.rank}</div>
                <div style={{ width: 44, fontSize: "1.6rem", textAlign: "center", flexShrink: 0 }}>
                  {PROGRAMS.find(x => x.country === p.country)?.flag || "🌐"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: ".9rem", color: "#1a1510" }}>{ar ? p.ar : p.country}</div>
                  <div style={{ fontSize: ".75rem", color: "#6f6a61", marginTop: 2 }}>{p.visa_free} {ar ? "دولة بدون تأشيرة" : "visa-free countries"}</div>
                </div>
                <div style={{ width: "45%", position: "relative" }}>
                  <div style={{ height: 8, background: "#f0ece3", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(p.visa_free / 195) * 100}%`, background: `linear-gradient(90deg, ${p.color}, ${p.color}aa)`, borderRadius: 999, transition: "width .6s" }} />
                  </div>
                </div>
                <div style={{ width: 40, fontWeight: 800, fontSize: ".85rem", color: p.color, textAlign: "center", flexShrink: 0 }}>{p.visa_free}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Process Steps */}
        <section style={{ marginTop: 60 }}>
          <SectionHeader
            tag={ar ? "كيف نعمل" : "Our Process"}
            title={ar ? "خطوات الحصول على جنسيتك" : "Steps to Get Your Citizenship"}
            sub={ar ? "نرافقك في كل خطوة — من الاستشارة الأولى حتى تسلّم الجواز"
                    : "We accompany you every step — from first consultation to passport delivery"}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 16, marginTop: 32 }}>
            {STEPS_AR.map((s, i) => (
              <div key={i} style={{ ...card, textAlign: "center", padding: "22px 16px", position: "relative" }}>
                <div style={{ position: "absolute", top: 12, right: ar ? 12 : "auto", left: ar ? "auto" : 12, width: 22, height: 22, borderRadius: "50%", background: "#c9a84c", color: "#000", fontSize: ".7rem", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{s.icon}</div>
                <div style={{ fontSize: ".82rem", fontWeight: 700, color: "#1a1510", lineHeight: 1.5 }}>{s.t}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ marginTop: 60, ...card, background: "linear-gradient(135deg, #1a1510, #2a2018)", textAlign: "center", padding: "48px 32px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛂</div>
          <h2 style={{ margin: "0 0 14px", fontSize: "1.6rem", fontWeight: 900, color: "#fff" }}>
            {ar ? "ابدأ رحلتك نحو جواز سفر ثانٍ" : "Start Your Journey to a Second Passport"}
          </h2>
          <p style={{ margin: "0 0 28px", color: "rgba(255,255,255,.6)", fontSize: "1rem", lineHeight: 1.8 }}>
            {ar ? "فريقنا من الخبراء جاهز لمساعدتك في اختيار البرنامج المناسب وإتمام الإجراءات بسرعة واحترافية"
                : "Our expert team is ready to help you choose the right program and complete the process quickly and professionally"}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/track-request" style={{ background: "#c9a84c", color: "#000", padding: "14px 32px", borderRadius: 12, fontWeight: 800, textDecoration: "none", fontSize: ".95rem" }}>
              {ar ? "📋 قدّم طلبك الآن" : "📋 Apply Now"}
            </a>
            <a href="https://wa.me/971544909522" style={{ background: "transparent", color: "#c9a84c", border: "1px solid rgba(201,168,76,.4)", padding: "14px 32px", borderRadius: 12, fontWeight: 700, textDecoration: "none", fontSize: ".95rem" }}>
              {ar ? "💬 واتساب" : "💬 WhatsApp"}
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function ProgramCard({ p, ar }) {
  const [open, setOpen] = useState(false);
  const features = ar ? p.features : p.featuresEn;

  return (
    <div style={{ ...card, overflow: "hidden", transition: "box-shadow .2s", cursor: "default" }}>
      {/* Header */}
      <div style={{ background: `${p.color}10`, borderBottom: `1px solid ${p.color}22`, padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 32 }}>{p.flag}</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: "1.05rem", color: "#1a1510" }}>{ar ? p.countryAr : p.country}</div>
              <div style={{ fontSize: ".72rem", color: "#6f6a61" }}>{ar ? p.time : p.timeEn}</div>
            </div>
          </div>
          <div style={{ background: `${p.color}20`, color: p.color, border: `1px solid ${p.color}44`, borderRadius: 20, padding: "3px 12px", fontSize: ".7rem", fontWeight: 700, whiteSpace: "nowrap" }}>
            {ar ? p.badge : p.badgeEn}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: ".7rem", color: "#aaa" }}>{ar ? "يبدأ من" : "Starting from"}</div>
            <div style={{ fontWeight: 900, fontSize: "1.2rem", color: p.color }}>{p.investment}</div>
          </div>
          <div style={{ textAlign: ar ? "left" : "right" }}>
            <div style={{ fontSize: ".7rem", color: "#aaa" }}>{ar ? "دول بدون تأشيرة" : "Visa-free"}</div>
            <div style={{ fontWeight: 900, fontSize: "1.2rem", color: "#1a1510" }}>{p.visaFree}+</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: "16px 22px" }}>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {features.slice(0, open ? features.length : 3).map((f, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".85rem", color: "#3a3530" }}>
              <span style={{ color: p.color, fontWeight: 900, flexShrink: 0 }}>✓</span> {f}
            </li>
          ))}
        </ul>

        {/* Investment options */}
        {open && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(201,168,76,.12)" }}>
            <div style={{ fontSize: ".72rem", color: "#aaa", marginBottom: 8, fontWeight: 700 }}>{ar ? "خيارات الاستثمار:" : "Investment Options:"}</div>
            {p.investment_options.map((o, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: ".82rem" }}>
                <span style={{ color: "#6f6a61" }}>{o.type}</span>
                <span style={{ fontWeight: 700, color: p.color }}>{o.amount}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button onClick={() => setOpen(o => !o)} style={{ flex: 1, background: "transparent", border: `1px solid ${p.color}44`, color: p.color, borderRadius: 10, padding: "8px", fontFamily: "inherit", fontWeight: 700, fontSize: ".8rem", cursor: "pointer" }}>
            {open ? (ar ? "أقل" : "Less") : (ar ? "التفاصيل" : "Details")}
          </button>
          <a href="/track-request" style={{ flex: 2, background: p.color, color: p.color === "#c9a84c" ? "#000" : "#fff", borderRadius: 10, padding: "8px 14px", fontFamily: "inherit", fontWeight: 700, fontSize: ".8rem", textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {ar ? "تقديم الطلب" : "Apply Now"}
          </a>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ tag, title, sub }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 8 }}>
      <div style={{ display: "inline-block", background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.25)", borderRadius: 30, padding: "4px 16px", marginBottom: 14, fontSize: ".78rem", fontWeight: 700, color: "#c9a84c", letterSpacing: ".06em" }}>
        {tag}
      </div>
      <h2 style={{ margin: "0 0 12px", fontSize: "clamp(1.4rem,3vw,1.9rem)", fontWeight: 900, color: "#1a1510" }}>{title}</h2>
      {sub && <p style={{ margin: 0, color: "#6f6a61", fontSize: ".92rem", lineHeight: 1.7, maxWidth: 560, marginInline: "auto" }}>{sub}</p>}
    </div>
  );
}

const card = {
  background: "#fff",
  border: "1px solid rgba(201,168,76,.2)",
  borderRadius: 16,
  boxShadow: "0 2px 12px rgba(0,0,0,.05)",
};
