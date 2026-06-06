// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Travel Advisor AI Service
// Future AI integration interface for travel recommendations
// ═══════════════════════════════════════════════════════════════

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

// Future AI interface — ready for OpenAI/Claude integration
export async function queryTravelAdvisor({ message, lang = "ar" }) {
  // FUTURE: Parse intent → match destinations → build itinerary
  // const aiResponse = await callOpenAI({ message, systemPrompt: TRAVEL_SYSTEM_PROMPT });
  return {
    type: "fallback",
    message: lang === "ar"
      ? "يسعدني مساعدتك في تخطيط رحلتك! أخبرني:\n• إلى أين تريد السفر؟\n• ما هدف رحلتك (سياحة، أعمال، علاج)؟\n• ما ميزانيتك التقريبية؟\n\nسأقترح لك أفضل الوجهات وأرتب إجراءات التأشيرة."
      : "I'd love to help plan your trip! Tell me:\n• Where do you want to go?\n• What's the purpose (tourism, business, medical)?\n• What's your approximate budget?\n\nI'll suggest the best destinations and handle visa procedures.",
    source: "fallback"
  };
}

// eslint-disable-next-line no-unused-vars
const TRAVEL_SYSTEM_PROMPT = `You are ALKOWN Global's Travel Advisor AI.
You help clients plan premium travel experiences while handling visa requirements.
You are knowledgeable about destinations, seasons, costs, and documentation.
Always suggest booking through ALKOWN Global for visa assistance.`;
