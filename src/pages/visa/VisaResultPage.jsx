// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Visa Result Page
// Rich destination-style layout (verdict + key stats + country info +
// neighbours + requirements + FAQs + sources). Visa data from the live DB
// (with curated documents/FAQs); country facts from countryMeta.json.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { checkVisaRequirements } from "../../services/visaService";
import { VISA_TYPE_COLORS, VISA_TYPE_LABELS } from "../../data/visaRules";
import COUNTRY_META from "../../data/countryMeta.json";

const C = {
  gold: "#c9a84c", goldLight: "#f0d080", cream: "#faf8f4",
  warmWhite: "#fffdf8", beige: "#f5f0e8", g100: "#f0ece4",
  g400: "#7a6e5a", g600: "#3d342a", g800: "#1e1810",
  dark: "#1e1a14", darkMid: "#2a2418",
};

const ENTRY_AR = { single: "دخول واحد", multiple: "دخول متعدد", single_or_multiple: "واحد/متعدد", unknown: "—" };
const ENTRY_EN = { single: "Single", multiple: "Multiple", single_or_multiple: "Single/Multiple", unknown: "—" };
const getMeta = (code) => (code ? COUNTRY_META[code] || null : null);

function StatusBadge({ type, lang }) {
  const color = VISA_TYPE_COLORS[type] || C.gold;
  const label = VISA_TYPE_LABELS[lang]?.[type] || type;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      background: `${color}1f`, border: `1.5px solid ${color}`,
      color, borderRadius: 40, padding: "9px 22px",
      fontSize: ".9rem", fontWeight: 700, letterSpacing: ".03em",
    }}>
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

// One stat tile in the hero strip
function Stat({ icon, label, value, accent }) {
  return (
    <div style={{ background: "rgba(255,255,255,.04)", padding: "18px 16px", textAlign: "center" }}>
      <div style={{ fontSize: "1.2rem", marginBottom: 6 }}>{icon}</div>
      <div style={{ color: "rgba(255,255,255,.4)", fontSize: ".66rem", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
      <div style={{ color: accent || "#fff", fontWeight: 700, fontSize: ".95rem" }}>{value}</div>
    </div>
  );
}

// One row in the country-info card
function DetailRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", borderBottom: `1px solid ${C.g100}` }}>
      <span style={{ fontSize: "1.1rem", width: 26, textAlign: "center", flexShrink: 0 }}>{icon}</span>
      <span style={{ color: C.g400, fontSize: ".85rem", minWidth: 92 }}>{label}</span>
      <span style={{ color: C.g800, fontSize: ".9rem", fontWeight: 600, marginRight: "auto", textAlign: "left" }}>{value}</span>
    </div>
  );
}

function Card({ title, children, ff }) {
  return (
    <div style={{ background: "#fff", border: `1px solid rgba(201,168,76,.15)`, borderRadius: 14, padding: "26px 28px", boxShadow: "0 2px 16px rgba(0,0,0,.05)" }}>
      {title && <h3 style={{ color: C.g800, fontWeight: 700, marginBottom: 18, fontSize: "1.05rem", fontFamily: ff }}>{title}</h3>}
      {children}
    </div>
  );
}

export default function VisaResultPage({ params, lang, ff, setPage }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [faqOpen, setFaqOpen] = useState(null);
  const ar = lang === "ar";

  useEffect(() => {
    if (!params) { setPage("visa-center"); return; }
    setLoading(true);
    checkVisaRequirements(params).then((res) => { setResult(res); setLoading(false); });
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.warmWhite }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>🌐</div>
        <p style={{ color: C.g400, fontFamily: ff }}>{ar ? "جاري البحث..." : "Checking requirements..."}</p>
      </div>
    </div>
  );

  if (!result?.data) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.warmWhite, padding: "40px 24px" }}>
      <div style={{ textAlign: "center", maxWidth: 500, fontFamily: ff }}>
        <div style={{ fontSize: "3.5rem", marginBottom: 20 }}>🔍</div>
        <h2 style={{ fontWeight: 800, color: C.g800, marginBottom: 12 }}>{ar ? "لا توجد بيانات لهذا المسار" : "No Data Found for This Route"}</h2>
        <p style={{ color: C.g400, lineHeight: 1.7, marginBottom: 28 }}>
          {ar ? "لم نجد معلومات محددة لهذا المسار. تواصل مع خبرائنا للمساعدة." : "We don't have specific data for this route yet. Contact our experts."}
        </p>
        <button onClick={() => setPage("visa-apply")} style={{ padding: "12px 28px", background: C.gold, color: C.dark, border: "none", borderRadius: 6, cursor: "pointer", fontFamily: ff, fontWeight: 700, marginInlineEnd: 12 }}>{ar ? "استشر خبيرنا" : "Consult Our Expert"}</button>
        <button onClick={() => setPage("visa-center")} style={{ padding: "12px 28px", background: "transparent", color: C.g400, border: `1px solid rgba(201,168,76,.3)`, borderRadius: 6, cursor: "pointer", fontFamily: ff }}>{ar ? "بحث جديد" : "New Search"}</button>
      </div>
    </div>
  );

  const data = result.data;
  const fromC = data.fromCountry, toC = data.toCountry, resC = data.resCountry;
  const meta = getMeta(toC?.code);
  const typeColor = VISA_TYPE_COLORS[data.type] || C.gold;
  const feeText = data.fee?.amount == null ? "—" : data.fee.amount === 0 ? (ar ? "مجاناً" : "Free") : `$${data.fee.amount}`;
  const validityText = data.passportValidityMonths ? (ar ? `${data.passportValidityMonths} أشهر` : `${data.passportValidityMonths} months`) : "—";
  const entryText = data.entryType ? (ar ? ENTRY_AR[data.entryType] : ENTRY_EN[data.entryType]) || "—" : "—";
  const langs = (meta?.languages || []).join(ar ? "، " : ", ");
  const neighbors = (meta?.neighbors || []).map(getMeta).filter(Boolean);

  // Electronic vs embassy route → tailors steps + tips.
  const isElectronic = ["evisa", "eta", "electronic_authorization", "visa_on_arrival"].includes(data.type);

  // Tips derived from the actual rule (never fabricated).
  const tips = [];
  if (data.passportValidityMonths) tips.push({ ar: `تأكد أن جواز سفرك صالح ${data.passportValidityMonths} أشهر على الأقل من تاريخ الدخول.`, en: `Ensure your passport is valid for at least ${data.passportValidityMonths} months from the date of entry.` });
  if (data.processing && data.processing !== "—") tips.push({ ar: `قدّم قبل وقت كافٍ — المعالجة تستغرق ${data.processing}.`, en: `Apply early — processing takes ${data.processing}.` });
  if (isElectronic && data.officialWebsite) tips.push({ ar: "قدّم فقط عبر البوابة الرسمية، وتجنّب المواقع الوسيطة التي تفرض رسوماً إضافية.", en: "Apply only through the official portal — avoid third-party sites that charge extra fees." });
  if (data.type === "embassy_visa" || data.type === "visa_required") tips.push({ ar: "احجز موعد السفارة أو مركز التأشيرات مبكراً، فالمواعيد قد تكون محدودة.", en: "Book your embassy or visa-centre appointment early — slots can be limited." });
  tips.push({ ar: "قد تُطلب مستندات إضافية حسب حالتك؛ راجع مختصينا قبل التقديم.", en: "Additional documents may be requested depending on your case; consult our specialists before applying." });

  // Application steps tailored to the route type.
  const steps = isElectronic
    ? [
        { icon: "🛂", ar: "تحقّق من صلاحية جواز السفر (6 أشهر فأكثر عادةً).", en: "Check passport validity (usually 6+ months)." },
        { icon: "🖼", ar: "جهّز صورة شخصية ونسخة واضحة من صفحة الجواز.", en: "Prepare a passport photo and a clear scan of your passport page." },
        { icon: "💳", ar: "املأ الطلب وادفع الرسوم عبر البوابة الرسمية.", en: "Complete the application and pay the fee on the official portal." },
        { icon: "📧", ar: "استلم التأشيرة إلكترونياً واطبعها قبل السفر.", en: "Receive the visa by email and print it before travel." },
      ]
    : [
        { icon: "📋", ar: "جهّز جميع المستندات المطلوبة المذكورة أعلاه.", en: "Prepare all the required documents listed above." },
        { icon: "📝", ar: "املأ استمارة طلب التأشيرة بدقة.", en: "Complete the visa application form accurately." },
        { icon: "🏛", ar: "احجز موعداً في السفارة أو مركز VFS.", en: "Book an appointment at the embassy or VFS centre." },
        { icon: "💳", ar: "ادفع الرسوم وقدّم البصمة إن لزم.", en: "Pay the fee and give biometrics if required." },
        { icon: "⏳", ar: "انتظر المعالجة وتتبّع حالة طلبك.", en: "Wait for processing and track your application status." },
        { icon: "✈️", ar: "استلم التأشيرة واستعد للسفر.", en: "Receive your visa and prepare to travel." },
      ];

  const photoSpecs = [
    { icon: "📐", ar: "المقاس", arV: "35 × 45 مم", en: "Size", enV: "35 × 45 mm" },
    { icon: "🎨", ar: "الخلفية", arV: "بيضاء/فاتحة", en: "Background", enV: "White / light" },
    { icon: "🖼", ar: "الصيغة", arV: "JPEG، حديثة (آخر 6 أشهر)", en: "Format", enV: "JPEG, recent (last 6 months)" },
    { icon: "🙂", ar: "الوجه", arV: "70–80% من الصورة، تعبير محايد", en: "Face", enV: "70–80% of frame, neutral expression" },
  ];

  return (
    <div style={{ fontFamily: ff, direction: ar ? "rtl" : "ltr", background: C.warmWhite, minHeight: "100vh" }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg, ${C.dark} 0%, ${C.darkMid} 100%)`, padding: "44px clamp(20px,6vw,80px) 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 26, flexWrap: "wrap", fontSize: ".82rem" }}>
            <button onClick={() => setPage("visa-center")} style={{ background: "none", border: "none", color: "rgba(255,255,255,.5)", cursor: "pointer", fontFamily: ff, fontSize: ".82rem" }}>{ar ? "مركز التأشيرات" : "Visa Center"}</button>
            <span style={{ color: "rgba(255,255,255,.25)" }}>›</span>
            {meta?.region && <><span style={{ color: "rgba(255,255,255,.4)" }}>{meta.region}</span><span style={{ color: "rgba(255,255,255,.25)" }}>›</span></>}
            <span style={{ color: C.gold }}>{toC?.flag} {ar ? toC?.nameAr : toC?.name}</span>
          </div>

          {/* Route + verdict */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 22, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <span style={{ fontSize: "2.6rem" }}>{fromC?.flag}</span>
              <div>
                <div style={{ color: "rgba(255,255,255,.45)", fontSize: ".72rem", letterSpacing: ".12em", textTransform: "uppercase" }}>{ar ? "الجنسية" : "Nationality"}</div>
                <div style={{ color: "#fff", fontSize: "1.05rem", fontWeight: 500 }}>{ar ? fromC?.nameAr : fromC?.name}</div>
                {resC && <div style={{ color: C.gold, fontSize: ".78rem" }}>{ar ? `مقيم في ${resC.nameAr}` : `Residing in ${resC.name}`}</div>}
              </div>
            </div>
            <div style={{ color: C.gold, fontSize: "1.8rem", fontWeight: 800 }}>←</div>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <span style={{ fontSize: "2.6rem" }}>{toC?.flag}</span>
              <div>
                <div style={{ color: "rgba(255,255,255,.45)", fontSize: ".72rem", letterSpacing: ".12em", textTransform: "uppercase" }}>{ar ? "الوجهة" : "Destination"}</div>
                <div style={{ color: "#fff", fontSize: "1.05rem", fontWeight: 500 }}>{ar ? toC?.nameAr : toC?.name}</div>
              </div>
            </div>
            <div style={{ marginInlineStart: "auto" }}><StatusBadge type={data.type} lang={lang} /></div>
          </div>

          {/* Key stats strip (evisaguides-style) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 1, background: "rgba(201,168,76,.12)", borderRadius: "10px 10px 0 0", overflow: "hidden" }}>
            <Stat icon="💰" label={ar ? "الرسوم" : "Fee"} value={feeText} accent={data.fee?.amount === 0 ? "#5cd685" : "#fff"} />
            <Stat icon="⏱" label={ar ? "المعالجة" : "Processing"} value={data.processing || "—"} />
            <Stat icon="📅" label={ar ? "مدة الإقامة" : "Max Stay"} value={data.stay || "—"} />
            <Stat icon="🔁" label={ar ? "نوع الدخول" : "Entry"} value={entryText} />
            <Stat icon="🛂" label={ar ? "صلاحية الجواز" : "Passport Validity"} value={validityText} />
          </div>
          {/* Verified line */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", padding: "12px 4px 18px", fontSize: ".78rem", color: "rgba(255,255,255,.45)" }}>
            {data.updatedAt && data.updatedAt !== "—" && <span>🔄 {ar ? "آخر تحديث" : "Updated"}: {data.updatedAt}</span>}
            {data.officialWebsite && <a href={data.officialWebsite} target="_blank" rel="noopener noreferrer" style={{ color: C.gold, textDecoration: "none" }}>🔗 {ar ? "المصدر الرسمي" : "Official source"} ↗</a>}
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px clamp(20px,4vw,40px) 72px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 26, alignItems: "start" }}>

          {/* Main column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>

            {/* Verdict note */}
            {(ar ? data.notes?.ar : data.notes?.en) && (
              <div style={{ background: `${typeColor}10`, border: `1px solid ${typeColor}30`, borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: typeColor }} />
                  <span style={{ fontWeight: 700, color: typeColor, fontSize: ".92rem" }}>{VISA_TYPE_LABELS[lang][data.type] || data.type}</span>
                </div>
                <p style={{ color: C.g600, lineHeight: 1.85, fontSize: ".92rem" }}>{ar ? data.notes?.ar : data.notes?.en}</p>
              </div>
            )}

            {/* Requirements */}
            {data.documents?.length > 0 && (
              <Card title={ar ? "📋 المستندات المطلوبة" : "📋 Required Documents"} ff={ff}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 10 }}>
                  {data.documents.map((doc, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, background: C.cream, border: `1px solid ${C.g100}`, borderRadius: 8, padding: "11px 14px" }}>
                      <span style={{ color: "#27ae60", fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <span style={{ color: C.g600, fontSize: ".88rem" }}>{ar ? doc.ar : (doc.en || doc.ar)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Application steps */}
            <Card title={ar ? "🧭 خطوات التقديم" : "🧭 Application Steps"} ff={ff}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {steps.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0, color: C.dark, fontWeight: 700 }}>{i + 1}</div>
                    <div style={{ paddingTop: 7, color: C.g600, fontSize: ".9rem", lineHeight: 1.6 }}>
                      <span style={{ marginInlineEnd: 6 }}>{s.icon}</span>{ar ? s.ar : s.en}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Destination country info */}
            {meta && (
              <Card title={ar ? `🌍 معلومات عن ${toC?.nameAr}` : `🌍 About ${toC?.name}`} ff={ff}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "2px 28px" }}>
                  <DetailRow icon="🏛" label={ar ? "العاصمة" : "Capital"} value={meta.capital} />
                  <DetailRow icon="💱" label={ar ? "العملة" : "Currency"} value={meta.currency_name && `${meta.currency_name}${meta.currency_symbol ? ` (${meta.currency_symbol})` : ""}`} />
                  <DetailRow icon="📞" label={ar ? "رمز الاتصال" : "Calling code"} value={meta.calling_code} />
                  <DetailRow icon="🗣" label={ar ? "اللغة" : "Language"} value={langs} />
                  <DetailRow icon="🌐" label={ar ? "المنطقة" : "Region"} value={ar ? (meta.subregion || meta.region) : (meta.subregion || meta.region)} />
                  <DetailRow icon="📐" label={ar ? "المساحة" : "Area"} value={meta.area_km2 && `${meta.area_km2.toLocaleString()} كم²`} />
                </div>
              </Card>
            )}

            {/* Neighbouring countries */}
            {neighbors.length > 0 && (
              <Card title={ar ? "🧭 الدول المجاورة" : "🧭 Neighbouring Countries"} ff={ff}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {neighbors.map((n) => (
                    <span key={n.code} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: C.cream, border: `1px solid ${C.g100}`, borderRadius: 30, padding: "7px 14px", fontSize: ".85rem", color: C.g600 }}>
                      <span style={{ fontSize: "1.1rem" }}>{n.flag}</span>{ar ? n.name_ar || n.name_en : n.name_en}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Photo specifications (common guidance) */}
            <Card title={ar ? "📸 مواصفات الصورة" : "📸 Photo Specifications"} ff={ff}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "2px 28px" }}>
                {photoSpecs.map((p, i) => (
                  <DetailRow key={i} icon={p.icon} label={ar ? p.ar : p.en} value={ar ? p.arV : p.enV} />
                ))}
              </div>
              <p style={{ color: C.g400, fontSize: ".78rem", lineHeight: 1.7, marginTop: 12 }}>
                {ar ? "⚠️ مواصفات إرشادية شائعة — قد تختلف حسب الدولة، تحقّق من البوابة الرسمية." : "⚠️ Common guidance — exact specs vary by country; verify on the official portal."}
              </p>
            </Card>

            {/* Tips & warnings */}
            {tips.length > 0 && (
              <Card title={ar ? "💡 نصائح وتحذيرات" : "💡 Tips & Warnings"} ff={ff}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {tips.map((t, i) => (
                    <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                      <span style={{ color: C.gold, flexShrink: 0 }}>⚡</span>
                      <span style={{ color: C.g600, fontSize: ".88rem", lineHeight: 1.6 }}>{ar ? t.ar : t.en}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* FAQs */}
            {data.faqs?.length > 0 && (
              <Card title={ar ? "❓ الأسئلة الشائعة" : "❓ Frequently Asked Questions"} ff={ff}>
                {data.faqs.map((faq, i) => (
                  <div key={i} style={{ borderBottom: `1px solid ${C.g100}` }}>
                    <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{ width: "100%", padding: "16px 0", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, fontFamily: ff, color: C.g800, fontWeight: 600, fontSize: ".92rem", textAlign: ar ? "right" : "left" }}>
                      <span>{ar ? faq.q.ar : faq.q.en}</span>
                      <span style={{ color: C.gold, fontSize: "1.2rem", flexShrink: 0, transform: faqOpen === i ? "rotate(45deg)" : "none", transition: "transform .25s" }}>+</span>
                    </button>
                    {faqOpen === i && <p style={{ color: C.g400, lineHeight: 1.85, fontSize: ".88rem", paddingBottom: 16 }}>{ar ? faq.a.ar : faq.a.en}</p>}
                  </div>
                ))}
              </Card>
            )}

            {/* Sources & verification */}
            <Card ff={ff}>
              <h3 style={{ color: C.g800, fontWeight: 700, marginBottom: 10, fontSize: "1rem" }}>{ar ? "🔒 المصدر والتحقق" : "🔒 Sources & Verification"}</h3>
              <p style={{ color: C.g400, fontSize: ".84rem", lineHeight: 1.8, marginBottom: data.officialWebsite ? 14 : 0 }}>
                {ar
                  ? "هذه المعلومات للاسترشاد فقط وقد تتغيّر دون إشعار. تحقّق دائماً من المصدر الرسمي قبل السفر."
                  : "This information is for guidance only and may change without notice. Always verify with the official source before traveling."}
              </p>
              {data.officialWebsite && (
                <a href={data.officialWebsite} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", color: C.gold, fontWeight: 600, fontSize: ".88rem", textDecoration: "none" }}>
                  🔗 {data.sourceName || (ar ? "المصدر الرسمي" : "Official source")} ↗
                </a>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 20 }}>
            <div style={{ background: `linear-gradient(135deg, ${C.dark}, ${C.darkMid})`, border: `1px solid rgba(201,168,76,.25)`, borderRadius: 14, padding: "26px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: 10 }}>🛂</div>
              <h3 style={{ color: "#fff", fontWeight: 600, marginBottom: 8, fontSize: "1rem" }}>{ar ? "تريد مساعدة في التقديم؟" : "Need Help Applying?"}</h3>
              <p style={{ color: "rgba(255,255,255,.5)", fontSize: ".82rem", lineHeight: 1.7, marginBottom: 18 }}>{ar ? "خبراؤنا يتولون طلبك كاملاً." : "Our experts handle your entire application."}</p>
              <button onClick={() => setPage("visa-apply")} style={{ width: "100%", padding: "13px", background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, border: "none", borderRadius: 6, cursor: "pointer", color: C.dark, fontFamily: ff, fontWeight: 700, fontSize: ".88rem" }}>{ar ? "قدّم طلبك الآن" : "Apply Now"}</button>
            </div>
            <button onClick={() => setPage("visa-center")} style={{ padding: "13px", background: "#fff", border: `1px solid rgba(201,168,76,.25)`, borderRadius: 10, cursor: "pointer", color: C.g600, fontFamily: ff, fontSize: ".88rem", fontWeight: 600 }}>{ar ? "🔍 بحث جديد" : "🔍 New Search"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
