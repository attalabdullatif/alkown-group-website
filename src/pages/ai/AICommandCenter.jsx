// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — AI Command Center (Phase 8)
// Main hub for all AI modules
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getKnowledgeStats } from "../../services/ai/knowledgeService";
import { supabase } from "../../lib/supabase";

// ── Design tokens (match existing crmUi) ─────────────────────
const G = "#c9a84c";
const BORDER = "rgba(201,168,76,.22)";

const cardBase = {
  background: "#fff",
  border: `1px solid ${BORDER}`,
  borderRadius: 16,
  padding: "24px 28px",
  boxShadow: "0 2px 12px rgba(0,0,0,.06)",
};

const MODULES = [
  {
    id:       "knowledge",
    icon:     "📚",
    title:    "قاعدة المعرفة",
    subtitle: "Knowledge Base",
    desc:     "رفع الوثائق، تنظيمها، وبناء مصدر المعلومات",
    color:    "#3d6f9f",
    path:     "/ai/knowledge",
    phase:    1,
  },
  {
    id:       "search",
    icon:     "🔍",
    title:    "البحث الذكي",
    subtitle: "Semantic Search & RAG",
    desc:     "اسأل أي سؤال واحصل على إجابة من المعرفة المخزنة",
    color:    "#7c3aed",
    path:     "/ai/search",
    phase:    2,
  },
  {
    id:       "agents",
    icon:     "🤖",
    title:    "مركز الوكلاء",
    subtitle: "Agent Hub",
    desc:     "وكلاء متخصصون: تأشيرة، إقامة، مبيعات، تسويق، محاسبة",
    color:    "#059669",
    path:     "/ai/agents",
    phase:    3,
  },
  {
    id:       "content",
    icon:     "✍️",
    title:    "محرك المحتوى",
    subtitle: "Content Engine",
    desc:     "توليد منشورات، مقالات، ريلز، بريد إلكتروني",
    color:    "#c9a84c",
    path:     "/ai/content",
    phase:    4,
  },
  {
    id:       "calendar",
    icon:     "📅",
    title:    "تقويم المحتوى",
    subtitle: "Content Calendar",
    desc:     "تخطيط ومتابعة المحتوى شهرياً وأسبوعياً",
    color:    "#0891b2",
    path:     "/ai/calendar",
    phase:    5,
  },
  {
    id:       "memory",
    icon:     "🧠",
    title:    "الذاكرة والهوية",
    subtitle: "Brand Memory",
    desc:     "الصوت التجاري، الأسلوب، شخصيات العملاء",
    color:    "#be185d",
    path:     "/ai/memory",
    phase:    7,
  },
];

export default function AICommandCenter() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ collections: 0, documents: 0, ready: 0, chunks: 0 });
  const [aiStats, setAiStats] = useState({ content: 0, queries: 0, sessions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    const [kbStats, contentRes, queryRes, sessionRes] = await Promise.all([
      getKnowledgeStats(),
      supabase.from("ai_content_items").select("id", { count: "exact", head: true }),
      supabase.from("ai_rag_queries").select("id", { count: "exact", head: true }),
      supabase.from("ai_agent_sessions").select("id", { count: "exact", head: true }),
    ]);
    setStats(kbStats);
    setAiStats({
      content:  contentRes.count || 0,
      queries:  queryRes.count  || 0,
      sessions: sessionRes.count || 0,
    });
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", direction: "rtl", fontFamily: "'Cairo','Noto Naskh Arabic',sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <span style={{ fontSize: 36 }}>🤖</span>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: 800, color: "#1a1510" }}>
              مركز الذكاء الاصطناعي
            </h1>
            <p style={{ margin: 0, color: "#6f6a61", fontSize: ".9rem" }}>AI Command Center — Alkown Global</p>
          </div>
        </div>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${G}, transparent)`, borderRadius: 2, width: 200 }} />
      </div>

      {/* KPI Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 36 }}>
        {[
          { label: "مجموعات المعرفة", value: loading ? "…" : stats.collections, icon: "📂", color: "#3d6f9f" },
          { label: "الوثائق المرفوعة", value: loading ? "…" : stats.documents,   icon: "📄", color: "#059669" },
          { label: "قطع المعرفة",      value: loading ? "…" : stats.chunks,       icon: "🧩", color: "#7c3aed" },
          { label: "محتوى مُولَّد",   value: loading ? "…" : aiStats.content,    icon: "✍️", color: G },
          { label: "استعلامات RAG",   value: loading ? "…" : aiStats.queries,    icon: "🔍", color: "#0891b2" },
          { label: "جلسات الوكلاء",   value: loading ? "…" : aiStats.sessions,   icon: "🤖", color: "#be185d" },
        ].map(kpi => (
          <div key={kpi.label} style={{ ...cardBase, textAlign: "center", padding: "20px 16px" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{kpi.icon}</div>
            <div style={{ fontSize: "1.7rem", fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
            <div style={{ fontSize: ".75rem", color: "#6f6a61", marginTop: 4 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Module Grid */}
      <h2 style={{ margin: "0 0 18px", fontSize: "1.1rem", fontWeight: 700, color: "#1a1510" }}>
        الوحدات المتاحة
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {MODULES.map(mod => (
          <ModuleCard key={mod.id} mod={mod} onClick={() => navigate(mod.path)} />
        ))}
      </div>

      {/* Quick Tips */}
      <div style={{ ...cardBase, marginTop: 32, background: "linear-gradient(135deg, #fffdf8, #fef9ee)" }}>
        <h3 style={{ margin: "0 0 16px", color: G, fontSize: "1rem", fontWeight: 700 }}>🚀 ابدأ من هنا</h3>
        <ol style={{ margin: 0, padding: "0 20px", lineHeight: 2, color: "#3a3530", fontSize: ".9rem" }}>
          <li>ارفع وثائقك في <strong>قاعدة المعرفة</strong> (PDF, DOCX, TXT)</li>
          <li>استخدم <strong>البحث الذكي</strong> لاستعلام فوري من وثائقك</li>
          <li>اختر <strong>وكيلاً متخصصاً</strong> للحصول على تحليل متعمق</li>
          <li>ولّد <strong>محتوى جاهزاً</strong> للنشر على الإنستغرام وغيره</li>
          <li>خطّط نشرك عبر <strong>تقويم المحتوى</strong></li>
        </ol>
      </div>
    </div>
  );
}

function ModuleCard({ mod, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...cardBase,
        cursor: "pointer",
        borderColor: hover ? mod.color : BORDER,
        transform: hover ? "translateY(-2px)" : "none",
        transition: "all .2s",
        boxShadow: hover ? `0 6px 24px ${mod.color}22` : cardBase.boxShadow,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: `${mod.color}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, flexShrink: 0,
        }}>
          {mod.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 800, fontSize: "1rem", color: "#1a1510" }}>{mod.title}</span>
            <span style={{
              fontSize: ".65rem", background: `${mod.color}18`, color: mod.color,
              padding: "2px 8px", borderRadius: 20, fontWeight: 700,
            }}>
              Phase {mod.phase}
            </span>
          </div>
          <div style={{ fontSize: ".72rem", color: "#aaa", marginBottom: 6 }}>{mod.subtitle}</div>
          <p style={{ margin: 0, fontSize: ".82rem", color: "#6f6a61", lineHeight: 1.6 }}>{mod.desc}</p>
        </div>
      </div>
      <div style={{
        marginTop: 14, fontSize: ".8rem", color: mod.color, fontWeight: 700,
        display: "flex", alignItems: "center", gap: 4,
      }}>
        فتح الوحدة ←
      </div>
    </div>
  );
}
