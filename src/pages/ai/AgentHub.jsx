// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Agent Hub (Phase 3)
// Specialized AI agents with persistent sessions
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import { ragQuery, createAgentSession, getAgentSessions, appendMessage } from "../../services/ai/ragService";

const G = "#c9a84c";
const BORDER = "rgba(201,168,76,.22)";
const cardBase = { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 10px rgba(0,0,0,.05)" };

const AGENTS = [
  { type: "visa",        icon: "🛂", label: "وكيل التأشيرات",    desc: "بحث ومتطلبات التأشيرات وأهلية التقديم",          color: "#3d6f9f" },
  { type: "residency",   icon: "🏠", label: "وكيل الإقامة",      desc: "برامج الإقامة الذهبية، مقارنة الدول",              color: "#2f8f5b" },
  { type: "citizenship", icon: "🌍", label: "وكيل الجنسية",      desc: "الجنسية بالاستثمار، تصنيف جوازات السفر",          color: "#7c3aed" },
  { type: "sales",       icon: "💼", label: "وكيل المبيعات",     desc: "تأهيل العملاء، نصوص المبيعات، متابعة العملاء",    color: G },
  { type: "marketing",   icon: "📣", label: "وكيل التسويق",      desc: "أفكار المحتوى، هوكس الفيديو، استراتيجية التسويق", color: "#c28a25" },
  { type: "accounting",  icon: "💰", label: "وكيل المحاسبة",     desc: "تحليل الفواتير، الإيرادات، أرصدة العملاء",        color: "#059669" },
];

export default function AgentHub() {
  const [selected,  setSelected]  = useState(null);
  const [session,   setSession]   = useState(null);
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [sessions,  setSessions]  = useState([]);
  const [lang,      setLang]      = useState("ar");
  const bottomRef = useRef();

  useEffect(() => {
    if (selected) loadSessions(selected.type);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadSessions(type) {
    const { data } = await getAgentSessions(type);
    setSessions(data);
  }

  async function startSession(agent) {
    setSelected(agent);
    setMessages([{
      role: "assistant",
      content: `مرحباً! أنا ${agent.label} — ${agent.desc}.\n\nكيف يمكنني مساعدتك اليوم؟`,
    }]);
    setSession(null);
    setInput("");
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Create session if first message
      let sess = session;
      if (!sess) {
        const { data } = await createAgentSession({ agentType: selected.type, title: input.slice(0, 60) });
        sess = data;
        setSession(sess);
      }

      // RAG query with agent context
      const res = await ragQuery({ query: input, lang, agentType: selected.type });
      const assistantMsg = {
        role:     "assistant",
        content:  res.answer,
        sources:  res.sources,
        confidence: res.confidence,
        chunks_used: res.chunks_used,
      };

      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);

      // Persist to DB
      if (sess) {
        await appendMessage(sess.id, finalMessages.map(m => ({
          role:    m.role,
          content: m.content,
          sources: m.sources,
        })));
      }

    } catch (err) {
      setMessages(m => [...m, { role: "assistant", content: `خطأ: ${err.message}`, error: true }]);
    } finally {
      setLoading(false);
    }
  }

  if (!selected) {
    return <AgentGrid agents={AGENTS} onSelect={startSession} />;
  }

  const agent = selected;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", direction: "rtl", fontFamily: "'Cairo','Noto Naskh Arabic',sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => setSelected(null)} style={{
          background: "none", border: `1px solid ${BORDER}`, borderRadius: 10,
          padding: "7px 14px", cursor: "pointer", fontFamily: "inherit", fontSize: ".82rem", color: "#6f6a61",
        }}>
          ← الوكلاء
        </button>
        <div style={{
          width: 44, height: 44, borderRadius: 14, background: `${agent.color}18`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
        }}>
          {agent.icon}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#1a1510" }}>{agent.label}</div>
          <div style={{ fontSize: ".75rem", color: "#aaa" }}>{agent.desc}</div>
        </div>
        <div style={{ marginRight: "auto" }}>
          <select value={lang} onChange={e => setLang(e.target.value)} style={{
            padding: "7px 12px", border: `1px solid ${BORDER}`, borderRadius: 10,
            fontFamily: "inherit", fontSize: ".82rem", background: "#fffdf8",
          }}>
            <option value="ar">🇸🇦 عربي</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>
      </div>

      {/* Chat Window */}
      <div style={{ ...cardBase, height: 480, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} agent={agent} />
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: `${agent.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {agent.icon}
              </div>
              <div style={{ background: "#f7f1e6", borderRadius: "4px 14px 14px 14px", padding: "12px 16px", color: "#aaa", fontSize: ".85rem" }}>
                يكتب…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ borderTop: `1px solid ${BORDER}`, padding: "12px 20px", display: "flex", gap: 10 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={`اكتب رسالتك لـ${agent.label}…`}
            disabled={loading}
            style={{
              flex: 1, padding: "10px 14px", border: `1px solid ${BORDER}`,
              borderRadius: 10, fontFamily: "inherit", fontSize: ".88rem",
              background: "#fffdf8", outline: "none",
            }}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
            background: loading ? "#ccc" : agent.color, color: "#fff", border: "none",
            borderRadius: 10, padding: "10px 20px", fontFamily: "inherit",
            fontWeight: 700, fontSize: ".85rem", cursor: loading ? "not-allowed" : "pointer",
          }}>
            إرسال
          </button>
        </div>
      </div>
    </div>
  );
}

function AgentGrid({ agents, onSelect }) {
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", direction: "rtl", fontFamily: "'Cairo','Noto Naskh Arabic',sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 32 }}>🤖</span>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#1a1510" }}>مركز الوكلاء</h1>
            <p style={{ margin: 0, fontSize: ".8rem", color: "#6f6a61" }}>اختر وكيلاً متخصصاً للمحادثة</p>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {agents.map(agent => (
          <AgentCard key={agent.type} agent={agent} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function AgentCard({ agent, onSelect }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={() => onSelect(agent)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#fff", border: `1px solid ${hover ? agent.color : BORDER}`,
        borderRadius: 16, padding: "24px", cursor: "pointer",
        transform: hover ? "translateY(-2px)" : "none",
        transition: "all .2s",
        boxShadow: hover ? `0 6px 24px ${agent.color}22` : "0 2px 10px rgba(0,0,0,.05)",
      }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 16, background: `${agent.color}18`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, marginBottom: 14,
      }}>
        {agent.icon}
      </div>
      <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#1a1510", marginBottom: 6 }}>{agent.label}</div>
      <p style={{ margin: "0 0 16px", fontSize: ".83rem", color: "#6f6a61", lineHeight: 1.6 }}>{agent.desc}</p>
      <div style={{ fontSize: ".8rem", color: agent.color, fontWeight: 700 }}>ابدأ محادثة ←</div>
    </div>
  );
}

function ChatBubble({ msg, agent }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: isUser ? "row-reverse" : "row" }}>
      {!isUser && (
        <div style={{
          width: 36, height: 36, borderRadius: 12, background: `${agent.color}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0,
        }}>
          {agent.icon}
        </div>
      )}
      <div style={{ maxWidth: "78%" }}>
        <div style={{
          background:    isUser ? agent.color : "#f7f1e6",
          color:         isUser ? "#fff" : "#1a1510",
          borderRadius:  isUser ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
          padding:       "12px 16px",
          fontSize:      ".88rem",
          lineHeight:    1.8,
          whiteSpace:    "pre-wrap",
          border:        msg.error ? "1px solid #b94a4844" : "none",
        }}>
          {msg.content}
        </div>
        {msg.sources?.length > 0 && (
          <div style={{ marginTop: 6, display: "flex", gap: 5, flexWrap: "wrap" }}>
            {msg.sources.slice(0, 3).map((s, i) => (
              <span key={i} style={{
                background: "#f7f1e6", border: `1px solid ${BORDER}`,
                borderRadius: 6, padding: "2px 8px", fontSize: ".68rem", color: "#6f6a61",
              }}>
                {s.doc_title || s.collection}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
