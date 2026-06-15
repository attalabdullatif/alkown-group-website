// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — AI Content Generation — Vercel API Route
// /api/ai-content
// POST { type, topic, lang, platform, tone, sources, brandMemory }
// ═══════════════════════════════════════════════════════════════

const { applyCors } = require("./_cors");

module.exports = async (req, res) => {
  applyCors(req, res);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });

  try {
    const {
      type        = "instagram_post",
      topic       = "",
      lang        = "ar",
      platform    = "instagram",
      tone        = "professional",
      sources     = [],
      brandMemory = {},
    } = req.body || {};

    if (!topic?.trim()) return res.status(400).json({ error: "topic is required" });

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

    let parsed = null;
    try {
      const m = raw.match(/```json\n?([\s\S]*?)\n?```/) || raw.match(/(\{[\s\S]*\})/);
      if (m) parsed = JSON.parse(m[1]);
    } catch { /* use raw */ }

    return res.status(200).json({
      content:     parsed || { text: raw },
      raw,
      type,
      lang,
      tokens_used: (claudeData.usage?.input_tokens || 0) + (claudeData.usage?.output_tokens || 0),
    });

  } catch (err) {
    console.error("[AI Content]", err.message);
    return res.status(500).json({ error: err.message });
  }
};

function buildContentSystemPrompt(lang, brandMemory = {}) {
  const voice      = brandMemory.brand_voice  || (lang === "ar" ? "احترافي وودي وثقة عالية" : "Professional, warm, trustworthy");
  const positioning = brandMemory.positioning || (lang === "ar" ? "شريكك الموثوق للتنقل العالمي" : "Your trusted partner for global mobility");
  const persona    = brandMemory.customer_persona || (lang === "ar" ? "رجال أعمال عرب يبحثون عن إقامة أو جنسية ثانية" : "Arab business professionals seeking residency or citizenship");

  if (lang === "ar") {
    return `أنت كاتب محتوى متخصص لشركة الكون العالمية.

الشركة: الكون العالمية — خدمات الإقامة والجنسية والتأشيرات وتأسيس الشركات
الصوت التجاري: ${voice}
موقع الشركة: ${positioning}
الجمهور: ${persona}

قواعد:
- اكتب بالعربية الفصحى المبسطة
- ابدأ بـ Hook قوي يجذب الانتباه
- اختم بـ CTA واضحة
- أعط المحتوى بصيغة JSON منظمة`;
  }

  return `You are a specialized content writer for Alkown Global.

Company: Alkown Global — Residency, Citizenship, Visa & Company Formation
Brand Voice: ${voice}
Positioning: ${positioning}
Audience: ${persona}

Rules:
- Clear, professional, engaging writing
- Start with a strong Hook
- End with a clear CTA
- Return structured JSON`;
}

function buildContentUserPrompt({ type, topic, lang, sources }) {
  const ctx = sources.length
    ? `\n\nمعلومات إضافية:\n${sources.map(s => `- ${s}`).join("\n")}`
    : "";

  const ar = lang === "ar";

  const templates = {
    instagram_post: ar
      ? `اكتب منشور إنستغرام احترافي عن: "${topic}"${ctx}\n\nأرجع JSON:\n\`\`\`json\n{"hook":"...","body":"...","cta":"...","hashtags":["..."]}\n\`\`\``
      : `Write a professional Instagram post about: "${topic}"${ctx}\n\nReturn JSON:\n\`\`\`json\n{"hook":"...","body":"...","cta":"...","hashtags":["..."]}\n\`\`\``,

    carousel: ar
      ? `اكتب محتوى كاروسيل (5-7 شرائح) عن: "${topic}"${ctx}\n\nأرجع JSON:\n\`\`\`json\n{"title":"...","slides":[{"slide":1,"headline":"...","body":"..."}],"last_slide_cta":"...","hashtags":["..."]}\n\`\`\``
      : `Write carousel content (5-7 slides) about: "${topic}"${ctx}\n\nReturn JSON:\n\`\`\`json\n{"title":"...","slides":[{"slide":1,"headline":"...","body":"..."}],"last_slide_cta":"...","hashtags":["..."]}\n\`\`\``,

    reels_script: ar
      ? `اكتب سكريبت ريلز (30-60 ثانية) عن: "${topic}"${ctx}\n\nأرجع JSON:\n\`\`\`json\n{"duration":"45 ثانية","hook":"...","script":["...","..."],"cta":"...","on_screen_text":["..."]}\n\`\`\``
      : `Write a Reels script (30-60 sec) about: "${topic}"${ctx}\n\nReturn JSON:\n\`\`\`json\n{"duration":"45 seconds","hook":"...","script":["...","..."],"cta":"...","on_screen_text":["..."]}\n\`\`\``,

    video_hook: ar
      ? `اكتب 5 هوكس مختلفة لفيديو عن: "${topic}"${ctx}\n\nأرجع JSON:\n\`\`\`json\n{"hooks":[{"type":"سؤال","text":"..."},{"type":"إحصائية","text":"..."},{"type":"تحدي","text":"..."},{"type":"وعد","text":"..."},{"type":"قصة","text":"..."}]}\n\`\`\``
      : `Write 5 different video hooks about: "${topic}"${ctx}\n\nReturn JSON:\n\`\`\`json\n{"hooks":[{"type":"question","text":"..."},{"type":"statistic","text":"..."},{"type":"challenge","text":"..."},{"type":"promise","text":"..."},{"type":"story","text":"..."}]}\n\`\`\``,

    blog_article: ar
      ? `اكتب مقال بلوج شامل عن: "${topic}"${ctx}\n\nأرجع JSON:\n\`\`\`json\n{"title":"...","meta_description":"...","sections":[{"heading":"مقدمة","content":"..."},{"heading":"...","content":"..."}],"conclusion":"...","keywords":["..."]}\n\`\`\``
      : `Write a comprehensive blog article about: "${topic}"${ctx}\n\nReturn JSON:\n\`\`\`json\n{"title":"...","meta_description":"...","sections":[{"heading":"Introduction","content":"..."}],"conclusion":"...","keywords":["..."]}\n\`\`\``,

    email_campaign: ar
      ? `اكتب حملة إيميل عن: "${topic}"${ctx}\n\nأرجع JSON:\n\`\`\`json\n{"subject":"...","preview_text":"...","greeting":"...","body":"...","cta_text":"...","ps":"..."}\n\`\`\``
      : `Write a marketing email about: "${topic}"${ctx}\n\nReturn JSON:\n\`\`\`json\n{"subject":"...","preview_text":"...","greeting":"...","body":"...","cta_text":"...","ps":"..."}\n\`\`\``,

    whatsapp_campaign: ar
      ? `اكتب رسالة واتساب تسويقية عن: "${topic}"${ctx}\n\nأرجع JSON:\n\`\`\`json\n{"message":"...","cta":"...","follow_up":"..."}\n\`\`\``
      : `Write a WhatsApp marketing message about: "${topic}"${ctx}\n\nReturn JSON:\n\`\`\`json\n{"message":"...","cta":"...","follow_up":"..."}\n\`\`\``,
  };

  return templates[type] || templates.instagram_post;
}
