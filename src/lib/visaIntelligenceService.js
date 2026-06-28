/**
 * Visa Intelligence Service
 *
 * Core query engine for visa requirement lookups.
 * Query priority:
 *   1. nationality + destination + residence  (most specific)
 *   2. nationality + destination              (general rule, no residence)
 *   3. null result → { found: false }
 *
 * AI-ready: structured result object maps directly to prompt context.
 * Future: replace DB calls with Timatic / third-party API in fetchRule().
 */
import { supabase } from "./supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
export const VISA_REQUIREMENT = {
  VISA_FREE:       "visa_free",
  VISA_ON_ARRIVAL: "visa_on_arrival",
  EVISA:           "evisa",
  ETA:             "eta",
  VISA_REQUIRED:   "visa_required",
  EMBASSY_VISA:    "embassy_visa",
};

export const REQUIREMENT_AR = {
  visa_free:       "لا تأشيرة مطلوبة",
  visa_on_arrival: "تأشيرة عند الوصول",
  evisa:           "تأشيرة إلكترونية",
  eta:             "تصريح إلكتروني (ETA)",
  visa_required:   "تأشيرة مطلوبة",
  embassy_visa:    "تأشيرة سفارة",
};

export const REQUIREMENT_EN = {
  visa_free:       "Visa Free",
  visa_on_arrival: "Visa on Arrival",
  evisa:           "e-Visa",
  eta:             "Electronic Travel Authorization",
  visa_required:   "Visa Required",
  embassy_visa:    "Embassy Visa",
};

export const REQUIREMENT_COLOR = {
  visa_free:       "#22c55e",
  visa_on_arrival: "#f59e0b",
  evisa:           "#3b82f6",
  eta:             "#6366f1",
  visa_required:   "#ef4444",
  embassy_visa:    "#dc2626",
};

export const DOCUMENT_AR = {
  passport:     "جواز سفر ساري",
  photo:        "صور شخصية",
  bank:         "كشف حساب بنكي",
  hotel:        "حجز فندقي مؤكد",
  return_tkt:   "تذكرة عودة",
  insurance:    "تأمين سفر",
  employ_ltr:   "رسالة من جهة العمل",
  cover_ltr:    "خطاب تغطية",
  invite_ltr:   "رسالة دعوة",
};

// ─── Country helpers ──────────────────────────────────────────────────────────
export async function fetchCountries({ activeOnly = true } = {}) {
  let q = supabase.from("vis_countries").select("*").order("name_ar");
  if (activeOnly) q = q.eq("is_active", true);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function getCountryByCode(code) {
  const { data } = await supabase
    .from("vis_countries").select("*").eq("code", code.toUpperCase()).single();
  return data;
}

// Slug utilities used by SEO pages
// Generate flag emoji from ISO 2-letter code (works in all modern browsers)
export function codeToFlag(code) {
  if (!code || code.length !== 2) return '';
  // Regional indicator A = U+1F1E6 (127462), 'A' = 65
  return [...code.toUpperCase()].map(c =>
    String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))
  ).join('');
}

export function countryToSlug(nameEn) {
  return nameEn.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function parseRouteSlug(slug) {
  // Expects: "syria-to-japan" or "united-states-to-germany"
  const match = slug.match(/^(.+)-to-(.+)$/);
  if (!match) return null;
  return { fromSlug: match[1], toSlug: match[2] };
}

// ─── Core Visa Checker ────────────────────────────────────────────────────────
/**
 * @param {string} nationalityCode  ISO 2-letter (e.g. "SY")
 * @param {string} destinationCode  ISO 2-letter (e.g. "DE")
 * @param {string|null} residenceCode ISO 2-letter (optional)
 * @returns {Promise<VisaResult>}
 */
export async function checkVisa({ nationalityCode, destinationCode, residenceCode = null }) {
  const nat  = nationalityCode?.toUpperCase();
  const dest = destinationCode?.toUpperCase();
  const res  = residenceCode?.toUpperCase() || null;

  if (!nat || !dest) throw new Error("Nationality and destination are required");
  if (nat === dest)  return { found: true, note: "same_country" };

  // 1. Try exact match with residence
  let rule = null;
  if (res) {
    rule = await fetchRule(nat, dest, res);
  }

  // 2. Fall back to general rule (residence_code = '')
  if (!rule) {
    rule = await fetchRule(nat, dest, "");
  }

  if (!rule) {
    return {
      found:              false,
      nationalityCode:    nat,
      destinationCode:    dest,
      residenceCode:      res,
      message_ar:         "لم يتم العثور على معلومات تأشيرة لهذه الرحلة. يرجى التواصل معنا مباشرة.",
      message_en:         "No visa information found for this route. Please contact us directly.",
    };
  }

  // Fetch country details for display
  const [nationalityCountry, destinationCountry, residenceCountry] = await Promise.all([
    getCountryByCode(nat),
    getCountryByCode(dest),
    res ? getCountryByCode(res) : Promise.resolve(null),
  ]);

  return buildResult({ rule, nationalityCountry, destinationCountry, residenceCountry });
}

async function fetchRule(nationalityCode, destinationCode, residenceCode) {
  const { data } = await supabase
    .from("vis_rules")
    .select("*")
    .eq("nationality_code", nationalityCode)
    .eq("destination_code", destinationCode)
    .eq("residence_code", residenceCode ?? "")
    .eq("is_active", true)
    .maybeSingle();
  return data;
}

function buildResult({ rule, nationalityCountry, destinationCountry, residenceCountry }) {
  const docs = (rule.documents || []).map(d => ({
    type:     d.type,
    label_ar: DOCUMENT_AR[d.type] || d.type,
    notes_ar: d.notes_ar || "",
    notes_en: d.notes_en || "",
  }));

  const processingText = rule.processing_min === 0 && rule.processing_max === 0
    ? "فوري"
    : rule.processing_max
      ? `${rule.processing_min}–${rule.processing_max} يوم عمل`
      : null;

  return {
    found:            true,
    rule_id:          rule.id,
    visa_requirement: rule.visa_requirement,
    label_ar:         REQUIREMENT_AR[rule.visa_requirement] || rule.visa_requirement,
    label_en:         REQUIREMENT_EN[rule.visa_requirement] || rule.visa_requirement,
    color:            REQUIREMENT_COLOR[rule.visa_requirement] || "#888",
    stay_days:        rule.stay_days,
    stay_text:        rule.stay_days ? `${rule.stay_days} يوم` : null,
    processing_text:  processingText,
    processing_min:   rule.processing_min,
    processing_max:   rule.processing_max,
    fee_usd:          rule.fee_usd,
    fee_text:         rule.fee_usd ? `$${rule.fee_usd}` : "مجاناً",
    documents:        docs,
    notes_ar:         rule.notes_ar,
    notes_en:         rule.notes_en,
    last_verified:    rule.last_verified,
    source:           rule.source,
    entry_type:       rule.entry_type,
    passport_validity_months: rule.passport_validity_months,
    official_website: rule.official_website,
    source_name:      rule.source_name,
    residence_based:  !!rule.residence_code,
    nationality:      nationalityCountry,
    destination:      destinationCountry,
    residence:        residenceCountry,
  };
}

// ─── Popular Routes ───────────────────────────────────────────────────────────
export async function getPopularRoutes(limit = 12) {
  const { data, error } = await supabase
    .from("vis_rules")
    .select("nationality_code, destination_code, visa_requirement")
    .eq("is_popular", true)
    .eq("is_active", true)
    .limit(limit);
  if (error) throw error;
  return data || [];
}

// ─── Route by Slug ────────────────────────────────────────────────────────────
export async function checkVisaBySlug(slug) {
  const parsed = parseRouteSlug(slug);
  if (!parsed) return { found: false };

  // Find countries by slug match on name_en
  const { data: countries } = await supabase
    .from("vis_countries")
    .select("code, name_en")
    .eq("is_active", true);

  if (!countries?.length) return { found: false };

  const from = countries.find(c => countryToSlug(c.name_en) === parsed.fromSlug);
  const to   = countries.find(c => countryToSlug(c.name_en) === parsed.toSlug);
  if (!from || !to) return { found: false, parsed };

  return checkVisa({ nationalityCode: from.code, destinationCode: to.code });
}

// ─── AI Context Builder ───────────────────────────────────────────────────────
/**
 * Builds a structured prompt context for AI integration (future).
 * Connects to Claude / OpenAI when keys are added.
 */
export function buildAIContext(result) {
  if (!result?.found) return null;
  return {
    nationality:      result.nationality?.name_en,
    destination:      result.destination?.name_en,
    residence:        result.residence?.name_en || null,
    visa_requirement: result.visa_requirement,
    stay_days:        result.stay_days,
    processing_days:  result.processing_max,
    fee_usd:          result.fee_usd,
    required_documents: result.documents.map(d => d.label_ar),
    notes:            result.notes_en,
  };
}
