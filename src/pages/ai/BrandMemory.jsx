// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Brand Memory (Phase 7)
// Store brand voice, writing style, customer personas
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { getMemory, upsertMemory, deleteMemory, MEMORY_CATEGORIES } from "../../services/ai/memoryService";

const G = "#c9a84c";
const BORDER = "rgba(201,168,76,.22)";
const cardBase = { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 10px rgba(0,0,0,.05)" };

export default function BrandMemory() {
  const [items,       setItems]       = useState([]);
  const [activeCategory, setActiveCategory] = useState(MEMORY_CATEGORIES[0].key);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");
  const [form,        setForm]        = useState({ key: "", value: "", lang: "ar" });
  const [editId,      setEditId]      = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await getMemory();
    if (error) setError(error.message);
    setItems(data);
    setLoading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.key.trim() || !form.value.trim()) { setError("المفتاح والقيمة مطلوبان"); return; }
    setSaving(true);
    setError("");
    const { error } = await upsertMemory({ category: activeCategory, key: form.key.trim(), value: form.value.trim(), lang: form.lang });
    if (error) { setError(error.message); setSaving(false); return; }
    setSuccess("تم الحفظ");
    setForm({ key: "", value: "", lang: "ar" });
    setEditId(null);
    await load();
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("حذف هذا العنصر من الذاكرة؟")) return;
    await deleteMemory(id);
    setItems(i => i.filter(x => x.id !== id));
  }

  function startEdit(item) {
    setForm({ key: item.key, value: item.value, lang: item.lang });
    setEditId(item.id);
    setActiveCategory(item.category);
  }

  const filtered = items.filter(i => i.category === activeCategory);
  const activeCat = MEMORY_CATEGORIES.find(c => c.key === activeCategory);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", direction: "rtl", fontFamily: "'Cairo','Noto Naskh Arabic',sans-serif" }}>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <span style={{ fontSize: 32 }}>🧠</span>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#1a1510" }}>الذاكرة والهوية</h1>
          <p style={{ margin: 0, fontSize: ".8rem", color: "#6f6a61" }}>Brand Memory — الصوت التجاري وشخصيات العملاء</p>
        </div>
      </div>

      {error   && <Alert type="error"   msg={error}   onClose={() => setError("")}   />}
      {success && <Alert type="success" msg={success} onClose={() => setSuccess("")} />}

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, alignItems: "start" }}>

        {/* Category Sidebar */}
        <div style={cardBase}>
          <div style={{ fontWeight: 700, fontSize: ".85rem", color: G, marginBottom: 12 }}>الفئات</div>
          {MEMORY_CATEGORIES.map(cat => {
            const count = items.filter(i => i.category === cat.key).length;
            return (
              <div
                key={cat.key}
                onClick={() => { setActiveCategory(cat.key); setEditId(null); setForm({ key: "", value: "", lang: "ar" }); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "9px 10px", borderRadius: 10, cursor: "pointer",
                  background: activeCategory === cat.key ? `${G}18` : "transparent",
                  color: activeCategory === cat.key ? G : "#3a3530",
                  fontWeight: activeCategory === cat.key ? 700 : 500,
                  fontSize: ".83rem", marginBottom: 3,
                }}
              >
                <span>{cat.icon} {cat.label}</span>
                <span style={{ background: "#f0ece3", padding: "1px 7px", borderRadius: 20, fontSize: ".7rem", color: "#6f6a61" }}>{count}</span>
              </div>
            );
          })}
        </div>

        {/* Main Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Add/Edit Form */}
          <div style={cardBase}>
            <h3 style={{ margin: "0 0 16px", color: G, fontSize: ".95rem", fontWeight: 700 }}>
              {editId ? "✏️ تعديل عنصر" : `➕ إضافة إلى: ${activeCat?.icon} ${activeCat?.label}`}
            </h3>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 12 }}>
                <label style={labelStyle}>
                  المفتاح (Key)
                  <input
                    value={form.key}
                    onChange={e => setForm(f => ({ ...f, key: e.target.value }))}
                    placeholder="مثال: tone, tagline, target_audience"
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  اللغة
                  <select value={form.lang} onChange={e => setForm(f => ({ ...f, lang: e.target.value }))} style={inputStyle}>
                    <option value="ar">عربي</option>
                    <option value="en">English</option>
                    <option value="tr">Türkçe</option>
                  </select>
                </label>
              </div>
              <label style={labelStyle}>
                القيمة
                <textarea
                  value={form.value}
                  onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                  placeholder="اكتب القيمة هنا…"
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" disabled={saving} style={{
                  background: saving ? "#ccc" : G, color: "#fff", border: "none",
                  borderRadius: 10, padding: "10px 20px", fontFamily: "inherit",
                  fontWeight: 700, fontSize: ".85rem", cursor: saving ? "not-allowed" : "pointer",
                }}>
                  {saving ? "جاري الحفظ…" : editId ? "💾 تحديث" : "➕ إضافة"}
                </button>
                {editId && (
                  <button type="button" onClick={() => { setEditId(null); setForm({ key: "", value: "", lang: "ar" }); }} style={{
                    background: "transparent", color: "#6f6a61", border: `1px solid ${BORDER}`,
                    borderRadius: 10, padding: "10px 16px", fontFamily: "inherit",
                    fontWeight: 600, fontSize: ".85rem", cursor: "pointer",
                  }}>
                    إلغاء
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Items list */}
          {loading ? (
            <div style={{ ...cardBase, textAlign: "center", padding: 32, color: "#aaa" }}>جاري التحميل…</div>
          ) : filtered.length === 0 ? (
            <div style={{ ...cardBase, textAlign: "center", padding: 32, color: "#aaa" }}>
              لا توجد ذكريات في هذه الفئة بعد
            </div>
          ) : (
            filtered.map(item => (
              <MemoryCard key={item.id} item={item} onEdit={startEdit} onDelete={handleDelete} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function MemoryCard({ item, onEdit, onDelete }) {
  const langFlag = { ar: "🇸🇦", en: "🇬🇧", tr: "🇹🇷" }[item.lang] || "";
  return (
    <div style={{ ...cardBase, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <span style={{ fontWeight: 700, fontSize: ".85rem", color: G }}>{item.key}</span>
          <span style={{ fontSize: ".7rem", color: "#aaa" }}>{langFlag}</span>
        </div>
        <p style={{ margin: 0, fontSize: ".85rem", color: "#3a3530", lineHeight: 1.7 }}>{item.value}</p>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button onClick={() => onEdit(item)} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: ".75rem", color: "#3d6f9f" }}>✏️</button>
        <button onClick={() => onDelete(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#b94a48", fontSize: 15 }}>🗑️</button>
      </div>
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

const labelStyle = { display: "flex", flexDirection: "column", gap: 5, fontSize: ".85rem", color: "#3a3530", fontWeight: 600 };
const inputStyle = { padding: "9px 12px", border: `1px solid ${BORDER}`, borderRadius: 10, fontFamily: "inherit", fontSize: ".86rem", background: "#fffdf8" };
