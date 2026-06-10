import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import {
  ACTIVITY_TYPES,
  CRM_COLORS,
  LEAD_STAGE_AR,
  LEAD_STAGE_COLORS,
  LEAD_STAGES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  buttonStyle,
  cardStyle,
  formatDate,
  inputStyle,
  outlineButtonStyle,
  pageStyle,
  statusColors,
} from "../components/crmUi";

const emptyClient = { full_name: "", phone: "", email: "", pipeline_stage: "New Lead" };

function printClientSummary(client, requests, invoices) {
  const totalInvoiced = invoices.reduce((s, i) => s + Number(i.amount || 0), 0);
  const totalPaid     = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + Number(i.amount || 0), 0);
  const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"/>
  <title>ملف العميل — ${client.full_name}</title>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;direction:rtl;padding:32px 40px}.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #c9a84c;padding-bottom:20px;margin-bottom:28px}.logo{font-size:22px;font-weight:900;color:#c9a84c;letter-spacing:2px}.date{color:#888;font-size:12px;margin-top:6px}h2{color:#c9a84c;font-size:14px;letter-spacing:2px;text-transform:uppercase;margin:24px 0 12px}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#f5f0e8;padding:10px;text-align:right;font-weight:600;border:1px solid #e8dcc8}td{padding:10px;border:1px solid #e8dcc8}.badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;background:#f5f0e8;color:#a8842f}.total{background:#f5f0e8;font-weight:900}@media print{body{padding:20px}}</style></head>
  <body>
  <div class="header"><div><div class="logo">ALKOWN GLOBAL</div><div class="date">تاريخ الطباعة: ${new Date().toLocaleDateString("ar")}</div></div><div style="text-align:left"><div style="font-size:18px;font-weight:800">${client.full_name}</div><div style="color:#888;font-size:13px;margin-top:4px">${client.phone || ""}${client.email ? " · " + client.email : ""}</div></div></div>
  <h2>معلومات العميل</h2>
  <table><tr><th>الاسم</th><td>${client.full_name}</td><th>الهاتف</th><td>${client.phone || "—"}</td></tr><tr><th>البريد</th><td colspan="3">${client.email || "—"}</td></tr><tr><th>مرحلة Pipeline</th><td colspan="3">${LEAD_STAGE_AR[client.pipeline_stage] || client.pipeline_stage || "—"}</td></tr></table>
  <h2>الطلبات (${requests.length})</h2>
  ${requests.length ? `<table><tr><th>رقم الطلب</th><th>الخدمة</th><th>الحالة</th><th>التاريخ</th></tr>${requests.map(r=>`<tr><td style="font-weight:700;color:#a8842f">${r.request_number}</td><td>${r.services?.name||"—"}</td><td><span class="badge">${r.status}</span></td><td>${new Date(r.created_at).toLocaleDateString("ar")}</td></tr>`).join("")}</table>` : "<p style='color:#888;font-size:13px'>لا توجد طلبات.</p>"}
  <h2>الفواتير (${invoices.length})</h2>
  ${invoices.length ? `<table><tr><th>رقم الفاتورة</th><th>المبلغ</th><th>الحالة</th><th>التاريخ</th></tr>${invoices.map(i=>`<tr><td style="font-weight:700;color:#a8842f">${i.invoice_number||"—"}</td><td>$${Number(i.amount).toLocaleString()}</td><td><span class="badge">${i.status}</span></td><td>${new Date(i.created_at).toLocaleDateString("ar")}</td></tr>`).join("")}<tr class="total"><td colspan="2">الإجمالي: $${totalInvoiced.toLocaleString()}</td><td colspan="2">المدفوع: $${totalPaid.toLocaleString()} · المتبقي: $${(totalInvoiced-totalPaid).toLocaleString()}</td></tr></table>` : "<p style='color:#888;font-size:13px'>لا توجد فواتير.</p>"}
  <script>window.onload=function(){window.print()}</script></body></html>`;
  const w = window.open("", "_blank", "width=900,height=700");
  w.document.write(html);
  w.document.close();
}
const emptyTask = { title: "", description: "", due_date: "", assigned_to: "", status: "pending", priority: "medium" };
const emptyActivity = { type: "call", description: "" };

// ── Pipeline Summary Bar ──────────────────────────────────────────────────────

function PipelineSummary({ clients, onFilter, activeStage }) {
  const counts = useMemo(() => {
    const c = {};
    LEAD_STAGES.forEach(s => { c[s] = 0; });
    clients.forEach(cl => { const s = cl.pipeline_stage || "New Lead"; c[s] = (c[s] || 0) + 1; });
    return c;
  }, [clients]);

  return (
    <div style={{ ...cardStyle, padding: "16px 22px", marginBottom: 22 }}>
      <div style={{ fontSize: 11, color: CRM_COLORS.muted, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 12 }}>
        Pipeline — العملاء المحتملون
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {LEAD_STAGES.map(stage => {
          const isActive = activeStage === stage;
          const color = LEAD_STAGE_COLORS[stage];
          return (
            <button
              key={stage}
              onClick={() => onFilter(isActive ? null : stage)}
              style={{
                border: `1.5px solid ${isActive ? color : `${color}44`}`,
                background: isActive ? `${color}18` : "transparent",
                borderRadius: 20, padding: "5px 14px",
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 6,
                transition: "all .18s",
              }}
            >
              <span style={{ fontWeight: 900, fontSize: 16, color, lineHeight: 1 }}>{counts[stage]}</span>
              <span style={{ fontSize: 12, color: isActive ? color : CRM_COLORS.muted, fontWeight: isActive ? 700 : 400 }}>
                {LEAD_STAGE_AR[stage]}
              </span>
            </button>
          );
        })}
        {activeStage && (
          <button onClick={() => onFilter(null)} style={{ ...outlineButtonStyle, padding: "5px 12px", fontSize: 12 }}>
            ✕ إلغاء الفلتر
          </button>
        )}
      </div>
    </div>
  );
}

// ── Activity Log ──────────────────────────────────────────────────────────────

function ActivityLog({ clientId, user }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyActivity);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [clientId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("client_activities")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });
    setActivities(data || []);
    setLoading(false);
  }

  async function addActivity(e) {
    e.preventDefault();
    if (!form.description.trim()) return;
    setSaving(true);
    await supabase.from("client_activities").insert([{
      client_id: clientId,
      type: form.type,
      description: form.description.trim(),
      created_by: user?.id || null,
      created_by_email: user?.email || null,
    }]);
    setSaving(false);
    setForm(emptyActivity);
    await load();
  }

  async function deleteActivity(id) {
    await supabase.from("client_activities").delete().eq("id", id);
    await load();
  }

  const typeInfo = (v) => ACTIVITY_TYPES.find(t => t.value === v) || ACTIVITY_TYPES[0];

  return (
    <div>
      <form onSubmit={addActivity} style={{ display: "grid", gap: 10, marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10 }}>
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inputStyle}>
            {ACTIVITY_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
            ))}
          </select>
          <input
            placeholder="وصف النشاط..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            style={inputStyle}
          />
        </div>
        <button type="submit" style={{ ...buttonStyle, justifySelf: "start", padding: "9px 20px", fontSize: 13 }} disabled={saving || !form.description.trim()}>
          {saving ? "جارٍ الحفظ..." : "+ إضافة نشاط"}
        </button>
      </form>

      {loading ? (
        <p style={{ color: CRM_COLORS.muted, fontSize: 13 }}>جارٍ التحميل...</p>
      ) : activities.length === 0 ? (
        <p style={{ color: CRM_COLORS.muted, fontSize: 13 }}>لا يوجد سجل نشاط بعد.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {activities.map(act => {
            const info = typeInfo(act.type);
            return (
              <div key={act.id} style={{
                display: "flex", gap: 12, alignItems: "flex-start",
                background: CRM_COLORS.beige, borderRadius: 8, padding: "10px 14px",
              }}>
                <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{info.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: CRM_COLORS.goldDark, textTransform: "uppercase", letterSpacing: ".08em" }}>
                        {info.label}
                      </span>
                      <p style={{ margin: "4px 0 0", fontSize: 14, lineHeight: 1.5 }}>{act.description}</p>
                    </div>
                    <button onClick={() => deleteActivity(act.id)} style={{ background: "transparent", border: "none", color: CRM_COLORS.danger, cursor: "pointer", fontSize: 12, flexShrink: 0 }}>
                      حذف
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: CRM_COLORS.muted, marginTop: 5 }}>
                    {act.created_by_email || "النظام"} · {formatDate(act.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

function Tasks({ clientId, user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyTask);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [clientId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("client_tasks")
      .select("*")
      .eq("client_id", clientId)
      .order("due_date", { ascending: true, nullsFirst: false });
    setTasks(data || []);
    setLoading(false);
  }

  async function saveTask(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = {
      client_id: clientId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      due_date: form.due_date || null,
      assigned_to: form.assigned_to.trim() || null,
      status: form.status,
      priority: form.priority,
      created_by: user?.id || null,
      created_by_email: user?.email || null,
    };
    if (editing) {
      await supabase.from("client_tasks").update(payload).eq("id", editing);
      setEditing(null);
    } else {
      await supabase.from("client_tasks").insert([payload]);
    }
    setSaving(false);
    setForm(emptyTask);
    await load();
  }

  async function toggleStatus(task) {
    const next = task.status === "completed" ? "pending" : "completed";
    await supabase.from("client_tasks").update({ status: next }).eq("id", task.id);
    await load();
  }

  async function deleteTask(id) {
    await supabase.from("client_tasks").delete().eq("id", id);
    await load();
  }

  function editTask(task) {
    setEditing(task.id);
    setForm({
      title: task.title || "",
      description: task.description || "",
      due_date: task.due_date || "",
      assigned_to: task.assigned_to || "",
      status: task.status || "pending",
      priority: task.priority || "medium",
    });
  }

  const priorityInfo = (v) => TASK_PRIORITIES.find(p => p.value === v);
  const statusInfo = (v) => TASK_STATUSES.find(s => s.value === v);

  const isOverdue = (task) =>
    task.due_date && task.status !== "completed" && task.status !== "cancelled" &&
    new Date(task.due_date) < new Date();

  return (
    <div>
      <form onSubmit={saveTask} style={{ display: "grid", gap: 10, marginBottom: 18, background: CRM_COLORS.beige, padding: 14, borderRadius: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: CRM_COLORS.goldDark, marginBottom: 2 }}>
          {editing ? "تعديل المهمة" : "مهمة جديدة"}
        </div>
        <input placeholder="عنوان المهمة *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={inputStyle}>
            {TASK_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inputStyle}>
            {TASK_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} style={inputStyle} />
          <input placeholder="مسؤول (بريد إلكتروني)" value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} style={inputStyle} />
        </div>
        <textarea placeholder="وصف (اختياري)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" style={{ ...buttonStyle, padding: "9px 20px", fontSize: 13 }} disabled={saving || !form.title.trim()}>
            {saving ? "جارٍ الحفظ..." : editing ? "حفظ التعديل" : "+ إضافة مهمة"}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setForm(emptyTask); }} style={{ ...outlineButtonStyle, padding: "9px 14px", fontSize: 13 }}>
              إلغاء
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p style={{ color: CRM_COLORS.muted, fontSize: 13 }}>جارٍ التحميل...</p>
      ) : tasks.length === 0 ? (
        <p style={{ color: CRM_COLORS.muted, fontSize: 13 }}>لا توجد مهام بعد.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {tasks.map(task => {
            const pInfo = priorityInfo(task.priority);
            const sInfo = statusInfo(task.status);
            const overdue = isOverdue(task);
            const done = task.status === "completed";
            return (
              <div key={task.id} style={{
                border: `1px solid ${overdue ? CRM_COLORS.danger : CRM_COLORS.border}`,
                borderRadius: 8, padding: "12px 14px",
                background: done ? "#f7f7f7" : "#fff",
                opacity: done ? .75 : 1,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flex: 1 }}>
                    <button
                      onClick={() => toggleStatus(task)}
                      style={{
                        width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                        border: `2px solid ${sInfo?.color || CRM_COLORS.gold}`,
                        background: done ? sInfo?.color : "transparent",
                        cursor: "pointer", padding: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 10, fontWeight: 800,
                      }}
                    >
                      {done ? "✓" : ""}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, textDecoration: done ? "line-through" : "none", color: done ? CRM_COLORS.muted : CRM_COLORS.text }}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div style={{ fontSize: 12, color: CRM_COLORS.muted, marginTop: 2 }}>{task.description}</div>
                      )}
                      <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                        {pInfo && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: pInfo.color, background: `${pInfo.color}18`, padding: "1px 8px", borderRadius: 10 }}>
                            {pInfo.label}
                          </span>
                        )}
                        {sInfo && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: sInfo.color, background: `${sInfo.color}18`, padding: "1px 8px", borderRadius: 10 }}>
                            {sInfo.label}
                          </span>
                        )}
                        {task.due_date && (
                          <span style={{ fontSize: 11, color: overdue ? CRM_COLORS.danger : CRM_COLORS.muted, fontWeight: overdue ? 700 : 400 }}>
                            {overdue ? "⚠ متأخر · " : "📅 "}{task.due_date}
                          </span>
                        )}
                        {task.assigned_to && (
                          <span style={{ fontSize: 11, color: CRM_COLORS.muted }}>👤 {task.assigned_to}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => editTask(task)} style={{ background: "transparent", border: "none", color: CRM_COLORS.goldDark, cursor: "pointer", fontSize: 12 }}>تعديل</button>
                    <button onClick={() => deleteTask(task.id)} style={{ background: "transparent", border: "none", color: CRM_COLORS.danger, cursor: "pointer", fontSize: 12 }}>حذف</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function Clients() {
  const { user } = useAuth();
  const [clients, setClients]         = useState([]);
  const [requests, setRequests]       = useState([]);
  const [invoices, setInvoices]       = useState([]);
  const [notes, setNotes]             = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [form, setForm]               = useState(emptyClient);
  const [noteText, setNoteText]       = useState("");
  const [search, setSearch]           = useState("");
  const [pipelineFilter, setPipelineFilter] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [savingNote, setSavingNote]   = useState(false);
  const [error, setError]             = useState("");
  const [activeTab, setActiveTab]     = useState("requests");

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
    return clients.filter(c => {
      const matchSearch = !term || [c.full_name, c.email, c.phone].filter(Boolean).some(v => v.toLowerCase().includes(term));
      const matchStage = !pipelineFilter || (c.pipeline_stage || "New Lead") === pipelineFilter;
      return matchSearch && matchStage;
    });
  }, [clients, search, pipelineFilter]);

  const selectedRequests = useMemo(() =>
    selectedClient ? requests.filter(r => r.client_id === selectedClient.id) : [],
  [requests, selectedClient]);

  const selectedInvoices = useMemo(() =>
    selectedClient ? invoices.filter(i => i.client_id === selectedClient.id) : [],
  [invoices, selectedClient]);

  function editClient(client) {
    setSelectedClient(client);
    setForm({
      full_name: client.full_name || "",
      phone: client.phone || "",
      email: client.email || "",
      pipeline_stage: client.pipeline_stage || "New Lead",
    });
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
    const payload = {
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      pipeline_stage: form.pipeline_stage,
    };
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

  // ── Tab config ─────────────────────────────────────────────────────────────

  const TABS = [
    { key: "requests",  label: `الطلبات (${selectedRequests.length})` },
    { key: "invoices",  label: `الفواتير (${selectedInvoices.length})` },
    { key: "notes",     label: `الملاحظات (${notes.length})` },
    { key: "activity",  label: "النشاط" },
    { key: "tasks",     label: "المهام" },
  ];

  return (
    <div style={pageStyle}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ color: CRM_COLORS.goldDark, letterSpacing: ".22em", textTransform: "uppercase", fontSize: 11 }}>Alkown Global CRM</div>
        <h1 style={{ margin: "6px 0", fontSize: 32 }}>العملاء</h1>
        <p style={{ color: CRM_COLORS.muted, margin: 0 }}>إدارة سجلات العملاء والـ Pipeline والنشاط والمهام.</p>
      </div>

      {error && (
        <div style={{ ...cardStyle, borderColor: "rgba(185,74,72,.35)", color: CRM_COLORS.danger, padding: 14, marginBottom: 18 }}>
          {error}
        </div>
      )}

      {/* Pipeline Summary */}
      <PipelineSummary clients={clients} onFilter={setPipelineFilter} activeStage={pipelineFilter} />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(360px,.8fr)", gap: 22 }}>

        {/* ── Left: Clients Table ── */}
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

          {loading ? (
            <p style={{ color: CRM_COLORS.muted }}>جارٍ التحميل...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table width="100%" cellPadding="12" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "right", color: CRM_COLORS.muted, borderBottom: `1px solid ${CRM_COLORS.border}`, fontSize: 12, textTransform: "uppercase" }}>
                    <th>الاسم</th>
                    <th>الهاتف</th>
                    <th>المرحلة</th>
                    <th>الطلبات</th>
                    <th>التاريخ</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map(client => {
                    const stage = client.pipeline_stage || "New Lead";
                    const stageColor = LEAD_STAGE_COLORS[stage] || CRM_COLORS.gold;
                    return (
                      <tr key={client.id} style={{
                        borderBottom: `1px solid ${CRM_COLORS.border}`,
                        background: selectedClient?.id === client.id ? `${CRM_COLORS.gold}08` : "transparent",
                      }}>
                        <td>
                          <button onClick={() => editClient(client)} style={{ border: 0, background: "transparent", color: CRM_COLORS.goldDark, fontWeight: 800, cursor: "pointer", fontSize: 14 }}>
                            {client.full_name || "بدون اسم"}
                          </button>
                          {client.email && <div style={{ color: CRM_COLORS.muted, fontSize: 11 }}>{client.email}</div>}
                        </td>
                        <td style={{ color: CRM_COLORS.text, fontSize: 13 }}>{client.phone || "-"}</td>
                        <td>
                          <span style={{
                            background: `${stageColor}18`, color: stageColor,
                            padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
                          }}>
                            {LEAD_STAGE_AR[stage] || stage}
                          </span>
                        </td>
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
                    );
                  })}
                  {!filteredClients.length && (
                    <tr>
                      <td colSpan="6" style={{ color: CRM_COLORS.muted, textAlign: "center", padding: 32 }}>
                        {pipelineFilter ? `لا يوجد عملاء في مرحلة "${LEAD_STAGE_AR[pipelineFilter]}".` : "لا يوجد عملاء."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Right: Sidebar ── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Form */}
          <section style={{ ...cardStyle, padding: 22 }}>
            <h2 style={{ marginTop: 0, fontSize: 17 }}>{selectedClient ? "تعديل العميل" : "إضافة عميل"}</h2>
            <form onSubmit={saveClient} style={{ display: "grid", gap: 12 }}>
              <input
                placeholder="الاسم الكامل *"
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                style={inputStyle}
              />
              <input
                placeholder="رقم الهاتف *"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                style={inputStyle}
              />
              <input
                placeholder="البريد الإلكتروني"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={inputStyle}
              />
              <select value={form.pipeline_stage} onChange={e => setForm(f => ({ ...f, pipeline_stage: e.target.value }))} style={inputStyle}>
                {LEAD_STAGES.map(s => (
                  <option key={s} value={s}>{LEAD_STAGE_AR[s]}</option>
                ))}
              </select>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={buttonStyle} disabled={saving}>
                  {saving ? "جارٍ الحفظ..." : selectedClient ? "حفظ التعديلات" : "إضافة العميل"}
                </button>
                {selectedClient && (
                  <button type="button" style={outlineButtonStyle} onClick={resetForm}>جديد</button>
                )}
              </div>
            </form>
          </section>

          {/* Client 360 Panel */}
          {selectedClient && (
            <section style={{ ...cardStyle, overflow: "hidden" }}>
              {/* Client header */}
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${CRM_COLORS.border}`, background: `${CRM_COLORS.gold}08` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{selectedClient.full_name}</div>
                  <button
                    onClick={() => printClientSummary(selectedClient, selectedRequests, selectedInvoices)}
                    title="طباعة / PDF"
                    style={{ ...outlineButtonStyle, padding: "5px 10px", fontSize: 12, flexShrink: 0 }}
                  >🖨️ PDF</button>
                </div>
                <div style={{ color: CRM_COLORS.muted, fontSize: 13, marginTop: 2 }}>
                  {selectedClient.phone}{selectedClient.email ? ` · ${selectedClient.email}` : ""}
                </div>
                {/* Stage badge */}
                {(() => {
                  const stage = selectedClient.pipeline_stage || "New Lead";
                  const color = LEAD_STAGE_COLORS[stage];
                  return (
                    <span style={{ display: "inline-block", marginTop: 8, background: `${color}18`, color, padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                      {LEAD_STAGE_AR[stage] || stage}
                    </span>
                  );
                })()}
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: `1px solid ${CRM_COLORS.border}`, overflowX: "auto" }}>
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      flex: "0 0 auto", border: "none", background: "transparent",
                      padding: "11px 14px", fontSize: 12,
                      fontWeight: activeTab === tab.key ? 800 : 400,
                      color: activeTab === tab.key ? CRM_COLORS.goldDark : CRM_COLORS.muted,
                      borderBottom: activeTab === tab.key ? `2px solid ${CRM_COLORS.gold}` : "2px solid transparent",
                      cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ padding: 18 }}>

                {/* Tab: Requests */}
                {activeTab === "requests" && (
                  selectedRequests.length === 0 ? (
                    <p style={{ color: CRM_COLORS.muted, fontSize: 13 }}>لا توجد طلبات.</p>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {selectedRequests.map(r => (
                        <div key={r.id} style={{ borderRight: `3px solid ${statusColors[r.status] || CRM_COLORS.gold}`, paddingRight: 12, paddingTop: 4, paddingBottom: 4 }}>
                          <div style={{ fontWeight: 700, color: CRM_COLORS.goldDark, fontSize: 13 }}>{r.request_number}</div>
                          <div style={{ fontSize: 13, color: CRM_COLORS.text }}>{r.services?.name || "—"}</div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                            <span style={{ color: statusColors[r.status], fontSize: 12, fontWeight: 700 }}>{r.status}</span>
                            <span style={{ color: CRM_COLORS.muted, fontSize: 11 }}>{formatDate(r.created_at).split(",")[0]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* Tab: Invoices */}
                {activeTab === "invoices" && (
                  selectedInvoices.length === 0 ? (
                    <p style={{ color: CRM_COLORS.muted, fontSize: 13 }}>لا توجد فواتير.</p>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {selectedInvoices.map(inv => (
                        <div key={inv.id} style={{ border: `1px solid ${CRM_COLORS.border}`, borderRadius: 8, padding: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: 700, color: CRM_COLORS.goldDark, fontSize: 13 }}>{inv.invoice_number || inv.id?.slice(0, 8)}</span>
                            <span style={{ color: inv.status === "Paid" ? CRM_COLORS.success : "#c28a25", fontSize: 12, fontWeight: 700 }}>{inv.status}</span>
                          </div>
                          <div style={{ marginTop: 4, fontWeight: 800, fontSize: 15 }}>${Number(inv.amount || 0).toLocaleString()}</div>
                          <div style={{ color: CRM_COLORS.muted, fontSize: 11, marginTop: 2 }}>{formatDate(inv.created_at).split(",")[0]}</div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* Tab: Notes */}
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
                      <button type="submit" style={{ ...buttonStyle, justifySelf: "start", padding: "9px 20px", fontSize: 13 }} disabled={savingNote || !noteText.trim()}>
                        {savingNote ? "جارٍ الحفظ..." : "إضافة ملاحظة"}
                      </button>
                    </form>
                    {notes.length === 0 ? (
                      <p style={{ color: CRM_COLORS.muted, fontSize: 13 }}>لا توجد ملاحظات.</p>
                    ) : (
                      <div style={{ display: "grid", gap: 10 }}>
                        {notes.map(n => (
                          <div key={n.id} style={{ background: CRM_COLORS.beige, border: `1px solid ${CRM_COLORS.border}`, borderRadius: 8, padding: 12 }}>
                            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{n.note}</p>
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

                {/* Tab: Activity Log */}
                {activeTab === "activity" && (
                  <ActivityLog clientId={selectedClient.id} user={user} />
                )}

                {/* Tab: Tasks */}
                {activeTab === "tasks" && (
                  <Tasks clientId={selectedClient.id} user={user} />
                )}

              </div>
            </section>
          )}

          {!selectedClient && (
            <section style={{ ...cardStyle, padding: 22 }}>
              <p style={{ color: CRM_COLORS.muted, margin: 0, fontSize: 14 }}>اختر عميلاً لعرض الـ 360° View.</p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
