import { C } from "../utils/theme";
import PageHero from "./PageHero";

export default function AdvertisingSection({ t, lang, ff, setPage }) {
  return (
    <>
      <PageHero title={t.advertising.hero} subtitle={t.advertising.heroSub} />
      <section style={{ padding: "80px clamp(20px,6vw,80px)", background: "#fff" }}>
        <div style={{ maxWidth: 1220, margin: "0 auto" }}>
          <p style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 52px", color: C.g600, lineHeight: 2 }}>{t.advertising.intro}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
            {t.advertising.services.map((svc, i) => {
              const hasBg = svc.bg_image || svc.bg_color;
              const cardStyle = hasBg ? {
                backgroundImage: svc.bg_image ? `url(${svc.bg_image})` : "none",
                backgroundColor: svc.bg_color || "#fff",
                backgroundSize: "cover", backgroundPosition: "center"
              } : {};
              return (
                <div key={i} className="card" style={{ padding: "34px 30px", ...cardStyle }}>
                  <div style={{ fontSize: "2rem", marginBottom: 14 }}>{svc.icon}</div>
                  <h3 style={{ color: hasBg && svc.bg_image ? "#fff" : C.g800, fontWeight: 700, marginBottom: 6, fontSize: ".98rem" }}>{svc.title}</h3>
                  <div className="gl" />
                  <p style={{ color: hasBg && svc.bg_image ? "rgba(255,255,255,.8)" : C.g400, fontSize: ".84rem", lineHeight: 1.7 }}>{svc.desc}</p>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: "center", marginTop: 52 }}>
            <button className="gbtn" style={{ fontFamily: ff }} onClick={() => setPage("booking")}>{t.nav.book}</button>
          </div>
        </div>
      </section>
    </>
  );
}
