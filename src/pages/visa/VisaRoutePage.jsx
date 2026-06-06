// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Dynamic Visa Route Page
// SEO-optimized page for each visa route: /visa/syria-to-uae
// ═══════════════════════════════════════════════════════════════

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { COUNTRIES, toSlug } from "../../data/countries";
import { VISA_RULES, VISA_TYPE_COLORS, VISA_TYPE_LABELS } from "../../data/visaRules";
import { generateSEOMeta } from "../../services/visaService";

const C = {
  gold: "#c9a84c", goldLight: "#f0d080", cream: "#faf8f4",
  warmWhite: "#fffdf8", beige: "#f5f0e8",
  g400: "#7a6e5a", g600: "#3d342a", g800: "#1e1810",
  dark: "#1e1a14", darkMid: "#2a2418",
};

const ff = "'Playfair Display',Georgia,serif";

// Match slug like "syria-to-uae" → { from: "SY", to: "AE" }
function resolveSlug(slug) {
  const parts = slug?.split("-to-");
  if (!parts || parts.length < 2) return null;
  const fromPart = parts[0];
  const toPart = parts.slice(1).join("-to-");
  const fromC = COUNTRIES.find(c => toSlug(c.name) === fromPart);
  const toC = COUNTRIES.find(c => toSlug(c.name) === toPart);
  return fromC && toC ? { from: fromC, to: toC } : null;
}

function findRule(fromCode, toCode) {
  return VISA_RULES[`${fromCode}_${toCode}`] || null;
}

function SEOHead({ title, description, keywords }) {
  useEffect(() => {
    document.title = title;
    const setMeta = (name, content, prop) => {
      let el = document.querySelector(`meta[${prop || "name"}="${name}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(prop || "name", name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("description", description);
    setMeta("keywords", keywords);
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    return () => { document.title = "ALKOWN Global"; };
  }, [title, description, keywords]);
  return null;
}

export default function VisaRoutePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const resolved = resolveSlug(slug);
  const rule = resolved ? findRule(resolved.from.code, resolved.to.code) : null;
  const seo = resolved ? generateSEOMeta({ fromCountry: resolved.from, toCountry: resolved.to }) : {};

  if (!resolved) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ff }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔍</div>
        <h2 style={{ fontWeight: 800, color: C.g800, marginBottom: 16 }}>Page Not Found</h2>
        <button onClick={() => navigate("/")} style={{ padding: "10px 24px", background: C.gold, color: C.dark, border: "none", borderRadius: 6, cursor: "pointer", fontFamily: ff }}>
          Back to Visa Center
        </button>
      </div>
    </div>
  );

  const typeColor = rule ? VISA_TYPE_COLORS[rule.type] : "#aaa";
  const typeLabel = rule ? VISA_TYPE_LABELS.en[rule.type] : "Check Required";

  const tabs = ["Overview", "Documents", "Application Steps", "FAQ"];

  return (
    <div style={{ fontFamily: ff, background: C.warmWhite, minHeight: "100vh" }}>
      {seo.title && <SEOHead {...seo} />}

      {/* Structured data for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": seo.title,
        "description": seo.description,
        "url": `https://alkownglobal.com/visa/${slug}`,
        "publisher": { "@type": "Organization", "name": "ALKOWN Global", "url": "https://alkownglobal.com" }
      }) }} />

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.dark} 0%, ${C.darkMid} 100%)`, padding: "60px clamp(20px,6vw,80px) 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 32, flexWrap: "wrap" }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "rgba(255,255,255,.4)", cursor: "pointer", fontFamily: ff, fontSize: ".82rem" }}>Home</button>
            <span style={{ color: "rgba(255,255,255,.2)" }}>›</span>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "rgba(255,255,255,.4)", cursor: "pointer", fontFamily: ff, fontSize: ".82rem" }}>Visa Center</button>
            <span style={{ color: "rgba(255,255,255,.2)" }}>›</span>
            <span style={{ color: C.gold, fontSize: ".82rem" }}>{resolved.from.name} → {resolved.to.name}</span>
          </div>

          {/* Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
            <span style={{ fontSize: "4rem" }}>{resolved.from.flag}</span>
            <div style={{ color: C.gold, fontSize: "2rem" }}>→</div>
            <span style={{ fontSize: "4rem" }}>{resolved.to.flag}</span>
            <div style={{ flex: 1 }}>
              <h1 style={{ color: "#fff", fontWeight: 800, fontSize: "clamp(1.4rem,3vw,2.4rem)", marginBottom: 6 }}>
                {resolved.from.name} to {resolved.to.name} Visa
              </h1>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${typeColor}20`, border: `1px solid ${typeColor}`, color: typeColor, borderRadius: 40, padding: "6px 16px", fontSize: ".8rem", fontWeight: 700 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: typeColor, display: "inline-block" }} />
                  {typeLabel}
                </span>
                {rule && <span style={{ color: "rgba(255,255,255,.4)", fontSize: ".82rem", alignSelf: "center" }}>Updated: {rule.updatedAt}</span>}
              </div>
            </div>
          </div>

          {/* Quick stats */}
          {rule ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 1, background: "rgba(201,168,76,.08)", borderRadius: "8px 8px 0 0", overflow: "hidden" }}>
              {[
                { icon: "⏱", label: "Processing", value: rule.processing },
                { icon: "📅", label: "Max Stay", value: rule.stay },
                { icon: "💰", label: "Fee", value: rule.fee.amount === 0 ? "Free" : `${rule.fee.amount} ${rule.fee.currency}` },
                { icon: "📄", label: "Documents", value: `${rule.documents?.length || 0} required` },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,.04)", padding: "18px", textAlign: "center" }}>
                  <div style={{ fontSize: "1.2rem", marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ color: "rgba(255,255,255,.35)", fontSize: ".65rem", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: ".88rem" }}>{s.value}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: "rgba(255,255,255,.04)", borderRadius: "8px 8px 0 0", padding: "20px 24px" }}>
              <p style={{ color: "rgba(255,255,255,.5)", fontSize: ".9rem" }}>
                Contact our visa specialists for detailed requirements for this route.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: C.dark, borderBottom: `1px solid rgba(201,168,76,.15)` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", overflowX: "auto" }}>
          {tabs.map((tab, i) => {
            const k = tab.toLowerCase().replace(/\s+/g, "-");
            return (
              <button key={i} onClick={() => setActiveTab(k)} style={{
                padding: "14px 22px", background: "none", border: "none", cursor: "pointer",
                color: activeTab === k ? C.gold : "rgba(255,255,255,.4)",
                borderBottom: activeTab === k ? `2px solid ${C.gold}` : "2px solid transparent",
                fontFamily: ff, fontSize: ".85rem", fontWeight: activeTab === k ? 700 : 400,
                whiteSpace: "nowrap",
              }}>{tab}</button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px clamp(20px,4vw,40px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 28, alignItems: "start" }}>

          <div>
            {(!rule || activeTab === "overview") && (
              <div>
                {rule ? (
                  <>
                    <div style={{ background: `${typeColor}10`, border: `1px solid ${typeColor}30`, borderRadius: 10, padding: "22px 26px", marginBottom: 28 }}>
                      <h2 style={{ color: typeColor, fontWeight: 600, fontSize: "1rem", marginBottom: 10 }}>
                        {typeLabel}
                      </h2>
                      <p style={{ color: C.g600, lineHeight: 1.8 }}>{rule.notes?.en}</p>
                    </div>
                    {rule.fee.note && (
                      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                        {[
                          { label: "Fee Note", value: rule.fee.note },
                          { label: "Processing", value: rule.processing },
                          { label: "Stay Duration", value: rule.stay },
                        ].map((item, i) => (
                          <div key={i} style={{ flex: "1 1 180px", background: "#fff", border: `1px solid rgba(201,168,76,.15)`, borderRadius: 8, padding: "16px 20px" }}>
                            <div style={{ color: C.g400, fontSize: ".7rem", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 6 }}>{item.label}</div>
                            <div style={{ color: C.g800, fontWeight: 600 }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ background: C.beige, borderRadius: 10, padding: "32px", textAlign: "center" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🛂</div>
                    <h3 style={{ color: C.g800, fontWeight: 400, marginBottom: 10 }}>Requirements Not Available</h3>
                    <p style={{ color: C.g400, lineHeight: 1.7 }}>
                      We don't have specific data for this route in our database yet. Our specialists can provide accurate, up-to-date requirements.
                    </p>
                  </div>
                )}

                {/* Related routes */}
                <div style={{ marginTop: 32 }}>
                  <h3 style={{ color: C.g800, fontWeight: 500, marginBottom: 18, fontSize: "1rem" }}>
                    Other Popular Routes from {resolved.from.name}
                  </h3>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {Object.values(VISA_RULES)
                      .filter(r => r.from === resolved.from.code && r.to !== resolved.to.code)
                      .slice(0, 4)
                      .map((r, i) => {
                        const toC = COUNTRIES.find(c => c.code === r.to);
                        const slug2 = `${toSlug(resolved.from.name)}-to-${toSlug(toC?.name || "")}`;
                        return (
                          <button
                            key={i}
                            onClick={() => navigate(`/visa/${slug2}`)}
                            style={{
                              padding: "8px 16px", background: "#fff",
                              border: `1px solid rgba(201,168,76,.2)`, borderRadius: 20,
                              cursor: "pointer", fontFamily: ff, fontSize: ".85rem", color: C.g600,
                              display: "flex", alignItems: "center", gap: 6, transition: "all .2s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,.2)"; e.currentTarget.style.color = C.g600; }}
                          >
                            {toC?.flag} {toC?.name}
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "documents" && rule && (
              <div>
                <h2 style={{ color: C.g800, fontWeight: 500, marginBottom: 20 }}>Required Documents</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {rule.documents?.map((doc, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", border: `1px solid rgba(201,168,76,.12)`, borderRadius: 8, padding: "14px 18px" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(201,168,76,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".8rem", color: C.gold, fontWeight: 700, flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <span style={{ color: C.g600 }}>{doc.en}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "application-steps" && (
              <div>
                <h2 style={{ color: C.g800, fontWeight: 500, marginBottom: 20 }}>How to Apply</h2>
                {[
                  { icon: "📋", title: "Gather Documents", desc: "Collect all required documents listed above. Make copies of originals." },
                  { icon: "🖊", title: "Complete Application Form", desc: "Fill out the visa application form accurately and completely." },
                  { icon: "🏛", title: "Book an Appointment", desc: "Schedule an appointment at the embassy, consulate, or VFS centre." },
                  { icon: "💳", title: "Pay Visa Fee", desc: `Pay the required fee of ${rule ? (rule.fee.amount === 0 ? "Free" : `${rule.fee.amount} ${rule.fee.currency}`) : "varies"} at submission.` },
                  { icon: "⏳", title: "Wait for Decision", desc: `Processing typically takes ${rule?.processing || "varies"}. You'll be notified of the outcome.` },
                  { icon: "✈️", title: "Collect & Travel", desc: "Collect your visa, make final travel preparations, and enjoy your trip." },
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 18, marginBottom: 24, alignItems: "flex-start" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
                      {step.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: C.g800, marginBottom: 4 }}>{step.title}</div>
                      <div style={{ color: C.g400, fontSize: ".9rem", lineHeight: 1.7 }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "faq" && (
              <div>
                <h2 style={{ color: C.g800, fontWeight: 500, marginBottom: 20 }}>Frequently Asked Questions</h2>
                {(rule?.faqs?.length > 0 ? rule.faqs : [
                  { q: { en: `Do I need a visa to travel from ${resolved.from.name} to ${resolved.to.name}?` }, a: { en: rule ? `${VISA_TYPE_LABELS.en[rule.type]} — ${rule.notes?.en}` : "Please contact our specialists for accurate, current requirements." } },
                  { q: { en: "Can ALKOWN Global handle my visa application?" }, a: { en: "Yes, our visa specialists handle end-to-end applications, document preparation, and embassy submissions." } },
                  { q: { en: "How long will it take?" }, a: { en: rule?.processing || "Processing times vary. Contact us for current estimates." } },
                ]).map((faq, i) => (
                  <div key={i} style={{ borderBottom: `1px solid rgba(201,168,76,.1)` }}>
                    <button
                      onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                      style={{ width: "100%", padding: "18px 0", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: ff, color: C.g800, fontWeight: 600, fontSize: ".93rem", textAlign: "left" }}
                    >
                      <span>{faq.q.en}</span>
                      <span style={{ color: C.gold, fontSize: "1.2rem", transition: "transform .3s", transform: faqOpen === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                    </button>
                    {faqOpen === i && (
                      <p style={{ color: C.g400, lineHeight: 1.8, fontSize: ".9rem", paddingBottom: 18 }}>{faq.a.en}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: `linear-gradient(135deg, ${C.dark}, ${C.darkMid})`, border: `1px solid rgba(201,168,76,.25)`, borderRadius: 12, padding: "28px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>🛂</div>
              <h3 style={{ color: "#fff", fontWeight: 500, marginBottom: 10, fontSize: ".95rem" }}>Need Help Applying?</h3>
              <p style={{ color: "rgba(255,255,255,.4)", fontSize: ".82rem", lineHeight: 1.7, marginBottom: 18 }}>
                Our experts handle everything — from document prep to embassy submission.
              </p>
              <button
                onClick={() => navigate("/")}
                style={{ width: "100%", padding: "12px", background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, border: "none", borderRadius: 6, cursor: "pointer", color: C.dark, fontFamily: ff, fontWeight: 700, fontSize: ".88rem" }}
              >Start Application</button>
            </div>

            <div style={{ background: "#fff", border: `1px solid rgba(201,168,76,.15)`, borderRadius: 10, padding: "20px" }}>
              <div style={{ color: C.g400, fontSize: ".7rem", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 10 }}>Route Info</div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid rgba(201,168,76,.08)` }}>
                <span style={{ color: C.g400, fontSize: ".85rem" }}>From</span>
                <span style={{ color: C.g800, fontWeight: 600, fontSize: ".85rem" }}>{resolved.from.flag} {resolved.from.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                <span style={{ color: C.g400, fontSize: ".85rem" }}>To</span>
                <span style={{ color: C.g800, fontWeight: 600, fontSize: ".85rem" }}>{resolved.to.flag} {resolved.to.name}</span>
              </div>
            </div>

            <div style={{ background: C.beige, borderRadius: 8, padding: "14px 16px" }}>
              <p style={{ color: C.g400, fontSize: ".75rem", lineHeight: 1.7 }}>
                ⚠️ Information is for guidance only. Always verify with the official embassy before travel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
