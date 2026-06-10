import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  CRM_COLORS, LEAD_STAGE_AR, LEAD_STAGE_COLORS, LEAD_STAGES,
  REQUEST_STATUSES, cardStyle, formatDate,
  outlineButtonStyle, pageStyle, statusColors,
} from "../components/crmUi";

const STATUS_AR = {
  "New": "جديد",
  "In Progress": "قيد التنفيذ",
  "Pending Documents": "بانتظار وثائق",
  "Approved": "موافق عليه",
  "Rejected": "مرفوض",
  "Completed": "مكتمل",
};

export default function Dashboard() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [requests, setRequests] = useState([]);
  const [aiStats, setAiStats] = useState({ documents: 0, content: 0, queries: 0, sessions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");
    const [clientsRes, requestsRes, docsRes, contentRes, queriesRes, sessionsRes] = await Promise.all([
      supabase.from("clients").select("id, created_at, pipeline_stage").order("created_at", { ascending: false }),
      supabase.from("requests").select("*, clients(full_name), services(name)").order("created_at", { ascending: false }),
      supabase.from("ai_documents").select("id", { count: "exact", head: true }),
      supabase.from("ai_content_items").select("id", { count: "exact", head: true }),
      supabase.from("ai_rag_queries").select("id", { count: "exact", head: true }),
      supabase.from("ai_agent_sessions").select("id", { count: "exact", head: true }),
    ]);
    if (clientsRes.error) setError(clientsRes.error.message);
    if (requestsRes.error) setError(requestsRes.error.message);
    setClients(clientsRes.data || []);
    setRequests(requestsRes.data || []);
    setAiStats({
      documents: docsRes.count  || 0,
      content:   contentRes.count  || 0,
      queries:   queriesRes.count  || 0,
      sessions:  sessionsRes.count || 0,
    });
    setLoading(false);
  }


  // Advanced KPIs
  const avgProcessingDays = useMemo(() => {
    const completed = requests.filter(r => r.status === "Completed" && r.created_at && r.updated_at);
    if (!completed.length) return null;
    const totalDays = completed.reduce((s, r) => {
      const diff = (new Date(r.updated_at) - new Date(r.created_at)) / (1000 * 60 * 60 * 24);
      return s + diff;
    }, 0);
    return Math.round(totalDays / completed.length);
  }, [requests]);

  const rejectionRate = useMemo(() => {
    const done = requests.filter(r => ["Completed","Rejected"].includes(r.status));
    if (!done.length) return 0;
    return Math.round((done.filter(r => r.status === "Rejected").length / done.length) * 100);
  }, [requests]);

  const conversionRate = useMemo(() => {
    if (!requests.length) return 0;
    return Math.round((requests.filter(r => r.status === "Completed").length / requests.length) * 100);
  }, [requests]);

  const activeRequests = useMemo(() =>
    requests.filter(r => !["Completed","Rejected"].includes(r.status)).length,
  [requests]);

  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries(REQUEST_STATUSES.map(s => [s, 0]));
    requests.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return counts;
  }, [requests]);

  const monthCounts = useMemo(() => {
    const counts = {};
    requests.forEach(r => {
      if (!r.created_at) return;
      const d = new Date(r.created_at);
      const label = d.toLocaleString("ar", { month: "short", year: "2-digit" });
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).slice(-6);
  }, [requests]);

  const recentRequests = useMemo(() => requests.slice(0, 10), [requests]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "صباح الخير";
    if (h < 18) return "مساء الخير";
    return "مساء النور";
  };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <div>
          <div style={{ color: CRM_COLORS.goldDark, letterSpacing: ".22em", textTransform: "uppercase", fontSize: 11 }}>Alkown CRM</div>
          <h1 style={{ margin: "6px 0 4px", fontSize: 30 }}>{greeting()} 👋</h1>
          <p style={{ color: CRM_COLORS.muted, margin: 0, fontSize: 14 }}>
            {user?.email} · <span style={{ textTransform: "capitalize", color: CRM_COLORS.goldDark }}>{role}</span>
          </p>
        </div>
        <button style={outlineButtonStyle} onClick={loadDashboard}>تحديث</button>
      </div>

      {error && <div style={{ ...cardStyle, color: CRM_COLORS.danger, padding: 14, marginBottom: 18 }}>{error}</div>}

      {loading ? (
        <p style={{ color: CRM_COLORS.muted }}>جارٍ تحميل البيانات...</p>
      ) : (
        <>
          {/* Stats Row 1 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14, marginBottom: 14 }}>
            <Metric label="إجمالي العملاء"      value={clients.length}                                icon="👥" />
            <Metric label="إجمالي الطلبات"       value={requests.length}                               icon="📋" />
            <Metric label="الطلبات النشطة"       value={activeRequests}                                icon="⚡" color={CRM_COLORS.info} />
            <Metric label="مكتملة"               value={statusCounts["Completed"] || 0}               icon="✅" color={CRM_COLORS.success} />
            <Metric label="مرفوضة"               value={statusCounts["Rejected"] || 0}                icon="❌" color={CRM_COLORS.danger} />
          </div>
          {/* Stats Row 2 — Advanced KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
            <Metric
              label="متوسط وقت المعالجة"
              value={avgProcessingDays !== null ? `${avgProcessingDays} يوم` : "—"}
              icon="⏱" color={CRM_COLORS.info}
            />
            <Metric
              label="نسبة الإكمال"
              value={`${conversionRate}%`}
              icon="📈" color={CRM_COLORS.success}
            />
            <Metric
              label="نسبة الرفض"
              value={`${rejectionRate}%`}
              icon="📉" color={rejectionRate > 20 ? CRM_COLORS.danger : CRM_COLORS.muted}
            />
          </div>

          {/* Pipeline Summary */}
          <section style={{ ...cardStyle, padding: 20, marginBottom: 24 }}>
            <h2 style={{ marginTop: 0, fontSize: 16, marginBottom: 14 }}>Lead Pipeline</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {LEAD_STAGES.map(stage => {
                const count = clients.filter(c => (c.pipeline_stage || "New Lead") === stage).length;
                const color = LEAD_STAGE_COLORS[stage];
                return (
                  <div key={stage} style={{ textAlign: "center", minWidth: 80, flex: "0 0 auto" }}>
                    <div style={{ fontWeight: 900, fontSize: 22, color }}>{count}</div>
                    <div style={{ fontSize: 11, color: CRM_COLORS.muted, marginTop: 2 }}>{LEAD_STAGE_AR[stage]}</div>
                    <div style={{ height: 3, background: `${color}44`, borderRadius: 2, marginTop: 4 }}>
                      <div style={{ height: "100%", width: clients.length ? `${(count / clients.length) * 100}%` : "0%", background: color, borderRadius: 2, transition: "width .4s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 22, marginBottom: 24 }}>
            {/* Status Chart */}
            <section style={{ ...cardStyle, padding: 22 }}>
              <h2 style={{ marginTop: 0, fontSize: 17 }}>الطلبات حسب الحالة</h2>
              <div style={{ display: "grid", gap: 14 }}>
                {REQUEST_STATUSES.map(status => {
                  const count = statusCounts[status] || 0;
                  const max = Math.max(...Object.values(statusCounts), 1);
                  return (
                    <div key={status}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14 }}>
                        <span>{STATUS_AR[status]}</span>
                        <strong style={{ color: statusColors[status] }}>{count}</strong>
                      </div>
                      <div style={{ height: 8, background: CRM_COLORS.beige, borderRadius: 999, overflow: "hidden" }}>
                        <div style={{
                          width: `${(count / max) * 100}%`, height: "100%",
                          background: statusColors[status] || CRM_COLORS.gold,
                          borderRadius: 999, transition: "width .4s"
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Month Chart */}
            <section style={{ ...cardStyle, padding: 22 }}>
              <h2 style={{ marginTop: 0, fontSize: 17 }}>الطلبات الشهرية</h2>
              {monthCounts.length ? (
                <div style={{ height: 200, display: "flex", alignItems: "flex-end", gap: 12, paddingTop: 20 }}>
                  {monthCounts.map(([month, value]) => {
                    const max = Math.max(...monthCounts.map(([, v]) => v), 1);
                    return (
                      <div key={month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                        <strong style={{ fontSize: 13 }}>{value}</strong>
                        <div style={{
                          width: "100%", minHeight: 8,
                          height: `${(value / max) * 150}px`,
                          background: `linear-gradient(180deg, ${CRM_COLORS.gold}, ${CRM_COLORS.goldDark})`,
                          borderRadius: "6px 6px 0 0"
                        }} />
                        <small style={{ color: CRM_COLORS.muted, fontSize: 11 }}>{month}</small>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: CRM_COLORS.muted }}>لا توجد بيانات بعد.</p>
              )}
            </section>
          </div>

          {/* AI Command Center Strip */}
          <section style={{ ...cardStyle, padding: 20, marginBottom: 24, background: "linear-gradient(135deg,#1a1510,#2a2018)", border: "1px solid rgba(201,168,76,.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 28 }}>🤖</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: "#fff" }}>مركز الذكاء الاصطناعي</div>
                  <div style={{ fontSize: ".75rem", color: "rgba(255,255,255,.45)" }}>AI Knowledge Engine</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {[
                  { label: "وثائق", value: aiStats.documents, icon: "📄" },
                  { label: "محتوى", value: aiStats.content,   icon: "✍️" },
                  { label: "استعلامات", value: aiStats.queries, icon: "🔍" },
                  { label: "جلسات", value: aiStats.sessions,   icon: "🤖" },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#c9a84c" }}>{s.value}</div>
                    <div style={{ fontSize: ".68rem", color: "rgba(255,255,255,.4)" }}>{s.icon} {s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { label: "قاعدة المعرفة", path: "/ai/knowledge" },
                  { label: "البحث الذكي",   path: "/ai/search"   },
                  { label: "المحتوى",        path: "/ai/content"  },
                ].map(b => (
                  <button key={b.path} onClick={() => navigate(b.path)} style={{
                    background: "rgba(201,168,76,.15)", color: "#c9a84c",
                    border: "1px solid rgba(201,168,76,.3)", borderRadius: 8,
                    padding: "6px 12px", cursor: "pointer", fontFamily: "inherit",
                    fontSize: ".75rem", fontWeight: 700, whiteSpace: "nowrap",
                  }}>
                    {b.label}
                  </button>
                ))}
                <button onClick={() => navigate("/ai")} style={{
                  background: "#c9a84c", color: "#000", border: "none",
                  borderRadius: 8, padding: "6px 14px", cursor: "pointer",
                  fontFamily: "inherit", fontSize: ".75rem", fontWeight: 800,
                }}>
                  فتح الكل →
                </button>
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section style={{ ...cardStyle, padding: 22 }}>
            <h2 style={{ marginTop: 0, fontSize: 17 }}>آخر الطلبات</h2>
            {recentRequests.length ? (
              <div style={{ overflowX: "auto" }}>
                <table width="100%" cellPadding="12" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "right", color: CRM_COLORS.muted, borderBottom: `1px solid ${CRM_COLORS.border}`, fontSize: 12, textTransform: "uppercase" }}>
                      <th>رقم الطلب</th>
                      <th>العميل</th>
                      <th>الخدمة</th>
                      <th>الحالة</th>
                      <th>التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRequests.map(r => (
                      <tr key={r.id} style={{ borderBottom: `1px solid ${CRM_COLORS.border}` }}>
                        <td style={{ fontWeight: 700, color: CRM_COLORS.goldDark }}>{r.request_number}</td>
                        <td>{r.clients?.full_name || "-"}</td>
                        <td style={{ color: CRM_COLORS.muted, fontSize: 13 }}>{r.services?.name || "-"}</td>
                        <td>
                          <span style={{
                            color: statusColors[r.status], fontWeight: 700, fontSize: 13,
                            background: `${statusColors[r.status]}18`,
                            padding: "2px 10px", borderRadius: 20
                          }}>
                            {STATUS_AR[r.status] || r.status}
                          </span>
                        </td>
                        <td style={{ color: CRM_COLORS.muted, fontSize: 13 }}>{formatDate(r.created_at).split(",")[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: CRM_COLORS.muted }}>لا توجد طلبات بعد.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Metric({ label, value, icon, color = CRM_COLORS.text }) {
  return (
    <div style={{ ...cardStyle, padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ color: CRM_COLORS.muted, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase" }}>{label}</div>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ marginTop: 10, fontSize: 28, fontWeight: 900, color }}>{value}</div>
    </div>
  );
}
