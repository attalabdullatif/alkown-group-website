import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  CRM_COLORS,
  REQUEST_STATUSES,
  buttonStyle,
  cardStyle,
  formatDate,
  inputStyle,
  makeRequestNumber,
  outlineButtonStyle,
  pageStyle,
  statusColors,
} from "../components/crmUi";

const emptyRequest = {
  client_id: "",
  service_id: "",
  status: "New",
  notes: "",
};

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [form, setForm] = useState(emptyRequest);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    const [clientsResult, servicesResult, requestsResult] = await Promise.all([
      supabase.from("clients").select("*").order("full_name"),
      supabase.from("services").select("*").order("name"),
      supabase
        .from("requests")
        .select("*, clients(full_name, phone, email), services(name, price)")
        .order("created_at", { ascending: false }),
    ]);

    if (clientsResult.error) setError(clientsResult.error.message);
    if (servicesResult.error) setError(servicesResult.error.message);
    if (requestsResult.error) setError(requestsResult.error.message);

    setClients(clientsResult.data || []);
    setServices(servicesResult.data || []);
    setRequests(requestsResult.data || []);
    setLoading(false);
  }

  const filteredRequests = useMemo(() => {
    const term = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus = statusFilter === "All" || request.status === statusFilter;
      const matchesSearch =
        !term ||
        [
          request.request_number,
          request.status,
          request.notes,
          request.clients?.full_name,
          request.clients?.email,
          request.clients?.phone,
          request.services?.name,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));

      return matchesStatus && matchesSearch;
    });
  }, [requests, search, statusFilter]);

  function editRequest(request) {
    setSelectedRequest(request);
    setForm({
      client_id: request.client_id || "",
      service_id: request.service_id || "",
      status: request.status || "New",
      notes: request.notes || "",
    });
  }

  function resetForm() {
    setSelectedRequest(null);
    setForm(emptyRequest);
  }

  async function saveRequest(event) {
    event.preventDefault();

    if (!form.client_id || !form.status) {
      setError("Client and status are required.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      client_id: form.client_id,
      service_id: form.service_id || null,
      status: form.status,
      notes: form.notes,
    };

    const result = selectedRequest
      ? await supabase.from("requests").update(payload).eq("id", selectedRequest.id)
      : await supabase.from("requests").insert([{ ...payload, request_number: makeRequestNumber() }]);

    setSaving(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    resetForm();
    await loadData();
  }

  async function deleteRequest(request) {
    const confirmed = window.confirm(`Delete request ${request.request_number}?`);
    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("requests")
      .delete()
      .eq("id", request.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (selectedRequest?.id === request.id) resetForm();
    await loadData();
  }

  return (
    <div style={pageStyle}>
      <Header
        title="Requests"
        subtitle="Create, filter, update, and track client service requests."
      />

      {error && <Alert message={error} />}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.45fr) minmax(330px,.75fr)", gap: 22 }}>
        <section style={{ ...cardStyle, padding: 22 }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(220px,1fr) 220px auto", gap: 12, marginBottom: 18 }}>
            <input
              placeholder="Search request, client, phone, or notes"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={inputStyle}
            />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={inputStyle}>
              <option value="All">All statuses</option>
              {REQUEST_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <button style={outlineButtonStyle} onClick={loadData}>
              Refresh
            </button>
          </div>

          {loading ? (
            <p style={{ color: CRM_COLORS.muted }}>Loading requests...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table width="100%" cellPadding="13" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", color: CRM_COLORS.muted, borderBottom: `1px solid ${CRM_COLORS.border}` }}>
                    <th>Request</th>
                    <th>Client</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} style={{ borderBottom: "1px solid #f1eadc" }}>
                      <td>
                        <button
                          onClick={() => editRequest(request)}
                          style={{ border: 0, background: "transparent", color: CRM_COLORS.goldDark, fontWeight: 800, cursor: "pointer" }}
                        >
                          {request.request_number}
                        </button>
                      </td>
                      <td>{request.clients?.full_name || request.client_id || "-"}</td>
                      <td>{request.services?.name || "-"}</td>
                      <td>
                        <span style={{ color: statusColors[request.status] || CRM_COLORS.text, fontWeight: 800 }}>
                          {request.status}
                        </span>
                      </td>
                      <td>{formatDate(request.created_at)}</td>
                      <td>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button style={outlineButtonStyle} onClick={() => editRequest(request)}>
                            Details
                          </button>
                          <button style={{ ...outlineButtonStyle, color: CRM_COLORS.danger }} onClick={() => deleteRequest(request)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!filteredRequests.length && (
                    <tr>
                      <td colSpan="6" style={{ color: CRM_COLORS.muted, textAlign: "center", padding: 28 }}>
                        No requests found.
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
            <h2 style={{ marginTop: 0 }}>{selectedRequest ? "Edit Request" : "Create Request"}</h2>
            <form onSubmit={saveRequest} style={{ display: "grid", gap: 12 }}>
              <select value={form.client_id} onChange={(event) => setForm((current) => ({ ...current, client_id: event.target.value }))} style={inputStyle}>
                <option value="">Select client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.full_name}</option>
                ))}
              </select>
              <select value={form.service_id} onChange={(event) => setForm((current) => ({ ...current, service_id: event.target.value }))} style={inputStyle}>
                <option value="">No service selected</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
              <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} style={inputStyle}>
                {REQUEST_STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <textarea
                placeholder="Notes"
                rows={5}
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                style={{ ...inputStyle, resize: "vertical" }}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={buttonStyle} disabled={saving}>
                  {saving ? "Saving..." : selectedRequest ? "Save Changes" : "Create Request"}
                </button>
                {selectedRequest && (
                  <button type="button" style={outlineButtonStyle} onClick={resetForm}>
                    New
                  </button>
                )}
              </div>
            </form>
          </section>

          <section style={{ ...cardStyle, padding: 22 }}>
            <h2 style={{ marginTop: 0 }}>Request Details</h2>
            {selectedRequest ? (
              <>
                <Detail label="Request Number" value={selectedRequest.request_number} />
                <Detail label="Client" value={selectedRequest.clients?.full_name || selectedRequest.client_id} />
                <Detail label="Client Email" value={selectedRequest.clients?.email} />
                <Detail label="Client Phone" value={selectedRequest.clients?.phone} />
                <Detail label="Service" value={selectedRequest.services?.name} />
                <Detail label="Status" value={selectedRequest.status} />
                <Detail label="Created" value={formatDate(selectedRequest.created_at)} />
                <Detail label="Notes" value={selectedRequest.notes} pre />
              </>
            ) : (
              <p style={{ color: CRM_COLORS.muted }}>Select a request to view details.</p>
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

function Detail({ label, value, pre = false }) {
  return (
    <div style={{ borderBottom: "1px solid #f1eadc", padding: "10px 0" }}>
      <div style={{ color: CRM_COLORS.muted, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ marginTop: 4, whiteSpace: pre ? "pre-wrap" : "normal" }}>{value || "-"}</div>
    </div>
  );
}
