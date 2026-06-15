// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Travel Advisor AI Service
// Static destination data + recommendDestinations(); free-form
// questions delegate to the live /api/ai-rag backend (Claude).
// ═══════════════════════════════════════════════════════════════

import { ragQuery } from "./ragService";

export const POPULAR_DESTINATIONS = [
  { code: "TR", nameAr: "تركيا", nameEn: "Turkey", flag: "🇹🇷", season: "Apr-Oct", avgCost: "800-1500 USD", highlight: "Istanbul, Cappadocia, Antalya", type: ["tourism", "medical", "residency"] },
  { code: "AE", nameAr: "الإمارات", nameEn: "UAE", flag: "🇦🇪", season: "Oct-Apr", avgCost: "1500-3000 USD", highlight: "Dubai, Abu Dhabi, Sharjah", type: ["tourism", "business", "residency"] },
  { code: "GR", nameAr: "اليونان", nameEn: "Greece", flag: "🇬🇷", season: "May-Sep", avgCost: "1200-2500 USD", highlight: "Athens, Santorini, Mykonos", type: ["tourism", "residency"] },
  { code: "PT", nameAr: "البرتغال", nameEn: "Portugal", flag: "🇵🇹", season: "Mar-Oct", avgCost: "1000-2000 USD", highlight: "Lisbon, Porto, Algarve", type: ["tourism", "residency"] },
  { code: "JP", nameAr: "اليابان", nameEn: "Japan", flag: "🇯🇵", season: "Mar-May, Sep-Nov", avgCost: "2000-4000 USD", highlight: "Tokyo, Kyoto, Osaka", type: ["tourism"] },
  { code: "DE", nameAr: "ألمانيا", nameEn: "Germany", flag: "🇩🇪", season: "May-Sep", avgCost: "1500-3000 USD", highlight: "Berlin, Munich, Hamburg", type: ["tourism", "business", "study"] },
];

export const TRAVEL_INTENTS = {
  tourism: { ar: "سياحة", en: "Tourism" },
  business: { ar: "أعمال", en: "Business" },
  medical: { ar: "علاج", en: "Medical" },
  study: { ar: "دراسة", en: "Study" },
  residency: { ar: "إقامة", en: "Residency" },
};

export function recommendDestinations({ intent, nationality, budget }) {
  let filtered = [...POPULAR_DESTINATIONS];
  if (intent) filtered = filtered.filter(d => d.type.includes(intent));
  return filtered.slice(0, 4);
}

export async function queryTravelAdvisor({ message, lang = "ar" }) {
  try {
    const { answer } = await ragQuery({ query: message, lang, agentType: "general" });
    if (answer?.trim()) return { type: "ai", message: answer, source: "ai_rag" };
  } catch {
    // Backend unavailable — fall through to static guidance.
  }

  return {
    type: "fallback",
    message: lang === "ar"
      ? "يسعدني مساعدتك في تخطيط رحلتك! أخبرني:\n• إلى أين تريد السفر؟\n• ما هدف رحلتك (سياحة، أعمال، علاج)؟\n• ما ميزانيتك التقريبية؟\n\nسأقترح لك أفضل الوجهات وأرتب إجراءات التأشيرة."
      : "I'd love to help plan your trip! Tell me:\n• Where do you want to go?\n• What's the purpose (tourism, business, medical)?\n• What's your approximate budget?\n\nI'll suggest the best destinations and handle visa procedures.",
    source: "fallback"
  };
}
