/**
 * Visa Data Importer Service
 *
 * Abstract architecture for bulk-importing visa rules from multiple sources.
 * Future integration points:
 *   - CSV files exported from government portals
 *   - JSON from third-party APIs
 *   - Timatic (IATA's official travel information database)
 *   - Custom API adapters
 *
 * To add a new source: extend BaseImporter and register in IMPORTERS map.
 */
import { supabase } from "./supabase";

// ─── Base Importer ────────────────────────────────────────────────────────────
class BaseImporter {
  constructor(source) {
    this.source = source;
    this.errors = [];
    this.imported = 0;
    this.skipped = 0;
  }

  /** Override: transform raw data into vis_rules row shape */
  // eslint-disable-next-line no-unused-vars
  transform(rawRow) {
    throw new Error(`${this.constructor.name}.transform() not implemented`);
  }

  /** Override: validate a single transformed row */
  validate(row) {
    const required = ["nationality_code","destination_code","visa_requirement"];
    return required.every(k => row[k]);
  }

  /** Upsert validated rows into vis_rules */
  async persist(rows) {
    const valid = rows.filter(r => {
      if (!this.validate(r)) { this.skipped++; return false; }
      return true;
    });

    if (!valid.length) return;

    const { error, count } = await supabase
      .from("vis_rules")
      .upsert(
        valid.map(r => ({ ...r, source: this.source })),
        { onConflict: "nationality_code,destination_code,residence_code", ignoreDuplicates: false, count: "exact" }
      );

    if (error) throw error;
    this.imported += count ?? valid.length;
  }

  /** Main entry point */
  async import(data) {
    this.errors = []; this.imported = 0; this.skipped = 0;

    let rows;
    try {
      rows = Array.isArray(data) ? data.map(r => this.transform(r)) : [this.transform(data)];
    } catch (e) {
      this.errors.push(`Transform failed: ${e.message}`);
      return this.summary();
    }

    await this.persist(rows);
    return this.summary();
  }

  summary() {
    return { source: this.source, imported: this.imported, skipped: this.skipped, errors: this.errors };
  }
}

// ─── JSON Importer ────────────────────────────────────────────────────────────
// Expected input shape: vis_rules row (or array of rows) with camelCase or snake_case
export class JSONImporter extends BaseImporter {
  constructor() { super("json"); }

  transform(raw) {
    return {
      nationality_code:  (raw.nationalityCode || raw.nationality_code || "").toUpperCase(),
      destination_code:  (raw.destinationCode || raw.destination_code || "").toUpperCase(),
      residence_code:    ((raw.residenceCode || raw.residence_code) ?? "").toUpperCase(),
      visa_requirement:  raw.visaRequirement || raw.visa_requirement,
      stay_days:         raw.stayDays        || raw.stay_days        || null,
      processing_min:    raw.processingMin   || raw.processing_min   || null,
      processing_max:    raw.processingMax   || raw.processing_max   || null,
      fee_usd:           raw.feeUsd          || raw.fee_usd          || null,
      documents:         raw.documents       || [],
      notes_ar:          raw.notesAr         || raw.notes_ar         || null,
      notes_en:          raw.notesEn         || raw.notes_en         || null,
      is_popular:        raw.isPopular       || raw.is_popular       || false,
      last_verified:     raw.lastVerified    || raw.last_verified    || new Date().toISOString().slice(0,10),
    };
  }
}

// ─── CSV Importer ─────────────────────────────────────────────────────────────
// Expected CSV columns:
// nationality_code,destination_code,residence_code,visa_requirement,
// stay_days,processing_min,processing_max,fee_usd,notes_ar,notes_en,is_popular
export class CSVImporter extends BaseImporter {
  constructor() { super("csv"); }

  /** Parse CSV text → array of raw objects */
  parse(csvText) {
    const lines  = csvText.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim().replace(/"/g,""));
    return lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim().replace(/"/g,""));
      return Object.fromEntries(headers.map((h,i) => [h, values[i] ?? ""]));
    });
  }

  transform(raw) {
    return {
      nationality_code: (raw.nationality_code || "").toUpperCase(),
      destination_code: (raw.destination_code || "").toUpperCase(),
      residence_code:   (raw.residence_code ?? "").toUpperCase(),
      visa_requirement: raw.visa_requirement,
      stay_days:        raw.stay_days        ? parseInt(raw.stay_days)        : null,
      processing_min:   raw.processing_min   ? parseInt(raw.processing_min)   : null,
      processing_max:   raw.processing_max   ? parseInt(raw.processing_max)   : null,
      fee_usd:          raw.fee_usd          ? parseFloat(raw.fee_usd)        : null,
      documents:        raw.documents        ? JSON.parse(raw.documents)      : [],
      notes_ar:         raw.notes_ar         || null,
      notes_en:         raw.notes_en         || null,
      is_popular:       raw.is_popular === "true" || raw.is_popular === "1",
      last_verified:    new Date().toISOString().slice(0,10),
    };
  }

  /** Full pipeline: parse CSV text then import */
  async importCSV(csvText) {
    return this.import(this.parse(csvText));
  }
}

// ─── Timatic Adapter (STUB — future integration) ──────────────────────────────
// IATA Timatic is the industry standard for visa/health/customs requirements.
// Airline check-in systems use it. Integration requires IATA membership + API key.
export class TimaticImporter extends BaseImporter {
  constructor() { super("timatic"); }

  // Future: call https://www.iata.org/timatic/api with credentials
  async query({ nationalityCode, destinationCode, residenceCode }) {
    // eslint-disable-next-line no-unused-vars
    const _params = { nationalityCode, destinationCode, residenceCode };
    throw new Error("Timatic integration not yet configured. Add TIMATIC_API_KEY to environment.");
  }

  transform(timaticRow) {
    // Timatic returns XML/JSON — map fields here when integrated
    return {
      nationality_code: timaticRow.PassportNationality,
      destination_code: timaticRow.DestinationCountry,
      residence_code:   (timaticRow.ResidenceCountry ?? "").toUpperCase(),
      visa_requirement: mapTimaticVisa(timaticRow.VisaRequirement),
      stay_days:        timaticRow.MaximumStay || null,
      processing_min:   null,
      processing_max:   null,
      documents:        [],
      notes_en:         timaticRow.AdditionalInfo || null,
    };
  }
}

function mapTimaticVisa(timaticCode) {
  // Timatic codes → our requirement enum (extend as needed)
  const map = {
    "VISA FREE":        "visa_free",
    "VISA ON ARRIVAL":  "visa_on_arrival",
    "E-VISA":           "evisa",
    "ETA":              "eta",
    "VISA REQUIRED":    "embassy_visa",
  };
  return map[timaticCode?.toUpperCase()] || "embassy_visa";
}

// ─── Factory ──────────────────────────────────────────────────────────────────
const IMPORTERS = { json: JSONImporter, csv: CSVImporter, timatic: TimaticImporter };

export function createImporter(type) {
  const Cls = IMPORTERS[type];
  if (!Cls) throw new Error(`Unknown importer type: ${type}. Available: ${Object.keys(IMPORTERS).join(", ")}`);
  return new Cls();
}

// ─── Country Importer ─────────────────────────────────────────────────────────
export async function importCountries(rows) {
  const { error } = await supabase
    .from("vis_countries")
    .upsert(rows, { onConflict: "code" });
  if (error) throw error;
}
