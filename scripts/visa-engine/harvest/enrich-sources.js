#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// Fill `official_website` on draft rows from DESTINATION_SOURCES, keyed by
// destination_country. Only fills EMPTY fields — never overwrites a portal
// already set (e.g. the curated Syria batches). Does not change the verdict,
// confidence, or review status: rows stay drafts to verify against the portal.
//
// Usage:
//   node scripts/visa-engine/harvest/enrich-sources.js            # generated/ only
//   node scripts/visa-engine/harvest/enrich-sources.js --all      # generated/ + curated data/*.json
//   node scripts/visa-engine/harvest/enrich-sources.js --dry-run  # report, don't write
// ═══════════════════════════════════════════════════════════════

const fs = require("fs");
const path = require("path");
const { DESTINATION_SOURCES } = require("./destination-sources");

const dataDir = path.join(__dirname, "..", "data");
const genDir = path.join(dataDir, "generated");
const dryRun = process.argv.includes("--dry-run");
const includeCurated = process.argv.includes("--all");

const files = [];
if (fs.existsSync(genDir)) for (const f of fs.readdirSync(genDir)) if (f.endsWith(".json")) files.push(path.join(genDir, f));
if (includeCurated) for (const f of fs.readdirSync(dataDir)) if (f.endsWith(".json")) files.push(path.join(dataDir, f));

let filled = 0, already = 0, noSource = 0, totalRows = 0;
const missingDest = {}; // destination ISO → count of rows still without a portal

for (const file of files) {
  let rows;
  try { rows = JSON.parse(fs.readFileSync(file, "utf8")); } catch { continue; }
  if (!Array.isArray(rows)) continue;
  let changed = false;
  for (const r of rows) {
    totalRows++;
    const dest = (r.destination_country || "").toUpperCase();
    const has = r.official_website && String(r.official_website).trim();
    if (has) { already++; continue; }
    if (DESTINATION_SOURCES[dest]) {
      if (!dryRun) r.official_website = DESTINATION_SOURCES[dest];
      filled++; changed = true;
    } else {
      noSource++;
      missingDest[dest] = (missingDest[dest] || 0) + 1;
    }
  }
  if (changed && !dryRun) fs.writeFileSync(file, JSON.stringify(rows, null, 2) + "\n");
}

console.log(`\n══════════ ENRICH official_website ══════════`);
console.log(`Files scanned         : ${files.length}`);
console.log(`Total rows            : ${totalRows}`);
console.log(`✅ Filled${dryRun ? " (would)" : ""}        : ${filled}`);
console.log(`➖ Already had portal  : ${already}`);
console.log(`❓ No portal known     : ${noSource}  (across ${Object.keys(missingDest).length} destinations)`);

const missing = Object.entries(missingDest).sort((a, b) => b[1] - a[1]);
if (missing.length) {
  console.log(`\n— Destinations still WITHOUT an official portal (supply these next) —`);
  console.log(missing.map(([d, n]) => `${d}(${n})`).join("  "));
}
console.log(`════════════════════════════════════════════\n`);
