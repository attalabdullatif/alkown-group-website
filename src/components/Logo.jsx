import { C } from "../utils/theme";

export default function Logo({ size = "md" }) {
  const s = { sm: [1.5, .58, .5], md: [1.9, .66, .58], lg: [3.2, .95, .82] }[size];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
      <span style={{
        fontSize: s[0] + "rem", fontFamily: "'Dubai','Cairo',sans-serif", fontWeight: 700, lineHeight: 1,
        background: `linear-gradient(135deg,${C.goldDark} 0%,${C.goldLight} 38%,${C.gold} 65%,${C.goldDark} 100%)`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        filter: "drop-shadow(0 2px 12px rgba(200,146,42,.5))"
      }}>الكون</span>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15, gap: 1 }}>
        <span style={{ fontSize: s[1] + "rem", fontFamily: "'Cormorant Garamond','Playfair Display',Georgia,serif", color: C.gold, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase" }}>ALKOWN</span>
        <span style={{ fontSize: s[2] + "rem", color: C.g400, letterSpacing: ".30em", fontFamily: "'Cormorant Garamond','Playfair Display',Georgia,serif", fontWeight: 400, textTransform: "uppercase" }}>GLOBAL</span>
      </div>
    </div>
  );
}
