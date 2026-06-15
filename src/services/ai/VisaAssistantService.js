// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — AI Visa Assistant Service
// Answers from the local visa-rules DB first; for anything else it
// delegates to the live /api/ai-rag backend (Claude). Falls back to
// a static guidance message if the AI backend is unavailable.
// ═══════════════════════════════════════════════════════════════

import { lookupVisa } from "../../data/visaRules";
import { ragQuery } from "./ragService";

// Note: the AI system prompt now lives in the backend (api/ai-rag.js,
// agentType "visa") so it stays in one place.

// ── Intent Parser ─────────────────────────────────────────────
export function parseVisaIntent(message) {
  const msg = message.toLowerCase();

  // Detect nationality keywords
  const nationalityMap = {
    "syrian": "SY", "سوري": "SY", "سورية": "SY",
    "emirati": "AE", "إماراتي": "AE",
    "turkish": "TR", "تركي": "TR",
    "jordanian": "JO", "أردني": "JO",
    "egyptian": "EG", "مصري": "EG",
    "saudi": "SA", "سعودي": "SA",
    "pakistani": "PK", "باكستاني": "PK",
    "indian": "IN", "هندي": "IN",
  };

  const residenceMap = {
    "uae": "AE", "الإمارات": "AE", "dubai": "AE", "دبي": "AE", "abu dhabi": "AE",
    "turkey": "TR", "تركيا": "TR", "istanbul": "TR", "اسطنبول": "TR",
    "jordan": "JO", "الأردن": "JO",
    "germany": "DE", "ألمانيا": "DE",
  };

  const destinationMap = {
    "germany": "DE", "ألمانيا": "DE",
    "uae": "AE", "الإمارات": "AE", "dubai": "AE",
    "turkey": "TR", "تركيا": "TR",
    "japan": "JP", "اليابان": "JP",
    "uk": "GB", "britain": "GB", "المملكة المتحدة": "GB",
    "usa": "US", "america": "US", "أمريكا": "US",
    "canada": "CA", "كندا": "CA",
    "france": "FR", "فرنسا": "FR",
    "spain": "ES", "إسبانيا": "ES",
    "italy": "IT", "إيطاليا": "IT",
  };

  let nationality = null, residence = null, destination = null;

  for (const [key, code] of Object.entries(nationalityMap)) {
    if (msg.includes(key)) { nationality = code; break; }
  }
  for (const [key, code] of Object.entries(residenceMap)) {
    if (msg.includes(key)) { residence = code; break; }
  }
  for (const [key, code] of Object.entries(destinationMap)) {
    if (msg.includes(key)) { destination = code; break; }
  }

  return { nationality, residence, destination };
}

// ── Main Query Function ───────────────────────────────────────
export async function queryVisaAssistant({ message, lang = "ar", history = [] }) {
  // Step 1: Try to parse intent
  const intent = parseVisaIntent(message);

  // Step 2: If we have nationality + destination, look up rules
  if (intent.nationality && intent.destination) {
    const rule = lookupVisa(intent);
    if (rule) {
      return buildRuleResponse(rule, intent, lang);
    }
  }

  // Step 3: Delegate to the live RAG backend (Claude) for free-form
  // questions the local rules DB can't answer.
  try {
    const { answer } = await ragQuery({ query: message, lang, agentType: "visa" });
    if (answer?.trim()) {
      return { type: "ai", intent, message: answer, source: "ai_rag" };
    }
  } catch {
    // Backend unavailable / not configured — fall through to static guidance.
  }

  // Step 4: Fallback response
  return buildFallbackResponse(message, lang, intent);
}

function buildRuleResponse(rule, intent, lang) {
  const ar = lang === "ar";
  const visaTypeLabels = {
    ar: { visa_free: "بدون تأشيرة", visa_on_arrival: "تأشيرة عند الوصول", e_visa: "تأشيرة إلكترونية", embassy_visa: "تأشيرة سفارة", entry_refused: "الدخول مرفوض" },
    en: { visa_free: "Visa Free", visa_on_arrival: "Visa on Arrival", e_visa: "E-Visa", embassy_visa: "Embassy Visa", entry_refused: "Entry Refused" }
  };

  const typeLabel = visaTypeLabels[ar ? "ar" : "en"][rule.type] || rule.type;
  const notes = ar ? rule.notes?.ar : rule.notes?.en;

  return {
    type: "rule_found",
    intent,
    rule,
    message: ar
      ? `وجدت معلومات لهذا المسار:\n\n**نوع التأشيرة:** ${typeLabel}\n**مدة الإقامة:** ${rule.stay || "—"}\n**مدة المعالجة:** ${rule.processing || "—"}\n**الرسوم:** ${rule.fee?.amount === 0 ? "مجاناً" : `${rule.fee?.amount} ${rule.fee?.currency}`}\n\n${notes || ""}\n\n💡 هل تريد تقديم طلبك الآن؟`
      : `I found information for this route:\n\n**Visa Type:** ${typeLabel}\n**Stay:** ${rule.stay || "—"}\n**Processing:** ${rule.processing || "—"}\n**Fee:** ${rule.fee?.amount === 0 ? "Free" : `${rule.fee?.amount} ${rule.fee?.currency}`}\n\n${notes || ""}\n\n💡 Would you like to apply now?`,
    source: "local_db"
  };
}

function buildFallbackResponse(message, lang, intent) {
  const ar = lang === "ar";
  const hasPartialIntent = intent.nationality || intent.destination;

  if (hasPartialIntent) {
    return {
      type: "partial_intent",
      intent,
      message: ar
        ? "يسعدني مساعدتك! لمعرفة متطلبات التأشيرة بدقة، أحتاج:\n• **جنسيتك** (إذا لم تذكرها)\n• **بلد إقامتك** الحالية\n• **الوجهة** التي تريد السفر إليها\n\nأو يمكنك استخدام **فاحص التأشيرة** مباشرة للحصول على نتيجة فورية."
        : "I'd love to help! To check visa requirements accurately, I need:\n• Your **nationality**\n• Your **country of residence**\n• Your **destination**\n\nOr use the **Visa Checker** for instant results.",
      source: "fallback"
    };
  }

  return {
    type: "general",
    intent,
    message: ar
      ? "مرحباً! أنا مساعد التأشيرات الذكي من الكون العالمية.\n\nيمكنني مساعدتك في:\n• معرفة متطلبات التأشيرة لأي مسار\n• شرح خطوات التقديم\n• الإجابة على استفساراتك\n\nأخبرني: ما جنسيتك وإلى أين تريد السفر؟"
      : "Hello! I'm ALKOWN Global's Visa AI Assistant.\n\nI can help you with:\n• Visa requirements for any route\n• Application process steps\n• Any travel questions\n\nTell me: what's your nationality and where do you want to travel?",
    source: "fallback"
  };
}

