// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Visa Result Page
// Displays complete visa requirements for a given route
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { checkVisaRequirements } from "../../services/visaService";
import { VISA_TYPE_COLORS, VISA_TYPE_LABELS } from "../../data/visaRules";

const C = {
  gold: "#c9a84c", goldLight: "#f0d080", cream: "#faf8f4",
  warmWhite: "#fffdf8", beige: "#f5f0e8", g100: "#f0ece4",
  g400: "#7a6e5a", g600: "#3d342a", g800: "#1e1810",
  dark: "#1e1a14", darkMid: "#2a2418",
};

function StatusBadge({ type, lang }) {
  const color = VISA_TYPE_COLORS[type] || C.gold;
  const label = VISA_TYPE_LABELS[lang]?.[type] || type;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      background: `${color}18`, border: `1.5px solid ${color}`,
      color, borderRadius: 40, padding: "8px 20px",
      fontSize: ".85rem", fontWeight: 700, letterSpacing: ".05em",
    }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

function InfoCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: "#fff", border: `1px solid rgba(201,168,76,.15)`,
      borderRadius: 10, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16,
      boxShadow: "0 2px 12px rgba(0,0,0,.05)",
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 8,
        background: `${color || C.gold}15`, border: `1px solid ${color || C.gold}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.3rem", flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: ".72rem", color: C.g400, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
        <div style={{ fontWeight: 600, color: C.g800, fontSize: ".95rem" }}>{value}</div>
      </div>
    </div>
  );
}

export default function VisaResultPage({ params, lang, ff, setPage, setVisaParams }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [faqOpen, setFaqOpen] = useState(null);
  const ar = lang === "ar";

  useEffect(() => {
    if (!params) { setPage("visa-center"); return; }
    setLoading(true);
    checkVisaRequirements(params).then(res => {
      setResult(res);
      setLoading(false);
    });
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.warmWhite }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: 16, animation: "spin 1s linear infinite" }}>🌐</div>
        <p style={{ color: C.g400, fontFamily: ff }}>{ar ? "جاري البحث..." : "Checking requirements..."}</p>
      </div>
    </div>
  );

  if (!result?.data) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.warmWhite, padding: "40px 24px" }}>
      <div style={{ textAlign: "center", maxWidth: 500 }}>
        <div style={{ fontSize: "3.5rem", marginBottom: 20 }}>🔍</div>
        <h2 style={{ fontWeight: 800, color: C.g800, marginBottom: 12, fontFamily: ff }}>
          {ar ? "لا توجد بيانات لهذا المسار" : "No Data Found for This Route"}
        </h2>
        <p style={{ color: C.g400, lineHeight: 1.7, marginBottom: 28, fontFamily: ff }}>
          {ar
            ? "لم نجد معلومات محددة لهذا المسار. تواصل مع خبرائنا للمساعدة."
            : "We don't have specific data for this route yet. Contact our experts for assistance."}
        </p>
        <button
          onClick={() => setPage("visa-apply")}
          style={{
            padding: "12px 28px", background: C.gold, color: C.dark,
            border: "none", borderRadius: 6, cursor: "pointer", fontFamily: ff,
            fontWeight: 700, fontSize: ".9rem", marginRight: 12,
          }}
        >{ar ? "استشر خبيرنا" : "Consult Our Expert"}</button>
        <button
          onClick={() => setPage("visa-center")}
          style={{
            padding: "12px 28px", background: "transparent", color: C.g400,
            border: `1px solid rgba(201,168,76,.3)`, borderRadius: 6, cursor: "pointer",
            fontFamily: ff, fontSize: ".9rem",
          }}
        >{ar ? "بحث جديد" : "New Search"}</button>
      </div>
    </div>
  );

  const data = result.data;
  const fromC = data.fromCountry;
  const toC = data.toCountry;
  const resC = data.resCountry;
  const typeColor = VISA_TYPE_COLORS[data.type] || C.gold;

  const tabs = [
    { k: "overview", en: "Overview", ar: "نظرة عامة" },
    { k: "documents", en: "Documents", ar: "المستندات" },
    { k: "process", en: "Process", ar: "خطوات التقديم" },
    { k: "faq", en: "FAQ", ar: "الأسئلة الشائعة" },
  ];

  return (
    <div style={{ fontFamily: ff, direction: ar ? "rtl" : "ltr", background: C.warmWhite, minHeight: "100vh" }}>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg, ${C.dark} 0%, ${C.darkMid} 100%)`, padding: "48px clamp(20px,6vw,80px) 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 28, flexWrap: "wrap" }}>
            <button onClick={() => setPage("visa-center")} style={{ background: "none", border: "none", color: "rgba(255,255,255,.5)", cursor: "pointer", fontFamily: ff, fontSize: ".82rem" }}>
              {ar ? "مركز التأشيرات" : "Visa Center"}
            </button>
            <span style={{ color: "rgba(255,255,255,.25)" }}>›</span>
            <span style={{ color: "rgba(255,255,255,.5)", fontSize: ".82rem" }}>{fromC?.flag} {ar ? fromC?.nameAr : fromC?.name}</span>
            <span style={{ color: "rgba(255,255,255,.25)" }}>→</span>
            <span style={{ color: C.gold, fontSize: ".82rem" }}>{toC?.flag} {ar ? toC?.nameAr : toC?.name}</span>
          </div>

          {/* Route title */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: "3rem" }}>{fromC?.flag}</span>
              <div>
                <div style={{ color: "rgba(255,255,255,.5)", fontSize: ".75rem", letterSpacing: ".14em", textTransform: "uppercase" }}>{ar ? "من" : "From"}</div>
                <div style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 500 }}>{ar ? fromC?.nameAr : fromC?.name}</div>
                {resC && <div style={{ color: C.gold, fontSize: ".8rem" }}>{ar ? `مقيم في ${resC.nameAr}` : `Residing in ${resC.name}`}</div>}
              </div>
            </div>
            <div style={{ color: C.gold, fontSize: "2rem", fontWeight: 800 }}>→</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: "3rem" }}>{toC?.flag}</span>
              <div>
                <div style={{ color: "rgba(255,255,255,.5)", fontSize: ".75rem", letterSpacing: ".14em", textTransform: "uppercase" }}>{ar ? "إلى" : "To"}</div>
                <div style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 500 }}>{ar ? toC?.nameAr : toC?.name}</div>
              </div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <StatusBadge type={data.type} lang={lang} />
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 1, background: "rgba(201,168,76,.1)", borderRadius: "8px 8px 0 0", overflow: "hidden" }}>
            {[
              { icon: "⏱", labelEn: "Processing", labelAr: "مدة المعالجة", val: data.processing },
              { icon: "📅", labelEn: "Max Stay", labelAr: "مدة الإقامة", val: data.stay },
              { icon: "💰", labelEn: "Fee", labelAr: "الرسوم", val: data.fee.amount === 0 ? (ar ? "مجاناً" : "Free") : `${data.fee.amount} ${data.fee.currency}` },
              { icon: "🔄", labelEn: "Last Updated", labelAr: "آخر تحديث", val: data.updatedAt },
            ].map((stat, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,.04)", padding: "18px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "1.3rem", marginBottom: 6 }}>{stat.icon}</div>
                <div style={{ color: "rgba(255,255,255,.4)", fontSize: ".68rem", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>
                  {ar ? stat.labelAr : stat.labelEn}
                </div>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: ".92rem" }}>{stat.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABS ───────────────────────────────────────────────── */}
      <div style={{ background: C.dark, borderBottom: `1px solid rgba(201,168,76,.15)` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 0, overflowX: "auto" }}>
          {tabs.map(tab => (
            <button key={tab.k} onClick={() => setActiveTab(tab.k)} style={{
              padding: "16px 24px", background: "none", border: "none", cursor: "pointer",
              color: activeTab === tab.k ? C.gold : "rgba(255,255,255,.5)",
              borderBottom: activeTab === tab.k ? `2px solid ${C.gold}` : "2px solid transparent",
              fontFamily: ff, fontSize: ".85rem", fontWeight: activeTab === tab.k ? 700 : 400,
              transition: "all .25s", whiteSpace: "nowrap",
            }}>{ar ? tab.ar : tab.en}</button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px clamp(20px,4vw,40px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28, alignItems: "start" }}>

          {/* Main content */}
          <div>
            {activeTab === "overview" && (
              <div>
                <div style={{ background: `${typeColor}10`, border: `1px solid ${typeColor}30`, borderRadius: 10, padding: "20px 24px", marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: typeColor }} />
                    <span style={{ fontWeight: 700, color: typeColor, fontSize: ".9rem" }}>
                      {VISA_TYPE_LABELS[lang][data.type]}
                    </span>
                  </div>
                  <p style={{ color: C.g600, lineHeight: 1.8, fontSize: ".93rem" }}>
                    {ar ? data.notes?.ar : data.notes?.en}
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14, marginBottom: 28 }}>
                  <InfoCard icon="⏱" label={ar ? "مدة المعالجة" : "Processing Time"} value={data.processing} />
                  <InfoCard icon="📅" label={ar ? "مدة الإقامة" : "Stay Duration"} value={data.stay} />
                  <InfoCard icon="💰" label={ar ? "الرسوم" : "Visa Fee"} value={data.fee.amount === 0 ? (ar ? "مجاناً" : "Free") : `${data.fee.amount} ${data.fee.currency}`} color="#27ae60" />
                </div>

                {data.matchType === "specific" && (
                  <div style={{ background: "rgba(201,168,76,.06)", border: `1px solid rgba(201,168,76,.2)`, borderRadius: 8, padding: "14px 20px", marginBottom: 16 }}>
                    <span style={{ color: C.gold, fontSize: ".82rem", fontWeight: 700 }}>
                      {ar ? "✓ هذه النتيجة مخصصة لوضعك كمقيم في " + resC?.nameAr : `✓ This result is tailored for your residence in ${resC?.name}`}
                    </span>
                  </div>
                )}
              </div>
            )}

            {activeTab === "documents" && (
              <div>
                <h3 style={{ color: C.g800, fontWeight: 500, marginBottom: 24, fontSize: "1.1rem" }}>
                  {ar ? "المستندات المطلوبة" : "Required Documents"}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {data.documents?.map((doc, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 14,
                      background: "#fff", border: `1px solid rgba(201,168,76,.12)`,
                      borderRadius: 8, padding: "14px 18px",
                    }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: `rgba(201,168,76,.12)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".8rem", color: C.gold, fontWeight: 700, flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <span style={{ color: C.g600, fontSize: ".92rem" }}>{ar ? doc.ar : doc.en}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, background: C.beige, borderRadius: 8, padding: "16px 20px" }}>
                  <p style={{ color: C.g400, fontSize: ".82rem", lineHeight: 1.7 }}>
                    {ar ? "⚠️ قد تطلب السفارة مستندات إضافية حسب الحالة. يُنصح بالتواصل مع مختصينا للمراجعة." : "⚠️ The embassy may request additional documents. We recommend consulting our specialists before submitting."}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "process" && (
              <div>
                <h3 style={{ color: C.g800, fontWeight: 500, marginBottom: 24, fontSize: "1.1rem" }}>
                  {ar ? "خطوات تقديم الطلب" : "Application Steps"}
                </h3>
                {[
                  { icon: "📋", en: "Prepare all required documents listed above", ar: "جهّز جميع المستندات المطلوبة المذكورة أعلاه" },
                  { icon: "📝", en: "Complete the visa application form accurately", ar: "أكمل استمارة التأشيرة بدقة" },
                  { icon: "🏛", en: "Book an appointment at the embassy or VFS centre", ar: "احجز موعداً في السفارة أو مركز VFS" },
                  { icon: "💳", en: "Pay the visa fee at time of submission", ar: "ادفع رسوم التأشيرة عند التقديم" },
                  { icon: "⏳", en: "Wait for processing — track your application status", ar: "انتظر المعالجة — تتبع حالة طلبك" },
                  { icon: "✈️", en: "Receive visa and prepare for travel", ar: "استلم التأشيرة واستعد للسفر" },
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>
                      {step.icon}
                    </div>
                    <div style={{ flex: 1, paddingTop: 8 }}>
                      <div style={{ color: C.g600, fontSize: ".93rem", lineHeight: 1.6 }}>{ar ? step.ar : step.en}</div>
                      {i < 5 && <div style={{ width: 2, height: 16, background: "rgba(201,168,76,.2)", marginLeft: ar ? "auto" : 20, marginRight: ar ? 20 : "auto", marginTop: 8 }} />}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "faq" && (
              <div>
                <h3 style={{ color: C.g800, fontWeight: 500, marginBottom: 24, fontSize: "1.1rem" }}>
                  {ar ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
                </h3>
                {data.faqs?.length > 0 ? data.faqs.map((faq, i) => (
                  <div key={i} style={{ borderBottom: `1px solid rgba(201,168,76,.1)`, marginBottom: 0 }}>
                    <button
                      onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                      style={{
                        width: "100%", padding: "18px 0", background: "none", border: "none",
                        cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                        fontFamily: ff, color: C.g800, fontWeight: 600, fontSize: ".93rem", textAlign: "left",
                      }}
                    >
                      <span>{ar ? faq.q.ar : faq.q.en}</span>
                      <span style={{ color: C.gold, fontSize: "1.2rem", transition: "transform .3s", transform: faqOpen === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                    </button>
                    {faqOpen === i && (
                      <p style={{ color: C.g400, lineHeight: 1.8, fontSize: ".9rem", paddingBottom: 18 }}>
                        {ar ? faq.a.ar : faq.a.en}
                      </p>
                    )}
                  </div>
                )) : (
                  <p style={{ color: C.g400, fontStyle: "italic" }}>
                    {ar ? "لا توجد أسئلة شائعة لهذا المسار حالياً." : "No FAQs available for this route yet."}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Apply CTA */}
            <div style={{
              background: `linear-gradient(135deg, ${C.dark}, ${C.darkMid})`,
              border: `1px solid rgba(201,168,76,.25)`, borderRadius: 12, padding: "28px 24px", textAlign: "center",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>🛂</div>
              <h3 style={{ color: "#fff", fontWeight: 500, marginBottom: 10, fontSize: "1rem" }}>
                {ar ? "هل تريد مساعدة في التقديم؟" : "Need Help Applying?"}
              </h3>
              <p style={{ color: "rgba(255,255,255,.5)", fontSize: ".82rem", lineHeight: 1.7, marginBottom: 20 }}>
                {ar ? "خبراؤنا يتولون طلبك كاملاً." : "Our experts handle your entire application."}
              </p>
              <button
                onClick={() => setPage("visa-apply")}
                style={{
                  width: "100%", padding: "13px", background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                  border: "none", borderRadius: 6, cursor: "pointer",
                  color: C.dark, fontFamily: ff, fontWeight: 700, fontSize: ".88rem",
                }}
              >{ar ? "قدّم طلبك الآن" : "Apply Now"}</button>
            </div>

            {/* New search */}
            <button
              onClick={() => setPage("visa-center")}
              style={{
                padding: "13px", background: "#fff", border: `1px solid rgba(201,168,76,.25)`,
                borderRadius: 8, cursor: "pointer", color: C.g600, fontFamily: ff, fontSize: ".88rem",
                fontWeight: 600, transition: "all .3s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,.25)"; e.currentTarget.style.color = C.g600; }}
            >{ar ? "🔍 بحث جديد" : "🔍 New Search"}</button>

            {/* Disclaimer */}
            <div style={{ background: C.beige, borderRadius: 8, padding: "14px 16px" }}>
              <p style={{ color: C.g400, fontSize: ".75rem", lineHeight: 1.7 }}>
                {ar
                  ? "⚠️ هذه المعلومات للاسترشاد فقط. تحقق دائماً من السفارة الرسمية قبل السفر."
                  : "⚠️ This information is for guidance only. Always verify with the official embassy before traveling."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
