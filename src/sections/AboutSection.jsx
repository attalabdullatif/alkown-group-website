import { C } from "../utils/theme";
import { Divider, Label } from "../components/SiteAtoms";
import PageHero from "./PageHero";

export default function AboutSection({ t, lang, ff, setPage }) {
  const ar = lang === "ar";

  const missionVision = [
    {
      icon: "🎯",
      title: ar ? "مهمتنا" : "Our Mission",
      text: ar
        ? "تبسيط التنقّل العالمي لعملائنا — من التأشيرات والإقامة إلى تأسيس الشركات — عبر خدمة دقيقة وشفّافة يقودها خبراء."
        : "To simplify global mobility for our clients — from visas and residency to company formation — through precise, transparent, expert-led service.",
    },
    {
      icon: "🌅",
      title: ar ? "رؤيتنا" : "Our Vision",
      text: ar
        ? "أن نكون الشريك العربي الأول الموثوق لكل من يسعى للسفر والاستثمار والإقامة حول العالم."
        : "To be the most trusted Arab partner for everyone seeking to travel, invest, and reside around the world.",
    },
  ];

  const offerings = [
    { icon: "✈️", title: ar ? "التأشيرات" : "Visas", desc: ar ? "تأشيرات سياحية وتجارية واستثمارية لأكثر من 195 دولة." : "Tourist, business & investor visas for 195+ countries." },
    { icon: "🛂", title: ar ? "الإقامة والجنسية" : "Residency & Citizenship", desc: ar ? "الفيزا الذهبية والإقامة بالاستثمار وبرامج الجنسية الثانية." : "Golden visas, residency by investment & second-citizenship programs." },
    { icon: "🏢", title: ar ? "تأسيس الشركات" : "Company Formation", desc: ar ? "تأسيس وترخيص الشركات وفتح الحسابات البنكية في الإمارات وتركيا." : "Company setup, licensing & bank accounts in the UAE & Turkey." },
    { icon: "🧳", title: ar ? "السفر والسياحة" : "Travel & Tourism", desc: ar ? "حجوزات VIP للطيران والفنادق وبرامج سياحية فاخرة." : "VIP flight & hotel booking and luxury travel packages." },
    { icon: "📣", title: ar ? "الوكالة الإعلانية" : "Advertising Agency", desc: ar ? "هوية بصرية وحملات تسويق رقمي وإدارة محتوى." : "Branding, digital marketing campaigns & content management." },
    { icon: "🎓", title: ar ? "أكاديمية المهارات" : "Skills Academy", desc: ar ? "دورات لغات ومهارات أعمال وتدريب رقمي معتمد." : "Language courses, business skills & certified digital training." },
  ];

  const values = [
    { icon: "🎯", title: ar ? "دقة وموثوقية" : "Precision & Trust", desc: ar ? "معلومات محدّثة من مصادر رسمية، وإجراءات واضحة بلا مفاجآت." : "Up-to-date info from official sources, clear procedures, no surprises." },
    { icon: "🗣️", title: ar ? "فريق متعدد اللغات" : "Multilingual Team", desc: ar ? "نخدمك بالعربية والإنجليزية والتركية في أي وقت." : "We serve you in Arabic, English & Turkish, anytime." },
    { icon: "📋", title: ar ? "امتثال كامل" : "Full Compliance", desc: ar ? "جميع خدماتنا مرخّصة وموافقة قانونياً." : "All our services are fully licensed and legally compliant." },
    { icon: "🌍", title: ar ? "حضور عالمي" : "Global Reach", desc: ar ? "مكاتب وشركاء في عدة دول لخدمتك أينما كنت." : "Offices and partners across several countries to serve you anywhere." },
  ];

  const offices = [
    { city: ar ? "إسطنبول" : "Istanbul", country: ar ? "تركيا" : "Turkey", flag: "🇹🇷" },
    { city: ar ? "دبي" : "Dubai", country: ar ? "الإمارات" : "UAE", flag: "🇦🇪" },
    { city: ar ? "حلب" : "Aleppo", country: ar ? "سوريا" : "Syria", flag: "🇸🇾" },
  ];

  const sectionPad = "72px clamp(20px,6vw,80px)";
  const cardBase = { background: "#fff", border: `1px solid rgba(201,168,76,.18)`, borderRadius: 12, padding: "26px 24px" };

  return (
    <>
      <PageHero title={t.nav.about} subtitle={ar ? "مجموعة الكون · منذ 2015" : "Alkown Group · Since 2015"} />

      {/* Intro + stats */}
      <section style={{ padding: "72px clamp(20px,6vw,80px) 40px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Label text={t.about.label} />
            <h2 style={{ fontSize: "var(--sizeSec,clamp(1.8rem,4vw,3rem))", fontWeight: 800, color: C.g800, marginTop: 10, whiteSpace: "pre-line", lineHeight: 1.25 }}>{t.about.h2}</h2>
            <Divider />
            <p style={{ maxWidth: 720, margin: "18px auto 0", color: C.g600, lineHeight: 2, fontSize: "1rem" }}>{t.about.p}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 3 }}>
            {[[t.about.stat1v, t.about.stat1l], [t.about.stat2v, t.about.stat2l], [t.about.stat3v, t.about.stat3l], [t.about.stat4v, t.about.stat4l]].map(([v, l], i) => (
              <div key={i} style={{ textAlign: "center", padding: "40px 24px", background: i % 2 === 0 ? C.beige : "#fff", borderTop: `3px solid rgba(201,168,76,.35)` }}>
                <div className="shimmer" style={{ fontSize: "2.8rem", fontWeight: 800, fontFamily: "Georgia,serif", display: "block" }}>{v}</div>
                <div style={{ fontSize: ".74rem", color: C.g400, letterSpacing: ".17em", textTransform: "uppercase", marginTop: 8 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section style={{ padding: sectionPad, background: C.beige }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
          {missionVision.map((m, i) => (
            <div key={i} style={{ ...cardBase, padding: "32px 30px" }}>
              <div style={{ fontSize: "2rem", marginBottom: 14 }}>{m.icon}</div>
              <h3 style={{ color: C.g800, fontWeight: 800, fontSize: "1.25rem", marginBottom: 10 }}>{m.title}</h3>
              <p style={{ color: C.g600, lineHeight: 2, fontSize: ".95rem" }}>{m.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What we offer */}
      <section style={{ padding: sectionPad, background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <Label text={ar ? "ماذا نقدّم" : "What We Offer"} />
            <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", fontWeight: 800, color: C.g800, marginTop: 10 }}>
              {ar ? "حلول متكاملة تحت سقف واحد" : "Complete Solutions Under One Roof"}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18 }}>
            {offerings.map((o, i) => (
              <div key={i} style={{ ...cardBase, transition: "transform .25s, box-shadow .25s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 14px 40px rgba(0,0,0,.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ fontSize: "1.8rem", marginBottom: 12 }}>{o.icon}</div>
                <h3 style={{ color: C.g800, fontWeight: 700, fontSize: "1.05rem", marginBottom: 8 }}>{o.title}</h3>
                <p style={{ color: C.g400, lineHeight: 1.8, fontSize: ".88rem" }}>{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Alkown */}
      <section style={{ padding: sectionPad, background: C.dark }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", fontWeight: 800, color: "#fff" }}>
              {ar ? "لماذا الكون العالمية؟" : "Why ALKOWN Global?"}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 18 }}>
            {values.map((v, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,.04)", border: `1px solid rgba(201,168,76,.18)`, borderRadius: 12, padding: "28px 24px", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: 14 }}>{v.icon}</div>
                <h3 style={{ color: C.gold, fontWeight: 700, fontSize: "1rem", marginBottom: 10 }}>{v.title}</h3>
                <p style={{ color: "rgba(255,255,255,.55)", lineHeight: 1.8, fontSize: ".85rem" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offices + CTA */}
      <section style={{ padding: sectionPad, background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <Label text={ar ? "مكاتبنا" : "Our Offices"} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 18, margin: "28px 0 48px" }}>
            {offices.map((o, i) => (
              <div key={i} style={{ ...cardBase, textAlign: "center" }}>
                <div style={{ fontSize: "2.4rem", marginBottom: 8 }}>{o.flag}</div>
                <div style={{ fontWeight: 800, color: C.g800, fontSize: "1.1rem" }}>{o.city}</div>
                <div style={{ color: C.g400, fontSize: ".85rem", marginTop: 2 }}>{o.country}</div>
              </div>
            ))}
          </div>
          <button className="gbtn" style={{ fontFamily: ff }} onClick={() => setPage("booking")}>
            {ar ? "احجز استشارة مجانية" : "Book a Free Consultation"}
          </button>
        </div>
      </section>
    </>
  );
}
