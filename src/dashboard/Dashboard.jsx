import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  CRM_COLORS,
  REQUEST_STATUSES,
  cardStyle,
  formatDate,
  outlineButtonStyle,
  pageStyle,
  statusColors,
} from "../components/crmUi";

export default function Dashboard() {
  const [clients, setClients] = useState([]);
  const [requests, setRequests] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    const [clientsResult, requestsResult, invoicesResult] = await Promise.all([
      supabase.from("clients").select("*").order("created_at", { ascending: false }),
      supabase
        .from("requests")
        .select("*, clients(full_name, email, phone), services(name, price)")
        .order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
    ]);

    if (clientsResult.error) setError(clientsResult.error.message);
    if (requestsResult.error) setError(requestsResult.error.message);
    if (invoicesResult.error) setError(invoicesResult.error.message);

    setClients(clientsResult.data || []);
    setRequests(requestsResult.data || []);
    setInvoices(invoicesResult.data || []);
    setLoading(false);
  }

  const revenue = useMemo(
    () => invoices.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0),
    [invoices]
  );

  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries(REQUEST_STATUSES.map((status) => [status, 0]));
    requests.forEach((request) => {
      counts[request.status] = (counts[request.status] || 0) + 1;
    });
    return counts;
  }, [requests]);

  const monthCounts = useMemo(() => {
    const counts = {};
    requests.forEach((request) => {
      if (!request.created_at) return;
      const date = new Date(request.created_at);
      const label = date.toLocaleString("en", { month: "short", year: "2-digit" });
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).slice(0, 6).reverse();
  }, [requests]);

  const recentActivity = useMemo(
    () => requests.slice(0, 8),
    [requests]
  );

  return (
    <div style={pageStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <div>
          <div style={{ color: CRM_COLORS.goldDark, letterSpacing: ".22em", textTransform: "uppercase", fontSize: 12 }}>
            Alkown CRM
          </div>
          <h1 style={{ margin: "6px 0", fontSize: 34 }}>Dashboard</h1>
          <p style={{ color: CRM_COLORS.muted, margin: 0 }}>Live business overview for clients, requests, and revenue.</p>
        </div>
        <button style={outlineButtonStyle} onClick={loadDashboard}>
          Refresh
        </button>
      </div>

      {error && <div style={{ ...cardStyle, color: CRM_COLORS.danger, padding: 14, marginBottom: 18 }}>{error}</div>}

      {loading ? (
        <p style={{ color: CRM_COLORS.muted }}>Loading dashboard...</p>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 16, marginBottom: 22 }}>
            <Metric title="Total Clients" value={clients.length} />
            <Metric title="Total Requests" value={requests.length} />
            <Metric title="New Requests" value={statusCounts.New || 0} />
            <Metric title="Completed Requests" value={statusCounts.Completed || 0} />
            <Metric title="Revenue" value={`AED ${revenue.toLocaleString()}`} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 22, marginBottom: 22 }}>
            <section style={{ ...cardStyle, padding: 22 }}>
              <h2 style={{ marginTop: 0 }}>Requests by Status</h2>
              <StatusChart counts={statusCounts} />
            </section>

            <section style={{ ...cardStyle, padding: 22 }}>
              <h2 style={{ marginTop: 0 }}>Requests by Month</h2>
              <MonthChart items={monthCounts} />
            </section>
          </div>

          <section style={{ ...cardStyle, padding: 22 }}>
            <h2 style={{ marginTop: 0 }}>Recent Activity</h2>
            {recentActivity.length ? (
              <div style={{ overflowX: "auto" }}>
                <table width="100%" cellPadding="13" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: CRM_COLORS.muted, borderBottom: `1px solid ${CRM_COLORS.border}` }}>
                      <th>Request</th>
                      <th>Client</th>
                      <th>Service</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((request) => (
                      <tr key={request.id} style={{ borderBottom: "1px solid #f1eadc" }}>
                        <td>{request.request_number}</td>
                        <td>{request.clients?.full_name || "-"}</td>
                        <td>{request.services?.name || "-"}</td>
                        <td style={{ color: statusColors[request.status] || CRM_COLORS.text, fontWeight: 800 }}>{request.status}</td>
                        <td>{formatDate(request.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: CRM_COLORS.muted }}>No activity yet.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Metric({ title, value }) {
  return (
    <div style={{ ...cardStyle, padding: 22 }}>
      <div style={{ color: CRM_COLORS.muted, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase" }}>{title}</div>
      <div style={{ marginTop: 10, fontSize: 32, fontWeight: 900, color: CRM_COLORS.text }}>{value}</div>
    </div>
  );
}

function StatusChart({ counts }) {
  const max = Math.max(...Object.values(counts), 1);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {REQUEST_STATUSES.map((status) => (
        <div key={status}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span>{status}</span>
            <strong>{counts[status] || 0}</strong>
          </div>
          <div style={{ height: 9, background: CRM_COLORS.beige, borderRadius: 999, overflow: "hidden" }}>
            <div
              style={{
                width: `${((counts[status] || 0) / max) * 100}%`,
                height: "100%",
                background: statusColors[status] || CRM_COLORS.gold,
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MonthChart({ items }) {
  const max = Math.max(...items.map(([, value]) => value), 1);

  if (!items.length) {
    return <p style={{ color: CRM_COLORS.muted }}>No monthly data yet.</p>;
  }

  return (
    <div style={{ height: 220, display: "flex", alignItems: "end", gap: 14, paddingTop: 20 }}>
      {items.map(([month, value]) => (
        <div key={month} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "end", alignItems: "center", gap: 8, height: "100%" }}>
          <strong>{value}</strong>
          <div
            style={{
              width: "100%",
              minHeight: 8,
              height: `${(value / max) * 150}px`,
              background: `linear-gradient(180deg, ${CRM_COLORS.gold}, ${CRM_COLORS.goldDark})`,
              borderRadius: "6px 6px 0 0",
            }}
          />
          <small style={{ color: CRM_COLORS.muted }}>{month}</small>
        </div>
      ))}
    </div>
  );
}
