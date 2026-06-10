// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — AI RAG Function
// Phases 1+2: Embed query → Vector search → Claude generation
// POST /api/ai-rag  { query, lang, agentType, collectionId }
// ═══════════════════════════════════════════════════════════════

const { createClient } = require("@supabase/supabase-js");

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (event.httpMethod !== "POST")   return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || process.env.REACT_APP_ANTHROPIC_KEY;
  const OPENAI_KEY    = process.env.OPENAI_API_KEY;
  const SUPABASE_URL  = process.env.REACT_APP_SUPABASE_URL;
  const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!ANTHROPIC_KEY) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }) };
  }

  const t0 = Date.now();

  try {
    const { query, lang = "ar", agentType = "general", collectionId = null } = JSON.parse(event.body || "{}");

    if (!query?.trim()) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "query is required" }) };
    }

    // ── Step 1: Embed the query (OpenAI if available, else skip vector search) ──
    let chunks = [];
    let embedding = null;

    if (OPENAI_KEY && SUPABASE_URL && SUPABASE_KEY) {
      embedding = await embedText(query, OPENAI_KEY);
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
      // Fallback: keyword search when no OpenAI
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

    // ── Step 2: Build context ────────────────────────────────────
    const context = chunks.length
      ? chunks.map((c, i) =>
          `[${i + 1}] من: ${c.collection || "قاعدة المعرفة"} — ${c.doc_title || ""}\n${c.content}`
        ).join("\n\n---\n\n")
      : "";

    // ── Step 3: Agent system prompts ─────────────────────────────
    const systemPrompts = {
      visa:        buildSystemPrompt("visa", lang),
      residency:   buildSystemPrompt("residency", lang),
      citizenship: buildSystemPrompt("citizenship", lang),
      sales:       buildSystemPrompt("sales", lang),
      marketing:   buildSystemPrompt("marketing", lang),
      accounting:  buildSystemPrompt("accounting", lang),
      general:     buildSystemPrompt("general", lang),
    };

    const systemPrompt = systemPrompts[agentType] || systemPrompts.general;

    const userMessage = context
      ? (lang === "ar"
          ? `السياق من قاعدة المعرفة:\n\n${context}\n\n---\n\nسؤال المستخدم: ${query}`
          : `Context from knowledge base:\n\n${context}\n\n---\n\nUser question: ${query}`)
      : query;

    // ── Step 4: Call Claude ───────────────────────────────────────
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
    const tokensUsed = claudeData.usage?.input_tokens + claudeData.usage?.output_tokens || 0;

    // ── Step 5: Calculate confidence ─────────────────────────────
    const avgSimilarity = chunks.length
      ? chunks.reduce((s, c) => s + (c.similarity || 0), 0) / chunks.length
      : 0;
    const confidence = chunks.length
      ? Math.min(0.99, avgSimilarity * 0.7 + 0.3)
      : 0.5;

    const sources = chunks.map(c => ({
      doc_title:  c.doc_title,
      collection: c.collection,
      similarity: Math.round((c.similarity || 0) * 100),
    }));

    const latencyMs = Date.now() - t0;

    // ── Step 6: Log to Supabase ───────────────────────────────────
    if (SUPABASE_URL && SUPABASE_KEY) {
      const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
      await sb.from("ai_rag_queries").insert({
        query,
        answer,
        sources,
        confidence,
        agent_type:  agentType,
        lang,
        chunks_used: chunks.length,
        tokens_used: tokensUsed,
        latency_ms:  latencyMs,
      });
    }

    return {
      statusCode: 200,
      headers:    CORS,
      body:       JSON.stringify({ answer, sources, confidence, chunks_used: chunks.length, latency_ms: latencyMs }),
    };

  } catch (err) {
    console.error("[AI RAG] Error:", err.message);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};

// ── Helpers ────────────────────────────────────────────────────

async function embedText(text, openaiKey) {
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method:  "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body:    JSON.stringify({ model: "text-embedding-3-small", input: text.slice(0, 8000) }),
    });
    const data = await res.json();
    return data.data?.[0]?.embedding || null;
  } catch {
    return null;
  }
}

function buildSystemPrompt(agentType, lang) {
  const ar = lang === "ar";
  const base = ar
    ? `أنت مساعد ذكي لشركة الكون العالمية — شركة متخصصة في خدمات الإقامة والجنسية والتأشيرات وتأسيس الشركات.\n\nقواعد:\n- أجب بالعربية دائماً إلا إذا طُلب منك غير ذلك\n- كن موجزاً ودقيقاً ومفيداً\n- اذكر مصادرك من قاعدة المعرفة\n- لا تقدم مشورة قانونية — معلومات توجيهية فقط\n- اقترح حجز استشارة للحالات المعقدة`
    : `You are an AI assistant for Alkown Global — a company specializing in residency, citizenship, visa services, and company formation.\n\nRules:\n- Be concise, accurate, and helpful\n- Cite your sources from the knowledge base\n- No legal advice — informational guidance only\n- Suggest booking a consultation for complex cases`;

  const agentContext = {
    visa:        ar ? "\nتخصصك: متطلبات التأشيرات، إجراءات السفارات، مدد الإقامة" : "\nSpecialty: Visa requirements, embassy procedures, stay durations",
    residency:   ar ? "\nتخصصك: برامج الإقامة الذهبية، متطلبات الإقامة، مقارنة الدول" : "\nSpecialty: Golden visa programs, residency requirements, country comparisons",
    citizenship: ar ? "\nتخصصك: الجنسية بالاستثمار، تصنيف جوازات السفر، مقارنة البرامج" : "\nSpecialty: Citizenship by investment, passport rankings, program comparisons",
    sales:       ar ? "\nتخصصك: تأهيل العملاء المحتملين، نصوص المبيعات، متابعة العملاء" : "\nSpecialty: Lead qualification, sales scripts, client follow-up",
    marketing:   ar ? "\nتخصصك: أفكار المحتوى، النصوص الإعلانية، استراتيجية التسويق" : "\nSpecialty: Content ideas, ad copy, marketing strategy",
    accounting:  ar ? "\nتخصصك: تحليل الفواتير، الإيرادات، أرصدة العملاء" : "\nSpecialty: Invoice analysis, revenue, client balances",
    general:     "",
  };

  return base + (agentContext[agentType] || "");
}
