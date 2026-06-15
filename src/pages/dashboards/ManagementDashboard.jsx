import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { CRM_COLORS, pageStyle } from "../../components/crmUi";
import { VISA_STATUSES, VISA_STATUS_AR, statusColors } from "../../components/crmUi";

function KPICard({ icon, label, value, sub, color = CRM_COLORS.gold }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 10, padding: "20px 22px", borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: "1.8rem", fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: ".78rem", color: CRM_COLORS.muted, marginTop: 6, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: ".72rem", color: CRM_COLORS.muted, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 style={{ fontSize: "1rem", fontWeight: 800, color: CRM_COLORS.text, margin: "28px 0 14px", borderRight: `3px solid ${CRM_COLORS.gold}`, paddingRight: 10 }}>{children}</h2>;
}

export default function ManagementDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: requests }, { data: clients }, { data: invoices }, { data: tasks }] = await Promise.all([
        supabase.from("requests").select("id, status, created_at, priority, assigned_to_email"),
        supabase.from("clients").select("id, created_at, pipeline_stage"),
        supabase.from("invoices").select("id, amount, status, created_at, paid_amount"),
        supabase.from("client_tasks").select("id, status, due_date, priority"),
      ]);

      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const totalRevenue = (invoices || []).filter(i => i.status === "Paid").reduce((s, i) => s + (i.amount || 0), 0);
      const pendingRevenue = (invoices || []).filter(i => i.status !== "Paid" && i.status !== "Cancelled").reduce((s, i) => s + (i.amount || 0), 0);
      const newClientsThisMonth = (clients || []).filter(c => {
        const d = new Date(c.created_at);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      }).length;
      const newRequestsThisMonth = (requests || []).filter(r => {
        const d = new Date(r.created_at);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      }).length;
      const overdueTasks = (tasks || []).filter(t => t.status !== "completed" && t.due_date && new Date(t.due_date) < now).length;
      const approvedRequests = (requests || []).filter(r => r.status === "Approved" || r.status === "Completed").length;
      const conversionRate = requests?.length ? Math.round((approvedRequests / requests.length) * 100) : 0;

      // Stage breakdown
      const byStage = VISA_STATUSES.reduce((acc, s) => {
        acc[s] = (requests || []).filter(r => r.status === s).length;
        return acc;
      }, {});

      // Recent 7 days activity
      const week = new Date(now); week.setDate(week.getDate() - 7);
      const recentRequests = (requests || []).filter(r => new Date(r.created_at) > week).length;

      setData({
        totalRequests: requests?.length || 0,
        totalClients: clients?.length || 0,
        totalRevenue, pendingRevenue,
        newClientsThisMonth, newRequestsThisMonth,
        overdueTasks, conversionRate, byStage, recentRequests,
        approvedRequests,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div style={{ ...pageStyle, textAlign: "center", paddingTop: 80, color: CRM_COLORS.muted }}>جارٍ التحميل...</div>;

  return (
    <div style={{ ...pageStyle, minHeight: "100vh", fontFamily: "'Cairo','Segoe UI',sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: CRM_COLORS.text, margin: 0 }}>لوحة الإدارة التنفيذية</h1>
        <p style={{ color: CRM_COLORS.muted, fontSize: ".85rem", marginTop: 4 }}>نظرة شاملة على أداء المنظومة</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 10 }}>
        <KPICard icon="👥" label="إجمالي العملاء" value={data.totalClients} sub={`+${data.newClientsThisMonth} هذا الشهر`} />
        <KPICard icon="📋" label="إجمالي الطلبات" value={data.totalRequests} sub={`${data.recentRequests} آخر 7 أيام`} />
        <KPICard icon="✅" label="طلبات موافق عليها" value={data.approvedRequests} sub={`معدل التحويل ${data.conversionRate}%`} color="#2d9c5a" />
        <KPICard icon="💰" label="الإيرادات المحصّلة" value={`$${(data.totalRevenue / 1000).toFixed(1)}k`} sub="USD" color="#c8922a" />
        <KPICard icon="⏳" label="إيرادات قيد الانتظار" value={`$${(data.pendingRevenue / 1000).toFixed(1)}k`} sub="USD" color="#c28a25" />
        <KPICard icon="⚠️" label="مهام متأخرة" value={data.overdueTasks} color={data.overdueTasks > 0 ? "#c0392b" : "#2d9c5a"} />
      </div>

      {/* Pipeline stage breakdown */}
      <SectionTitle>توزيع الطلبات حسب المرحلة</SectionTitle>
      <div style={{ background: "#fff", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 10, padding: "20px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {VISA_STATUSES.map(stage => {
            const count = data.byStage[stage] || 0;
            const pct = data.totalRequests ? Math.round((count / data.totalRequests) * 100) : 0;
            const color = statusColors[stage] || CRM_COLORS.muted;
            return (
              <div key={stage} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 120, fontSize: ".78rem", color: CRM_COLORS.muted, textAlign: "right", flexShrink: 0 }}>{VISA_STATUS_AR[stage]}</div>
                <div style={{ flex: 1, height: 10, background: CRM_COLORS.beige, borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 6, transition: "width .8s ease" }} />
                </div>
                <div style={{ width: 50, fontSize: ".78rem", fontWeight: 700, color }}>{count}</div>
                <div style={{ width: 36, fontSize: ".72rem", color: CRM_COLORS.muted }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
