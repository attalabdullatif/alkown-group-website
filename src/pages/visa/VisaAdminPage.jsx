// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Visa Admin Panel
// Manage visa rules, applications, countries
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { VISA_RULES, VISA_TYPE_LABELS, VISA_TYPE_COLORS } from "../../data/visaRules";
import { COUNTRIES } from "../../data/countries";

const C = {
  gold: "#c9a84c", goldLight: "#f0d080",
  g400: "#7a6e5a", g600: "#3d342a", g800: "#1e1810",
  dark: "#1e1a14", darkMid: "#2a2418",
  beige: "#f5f0e8", warmWhite: "#fffdf8",
};

const TAB_LABELS = ["Applications", "Visa Rules", "Countries"];

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background: "#fff", border: `1px solid rgba(201,168,76,.15)`, borderRadius: 10, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ fontSize: "1.8rem" }}>{icon}</div>
      <div>
        <div style={{ fontSize: "1.8rem", fontWeight: 700, color: color || C.g800 }}>{value}</div>
        <div style={{ color: C.g400, fontSize: ".8rem" }}>{label}</div>
      </div>
    </div>
  );
}

export default function VisaAdminPage({ ff }) {
  const [tab, setTab] = useState(0);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null); // eslint-disable-line no-unused-vars

  useEffect(() => {
    if (tab === 0) loadApplications();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadApplications() {
    setLoadingApps(true);
    try {
      const { data } = await supabase
        .from("visa_applications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setApplications(data || []);
    } catch {
      setApplications([]);
    }
    setLoadingApps(false);
  }

  async function updateAppStatus(id, status) {
    await supabase.from("visa_applications").update({ status }).eq("id", id);
    setApplications(apps => apps.map(a => a.id === id ? { ...a, status } : a));
  }

  const statusColors = { new: "#e8a020", reviewing: "#3498db", approved: "#27ae60", rejected: "#c0392b", completed: "#8e44ad" };

  const visaRulesArray = Object.values(VISA_RULES);
  const countriesCount = COUNTRIES.length;

  return (
    <div style={{ fontFamily: ff, background: C.warmWhite, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.dark}, ${C.darkMid})`, padding: "32px clamp(20px,4vw,48px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h1 style={{ color: "#fff", fontWeight: 300, fontSize: "1.6rem", marginBottom: 4 }}>Visa Center Admin</h1>
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: ".85rem" }}>Manage applications, rules, and countries</p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px clamp(20px,4vw,48px)" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 32 }}>
          <StatCard icon="📋" label="Total Applications" value={applications.length} />
          <StatCard icon="🗺" label="Visa Routes" value={visaRulesArray.length} color={C.gold} />
          <StatCard icon="🌍" label="Countries" value={countriesCount} color="#2980b9" />
          <StatCard icon="🟡" label="Pending Review" value={applications.filter(a => a.status === "new").length} color="#e8a020" />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid rgba(201,168,76,.15)`, marginBottom: 28 }}>
          {TAB_LABELS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{
              padding: "12px 24px", background: "none", border: "none", cursor: "pointer",
              color: tab === i ? C.gold : C.g400,
              borderBottom: tab === i ? `2px solid ${C.gold}` : "2px solid transparent",
              fontFamily: ff, fontSize: ".88rem", fontWeight: tab === i ? 700 : 400,
            }}>{t}</button>
          ))}
        </div>

        {/* Applications Tab */}
        {tab === 0 && (
          <div>
            {loadingApps ? (
              <div style={{ textAlign: "center", padding: 60, color: C.g400 }}>Loading...</div>
            ) : applications.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: C.g400 }}>
                <div style={{ fontSize: "3rem", marginBottom: 16 }}>📭</div>
                <p>No applications yet. They will appear here once submitted.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: C.beige }}>
                      {["Name", "Email", "Nationality", "Destination", "Travel Date", "Status", "Actions"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: C.g400, fontSize: ".75rem", letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(app => {
                      const fromC = COUNTRIES.find(c => c.code === app.nationality);
                      const toC = COUNTRIES.find(c => c.code === app.destination);
                      return (
                        <tr key={app.id} style={{ borderBottom: `1px solid rgba(201,168,76,.08)` }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,.03)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <td style={{ padding: "14px 16px", color: C.g800, fontWeight: 600, fontSize: ".9rem" }}>{app.full_name}</td>
                          <td style={{ padding: "14px 16px", color: C.g400, fontSize: ".85rem" }}>{app.email}</td>
                          <td style={{ padding: "14px 16px", color: C.g600, fontSize: ".85rem" }}>{fromC?.flag} {fromC?.name || app.nationality}</td>
                          <td style={{ padding: "14px 16px", color: C.g600, fontSize: ".85rem" }}>{toC?.flag} {toC?.name || app.destination}</td>
                          <td style={{ padding: "14px 16px", color: C.g400, fontSize: ".85rem" }}>{app.travel_date}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{
                              display: "inline-block", padding: "4px 12px", borderRadius: 20,
                              background: `${statusColors[app.status] || "#aaa"}18`,
                              color: statusColors[app.status] || "#aaa",
                              fontSize: ".75rem", fontWeight: 700, textTransform: "capitalize",
                            }}>{app.status || "new"}</span>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <select
                              value={app.status || "new"}
                              onChange={e => updateAppStatus(app.id, e.target.value)}
                              style={{ padding: "6px 10px", border: `1px solid rgba(201,168,76,.25)`, borderRadius: 4, background: "#fff", color: C.g800, fontSize: ".8rem", cursor: "pointer" }}
                            >
                              {["new", "reviewing", "approved", "rejected", "completed"].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Visa Rules Tab */}
        {tab === 1 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ color: C.g800, fontWeight: 500 }}>Visa Rules ({visaRulesArray.length} routes)</h3>
              <div style={{ background: "rgba(201,168,76,.08)", border: `1px solid rgba(201,168,76,.2)`, borderRadius: 6, padding: "8px 14px" }}>
                <span style={{ color: C.g400, fontSize: ".8rem" }}>Add new rules via </span>
                <code style={{ color: C.gold, fontSize: ".8rem" }}>src/data/visaRules.js</code>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
              {visaRulesArray.map((rule, i) => {
                const from = COUNTRIES.find(c => c.code === rule.from);
                const to = COUNTRIES.find(c => c.code === rule.to);
                const color = VISA_TYPE_COLORS[rule.type];
                return (
                  <div key={i} style={{ background: "#fff", border: `1px solid rgba(201,168,76,.12)`, borderRadius: 8, padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: "1.3rem" }}>{from?.flag}</span>
                      <span style={{ color: C.g400 }}>→</span>
                      <span style={{ fontSize: "1.3rem" }}>{to?.flag}</span>
                      {rule.residence && (
                        <span style={{ fontSize: ".7rem", color: C.g400, background: C.beige, padding: "2px 6px", borderRadius: 10 }}>
                          via {COUNTRIES.find(c => c.code === rule.residence)?.name}
                        </span>
                      )}
                    </div>
                    <div style={{ fontWeight: 600, color: C.g800, fontSize: ".88rem", marginBottom: 6 }}>
                      {from?.name} → {to?.name}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: color }} />
                      <span style={{ fontSize: ".75rem", color: C.g400 }}>{VISA_TYPE_LABELS.en[rule.type]}</span>
                      <span style={{ marginLeft: "auto", fontSize: ".75rem", color: C.gold }}>{rule.stay}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Countries Tab */}
        {tab === 2 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ color: C.g800, fontWeight: 500 }}>Countries ({COUNTRIES.length})</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 }}>
              {COUNTRIES.map(c => (
                <div key={c.code} style={{ background: "#fff", border: `1px solid rgba(201,168,76,.1)`, borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "1.4rem" }}>{c.flag}</span>
                  <div>
                    <div style={{ color: C.g800, fontSize: ".85rem", fontWeight: 600 }}>{c.name}</div>
                    <div style={{ color: C.g400, fontSize: ".75rem" }}>{c.code} · {c.region}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
