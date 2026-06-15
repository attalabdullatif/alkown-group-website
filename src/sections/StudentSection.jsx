import { useState } from "react";
import { C } from "../utils/theme";
import { Divider } from "../components/SiteAtoms";
import PageHero from "./PageHero";

export default function StudentSection({ t, lang, ff }) {
  const [tab, setTab] = useState("courses");
  const st = t.student;

  return (
    <>
      <PageHero title={st.hero} subtitle={st.heroSub} />
      <section style={{ padding: "56px clamp(16px,5vw,64px)", background: C.beige, minHeight: "60vh" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ borderBottom: `2px solid rgba(201,168,76,.14)`, marginBottom: 30 }}>
            {Object.entries(st.tabs).map(([k, v]) => (
              <button key={k} className={`tab-btn ${tab === k ? "tab-active" : ""}`}
                style={{ fontFamily: ff, color: tab === k ? C.gold : C.g400 }}
                onClick={() => setTab(k)}>{v}</button>
            ))}
          </div>

          {tab === "courses" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {st.courses.map((c, i) => (
                <div key={i} style={{ background: "#fff", border: `1px solid rgba(201,168,76,.16)`, padding: "28px 32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <h3 style={{ color: C.g800, fontWeight: 700, fontSize: ".98rem" }}>{c.title}</h3>
                        {c.cert && <span style={{ padding: "2px 10px", background: `rgba(201,168,76,.15)`, color: C.gold, borderRadius: 20, fontSize: ".67rem", fontWeight: 700 }}>🎓 {lang === "ar" ? "مكتمل" : "Certified"}</span>}
                      </div>
                      <div style={{ fontSize: ".76rem", color: C.g400, marginBottom: 12 }}>
                        {c.done}/{c.lessons} {lang === "ar" ? "درس مكتمل" : "lessons completed"}
                      </div>
                      <div style={{ width: "100%", height: 6, background: C.g100, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${c.progress}%`, height: "100%", background: `linear-gradient(90deg,${C.gold},${C.goldLight})`, borderRadius: 3, transition: "width 1.2s ease" }} />
                      </div>
                      <div style={{ fontSize: ".72rem", color: C.gold, marginTop: 5, fontWeight: 700 }}>{c.progress}%</div>
                    </div>
                    <button className={c.cert ? "gbtn" : "obtn"} style={{ fontFamily: ff, padding: "9px 20px", fontSize: ".73rem", flexShrink: 0 }}>
                      {c.cert ? (lang === "ar" ? "تحميل الشهادة" : "Download Certificate") : (lang === "ar" ? "متابعة التعلم" : "Continue Learning")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "certs" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
              {st.courses.filter(c => c.cert).map((c, i) => (
                <div key={i} style={{ background: "#fff", border: `1px solid rgba(201,168,76,.2)`, padding: "36px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,${C.gold},${C.goldLight})` }} />
                  <div style={{ fontSize: "2.8rem", marginBottom: 12 }}>🏆</div>
                  <h3 style={{ color: C.g800, fontWeight: 700, fontSize: ".95rem", marginBottom: 6 }}>{c.title}</h3>
                  <Divider />
                  <p style={{ color: C.g400, fontSize: ".78rem", marginBottom: 16 }}>{lang === "ar" ? "شهادة معتمدة · مجموعة الكون" : "Certified · Alkown Group"}</p>
                  <button className="gbtn" style={{ fontFamily: ff, padding: "9px 20px", fontSize: ".73rem" }}>
                    {lang === "ar" ? "تحميل PDF" : "Download PDF"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "schedule" && (
            <div style={{ textAlign: "center", padding: "72px 0" }}>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>📅</div>
              <p style={{ color: C.g400 }}>{lang === "ar" ? "لا توجد جلسات مجدولة" : "No upcoming sessions scheduled"}</p>
            </div>
          )}

          {tab === "profile" && (
            <div style={{ maxWidth: 500, margin: "0 auto", background: "#fff", border: `1px solid rgba(201,168,76,.15)`, padding: "40px" }}>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", fontWeight: 800, color: C.g800, margin: "0 auto 12px" }}>A</div>
                <h3 style={{ color: C.g800, fontWeight: 700 }}>Ahmed Al Mansouri</h3>
                <div style={{ color: C.gold, fontSize: ".78rem" }}>{lang === "ar" ? "طالب نشط" : "Active Student"}</div>
              </div>
              <Divider />
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                {[["✉️", "ahmed@email.com"], ["📞", "+971 54 490 9522"], ["🗓", lang === "ar" ? "عضو منذ 2024" : "Member since 2024"]].map(([ic, val], i) => (
                  <div key={i} style={{ display: "flex", gap: 12, color: C.g600, fontSize: ".88rem" }}>
                    <span>{ic}</span> <span>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
