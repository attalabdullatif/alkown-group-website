import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import {
  CRM_COLORS, buttonStyle, cardStyle, formatDate,
  inputStyle, outlineButtonStyle, pageStyle, statusColors,
} from "../components/crmUi";

const emptyClient = { full_name: "", phone: "", email: "" };

export default function Clients() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [requests, setRequests] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [form, setForm] = useState(emptyClient);
  const [noteText, setNoteText] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("requests");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    const [clientsRes, requestsRes, invoicesRes] = await Promise.all([
      supabase.from("clients").select("*").order("created_at", { ascending: false }),
      supabase.from("requests").select("id, request_number, client_id, status, created_at, services(name)").order("created_at", { ascending: false }),
      supabase.from("invoices").select("id, invoice_number, client_id, request_id, amount, status, created_at").order("created_at", { ascending: false }),
    ]);
    if (clientsRes.error) setError(clientsRes.error.message);
    setClients(clientsRes.data || []);
    setRequests(requestsRes.data || []);
    setInvoices(invoicesRes.data || []);
    setLoading(false);
  }

  async function loadNotes(clientId) {
    const { data } = await supabase
      .from("client_notes")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });
    setNotes(data || []);
  }

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter(c =>
      [c.full_name, c.email, c.phone].filter(Boolean).some(v => v.toLowerCase().includes(term))
    );
  }, [clients, search]);

  const selectedRequests = useMemo(() => {
    if (!selectedClient) return [];
    return requests.filter(r => r.client_id === selectedClient.id);
  }, [requests, selectedClient]);

  const selectedInvoices = useMemo(() => {
    if (!selectedClient) return [];
    return invoices.filter(i => i.client_id === selectedClient.id);
  }, [invoices, selectedClient]);

  function editClient(client) {
    setSelectedClient(client);
    setForm({ full_name: client.full_name || "", phone: client.phone || "", email: client.email || "" });
    loadNotes(client.id);
    setActiveTab("requests");
  }

  function resetForm() {
    setSelectedClient(null);
    setForm(emptyClient);
    setNotes([]);
    setNoteText("");
  }

  async function saveClient(e) {
    e.preventDefault();
    if (!form.full_name.trim() || !form.phone.trim()) { setError("الاسم والهاتف مطلوبان."); return; }
    setSaving(true);
    setError("");
    const payload = { full_name: form.full_name.trim(), phone: form.phone.trim(), email: form.email.trim() };
    const result = selectedClient
      ? await supabase.from("clients").update(payload).eq("id", selectedClient.id)
      : await supabase.from("clients").insert([payload]);
    setSaving(false);
    if (result.error) { setError(result.error.message); return; }
    resetForm();
    await loadData();
  }

  async function deleteClient(client) {
    if (!window.confirm(`حذف العميل "${client.full_name}"؟`)) return;
    const { error: err } = await supabase.from("clients").delete().eq("id", client.id);
    if (err) { setError(err.message); return; }
    if (selectedClient?.id === client.id) resetForm();
    await loadData();
  }

  async function addNote(e) {
    e.preventDefault();
    if (!noteText.trim() || !selectedClient) return;
    setSavingNote(true);
    const { error: err } = await supabase.from("client_notes").insert([{
      client_id: selectedClient.id,
      note: noteText.trim(),
      created_by: user?.email || "admin",
    }]);
    setSavingNote(false);
    if (err) { setError(err.message); return; }
    setNoteText("");
    await loadNotes(selectedClient.id);
  }

  async function deleteNote(noteId) {
    await supabase.from("client_notes").delete().eq("id", noteId);
    await loadNotes(selectedClient.id);
  }

  const tabBtn = (key, label) => (
    <button
      onClick={() => setActiveTab(key)}
      style={{
        background: "transparent", border: "none", borderBottom: `2px solid ${activeTab === key ? CRM_COLORS.gold : "transparent"}`,
        color: activeTab === key ? CRM_COLORS.gold : CRM_COLORS.muted, padding: "8px 16px",
        cursor: "pointer", fontWeight: activeTab === key ? 700 : 400, fontSize: 14, marginBottom: -1,
      }}
    >{label}</button>
  );

  return (
    <div style={pageStyle}>
      <Header />
      {error && <Alert message={error} />}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(340px,.8fr)", gap: 22 }}>

        {/* جدول العملاء */}
        <section style={{ ...cardStyle, padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
            <input
              placeholder="بحث بالاسم أو البريد أو الهاتف"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, maxWidth: 380 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button style={outlineButtonStyle} onClick={loadData}>تحديث</button>
              <button style={buttonStyle} onClick={resetForm}>+ عميل جديد</button>
            </div>
          </div>

          {loading ? <p style={{ color: CRM_COLORS.muted }}>جارٍ التحميل...</p> : (
            <div style={{ overflowX: "auto" }}>
              <table width="100%" cellPadding="12" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "right", color: CRM_COLORS.muted, borderBottom: `1px solid ${CRM_COLORS.border}`, fontSize: 12, textTransform: "uppercase" }}>
                    <th>الاسم</th><th>الهاتف</th><th>البريد</th><th>الطلبات</th><th>التاريخ</th><th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map(client => (
                    <tr key={client.id} style={{ borderBottom: `1px solid ${CRM_COLORS.border}`, background: selectedClient?.id === client.id ? `${CRM_COLORS.gold}08` : "transparent" }}>
                      <td>
                        <button onClick={() => editClient(client)} style={{ border: 0, background: "transparent", color: CRM_COLORS.goldDark, fontWeight: 800, cursor: "pointer", fontSize: 14 }}>
                          {client.full_name || "بدون اسم"}
                        </button>
                      </td>
                      <td style={{ color: CRM_COLORS.text, fontSize: 13 }}>{client.phone || "-"}</td>
                      <td style={{ color: CRM_COLORS.muted, fontSize: 13 }}>{client.email || "-"}</td>
                      <td>
                        <span style={{ background: `${CRM_COLORS.gold}18`, color: CRM_COLORS.goldDark, padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                          {requests.filter(r => r.client_id === client.id).length}
                        </span>
                      </td>
                      <td style={{ color: CRM_COLORS.muted, fontSize: 12 }}>{formatDate(client.created_at).split(",")[0]}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={outlineButtonStyle} onClick={() => editClient(client)}>تعديل</button>
                          <button style={{ ...outlineButtonStyle, color: CRM_COLORS.danger }} onClick={() => deleteClient(client)}>حذف</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filteredClients.length && (
                    <tr><td colSpan="6" style={{ color: CRM_COLORS.muted, textAlign: "center", padding: 32 }}>لا يوجد عملاء.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* الجانب الأيمن */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* فورم إضافة/تعديل */}
          <section style={{ ...cardStyle, padding: 22 }}>
            <h2 style={{ marginTop: 0, fontSize: 17 }}>{selectedClient ? "تعديل العميل" : "إضافة عميل"}</h2>
            <form onSubmit={saveClient} style={{ display: "grid", gap: 12 }}>
              <input placeholder="الاسم الكامل" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} style={inputStyle} />
              <input placeholder="رقم الهاتف" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} />
              <input placeholder="البريد الإلكتروني" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={buttonStyle} disabled={saving}>
                  {saving ? "جارٍ الحفظ..." : selectedClient ? "حفظ التعديلات" : "إضافة العميل"}
                </button>
                {selectedClient && <button type="button" style={outlineButtonStyle} onClick={resetForm}>جديد</button>}
              </div>
            </form>
          </section>

          {/* بيانات العميل المحدد */}
          {selectedClient && (
            <section style={{ ...cardStyle, padding: 22 }}>
              <div style={{ borderBottom: `1px solid ${CRM_COLORS.border}`, marginBottom: 16, paddingBottom: 4, display: "flex", gap: 0 }}>
                {tabBtn("requests", `الطلبات (${selectedRequests.length})`)}
                {tabBtn("invoices", `الفواتير (${selectedInvoices.length})`)}
                {tabBtn("notes", `الملاحظات (${notes.length})`)}
              </div>

              {/* تاب الطلبات */}
              {activeTab === "requests" && (
                <div>
                  {selectedRequests.length === 0 ? (
                    <p style={{ color: CRM_COLORS.muted, fontSize: 13 }}>لا توجد طلبات.</p>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {selectedRequests.map(r => (
                        <div key={r.id} style={{ borderLeft: `3px solid ${statusColors[r.status] || CRM_COLORS.gold}`, paddingLeft: 12, paddingTop: 4, paddingBottom: 4 }}>
                          <div style={{ fontWeight: 700, color: CRM_COLORS.goldDark, fontSize: 13 }}>{r.request_number}</div>
                          <div style={{ fontSize: 13, color: CRM_COLORS.text }}>{r.services?.name || "—"}</div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                            <span style={{ color: statusColors[r.status], fontSize: 12, fontWeight: 700 }}>{r.status}</span>
                            <span style={{ color: CRM_COLORS.muted, fontSize: 11 }}>{formatDate(r.created_at).split(",")[0]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* تاب الفواتير */}
              {activeTab === "invoices" && (
                <div>
                  {selectedInvoices.length === 0 ? (
                    <p style={{ color: CRM_COLORS.muted, fontSize: 13 }}>لا توجد فواتير.</p>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {selectedInvoices.map(inv => (
                        <div key={inv.id} style={{ border: `1px solid ${CRM_COLORS.border}`, borderRadius: 8, padding: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: 700, color: CRM_COLORS.goldDark, fontSize: 13 }}>{inv.invoice_number || inv.id.slice(0, 8)}</span>
                            <span style={{ color: inv.status === "Paid" ? CRM_COLORS.success : "#c28a25", fontSize: 12, fontWeight: 700 }}>{inv.status}</span>
                          </div>
                          <div style={{ marginTop: 4, fontWeight: 800, fontSize: 15 }}>${Number(inv.amount).toLocaleString()}</div>
                          <div style={{ color: CRM_COLORS.muted, fontSize: 11, marginTop: 2 }}>{formatDate(inv.created_at).split(",")[0]}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* تاب الملاحظات */}
              {activeTab === "notes" && (
                <div>
                  <form onSubmit={addNote} style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                    <textarea
                      placeholder="أضف ملاحظة..."
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      rows={3}
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                    <button type="submit" style={buttonStyle} disabled={savingNote || !noteText.trim()}>
                      {savingNote ? "جارٍ الحفظ..." : "إضافة ملاحظة"}
                    </button>
                  </form>
                  {notes.length === 0 ? (
                    <p style={{ color: CRM_COLORS.muted, fontSize: 13 }}>لا توجد ملاحظات.</p>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {notes.map(n => (
                        <div key={n.id} style={{ background: CRM_COLORS.beige || "#fffdf8", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 8, padding: 12 }}>
                          <p style={{ margin: 0, color: CRM_COLORS.text, fontSize: 14, lineHeight: 1.6 }}>{n.note}</p>
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, alignItems: "center" }}>
                            <span style={{ color: CRM_COLORS.muted, fontSize: 11 }}>{n.created_by} · {formatDate(n.created_at).split(",")[0]}</span>
                            <button onClick={() => deleteNote(n.id)} style={{ background: "transparent", border: "none", color: CRM_COLORS.danger, cursor: "pointer", fontSize: 12 }}>حذف</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ color: CRM_COLORS.goldDark, letterSpacing: ".22em", textTransform: "uppercase", fontSize: 11 }}>Alkown Global CRM</div>
      <h1 style={{ margin: "6px 0", fontSize: 32 }}>العملاء</h1>
      <p style={{ color: CRM_COLORS.muted, margin: 0 }}>إدارة سجلات العملاء وبيانات التواصل وسجل النشاط.</p>
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
