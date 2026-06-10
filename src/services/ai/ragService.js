// ═══════════════════════════════════════════════════════════════
// AI RAG Service — Phase 2
// Client-side interface for the RAG Netlify function
// ═══════════════════════════════════════════════════════════════

import { supabase } from "../../lib/supabase";

const API_BASE = "/api";

// ── Main RAG query ─────────────────────────────────────────────

export async function ragQuery({ query, lang = "ar", agentType = "general", collectionId = null }) {
  const res = await fetch(`${API_BASE}/ai-rag`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ query, lang, agentType, collectionId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `RAG request failed: ${res.status}`);
  }

  return res.json();
}

// ── Query history ──────────────────────────────────────────────

export async function getRagHistory(limit = 20) {
  const { data, error } = await supabase
    .from("ai_rag_queries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return { data: data || [], error };
}

// ── Agent sessions ─────────────────────────────────────────────

export async function createAgentSession({ agentType, title }) {
  const { data, error } = await supabase
    .from("ai_agent_sessions")
    .insert({ agent_type: agentType, title, messages: [] })
    .select()
    .single();
  return { data, error };
}

export async function getAgentSessions(agentType = null) {
  let q = supabase
    .from("ai_agent_sessions")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(30);
  if (agentType) q = q.eq("agent_type", agentType);
  const { data, error } = await q;
  return { data: data || [], error };
}

export async function appendMessage(sessionId, messages) {
  const { data, error } = await supabase
    .from("ai_agent_sessions")
    .update({ messages, updated_at: new Date().toISOString() })
    .eq("id", sessionId)
    .select()
    .single();
  return { data, error };
}
