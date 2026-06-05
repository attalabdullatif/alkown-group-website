// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Visa Application Tracker
// Client portal for tracking visa application status
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { COUNTRIES } from "../../data/countries";

const C = {
  gold: "#c9a84c", goldLight: "#f0d080", cream: "#faf8f4",
  warmWhite: "#fffdf8", beige: "#f5f0e8",
  g400: "#7a6e5a", g600: "#3d342a", g800: "#1e1810",
  dark: "#1e1a14", darkMid: "#2a2418",
};

const STATUS_STEPS = [
  { key: "new", icon: "📨", en: "Received", ar: "تم الاستلام" },
  { key: "reviewing", icon: "🔍", en: "Under Review", ar: "قيد المراجعة" },
  { key: "approved", icon: "✅", en: "Approved", ar: "تمت الموافقة" },
  { key: "completed", icon: "✈️", en: "Completed", ar: "مكتمل" },
];

const STATUS_COLORS = {
  new: "#e8a020",
  reviewing: "#3498db",
  approved: "#27ae60",
  rejected: "#c0392b",
  completed: "#8e44ad",
};

export default function VisaTrackPage({ lang, ff, setPage }) {
  const ar = lang === "ar";
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim() && !email.trim()) {
      setError(ar ? "أدخل رقم الطلب أو البريد الإلكتروني" : "Enter application ID or email");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      let queryBuilder = supabase.from("visa_applications").select("*");

      if (query.trim()) {
        queryBuilder = queryBuilder.or(`id.eq.${query.trim()}`);
      } else if (email.trim()) {
        queryBuilder = queryBuilder.eq("email", email.trim().toLowerCase());
      }

      const { data, error: dbError } = await queryBuilder.limit(1).single();

      if (dbError || !data) {
        setError(ar ? "لم يتم العثور على طلب بهذه البيانات" : "No application found with these details");
      } else {
        setResult(data);
      }
    } catch {
      setError(ar ? "حدث خطأ، حاول مجدداً" : "Something went wrong, please try again");
    }

    setSearched(true);
    setLoading(false);
  };

  const currentStepIndex = result ? STATUS_STEPS.findIndex(s => s.key === result.status) : -1;
  const fromC = result ? COUNTRIES.find(c => c.code === result.nationality) : null;
  const toC = result ? COUNTRIES.find(c => c.code === result.destination) : null;

  return (
    <div style={{ fontFamily: ff, direction: ar ? "rtl" : "ltr", background: C.warmWhite, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.dark}, ${C.darkMid})`, padding: "56px clamp(20px,6vw,80px)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🛂</div>
          <h1 style={{ color: "#fff", fontWeight: 300, fontSize: "clamp(1.6rem,3vw,2.4rem)", marginBottom: 10 }}>
            {ar ? "تتبع طلب التأشيرة" : "Track Your Visa Application"}
          </h1>
          <p style={{ color: "rgba(255,255,255,.5)", fontSize: ".9rem" }}>
            {ar ? "أدخل رقم طلبك أو بريدك الإلكتروني" : "Enter your application ID or email address"}
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ maxWidth: 580, margin: "0 auto", padding: "40px clamp(20px,4vw,40px)" }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: "32px", border: `1px solid rgba(201,168,76,.15)`, boxShadow: "0 4px 24px rgba(0,0,0,.06)", marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: C.g400, fontSize: ".72rem", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>
              {ar ? "رقم الطلب" : "Application ID"}
            </label>
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="AK-VISA-..."
              style={{ width: "100%", padding: "13px 16px", border: `1px solid rgba(201,168,76,.25)`, background: C.beige, color: C.g800, fontSize: ".9rem", borderRadius: 6, fontFamily: ff, outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = C.gold}
              onBlur={e => e.target.style.borderColor = "rgba(201,168,76,.25)"}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,.15)" }} />
            <span style={{ color: C.g400, fontSize: ".8rem" }}>{ar ? "أو" : "OR"}</span>
            <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,.15)" }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", color: C.g400, fontSize: ".72rem", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>
              {ar ? "البريد الإلكتروني" : "Email Address"}
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder={ar ? "البريد المستخدم في التقديم" : "Email used during application"}
              style={{ width: "100%", padding: "13px 16px", border: `1px solid rgba(201,168,76,.25)`, background: C.beige, color: C.g800, fontSize: ".9rem", borderRadius: 6, fontFamily: ff, outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = C.gold}
              onBlur={e => e.target.style.borderColor = "rgba(201,168,76,.25)"}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
          </div>

          {error && <p style={{ color: "#e74c3c", fontSize: ".85rem", marginBottom: 12, textAlign: "center" }}>{error}</p>}

          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              width: "100%", padding: "14px",
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
              border: "none", borderRadius: 6, cursor: loading ? "not-allowed" : "pointer",
              color: C.dark, fontFamily: ff, fontWeight: 700, fontSize: ".9rem",
              opacity: loading ? .7 : 1, transition: "all .3s",
            }}
          >{loading ? (ar ? "جاري البحث..." : "Searching...") : (ar ? "🔍 تتبع الطلب" : "🔍 Track Application")}</button>
        </div>

        {/* Result */}
        {searched && result && (
          <div style={{ background: "#fff", borderRadius: 12, border: `1px solid rgba(201,168,76,.15)`, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,.06)" }}>
            {/* Status header */}
            <div style={{ background: `${STATUS_COLORS[result.status] || C.gold}12`, borderBottom: `1px solid ${STATUS_COLORS[result.status] || C.gold}30`, padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ color: C.g400, fontSize: ".75rem", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>
                    {ar ? "رقم الطلب" : "Application ID"}
                  </div>
                  <div style={{ color: C.g800, fontWeight: 700, fontSize: "1rem" }}>#{result.id}</div>
                </div>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: `${STATUS_COLORS[result.status] || C.gold}20`,
                  border: `1.5px solid ${STATUS_COLORS[result.status] || C.gold}`,
                  color: STATUS_COLORS[result.status] || C.gold,
                  borderRadius: 40, padding: "8px 18px", fontSize: ".82rem", fontWeight: 700, textTransform: "capitalize",
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_COLORS[result.status] || C.gold, display: "inline-block" }} />
                  {result.status}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            {result.status !== "rejected" && (
              <div style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  {STATUS_STEPS.map((step, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%", margin: "0 auto 8px",
                        background: i <= currentStepIndex ? `linear-gradient(135deg, ${C.gold}, ${C.goldLight})` : "rgba(201,168,76,.1)",
                        border: `2px solid ${i <= currentStepIndex ? C.gold : "rgba(201,168,76,.2)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: ".9rem", transition: "all .4s",
                      }}>{i < currentStepIndex ? "✓" : step.icon}</div>
                      <div style={{ fontSize: ".68rem", color: i <= currentStepIndex ? C.gold : C.g400, fontWeight: i === currentStepIndex ? 700 : 400 }}>
                        {ar ? step.ar : step.en}
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div style={{ position: "absolute", display: "none" }} />
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ height: 4, background: "rgba(201,168,76,.1)", borderRadius: 2, marginTop: 8 }}>
                  <div style={{
                    height: "100%", borderRadius: 2,
                    background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`,
                    width: `${Math.max(5, ((currentStepIndex + 1) / STATUS_STEPS.length) * 100)}%`,
                    transition: "width .6s",
                  }} />
                </div>
              </div>
            )}

            {result.status === "rejected" && (
              <div style={{ padding: "24px", background: "rgba(192,57,43,.05)", borderRadius: 8, margin: "16px 24px" }}>
                <p style={{ color: "#c0392b", fontSize: ".9rem" }}>
                  {ar ? "تم رفض الطلب. يرجى التواصل مع فريقنا للمزيد من التفاصيل." : "Application was not approved. Please contact our team for details and next steps."}
                </p>
              </div>
            )}

            {/* Details */}
            <div style={{ padding: "0 24px 24px" }}>
              <div style={{ borderTop: `1px solid rgba(201,168,76,.1)`, paddingTop: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {[
                    [ar ? "الاسم" : "Name", result.full_name],
                    [ar ? "البريد" : "Email", result.email],
                    [ar ? "الجنسية" : "Nationality", fromC ? `${fromC.flag} ${ar ? fromC.nameAr : fromC.name}` : result.nationality],
                    [ar ? "الوجهة" : "Destination", toC ? `${toC.flag} ${ar ? toC.nameAr : toC.name}` : result.destination],
                    [ar ? "تاريخ السفر" : "Travel Date", result.travel_date || "—"],
                    [ar ? "تاريخ التقديم" : "Submitted", new Date(result.created_at).toLocaleDateString()],
                  ].map(([label, val]) => (
                    <div key={label} style={{ background: C.beige, borderRadius: 8, padding: "12px 14px" }}>
                      <div style={{ color: C.g400, fontSize: ".7rem", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                      <div style={{ color: C.g800, fontWeight: 600, fontSize: ".88rem" }}>{val || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact */}
            <div style={{ padding: "16px 24px 24px" }}>
              <a href={`https://wa.me/971544909522?text=${encodeURIComponent(`Hello, I'm following up on visa application #${result.id}`)}`}
                target="_blank" rel="noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", background: "rgba(37,211,102,.1)", border: "1px solid rgba(37,211,102,.3)", borderRadius: 8, color: "#25d366", textDecoration: "none", fontFamily: ff, fontWeight: 600, fontSize: ".88rem" }}>
                💬 {ar ? "تواصل مع الفريق على واتساب" : "Chat with our team on WhatsApp"}
              </a>
            </div>
          </div>
        )}

        {/* Back */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button onClick={() => setPage("visa-center")} style={{ background: "none", border: "none", color: C.g400, cursor: "pointer", fontFamily: ff, fontSize: ".85rem" }}>
            ← {ar ? "العودة لمركز التأشيرات" : "Back to Visa Center"}
          </button>
        </div>
      </div>
    </div>
  );
}
