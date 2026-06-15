import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import {
  VISA_STATUSES,
  VISA_STATUS_AR,
  statusColors,
  CRM_COLORS,
  pageStyle,
  cardStyle,
} from "../../components/crmUi";

// eslint-disable-next-line no-unused-vars
const VIEWS = ["kanban", "list", "table"];

const PRIORITY_COLORS = {
  high: "#c0392b",
  medium: "#c8922a",
  low: "#2d9c5a",
};

function priorityBadge(p) {
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 99, fontSize: ".65rem", fontWeight: 700,
      background: `${PRIORITY_COLORS[p] || CRM_COLORS.gold}18`,
      color: PRIORITY_COLORS[p] || CRM_COLORS.gold, letterSpacing: ".06em", textTransform: "uppercase"
    }}>{p || "—"}</span>
  );
}

function stageBadge(status) {
  const color = statusColors[status] || CRM_COLORS.muted;
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 99, fontSize: ".68rem", fontWeight: 700,
      background: `${color}18`, color, letterSpacing: ".04em"
    }}>{VISA_STATUS_AR[status] || status}</span>
  );
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
}

// ── Kanban Card ────────────────────────────────────────────────
function KanbanCard({ req, onClick, onStageChange }) {
  const [dragging, setDragging] = useState(false);
  return (
    <div
      draggable
      onDragStart={e => { setDragging(true); e.dataTransfer.setData("requestId", req.id); e.dataTransfer.setData("fromStage", req.status); }}
      onDragEnd={() => setDragging(false)}
      onClick={() => onClick(req)}
      style={{
        background: "#fff", border: `1px solid ${CRM_COLORS.border}`,
        borderRadius: 6, padding: "14px 16px", marginBottom: 10,
        cursor: "pointer", opacity: dragging ? 0.5 : 1,
        boxShadow: dragging ? "0 8px 32px rgba(0,0,0,.12)" : "0 2px 8px rgba(0,0,0,.04)",
        transition: "all .2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <span style={{ fontSize: ".72rem", color: CRM_COLORS.gold, fontWeight: 700, letterSpacing: ".06em" }}>
          {req.request_number || "—"}
        </span>
        {priorityBadge(req.priority)}
      </div>
      <div style={{ fontWeight: 700, color: CRM_COLORS.text, fontSize: ".9rem", marginBottom: 4 }}>
        {req.clients?.full_name || "—"}
      </div>
      <div style={{ fontSize: ".78rem", color: CRM_COLORS.muted, marginBottom: 8 }}>
        {req.services?.name || req.service_name || "—"}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
        <span style={{ fontSize: ".72rem", color: CRM_COLORS.muted }}>{formatDate(req.created_at)}</span>
        {req.assigned_to_email && (
          <span style={{ fontSize: ".68rem", background: CRM_COLORS.beige, color: CRM_COLORS.muted, padding: "2px 7px", borderRadius: 99 }}>
            {req.assigned_to_email.split("@")[0]}
          </span>
        )}
      </div>
      {req.tags && req.tags.length > 0 && (
        <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
          {req.tags.map((tag, i) => (
            <span key={i} style={{ fontSize: ".63rem", background: `${CRM_COLORS.gold}18`, color: CRM_COLORS.goldDark, padding: "2px 7px", borderRadius: 99 }}>{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Kanban Column ─────────────────────────────────────────────
function KanbanColumn({ stage, cards, onCardClick, onDrop }) {
  const [dragOver, setDragOver] = useState(false);
  const color = statusColors[stage] || CRM_COLORS.muted;
  return (
    <div
      style={{
        minWidth: 230, maxWidth: 270, flex: "0 0 250px",
        background: dragOver ? `${color}08` : CRM_COLORS.warm,
        border: `1px solid ${dragOver ? color : CRM_COLORS.border}`,
        borderTop: `3px solid ${color}`,
        borderRadius: 8, padding: "12px 10px",
        transition: "all .2s",
      }}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); const id = e.dataTransfer.getData("requestId"); if (id) onDrop(id, stage); }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontWeight: 700, color, fontSize: ".8rem", letterSpacing: ".04em" }}>
          {VISA_STATUS_AR[stage] || stage}
        </span>
        <span style={{ background: `${color}22`, color, borderRadius: 99, padding: "2px 8px", fontSize: ".72rem", fontWeight: 700 }}>
          {cards.length}
        </span>
      </div>
      <div style={{ minHeight: 60 }}>
        {cards.map(req => (
          <KanbanCard key={req.id} req={req} onClick={onCardClick} />
        ))}
      </div>
    </div>
  );
}

// ── Detail Modal ───────────────────────────────────────────────
function RequestModal({ req, onClose, onStatusChange, onSave }) {
  const [notes, setNotes] = useState(req.notes || "");
  const [priority, setPriority] = useState(req.priority || "medium");
  const [assignedTo, setAssignedTo] = useState(req.assigned_to_email || "");
  const [newNote, setNewNote] = useState("");
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("request_history").select("*").eq("request_id", req.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setHistory(data || []));
  }, [req.id]);

  async function save() {
    setSaving(true);
    await supabase.from("requests").update({ notes, priority, assigned_to_email: assignedTo }).eq("id", req.id);
    if (newNote.trim()) {
      await supabase.from("request_history").insert([{
        request_id: req.id, to_status: req.status,
        note: newNote, changed_by_email: assignedTo || "system"
      }]);
      setNewNote("");
    }
    setSaving(false);
    onSave();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: ".72rem", color: CRM_COLORS.gold, fontWeight: 700, letterSpacing: ".1em", marginBottom: 4 }}>{req.request_number}</div>
            <h2 style={{ color: CRM_COLORS.text, fontWeight: 800, fontSize: "1.2rem", margin: 0 }}>{req.clients?.full_name || "—"}</h2>
            <div style={{ color: CRM_COLORS.muted, fontSize: ".85rem", marginTop: 4 }}>{req.services?.name || req.service_name || "—"}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: CRM_COLORS.muted, lineHeight: 1 }}>✕</button>
        </div>

        {/* Stage selector */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: ".68rem", color: CRM_COLORS.muted, letterSpacing: ".12em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>المرحلة</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {VISA_STATUSES.map(s => (
              <button key={s} onClick={() => onStatusChange(req.id, s)} style={{
                padding: "5px 14px", borderRadius: 99, border: `1.5px solid ${req.status === s ? statusColors[s] : CRM_COLORS.border}`,
                background: req.status === s ? `${statusColors[s]}18` : "transparent",
                color: req.status === s ? statusColors[s] : CRM_COLORS.muted,
                fontSize: ".72rem", fontWeight: req.status === s ? 700 : 400, cursor: "pointer", transition: "all .2s"
              }}>{VISA_STATUS_AR[s] || s}</button>
            ))}
          </div>
        </div>

        {/* Meta fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: ".68rem", color: CRM_COLORS.muted, letterSpacing: ".12em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>الأولوية</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 6, background: "#fff", color: CRM_COLORS.text, fontSize: ".88rem" }}>
              <option value="low">منخفضة</option>
              <option value="medium">متوسطة</option>
              <option value="high">عالية</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: ".68rem", color: CRM_COLORS.muted, letterSpacing: ".12em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>المسؤول</label>
            <input value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="email@domain.com"
              style={{ width: "100%", padding: "8px 12px", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 6, background: "#fff", color: CRM_COLORS.text, fontSize: ".88rem" }} />
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: ".68rem", color: CRM_COLORS.muted, letterSpacing: ".12em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>الملاحظات</label>
          <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 6, fontSize: ".88rem", resize: "vertical" }} />
        </div>

        {/* Add activity note */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: ".68rem", color: CRM_COLORS.muted, letterSpacing: ".12em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>إضافة ملاحظة للسجل</label>
          <textarea rows={2} value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="ملاحظة داخلية..."
            style={{ width: "100%", padding: "10px 12px", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 6, fontSize: ".88rem", resize: "vertical" }} />
        </div>

        {/* History */}
        {history.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: ".68rem", color: CRM_COLORS.muted, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 10 }}>سجل التغييرات</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto" }}>
              {history.map(h => (
                <div key={h.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: CRM_COLORS.beige, padding: "10px 12px", borderRadius: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColors[h.to_status] || CRM_COLORS.gold, marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: ".78rem", color: CRM_COLORS.text, fontWeight: 600 }}>
                      {h.from_status && <span style={{ color: CRM_COLORS.muted, fontWeight: 400 }}>{VISA_STATUS_AR[h.from_status] || h.from_status} → </span>}
                      {VISA_STATUS_AR[h.to_status] || h.to_status}
                    </div>
                    {h.note && <div style={{ fontSize: ".78rem", color: CRM_COLORS.muted, marginTop: 2 }}>{h.note}</div>}
                    <div style={{ fontSize: ".68rem", color: CRM_COLORS.muted, marginTop: 2 }}>{formatDate(h.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 22px", borderRadius: 6, border: `1px solid ${CRM_COLORS.border}`, background: "transparent", color: CRM_COLORS.muted, cursor: "pointer", fontWeight: 600 }}>إغلاق</button>
          <button onClick={save} disabled={saving} style={{ padding: "9px 22px", borderRadius: 6, border: "none", background: CRM_COLORS.gold, color: "#fff", cursor: "pointer", fontWeight: 700 }}>
            {saving ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN VISA PIPELINE PAGE
// ══════════════════════════════════════════════════════════════
export default function VisaPipeline() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("kanban");
  const [selectedReq, setSelectedReq] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("requests")
      .select("*, clients(id, full_name, email, phone), services(id, name)")
      .order("created_at", { ascending: false });
    setRequests(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const filtered = requests.filter(r => {
    const matchSearch = !search ||
      (r.clients?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.request_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.services?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchStage = filterStage === "all" || r.status === filterStage;
    const matchPriority = filterPriority === "all" || r.priority === filterPriority;
    return matchSearch && matchStage && matchPriority;
  });

  async function handleStageChange(reqId, newStage) {
    const req = requests.find(r => r.id === reqId);
    if (!req || req.status === newStage) return;
    await supabase.from("request_history").insert([{
      request_id: reqId, from_status: req.status, to_status: newStage,
      changed_by_email: user?.email || "system"
    }]);
    await supabase.from("requests").update({ status: newStage }).eq("id", reqId);
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: newStage } : r));
    if (selectedReq?.id === reqId) setSelectedReq(prev => ({ ...prev, status: newStage }));
  }

  const byStage = VISA_STATUSES.reduce((acc, s) => {
    acc[s] = filtered.filter(r => r.status === s);
    return acc;
  }, {});

  const counts = VISA_STATUSES.reduce((acc, s) => { acc[s] = requests.filter(r => r.status === s).length; return acc; }, {});

  return (
    <div style={{ ...pageStyle, minHeight: "100vh", fontFamily: "'Cairo','Segoe UI',sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: CRM_COLORS.text, margin: 0 }}>خط سير الطلبات</h1>
          <p style={{ color: CRM_COLORS.muted, fontSize: ".85rem", marginTop: 4 }}>
            {requests.length} طلب إجمالي · {filtered.length} معروض
          </p>
        </div>
        {/* View Switcher */}
        <div style={{ display: "flex", gap: 4, background: CRM_COLORS.beige, padding: 4, borderRadius: 8 }}>
          {[["kanban", "كانبان 📋"], ["list", "قائمة ☰"], ["table", "جدول 📊"]].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "7px 16px", borderRadius: 6, border: "none", cursor: "pointer",
              background: view === v ? "#fff" : "transparent",
              color: view === v ? CRM_COLORS.text : CRM_COLORS.muted,
              fontWeight: view === v ? 700 : 400, fontSize: ".8rem",
              boxShadow: view === v ? "0 2px 8px rgba(0,0,0,.08)" : "none",
              transition: "all .2s"
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Stage summary strip */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {VISA_STATUSES.map(s => (
          <button key={s} onClick={() => setFilterStage(filterStage === s ? "all" : s)} style={{
            flexShrink: 0, padding: "6px 14px", borderRadius: 99, border: `1.5px solid ${filterStage === s ? statusColors[s] : CRM_COLORS.border}`,
            background: filterStage === s ? `${statusColors[s]}14` : "#fff",
            color: filterStage === s ? statusColors[s] : CRM_COLORS.muted,
            fontSize: ".72rem", fontWeight: 600, cursor: "pointer", transition: "all .2s"
          }}>
            {VISA_STATUS_AR[s]} <span style={{ fontWeight: 800 }}>{counts[s]}</span>
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          placeholder="بحث عن عميل، رقم طلب، خدمة..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 220, padding: "9px 14px", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 8, fontSize: ".88rem", background: "#fff" }}
        />
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          style={{ padding: "9px 14px", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 8, fontSize: ".88rem", background: "#fff" }}>
          <option value="all">كل الأولويات</option>
          <option value="high">عالية</option>
          <option value="medium">متوسطة</option>
          <option value="low">منخفضة</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: CRM_COLORS.muted }}>جارٍ التحميل...</div>
      ) : (
        <>
          {/* KANBAN VIEW */}
          {view === "kanban" && (
            <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 20, alignItems: "flex-start" }}>
              {VISA_STATUSES.map(stage => (
                <KanbanColumn
                  key={stage} stage={stage}
                  cards={byStage[stage] || []}
                  onCardClick={setSelectedReq}
                  onDrop={(id, toStage) => handleStageChange(id, toStage)}
                />
              ))}
            </div>
          )}

          {/* LIST VIEW */}
          {view === "list" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map(req => (
                <div key={req.id} onClick={() => setSelectedReq(req)} style={{
                  ...cardStyle, padding: "16px 20px", cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 8, background: `${statusColors[req.status] || CRM_COLORS.gold}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
                      🗂️
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: CRM_COLORS.text, fontSize: ".92rem" }}>{req.clients?.full_name || "—"}</div>
                      <div style={{ fontSize: ".78rem", color: CRM_COLORS.muted }}>{req.request_number} · {req.services?.name || "—"}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    {priorityBadge(req.priority)}
                    {stageBadge(req.status)}
                    <span style={{ fontSize: ".75rem", color: CRM_COLORS.muted }}>{formatDate(req.created_at)}</span>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0", color: CRM_COLORS.muted }}>لا توجد طلبات</div>
              )}
            </div>
          )}

          {/* TABLE VIEW */}
          {view === "table" && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 8, overflow: "hidden" }}>
                <thead>
                  <tr style={{ background: CRM_COLORS.beige }}>
                    {["رقم الطلب", "العميل", "الخدمة", "المرحلة", "الأولوية", "المسؤول", "التاريخ", ""].map((h, i) => (
                      <th key={i} style={{ padding: "12px 16px", textAlign: "right", fontSize: ".72rem", color: CRM_COLORS.muted, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 700, borderBottom: `1px solid ${CRM_COLORS.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((req, i) => (
                    <tr key={req.id} style={{ borderBottom: `1px solid ${CRM_COLORS.border}`, background: i % 2 === 0 ? "#fff" : CRM_COLORS.warm }}>
                      <td style={{ padding: "12px 16px", fontSize: ".8rem", color: CRM_COLORS.gold, fontWeight: 700 }}>{req.request_number}</td>
                      <td style={{ padding: "12px 16px", fontSize: ".85rem", fontWeight: 600, color: CRM_COLORS.text }}>{req.clients?.full_name || "—"}</td>
                      <td style={{ padding: "12px 16px", fontSize: ".82rem", color: CRM_COLORS.muted }}>{req.services?.name || "—"}</td>
                      <td style={{ padding: "12px 16px" }}>{stageBadge(req.status)}</td>
                      <td style={{ padding: "12px 16px" }}>{priorityBadge(req.priority)}</td>
                      <td style={{ padding: "12px 16px", fontSize: ".78rem", color: CRM_COLORS.muted }}>{req.assigned_to_email ? req.assigned_to_email.split("@")[0] : "—"}</td>
                      <td style={{ padding: "12px 16px", fontSize: ".78rem", color: CRM_COLORS.muted }}>{formatDate(req.created_at)}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <button onClick={() => setSelectedReq(req)} style={{ padding: "5px 14px", borderRadius: 6, border: `1px solid ${CRM_COLORS.border}`, background: "transparent", color: CRM_COLORS.muted, cursor: "pointer", fontSize: ".75rem" }}>عرض</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0", color: CRM_COLORS.muted }}>لا توجد طلبات</div>
              )}
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedReq && (
        <RequestModal
          req={selectedReq}
          onClose={() => setSelectedReq(null)}
          onStatusChange={(id, stage) => { handleStageChange(id, stage); setSelectedReq(prev => ({ ...prev, status: stage })); }}
          onSave={() => { loadRequests(); setSelectedReq(null); }}
        />
      )}
    </div>
  );
}
