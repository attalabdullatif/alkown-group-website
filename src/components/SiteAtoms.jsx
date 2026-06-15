import { C } from "../utils/theme";

export function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px auto", width: "fit-content" }}>
      <div style={{ width: 44, height: 1, background: `linear-gradient(90deg,transparent,${C.gold})` }} />
      <div style={{ position: "relative", width: 8, height: 8 }}>
        <div style={{ width: 8, height: 8, background: C.gold, transform: "rotate(45deg)" }} />
        <div style={{ position: "absolute", inset: -3, border: `1px solid rgba(200,146,42,.3)`, transform: "rotate(45deg)" }} />
      </div>
      <div style={{ width: 44, height: 1, background: `linear-gradient(90deg,${C.gold},transparent)` }} />
    </div>
  );
}

export function Label({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
      <div style={{ width: 28, height: 1.5, background: `linear-gradient(90deg,transparent,${C.gold})`, borderRadius: 2 }} />
      <span style={{ fontSize: ".68rem", letterSpacing: ".28em", color: C.gold, textTransform: "uppercase", fontFamily: "'Cairo',sans-serif", fontWeight: 700 }}>{text}</span>
      <div style={{ width: 28, height: 1.5, background: `linear-gradient(90deg,${C.gold},transparent)`, borderRadius: 2 }} />
    </div>
  );
}

export function Particles({ n = 16 }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {[...Array(n)].map((_, i) => (
        <div key={i} style={{
          position: "absolute", borderRadius: "50%",
          width: i % 4 === 0 ? 3 : 2, height: i % 4 === 0 ? 3 : 2,
          background: `rgba(${180 + i * 3},${140 + i * 2},60,${.25 + (i % 5) * .08})`,
          left: `${(i * 19 + 7) % 100}%`, top: `${(i * 27 + 5) % 100}%`,
          animation: `float ${4 + i % 5}s ease-in-out infinite`,
          animationDelay: `${i * .38}s`
        }} />
      ))}
    </div>
  );
}

export function HeroBG() {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .18 }}
      viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
      <path d="M0,380 Q360,160 720,320 T1440,280" fill="none" stroke={C.gold} strokeWidth="1.2"
        strokeDasharray="1000" style={{ animation: "draw 4s ease both" }} />
      <path d="M0,560 Q430,360 860,500 T1440,460" fill="none" stroke={C.gold} strokeWidth=".6" />
      <circle cx="1150" cy="180" r="180" fill="none" stroke={C.gold} strokeWidth=".7" />
      <circle cx="1150" cy="180" r="110" fill="none" stroke={C.gold} strokeWidth=".4" />
      <circle cx="240" cy="700" r="120" fill="none" stroke={C.gold} strokeWidth=".5" />
      <path d="M80,80 L116,116 L80,152 L44,116Z" fill="none" stroke={C.gold} strokeWidth=".7" />
      <path d="M1350,650 L1380,680 L1350,710 L1320,680Z" fill="none" stroke={C.gold} strokeWidth=".5" />
    </svg>
  );
}
