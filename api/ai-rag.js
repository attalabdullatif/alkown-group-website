// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — AI RAG — Vercel API Route
// /api/ai-rag
// POST { query, lang, agentType, collectionId }
// ═══════════════════════════════════════════════════════════════

const { createClient } = require("@supabase/supabase-js");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  const OPENAI_KEY    = process.env.OPENAI_API_KEY;
  const SUPABASE_URL  = process.env.REACT_APP_SUPABASE_URL;
  const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!ANTHROPIC_KEY) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });

  const t0 = Date.now();

  try {
    const { query, lang = "ar", agentType = "general", collectionId = null } = req.body || {};

    if (!query?.trim()) return res.status(400).json({ error: "query is required" });

    // ── Step 1: Vector search (if OpenAI available) ───────────
    let chunks = [];

    if (OPENAI_KEY && SUPABASE_URL && SUPABASE_KEY) {
      const embedding = await embedText(query, OPENAI_KEY);
      if (embedding) {
        const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data } = await sb.rpc("ai_match_chunks", {
          query_embedding:      embedding,
          match_threshold:      0.65,
          match_count:          6,
          filter_collection_id: collectionId || null,
        });
        chunks = data || [];
      }
    } else if (SUPABASE_URL && SUPABASE_KEY) {
      // Keyword fallback
      const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data } = await sb
        .from("ai_chunks")
        .select("id, document_id, content, ai_documents(title, ai_knowledge_collections(name))")
        .ilike("content", `%${query.slice(0, 50)}%`)
        .limit(5);
      chunks = (data || []).map(c => ({
        id: c.id,
        document_id: c.document_id,
        content: c.content,
        similarity: 0.7,
        doc_title: c.ai_documents?.title,
        collection: c.ai_documents?.ai_knowledge_collections?.name,
      }));
    }

    // ── Step 2: Build context ──────────────────────────────────
    const context = chunks.length
      ? chunks.map((c, i) =>
          `[${i + 1}] من: ${c.collection || "قاعدة المعرفة"} — ${c.doc_title || ""}\n${c.content}`
        ).join("\n\n---\n\n")
      : "";

    const systemPrompt = buildSystemPrompt(agentType, lang);

    const userMessage = context
      ? (lang === "ar"
          ? `السياق من قاعدة المعرفة:\n\n${context}\n\n---\n\nسؤال المستخدم: ${query}`
          : `Context from knowledge base:\n\n${context}\n\n---\n\nUser question: ${query}`)
      : query;

    // ── Step 3: Claude ─────────────────────────────────────────
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key":         ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "content-type":      "application/json",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-6",
        max_tokens: 1500,
        system:     systemPrompt,
        messages:   [{ role: "user", content: userMessage }],
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.json().catch(() => ({}));
      throw new Error(`Claude API error: ${JSON.stringify(err)}`);
    }

    const claudeData = await claudeRes.json();
    const answer     = claudeData.content?.[0]?.text || "";
    const tokensUsed = (claudeData.usage?.input_tokens || 0) + (claudeData.usage?.output_tokens || 0);

    const avgSimilarity = chunks.length
      ? chunks.reduce((s, c) => s + (c.similarity || 0), 0) / chunks.length : 0;
    const confidence = chunks.length ? Math.min(0.99, avgSimilarity * 0.7 + 0.3) : 0.5;

    const sources = chunks.map(c => ({
      doc_title:  c.doc_title,
      collection: c.collection,
      similarity: Math.round((c.similarity || 0) * 100),
    }));

    const latencyMs = Date.now() - t0;

    // ── Step 4: Log ────────────────────────────────────────────
    if (SUPABASE_URL && SUPABASE_KEY) {
      const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
      await sb.from("ai_rag_queries").insert({
        query, answer, sources, confidence,
        agent_type: agentType, lang,
        chunks_used: chunks.length, tokens_used: tokensUsed, latency_ms: latencyMs,
      });
    }

    return res.status(200).json({ answer, sources, confidence, chunks_used: chunks.length, latency_ms: latencyMs });

  } catch (err) {
    console.error("[AI RAG]", err.message);
    return res.status(500).json({ error: err.message });
  }
};

async function embedText(text, openaiKey) {
  try {
    const r = await fetch("https://api.openai.com/v1/embeddings", {
      method:  "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body:    JSON.stringify({ model: "text-embedding-3-small", input: text.slice(0, 8000) }),
    });
    const d = await r.json();
    return d.data?.[0]?.embedding || null;
  } catch { return null; }
}

function buildSystemPrompt(agentType, lang) {
  const ar = lang === "ar";
  const base = ar
    ? `أنت مساعد ذكي لشركة الكون العالمية — متخصصة في الإقامة والجنسية والتأشيرات وتأسيس الشركات.\n\nقواعد:\n- أجب بالعربية دائماً إلا إذا طُلب غير ذلك\n- كن موجزاً ودقيقاً ومفيداً\n- اذكر مصادرك من قاعدة المعرفة\n- لا تقدم مشورة قانونية\n- اقترح حجز استشارة للحالات المعقدة`
    : `You are an AI assistant for Alkown Global — specializing in residency, citizenship, visas and company formation.\n\nRules:\n- Be concise, accurate, and helpful\n- Cite sources from the knowledge base\n- No legal advice — informational only\n- Suggest booking a consultation for complex cases`;

  const ctx = {
    visa:        ar ? "\nتخصصك: متطلبات التأشيرات وإجراءات السفارات"    : "\nSpecialty: Visa requirements and embassy procedures",
    residency:   ar ? "\nتخصصك: برامج الإقامة الذهبية ومقارنة الدول"    : "\nSpecialty: Golden visa programs and country comparisons",
    citizenship: ar ? "\nتخصصك: الجنسية بالاستثمار وتصنيف جوازات السفر" : "\nSpecialty: Citizenship by investment and passport rankings",
    sales:       ar ? "\nتخصصك: تأهيل العملاء ونصوص المبيعات"           : "\nSpecialty: Lead qualification and sales scripts",
    marketing:   ar ? "\nتخصصك: أفكار المحتوى واستراتيجية التسويق"       : "\nSpecialty: Content ideas and marketing strategy",
    accounting:  ar ? "\nتخصصك: تحليل الفواتير والإيرادات"              : "\nSpecialty: Invoice analysis and revenue",
  };

  return base + (ctx[agentType] || "");
}
