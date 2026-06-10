// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — AI Content Generation Function
// Phase 4: Generate social posts, articles, campaigns via Claude
// POST /api/ai-content  { type, topic, lang, platform, tone, sources }
// ═══════════════════════════════════════════════════════════════

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (event.httpMethod !== "POST")   return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || process.env.REACT_APP_ANTHROPIC_KEY;
  if (!ANTHROPIC_KEY) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }) };
  }

  try {
    const {
      type     = "instagram_post",
      topic    = "",
      lang     = "ar",
      platform = "instagram",
      tone     = "professional",
      sources  = [],
      brandMemory = {},
    } = JSON.parse(event.body || "{}");

    if (!topic?.trim()) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "topic is required" }) };
    }

    const systemPrompt = buildContentSystemPrompt(lang, brandMemory);
    const userPrompt   = buildContentUserPrompt({ type, topic, lang, platform, tone, sources });

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key":         ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "content-type":      "application/json",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-6",
        max_tokens: 2000,
        system:     systemPrompt,
        messages:   [{ role: "user", content: userPrompt }],
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.json().catch(() => ({}));
      throw new Error(`Claude API error: ${JSON.stringify(err)}`);
    }

    const claudeData = await claudeRes.json();
    const raw        = claudeData.content?.[0]?.text || "";

    // Try to parse structured JSON from Claude's response
    let parsed = null;
    try {
      const jsonMatch = raw.match(/```json\n?([\s\S]*?)\n?```/) || raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
    } catch { /* use raw */ }

    return {
      statusCode: 200,
      headers:    CORS,
      body:       JSON.stringify({
        content: parsed || { text: raw },
        raw,
        type,
        lang,
        tokens_used: claudeData.usage?.input_tokens + claudeData.usage?.output_tokens || 0,
      }),
    };

  } catch (err) {
    console.error("[AI Content] Error:", err.message);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};

// ── Prompt Builders ────────────────────────────────────────────

function buildContentSystemPrompt(lang, brandMemory = {}) {
  const voice      = brandMemory.brand_voice || (lang === "ar" ? "احترافي وودي وثقة عالية" : "Professional, warm, trustworthy");
  const positioning = brandMemory.positioning || (lang === "ar" ? "شريكك الموثوق للتنقل العالمي" : "Your trusted partner for global mobility");
  const persona    = brandMemory.customer_persona || (lang === "ar" ? "رجال أعمال عرب يبحثون عن إقامة أو جنسية ثانية" : "Arab business professionals seeking second residency or citizenship");

  if (lang === "ar") {
    return `أنت كاتب محتوى متخصص لشركة الكون العالمية.

الشركة: الكون العالمية — خدمات الإقامة والجنسية والتأشيرات وتأسيس الشركات
الصوت التجاري: ${voice}
موقع الشركة: ${positioning}
الجمهور المستهدف: ${persona}

قواعد المحتوى:
- اكتب بالعربية الفصحى المبسطة المفهومة للجميع
- استخدم هاشتاقات ذات صلة عند الطلب
- ابدأ بـ Hook قوي يجذب الانتباه
- اختم بدعوة للتصرف (CTA) واضحة
- لا تذكر أرقاماً أو أسعاراً محددة إلا إذا طُلب صراحةً
- أعط المحتوى بصيغة JSON منظمة`;
  }

  return `You are a specialized content writer for Alkown Global.

Company: Alkown Global — Residency, Citizenship, Visa & Company Formation services
Brand Voice: ${voice}
Positioning: ${positioning}
Target Audience: ${persona}

Content Rules:
- Clear, professional, engaging English
- Use relevant hashtags when requested
- Start with a strong attention-grabbing Hook
- End with a clear Call to Action (CTA)
- No specific numbers or prices unless explicitly requested
- Return content as structured JSON`;
}

function buildContentUserPrompt({ type, topic, lang, platform, tone, sources }) {
  const contextBlock = sources.length
    ? `\n\nمعلومات من قاعدة المعرفة:\n${sources.map(s => `- ${s}`).join("\n")}`
    : "";

  const templates = {
    instagram_post: lang === "ar"
      ? `اكتب منشور إنستغرام احترافي عن: "${topic}"${contextBlock}

أرجع JSON بهذا الشكل:
\`\`\`json
{
  "hook": "الجملة الأولى الجاذبة (تبدأ بسؤال أو إحصائية أو حقيقة مثيرة)",
  "body": "جسم المنشور (3-5 فقرات قصيرة)",
  "cta": "دعوة للتصرف",
  "hashtags": ["هاشتاق1", "هاشتاق2", "هاشتاق3"],
  "emoji_score": "استخدام الإيموجي: كثير/متوسط/قليل"
}
\`\`\``
      : `Write a professional Instagram post about: "${topic}"${contextBlock}

Return JSON:
\`\`\`json
{
  "hook": "Opening attention-grabbing line",
  "body": "Post body (3-5 short paragraphs)",
  "cta": "Call to action",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "emoji_score": "emoji usage: high/medium/low"
}
\`\`\``,

    carousel: lang === "ar"
      ? `اكتب محتوى كاروسيل إنستغرام (5-7 شرائح) عن: "${topic}"${contextBlock}

أرجع JSON بهذا الشكل:
\`\`\`json
{
  "title": "عنوان الكاروسيل",
  "slides": [
    {"slide": 1, "headline": "العنوان", "body": "المحتوى (جملتان-ثلاث)"},
    ...
  ],
  "last_slide_cta": "الشريحة الأخيرة — دعوة للتصرف",
  "hashtags": ["هاشتاق1", "هاشتاق2"]
}
\`\`\``
      : `Write Instagram carousel content (5-7 slides) about: "${topic}"${contextBlock}

Return JSON:
\`\`\`json
{
  "title": "Carousel title",
  "slides": [
    {"slide": 1, "headline": "Headline", "body": "Content (2-3 sentences)"},
    ...
  ],
  "last_slide_cta": "Last slide CTA",
  "hashtags": ["hashtag1", "hashtag2"]
}
\`\`\``,

    reels_script: lang === "ar"
      ? `اكتب سكريبت ريلز (30-60 ثانية) عن: "${topic}"${contextBlock}

أرجع JSON:
\`\`\`json
{
  "duration": "45 ثانية",
  "hook": "الثواني الثلاث الأولى (ماذا يقول المقدم)",
  "script": ["مقطع 1", "مقطع 2", "مقطع 3"],
  "cta": "نهاية الريلز",
  "on_screen_text": ["نص 1 يظهر على الشاشة", "نص 2"]
}
\`\`\``
      : `Write a Reels script (30-60 seconds) about: "${topic}"${contextBlock}

Return JSON:
\`\`\`json
{
  "duration": "45 seconds",
  "hook": "First 3 seconds (what presenter says)",
  "script": ["segment 1", "segment 2", "segment 3"],
  "cta": "Reels ending",
  "on_screen_text": ["text 1", "text 2"]
}
\`\`\``,

    video_hook: lang === "ar"
      ? `اكتب 5 هوك مختلفة لفيديو عن: "${topic}"${contextBlock}

أرجع JSON:
\`\`\`json
{
  "hooks": [
    {"type": "سؤال", "text": "..."},
    {"type": "إحصائية", "text": "..."},
    {"type": "تحدي", "text": "..."},
    {"type": "وعد", "text": "..."},
    {"type": "قصة", "text": "..."}
  ]
}
\`\`\``
      : `Write 5 different video hooks about: "${topic}"${contextBlock}

Return JSON:
\`\`\`json
{
  "hooks": [
    {"type": "question", "text": "..."},
    {"type": "statistic", "text": "..."},
    {"type": "challenge", "text": "..."},
    {"type": "promise", "text": "..."},
    {"type": "story", "text": "..."}
  ]
}
\`\`\``,

    blog_article: lang === "ar"
      ? `اكتب مقال بلوج شامل عن: "${topic}"${contextBlock}

أرجع JSON:
\`\`\`json
{
  "title": "عنوان المقال",
  "meta_description": "وصف ميتا للـ SEO (155 حرف)",
  "sections": [
    {"heading": "مقدمة", "content": "..."},
    {"heading": "عنوان القسم", "content": "..."}
  ],
  "conclusion": "الخاتمة",
  "keywords": ["كلمة1", "كلمة2"]
}
\`\`\``
      : `Write a comprehensive blog article about: "${topic}"${contextBlock}

Return JSON:
\`\`\`json
{
  "title": "Article title",
  "meta_description": "SEO meta description (155 chars)",
  "sections": [
    {"heading": "Introduction", "content": "..."},
    {"heading": "Section heading", "content": "..."}
  ],
  "conclusion": "Conclusion",
  "keywords": ["keyword1", "keyword2"]
}
\`\`\``,

    email_campaign: lang === "ar"
      ? `اكتب حملة إيميل تسويقية عن: "${topic}"${contextBlock}

أرجع JSON:
\`\`\`json
{
  "subject": "موضوع الإيميل",
  "preview_text": "نص المعاينة (50 حرف)",
  "greeting": "التحية",
  "body": "جسم الإيميل (3 فقرات)",
  "cta_text": "نص زر الدعوة للتصرف",
  "ps": "ملاحظة ختامية (P.S.)"
}
\`\`\``
      : `Write a marketing email campaign about: "${topic}"${contextBlock}

Return JSON:
\`\`\`json
{
  "subject": "Email subject line",
  "preview_text": "Preview text (50 chars)",
  "greeting": "Greeting",
  "body": "Email body (3 paragraphs)",
  "cta_text": "CTA button text",
  "ps": "Closing note (P.S.)"
}
\`\`\``,

    whatsapp_campaign: lang === "ar"
      ? `اكتب رسالة واتساب تسويقية عن: "${topic}"${contextBlock}

أرجع JSON:
\`\`\`json
{
  "message": "نص الرسالة (قصير ومباشر، مناسب لواتساب)",
  "cta": "دعوة للتصرف مع رابط أو رقم",
  "follow_up": "رسالة متابعة بعد يومين"
}
\`\`\``
      : `Write a WhatsApp marketing message about: "${topic}"${contextBlock}

Return JSON:
\`\`\`json
{
  "message": "Message text (short and direct, WhatsApp-appropriate)",
  "cta": "Call to action with link or number",
  "follow_up": "Follow-up message for 2 days later"
}
\`\`\``,
  };

  return templates[type] || templates.instagram_post;
}
