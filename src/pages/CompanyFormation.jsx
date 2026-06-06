// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Company Formation Page
// ═══════════════════════════════════════════════════════════════

import { setSEOMeta } from "../services/seoService";

const C = {
  gold: "#c9a84c", goldLight: "#f0d080", goldDark: "#8a6010",
  cream: "#faf7f2", warmWhite: "#fffcf7", beige: "#f4ede0",
  g100: "#ede5d8", g400: "#7a6b50", g600: "#3d3020", g800: "#1e1508",
  dark: "#16100a", darkMid: "#211608",
};

const PACKAGES = [
  {
    nameAr: "باقة المبتدئ", nameEn: "Starter Package",
    icon: "🚀", popular: false,
    priceAr: "يبدأ من 3,500 درهم", priceEn: "From AED 3,500",
    featuresAr: ["تسجيل الشركة", "رخصة تجارية", "عنوان تجاري", "خدمة العملاء"],
    featuresEn: ["Company Registration", "Trade License", "Business Address", "Customer Support"],
  },
  {
    nameAr: "باقة الأعمال", nameEn: "Business Package",
    icon: "💼", popular: true,
    priceAr: "يبدأ من 7,000 درهم", priceEn: "From AED 7,000",
    featuresAr: ["كل ما في المبتدئ", "فيزا المدير", "حساب بنكي", "مستشار قانوني", "خدمة PRO"],
    featuresEn: ["All Starter features", "Manager Visa", "Bank Account", "Legal Advisor", "PRO Services"],
  },
  {
    nameAr: "باقة المستثمر", nameEn: "Investor Package",
    icon: "👑", popular: false,
    priceAr: "حسب الطلب", priceEn: "Custom Pricing",
    featuresAr: ["كل ما في الأعمال", "إقامة المستثمر", "الفيزا الذهبية", "خدمة VIP كاملة", "مستشار ضريبي"],
    featuresEn: ["All Business features", "Investor Residency", "Golden Visa", "Full VIP Service", "Tax Advisor"],
  },
];

const JURISDICTIONS = [
  { nameAr: "دبي — البر الرئيسي", nameEn: "Dubai Mainland", flag: "🇦🇪", timeAr: "5-10 أيام", timeEn: "5-10 days", benefitsAr: "تجارة محلية حرة، بدون قيود قطاعية", benefitsEn: "Free local trade, no sector restrictions" },
  { nameAr: "دبي — المنطقة الحرة", nameEn: "Dubai Free Zone", flag: "🏢", timeAr: "3-7 أيام", timeEn: "3-7 days", benefitsAr: "ملكية 100%، إعفاء ضريبي 50 عاماً", benefitsEn: "100% ownership, 50-year tax exemption" },
  { nameAr: "تركيا", nameEn: "Turkey", flag: "🇹🇷", timeAr: "7-14 يوم", timeEn: "7-14 days", benefitsAr: "بيئة أعمال قوية، سوق أوروبي وآسيوي", benefitsEn: "Strong business environment, EU & Asian market access" },
  { nameAr: "المملكة المتحدة", nameEn: "United Kingdom", flag: "🇬🇧", timeAr: "24-48 ساعة", timeEn: "24-48 hours", benefitsAr: "أسرع تسجيل شركات في العالم، سمعة عالمية", benefitsEn: "Fastest company registration globally, worldwide reputation" },
];

const STEPS = {
  ar: ["استشارة مجانية", "اختيار نوع الشركة", "تجهيز الوثائق", "التسجيل الرسمي", "الحصول على الرخصة", "فتح حساب بنكي"],
  en: ["Free Consultation", "Choose Company Type", "Document Preparation", "Official Registration", "License Issuance", "Bank Account Opening"],
};

export default function CompanyFormation({ lang, ff, setPage }) {
  const ar = lang === "ar";

  setSEOMeta({
    title: ar ? "تأسيس الشركات في الإمارات وتركيا" : "Company Formation in UAE & Turkey",
    description: ar
      ? "خدمات تأسيس الشركات في الإمارات وتركيا والمملكة المتحدة. ترخيص كامل، حساب بنكي، وإقامة مستثمر."
      : "Company formation services in UAE, Turkey & UK. Full licensing, bank account, and investor residency.",
    lang, canonical: "/company-formation"
  });

  return (
    <div style={{ fontFamily: ff, direction: ar ? "rtl" : "ltr", background: C.warmWhite, minHeight: "100vh" }}>

      {/* Hero */}
      <section style={{ background: `linear-gradient(145deg, ${C.dark} 0%, ${C.darkMid} 70%, #1d1205 100%)`, padding: "80px clamp(20px,6vw,80px) 72px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 70% 30%, rgba(201,168,76,.08) 0%, transparent 55%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,168,76,.12)", border: "1px solid rgba(201,168,76,.3)", borderRadius: 40, padding: "6px 20px", marginBottom: 20 }}>
            <span style={{ color: C.gold, fontSize: ".7rem", letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 700 }}>🏢 {ar ? "تأسيس الشركات" : "Company Formation"}</span>
          </div>
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: "clamp(2rem,4.5vw,3.2rem)", marginBottom: 16, lineHeight: 1.2 }}>
            {ar ? "أسّس شركتك في الإمارات وتركيا" : "Start Your Company in UAE & Turkey"}
          </h1>
          <p style={{ color: "rgba(255,255,255,.6)", fontSize: "1rem", lineHeight: 1.8, maxWidth: 640, margin: "0 auto 36px" }}>
            {ar
              ? "نتولى كل خطوة من التسجيل حتى الترخيص وفتح الحساب البنكي — أنت تركز على عملك، ونحن نهتم بالتفاصيل."
              : "We handle every step from registration to licensing and bank account opening — you focus on business, we handle the details."}
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setPage("contact")} style={{
              padding: "14px 32px", background: `linear-gradient(135deg, ${C.goldDark}, ${C.gold}, ${C.goldLight})`,
              border: "none", borderRadius: 6, cursor: "pointer", color: C.dark,
              fontFamily: ff, fontWeight: 800, fontSize: ".9rem", letterSpacing: ".06em",
            }}>
              {ar ? "احصل على استشارة مجانية" : "Get Free Consultation"}
            </button>
            <a href="https://wa.me/971544909522" target="_blank" rel="noreferrer" style={{
              padding: "14px 28px", background: "rgba(37,211,102,.12)", border: "1.5px solid rgba(37,211,102,.4)",
              borderRadius: 6, cursor: "pointer", color: "#25d366", fontFamily: ff, fontWeight: 700,
              fontSize: ".9rem", textDecoration: "none", display: "inline-block",
            }}>
              💬 WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div style={{ background: C.beige, padding: "0 clamp(20px,6vw,80px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 0 }}>
          {[
            { n: "500+", lAr: "شركة مؤسسة", lEn: "Companies Founded" },
            { n: "48h", lAr: "أسرع تأسيس", lEn: "Fastest Setup" },
            { n: "4", lAr: "دول نعمل فيها", lEn: "Jurisdictions" },
            { n: "98%", lAr: "نسبة النجاح", lEn: "Success Rate" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", padding: "28px 16px", borderRight: i < 3 ? `1px solid rgba(201,168,76,.15)` : "none" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: C.gold }}>{s.n}</div>
              <div style={{ fontSize: ".75rem", color: C.g400, marginTop: 4, letterSpacing: ".1em" }}>{ar ? s.lAr : s.lEn}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px clamp(20px,4vw,48px)" }}>

        {/* Jurisdictions */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 28, height: 2, background: `linear-gradient(90deg, transparent, ${C.gold})` }} />
              <span style={{ color: C.gold, fontSize: ".7rem", letterSpacing: ".25em", textTransform: "uppercase", fontWeight: 700 }}>{ar ? "المناطق المتاحة" : "Available Jurisdictions"}</span>
              <div style={{ width: 28, height: 2, background: `linear-gradient(90deg, ${C.gold}, transparent)` }} />
            </div>
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 700, color: C.g800 }}>
              {ar ? "نؤسس شركتك في" : "We Register Your Company In"}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
            {JURISDICTIONS.map((j, i) => (
              <div key={i} style={{ background: "#fff", border: `1px solid rgba(201,168,76,.14)`, borderRadius: 12, padding: "24px 22px", transition: "all .3s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,.4)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,.14)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>{j.flag}</div>
                <div style={{ fontWeight: 700, color: C.g800, marginBottom: 6 }}>{ar ? j.nameAr : j.nameEn}</div>
                <div style={{ color: C.gold, fontSize: ".82rem", marginBottom: 10 }}>⏱ {ar ? j.timeAr : j.timeEn}</div>
                <div style={{ color: C.g400, fontSize: ".82rem", lineHeight: 1.6 }}>{ar ? j.benefitsAr : j.benefitsEn}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div style={{ background: `linear-gradient(135deg, ${C.dark}, ${C.darkMid})`, borderRadius: 16, padding: "48px clamp(20px,4vw,48px)", marginBottom: 64, border: `1px solid rgba(201,168,76,.15)` }}>
          <h2 style={{ color: "#fff", fontWeight: 700, fontSize: "1.4rem", textAlign: "center", marginBottom: 36 }}>
            {ar ? "كيف نؤسس شركتك؟" : "How We Set Up Your Company"}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 20 }}>
            {(ar ? STEPS.ar : STEPS.en).map((step, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${C.goldDark}, ${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontWeight: 800, color: C.dark, fontSize: "1.1rem" }}>
                  {i + 1}
                </div>
                <div style={{ color: "rgba(255,255,255,.8)", fontSize: ".85rem", lineHeight: 1.5 }}>{step}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Packages */}
        <div>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 700, color: C.g800 }}>
              {ar ? "باقاتنا" : "Our Packages"}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {PACKAGES.map((pkg, i) => (
              <div key={i} style={{
                background: "#fff", border: `2px solid ${pkg.popular ? C.gold : "rgba(201,168,76,.14)"}`,
                borderRadius: 14, padding: "30px 26px", position: "relative",
                boxShadow: pkg.popular ? `0 8px 40px rgba(201,168,76,.2)` : "none",
              }}>
                {pkg.popular && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg, ${C.goldDark}, ${C.gold})`, color: C.dark, padding: "4px 16px", borderRadius: 20, fontSize: ".72rem", fontWeight: 800, letterSpacing: ".1em", whiteSpace: "nowrap" }}>
                    {ar ? "⭐ الأكثر طلباً" : "⭐ Most Popular"}
                  </div>
                )}
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>{pkg.icon}</div>
                <div style={{ fontWeight: 800, fontSize: "1.1rem", color: C.g800, marginBottom: 6 }}>{ar ? pkg.nameAr : pkg.nameEn}</div>
                <div style={{ color: C.gold, fontWeight: 700, fontSize: "1rem", marginBottom: 20 }}>{ar ? pkg.priceAr : pkg.priceEn}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                  {(ar ? pkg.featuresAr : pkg.featuresEn).map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, color: C.g600, fontSize: ".88rem" }}>
                      <span style={{ color: C.gold, fontWeight: 700 }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <button onClick={() => setPage("contact")} style={{
                  width: "100%", padding: "12px",
                  background: pkg.popular ? `linear-gradient(135deg, ${C.goldDark}, ${C.gold})` : "transparent",
                  border: pkg.popular ? "none" : `1.5px solid rgba(201,168,76,.4)`,
                  borderRadius: 6, cursor: "pointer", color: pkg.popular ? C.dark : C.gold,
                  fontFamily: ff, fontWeight: 700, fontSize: ".88rem",
                }}>
                  {ar ? "ابدأ الآن" : "Get Started"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
