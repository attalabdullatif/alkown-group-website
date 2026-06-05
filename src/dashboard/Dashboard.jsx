import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import {
  CRM_COLORS, REQUEST_STATUSES, cardStyle, formatDate,
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
  const [clients, setClients] = useState([]);
  const [requests, setRequests] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");
    const [clientsRes, requestsRes, invoicesRes] = await Promise.all([
      supabase.from("clients").select("id, created_at").order("created_at", { ascending: false }),
      supabase.from("requests").select("*, clients(full_name), services(name)").order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
    ]);
    if (clientsRes.error) setError(clientsRes.error.message);
    if (requestsRes.error) setError(requestsRes.error.message);
    if (invoicesRes.error) setError(invoicesRes.error.message);
    setClients(clientsRes.data || []);
    setRequests(requestsRes.data || []);
    setInvoices(invoicesRes.data || []);
    setLoading(false);
  }

  const totalRevenue = useMemo(() => invoices.reduce((s, i) => s + Number(i.amount || 0), 0), [invoices]); // eslint-disable-line no-unused-vars
  const paidRevenue = useMemo(() => invoices.filter(i => i.status === "Paid").reduce((s, i) => s + Number(i.amount || 0), 0), [invoices]);
  const pendingRevenue = useMemo(() => invoices.filter(i => i.status === "Pending").reduce((s, i) => s + Number(i.amount || 0), 0), [invoices]);

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
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px,1fr))", gap: 16, marginBottom: 24 }}>
            <Metric label="العملاء" value={clients.length} icon="👥" />
            <Metric label="الطلبات" value={requests.length} icon="📋" />
            <Metric label="طلبات جديدة" value={statusCounts["New"] || 0} icon="🆕" color={CRM_COLORS.goldDark} />
            <Metric label="مكتملة" value={statusCounts["Completed"] || 0} icon="✅" color={CRM_COLORS.success} />
            <Metric label="الإيرادات المدفوعة" value={`$${paidRevenue.toLocaleString()}`} icon="💰" color={CRM_COLORS.success} />
            <Metric label="الإيرادات المعلّقة" value={`$${pendingRevenue.toLocaleString()}`} icon="⏳" color="#c28a25" />
          </div>

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
