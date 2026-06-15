import { C } from "../utils/theme";
import { Divider, Label } from "../components/SiteAtoms";
import PageHero from "./PageHero";

export default function AboutSection({ t, lang, ff, setPage }) {
  return (
    <>
      <PageHero title={t.nav.about} subtitle={lang === "ar" ? "مجموعة الكون · منذ 2015" : "Alkown Group · Since 2015"} />
      <section style={{ padding: "80px clamp(20px,6vw,80px)", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Label text={t.about.label} />
            <h2 style={{ fontSize: "var(--sizeSec,clamp(1.8rem,4vw,3rem))", fontWeight: 800, color: C.g800, marginTop: 10, whiteSpace: "pre-line", lineHeight: 1.25 }}>{t.about.h2}</h2>
            <Divider />
            <p style={{ maxWidth: 700, margin: "18px auto 0", color: C.g600, lineHeight: 2, fontSize: "1rem" }}>{t.about.p}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 3, marginBottom: 72 }}>
            {[[t.about.stat1v, t.about.stat1l], [t.about.stat2v, t.about.stat2l], [t.about.stat3v, t.about.stat3l], [t.about.stat4v, t.about.stat4l]].map(([v, l], i) => (
              <div key={i} style={{ textAlign: "center", padding: "40px 24px", background: i % 2 === 0 ? C.beige : "#fff", borderTop: `3px solid rgba(201,168,76,.35)` }}>
                <div className="shimmer" style={{ fontSize: "2.8rem", fontWeight: 800, fontFamily: "Georgia,serif", display: "block" }}>{v}</div>
                <div style={{ fontSize: ".74rem", color: C.g400, letterSpacing: ".17em", textTransform: "uppercase", marginTop: 8 }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <button className="gbtn" style={{ fontFamily: ff }} onClick={() => setPage("booking")}>
              {lang === "ar" ? "احجز استشارة" : "Book Consultation"}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
