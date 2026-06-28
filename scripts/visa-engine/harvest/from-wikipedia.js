#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// Generate visa-rule DRAFTS from Wikipedia "Visa requirements for X
// citizens" pages. Wikipedia text is CC BY-SA (reuse allowed with
// attribution) — unlike evisaguides.com, which prohibits collection.
//
// Output: scripts/visa-engine/data/generated/<code>.json, every row
// source_type=secondary / confidence_level=LOW / REQUIRES_MANUAL_REVIEW.
// Staff must verify each row against the official portal before VERIFIED.
//
// Usage:
//   node scripts/visa-engine/harvest/from-wikipedia.js PS
//   node scripts/visa-engine/harvest/from-wikipedia.js all
// ═══════════════════════════════════════════════════════════════

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const { nameToIso } = require("./country-iso");

// nationality ISO → Wikipedia page title (the 22 Arab passports).
const PAGES = {
  PS: "Visa requirements for Palestinian citizens",
  AE: "Visa requirements for Emirati citizens",
  SA: "Visa requirements for Saudi Arabian citizens",
  QA: "Visa requirements for Qatari citizens",
  KW: "Visa requirements for Kuwaiti citizens",
  BH: "Visa requirements for Bahraini citizens",
  OM: "Visa requirements for Omani citizens",
  JO: "Visa requirements for Jordanian citizens",
  LB: "Visa requirements for Lebanese citizens",
  IQ: "Visa requirements for Iraqi citizens",
  EG: "Visa requirements for Egyptian citizens",
  LY: "Visa requirements for Libyan citizens",
  TN: "Visa requirements for Tunisian citizens",
  DZ: "Visa requirements for Algerian citizens",
  MA: "Visa requirements for Moroccan citizens",
  MR: "Visa requirements for Mauritanian citizens",
  SD: "Visa requirements for Sudanese citizens",
  YE: "Visa requirements for Yemeni citizens",
  DJ: "Visa requirements for Djiboutian citizens",
  SO: "Visa requirements for Somali citizens",
  KM: "Visa requirements for Comorian citizens",
  SY: "Visa requirements for Syrian citizens",
};

const clean = (s) => (s || "").replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Polite fetch with retry/backoff — Wikipedia REST rate-limits bursts (429).
async function fetchHtml(url) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": "alkown-visa-engine/1.0 (draft generator; manual verification)" } });
    if (res.ok) return res.text();
    if (res.status === 429) { await sleep(3000 * (attempt + 1)); continue; }
    throw new Error(`Wikipedia ${res.status}`);
  }
  throw new Error("Wikipedia 429 (gave up after retries)");
}

// Map the "Visa requirement" column text → engine enum + flags.
function mapVisaType(text) {
  const t = clean(text).toLowerCase();
  if (!t) return { visa_type: null, visa_required: null, fee: null };
  if (/visa\s*not\s*required|visa[-\s]?free|freedom of movement|no visa required/.test(t))
    return { visa_type: "visa_free", visa_required: false, fee: 0 };
  if (/visa on arrival|on arrival/.test(t))
    return { visa_type: "visa_on_arrival", visa_required: true, fee: null };
  if (/e[-\s]?visa|electronic visa/.test(t)) {
    const free = /free/.test(t);
    return { visa_type: "evisa", visa_required: true, fee: free ? 0 : null };
  }
  if (/eta\b|electronic travel|travel authoris|travel authoriz|electronic authoris|electronic authoriz|k-eta|esta|etias|nzeta/.test(t))
    return { visa_type: "eta", visa_required: true, fee: null };
  if (/visa required|visa is required/.test(t))
    return { visa_type: "visa_required", visa_required: true, fee: null };
  // Unknown phrasing (tourist card, special permit, etc.): the live table
  // requires a type, so default to the conservative visa_required and let
  // staff correct it (every row is REQUIRES_MANUAL_REVIEW anyway).
  return { visa_type: "visa_required", visa_required: true, fee: null };
}

// Parse "Allowed stay" → integer days (best effort; null if open/unknown).
function parseStay(text) {
  const t = clean(text).toLowerCase();
  if (!t || /unlimited|freedom|varies/.test(t)) return null;
  let m = t.match(/(\d+)\s*day/);            if (m) return parseInt(m[1], 10);
  m = t.match(/(\d+)\s*month/);              if (m) return parseInt(m[1], 10) * 30;
  m = t.match(/(\d+)\s*week/);               if (m) return parseInt(m[1], 10) * 7;
  m = t.match(/(\d+)\s*year/);               if (m) return parseInt(m[1], 10) * 365;
  return null;
}

// Rowspan-aware grid reader: returns array of rows, each an array of cell texts.
function readGrid(table) {
  const grid = [];
  const carry = {}; // colIndex → { text, rows }
  for (const tr of table.rows) {
    const row = [];
    let col = 0;
    // place any carried (rowspan) cells first
    const placeCarry = () => {
      while (carry[col] && carry[col].rows > 0) { row[col] = carry[col]; col++; }
    };
    placeCarry();
    for (const cell of tr.cells) {
      placeCarry();
      const obj = { text: clean(cell.textContent), title: cell.querySelector("a")?.getAttribute("title") || null };
      const span = cell.rowSpan && cell.rowSpan > 1 ? cell.rowSpan : 1;
      for (let c = 0; c < (cell.colSpan || 1); c++) {
        row[col] = obj;
        if (span > 1) carry[col] = { ...obj, rows: span };
        col++;
      }
    }
    // decrement carries that were used by this row
    for (const k of Object.keys(carry)) { carry[k].rows -= 1; if (carry[k].rows <= 0) delete carry[k]; }
    grid.push(row);
  }
  return grid;
}

async function generate(code) {
  const title = PAGES[code];
  if (!title) throw new Error(`No Wikipedia page configured for ${code}`);
  const url = `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(title.replace(/ /g, "_"))}`;
  const doc = new JSDOM(await fetchHtml(url)).window.document;

  // Pick the visa table: a wikitable whose header row mentions "Visa requirement".
  const table = [...doc.querySelectorAll("table.wikitable")].find((t) =>
    /visa requirement/i.test(t.rows[0]?.textContent || ""));
  if (!table) throw new Error(`No visa table found on ${title}`);

  const grid = readGrid(table);
  const records = [];
  const skipped = [];
  for (let i = 1; i < grid.length; i++) { // skip header
    const row = grid[i];
    if (!row[0]) continue;
    const name = row[0].title || row[0].text;
    const iso = nameToIso(name);
    if (!iso) { skipped.push(name); continue; }
    if (iso === code) continue; // self
    const vt = mapVisaType(row[1]?.text);
    const stay = parseStay(row[2]?.text);
    const notes = clean(row[3]?.text) || null;
    records.push({
      passport_country: code,
      destination_country: iso,
      residence: "",
      visa_required: vt.visa_required,
      visa_type: vt.visa_type,
      stay_days: stay,
      processing_time: null,
      passport_validity_months: null,
      entry_type: "unknown",
      government_fee: vt.fee,
      documents_required: [],
      official_website: null,
      notes: notes,
      notes_ar: null,
      last_updated: new Date().toISOString().slice(0, 10),
      source_type: "secondary",
      source_url: `https://en.wikipedia.org/wiki/${title.replace(/ /g, "_")}`,
      source_name: `Wikipedia: ${title} (CC BY-SA) — verify at official portal`,
      confidence_level: "LOW",
      status: "REQUIRES_MANUAL_REVIEW",
    });
  }

  const outDir = path.join(__dirname, "..", "data", "generated");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${code.toLowerCase()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(records, null, 2) + "\n");
  console.log(`${code}: ${records.length} rows → ${path.relative(process.cwd(), outFile)}` +
    (skipped.length ? `  (skipped ${skipped.length} unmapped: ${skipped.slice(0, 12).join(", ")}${skipped.length > 12 ? "…" : ""})` : ""));
  return { code, rows: records.length, skipped };
}

(async () => {
  const arg = process.argv[2];
  if (!arg) { console.error("Usage: from-wikipedia.js <ISO|all>"); process.exit(1); }
  const codes = arg.toLowerCase() === "all" ? Object.keys(PAGES) : [arg.toUpperCase()];
  for (let i = 0; i < codes.length; i++) {
    try { await generate(codes[i]); }
    catch (e) { console.error(`${codes[i]}: ERROR ${e.message}`); }
    if (i < codes.length - 1) await sleep(1500); // be polite to Wikipedia
  }
})();
