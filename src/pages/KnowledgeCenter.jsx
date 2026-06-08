// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Knowledge Center
// مركز المعرفة — ثنائي اللغة مع نظام إدارة مقالات للأدمن والموظفين
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { setSEOMeta, setStructuredData, buildBreadcrumbSchema } from "../services/seoService";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const C = {
  gold: "#c9a84c", goldLight: "#f0d080", goldDark: "#8a6010",
  cream: "#faf7f2", warmWhite: "#fffcf7", beige: "#f4ede0",
  g100: "#ede5d8", g400: "#7a6b50", g600: "#3d3020", g800: "#1e1508",
  dark: "#16100a", darkMid: "#211608",
  red: "#e53935", green: "#2e7d32",
};

const CATEGORIES = {
  all:       { ar: "الكل",             en: "All",              icon: "🌐" },
  visa:      { ar: "أدلة التأشيرة",   en: "Visa Guides",       icon: "🛂" },
  residency: { ar: "الإقامة",          en: "Residency",         icon: "🏠" },
  company:   { ar: "تأسيس الشركات",   en: "Company Formation", icon: "🏢" },
  travel:    { ar: "السفر",            en: "Travel Guides",     icon: "✈️" },
};

const DEFAULT_ARTICLES = [
  { id: "1", category: "visa", featured: true, date: "2025-01-15", readTime: 5,
    titleAr: "كيفية الحصول على تأشيرة الإمارات للسوريين",
    titleEn: "How Syrians Can Get UAE Visa",
    excerptAr: "دليل شامل لمتطلبات تأشيرة الإمارات لحاملي الجواز السوري — الوثائق، الرسوم، ومدة المعالجة.",
    excerptEn: "Complete guide to UAE visa requirements for Syrian passport holders.",
    contentAr: "تأشيرة الإمارات للسوريين تتطلب جواز سفر ساري المفعول لمدة 6 أشهر على الأقل، صورة شخصية، كشف حساب بنكي، وتأمين سفر. يمكن التقديم عبر الموقع الرسمي لهيئة الهجرة أو عبر الوكلاء المعتمدين.",
    contentEn: "UAE visa for Syrians requires a valid passport (6+ months), photo, bank statement, and travel insurance. Applications can be submitted via the official immigration portal or through licensed agents.",
    slug: "/visa/syria-to-uae" },
  { id: "2", category: "visa", featured: true, date: "2025-01-10", readTime: 8,
    titleAr: "دليل تأشيرة شنغن للعرب",
    titleEn: "Schengen Visa Guide for Arabs",
    excerptAr: "كل ما تحتاج معرفته عن تأشيرة شنغن — الدول المشمولة، المستندات، ونصائح لزيادة فرص القبول.",
    excerptEn: "Everything you need to know about the Schengen visa for Arab travelers.",
    contentAr: "تأشيرة شنغن تتيح السفر لـ 27 دولة أوروبية. المستندات المطلوبة: جواز سفر، حجز طيران وفندق، كشف حساب بنكي، تأمين سفر يغطي 30,000 يورو.",
    contentEn: "Schengen visa allows travel to 27 European countries. Required documents: passport, flight and hotel booking, bank statement, travel insurance covering €30,000.",
    slug: "/visa/syria-to-germany" },
  { id: "3", category: "residency", featured: true, date: "2025-01-12", readTime: 10,
    titleAr: "البرتغال: الجنسية بالاستثمار — الدليل الكامل",
    titleEn: "Portugal Golden Visa — Complete Guide",
    excerptAr: "كيف تحصل على الإقامة البرتغالية وجواز السفر الأوروبي عبر الاستثمار.",
    excerptEn: "How to get Portuguese residency and EU passport through investment.",
    contentAr: "برنامج الإقامة البرتغالية بالاستثمار يتطلب استثماراً لا يقل عن 250,000 يورو في صناديق الاستثمار أو 500,000 يورو في العقارات. بعد 5 سنوات يمكن التقدم للجنسية.",
    contentEn: "Portugal's Golden Visa requires a minimum €250,000 investment in investment funds or €500,000 in real estate. After 5 years, you can apply for citizenship.",
    slug: null },
  { id: "4", category: "company", featured: true, date: "2025-01-14", readTime: 9,
    titleAr: "تأسيس شركة في الإمارات — خطوة بخطوة",
    titleEn: "UAE Company Setup — Step by Step",
    excerptAr: "كيفية تأسيس شركة في دبي والإمارات من البداية حتى الحصول على الترخيص.",
    excerptEn: "How to set up a company in Dubai and UAE from registration to license.",
    contentAr: "خطوات تأسيس شركة في الإمارات: اختيار نوع الشركة (مناطق حرة أو بر رئيسي)، تحديد النشاط التجاري، تسجيل الاسم التجاري، الحصول على الترخيص، فتح حساب بنكي.",
    contentEn: "Steps to set up a company in UAE: Choose company type (Free Zone or Mainland), define business activity, register trade name, obtain license, open bank account.",
    slug: null },
  { id: "5", category: "travel", date: "2025-01-11", readTime: 8,
    titleAr: "السياحة في تركيا — الدليل الشامل",
    titleEn: "Tourism in Turkey — Complete Guide",
    excerptAr: "أفضل المدن والمعالم السياحية في تركيا وأفضل أوقات الزيارة.",
    excerptEn: "Best cities and attractions in Turkey with timing tips.",
    contentAr: "تركيا وجهة سياحية رائعة تجمع بين الحضارة والطبيعة. أبرز الوجهات: إسطنبول، كابادوكيا، أنطاليا، طرابزون. أفضل وقت للزيارة: ربيع وخريف.",
    contentEn: "Turkey is a wonderful tourist destination blending civilization and nature. Top destinations: Istanbul, Cappadocia, Antalya, Trabzon. Best time: spring and autumn.",
    slug: null },
];

// ── ARTICLE CARD ─────────────────────────────────────────────
function ArticleCard({ article, lang, ff, onEdit, onDelete, canManage }) {
  const ar = lang === "ar";
  const title = ar ? article.titleAr : article.titleEn;
  const excerpt = ar ? article.excerptAr : article.excerptEn;
  const [showFull, setShowFull] = useState(false);
  const content = ar ? article.contentAr : article.contentEn;

  return (
    <article style={{
      background: "#fff", border: `1px solid rgba(201,168,76,.13)`,
      borderRadius: 12, overflow: "hidden", transition: "all .3s",
      display: "flex", flexDirection: "column", position: "relative",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,.08)"; e.currentTarget.style.borderColor = "rgba(201,168,76,.3)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(201,168,76,.13)"; }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${C.goldDark}, ${C.gold}, ${C.goldLight})` }} />

      {canManage && (
        <div style={{ position: "absolute", top: 14, [ar ? "left" : "right"]: 10, display: "flex", gap: 6, zIndex: 2 }}>
          <button onClick={() => onEdit(article)} style={{
            background: "rgba(201,168,76,.12)", border: "1px solid rgba(201,168,76,.3)",
            borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: ".7rem", color: C.gold, fontWeight: 700
          }}>✏️ {ar ? "تعديل" : "Edit"}</button>
          <button onClick={() => onDelete(article.id)} style={{
            background: "rgba(229,57,53,.08)", border: "1px solid rgba(229,57,53,.25)",
            borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: ".7rem", color: C.red, fontWeight: 700
          }}>🗑️ {ar ? "حذف" : "Delete"}</button>
        </div>
      )}

      <div style={{ padding: "22px 22px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
        {article.featured && (
          <span style={{ display: "inline-block", background: `rgba(201,168,76,.1)`, color: C.gold, fontSize: ".62rem", fontWeight: 700, letterSpacing: ".15em", padding: "3px 10px", borderRadius: 20, marginBottom: 10, border: `1px solid rgba(201,168,76,.22)`, width: "fit-content" }}>
            ⭐ {ar ? "مميز" : "Featured"}
          </span>
        )}
        <span style={{ fontSize: ".68rem", color: C.g400, marginBottom: 8, display: "block" }}>
          {CATEGORIES[article.category]?.icon} {ar ? CATEGORIES[article.category]?.ar : CATEGORIES[article.category]?.en}
        </span>
        <h3 style={{ color: C.g800, fontWeight: 700, fontSize: ".97rem", lineHeight: 1.5, marginBottom: 8, fontFamily: ff }}>
          {title}
        </h3>
        <p style={{ color: C.g400, fontSize: ".83rem", lineHeight: 1.75, marginBottom: 14, flex: 1 }}>{excerpt}</p>

        {showFull && content && (
          <div style={{ background: C.beige, borderRadius: 8, padding: "14px 16px", marginBottom: 14, fontSize: ".85rem", lineHeight: 1.9, color: C.g600, borderRight: ar ? `3px solid ${C.gold}` : "none", borderLeft: !ar ? `3px solid ${C.gold}` : "none" }}>
            {content}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ color: C.g400, fontSize: ".73rem" }}>
            📖 {article.readTime} {ar ? "دقائق" : "min"} · {article.date}
          </span>
          <button onClick={() => setShowFull(v => !v)} style={{
            background: "none", border: "none", cursor: "pointer", color: C.gold,
            fontSize: ".78rem", fontWeight: 700, padding: 0, fontFamily: ff,
          }}>
            {showFull ? (ar ? "← إخفاء" : "← Hide") : (ar ? "اقرأ المزيد ←" : "Read more →")}
          </button>
        </div>
      </div>
    </article>
  );
}

// ── ARTICLE EDITOR MODAL ──────────────────────────────────────
function ArticleEditor({ article, lang, ff, onSave, onClose }) {
  const ar = lang === "ar";
  const isNew = !article?.id;
  const [form, setForm] = useState({
    titleAr: "", titleEn: "", excerptAr: "", excerptEn: "",
    contentAr: "", contentEn: "", category: "visa",
    featured: false, readTime: 5, date: new Date().toISOString().split("T")[0],
    ...(article || {}),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.titleAr.trim() || !form.titleEn.trim()) {
      setError(ar ? "العنوان العربي والإنجليزي مطلوبان" : "Arabic and English titles are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError(e.message || "Error saving");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid rgba(201,168,76,.25)`,
    background: C.warmWhite, fontFamily: ff, fontSize: ".88rem", color: C.g800,
    outline: "none", boxSizing: "border-box", marginBottom: 14,
  };
  const labelStyle = { display: "block", color: C.g600, fontSize: ".78rem", fontWeight: 700, marginBottom: 5 };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 720,
        maxHeight: "90vh", overflow: "auto", boxShadow: "0 32px 80px rgba(0,0,0,.25)",
        fontFamily: ff, direction: ar ? "rtl" : "ltr",
      }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${C.dark}, ${C.darkMid})`, padding: "22px 28px", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ color: "#fff", fontWeight: 700, fontSize: "1.05rem", margin: 0 }}>
            {isNew ? (ar ? "✍️ مقال جديد" : "✍️ New Article") : (ar ? "✏️ تعديل المقال" : "✏️ Edit Article")}
          </h2>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", color: "#fff", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: "1.1rem" }}>×</button>
        </div>

        <div style={{ padding: "28px" }}>
          {/* Category + Featured */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 6 }}>
            <div>
              <label style={labelStyle}>{ar ? "التصنيف" : "Category"}</label>
              <select value={form.category} onChange={e => set("category", e.target.value)} style={{ ...inputStyle, marginBottom: 0 }}>
                {Object.entries(CATEGORIES).filter(([k]) => k !== "all").map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {ar ? v.ar : v.en}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <label style={{ ...labelStyle, marginBottom: 10 }}>{ar ? "تاريخ النشر" : "Publish Date"}</label>
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "10px 14px", background: C.beige, borderRadius: 8 }}>
            <input type="checkbox" id="featured" checked={form.featured} onChange={e => set("featured", e.target.checked)} style={{ width: 16, height: 16, accentColor: C.gold }} />
            <label htmlFor="featured" style={{ ...labelStyle, marginBottom: 0, cursor: "pointer" }}>
              ⭐ {ar ? "مقال مميز (يظهر في الأعلى)" : "Featured article (shown at top)"}
            </label>
            <div style={{ marginRight: "auto", marginLeft: "auto" }}>
              <input type="number" min={1} max={60} value={form.readTime} onChange={e => set("readTime", +e.target.value)}
                style={{ width: 50, padding: "4px 8px", borderRadius: 6, border: `1px solid rgba(201,168,76,.25)`, fontFamily: ff, textAlign: "center" }} />
              <span style={{ color: C.g400, fontSize: ".78rem", marginRight: 6, marginLeft: 6 }}>{ar ? "دقيقة قراءة" : "min read"}</span>
            </div>
          </div>

          {/* Arabic fields */}
          <div style={{ background: "rgba(201,168,76,.04)", border: "1px solid rgba(201,168,76,.12)", borderRadius: 10, padding: "16px", marginBottom: 14 }}>
            <div style={{ color: C.gold, fontSize: ".72rem", fontWeight: 700, letterSpacing: ".1em", marginBottom: 12 }}>🇸🇦 العربية</div>
            <label style={labelStyle}>{ar ? "العنوان بالعربي" : "Title (Arabic)"}</label>
            <input value={form.titleAr} onChange={e => set("titleAr", e.target.value)} placeholder="عنوان المقال بالعربي" style={{ ...inputStyle, direction: "rtl" }} />
            <label style={labelStyle}>{ar ? "المقتطف بالعربي" : "Excerpt (Arabic)"}</label>
            <textarea value={form.excerptAr} onChange={e => set("excerptAr", e.target.value)} placeholder="وصف مختصر بالعربي..." rows={2} style={{ ...inputStyle, resize: "vertical", direction: "rtl" }} />
            <label style={labelStyle}>{ar ? "المحتوى الكامل بالعربي" : "Full Content (Arabic)"}</label>
            <textarea value={form.contentAr} onChange={e => set("contentAr", e.target.value)} placeholder="المحتوى الكامل للمقال بالعربي..." rows={5} style={{ ...inputStyle, resize: "vertical", marginBottom: 0, direction: "rtl" }} />
          </div>

          {/* English fields */}
          <div style={{ background: "rgba(30,21,8,.03)", border: "1px solid rgba(201,168,76,.12)", borderRadius: 10, padding: "16px", marginBottom: 20 }}>
            <div style={{ color: C.g400, fontSize: ".72rem", fontWeight: 700, letterSpacing: ".1em", marginBottom: 12 }}>🇬🇧 English</div>
            <label style={labelStyle}>Title (English)</label>
            <input value={form.titleEn} onChange={e => set("titleEn", e.target.value)} placeholder="Article title in English" style={{ ...inputStyle, direction: "ltr" }} />
            <label style={labelStyle}>Excerpt (English)</label>
            <textarea value={form.excerptEn} onChange={e => set("excerptEn", e.target.value)} placeholder="Short description in English..." rows={2} style={{ ...inputStyle, resize: "vertical", direction: "ltr" }} />
            <label style={labelStyle}>Full Content (English)</label>
            <textarea value={form.contentEn} onChange={e => set("contentEn", e.target.value)} placeholder="Full article content in English..." rows={5} style={{ ...inputStyle, resize: "vertical", marginBottom: 0, direction: "ltr" }} />
          </div>

          {error && <div style={{ color: C.red, fontSize: ".83rem", marginBottom: 14, padding: "8px 12px", background: "rgba(229,57,53,.07)", borderRadius: 6 }}>⚠️ {error}</div>}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "10px 22px", background: "transparent", border: `1px solid rgba(201,168,76,.3)`, borderRadius: 8, cursor: "pointer", color: C.g600, fontFamily: ff, fontSize: ".88rem" }}>
              {ar ? "إلغاء" : "Cancel"}
            </button>
            <button onClick={handleSave} disabled={saving} style={{
              padding: "10px 28px", background: `linear-gradient(135deg, ${C.goldDark}, ${C.gold})`,
              border: "none", borderRadius: 8, cursor: saving ? "wait" : "pointer",
              color: C.dark, fontFamily: ff, fontSize: ".88rem", fontWeight: 700, opacity: saving ? .7 : 1,
            }}>
              {saving ? (ar ? "جاري الحفظ..." : "Saving...") : (ar ? "💾 حفظ المقال" : "💾 Save Article")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function KnowledgeCenter({ lang, ff, setPage }) {
  const ar = lang === "ar";
  const { role } = useAuth() || {};
  const canManage = role === "admin" || role === "manager" || role === "staff";

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState("");

  // ── Load articles ──
  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("knowledge_articles")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      setArticles(data && data.length > 0 ? data : DEFAULT_ARTICLES);
    } catch {
      // Fallback to defaults if table doesn't exist yet
      setArticles(DEFAULT_ARTICLES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadArticles(); }, [loadArticles]);

  // ── SEO ──
  setSEOMeta({
    title: ar ? "مركز المعرفة — أدلة التأشيرة والإقامة والسفر" : "Knowledge Center — Visa, Residency & Travel Guides",
    description: ar
      ? "أدلة شاملة ومحدّثة عن التأشيرات، الإقامة بالاستثمار، تأسيس الشركات، والسفر."
      : "Comprehensive guides on visas, residency, company formation, and travel.",
    lang, canonical: "/knowledge-center",
  });

  setStructuredData(buildBreadcrumbSchema([
    { name: ar ? "الرئيسية" : "Home", url: "/" },
    { name: ar ? "مركز المعرفة" : "Knowledge Center", url: "/knowledge-center" },
  ]));

  // ── Filter ──
  const filtered = articles.filter(a => {
    const catMatch = activeCategory === "all" || a.category === activeCategory;
    if (!catMatch) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.titleAr?.includes(searchQuery) || a.titleEn?.toLowerCase().includes(q) ||
      a.excerptAr?.includes(searchQuery) || a.excerptEn?.toLowerCase().includes(q)
    );
  });

  const featured = filtered.filter(a => a.featured);
  const regular = filtered.filter(a => !a.featured);

  // ── Save article ──
  async function handleSave(form) {
    const payload = { ...form };
    delete payload.id;

    if (form.id && !DEFAULT_ARTICLES.find(d => d.id === form.id)) {
      // Update in Supabase
      const { error } = await supabase.from("knowledge_articles").update(payload).eq("id", form.id);
      if (error) throw error;
    } else if (!form.id) {
      // Insert
      const { error } = await supabase.from("knowledge_articles").insert([payload]);
      if (error) throw error;
    } else {
      // Default article edited → treat as upsert in local state
      setArticles(prev => prev.map(a => a.id === form.id ? { ...form } : a));
      showToast(ar ? "✅ تم حفظ التعديل" : "✅ Changes saved");
      return;
    }

    await loadArticles();
    showToast(ar ? "✅ تم حفظ المقال بنجاح" : "✅ Article saved successfully");
  }

  async function handleDelete(id) {
    if (DEFAULT_ARTICLES.find(d => d.id === id)) {
      // Local only
      setArticles(prev => prev.filter(a => a.id !== id));
      setDeleteConfirm(null);
      showToast(ar ? "🗑️ تم الحذف" : "🗑️ Deleted");
      return;
    }
    const { error } = await supabase.from("knowledge_articles").delete().eq("id", id);
    if (!error) { await loadArticles(); }
    setDeleteConfirm(null);
    showToast(ar ? "🗑️ تم حذف المقال" : "🗑️ Article deleted");
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  return (
    <div style={{ fontFamily: ff, direction: ar ? "rtl" : "ltr", background: C.warmWhite, minHeight: "100vh" }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, [ar ? "right" : "left"]: "50%",
          transform: "translateX(50%)", background: C.dark, color: "#fff",
          padding: "12px 24px", borderRadius: 40, fontSize: ".88rem",
          zIndex: 99999, boxShadow: "0 8px 32px rgba(0,0,0,.3)",
          border: `1px solid rgba(201,168,76,.3)`,
        }}>{toast}</div>
      )}

      {/* ── Hero ── */}
      <section style={{
        background: `linear-gradient(150deg, ${C.dark} 0%, ${C.darkMid} 60%, #1a1005 100%)`,
        padding: "72px clamp(20px,6vw,80px) 56px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 30% 50%, rgba(201,168,76,.07) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,168,76,.12)", border: "1px solid rgba(201,168,76,.3)", borderRadius: 40, padding: "6px 20px", marginBottom: 20 }}>
            <span style={{ color: C.gold, fontSize: ".7rem", letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 700 }}>
              {ar ? "📚 مركز المعرفة" : "📚 Knowledge Center"}
            </span>
          </div>
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: "clamp(1.8rem,4vw,3rem)", marginBottom: 14, lineHeight: 1.2 }}>
            {ar ? "أدلتك الشاملة للسفر والتأشيرات" : "Your Complete Guide to Visas & Travel"}
          </h1>
          <p style={{ color: "rgba(255,255,255,.6)", fontSize: "1rem", lineHeight: 1.8, marginBottom: 32, maxWidth: 600, margin: "0 auto 32px" }}>
            {ar
              ? "مقالات متخصصة ومحدّثة من خبراء الكون العالمية في التأشيرات والإقامة وتأسيس الشركات والسفر."
              : "Expert articles from ALKOWN Global specialists on visas, residency, company formation, and travel."}
          </p>
          {/* Search */}
          <div style={{ position: "relative", maxWidth: 520, margin: "0 auto" }}>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={ar ? "ابحث في المقالات..." : "Search articles..."}
              style={{
                width: "100%", padding: "14px 50px 14px 20px", borderRadius: 8,
                border: "1px solid rgba(201,168,76,.3)", background: "rgba(255,255,255,.08)",
                color: "#fff", fontSize: ".95rem", outline: "none", fontFamily: ff,
                backdropFilter: "blur(10px)", boxSizing: "border-box",
              }}
            />
            <span style={{ position: "absolute", [ar ? "left" : "right"]: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.4)", fontSize: "1.1rem" }}>🔍</span>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px clamp(20px,4vw,48px)" }}>

        {/* ── Toolbar ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          {/* Category tabs */}
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button key={key} onClick={() => setActiveCategory(key)} style={{
              padding: "8px 16px", borderRadius: 40, border: `1.5px solid`,
              borderColor: activeCategory === key ? C.gold : "rgba(201,168,76,.2)",
              background: activeCategory === key ? `rgba(201,168,76,.1)` : "transparent",
              color: activeCategory === key ? C.gold : C.g400,
              cursor: "pointer", fontFamily: ff, fontSize: ".83rem", fontWeight: activeCategory === key ? 700 : 400,
              transition: "all .22s", display: "flex", alignItems: "center", gap: 5,
            }}>
              {cat.icon} {ar ? cat.ar : cat.en}
            </button>
          ))}

          <span style={{ color: C.g400, fontSize: ".78rem", marginInlineStart: "auto" }}>
            {filtered.length} {ar ? "مقال" : "articles"}
          </span>

          {/* Admin: Add Article button */}
          {canManage && (
            <button onClick={() => { setEditingArticle(null); setEditorOpen(true); }} style={{
              padding: "9px 20px", background: `linear-gradient(135deg, ${C.goldDark}, ${C.gold})`,
              border: "none", borderRadius: 8, cursor: "pointer", color: C.dark,
              fontFamily: ff, fontSize: ".85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 6,
            }}>
              ✍️ {ar ? "مقال جديد" : "New Article"}
            </button>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.g400 }}>
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
            {ar ? "جاري التحميل..." : "Loading..."}
          </div>
        )}

        {/* ── Featured ── */}
        {!loading && featured.length > 0 && activeCategory === "all" && !searchQuery && (
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              <div style={{ width: 4, height: 22, background: `linear-gradient(180deg, ${C.gold}, ${C.goldLight})`, borderRadius: 2 }} />
              <h2 style={{ color: C.g800, fontWeight: 700, fontSize: "1.05rem" }}>{ar ? "المقالات المميزة" : "Featured Articles"}</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 18 }}>
              {featured.map(a => (
                <ArticleCard key={a.id} article={a} lang={lang} ff={ff} canManage={canManage}
                  onEdit={art => { setEditingArticle(art); setEditorOpen(true); }}
                  onDelete={id => setDeleteConfirm(id)} />
              ))}
            </div>
          </div>
        )}

        {/* ── Regular ── */}
        {!loading && (
          <div>
            {activeCategory === "all" && !searchQuery && regular.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                <div style={{ width: 4, height: 22, background: `rgba(201,168,76,.35)`, borderRadius: 2 }} />
                <h2 style={{ color: C.g800, fontWeight: 700, fontSize: "1.05rem" }}>{ar ? "جميع المقالات" : "All Articles"}</h2>
              </div>
            )}
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: "3rem", marginBottom: 14 }}>📭</div>
                <p style={{ color: C.g400 }}>{ar ? "لا توجد مقالات في هذا التصنيف" : "No articles found"}</p>
                {canManage && (
                  <button onClick={() => { setEditingArticle(null); setEditorOpen(true); }} style={{
                    marginTop: 16, padding: "10px 24px", background: `linear-gradient(135deg, ${C.goldDark}, ${C.gold})`,
                    border: "none", borderRadius: 8, cursor: "pointer", color: C.dark, fontFamily: ff, fontWeight: 700,
                  }}>✍️ {ar ? "أضف أول مقال" : "Add first article"}</button>
                )}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
                {(searchQuery || activeCategory !== "all" ? filtered : regular).map(a => (
                  <ArticleCard key={a.id} article={a} lang={lang} ff={ff} canManage={canManage}
                    onEdit={art => { setEditingArticle(art); setEditorOpen(true); }}
                    onDelete={id => setDeleteConfirm(id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CTA ── */}
        <div style={{
          marginTop: 64, background: `linear-gradient(135deg, ${C.dark}, ${C.darkMid})`,
          borderRadius: 16, padding: "48px 40px", textAlign: "center", border: `1px solid rgba(201,168,76,.15)`,
        }}>
          <h2 style={{ color: "#fff", fontWeight: 700, fontSize: "1.4rem", marginBottom: 10 }}>
            {ar ? "هل تحتاج مساعدة شخصية؟" : "Need Personalized Help?"}
          </h2>
          <p style={{ color: "rgba(255,255,255,.5)", marginBottom: 24, fontSize: ".9rem" }}>
            {ar ? "فريقنا جاهز للإجابة على استفساراتك وإرشادك خطوة بخطوة." : "Our expert team is ready to guide you step by step."}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setPage("visa-center")} style={{
              padding: "12px 28px", background: `linear-gradient(135deg, ${C.goldDark}, ${C.gold})`,
              border: "none", borderRadius: 6, cursor: "pointer", color: C.dark, fontFamily: ff, fontWeight: 700, fontSize: ".9rem",
            }}>{ar ? "🔍 فحص التأشيرة" : "🔍 Check Visa"}</button>
            <button onClick={() => setPage("contact")} style={{
              padding: "12px 28px", background: "transparent", border: "1px solid rgba(201,168,76,.4)",
              borderRadius: 6, cursor: "pointer", color: C.gold, fontFamily: ff, fontWeight: 600, fontSize: ".9rem",
            }}>{ar ? "💬 تواصل معنا" : "💬 Contact Us"}</button>
          </div>
        </div>
      </div>

      {/* ── Editor Modal ── */}
      {editorOpen && (
        <ArticleEditor
          article={editingArticle}
          lang={lang} ff={ff}
          onSave={handleSave}
          onClose={() => { setEditorOpen(false); setEditingArticle(null); }}
        />
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "32px 36px", maxWidth: 380, textAlign: "center", fontFamily: ff }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🗑️</div>
            <h3 style={{ color: C.g800, fontWeight: 700, marginBottom: 10 }}>{ar ? "حذف المقال؟" : "Delete Article?"}</h3>
            <p style={{ color: C.g400, fontSize: ".88rem", marginBottom: 24 }}>{ar ? "لا يمكن التراجع عن هذا الإجراء." : "This action cannot be undone."}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: "9px 22px", background: "transparent", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer", fontFamily: ff }}>{ar ? "إلغاء" : "Cancel"}</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ padding: "9px 22px", background: C.red, border: "none", borderRadius: 8, cursor: "pointer", color: "#fff", fontFamily: ff, fontWeight: 700 }}>{ar ? "حذف" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
