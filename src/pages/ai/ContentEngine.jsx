// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Content Engine (Phase 4)
// Generate social posts, articles, campaigns
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { generateContent, getContentItems, saveContentItem, updateContentItem, deleteContentItem } from "../../services/ai/contentService";
import { buildMemoryContext } from "../../services/ai/memoryService";

const G = "#c9a84c";
const BORDER = "rgba(201,168,76,.22)";
const cardBase = { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 10px rgba(0,0,0,.05)" };

const CONTENT_TYPES = [
  { value: "instagram_post",    label: "📸 منشور إنستغرام",    platform: "instagram" },
  { value: "carousel",          label: "🎠 كاروسيل",           platform: "instagram" },
  { value: "reels_script",      label: "🎬 سكريبت ريلز",       platform: "instagram" },
  { value: "video_hook",        label: "🎯 هوكس الفيديو",      platform: "video" },
  { value: "blog_article",      label: "📝 مقال بلوج",         platform: "blog" },
  { value: "email_campaign",    label: "📧 حملة إيميل",        platform: "email" },
  { value: "whatsapp_campaign", label: "💬 رسالة واتساب",      platform: "whatsapp" },
];

const STATUS_COLORS  = { idea: "#aaa", draft: "#3d6f9f", review: "#c28a25", approved: "#059669", published: "#2f8f5b" };
const STATUS_AR      = { idea: "فكرة", draft: "مسودة", review: "مراجعة", approved: "موافق", published: "منشور" };

export default function ContentEngine() {
  const [tab,       setTab]       = useState("generate");
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [genLoading,setGenLoading]= useState(false);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Form
  const [form, setForm] = useState({
    type:  "instagram_post",
    topic: "",
    lang:  "ar",
    tone:  "professional",
  });

  useEffect(() => { loadItems(); }, [filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadItems() {
    setLoading(true);
    const { data } = await getContentItems({ status: filterStatus || null, limit: 40 });
    setItems(data);
    setLoading(false);
  }

  async function handleGenerate(e) {
    e.preventDefault();
    if (!form.topic.trim()) { setError("الموضوع مطلوب"); return; }
    setGenLoading(true);
    setError("");
    setResult(null);
    try {
      const memory = await buildMemoryContext();
      const brandMemory = {
        brand_voice:       memory.brand_voice?.tone,
        positioning:       memory.positioning?.tagline_ar,
        customer_persona:  memory.customer_persona?.primary,
      };
      const res = await generateContent({ ...form, brandMemory });
      setResult({ ...res, topic: form.topic, type: form.type, lang: form.lang });
    } catch (err) {
      setError(err.message);
    } finally {
      setGenLoading(false);
    }
  }

  async function saveResult() {
    if (!result) return;
    const content  = result.content || {};
    const textAr   = form.lang === "ar"   ? (JSON.stringify(content, null, 2)) : null;
    const textEn   = form.lang === "en"   ? (JSON.stringify(content, null, 2)) : null;
    const { data, error: saveErr } = await saveContentItem({
      type:       result.type,
      title:      result.topic,
      content_ar: textAr || (typeof content === "string" ? content : JSON.stringify(content)),
      content_en: textEn,
      platform:   CONTENT_TYPES.find(t => t.value === result.type)?.platform,
      status:     "draft",
      prompt_used: form.topic,
    });
    if (saveErr) { setError(saveErr.message); return; }
    setSuccess("تم حفظ المحتوى كمسودة");
    setItems(i => [data, ...i]);
  }

  async function handleStatusChange(id, status) {
    await updateContentItem(id, { status });
    setItems(i => i.map(x => x.id === id ? { ...x, status } : x));
  }

  async function handleDelete(id) {
    if (!window.confirm("حذف هذا المحتوى؟")) return;
    await deleteContentItem(id);
    setItems(i => i.filter(x => x.id !== id));
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", direction: "rtl", fontFamily: "'Cairo','Noto Naskh Arabic',sans-serif" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 32 }}>✍️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#1a1510" }}>محرك المحتوى</h1>
            <p style={{ margin: 0, fontSize: ".8rem", color: "#6f6a61" }}>{items.length} محتوى محفوظ</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {["generate", "library"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? G : "transparent",
              color:      tab === t ? "#fff" : G,
              border:     `1px solid ${G}`,
              borderRadius: 10, padding: "8px 18px", cursor: "pointer",
              fontFamily: "inherit", fontWeight: 700, fontSize: ".85rem",
            }}>
              {t === "generate" ? "✨ توليد محتوى" : "📚 مكتبة المحتوى"}
            </button>
          ))}
        </div>
      </div>

      {error   && <Alert type="error"   msg={error}   onClose={() => setError("")} />}
      {success && <Alert type="success" msg={success} onClose={() => setSuccess("")} />}

      {tab === "generate" ? (
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>

          {/* Form */}
          <div style={cardBase}>
            <h3 style={{ margin: "0 0 18px", color: G, fontSize: ".95rem", fontWeight: 700 }}>إعدادات التوليد</h3>
            <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <label style={labelStyle}>
                نوع المحتوى
                <select value={form.type} onChange={e => set("type", e.target.value)} style={inputStyle}>
                  {CONTENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </label>
              <label style={labelStyle}>
                اللغة
                <select value={form.lang} onChange={e => set("lang", e.target.value)} style={inputStyle}>
                  <option value="ar">🇸🇦 عربي</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="tr">🇹🇷 Türkçe</option>
                </select>
              </label>
              <label style={labelStyle}>
                النبرة
                <select value={form.tone} onChange={e => set("tone", e.target.value)} style={inputStyle}>
                  <option value="professional">احترافي</option>
                  <option value="friendly">ودي</option>
                  <option value="urgent">عاجل</option>
                  <option value="inspiring">ملهم</option>
                  <option value="educational">تعليمي</option>
                </select>
              </label>
              <label style={labelStyle}>
                الموضوع / الفكرة *
                <textarea
                  value={form.topic}
                  onChange={e => set("topic", e.target.value)}
                  placeholder="مثال: الإقامة الذهبية في الإمارات للمستثمرين"
                  rows={4}
                  required
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
                />
              </label>
              <button type="submit" disabled={genLoading} style={{
                background: genLoading ? "#ccc" : G, color: "#fff", border: "none",
                borderRadius: 12, padding: "12px", fontFamily: "inherit",
                fontWeight: 700, fontSize: ".9rem", cursor: genLoading ? "not-allowed" : "pointer",
              }}>
                {genLoading ? "⏳ جاري التوليد…" : "✨ ولّد المحتوى"}
              </button>
            </form>
          </div>

          {/* Result */}
          <div>
            {result ? (
              <ContentResult result={result} onSave={saveResult} />
            ) : (
              <div style={{ ...cardBase, textAlign: "center", padding: "60px 24px", color: "#aaa" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
                <p>اختر نوع المحتوى وأدخل الموضوع لتوليد محتوى جاهز</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <ContentLibrary
          items={items}
          loading={loading}
          filterStatus={filterStatus}
          onFilterStatus={setFilterStatus}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function ContentResult({ result, onSave }) {
  const content = result.content || {};
  const isJSON  = typeof content === "object" && !content.text;
  const text    = isJSON ? "" : (content.text || result.raw || "");

  return (
    <div style={{ ...cardBase, position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <span style={{ fontWeight: 700, color: "#1a1510" }}>
            {CONTENT_TYPES.find(t => t.value === result.type)?.label}
          </span>
          <span style={{ marginRight: 8, fontSize: ".75rem", color: "#aaa" }}>
            {result.tokens_used ? `${result.tokens_used} رمز` : ""}
          </span>
        </div>
        <button onClick={onSave} style={{
          background: "#2f8f5b18", color: "#2f8f5b", border: "1px solid #2f8f5b44",
          borderRadius: 10, padding: "7px 16px", cursor: "pointer",
          fontFamily: "inherit", fontWeight: 700, fontSize: ".82rem",
        }}>
          💾 حفظ كمسودة
        </button>
      </div>

      {isJSON ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Object.entries(content).map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: ".75rem", color: G, fontWeight: 700, marginBottom: 4, textTransform: "uppercase" }}>{k}</div>
              <div style={{ background: "#f7f1e6", borderRadius: 10, padding: "10px 14px", fontSize: ".88rem", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {typeof v === "string" ? v : Array.isArray(v) ? v.join("\n") : JSON.stringify(v, null, 2)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: "#f7f1e6", borderRadius: 10, padding: "14px", fontSize: ".9rem", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
          {text}
        </div>
      )}
    </div>
  );
}

function ContentLibrary({ items, loading, filterStatus, onFilterStatus, onStatusChange, onDelete }) {
  const statuses = ["", "idea", "draft", "review", "approved", "published"];
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {statuses.map(s => (
          <button key={s} onClick={() => onFilterStatus(s)} style={{
            background: filterStatus === s ? (STATUS_COLORS[s] || G) : "transparent",
            color:      filterStatus === s ? "#fff" : (STATUS_COLORS[s] || "#6f6a61"),
            border:     `1px solid ${STATUS_COLORS[s] || BORDER}`,
            borderRadius: 20, padding: "5px 16px", cursor: "pointer",
            fontFamily: "inherit", fontWeight: 600, fontSize: ".8rem",
          }}>
            {s ? STATUS_AR[s] : "الكل"}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>جاري التحميل…</div>
      ) : items.length === 0 ? (
        <div style={{ ...cardBase, textAlign: "center", padding: "48px 24px", color: "#aaa" }}>
          لا يوجد محتوى بعد — ولّد أول محتوى
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map(item => (
            <ContentItemCard key={item.id} item={item} onStatusChange={onStatusChange} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function ContentItemCard({ item, onStatusChange, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const typeLabel = CONTENT_TYPES.find(t => t.value === item.type)?.label || item.type;
  const text      = item.content_ar || item.content_en || "";

  return (
    <div style={{ ...cardBase, padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: ".92rem", color: "#1a1510", marginBottom: 4 }}>
            {item.title || item.type}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Tag text={typeLabel}             color="#6f6a61" />
            <Tag text={STATUS_AR[item.status] || item.status} color={STATUS_COLORS[item.status] || G} />
            {item.platform && <Tag text={item.platform} color="#3d6f9f" />}
          </div>
        </div>

        {/* Status quick-change */}
        <select
          value={item.status}
          onChange={e => onStatusChange(item.id, e.target.value)}
          onClick={e => e.stopPropagation()}
          style={{ padding: "5px 10px", border: `1px solid ${BORDER}`, borderRadius: 8, fontFamily: "inherit", fontSize: ".78rem", cursor: "pointer" }}
        >
          {Object.entries(STATUS_AR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        <button onClick={() => setExpanded(e => !e)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>
          {expanded ? "▲" : "▼"}
        </button>
        <button onClick={() => onDelete(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#b94a48", fontSize: 16 }}>🗑️</button>
      </div>

      {expanded && text && (
        <div style={{ marginTop: 14, background: "#f7f1e6", borderRadius: 10, padding: "12px 16px", fontSize: ".85rem", lineHeight: 1.8, whiteSpace: "pre-wrap", maxHeight: 300, overflowY: "auto" }}>
          {text.length > 500 ? text.slice(0, 500) + "…" : text}
        </div>
      )}
    </div>
  );
}

function Alert({ type, msg, onClose }) {
  const colors = { error: "#b94a48", success: "#2f8f5b" };
  const bgs    = { error: "#fff5f5", success: "#f0faf4" };
  return (
    <div style={{ background: bgs[type], border: `1px solid ${colors[type]}44`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", color: colors[type], fontSize: ".9rem" }}>
      <span>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: colors[type], fontSize: 16 }}>✕</button>
    </div>
  );
}

function Tag({ text, color }) {
  return (
    <span style={{ background: `${color}18`, color, padding: "2px 10px", borderRadius: 20, fontSize: ".72rem", fontWeight: 600 }}>
      {text}
    </span>
  );
}

const labelStyle = { display: "flex", flexDirection: "column", gap: 6, fontSize: ".85rem", color: "#3a3530", fontWeight: 600 };
const inputStyle = { padding: "9px 12px", border: `1px solid ${BORDER}`, borderRadius: 10, fontFamily: "inherit", fontSize: ".86rem", background: "#fffdf8" };
