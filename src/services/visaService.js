// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Visa Service Layer
// AI-Ready Architecture — plug OpenAI/Claude without refactoring
// ═══════════════════════════════════════════════════════════════

import { lookupVisa, VISA_RULES } from "../data/visaRules";
import { getCountryByCode, toSlug, COUNTRIES } from "../data/countries";
import { supabase } from "../lib/supabase";
import { ragQuery } from "./ai/ragService";

// ── VISA CHECKER ───────────────────────────────────────────────
export async function checkVisaRequirements({ nationality, residence, destination }) {
  // Step 1: Try local mock database first
  const localResult = lookupVisa({ nationality, residence, destination });
  if (localResult) {
    return {
      source: "mock_db",
      data: enrichResult(localResult, nationality, residence, destination),
    };
  }

  // Step 2: Future → try Supabase database
  // const dbResult = await fetchFromSupabase({ nationality, residence, destination });
  // if (dbResult) return { source: "supabase", data: dbResult };

  // Step 3: Future → AI fallback
  // const aiResult = await queryAIAssistant({ nationality, residence, destination });
  // if (aiResult) return { source: "ai", data: aiResult };

  return { source: "not_found", data: null };
}

function enrichResult(rule, nationality, residence, destination) {
  const fromCountry = getCountryByCode(rule.from || nationality);
  const toCountry = getCountryByCode(rule.to || destination);
  const resCountry = residence ? getCountryByCode(residence) : null;
  return {
    ...rule,
    fromCountry,
    toCountry,
    resCountry,
    seoSlug: generateRouteSlug(fromCountry, toCountry),
  };
}

// ── AI SERVICE INTERFACE ───────────────────────────────────────
// Ready for OpenAI/Claude integration

export async function queryAIVisaAssistant({ prompt, nationality, residence, destination }) {
  // Enrich the prompt with the route context, then hit the live RAG
  // backend (Claude). Returns a graceful message if it's unavailable.
  const context = [nationality && `Nationality: ${nationality}`,
                   residence && `Residence: ${residence}`,
                   destination && `Destination: ${destination}`]
    .filter(Boolean).join(", ");
  const query = context ? `${prompt}\n\n(${context})` : prompt;

  try {
    const { answer } = await ragQuery({ query, lang: "ar", agentType: "visa" });
    return { answer, answerAr: answer, suggestions: [] };
  } catch {
    return {
      answer: "The AI assistant is temporarily unavailable. Please use the visa checker above.",
      answerAr: "مساعد الذكاء الاصطناعي غير متاح مؤقتاً. يرجى استخدام فاحص التأشيرة أعلاه.",
      suggestions: [],
    };
  }
}

// System prompt template (ready for AI)
export function buildVisaSystemPrompt() {
  return `You are ALKOWN Global's premium Visa AI Assistant.
You help clients understand visa requirements, processes, and documentation.
You are multilingual (Arabic/English), professional, and precise.
Always recommend consulting with an ALKOWN visa specialist for complex cases.
Base your answers on official embassy requirements and current regulations.`;
}

// ── APPLICATION SERVICE ────────────────────────────────────────
export async function submitVisaApplication(formData) {
  try {
    // Save to Supabase
    const { data, error } = await supabase
      .from("visa_applications")
      .insert([{
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        nationality: formData.nationality,
        destination: formData.destination,
        travel_date: formData.travelDate,
        notes: formData.notes,
        status: "new",
        created_at: new Date().toISOString(),
      }])
      .select();

    if (error) throw error;

    return { success: true, applicationId: data[0]?.id, data: data[0] };
  } catch (err) {
    console.error("Visa application error:", err);
    // Fallback: log locally and notify
    return { success: false, error: err.message };
  }
}

// ── SEO SERVICE ───────────────────────────────────────────────
export function generateRouteSlug(fromCountry, toCountry) {
  if (!fromCountry || !toCountry) return "";
  return `${toSlug(fromCountry.name)}-to-${toSlug(toCountry.name)}`;
}

export function generateSEOMeta({ fromCountry, toCountry, lang = "en" }) {
  if (!fromCountry || !toCountry) return {};
  if (lang === "ar") {
    return {
      title: `تأشيرة ${toCountry.nameAr} لحاملي جواز ${fromCountry.nameAr} | الكون العالمية`,
      description: `كل ما تحتاجه عن تأشيرة ${toCountry.nameAr} لمواطني ${fromCountry.nameAr}. متطلبات، رسوم، مستندات، ومدة المعالجة.`,
      keywords: `تأشيرة ${toCountry.nameAr}, ${fromCountry.nameAr} إلى ${toCountry.nameAr}, متطلبات التأشيرة`,
    };
  }
  return {
    title: `${fromCountry.name} to ${toCountry.name} Visa Requirements | ALKOWN Global`,
    description: `Complete visa guide for ${fromCountry.name} citizens traveling to ${toCountry.name}. Requirements, fees, documents, processing time.`,
    keywords: `${fromCountry.name} to ${toCountry.name} visa, ${toCountry.name} visa requirements, ${fromCountry.name} passport`,
  };
}

// ── POPULAR ROUTES ────────────────────────────────────────────
export function getPopularRoutes() {
  return Object.values(VISA_RULES)
    .filter(r => r.popular)
    .map(r => {
      const from = getCountryByCode(r.from);
      const to = getCountryByCode(r.to);
      const res = r.residence ? getCountryByCode(r.residence) : null;
      return { rule: r, from, to, res, slug: generateRouteSlug(from, to) };
    });
}

// ── SEARCH COUNTRIES ──────────────────────────────────────────
export function searchCountries(query) {
  if (!query || query.length < 1) return COUNTRIES;
  const q = query.toLowerCase();
  return COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(q) || c.nameAr.includes(query)
  );
}
