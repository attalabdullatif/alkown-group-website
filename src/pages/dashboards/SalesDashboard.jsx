import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { CRM_COLORS, pageStyle } from "../../components/crmUi";

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

export default function SalesDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: requests }, { data: clients }] = await Promise.all([
        supabase.from("requests").select("id, status, created_at, service_id, services(name)"),
        supabase.from("clients").select("id, created_at"),
      ]);

      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

      const reqThisMonth = (requests || []).filter(r => {
        const d = new Date(r.created_at);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      });
      const reqLastMonth = (requests || []).filter(r => {
        const d = new Date(r.created_at);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
      });

      const leads = (requests || []).filter(r => r.status === "Lead");
      const converted = (requests || []).filter(r => ["Approved", "Completed"].includes(r.status));
      const convRate = requests?.length ? Math.round((converted.length / requests.length) * 100) : 0;

      // Service breakdown
      const svcMap = {};
      (requests || []).forEach(r => {
        const name = r.services?.name || "غير محدد";
        svcMap[name] = (svcMap[name] || 0) + 1;
      });
      const topServices = Object.entries(svcMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

      // Monthly trend (last 6 months)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(thisYear, thisMonth - i, 1);
        const m = d.getMonth();
        const y = d.getFullYear();
        const count = (requests || []).filter(r => {
          const rd = new Date(r.created_at);
          return rd.getMonth() === m && rd.getFullYear() === y;
        }).length;
        monthlyData.push({ label: d.toLocaleDateString("ar-SA", { month: "short" }), count });
      }
      const maxMonthly = Math.max(...monthlyData.map(m => m.count), 1);

      setData({ reqThisMonth: reqThisMonth.length, reqLastMonth: reqLastMonth.length, leads: leads.length, converted: converted.length, convRate, topServices, monthlyData, maxMonthly, totalClients: clients?.length || 0 });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div style={{ ...pageStyle, textAlign: "center", paddingTop: 80, color: CRM_COLORS.muted }}>جارٍ التحميل...</div>;

  const growth = data.reqLastMonth ? Math.round(((data.reqThisMonth - data.reqLastMonth) / data.reqLastMonth) * 100) : null;

  return (
    <div style={{ ...pageStyle, minHeight: "100vh", fontFamily: "'Cairo','Segoe UI',sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: CRM_COLORS.text, margin: 0 }}>لوحة المبيعات</h1>
        <p style={{ color: CRM_COLORS.muted, fontSize: ".85rem", marginTop: 4 }}>تحليل الأداء والتحويل</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 28 }}>
        <KPICard icon="📋" label="طلبات هذا الشهر" value={data.reqThisMonth}
          sub={growth !== null ? (growth >= 0 ? `↑ ${growth}% عن الشهر الماضي` : `↓ ${Math.abs(growth)}% عن الشهر الماضي`) : ""}
          color={growth >= 0 ? "#2d9c5a" : "#c0392b"} />
        <KPICard icon="🎯" label="عملاء محتملون" value={data.leads} />
        <KPICard icon="✅" label="تحويلات ناجحة" value={data.converted} color="#2d9c5a" />
        <KPICard icon="📊" label="معدل التحويل" value={`${data.convRate}%`} color={data.convRate > 50 ? "#2d9c5a" : "#c8922a"} />
        <KPICard icon="👥" label="إجمالي العملاء" value={data.totalClients} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Monthly trend */}
        <div style={{ background: "#fff", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 10, padding: "20px 24px" }}>
          <h3 style={{ fontSize: ".9rem", fontWeight: 700, color: CRM_COLORS.text, margin: "0 0 20px" }}>الطلبات الشهرية (6 أشهر)</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 140 }}>
            {data.monthlyData.map((m, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: ".72rem", fontWeight: 700, color: CRM_COLORS.text }}>{m.count}</div>
                <div style={{ width: "100%", background: `linear-gradient(180deg,${CRM_COLORS.gold},${CRM_COLORS.goldDark})`, height: `${(m.count / data.maxMonthly) * 110}px`, borderRadius: "3px 3px 0 0", minHeight: 4, transition: "height .5s" }} />
                <div style={{ fontSize: ".65rem", color: CRM_COLORS.muted }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top services */}
        <div style={{ background: "#fff", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 10, padding: "20px 24px" }}>
          <h3 style={{ fontSize: ".9rem", fontWeight: 700, color: CRM_COLORS.text, margin: "0 0 20px" }}>أكثر الخدمات طلباً</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.topServices.map(([name, count], i) => {
              const pct = Math.round((count / (data.reqThisMonth || 1)) * 100);
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: ".82rem", color: CRM_COLORS.text, fontWeight: 600 }}>{name}</span>
                    <span style={{ fontSize: ".78rem", color: CRM_COLORS.gold, fontWeight: 700 }}>{count}</span>
                  </div>
                  <div style={{ height: 6, background: CRM_COLORS.beige, borderRadius: 3 }}>
                    <div style={{ height: "100%", width: `${Math.min(pct * 2, 100)}%`, background: `linear-gradient(90deg,${CRM_COLORS.gold},${CRM_COLORS.goldDark})`, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
            {data.topServices.length === 0 && <p style={{ color: CRM_COLORS.muted, fontSize: ".85rem" }}>لا توجد بيانات</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
