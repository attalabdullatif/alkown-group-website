// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Semantic Search & RAG (Phase 2)
// Ask questions, get answers with source citations
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from "react";
import { ragQuery, getRagHistory } from "../../services/ai/ragService";
import { getCollections } from "../../services/ai/knowledgeService";

const G = "#c9a84c";
const BORDER = "rgba(201,168,76,.22)";
const cardBase = { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 10px rgba(0,0,0,.05)" };

const SUGGESTED_QUERIES = [
  "ما متطلبات الإقامة الذهبية في البرتغال؟",
  "كيف أحصل على الجنسية القبرصية بالاستثمار؟",
  "ما الفرق بين تأشيرة شنغن وتأشيرة الإقامة؟",
  "ما هي أفضل الدول للحصول على الإقامة لرجال الأعمال؟",
];

export default function RAGSearch() {
  const [query,       setQuery]       = useState("");
  const [lang,        setLang]        = useState("ar");
  const [agentType,   setAgentType]   = useState("general");
  const [collectionId,setCollectionId]= useState("");
  const [collections, setCollections] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState("");
  const [history,     setHistory]     = useState([]);
  const textareaRef = useRef();

  useEffect(() => {
    getCollections().then(r => setCollections(r.data));
    getRagHistory(10).then(r => setHistory(r.data));
  }, []);

  async function handleSearch(e) {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await ragQuery({ query, lang, agentType, collectionId: collectionId || null });
      setResult({ ...res, query });
      setHistory(h => [{ query, answer: res.answer, created_at: new Date().toISOString(), confidence: res.confidence, chunks_used: res.chunks_used }, ...h.slice(0, 9)]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function applySuggestion(q) {
    setQuery(q);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", direction: "rtl", fontFamily: "'Cairo','Noto Naskh Arabic',sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 32 }}>🔍</span>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#1a1510" }}>البحث الذكي</h1>
            <p style={{ margin: 0, fontSize: ".8rem", color: "#6f6a61" }}>Semantic Search & RAG — اسأل واحصل على إجابة موثقة</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, alignItems: "start" }}>

        {/* Main Search Panel */}
        <div>
          {/* Search Form */}
          <div style={cardBase}>
            <form onSubmit={handleSearch}>
              <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                <select value={agentType} onChange={e => setAgentType(e.target.value)} style={selectStyle}>
                  <option value="general">🤖 عام</option>
                  <option value="visa">🛂 تأشيرة</option>
                  <option value="residency">🏠 إقامة</option>
                  <option value="citizenship">🌍 جنسية</option>
                  <option value="sales">💼 مبيعات</option>
                  <option value="marketing">📣 تسويق</option>
                  <option value="accounting">💰 محاسبة</option>
                </select>
                <select value={collectionId} onChange={e => setCollectionId(e.target.value)} style={selectStyle}>
                  <option value="">جميع المجموعات</option>
                  {collections.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name_ar}</option>
                  ))}
                </select>
                <select value={lang} onChange={e => setLang(e.target.value)} style={selectStyle}>
                  <option value="ar">🇸🇦 عربي</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="tr">🇹🇷 Türkçe</option>
                </select>
              </div>

              <textarea
                ref={textareaRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
                placeholder="اكتب سؤالك هنا… مثال: ما متطلبات الإقامة في البرتغال؟"
                rows={3}
                style={{
                  width: "100%", padding: "12px 14px", border: `1px solid ${BORDER}`,
                  borderRadius: 12, fontFamily: "inherit", fontSize: ".92rem",
                  resize: "vertical", lineHeight: 1.7, boxSizing: "border-box",
                  background: "#fffdf8",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                <span style={{ fontSize: ".75rem", color: "#aaa" }}>Enter للإرسال · Shift+Enter لسطر جديد</span>
                <button type="submit" disabled={loading || !query.trim()} style={{
                  background: loading ? "#ccc" : G, color: "#fff", border: "none",
                  borderRadius: 10, padding: "10px 24px", fontFamily: "inherit",
                  fontWeight: 700, fontSize: ".9rem", cursor: loading ? "not-allowed" : "pointer",
                }}>
                  {loading ? "⏳ جاري البحث…" : "🔍 ابحث"}
                </button>
              </div>
            </form>
          </div>

          {/* Suggestions */}
          {!result && !loading && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: ".8rem", color: "#aaa", marginBottom: 8 }}>اقتراحات:</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SUGGESTED_QUERIES.map(q => (
                  <button key={q} onClick={() => applySuggestion(q)} style={{
                    background: "#fffdf8", border: `1px solid ${BORDER}`, borderRadius: 20,
                    padding: "6px 14px", cursor: "pointer", fontFamily: "inherit",
                    fontSize: ".78rem", color: "#3a3530",
                  }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{ background: "#fff5f5", border: "1px solid #b94a4844", borderRadius: 10, padding: "12px 16px", marginTop: 16, color: "#b94a48" }}>
              {error}
            </div>
          )}

          {/* Result */}
          {result && <RAGResult result={result} />}
        </div>

        {/* Sidebar: History */}
        <div style={cardBase}>
          <div style={{ fontWeight: 700, fontSize: ".85rem", color: G, marginBottom: 14 }}>📜 الاستعلامات الأخيرة</div>
          {history.length === 0 ? (
            <p style={{ color: "#aaa", fontSize: ".8rem" }}>لا يوجد تاريخ بعد</p>
          ) : (
            history.map((h, i) => (
              <div
                key={i}
                onClick={() => setQuery(h.query)}
                style={{
                  padding: "10px 0", borderBottom: `1px solid ${BORDER}`,
                  cursor: "pointer", fontSize: ".8rem",
                }}
              >
                <div style={{ color: "#3a3530", fontWeight: 600, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {h.query}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {h.confidence && (
                    <span style={{ color: confColor(h.confidence), fontSize: ".7rem" }}>
                      {Math.round(h.confidence * 100)}% ثقة
                    </span>
                  )}
                  <span style={{ color: "#aaa", fontSize: ".7rem" }}>
                    {new Date(h.created_at).toLocaleDateString("ar-SA")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function RAGResult({ result }) {
  const conf = Math.round((result.confidence || 0) * 100);
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ ...cardBase, borderColor: G + "44" }}>
        {/* Meta bar */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{ background: `${confColor(result.confidence)}18`, color: confColor(result.confidence), padding: "3px 12px", borderRadius: 20, fontSize: ".75rem", fontWeight: 700 }}>
            {conf}% ثقة
          </span>
          <span style={{ background: "#3d6f9f18", color: "#3d6f9f", padding: "3px 12px", borderRadius: 20, fontSize: ".75rem" }}>
            {result.chunks_used || 0} مصادر
          </span>
          {result.latency_ms && (
            <span style={{ background: "#f0ece3", color: "#6f6a61", padding: "3px 12px", borderRadius: 20, fontSize: ".75rem" }}>
              {result.latency_ms}ms
            </span>
          )}
        </div>

        {/* Answer */}
        <div style={{ lineHeight: 1.9, fontSize: ".93rem", color: "#1a1510", whiteSpace: "pre-wrap" }}>
          {result.answer}
        </div>

        {/* Sources */}
        {result.sources?.length > 0 && (
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: ".8rem", fontWeight: 700, color: "#6f6a61", marginBottom: 8 }}>المصادر:</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {result.sources.map((s, i) => (
                <div key={i} style={{
                  background: "#f7f1e6", border: `1px solid ${BORDER}`, borderRadius: 8,
                  padding: "5px 12px", fontSize: ".75rem",
                }}>
                  <span style={{ color: G, fontWeight: 700 }}>[{i + 1}]</span>{" "}
                  <span style={{ color: "#3a3530" }}>{s.doc_title || s.collection}</span>{" "}
                  {s.similarity && <span style={{ color: "#aaa" }}>({s.similarity}%)</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function confColor(c) {
  if (c >= 0.8) return "#2f8f5b";
  if (c >= 0.6) return G;
  return "#b94a48";
}

const selectStyle = {
  padding: "8px 12px", border: `1px solid ${BORDER}`, borderRadius: 10,
  fontFamily: "inherit", fontSize: ".83rem", background: "#fffdf8", cursor: "pointer",
};
