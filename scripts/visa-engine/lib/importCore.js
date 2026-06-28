// ═══════════════════════════════════════════════════════════════
// Visa Rules Engine — shared import core.
// Validates → detects changes → upserts into vis_rules → returns a log
// of created / updated / review / failed records. Used by import-json
// and import-csv. Pass { dryRun: true } to validate without writing.
// ═══════════════════════════════════════════════════════════════

const { validateRecord } = require("./validate");
const { getClient } = require("./db");

// Columns we manage on vis_rules (must match migration 023).
const COLUMNS = [
  "nationality_code", "destination_code", "residence_code",
  "visa_requirement", "visa_required", "stay_days",
  "processing_min", "processing_max", "passport_validity_months",
  "entry_type", "fee_usd", "documents", "official_website",
  "notes_en", "notes_ar", "last_verified",
  "source_type", "source_url", "source_name",
  "confidence_level", "review_status",
];

// CSV gives strings — coerce known fields to proper JS types.
function coerce(rec) {
  const num = (v) => (v === "" || v == null ? null : (isNaN(Number(v)) ? v : Number(v)));
  const bool = (v) =>
    typeof v === "boolean" ? v
    : v === "true" ? true : v === "false" ? false
    : v === "" || v == null ? null : v;
  const arr = (v) => {
    if (Array.isArray(v)) return v;
    if (typeof v === "string" && v.trim()) {
      try { const p = JSON.parse(v); return Array.isArray(p) ? p : [v]; }
      catch { return v.split(/[;|]/).map((s) => s.trim()).filter(Boolean); }
    }
    return [];
  };
  return {
    ...rec,
    visa_required: bool(rec.visa_required),
    stay_days: num(rec.stay_days),
    processing_time: num(rec.processing_time),
    processing_min: num(rec.processing_min),
    processing_max: num(rec.processing_max),
    passport_validity_months: num(rec.passport_validity_months),
    government_fee: num(rec.government_fee ?? rec.fee_usd),
    documents_required: arr(rec.documents_required ?? rec.documents),
  };
}

function pick(record) {
  const out = {};
  for (const c of COLUMNS) if (record[c] !== undefined) out[c] = record[c];
  return out;
}

// Compare incoming vs existing → list of changed fields (for update reports).
function diffFields(existing, incoming) {
  const changed = [];
  for (const c of COLUMNS) {
    const a = JSON.stringify(existing[c] ?? null);
    const b = JSON.stringify(incoming[c] ?? null);
    if (a !== b) changed.push(c);
  }
  return changed;
}

async function runImport(rawRecords, opts = {}) {
  const dryRun = !!opts.dryRun;
  const log = {
    total: rawRecords.length,
    created: [], updated: [], unchanged: [], review: [], failed: [],
    sources: new Set(),
  };
  const sb = dryRun ? null : getClient();

  for (let i = 0; i < rawRecords.length; i++) {
    const line = i + 1;
    const { valid, errors, warnings, record } = validateRecord(coerce(rawRecords[i]));
    const key = `${record.nationality_code || "??"}→${record.destination_code || "??"}` +
                (record.residence_code ? `/${record.residence_code}` : "");

    if (!valid) { log.failed.push({ line, key, errors }); continue; }
    if (record.source_url) log.sources.add(record.source_url);
    if (record.review_status === "REQUIRES_MANUAL_REVIEW" || record.review_status === "CONFLICT") {
      log.review.push({ line, key, status: record.review_status, warnings });
    }

    const row = pick(record);
    if (dryRun) { log.created.push({ line, key, dryRun: true, warnings }); continue; }

    // Fetch existing by the unique route key to classify + diff.
    const { data: existing } = await sb
      .from("vis_rules")
      .select("*")
      .eq("nationality_code", row.nationality_code)
      .eq("destination_code", row.destination_code)
      .eq("residence_code", row.residence_code || "")
      .maybeSingle();

    if (!existing) {
      // Visibility on the public site is gated by is_active (NOT review_status).
      // New drafts must import hidden; only VERIFIED rows are published. On
      // update we leave is_active untouched so staff's publish state is kept.
      row.is_active = record.review_status === "VERIFIED";
      const { error } = await sb.from("vis_rules").insert(row);
      if (error) log.failed.push({ line, key, errors: [error.message] });
      else log.created.push({ line, key, warnings });
    } else {
      const changed = diffFields(existing, row);
      if (changed.length === 0) { log.unchanged.push({ line, key }); continue; }
      const { error } = await sb.from("vis_rules").update(row).eq("id", existing.id);
      if (error) log.failed.push({ line, key, errors: [error.message] });
      else log.updated.push({ line, key, changed });
    }
  }

  log.sources = Array.from(log.sources);
  return log;
}

// Pretty-print a log to the console (used by the CLI wrappers).
function printReport(log) {
  const n = (a) => a.length;
  console.log("\n══════════ VISA IMPORT REPORT ══════════");
  console.log(`Total input rows : ${log.total}`);
  console.log(`✅ Created        : ${n(log.created)}`);
  console.log(`♻️  Updated        : ${n(log.updated)}`);
  console.log(`➖ Unchanged      : ${n(log.unchanged)}`);
  console.log(`🔍 Needs review   : ${n(log.review)}`);
  console.log(`❌ Failed         : ${n(log.failed)}`);
  console.log(`🔗 Sources logged : ${n(log.sources)}`);

  if (n(log.updated)) {
    console.log("\n— Changed rules —");
    log.updated.forEach((u) => console.log(`  ${u.key}: ${u.changed.join(", ")}`));
  }
  if (n(log.review)) {
    console.log("\n— Requires manual review —");
    log.review.forEach((r) => console.log(`  ${r.key} [${r.status}] ${(r.warnings || []).join("; ")}`));
  }
  if (n(log.failed)) {
    console.log("\n— Failed validation —");
    log.failed.forEach((f) => console.log(`  line ${f.line} ${f.key}: ${f.errors.join("; ")}`));
  }
  console.log("════════════════════════════════════════\n");
}

module.exports = { runImport, printReport, COLUMNS, coerce };
