import { C } from "../utils/theme";
import { HeroBG, Particles, Divider } from "../components/SiteAtoms";

export default function PageHero({ title, subtitle, children }) {
  return (
    <section style={{
      padding: "110px clamp(20px,6vw,80px) 90px",
      background: `
        radial-gradient(circle at top right, rgba(212,175,55,0.15), transparent 35%),
        linear-gradient(140deg, ${C.dark} 0%, ${C.darkMid} 100%)
      `,
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
      minHeight: "420px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <HeroBG />
      <Particles n={18} />
      <div style={{
        position: "absolute", width: 500, height: 500, borderRadius: "50%",
        background: "rgba(212,175,55,0.08)", filter: "blur(100px)",
        top: "-150px", right: "-100px", zIndex: 1,
      }} />
      <div style={{ position: "relative", zIndex: 2, maxWidth: "900px", margin: "0 auto" }}>
        <span style={{
          display: "inline-block", padding: "8px 18px",
          border: `1px solid ${C.gold}`, borderRadius: "999px",
          color: C.gold, fontSize: ".75rem", letterSpacing: ".18em",
          textTransform: "uppercase", marginBottom: "24px",
        }}>ALKOWN GLOBAL</span>
        <h1 className="fu" style={{
          fontSize: "clamp(2.4rem,5vw,4.8rem)", fontWeight: 800,
          color: C.beige, lineHeight: 1.15, marginBottom: "18px", letterSpacing: ".02em",
        }}>{title}</h1>
        <Divider />
        <p className="fu2" style={{
          color: C.gold, letterSpacing: ".22em", fontSize: ".82rem",
          textTransform: "uppercase", marginTop: "14px", marginBottom: "26px",
        }}>{subtitle}</p>
        {children}
      </div>
    </section>
  );
}
