import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { CRM_COLORS, pageStyle } from "../../components/crmUi";

const INVOICE_STATUSES = ["Draft", "Sent", "Paid", "Partially Paid", "Overdue", "Cancelled"];
const STATUS_AR = { Draft: "مسودة", Sent: "مُرسلة", Paid: "مدفوعة", "Partially Paid": "جزئي", Overdue: "متأخرة", Cancelled: "ملغية" };
const STATUS_COLORS = { Draft: "#888", Sent: "#3d6f9f", Paid: "#2d9c5a", "Partially Paid": "#c28a25", Overdue: "#c0392b", Cancelled: "#999" };

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

function fmt(n) { return new Intl.NumberFormat("ar-SA", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n || 0); }

export default function FinanceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: invoices }, { data: payments }, { data: expenses }] = await Promise.all([
        supabase.from("invoices").select("id, amount, status, created_at, due_date, paid_amount, clients(full_name)"),
        supabase.from("payments").select("id, amount, created_at"),
        supabase.from("expenses").select("id, amount, category, created_at"),
      ]);

      const totalRevenue = (invoices || []).filter(i => i.status === "Paid").reduce((s, i) => s + (i.amount || 0), 0);
      const totalPending = (invoices || []).filter(i => !["Paid", "Cancelled"].includes(i.status)).reduce((s, i) => s + (i.amount || 0), 0);
      const totalOverdue = (invoices || []).filter(i => i.status === "Overdue").reduce((s, i) => s + (i.amount || 0), 0);
      const totalExpenses = (expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
      const netProfit = totalRevenue - totalExpenses;

      // Status breakdown
      const statusBreakdown = INVOICE_STATUSES.reduce((acc, s) => {
        const invs = (invoices || []).filter(i => i.status === s);
        acc[s] = { count: invs.length, total: invs.reduce((t, i) => t + (i.amount || 0), 0) };
        return acc;
      }, {});

      // Monthly revenue (last 6 months)
      const now = new Date();
      const monthly = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const rev = (payments || []).filter(p => {
          const pd = new Date(p.created_at);
          return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
        }).reduce((s, p) => s + (p.amount || 0), 0);
        monthly.push({ label: d.toLocaleDateString("ar-SA", { month: "short" }), rev });
      }
      const maxRev = Math.max(...monthly.map(m => m.rev), 1);

      // Expense categories
      const expCat = {};
      (expenses || []).forEach(e => { expCat[e.category || "أخرى"] = (expCat[e.category || "أخرى"] || 0) + (e.amount || 0); });
      const topExpenses = Object.entries(expCat).sort((a, b) => b[1] - a[1]).slice(0, 5);

      // Overdue invoices list
      const overdueList = (invoices || []).filter(i => i.status === "Overdue").slice(0, 5);

      setData({ totalRevenue, totalPending, totalOverdue, totalExpenses, netProfit, statusBreakdown, monthly, maxRev, topExpenses, overdueList, totalInvoices: invoices?.length || 0 });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div style={{ ...pageStyle, textAlign: "center", paddingTop: 80, color: CRM_COLORS.muted }}>جارٍ التحميل...</div>;

  return (
    <div style={{ ...pageStyle, minHeight: "100vh", fontFamily: "'Cairo','Segoe UI',sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: CRM_COLORS.text, margin: 0 }}>لوحة المالية</h1>
        <p style={{ color: CRM_COLORS.muted, fontSize: ".85rem", marginTop: 4 }}>الإيرادات والمصروفات والأرباح</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 28 }}>
        <KPICard icon="💰" label="الإيرادات المحصّلة" value={fmt(data.totalRevenue)} color="#2d9c5a" />
        <KPICard icon="⏳" label="قيد الانتظار" value={fmt(data.totalPending)} color="#c28a25" />
        <KPICard icon="⚠️" label="فواتير متأخرة" value={fmt(data.totalOverdue)} color="#c0392b" />
        <KPICard icon="📉" label="المصروفات" value={fmt(data.totalExpenses)} color="#888" />
        <KPICard icon="📈" label="صافي الربح" value={fmt(data.netProfit)} color={data.netProfit >= 0 ? "#2d9c5a" : "#c0392b"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Revenue trend */}
        <div style={{ background: "#fff", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 10, padding: "20px 24px" }}>
          <h3 style={{ fontSize: ".9rem", fontWeight: 700, color: CRM_COLORS.text, margin: "0 0 20px" }}>الإيرادات الشهرية (6 أشهر)</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 140 }}>
            {data.monthly.map((m, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: ".65rem", fontWeight: 700, color: CRM_COLORS.text }}>{m.rev ? `$${(m.rev / 1000).toFixed(0)}k` : "—"}</div>
                <div style={{ width: "100%", background: `linear-gradient(180deg,#2d9c5a,#1a6b3a)`, height: `${(m.rev / data.maxRev) * 110}px`, borderRadius: "3px 3px 0 0", minHeight: m.rev ? 6 : 2, transition: "height .5s" }} />
                <div style={{ fontSize: ".65rem", color: CRM_COLORS.muted }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div style={{ background: "#fff", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 10, padding: "20px 24px" }}>
          <h3 style={{ fontSize: ".9rem", fontWeight: 700, color: CRM_COLORS.text, margin: "0 0 16px" }}>حالات الفواتير</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {INVOICE_STATUSES.map(s => {
              const d = data.statusBreakdown[s];
              if (!d.count) return null;
              return (
                <div key={s} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: ".68rem", fontWeight: 700, background: `${STATUS_COLORS[s]}18`, color: STATUS_COLORS[s] }}>{STATUS_AR[s]}</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: ".78rem", fontWeight: 700, color: CRM_COLORS.text }}>{d.count} فاتورة</div>
                    <div style={{ fontSize: ".68rem", color: STATUS_COLORS[s] }}>{fmt(d.total)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Top expense categories */}
        <div style={{ background: "#fff", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 10, padding: "20px 24px" }}>
          <h3 style={{ fontSize: ".9rem", fontWeight: 700, color: CRM_COLORS.text, margin: "0 0 16px" }}>أبرز فئات المصروفات</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.topExpenses.map(([cat, amt], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${CRM_COLORS.border}` }}>
                <span style={{ fontSize: ".82rem", color: CRM_COLORS.text }}>{cat}</span>
                <span style={{ fontSize: ".82rem", fontWeight: 700, color: "#c0392b" }}>{fmt(amt)}</span>
              </div>
            ))}
            {data.topExpenses.length === 0 && <p style={{ color: CRM_COLORS.muted, fontSize: ".85rem" }}>لا توجد مصروفات مسجّلة</p>}
          </div>
        </div>

        {/* Overdue invoices */}
        <div style={{ background: "#fff", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 10, padding: "20px 24px" }}>
          <h3 style={{ fontSize: ".9rem", fontWeight: 700, color: CRM_COLORS.text, margin: "0 0 16px" }}>فواتير متأخرة</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.overdueList.map(inv => (
              <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${CRM_COLORS.border}` }}>
                <div>
                  <div style={{ fontSize: ".82rem", fontWeight: 600, color: CRM_COLORS.text }}>{inv.clients?.full_name || "—"}</div>
                  <div style={{ fontSize: ".7rem", color: CRM_COLORS.muted }}>{inv.due_date ? `استحقاق: ${new Date(inv.due_date).toLocaleDateString("ar-SA")}` : ""}</div>
                </div>
                <span style={{ fontSize: ".82rem", fontWeight: 700, color: "#c0392b" }}>{fmt(inv.amount)}</span>
              </div>
            ))}
            {data.overdueList.length === 0 && <p style={{ color: "#2d9c5a", fontSize: ".85rem" }}>✓ لا توجد فواتير متأخرة</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
