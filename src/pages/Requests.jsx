import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { sendStatusNotification } from "../lib/crm";
import {
  CRM_COLORS,
  VISA_STATUSES,
  buttonStyle,
  cardStyle,
  formatDate,
  inputStyle,
  makeRequestNumber,
  outlineButtonStyle,
  normalizeStatus,
  pageStyle,
  statusColor,
  statusLabelAr,
} from "../components/crmUi";

const emptyRequest = {
  client_id: "",
  service_id: "",
  status: "Lead",
  priority: "medium",
  assigned_to_email: "",
  notes: "",
};

const PRIORITIES = [
  { key: "high",   ar: "عالية",   color: "#c0392b" },
  { key: "medium", ar: "متوسطة",  color: "#c8922a" },
  { key: "low",    ar: "منخفضة",  color: "#2d9c5a" },
];

function PriorityBadge({ priority }) {
  const p = PRIORITIES.find(x => x.key === priority);
  if (!p) return null;
  return (
    <span style={{
      padding: "1px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700,
      background: `${p.color}18`, color: p.color,
    }}>{p.ar}</span>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function statusLabel(status) {
  return statusLabelAr(status);
}

// ── Workflow Stepper ──────────────────────────────────────────────────────────

function WorkflowStepper({ currentStatus }) {
  const normalized = normalizeStatus(currentStatus);
  const currentIndex = VISA_STATUSES.indexOf(normalized);
  const isRejected = normalized === "Rejected";

  return (
    <div style={{ padding: "18px 22px", borderBottom: `1px solid ${CRM_COLORS.border}` }}>
      <div style={{ fontSize: 11, color: CRM_COLORS.muted, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 14 }}>
        مسار التأشيرة
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", overflowX: "auto", paddingBottom: 4 }}>
        {VISA_STATUSES.map((status, idx) => {
          const isDone = !isRejected && currentIndex > idx;
          const isActive = normalized === status;
          const isLast = idx === VISA_STATUSES.length - 1;

          const circleColor = isActive
            ? (isRejected ? CRM_COLORS.danger : CRM_COLORS.gold)
            : isDone
            ? CRM_COLORS.success
            : CRM_COLORS.border;

          const textColor = isActive
            ? (isRejected ? CRM_COLORS.danger : CRM_COLORS.goldDark)
            : isDone
            ? CRM_COLORS.success
            : CRM_COLORS.muted;

          return (
            <div key={status} style={{ display: "flex", alignItems: "flex-start", flex: isLast ? "0 0 auto" : 1, minWidth: 60 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                {/* Circle */}
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: isActive ? circleColor : isDone ? circleColor : "transparent",
                  border: `2px solid ${circleColor}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, color: isDone || isActive ? "#fff" : circleColor,
                  flexShrink: 0,
                  boxShadow: isActive ? `0 0 0 3px ${circleColor}28` : "none",
                }}>
                  {isDone ? "✓" : idx + 1}
                </div>
                {/* Label */}
                <div style={{
                  marginTop: 6, fontSize: 10, textAlign: "center",
                  color: textColor, fontWeight: isActive ? 800 : 500,
                  whiteSpace: "nowrap", letterSpacing: ".02em",
                }}>
                  {statusLabel(status)}
                </div>
              </div>
              {/* Connector line */}
              {!isLast && (
                <div style={{
                  height: 2, flex: 1, marginTop: 13,
                  background: isDone ? CRM_COLORS.success : CRM_COLORS.border,
                  transition: "background .3s",
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Timeline ─────────────────────────────────────────────────────────────────

function Timeline({ history, loading }) {
  if (loading) return <p style={{ color: CRM_COLORS.muted, padding: "16px 0" }}>جارٍ التحميل...</p>;
  if (!history.length) return <p style={{ color: CRM_COLORS.muted, padding: "16px 0" }}>لا يوجد سجل تغييرات بعد.</p>;

  return (
    <div style={{ position: "relative", paddingRight: 20 }}>
      {/* Vertical line */}
      <div style={{
        position: "absolute", right: 10, top: 6, bottom: 6,
        width: 2, background: CRM_COLORS.border,
      }} />
      {history.map((entry, idx) => (
        <div key={entry.id} style={{ display: "flex", gap: 14, marginBottom: 20, position: "relative" }}>
          {/* Dot */}
          <div style={{
            width: 12, height: 12, borderRadius: "50%",
            background: statusColor(entry.to_status),
            border: `2px solid #fff`,
            boxShadow: `0 0 0 2px ${statusColor(entry.to_status)}44`,
            flexShrink: 0, marginTop: 3,
            position: "relative", zIndex: 1,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Status transition */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
              {entry.from_status && (
                <>
                  <span style={{
                    background: `${statusColor(entry.from_status)}18`,
                    color: statusColor(entry.from_status),
                    padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  }}>
                    {statusLabel(entry.from_status)}
                  </span>
                  <span style={{ color: CRM_COLORS.muted, fontSize: 12 }}>←</span>
                </>
              )}
              <span style={{
                background: `${statusColor(entry.to_status)}18`,
                color: statusColor(entry.to_status),
                padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 800,
              }}>
                {statusLabel(entry.to_status)}
              </span>
            </div>
            {/* Note */}
            {entry.note && (
              <div style={{
                background: CRM_COLORS.beige, borderRadius: 6,
                padding: "8px 12px", fontSize: 13, marginBottom: 4,
                borderRight: `3px solid ${CRM_COLORS.gold}`,
              }}>
                {entry.note}
              </div>
            )}
            {/* Meta */}
            <div style={{ fontSize: 11, color: CRM_COLORS.muted }}>
              {entry.changed_by_email || "النظام"} · {formatDate(entry.created_at)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Kanban Board ──────────────────────────────────────────────────────────────
// Drag a card onto another column to move the request to that stage.

function KanbanCard({ req, onEdit }) {
  const rejected = normalizeStatus(req.status) === "Rejected";
  return (
    <div
      draggable
      onDragStart={e => e.dataTransfer.setData("requestId", req.id)}
      style={{
        background: "#fff", border: `1px solid ${CRM_COLORS.border}`,
        borderRadius: 8, padding: "10px 12px", cursor: "grab",
        boxShadow: "0 1px 4px rgba(0,0,0,.06)",
        transition: "box-shadow .15s",
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 3px 12px rgba(0,0,0,.12)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.06)"}
      onClick={() => onEdit(req)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span style={{ fontWeight: 800, color: rejected ? CRM_COLORS.danger : CRM_COLORS.goldDark, fontSize: 12 }}>
          {req.request_number}
        </span>
        <PriorityBadge priority={req.priority} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>
        {req.clients?.full_name || "—"}
      </div>
      <div style={{ fontSize: 11, color: CRM_COLORS.muted }}>{req.services?.name || "—"}</div>
      {req.tags?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
          {req.tags.map(t => (
            <span key={t} style={{ fontSize: 10, background: CRM_COLORS.beige, borderRadius: 4, padding: "1px 6px" }}>{t}</span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: CRM_COLORS.muted, marginTop: 6, gap: 6 }}>
        <span>{formatDate(req.created_at).split(",")[0]}</span>
        {req.assigned_to_email && <span title="المسؤول">👤 {req.assigned_to_email.split("@")[0]}</span>}
      </div>
    </div>
  );
}

function KanbanBoard({ requests, onEdit, onMove }) {
  const [dragOver, setDragOver] = useState(null);
  const byStatus = useMemo(() => {
    const m = {};
    VISA_STATUSES.forEach(s => { m[s] = []; });
    requests.forEach(r => {
      const s = normalizeStatus(r.status);
      (m[s] || m["Lead"]).push(r);
    });
    return m;
  }, [requests]);

  return (
    <div style={{ overflowX: "auto", paddingBottom: 8 }}>
      <div style={{ display: "flex", gap: 14, minWidth: "max-content", alignItems: "flex-start" }}>
        {VISA_STATUSES.map(status => {
          const cards = byStatus[status] || [];
          const color = statusColor(status);
          const isOver = dragOver === status;
          return (
            <div
              key={status}
              style={{ width: 220, flexShrink: 0, opacity: status === "Rejected" ? .85 : 1 }}
              onDragOver={e => { e.preventDefault(); setDragOver(status); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => {
                e.preventDefault();
                setDragOver(null);
                const id = e.dataTransfer.getData("requestId");
                if (id) onMove(id, status);
              }}
            >
              {/* Column header */}
              <div style={{
                background: `${color}14`, border: `1px solid ${color}33`,
                borderRadius: "8px 8px 0 0", padding: "10px 14px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontWeight: 700, fontSize: 13, color }}>{statusLabel(status)}</span>
                <span style={{ background: `${color}22`, color, borderRadius: 20, padding: "1px 9px", fontSize: 11, fontWeight: 800 }}>
                  {cards.length}
                </span>
              </div>
              {/* Cards */}
              <div style={{
                background: isOver ? `${color}12` : "#f9f6ef",
                border: `1px ${isOver ? "dashed" : "solid"} ${isOver ? color : `${color}22`}`, borderTop: "none",
                borderRadius: "0 0 8px 8px", minHeight: 80, padding: 8,
                display: "flex", flexDirection: "column", gap: 8,
                transition: "background .15s",
              }}>
                {cards.map(req => <KanbanCard key={req.id} req={req} onEdit={onEdit} />)}
                {cards.length === 0 && (
                  <div style={{ textAlign: "center", color: CRM_COLORS.muted, fontSize: 12, padding: "12px 0" }}>—</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function Requests() {
  const { user } = useAuth();
  const [requests, setRequests]           = useState([]);
  const [clients, setClients]             = useState([]);
  const [services, setServices]           = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestFiles, setRequestFiles]   = useState([]);
  const [requestHistory, setRequestHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [fileType, setFileType]           = useState("Passport");
  const [uploading, setUploading]         = useState(false);
  const [form, setForm]                   = useState(emptyRequest);
  const [statusNote, setStatusNote]       = useState("");
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState("");
  const [activeTab, setActiveTab]         = useState("details");
  const [viewMode, setViewMode]           = useState("table"); // "table" | "kanban"

  useEffect(() => { loadData(); }, []);

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
      const matchesStatus = statusFilter === "All" || normalizeStatus(request.status) === statusFilter;
      const matchesPriority = priorityFilter === "All" || (request.priority || "medium") === priorityFilter;
      const matchesSearch =
        !term ||
        [
          request.request_number,
          request.status,
          statusLabelAr(request.status),
          request.notes,
          request.assigned_to_email,
          request.clients?.full_name,
          request.clients?.email,
          request.clients?.phone,
          request.services?.name,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));
      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [requests, search, statusFilter, priorityFilter]);

  function editRequest(request) {
    setSelectedRequest(request);
    setForm({
      client_id: request.client_id || "",
      service_id: request.service_id || "",
      status: normalizeStatus(request.status) || "Lead",
      priority: request.priority || "medium",
      assigned_to_email: request.assigned_to_email || "",
      notes: request.notes || "",
    });
    setStatusNote("");
    setActiveTab("details");
    loadRequestFiles(request.id);
    loadRequestHistory(request.id);
  }

  function resetForm() {
    setSelectedRequest(null);
    setRequestFiles([]);
    setRequestHistory([]);
    setStatusNote("");
    setForm(emptyRequest);
  }

  async function loadRequestFiles(requestId) {
    const { data } = await supabase
      .from("request_files")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: false });
    setRequestFiles(data || []);
  }

  async function loadRequestHistory(requestId) {
    setHistoryLoading(true);
    const { data } = await supabase
      .from("request_history")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: false });
    setRequestHistory(data || []);
    setHistoryLoading(false);
  }

  async function saveRequest(event) {
    event.preventDefault();
    if (!form.client_id || !form.status) {
      setError("العميل والحالة مطلوبان.");
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      client_id: form.client_id,
      service_id: form.service_id || null,
      status: form.status,
      priority: form.priority || "medium",
      assigned_to_email: form.assigned_to_email.trim() || null,
      notes: form.notes,
    };

    // .select() so a new request's id is available for its history row
    const result = selectedRequest
      ? await supabase.from("requests").update(payload).eq("id", selectedRequest.id).select("id")
      : await supabase.from("requests").insert([{ ...payload, request_number: makeRequestNumber() }]).select("id");

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    // Record history when status changes (or on creation)
    const statusChanged = !selectedRequest || normalizeStatus(selectedRequest.status) !== form.status;
    if (statusChanged) {
      await supabase.from("request_history").insert([{
        request_id: selectedRequest?.id || result.data?.[0]?.id,
        from_status: selectedRequest?.status || null,
        to_status: form.status,
        note: statusNote.trim() || null,
        changed_by: user?.id || null,
        changed_by_email: user?.email || null,
      }]);
    }

    // Send notification if status changed on existing request
    if (selectedRequest && statusChanged) {
      await sendStatusNotification({
        requestNumber: selectedRequest.request_number,
        client: selectedRequest.clients,
        form: {
          service: services.find((s) => s.id === form.service_id)?.name || "",
          msg: statusNote || form.notes,
        },
        status: form.status,
      });
    }

    setSaving(false);
    resetForm();
    await loadData();
  }

  // Kanban drag & drop: move a request to another stage
  async function moveRequest(requestId, toStatus) {
    const request = requests.find(r => r.id === requestId);
    if (!request || normalizeStatus(request.status) === toStatus) return;
    setError("");
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: toStatus } : r));

    const { error: moveError } = await supabase.from("requests").update({ status: toStatus }).eq("id", requestId);
    if (moveError) {
      setError(moveError.message);
      await loadData();
      return;
    }
    await supabase.from("request_history").insert([{
      request_id: requestId,
      from_status: request.status || null,
      to_status: toStatus,
      changed_by: user?.id || null,
      changed_by_email: user?.email || null,
    }]);
    await sendStatusNotification({
      requestNumber: request.request_number,
      client: request.clients,
      form: { service: request.services?.name || "", msg: "" },
      status: toStatus,
    });
    if (selectedRequest?.id === requestId) {
      setSelectedRequest({ ...request, status: toStatus });
      setForm(f => ({ ...f, status: toStatus }));
      loadRequestHistory(requestId);
    }
  }

  async function uploadRequestFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !selectedRequest) return;
    setUploading(true);
    setError("");

    const safeName = file.name.replace(/[^\w.-]+/g, "-");
    const storagePath = `${selectedRequest.id}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("request-documents")
      .upload(storagePath, file);

    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }

    const { error: fileRecordError } = await supabase
      .from("request_files")
      .insert([{ request_id: selectedRequest.id, file_type: fileType, file_name: file.name, storage_path: storagePath }]);

    setUploading(false);
    if (fileRecordError) { setError(fileRecordError.message); return; }

    // Record file upload in history
    await supabase.from("request_history").insert([{
      request_id: selectedRequest.id,
      from_status: selectedRequest.status,
      to_status: selectedRequest.status,
      note: `تم رفع ملف: ${file.name} (${fileType})`,
      changed_by: user?.id || null,
      changed_by_email: user?.email || null,
    }]);

    await loadRequestFiles(selectedRequest.id);
    await loadRequestHistory(selectedRequest.id);
  }

  async function openRequestFile(file) {
    const { data, error: signedUrlError } = await supabase.storage
      .from("request-documents")
      .createSignedUrl(file.storage_path, 60);
    if (signedUrlError) { setError(signedUrlError.message); return; }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function deleteRequest(request) {
    if (!window.confirm(`حذف الطلب ${request.request_number}؟`)) return;
    const { error: deleteError } = await supabase.from("requests").delete().eq("id", request.id);
    if (deleteError) { setError(deleteError.message); return; }
    if (selectedRequest?.id === request.id) resetForm();
    await loadData();
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const TABS = [
    { key: "details",  label: "التفاصيل" },
    { key: "timeline", label: `السجل الزمني${requestHistory.length ? ` (${requestHistory.length})` : ""}` },
    { key: "files",    label: `الملفات${requestFiles.length ? ` (${requestFiles.length})` : ""}` },
  ];

  return (
    <div style={pageStyle}>
      <Header
        title="الطلبات"
        subtitle="إنشاء وتصفية وتحديث ومتابعة طلبات خدمات العملاء."
      />

      {error && <Alert message={error} />}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.45fr) minmax(340px,.75fr)", gap: 22 }}>

        {/* ── Left: Requests Table ── */}
        <section style={{ ...cardStyle, padding: 22 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
            <input
              placeholder="بحث بالرقم أو العميل أو الهاتف أو الملاحظات"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, flex: "1 1 200px" }}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inputStyle, flex: "0 0 180px" }}>
              <option value="All">كل الحالات</option>
              {VISA_STATUSES.map((s) => (
                <option key={s} value={s}>{statusLabel(s)}</option>
              ))}
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ ...inputStyle, flex: "0 0 140px" }}>
              <option value="All">كل الأولويات</option>
              {PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.ar}</option>)}
            </select>
            <button style={outlineButtonStyle} onClick={loadData}>تحديث</button>
            {/* View toggle */}
            <div style={{ display: "flex", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 6, overflow: "hidden" }}>
              {[["table","📋 جدول"],["kanban","🗂️ لوحة المراحل"]].map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    border: "none", padding: "10px 14px", cursor: "pointer",
                    background: viewMode === mode ? CRM_COLORS.gold : "#fff",
                    color: viewMode === mode ? "#111" : CRM_COLORS.muted,
                    fontWeight: viewMode === mode ? 800 : 400,
                    fontFamily: "inherit", fontSize: 13, transition: "all .15s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p style={{ color: CRM_COLORS.muted }}>جارٍ تحميل الطلبات...</p>
          ) : viewMode === "kanban" ? (
            <>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: CRM_COLORS.muted }}>
                اسحب البطاقة إلى عمود آخر لتغيير مرحلة الطلب (يُسجَّل في السجل الزمني ويُبلَّغ العميل).
              </p>
              <KanbanBoard requests={filteredRequests} onEdit={editRequest} onMove={moveRequest} />
            </>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table width="100%" cellPadding="13" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "right", color: CRM_COLORS.muted, borderBottom: `1px solid ${CRM_COLORS.border}`, fontSize: 12, textTransform: "uppercase" }}>
                    <th>رقم الطلب</th>
                    <th>العميل</th>
                    <th>الخدمة</th>
                    <th>الحالة</th>
                    <th>الأولوية</th>
                    <th>التاريخ</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} style={{
                      borderBottom: "1px solid #f1eadc",
                      background: selectedRequest?.id === request.id ? `${CRM_COLORS.gold}0a` : "transparent",
                    }}>
                      <td>
                        <button
                          onClick={() => editRequest(request)}
                          style={{ border: 0, background: "transparent", color: CRM_COLORS.goldDark, fontWeight: 800, cursor: "pointer" }}
                        >
                          {request.request_number}
                        </button>
                      </td>
                      <td>{request.clients?.full_name || "-"}</td>
                      <td style={{ color: CRM_COLORS.muted, fontSize: 13 }}>{request.services?.name || "-"}</td>
                      <td>
                        <span style={{
                          color: statusColor(request.status),
                          fontWeight: 800, fontSize: 12,
                          background: `${statusColor(request.status)}18`,
                          padding: "2px 10px", borderRadius: 20,
                        }}>
                          {statusLabel(request.status)}
                        </span>
                      </td>
                      <td><PriorityBadge priority={request.priority} /></td>
                      <td style={{ color: CRM_COLORS.muted, fontSize: 13 }}>{formatDate(request.created_at).split(",")[0]}</td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button style={outlineButtonStyle} onClick={() => editRequest(request)}>تعديل</button>
                          <button style={{ ...outlineButtonStyle, color: CRM_COLORS.danger }} onClick={() => deleteRequest(request)}>حذف</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filteredRequests.length && (
                    <tr>
                      <td colSpan="7" style={{ color: CRM_COLORS.muted, textAlign: "center", padding: 28 }}>
                        لا توجد طلبات.
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
            <h2 style={{ marginTop: 0, fontSize: 17 }}>{selectedRequest ? "تعديل الطلب" : "طلب جديد"}</h2>
            <form onSubmit={saveRequest} style={{ display: "grid", gap: 12 }}>
              <select value={form.client_id} onChange={(e) => setForm(f => ({ ...f, client_id: e.target.value }))} style={inputStyle}>
                <option value="">اختر العميل</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
              <select value={form.service_id} onChange={(e) => setForm(f => ({ ...f, service_id: e.target.value }))} style={inputStyle}>
                <option value="">بدون خدمة</option>
                {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} style={inputStyle}>
                {VISA_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
              </select>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 10 }}>
                <select value={form.priority} onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))} style={inputStyle} title="الأولوية">
                  {PRIORITIES.map((p) => <option key={p.key} value={p.key}>أولوية {p.ar}</option>)}
                </select>
                <input
                  type="email"
                  placeholder="بريد الموظف المسؤول"
                  value={form.assigned_to_email}
                  onChange={(e) => setForm(f => ({ ...f, assigned_to_email: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              {/* Status change note — shown when editing and status might change */}
              {selectedRequest && (
                <input
                  placeholder="ملاحظة على تغيير الحالة (اختياري)"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  style={{ ...inputStyle, fontSize: 13 }}
                />
              )}

              <textarea
                placeholder="ملاحظات عامة"
                rows={4}
                value={form.notes}
                onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                style={{ ...inputStyle, resize: "vertical" }}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={buttonStyle} disabled={saving}>
                  {saving ? "جارٍ الحفظ..." : selectedRequest ? "حفظ التعديلات" : "إنشاء الطلب"}
                </button>
                {selectedRequest && (
                  <button type="button" style={outlineButtonStyle} onClick={resetForm}>جديد</button>
                )}
              </div>
            </form>
          </section>

          {/* Detail Panel with Workflow + Tabs */}
          {selectedRequest && (
            <section style={{ ...cardStyle, overflow: "hidden" }}>

              {/* Workflow Stepper */}
              <WorkflowStepper currentStatus={selectedRequest.status} />

              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: `1px solid ${CRM_COLORS.border}` }}>
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      flex: 1, border: "none", background: "transparent",
                      padding: "12px 8px", fontSize: 12, fontWeight: activeTab === tab.key ? 800 : 500,
                      color: activeTab === tab.key ? CRM_COLORS.goldDark : CRM_COLORS.muted,
                      borderBottom: activeTab === tab.key ? `2px solid ${CRM_COLORS.gold}` : "2px solid transparent",
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ padding: 18 }}>

                {/* Tab: Details */}
                {activeTab === "details" && (
                  <>
                    <Detail label="رقم الطلب" value={selectedRequest.request_number} />
                    <Detail label="العميل" value={selectedRequest.clients?.full_name || selectedRequest.client_id} />
                    <Detail label="البريد" value={selectedRequest.clients?.email} />
                    <Detail label="الهاتف" value={selectedRequest.clients?.phone} />
                    <Detail label="الخدمة" value={selectedRequest.services?.name} />
                    <Detail label="الحالة">
                      <span style={{
                        background: `${statusColor(selectedRequest.status)}18`,
                        color: statusColor(selectedRequest.status),
                        padding: "3px 10px", borderRadius: 20, fontWeight: 800, fontSize: 13,
                      }}>
                        {statusLabel(selectedRequest.status)}
                      </span>
                    </Detail>
                    <Detail label="تاريخ الإنشاء" value={formatDate(selectedRequest.created_at)} />
                    {selectedRequest.notes && <Detail label="ملاحظات" value={selectedRequest.notes} pre />}
                  </>
                )}

                {/* Tab: Timeline */}
                {activeTab === "timeline" && (
                  <Timeline history={requestHistory} loading={historyLoading} />
                )}

                {/* Tab: Files */}
                {activeTab === "files" && (
                  <>
                    <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                      <select value={fileType} onChange={(e) => setFileType(e.target.value)} style={inputStyle}>
                        <option>Passport</option>
                        <option>ID Card</option>
                        <option>Photos</option>
                        <option>Supporting Documents</option>
                      </select>
                      <label style={{ ...buttonStyle, textAlign: "center", cursor: "pointer", opacity: uploading ? .65 : 1 }}>
                        {uploading ? "جارٍ الرفع..." : "رفع ملف"}
                        <input type="file" onChange={uploadRequestFile} disabled={uploading} style={{ display: "none" }} />
                      </label>
                    </div>
                    {requestFiles.length ? (
                      <div style={{ display: "grid", gap: 10 }}>
                        {requestFiles.map((file) => (
                          <div key={file.id} style={{ border: `1px solid ${CRM_COLORS.border}`, borderRadius: 6, padding: 12 }}>
                            <div style={{ fontWeight: 800 }}>{file.file_name}</div>
                            <div style={{ color: CRM_COLORS.muted, fontSize: 12 }}>{file.file_type} · {formatDate(file.created_at)}</div>
                            <button style={{ ...outlineButtonStyle, marginTop: 8, fontSize: 12 }} onClick={() => openRequestFile(file)}>
                              فتح
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: CRM_COLORS.muted }}>لا توجد ملفات لهذا الطلب.</p>
                    )}
                  </>
                )}

              </div>
            </section>
          )}

          {!selectedRequest && (
            <section style={{ ...cardStyle, padding: 22 }}>
              <p style={{ color: CRM_COLORS.muted, margin: 0 }}>اختر طلباً لعرض تفاصيله والسجل الزمني.</p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Header({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ color: CRM_COLORS.goldDark, letterSpacing: ".22em", textTransform: "uppercase", fontSize: 12 }}>
        Alkown Global CRM
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

function Detail({ label, value, pre = false, children }) {
  return (
    <div style={{ borderBottom: "1px solid #f1eadc", padding: "10px 0" }}>
      <div style={{ color: CRM_COLORS.muted, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      {children || <div style={{ whiteSpace: pre ? "pre-wrap" : "normal", fontSize: 14 }}>{value || "-"}</div>}
    </div>
  );
}
