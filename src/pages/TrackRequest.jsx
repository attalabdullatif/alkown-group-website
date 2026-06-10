import { useState } from "react";
import { supabase } from "../lib/supabase";
import { statusColors } from "../components/crmUi";

const STATUS_AR = {
  "New": "جديد",
  "In Progress": "قيد التنفيذ",
  "Pending Documents": "بانتظار وثائق",
  "Approved": "موافق عليه",
  "Rejected": "مرفوض",
  "Completed": "مكتمل",
};

const STATUS_STEP = ["New", "In Progress", "Pending Documents", "Approved", "Completed"];

export default function TrackRequest() {
  const [requestNumber, setRequestNumber] = useState("");
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState("ar");

  const T = {
    ar: {
      title: "تتبّع طلبك",
      sub: "أدخل رقم الطلب للاطلاع على آخر تحديث",
      placeholder: "REQ-...",
      btn: "بحث",
      loading: "جارٍ البحث...",
      notFound: "لم يُعثر على طلب بهذا الرقم.",
      reqNum: "رقم الطلب",
      status: "الحالة",
      service: "الخدمة",
      client: "العميل",
      created: "تاريخ الإنشاء",
      updated: "آخر تحديث",
      notes: "ملاحظات",
    },
    en: {
      title: "Track Your Request",
      sub: "Enter your request number to check the latest status",
      placeholder: "REQ-...",
      btn: "Search",
      loading: "Searching...",
      notFound: "No request found with this number.",
      reqNum: "Request Number",
      status: "Status",
      service: "Service",
      client: "Client",
      created: "Created",
      updated: "Last Updated",
      notes: "Notes",
    },
  }[lang];

  async function handleSubmit(e) {
    e.preventDefault();
    const term = requestNumber.trim().toUpperCase();
    if (!term) return;
    setLoading(true);
    setError("");
    setRequest(null);

    // Search in requests table first
    const { data: reqData } = await supabase
      .from("requests")
      .select("request_number, status, notes, created_at, updated_at, clients(full_name), services(name)")
      .eq("request_number", term)
      .maybeSingle();

    if (reqData) { setLoading(false); setRequest({ ...reqData, _type: "request" }); return; }

    // Search in visa_applications by id prefix or full_name
    const { data: visaData } = await supabase
      .from("visa_applications")
      .select("id, full_name, status, nationality, destination, travel_date, created_at")
      .or(`full_name.ilike.%${requestNumber.trim()}%,id.eq.${isNaN(requestNumber.trim()) ? 0 : Number(requestNumber.trim())}`)
      .limit(1)
      .maybeSingle();

    setLoading(false);
    if (visaData) { setRequest({ ...visaData, _type: "visa", request_number: `VISA-${visaData.id}` }); return; }
    setError(T.notFound);
  }

  const stepIndex = request ? STATUS_STEP.indexOf(request.status) : -1;

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 16px", fontFamily: "'Cairo', 'Segoe UI', sans-serif",
      direction: lang === "ar" ? "rtl" : "ltr"
    }}>
      <div style={{ width: "100%", maxWidth: 580 }}>

        {/* Logo + Lang */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#c9a84c", letterSpacing: 3 }}>ALKOWN</div>
          <button
            onClick={() => setLang(l => l === "ar" ? "en" : "ar")}
            style={{ marginTop: 8, background: "transparent", border: "1px solid #333", color: "#888", padding: "4px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12 }}
          >
            {lang === "ar" ? "English" : "عربي"}
          </button>
        </div>

        {/* Search card */}
        <div style={{ background: "#111", border: "1px solid #222", borderRadius: 16, padding: "32px 28px", marginBottom: 20 }}>
          <h1 style={{ margin: "0 0 6px", color: "#fff", fontSize: 24 }}>{T.title}</h1>
          <p style={{ color: "#666", margin: "0 0 24px", fontSize: 14 }}>{T.sub}</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10 }}>
            <input
              value={requestNumber}
              onChange={e => setRequestNumber(e.target.value)}
              placeholder={T.placeholder}
              style={{
                flex: 1, padding: "12px 16px", background: "#1a1a1a",
                border: "1px solid #2a2a2a", borderRadius: 10, color: "#fff",
                fontSize: 15, outline: "none"
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px 22px", background: "#c9a84c", color: "#000",
                border: "none", borderRadius: 10, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1,
                fontSize: 15, whiteSpace: "nowrap"
              }}
            >
              {loading ? T.loading : T.btn}
            </button>
          </form>

          {error && (
            <div style={{ marginTop: 16, color: "#ff6b6b", background: "#1a0a0a", border: "1px solid #3a1a1a", borderRadius: 8, padding: "10px 14px", fontSize: 14 }}>
              {error}
            </div>
          )}
        </div>

        {/* Visa Application Result */}
        {request?._type === "visa" && (
          <div style={{ background: "#111", border: "1px solid #c9a84c33", borderRadius: 16, padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <span style={{ color: "#c9a84c", fontWeight: 800, fontSize: 15 }}>{request.request_number}</span>
              <span style={{ background: "#c9a84c22", color: "#c9a84c", padding: "5px 16px", borderRadius: 20, fontWeight: 700, fontSize: 13 }}>
                🛂 {lang === "ar" ? "طلب تأشيرة" : "Visa Application"}
              </span>
            </div>
            <div style={{ display: "grid", gap: 0 }}>
              <Row label={lang === "ar" ? "الاسم" : "Name"} value={request.full_name} />
              <Row label={lang === "ar" ? "الجنسية" : "Nationality"} value={request.nationality} />
              <Row label={lang === "ar" ? "الوجهة" : "Destination"} value={request.destination} />
              {request.travel_date && <Row label={lang === "ar" ? "تاريخ السفر" : "Travel Date"} value={request.travel_date} />}
              <Row label={lang === "ar" ? "الحالة" : "Status"} value={request.status} />
              <Row label={lang === "ar" ? "تاريخ التقديم" : "Submitted"} value={new Date(request.created_at).toLocaleDateString(lang === "ar" ? "ar" : "en")} />
            </div>
          </div>
        )}

        {/* Request Result */}
        {request?._type === "request" && (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 16, padding: "28px", animation: "fadeIn .3s" }}>

            {/* Status Badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
              <span style={{ color: "#888", fontSize: 13 }}>{request.request_number}</span>
              <span style={{
                background: `${statusColors[request.status] || "#c9a84c"}20`,
                color: statusColors[request.status] || "#c9a84c",
                padding: "6px 18px", borderRadius: 20, fontWeight: 700, fontSize: 14
              }}>
                {lang === "ar" ? STATUS_AR[request.status] : request.status}
              </span>
            </div>

            {/* Progress Steps */}
            {request.status !== "Rejected" && (
              <div style={{ display: "flex", gap: 0, marginBottom: 28, position: "relative" }}>
                {STATUS_STEP.map((step, i) => {
                  const done = i <= stepIndex;
                  const active = i === stepIndex;
                  return (
                    <div key={step} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                      {i < STATUS_STEP.length - 1 && (
                        <div style={{
                          position: "absolute", top: 12, left: "50%", width: "100%", height: 2,
                          background: done && i < stepIndex ? "#c9a84c" : "#2a2a2a", zIndex: 0
                        }} />
                      )}
                      <div style={{
                        width: 26, height: 26, borderRadius: "50%", zIndex: 1,
                        background: active ? "#c9a84c" : done ? "#c9a84c" : "#2a2a2a",
                        border: `2px solid ${done ? "#c9a84c" : "#333"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, color: done ? "#000" : "#555", fontWeight: 700
                      }}>
                        {done ? (active ? "●" : "✓") : i + 1}
                      </div>
                      <div style={{ marginTop: 6, fontSize: 10, color: done ? "#c9a84c" : "#555", textAlign: "center" }}>
                        {lang === "ar" ? STATUS_AR[step] : step}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {request.status === "Rejected" && (
              <div style={{ background: "#1a0a0a", border: "1px solid #3a1a1a", borderRadius: 10, padding: "14px 18px", marginBottom: 20, color: "#ff6b6b", fontSize: 14 }}>
                ❌ {lang === "ar" ? "تم رفض هذا الطلب." : "This request has been rejected."}
              </div>
            )}

            {/* Details */}
            <div style={{ display: "grid", gap: 0 }}>
              {request.clients?.full_name && <Row label={T.client} value={request.clients.full_name} />}
              {request.services?.name && <Row label={T.service} value={request.services.name} />}
              <Row label={T.created} value={new Date(request.created_at).toLocaleDateString(lang === "ar" ? "ar" : "en")} />
              {request.updated_at && <Row label={T.updated} value={new Date(request.updated_at).toLocaleDateString(lang === "ar" ? "ar" : "en")} />}
              {request.notes && <Row label={T.notes} value={request.notes} />}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1e1e1e", gap: 12 }}>
      <span style={{ color: "#666", fontSize: 13 }}>{label}</span>
      <span style={{ color: "#ccc", fontSize: 14, textAlign: "end" }}>{value}</span>
    </div>
  );
}
