// ═══════════════════════════════════════════════════════════════
// AI Content Service — Phases 4 & 5
// Content generation + calendar management
// ═══════════════════════════════════════════════════════════════

import { supabase } from "../../lib/supabase";

const API_BASE = process.env.NODE_ENV === "development"
  ? "http://localhost:8888/.netlify/functions"
  : "/.netlify/functions";

// ── Generation ─────────────────────────────────────────────────

export async function generateContent({ type, topic, lang, platform, tone, sources = [], brandMemory = {} }) {
  const res = await fetch(`${API_BASE}/ai-content`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ type, topic, lang, platform, tone, sources, brandMemory }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Content generation failed: ${res.status}`);
  }

  return res.json();
}

// ── Content Items CRUD ─────────────────────────────────────────

export async function getContentItems({ status = null, type = null, limit = 50 } = {}) {
  let q = supabase
    .from("ai_content_items")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (status) q = q.eq("status", status);
  if (type)   q = q.eq("type", type);
  const { data, error } = await q;
  return { data: data || [], error };
}

export async function saveContentItem(payload) {
  const { data, error } = await supabase
    .from("ai_content_items")
    .insert({ ...payload, updated_at: new Date().toISOString() })
    .select()
    .single();
  return { data, error };
}

export async function updateContentItem(id, updates) {
  const { data, error } = await supabase
    .from("ai_content_items")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deleteContentItem(id) {
  return supabase.from("ai_content_items").delete().eq("id", id);
}

// ── Calendar ───────────────────────────────────────────────────

export async function getCalendarItems(year, month) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const end   = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const { data, error } = await supabase
    .from("ai_content_items")
    .select("*")
    .gte("calendar_date", start)
    .lt("calendar_date", end)
    .order("calendar_date");
  return { data: data || [], error };
}

export async function scheduleContent(contentItemId, date) {
  const { data, error } = await supabase
    .from("ai_content_items")
    .update({ calendar_date: date, status: "review" })
    .eq("id", contentItemId)
    .select()
    .single();
  return { data, error };
}
