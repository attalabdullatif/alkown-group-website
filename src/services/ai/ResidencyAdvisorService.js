// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Residency Advisor AI Service
// Future AI integration interface
// ═══════════════════════════════════════════════════════════════

export const RESIDENCY_PROGRAMS = [
  { id: "pt-golden", country: "Portugal", nameAr: "البرتغال", type: "Golden Visa", minInvestment: 250000, currency: "EUR", processingMonths: "6-8", passportRank: 4, schengen: true },
  { id: "gr-golden", country: "Greece", nameAr: "اليونان", type: "Golden Visa", minInvestment: 250000, currency: "EUR", processingMonths: "6-12", passportRank: 7, schengen: true },
  { id: "mt-citizenship", country: "Malta", nameAr: "مالطا", type: "Citizenship by Investment", minInvestment: 750000, currency: "EUR", processingMonths: "14-36", passportRank: 8, schengen: true },
  { id: "tr-citizenship", country: "Turkey", nameAr: "تركيا", type: "Citizenship by Investment", minInvestment: 400000, currency: "USD", processingMonths: "3-6", passportRank: 53, schengen: false },
  { id: "ca-startup", country: "Canada", nameAr: "كندا", type: "Startup Visa", minInvestment: 75000, currency: "CAD", processingMonths: "12-16", passportRank: 7, schengen: false },
  { id: "ae-golden", country: "UAE", nameAr: "الإمارات", type: "Golden Visa", minInvestment: 2000000, currency: "AED", processingMonths: "1-3", passportRank: 15, schengen: false },
];

export function recommendResidency({ budget, currency = "USD", needsSchengen, preferredTimeline }) {
  let filtered = [...RESIDENCY_PROGRAMS];

  if (needsSchengen) filtered = filtered.filter(p => p.schengen);

  return filtered.sort((a, b) => a.minInvestment - b.minInvestment).slice(0, 3);
}

// Future AI interface
export async function queryResidencyAdvisor({ message, lang = "ar" }) {
  // FUTURE: OpenAI integration
  // Parse intent → match programs → return recommendations
  return {
    type: "fallback",
    message: lang === "ar"
      ? "لتحديد أفضل برنامج إقامة لك، أحتاج معرفة:\n• ميزانيتك التقريبية\n• هل تحتاج الوصول لدول شنغن؟\n• المدة الزمنية المفضلة\n\nتواصل مع مستشارينا للحصول على توصية مخصصة."
      : "To find the best residency program for you, I need:\n• Your approximate budget\n• Do you need Schengen access?\n• Preferred timeline\n\nContact our advisors for a personalized recommendation.",
    source: "fallback"
  };
}
