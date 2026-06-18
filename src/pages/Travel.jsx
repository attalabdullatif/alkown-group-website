// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Travel & Tourism Page
// تصميم موحد مع باقي الموقع — يستخدم CSS variables الديناميكية
// ═══════════════════════════════════════════════════════════════
import { useEffect } from "react";
import { setSEOMeta } from "../services/seoService";

// ── بيانات الصفحة ──────────────────────────────────────────────

const SERVICES = [
  {
    icon: "✈️",
    nameAr: "حجز التذاكر",
    nameEn: "Flight Booking",
    descAr: "أفضل أسعار وأسرع حجز لأكثر من 500 شركة طيران",
    descEn: "Best prices & fastest booking for 500+ airlines",
  },
  {
    icon: "🏨",
    nameAr: "حجز الفنادق",
    nameEn: "Hotel Booking",
    descAr: "فنادق 5 نجوم وشقق مفروشة في 120+ مدينة",
    descEn: "5-star hotels & serviced apartments in 120+ cities",
  },
  {
    icon: "🚐",
    nameAr: "نقل VIP",
    nameEn: "VIP Transfers",
    descAr: "سيارات فاخرة وخدمة استقبال في المطار",
    descEn: "Luxury cars & airport meet-and-greet service",
  },
  {
    icon: "🗺️",
    nameAr: "رحلات منظمة",
    nameEn: "Organized Tours",
    descAr: "باقات سياحية شاملة مع مرشد سياحي خاص",
    descEn: "Full tour packages with private guide",
  },
  {
    icon: "🛡️",
    nameAr: "تأمين السفر",
    nameEn: "Travel Insurance",
    descAr: "تغطية شاملة للرحلة والصحة والإلغاء",
    descEn: "Full trip, health & cancellation coverage",
  },
  {
    icon: "🎯",
    nameAr: "خدمات VIP",
    nameEn: "VIP Services",
    descAr: "صالة المطار وتسريع الإجراءات والمساعدة الكاملة",
    descEn: "Airport lounge, fast-track & full assistance",
  },
];

const PACKAGES = [
  {
    icon: "🌙",
    nameAr: "باقة الأسرة",
    nameEn: "Family Package",
    priceAr: "يبدأ من $1,500",
    priceEn: "From $1,500",
    popular: false,
    featuresAr: [
      "حجز طيران وفندق",
      "تأمين سفر",
      "نقل مطار",
      "مرشد سياحي",
      "دعم 24/7",
    ],
    featuresEn: [
      "Flight & hotel booking",
      "Travel insurance",
      "Airport transfers",
      "Tour guide",
      "24/7 support",
    ],
  },
  {
    icon: "💎",
    nameAr: "باقة الأزواج",
    nameEn: "Couple Package",
    priceAr: "يبدأ من $2,500",
    priceEn: "From $2,500",
    popular: true,
    tagAr: "الأكثر طلباً",
    tagEn: "Most Popular",
    featuresAr: [
      "كل ما في الأسرة",
      "فندق 5 نجوم",
      "رومانسي كامل",
      "سبا وإفطار",
      "خدمة VIP كاملة",
    ],
    featuresEn: [
      "All Family features",
      "5-star hotel",
      "Full romantic setup",
      "Spa & breakfast",
      "Full VIP service",
    ],
  },
  {
    icon: "👑",
    nameAr: "باقة VIP",
    nameEn: "VIP Package",
    priceAr: "حسب الطلب",
    priceEn: "Custom Pricing",
    popular: false,
    featuresAr: [
      "طيران درجة أولى",
      "يخت خاص",
      "مرشد خاص 24/7",
      "صالات VIP",
      "تجربة فريدة",
    ],
    featuresEn: [
      "First class flights",
      "Private yacht",
      "Private guide 24/7",
      "VIP lounges",
      "Unique experience",
    ],
  },
];

const DESTINATIONS = [
  { flag: "🇹🇷", nameAr: "إسطنبول",    nameEn: "Istanbul", typeAr: "سياحة وتسوق",     typeEn: "Tourism & Shopping",     durationAr: "3-7 أيام",   durationEn: "3-7 days" },
  { flag: "🇦🇪", nameAr: "دبي",        nameEn: "Dubai",    typeAr: "ترفيه فاخر",      typeEn: "Luxury Entertainment",   durationAr: "4-7 أيام",   durationEn: "4-7 days" },
  { flag: "🇬🇷", nameAr: "اليونان",    nameEn: "Greece",   typeAr: "جزر وطبيعة",      typeEn: "Islands & Nature",       durationAr: "5-10 أيام",  durationEn: "5-10 days" },
  { flag: "🇮🇹", nameAr: "إيطاليا",   nameEn: "Italy",    typeAr: "تاريخ وثقافة",    typeEn: "History & Culture",      durationAr: "7-14 يوم",   durationEn: "7-14 days" },
  { flag: "🇫🇷", nameAr: "باريس",     nameEn: "Paris",    typeAr: "رومانسية وموضة",  typeEn: "Romance & Fashion",      durationAr: "4-7 أيام",   durationEn: "4-7 days" },
  { flag: "🇲🇦", nameAr: "المغرب",    nameEn: "Morocco",  typeAr: "تراث وتجربة",     typeEn: "Heritage & Experience",  durationAr: "5-10 أيام",  durationEn: "5-10 days" },
  { flag: "🇯🇵", nameAr: "اليابان",   nameEn: "Japan",    typeAr: "تقنية وحضارة",    typeEn: "Tech & Civilization",    durationAr: "10-14 يوم",  durationEn: "10-14 days" },
  { flag: "🇲🇻", nameAr: "المالديف",  nameEn: "Maldives", typeAr: "استرخاء وبحر",    typeEn: "Relaxation & Ocean",     durationAr: "5-10 أيام",  durationEn: "5-10 days" },
];

const STEPS = {
  ar: [
    { icon: "💬", t: "استشارة مجانية",         d: "نتعرف على تفضيلاتك وميزانيتك ونوجهك" },
    { icon: "🗺️", t: "تخطيط الرحلة",           d: "نصمم لك مسار رحلة مثالي خطوة بخطوة" },
    { icon: "✈️", t: "حجز التذاكر",             d: "نختار أفضل رحلة بأنسب سعر لك" },
    { icon: "🏨", t: "حجز الفنادق",             d: "نحجز الفندق المثالي في موقع مميز" },
    { icon: "📋", t: "التأمين والوثائق",         d: "نؤمن رحلتك ونجهز كل وثائق السفر" },
    { icon: "🎉", t: "انطلق في رحلتك",          d: "استمتع برحلتك وفريقنا معك دائماً" },
  ],
  en: [
    { icon: "💬", t: "Free Consultation",        d: "We learn your preferences and guide you" },
    { icon: "🗺️", t: "Trip Planning",            d: "We design your perfect itinerary step by step" },
    { icon: "✈️", t: "Flight Booking",            d: "We pick the best flight at the best price" },
    { icon: "🏨", t: "Hotel Booking",             d: "We book the ideal hotel in a prime location" },
    { icon: "📋", t: "Insurance & Docs",          d: "We insure your trip and prepare all travel docs" },
    { icon: "🎉", t: "Enjoy Your Trip",           d: "Travel carefree — our team is always with you" },
  ],
};

const WHY = {
  ar: [
    { icon: "⚡", t: "أفضل الأسعار",     d: "نضمن أفضل سعر أو نعيد الفرق" },
    { icon: "🛡", t: "تأمين شامل",        d: "تغطية طبية وإلغاء وتأخير رحلات" },
    { icon: "🌍", t: "120+ وجهة",         d: "نغطي أكثر من 120 وجهة سياحية حول العالم" },
    { icon: "👑", t: "خدمة VIP",          d: "مرافق شخصي من المطار حتى الفندق" },
    { icon: "📋", t: "حزمة شاملة",        d: "الطيران والفندق والتأمين في خطوة واحدة" },
    { icon: "💬", t: "دعم 24/7",          d: "فريقنا متاح على مدار الساعة في جميع الوجهات" },
  ],
  en: [
    { icon: "⚡", t: "Best Prices",        d: "We guarantee best price or refund the difference" },
    { icon: "🛡", t: "Full Insurance",     d: "Medical, cancellation & delay coverage" },
    { icon: "🌍", t: "120+ Destinations",  d: "120+ destinations covered worldwide" },
    { icon: "👑", t: "VIP Service",        d: "Personal escort from airport to hotel" },
    { icon: "📋", t: "Complete Package",   d: "Flights, hotels & insurance in one step" },
    { icon: "💬", t: "24/7 Support",       d: "Available around the clock in all destinations" },
  ],
};

// ── مكونات مساعدة ────────────────────────────────────────────
function SectionLabel({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
      <div style={{ width: 28, height: 1, background: "linear-gradient(90deg,transparent,var(--gold,#c9a84c))" }} />
      <span style={{ color: "var(--gold,#c9a84c)", fontSize: ".7rem", letterSpacing: ".25em", textTransform: "uppercase", fontWeight: 700 }}>{text}</span>
      <div style={{ width: 28, height: 1, background: "linear-gradient(90deg,var(--gold,#c9a84c),transparent)" }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function Travel({ lang = "ar", ff, setPage }) {
  const ar = lang === "ar";
  const steps = ar ? STEPS.ar : STEPS.en;
  const why   = ar ? WHY.ar   : WHY.en;

  const handleCTA = () => {
    if (setPage) setPage("booking");
    else window.open("https://wa.me/971544909522", "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    setSEOMeta({
      title: ar
        ? "السفر والسياحة — رحلات VIP ووجهات عالمية"
        : "Travel & Tourism — VIP Trips & Global Destinations",
      description: ar
        ? "احجز رحلتك مع ALKOWN Global. تذاكر طيران، فنادق 5 نجوم، رحلات منظمة، تأمين سفر وخدمات VIP في 120+ وجهة."
        : "Book your trip with ALKOWN Global. Flights, 5-star hotels, organized tours, travel insurance & VIP services in 120+ destinations.",
      lang,
      canonical: "/travel",
    });
  }, [ar, lang]);

  return (
    <div style={{ fontFamily: ff || "'Dubai','Cairo','Noto Naskh Arabic',sans-serif", direction: ar ? "rtl" : "ltr" }}>

      {/* ══ HERO ═══════════════════════════════════════════════ */}
      <section style={{
        background: "linear-gradient(145deg,var(--dark,#16100a) 0%,#1d1205 100%)",
        padding: "100px clamp(20px,6vw,80px) 80px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 70% 30%,rgba(201,168,76,.08) 0%,transparent 55%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,var(--gold,#c9a84c),transparent)", opacity: .3 }} />

        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center", position: "relative" }} className="fu">
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.3)", borderRadius: 40, padding: "6px 22px", marginBottom: 24 }}>
            <span style={{ color: "var(--gold,#c9a84c)", fontSize: ".7rem", letterSpacing: ".22em", textTransform: "uppercase", fontWeight: 700 }}>
              ✈️ {ar ? "السفر والسياحة" : "Travel & Tourism"}
            </span>
          </div>

          <h1 className="shimmer fu2" style={{ fontWeight: 800, fontSize: "clamp(2rem,4.5vw,3.4rem)", marginBottom: 18, lineHeight: 1.2 }}>
            {ar
              ? "رحلات VIP حول العالم\nبتجربة لا تُنسى"
              : "VIP Journeys Around\nThe World"}
          </h1>

          <p className="fu3" style={{ color: "rgba(255,255,255,.6)", fontSize: "1rem", lineHeight: 1.85, maxWidth: 620, margin: "0 auto 40px" }}>
            {ar
              ? "حجز تذاكر وفنادق · رحلات منظمة فاخرة · تأمين السفر · خدمات VIP في المطار"
              : "Flight & hotel booking · Luxury organized tours · Travel insurance · VIP airport services"}
          </p>

          <div className="fu4" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="gbtn" style={{ fontFamily: ff }} onClick={handleCTA}>
              {ar ? "احجز رحلتك الآن" : "Book Your Trip Now"}
            </button>
            <a
              href="https://wa.me/971544909522"
              target="_blank" rel="noreferrer"
              style={{ padding: "14px 28px", background: "rgba(37,211,102,.1)", border: "1.5px solid rgba(37,211,102,.35)", borderRadius: 4, color: "#25d366", fontFamily: ff, fontWeight: 700, fontSize: ".88rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
            >💬 WhatsApp</a>
          </div>
        </div>
      </section>

      {/* ══ STATS ══════════════════════════════════════════════ */}
      <div style={{ background: "var(--bgWarm,#faf7f2)", borderBottom: "1px solid rgba(201,168,76,.1)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
          {[
            { n: "50K+",  lAr: "رحلة محجوزة",       lEn: "Trips Booked" },
            { n: "120+",  lAr: "وجهة سياحية",        lEn: "Destinations" },
            { n: "98%",   lAr: "رضا العملاء",         lEn: "Client Satisfaction" },
            { n: "24/7",  lAr: "دعم مستمر",           lEn: "Ongoing Support" },
          ].map((s, i, arr) => (
            <div key={i} style={{
              textAlign: "center", padding: "30px 16px",
              borderInlineEnd: i < arr.length - 1 ? "1px solid rgba(201,168,76,.12)" : "none",
            }}>
              <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--gold,#c9a84c)", fontFamily: ff }}>{s.n}</div>
              <div style={{ fontSize: ".75rem", color: "var(--g400,#7a6b50)", marginTop: 5, letterSpacing: ".1em" }}>{ar ? s.lAr : s.lEn}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ SERVICES ══════════════════════════════════════════ */}
      <section style={{ padding: "80px clamp(20px,6vw,72px)", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <SectionLabel text={ar ? "خدماتنا" : "Our Services"} />
            <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", fontWeight: 800, color: "var(--g800,#1e1508)", marginTop: 8 }}>
              {ar ? "كل ما تحتاجه لرحلة مثالية" : "Everything You Need for a Perfect Trip"}
            </h2>
            <div className="gl" style={{ margin: "16px auto 0" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 24 }}>
            {SERVICES.map((svc, i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: "32px 28px", borderRadius: 14,
                  transition: "all .3s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(201,168,76,.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = ""; }}
              >
                <div style={{ fontSize: "2.4rem", marginBottom: 16 }}>{svc.icon}</div>
                <h3 style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--g800,#1e1508)", marginBottom: 6 }}>
                  {ar ? svc.nameAr : svc.nameEn}
                </h3>
                <div className="gl" style={{ marginBottom: 12 }} />
                <p style={{ color: "var(--g400,#7a6b50)", fontSize: ".86rem", lineHeight: 1.7, margin: 0 }}>
                  {ar ? svc.descAr : svc.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DESTINATIONS ══════════════════════════════════════ */}
      <section style={{ padding: "80px clamp(20px,6vw,72px)", background: "var(--bgWarm,#faf7f2)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <SectionLabel text={ar ? "الوجهات السياحية" : "Top Destinations"} />
            <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", fontWeight: 800, color: "var(--g800,#1e1508)", marginTop: 8 }}>
              {ar ? "أبرز وجهاتنا السياحية" : "Our Most Popular Destinations"}
            </h2>
            <div className="gl" style={{ margin: "16px auto 0" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 20 }}>
            {DESTINATIONS.map((d, i) => (
              <div key={i} className="card" style={{ padding: "24px 22px", borderRadius: 12, display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ fontSize: "2.4rem", flexShrink: 0, lineHeight: 1 }}>{d.flag}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontWeight: 700, color: "var(--g800,#1e1508)", marginBottom: 4, fontSize: ".98rem" }}>
                    {ar ? d.nameAr : d.nameEn}
                  </h3>
                  <div className="gl" style={{ marginBottom: 8 }} />
                  <div style={{ color: "var(--gold,#c9a84c)", fontSize: ".8rem", fontWeight: 700, marginBottom: 4 }}>
                    {ar ? d.typeAr : d.typeEn}
                  </div>
                  <div style={{ color: "var(--g400,#7a6b50)", fontSize: ".8rem" }}>
                    ⏱ {ar ? d.durationAr : d.durationEn}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PACKAGES ══════════════════════════════════════════ */}
      <section style={{ padding: "80px clamp(20px,6vw,72px)", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <SectionLabel text={ar ? "باقاتنا" : "Our Packages"} />
            <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", fontWeight: 800, color: "var(--g800,#1e1508)", marginTop: 8 }}>
              {ar ? "اختر الباقة المناسبة لك" : "Choose the Right Package for You"}
            </h2>
            <div className="gl" style={{ margin: "16px auto 0" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 24 }}>
            {PACKAGES.map((pkg, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: `2px solid ${pkg.popular ? "var(--gold,#c9a84c)" : "rgba(201,168,76,.14)"}`,
                  borderRadius: 14, padding: "34px 28px", position: "relative",
                  boxShadow: pkg.popular ? "0 12px 48px rgba(201,168,76,.18)" : "none",
                  transition: "all .3s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(201,168,76,.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = pkg.popular ? "0 12px 48px rgba(201,168,76,.18)" : "none"; }}
              >
                {pkg.popular && (
                  <div style={{
                    position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                    background: "linear-gradient(135deg,var(--goldD,#8a6010),var(--gold,#c9a84c))",
                    color: "var(--dark,#16100a)", padding: "5px 18px", borderRadius: 20,
                    fontSize: ".7rem", fontWeight: 800, letterSpacing: ".1em", whiteSpace: "nowrap",
                  }}>
                    ⭐ {ar ? pkg.tagAr : pkg.tagEn}
                  </div>
                )}

                <div style={{ fontSize: "2.4rem", marginBottom: 14 }}>{pkg.icon}</div>
                <h3 style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--g800,#1e1508)", marginBottom: 6 }}>
                  {ar ? pkg.nameAr : pkg.nameEn}
                </h3>
                <div className="gl" />

                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".92rem", color: "var(--gold,#c9a84c)", fontWeight: 700, marginBottom: 20 }}>
                  <span>💰</span>
                  <span>{ar ? pkg.priceAr : pkg.priceEn}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 28 }}>
                  {(ar ? pkg.featuresAr : pkg.featuresEn).map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--g600,#3d3020)", fontSize: ".86rem" }}>
                      <span style={{ color: "var(--gold,#c9a84c)", fontWeight: 800, fontSize: ".85rem", flexShrink: 0 }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleCTA}
                  className={pkg.popular ? "gbtn" : "obtn"}
                  style={{ width: "100%", fontFamily: ff, fontSize: ".88rem" }}
                >
                  {ar ? "احجز هذه الباقة" : "Book This Package"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROCESS ════════════════════════════════════════════ */}
      <section style={{ padding: "80px clamp(20px,6vw,72px)", background: "var(--bgWarm,#faf7f2)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <SectionLabel text={ar ? "كيف نعمل" : "The Process"} />
            <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", fontWeight: 800, color: "var(--g800,#1e1508)", marginTop: 8 }}>
              {ar ? "خطوات حجز رحلتك معنا" : "How We Book Your Perfect Trip"}
            </h2>
            <div className="gl" style={{ margin: "16px auto 0" }} />
          </div>

          <div style={{
            background: "linear-gradient(135deg,var(--dark,#16100a),#1d1205)",
            borderRadius: 16, padding: "52px clamp(20px,4vw,52px)",
            border: "1px solid rgba(201,168,76,.15)",
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 32 }}>
              {steps.map((step, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ position: "relative", marginBottom: 16 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: "50%",
                      background: "linear-gradient(135deg,var(--goldD,#8a6010),var(--gold,#c9a84c))",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto", fontSize: "1.3rem",
                      boxShadow: "0 4px 18px rgba(201,168,76,.3)",
                    }}>
                      {step.icon}
                    </div>
                    <div style={{
                      position: "absolute", top: -6, insetInlineEnd: -4,
                      width: 22, height: 22, borderRadius: "50%",
                      background: "var(--gold,#c9a84c)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: ".65rem", fontWeight: 800, color: "var(--dark,#16100a)",
                    }}>
                      {i + 1}
                    </div>
                  </div>
                  <div style={{ color: "rgba(255,255,255,.85)", fontSize: ".88rem", fontWeight: 600, marginBottom: 6 }}>{step.t}</div>
                  <div style={{ color: "rgba(255,255,255,.4)", fontSize: ".76rem", lineHeight: 1.5 }}>{step.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ WHY US ═════════════════════════════════════════════ */}
      <section style={{ padding: "80px clamp(20px,6vw,72px)", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <SectionLabel text={ar ? "لماذا الكون" : "Why Alkown"} />
            <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", fontWeight: 800, color: "var(--g800,#1e1508)", marginTop: 8 }}>
              {ar ? "ما يميزنا في خدمات السفر" : "What Makes Us Stand Out"}
            </h2>
            <div className="gl" style={{ margin: "16px auto 0" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
            {why.map((w, i) => (
              <div key={i} className="card" style={{ padding: "30px 26px", display: "flex", gap: 18, alignItems: "flex-start" }}>
                <div style={{
                  width: 50, height: 50, flexShrink: 0, borderRadius: 3,
                  background: "rgba(201,168,76,.08)", border: "1px solid rgba(201,168,76,.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem",
                }}>
                  {w.icon}
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, color: "var(--g800,#1e1508)", marginBottom: 6, fontSize: ".98rem" }}>{w.t}</h4>
                  <div className="gl" style={{ marginBottom: 8 }} />
                  <p style={{ color: "var(--g400,#7a6b50)", fontSize: ".84rem", lineHeight: 1.7 }}>{w.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ INTERACTIVE TOURISM MAP ════════════════════════════ */}
      <section style={{ padding: "80px clamp(20px,6vw,72px)", background: "var(--bgWarm,#faf7f2)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <SectionLabel text={ar ? "استكشف الوجهات" : "Explore Destinations"} />
            <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", fontWeight: 800, color: "var(--g800,#1e1508)", marginTop: 8 }}>
              {ar ? "الخريطة السياحية التفاعلية" : "Interactive Tourism Map"}
            </h2>
            <div className="gl" style={{ margin: "16px auto 0" }} />
            <p style={{ color: "var(--g400,#7a6b50)", fontSize: ".9rem", lineHeight: 1.7, marginTop: 14, maxWidth: 560, marginInline: "auto" }}>
              {ar
                ? "اختر دولة واستكشف أبرز المعالم السياحية على الخريطة مباشرة."
                : "Pick a country and explore its top tourist landmarks right on the map."}
            </p>
          </div>
          <iframe
            src="/tourism-map/index.html"
            title={ar ? "الخريطة السياحية التفاعلية" : "Interactive Tourism Map"}
            loading="lazy"
            style={{ width: "100%", height: 620, border: "1px solid rgba(201,168,76,.2)", borderRadius: 8, boxShadow: "0 10px 40px rgba(0,0,0,.08)" }}
          />
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════════════ */}
      <section style={{
        padding: "80px clamp(20px,6vw,72px)",
        background: "linear-gradient(135deg,var(--dark,#16100a),#1d1205)",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 50% 0%,rgba(201,168,76,.08),transparent 60%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", position: "relative" }}>
          <SectionLabel text={ar ? "ابدأ رحلتك" : "Start Your Journey"} />
          <h2 className="shimmer" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, margin: "12px 0 16px" }}>
            {ar ? "جاهز لرحلتك القادمة؟" : "Ready for Your Next Adventure?"}
          </h2>
          <p style={{ color: "rgba(255,255,255,.55)", lineHeight: 1.85, marginBottom: 36, fontSize: ".98rem" }}>
            {ar
              ? "تواصل معنا اليوم واحجز رحلة الأحلام بأفضل الأسعار وخدمة VIP حقيقية."
              : "Contact us today and book your dream trip at the best prices with true VIP service."}
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="gbtn" style={{ fontFamily: ff }} onClick={handleCTA}>
              {ar ? "احجز رحلتك الآن" : "Book Your Trip Now"}
            </button>
            <a
              href="https://wa.me/971544909522"
              target="_blank" rel="noreferrer"
              style={{ padding: "14px 28px", background: "rgba(255,255,255,.06)", border: "1.5px solid rgba(255,255,255,.18)", borderRadius: 4, color: "rgba(255,255,255,.8)", fontFamily: ff, fontWeight: 700, fontSize: ".88rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              💬 {ar ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
