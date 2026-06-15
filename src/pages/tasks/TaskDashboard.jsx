import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { CRM_COLORS, pageStyle } from "../../components/crmUi";

const TASK_STATUSES = ["pending", "in_progress", "waiting", "completed", "overdue"];
const STATUS_AR = { pending: "معلّق", in_progress: "قيد التنفيذ", waiting: "بانتظار رد", completed: "مكتمل", overdue: "متأخر" };
const STATUS_COLORS = { pending: "#c8922a", in_progress: "#3d6f9f", waiting: "#8a6010", completed: "#2d9c5a", overdue: "#c0392b" };
const PRIORITY_COLORS = { high: "#c0392b", medium: "#c8922a", low: "#2d9c5a" };
const PRIORITY_AR = { high: "عالية", medium: "متوسطة", low: "منخفضة" };

function badge(text, color) {
  return <span style={{ padding: "2px 10px", borderRadius: 99, fontSize: ".67rem", fontWeight: 700, background: `${color}18`, color, letterSpacing: ".05em" }}>{text}</span>;
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
}

function isOverdue(task) {
  if (!task.due_date || task.status === "completed") return false;
  return new Date(task.due_date) < new Date();
}

const emptyTask = {
  title: "", description: "", due_date: "", assigned_to: "",
  status: "pending", priority: "medium", client_id: "", request_id: ""
};

// ── Task Modal ─────────────────────────────────────────────────
function TaskModal({ task, clients, onClose, onSave }) {
  const [form, setForm] = useState(task || emptyTask);
  const [saving, setSaving] = useState(false);
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const isNew = !task?.id;

  async function save() {
    if (!form.title.trim()) return alert("عنوان المهمة مطلوب");
    setSaving(true);
    const payload = { ...form };
    if (!payload.client_id) delete payload.client_id;
    if (!payload.request_id) delete payload.request_id;
    if (isNew) {
      await supabase.from("client_tasks").insert([payload]);
    } else {
      await supabase.from("client_tasks").update(payload).eq("id", task.id);
    }
    setSaving(false);
    onSave();
  }

  const lbl = { display: "block", fontSize: ".68rem", color: CRM_COLORS.muted, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 6 };
  const inp = { width: "100%", padding: "9px 12px", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 6, fontSize: ".88rem", background: "#fff", color: CRM_COLORS.text };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 580, padding: 32, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: CRM_COLORS.text }}>{isNew ? "مهمة جديدة" : "تعديل المهمة"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: CRM_COLORS.muted }}>✕</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>عنوان المهمة *</label>
          <input value={form.title} onChange={upd("title")} style={inp} placeholder="وصف قصير للمهمة" />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>التفاصيل</label>
          <textarea rows={3} value={form.description} onChange={upd("description")} style={{ ...inp, resize: "vertical" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <div>
            <label style={lbl}>الحالة</label>
            <select value={form.status} onChange={upd("status")} style={inp}>
              {TASK_STATUSES.filter(s => s !== "overdue").map(s => <option key={s} value={s}>{STATUS_AR[s]}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>الأولوية</label>
            <select value={form.priority} onChange={upd("priority")} style={inp}>
              <option value="high">عالية</option>
              <option value="medium">متوسطة</option>
              <option value="low">منخفضة</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <div>
            <label style={lbl}>تاريخ الاستحقاق</label>
            <input type="date" value={form.due_date || ""} onChange={upd("due_date")} style={inp} />
          </div>
          <div>
            <label style={lbl}>المسؤول</label>
            <input value={form.assigned_to || ""} onChange={upd("assigned_to")} style={inp} placeholder="اسم الموظف" />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>العميل المرتبط</label>
          <select value={form.client_id || ""} onChange={upd("client_id")} style={inp}>
            <option value="">— لا يوجد —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 22px", borderRadius: 6, border: `1px solid ${CRM_COLORS.border}`, background: "transparent", color: CRM_COLORS.muted, cursor: "pointer", fontWeight: 600 }}>إلغاء</button>
          <button onClick={save} disabled={saving} style={{ padding: "9px 22px", borderRadius: 6, border: "none", background: CRM_COLORS.gold, color: "#fff", cursor: "pointer", fontWeight: 700 }}>
            {saving ? "جاري الحفظ..." : (isNew ? "إنشاء المهمة" : "حفظ التغييرات")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TASK DASHBOARD
// ══════════════════════════════════════════════════════════════
export default function TaskDashboard() {
  const { user } = useAuth(); // eslint-disable-line no-unused-vars
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "new" | task object
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("board"); // board | list

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: t }, { data: c }] = await Promise.all([
      supabase.from("client_tasks").select("*, clients(id,full_name)").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, full_name").order("full_name")
    ]);
    // auto-mark overdue
    const enriched = (t || []).map(task => ({
      ...task,
      status: task.status !== "completed" && isOverdue(task) ? "overdue" : task.status
    }));
    setTasks(enriched);
    setClients(c || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tasks.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || (t.assigned_to || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchPriority = filterPriority === "all" || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  async function deleteTask(id) {
    if (!window.confirm("حذف هذه المهمة؟")) return;
    await supabase.from("client_tasks").delete().eq("id", id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  const byStatus = TASK_STATUSES.reduce((acc, s) => {
    acc[s] = filtered.filter(t => t.status === s);
    return acc;
  }, {});

  const counts = TASK_STATUSES.reduce((acc, s) => { acc[s] = tasks.filter(t => t.status === s).length; return acc; }, {});

  return (
    <div style={{ ...pageStyle, minHeight: "100vh", fontFamily: "'Cairo','Segoe UI',sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: CRM_COLORS.text, margin: 0 }}>إدارة المهام</h1>
          <p style={{ color: CRM_COLORS.muted, fontSize: ".85rem", marginTop: 4 }}>{tasks.length} مهمة إجمالي</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ display: "flex", gap: 4, background: CRM_COLORS.beige, padding: 4, borderRadius: 8 }}>
            {[["board", "لوحة 📋"], ["list", "قائمة ☰"]].map(([v, l]) => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "7px 14px", borderRadius: 6, border: "none", cursor: "pointer",
                background: view === v ? "#fff" : "transparent",
                color: view === v ? CRM_COLORS.text : CRM_COLORS.muted,
                fontWeight: view === v ? 700 : 400, fontSize: ".8rem",
                boxShadow: view === v ? "0 2px 8px rgba(0,0,0,.08)" : "none"
              }}>{l}</button>
            ))}
          </div>
          <button onClick={() => setModal("new")} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: CRM_COLORS.gold, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: ".88rem" }}>
            + مهمة جديدة
          </button>
        </div>
      </div>

      {/* Status summary */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {TASK_STATUSES.map(s => (
          <button key={s} onClick={() => setFilterStatus(filterStatus === s ? "all" : s)} style={{
            padding: "6px 14px", borderRadius: 99, border: `1.5px solid ${filterStatus === s ? STATUS_COLORS[s] : CRM_COLORS.border}`,
            background: filterStatus === s ? `${STATUS_COLORS[s]}14` : "#fff",
            color: filterStatus === s ? STATUS_COLORS[s] : CRM_COLORS.muted,
            fontSize: ".72rem", fontWeight: 600, cursor: "pointer"
          }}>
            {STATUS_AR[s]} <strong>{counts[s]}</strong>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input placeholder="بحث في المهام..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: "9px 14px", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 8, fontSize: ".88rem" }} />
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          style={{ padding: "9px 14px", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 8, fontSize: ".88rem" }}>
          <option value="all">كل الأولويات</option>
          <option value="high">عالية</option>
          <option value="medium">متوسطة</option>
          <option value="low">منخفضة</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: CRM_COLORS.muted }}>جارٍ التحميل...</div>
      ) : view === "board" ? (
        /* BOARD VIEW */
        <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 20, alignItems: "flex-start" }}>
          {TASK_STATUSES.map(status => (
            <div key={status} style={{
              minWidth: 230, maxWidth: 270, flex: "0 0 250px",
              background: CRM_COLORS.warm, border: `1px solid ${CRM_COLORS.border}`,
              borderTop: `3px solid ${STATUS_COLORS[status]}`, borderRadius: 8, padding: "12px 10px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontWeight: 700, color: STATUS_COLORS[status], fontSize: ".8rem" }}>{STATUS_AR[status]}</span>
                <span style={{ background: `${STATUS_COLORS[status]}22`, color: STATUS_COLORS[status], borderRadius: 99, padding: "2px 8px", fontSize: ".72rem", fontWeight: 700 }}>{byStatus[status].length}</span>
              </div>
              {byStatus[status].map(task => (
                <div key={task.id} onClick={() => setModal(task)} style={{
                  background: "#fff", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 6, padding: "14px 16px", marginBottom: 10, cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,.04)", transition: "all .2s"
                }}>
                  <div style={{ fontWeight: 700, color: CRM_COLORS.text, fontSize: ".88rem", marginBottom: 6 }}>{task.title}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    {badge(PRIORITY_AR[task.priority] || "—", PRIORITY_COLORS[task.priority] || CRM_COLORS.gold)}
                    {task.due_date && <span style={{ fontSize: ".68rem", color: isOverdue(task) ? "#c0392b" : CRM_COLORS.muted }}>{formatDate(task.due_date)}</span>}
                  </div>
                  {task.assigned_to && <div style={{ fontSize: ".72rem", color: CRM_COLORS.muted }}>👤 {task.assigned_to}</div>}
                  {task.clients?.full_name && <div style={{ fontSize: ".72rem", color: CRM_COLORS.muted, marginTop: 2 }}>🧑 {task.clients.full_name}</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 8, overflow: "hidden" }}>
            <thead>
              <tr style={{ background: CRM_COLORS.beige }}>
                {["المهمة", "الحالة", "الأولوية", "تاريخ الاستحقاق", "المسؤول", "العميل", ""].map((h, i) => (
                  <th key={i} style={{ padding: "12px 16px", textAlign: "right", fontSize: ".72rem", color: CRM_COLORS.muted, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 700, borderBottom: `1px solid ${CRM_COLORS.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((task, i) => (
                <tr key={task.id} style={{ borderBottom: `1px solid ${CRM_COLORS.border}`, background: i % 2 === 0 ? "#fff" : CRM_COLORS.warm }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, color: CRM_COLORS.text, fontSize: ".88rem" }}>{task.title}</div>
                    {task.description && <div style={{ fontSize: ".74rem", color: CRM_COLORS.muted, marginTop: 2 }}>{task.description.slice(0, 60)}{task.description.length > 60 ? "..." : ""}</div>}
                  </td>
                  <td style={{ padding: "12px 16px" }}>{badge(STATUS_AR[task.status] || task.status, STATUS_COLORS[task.status] || CRM_COLORS.muted)}</td>
                  <td style={{ padding: "12px 16px" }}>{badge(PRIORITY_AR[task.priority] || "—", PRIORITY_COLORS[task.priority] || CRM_COLORS.gold)}</td>
                  <td style={{ padding: "12px 16px", fontSize: ".8rem", color: isOverdue(task) ? "#c0392b" : CRM_COLORS.muted }}>{formatDate(task.due_date)}</td>
                  <td style={{ padding: "12px 16px", fontSize: ".8rem", color: CRM_COLORS.muted }}>{task.assigned_to || "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: ".8rem", color: CRM_COLORS.muted }}>{task.clients?.full_name || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setModal(task)} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${CRM_COLORS.border}`, background: "transparent", color: CRM_COLORS.muted, cursor: "pointer", fontSize: ".75rem" }}>تعديل</button>
                      <button onClick={() => deleteTask(task.id)} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid #fcc`, background: "transparent", color: "#c0392b", cursor: "pointer", fontSize: ".75rem" }}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: CRM_COLORS.muted }}>لا توجد مهام</div>}
        </div>
      )}

      {modal && (
        <TaskModal
          task={modal === "new" ? null : modal}
          clients={clients}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
