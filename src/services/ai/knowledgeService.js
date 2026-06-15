// ═══════════════════════════════════════════════════════════════
// AI Knowledge Service — Phase 1
// CRUD for collections, documents, chunks
// ═══════════════════════════════════════════════════════════════

import { supabase } from "../../lib/supabase";

// ── Collections ────────────────────────────────────────────────

export async function getCollections() {
  const { data, error } = await supabase
    .from("ai_knowledge_collections")
    .select("*")
    .order("name");
  return { data: data || [], error };
}

export async function createCollection(payload) {
  const { data, error } = await supabase
    .from("ai_knowledge_collections")
    .insert(payload)
    .select()
    .single();
  return { data, error };
}

export async function deleteCollection(id) {
  return supabase.from("ai_knowledge_collections").delete().eq("id", id);
}

// ── Documents ──────────────────────────────────────────────────

export async function getDocuments(collectionId = null) {
  let q = supabase
    .from("ai_documents")
    .select("*, ai_knowledge_collections(name, icon, color)")
    .order("created_at", { ascending: false });
  if (collectionId) q = q.eq("collection_id", collectionId);
  const { data, error } = await q;
  return { data: data || [], error };
}

export async function getDocument(id) {
  const { data, error } = await supabase
    .from("ai_documents")
    .select("*, ai_knowledge_collections(name)")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function saveDocument(payload) {
  const { data, error } = await supabase
    .from("ai_documents")
    .insert(payload)
    .select()
    .single();
  return { data, error };
}

export async function updateDocumentStatus(id, status, chunkCount = 0) {
  const { data, error } = await supabase
    .from("ai_documents")
    .update({ status, chunk_count: chunkCount })
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deleteDocument(id) {
  return supabase.from("ai_documents").delete().eq("id", id);
}

// ── Chunks ─────────────────────────────────────────────────────

export async function saveChunks(chunks) {
  if (!chunks.length) return { data: [], error: null };
  const { data, error } = await supabase
    .from("ai_chunks")
    .insert(chunks)
    .select();
  return { data: data || [], error };
}

export async function getChunksByDocument(documentId) {
  const { data, error } = await supabase
    .from("ai_chunks")
    .select("id, content, chunk_index, token_count")
    .eq("document_id", documentId)
    .order("chunk_index");
  return { data: data || [], error };
}

// ── Text Processing (client-side chunking) ─────────────────────

export function extractAndChunkText(rawText, documentId, chunkSize = 500) {
  if (!rawText?.trim()) return [];

  // Split by paragraphs, then merge into ~500 token chunks
  const paragraphs = rawText.split(/\n\n+/).filter(p => p.trim().length > 20);
  const chunks = [];
  let current = "";
  let index = 0;

  for (const para of paragraphs) {
    const words = para.trim().split(/\s+/).length;
    if (current && (current.split(/\s+/).length + words) > chunkSize) {
      chunks.push({
        document_id: documentId,
        content:     current.trim(),
        chunk_index: index++,
        token_count: current.split(/\s+/).length,
      });
      current = para;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }
  }

  if (current.trim()) {
    chunks.push({
      document_id: documentId,
      content:     current.trim(),
      chunk_index: index,
      token_count: current.split(/\s+/).length,
    });
  }

  return chunks;
}

// ── Document ↔ Request Linking ────────────────────────────────

export async function linkDocumentToRequest(documentId, requestId, note = "") {
  const { data, error } = await supabase
    .from("ai_document_links")
    .upsert([{ document_id: documentId, request_id: requestId, note }], { onConflict: "document_id,request_id" })
    .select();
  return { data, error };
}

export async function getDocumentLinks(documentId) {
  const { data, error } = await supabase
    .from("ai_document_links")
    .select("*, requests(request_number, status, clients(full_name))")
    .eq("document_id", documentId);
  return { data: data || [], error };
}

export async function removeDocumentLink(documentId, requestId) {
  return supabase.from("ai_document_links").delete()
    .eq("document_id", documentId).eq("request_id", requestId);
}

// ── Version Tracking ───────────────────────────────────────────

export async function saveDocumentVersion(documentId, rawText, versionNote = "") {
  const { data, error } = await supabase
    .from("ai_document_versions")
    .insert([{ document_id: documentId, raw_text: rawText, version_note: versionNote }])
    .select()
    .single();
  return { data, error };
}

export async function getDocumentVersions(documentId) {
  const { data, error } = await supabase
    .from("ai_document_versions")
    .select("id, version_note, created_at, document_id")
    .eq("document_id", documentId)
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

// ── Citation Generator ─────────────────────────────────────────

export function buildCitation(doc, chunkIndex) {
  const date = doc.created_at ? new Date(doc.created_at).toLocaleDateString("ar-SA") : "";
  return `[${doc.title}${chunkIndex !== undefined ? ` — القطعة ${chunkIndex + 1}` : ""}، ${date}]`;
}

// ── Seed Visa Collections ──────────────────────────────────────
// Call once from admin to seed default visa knowledge collections

export async function seedVisaCollections() {
  const defaults = [
    { name: "سياسات التأشيرات",      icon: "🛂", color: "#3d6f9f", description: "متطلبات التأشيرة لكل دولة" },
    { name: "برامج الإقامة",          icon: "🏡", color: "#c9a84c", description: "شروط الإقامة والاستثمار" },
    { name: "برامج الجنسية",          icon: "🌍", color: "#2d9c5a", description: "التجنيس بالاستثمار والإقامة" },
    { name: "قوانين الهجرة",          icon: "📜", color: "#7c5cbf", description: "تشريعات وقوانين الهجرة الدولية" },
    { name: "اتفاقيات الجنسية المزدوجة", icon: "🤝", color: "#c0392b", description: "الدول التي تقبل الجنسية المزدوجة" },
    { name: "إجراءات الطلب",          icon: "📋", color: "#888",    description: "خطوات وإجراءات تقديم الطلبات" },
  ];

  const { data: existing } = await getCollections();
  const existingNames = (existing || []).map(c => c.name);

  const toInsert = defaults.filter(c => !existingNames.includes(c.name));
  if (!toInsert.length) return { inserted: 0 };

  const { data, error } = await supabase.from("ai_knowledge_collections").insert(toInsert).select();
  return { inserted: data?.length || 0, error };
}

// ── Stats ──────────────────────────────────────────────────────

export async function getKnowledgeStats() {
  const [colRes, docRes, chunkRes] = await Promise.all([
    supabase.from("ai_knowledge_collections").select("id", { count: "exact", head: true }),
    supabase.from("ai_documents").select("id, status", { count: "exact" }),
    supabase.from("ai_chunks").select("id", { count: "exact", head: true }),
  ]);

  const docs = docRes.data || [];
  return {
    collections: colRes.count || 0,
    documents:   docs.length,
    ready:       docs.filter(d => d.status === "ready").length,
    chunks:      chunkRes.count || 0,
  };
}
