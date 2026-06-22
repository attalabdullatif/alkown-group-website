// ═══════════════════════════════════════════════════════════════
// Visa Rules Engine — validation + normalization
//
// Enforces the accuracy rules: ISO-3166 codes only, valid enums, and
// "no confidence without a source". Maps the spec's JSON field names to
// the vis_rules DB columns. NEVER invents data — only validates/flags.
// ═══════════════════════════════════════════════════════════════

const ISO = require("./iso-countries.json");

const VISA_TYPES = [
  "visa_free", "visa_on_arrival", "evisa", "eta", "visa_required",
  "embassy_visa", "electronic_authorization", "restricted", "special_permission",
];
const ENTRY_TYPES   = ["single", "multiple", "single_or_multiple", "unknown"];
const SOURCE_TYPES  = ["government", "mfa", "embassy", "evisa_portal", "border_control", "secondary"];
const CONFIDENCE    = ["HIGH", "MEDIUM", "LOW"];
const REVIEW_STATUS = ["VERIFIED", "REQUIRES_MANUAL_REVIEW", "CONFLICT"];

const validCodes = new Set(ISO.validIso);
const passports  = new Set(ISO.passports);

function code(v) { return typeof v === "string" ? v.trim().toUpperCase() : v; }
const isValidCode = (c) => typeof c === "string" && validCodes.has(code(c));
const isPassport  = (c) => passports.has(code(c));

// Map a spec-format record → vis_rules DB columns (no invention).
function normalizeRecord(rec) {
  const processing = rec.processing_time;
  const out = {
    nationality_code: code(rec.passport_country ?? rec.nationality_code),
    destination_code: code(rec.destination_country ?? rec.destination_code),
    residence_code:   code(rec.residence ?? rec.residence_code) || "",
    visa_requirement: rec.visa_type ?? rec.visa_requirement ?? null,
    visa_required:    typeof rec.visa_required === "boolean" ? rec.visa_required : null,
    stay_days:        rec.stay_days ?? null,
    processing_min:   rec.processing_min ?? (typeof processing === "number" ? processing : null),
    processing_max:   rec.processing_max ?? (typeof processing === "number" ? processing : null),
    passport_validity_months: rec.passport_validity_months ?? null,
    entry_type:       rec.entry_type ?? "unknown",
    fee_usd:          rec.government_fee ?? rec.fee_usd ?? null,
    documents:        Array.isArray(rec.documents_required) ? rec.documents_required
                      : (Array.isArray(rec.documents) ? rec.documents : []),
    official_website: rec.official_website ?? null,
    notes_en:         rec.notes ?? rec.notes_en ?? null,
    notes_ar:         rec.notes_ar ?? null,
    last_verified:    rec.last_updated ?? rec.verification_date ?? rec.last_verified ?? null,
    source_type:      rec.source_type ?? null,
    source_url:       rec.source_url ?? null,
    source_name:      rec.source_name ?? null,
    confidence_level: rec.confidence_level ?? "LOW",
    review_status:    rec.status ?? rec.review_status ?? null,
  };
  return out;
}

// Returns { valid, errors, warnings, record }. `record` is normalized and,
// when it can't be trusted, forced to REQUIRES_MANUAL_REVIEW (never dropped).
function validateRecord(raw) {
  const r = normalizeRecord(raw);
  const errors = [];
  const warnings = [];

  // ── Hard requirements (a record without these can't be keyed) ──
  if (!r.nationality_code) errors.push("missing passport_country");
  else if (!isValidCode(r.nationality_code)) errors.push(`invalid passport ISO code: ${r.nationality_code}`);
  else if (!isPassport(r.nationality_code)) warnings.push(`passport ${r.nationality_code} is not in the 22 Arab set`);

  if (!r.destination_code) errors.push("missing destination_country");
  else if (!isValidCode(r.destination_code)) errors.push(`invalid destination ISO code: ${r.destination_code}`);

  if (r.residence_code && !isValidCode(r.residence_code)) {
    errors.push(`invalid residence ISO code: ${r.residence_code}`);
  }

  // ── Enum checks (only when a value is present) ──
  if (r.visa_requirement && !VISA_TYPES.includes(r.visa_requirement))
    errors.push(`invalid visa_type: ${r.visa_requirement}`);
  if (r.entry_type && !ENTRY_TYPES.includes(r.entry_type))
    errors.push(`invalid entry_type: ${r.entry_type}`);
  if (r.source_type && !SOURCE_TYPES.includes(r.source_type))
    errors.push(`invalid source_type: ${r.source_type}`);
  if (r.confidence_level && !CONFIDENCE.includes(r.confidence_level))
    errors.push(`invalid confidence_level: ${r.confidence_level}`);
  if (r.review_status && !REVIEW_STATUS.includes(r.review_status))
    errors.push(`invalid status: ${r.review_status}`);

  // ── Accuracy guard: no high/medium confidence without a real source ──
  const claimsOfficial = r.confidence_level === "HIGH" || r.confidence_level === "MEDIUM";
  const hasSource = !!(r.source_url && r.source_type);
  if (claimsOfficial && !hasSource) {
    warnings.push("confidence HIGH/MEDIUM but missing source_url/source_type → downgraded for review");
    r.confidence_level = "LOW";
    r.review_status = "REQUIRES_MANUAL_REVIEW";
  }

  // ── Completeness: anything not explicitly VERIFIED + sourced → review ──
  const complete = r.visa_requirement && r.stay_days != null && hasSource;
  if (r.review_status !== "VERIFIED" || !complete) {
    if (r.review_status !== "CONFLICT") r.review_status = "REQUIRES_MANUAL_REVIEW";
    if (!complete) warnings.push("incomplete record → flagged REQUIRES_MANUAL_REVIEW");
  }

  return { valid: errors.length === 0, errors, warnings, record: r };
}

module.exports = {
  VISA_TYPES, ENTRY_TYPES, SOURCE_TYPES, CONFIDENCE, REVIEW_STATUS,
  isValidCode, isPassport, normalizeRecord, validateRecord, ISO,
};
