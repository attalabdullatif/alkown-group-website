import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  CRM_COLORS,
  buttonStyle,
  cardStyle,
  formatDate,
  inputStyle,
  outlineButtonStyle,
  pageStyle,
  statusColors,
} from "../components/crmUi";

const emptyClient = {
  full_name: "",
  phone: "",
  email: "",
};

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [form, setForm] = useState(emptyClient);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    const [clientsResult, requestsResult] = await Promise.all([
      supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("requests")
        .select("id, request_number, client_id, status, notes, created_at")
        .order("created_at", { ascending: false }),
    ]);

    if (clientsResult.error) {
      setError(clientsResult.error.message);
    } else {
      setClients(clientsResult.data || []);
    }

    if (!requestsResult.error) {
      setRequests(requestsResult.data || []);
    }

    setLoading(false);
  }

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;

    return clients.filter((client) =>
      [client.full_name, client.email, client.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [clients, search]);

  const selectedRequests = useMemo(() => {
    if (!selectedClient) return [];
    return requests.filter((request) => request.client_id === selectedClient.id);
  }, [requests, selectedClient]);

  function editClient(client) {
    setSelectedClient(client);
    setForm({
      full_name: client.full_name || "",
      phone: client.phone || "",
      email: client.email || "",
    });
  }

  function resetForm() {
    setSelectedClient(null);
    setForm(emptyClient);
  }

  async function saveClient(event) {
    event.preventDefault();

    if (!form.full_name.trim() || !form.phone.trim()) {
      setError("Full name and phone are required.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
    };

    const result = selectedClient
      ? await supabase.from("clients").update(payload).eq("id", selectedClient.id)
      : await supabase.from("clients").insert([payload]);

    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    resetForm();
    await loadData();
  }

  async function deleteClient(client) {
    const confirmed = window.confirm(`Delete ${client.full_name}? This cannot be undone.`);
    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("clients")
      .delete()
      .eq("id", client.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (selectedClient?.id === client.id) resetForm();
    await loadData();
  }

  return (
    <div style={pageStyle}>
      <Header
        title="Clients"
        subtitle="Manage client records, contact details, and activity history."
      />

      {error && <Alert message={error} />}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(320px,.8fr)", gap: 22 }}>
        <section style={{ ...cardStyle, padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
            <input
              placeholder="Search by name, email, or phone"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ ...inputStyle, maxWidth: 420 }}
            />
            <button style={outlineButtonStyle} onClick={loadData}>
              Refresh
            </button>
          </div>

          {loading ? (
            <p style={{ color: CRM_COLORS.muted }}>Loading clients...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table width="100%" cellPadding="13" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", color: CRM_COLORS.muted, borderBottom: `1px solid ${CRM_COLORS.border}` }}>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} style={{ borderBottom: "1px solid #f1eadc" }}>
                      <td>
                        <button
                          onClick={() => editClient(client)}
                          style={{ border: 0, background: "transparent", color: CRM_COLORS.goldDark, fontWeight: 800, cursor: "pointer" }}
                        >
                          {client.full_name || "Unnamed client"}
                        </button>
                      </td>
                      <td>{client.phone || "-"}</td>
                      <td>{client.email || "-"}</td>
                      <td>{formatDate(client.created_at)}</td>
                      <td>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button style={outlineButtonStyle} onClick={() => editClient(client)}>
                            Details
                          </button>
                          <button style={{ ...outlineButtonStyle, color: CRM_COLORS.danger }} onClick={() => deleteClient(client)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!filteredClients.length && (
                    <tr>
                      <td colSpan="5" style={{ color: CRM_COLORS.muted, textAlign: "center", padding: 28 }}>
                        No clients found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <section style={{ ...cardStyle, padding: 22 }}>
            <h2 style={{ marginTop: 0 }}>{selectedClient ? "Edit Client" : "Add Client"}</h2>
            <form onSubmit={saveClient} style={{ display: "grid", gap: 12 }}>
              <input
                placeholder="Full name"
                value={form.full_name}
                onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))}
                style={inputStyle}
              />
              <input
                placeholder="Phone"
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                style={inputStyle}
              />
              <input
                placeholder="Email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                style={inputStyle}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={buttonStyle} disabled={saving}>
                  {saving ? "Saving..." : selectedClient ? "Save Changes" : "Create Client"}
                </button>
                {selectedClient && (
                  <button type="button" style={outlineButtonStyle} onClick={resetForm}>
                    New
                  </button>
                )}
              </div>
            </form>
          </section>

          <section style={{ ...cardStyle, padding: 22 }}>
            <h2 style={{ marginTop: 0 }}>Client Details</h2>
            {selectedClient ? (
              <>
                <Detail label="Client ID" value={selectedClient.id} />
                <Detail label="Name" value={selectedClient.full_name} />
                <Detail label="Phone" value={selectedClient.phone} />
                <Detail label="Email" value={selectedClient.email} />
                <Detail label="Created" value={formatDate(selectedClient.created_at)} />
              </>
            ) : (
              <p style={{ color: CRM_COLORS.muted }}>Select a client to view details.</p>
            )}
          </section>

          <section style={{ ...cardStyle, padding: 22 }}>
            <h2 style={{ marginTop: 0 }}>Activity Timeline</h2>
            {selectedClient ? (
              selectedRequests.length ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {selectedRequests.map((request) => (
                    <div key={request.id} style={{ borderLeft: `3px solid ${statusColors[request.status] || CRM_COLORS.gold}`, paddingLeft: 12 }}>
                      <strong>{request.request_number}</strong>
                      <div style={{ color: statusColors[request.status] || CRM_COLORS.muted }}>{request.status}</div>
                      <small style={{ color: CRM_COLORS.muted }}>{formatDate(request.created_at)}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: CRM_COLORS.muted }}>No activity yet.</p>
              )
            ) : (
              <p style={{ color: CRM_COLORS.muted }}>Select a client to see activity.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function Header({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ color: CRM_COLORS.goldDark, letterSpacing: ".22em", textTransform: "uppercase", fontSize: 12 }}>
        Alkown CRM
      </div>
      <h1 style={{ margin: "6px 0", fontSize: 34 }}>{title}</h1>
      <p style={{ color: CRM_COLORS.muted, margin: 0 }}>{subtitle}</p>
    </div>
  );
}

function Alert({ message }) {
  return (
    <div style={{ ...cardStyle, borderColor: "rgba(185,74,72,.35)", color: CRM_COLORS.danger, padding: 14, marginBottom: 18 }}>
      {message}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div style={{ borderBottom: "1px solid #f1eadc", padding: "10px 0" }}>
      <div style={{ color: CRM_COLORS.muted, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ marginTop: 4 }}>{value || "-"}</div>
    </div>
  );
}
