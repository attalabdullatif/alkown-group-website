import { C } from "../utils/theme";
import Logo from "../components/Logo";

export default function Footer({ t, lang, ff, setPage }) {
  const ft = t.footer;
  const navItems = [
    { k: "home", l: t.nav.home }, { k: "travel", l: t.nav.travel },
    { k: "residency", l: t.nav.residency }, { k: "advertising", l: t.nav.advertising },
    { k: "academy", l: t.nav.academy }, { k: "about", l: t.nav.about }
  ];

  return (
    <footer style={{ background: C.dark, color: C.g400, padding: "80px clamp(20px,6vw,72px) 36px", fontFamily: ff }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 48, marginBottom: 60 }}>

          {/* Brand */}
          <div>
            <div onClick={() => setPage("home")} style={{ cursor: "pointer", marginBottom: 14 }}><Logo size="sm" /></div>
            <p style={{ fontSize: ".84rem", lineHeight: 1.85, color: "#6a6054", marginBottom: 20 }}>{ft.tagline}</p>
            <div style={{ display: "flex", gap: 10 }}>
              {["📸", "💼", "🐦", "📘"].map((ic, i) => (
                <div key={i} style={{
                  width: 38, height: 38, background: "rgba(201,168,76,.07)", border: `1px solid rgba(201,168,76,.18)`,
                  borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", fontSize: ".95rem", transition: "all .25s"
                }}
                  onMouseEnter={e => e.target.style.background = "rgba(201,168,76,.18)"}
                  onMouseLeave={e => e.target.style.background = "rgba(201,168,76,.07)"}
                >{ic}</div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 style={{ color: C.gold, fontSize: ".72rem", letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 20 }}>{ft.qlinks}</h4>
            {navItems.map(n => (
              <div key={n.k} onClick={() => setPage(n.k)}
                style={{ color: "#6a6054", fontSize: ".84rem", marginBottom: 11, cursor: "pointer", transition: "color .25s", letterSpacing: ".05em" }}
                onMouseEnter={e => e.target.style.color = C.gold}
                onMouseLeave={e => e.target.style.color = "#6a6054"}
              >{n.l}</div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: C.gold, fontSize: ".72rem", letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 20 }}>{ft.contact}</h4>
            <div style={{ display: "flex", gap: 10, marginBottom: 13 }}>
              <span style={{ fontSize: ".9rem", marginTop: 1 }}>📍</span>
              <span style={{ fontSize: ".84rem", color: "#6a6054", lineHeight: 1.55 }}>{ft.address}</span>
            </div>
            {[
              { num: "+90 534 764 1249", wa: "https://wa.me/905347641249" },
              { num: "+971 54 490 9522", wa: "https://wa.me/971544909522" },
              { num: "+963 980 631 952", wa: "https://wa.me/963980631952" },
            ].map(({ num, wa }, i) => (
              <a key={i} href={wa} target="_blank" rel="noreferrer"
                style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", textDecoration: "none", transition: "opacity .2s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = ".7"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                <span style={{ fontSize: ".84rem", color: "#6a6054" }}>📞 {num}</span>
              </a>
            ))}
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <span>✉️</span>
              <a href="mailto:info@alkownglobal.com" style={{ fontSize: ".84rem", color: C.gold, textDecoration: "none" }}>info@alkownglobal.com</a>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#e1306c"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              <a href="https://instagram.com/alkownglobal" target="_blank" rel="noreferrer" style={{ fontSize: ".84rem", color: "#e1306c", textDecoration: "none" }}>@alkownglobal</a>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              <a href="https://facebook.com/alkownglobal" target="_blank" rel="noreferrer" style={{ fontSize: ".84rem", color: "#1877f2", textDecoration: "none" }}>@alkownglobal</a>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ color: C.gold, fontSize: ".72rem", letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 20 }}>{ft.newsletter}</h4>
            <p style={{ fontSize: ".82rem", color: "#6a6054", marginBottom: 16, lineHeight: 1.75 }}>{ft.nlSub}</p>
            <div style={{ display: "flex" }}>
              <input placeholder={ft.nlPh} style={{
                flex: 1, padding: "11px 14px", background: "rgba(255,253,248,.05)",
                border: `1px solid rgba(201,168,76,.18)`, borderRight: "none",
                color: C.beige, fontSize: ".82rem", fontFamily: ff, outline: "none"
              }} />
              <button className="gbtn" style={{ padding: "11px 18px", fontSize: ".7rem", borderRadius: "0 2px 2px 0", fontFamily: ff }}>{ft.subscribe}</button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: `1px solid rgba(201,168,76,.1)`, paddingTop: 26, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: ".76rem", color: "#4a4438" }}>{ft.copy}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 18, height: 1, background: `rgba(201,168,76,.35)` }} />
            <span style={{ fontSize: ".68rem", color: C.gold, letterSpacing: ".24em" }}>ALKOWN.GLOBAL</span>
            <div style={{ width: 18, height: 1, background: `rgba(201,168,76,.35)` }} />
          </div>
          {ft.license && <div style={{ fontSize: ".72rem", color: "#4a4438" }}>{ft.license}</div>}
        </div>
      </div>
    </footer>
  );
}
