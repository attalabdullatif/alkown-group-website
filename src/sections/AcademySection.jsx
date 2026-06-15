import { C } from "../utils/theme";
import PageHero from "./PageHero";

export default function AcademySection({ t, lang, ff, setPage }) {
  return (
    <>
      <PageHero title={t.academy.hero} subtitle={t.academy.heroSub} />
      <section style={{ padding: "80px clamp(20px,6vw,80px)", background: "#fff" }}>
        <div style={{ maxWidth: 1220, margin: "0 auto" }}>
          <p style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 52px", color: C.g600, lineHeight: 2 }}>{t.academy.intro}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {t.academy.courses.map((course, i) => {
              const hasBg = course.bg_image || course.bg_color;
              const cardStyle = hasBg ? {
                backgroundImage: course.bg_image ? `url(${course.bg_image})` : "none",
                backgroundColor: course.bg_color || "#fff",
                backgroundSize: "cover", backgroundPosition: "center"
              } : {};
              return (
                <div key={i} className="card" style={{ padding: "36px 32px", position: "relative", overflow: "hidden", ...cardStyle }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${C.gold},${C.goldLight})` }} />
                  <div style={{ fontSize: "2.2rem", marginBottom: 12 }}>{course.icon}</div>
                  <h3 style={{ color: hasBg && course.bg_image ? "#fff" : C.g800, fontWeight: 700, marginBottom: 8, fontSize: "1rem" }}>{course.title}</h3>
                  <div className="gl" />
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
                    {[
                      ["📊", course.level],
                      ["⏱", `${course.weeks} ${lang === "ar" ? "أسابيع" : "weeks"}`],
                      ["🎓", lang === "ar" ? "شهادة معتمدة" : "Certificate"]
                    ].map(([ic, txt], j) => (
                      <span key={j} style={{ fontSize: ".72rem", color: C.g400, letterSpacing: ".08em", display: "flex", alignItems: "center", gap: 4 }}>
                        {ic} {txt}
                      </span>
                    ))}
                  </div>
                  <button className="obtn" style={{ padding: "9px 22px", fontSize: ".73rem", fontFamily: ff }} onClick={() => setPage("booking")}>
                    {lang === "ar" ? "سجّل الآن" : "Enroll Now"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
