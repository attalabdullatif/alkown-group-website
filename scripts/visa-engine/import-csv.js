#!/usr/bin/env node
// Import visa rules from a CSV file into vis_rules.
// Usage: node scripts/visa-engine/import-csv.js <file.csv> [--dry-run]
//
// Header row must use the spec field names (passport_country,
// destination_country, visa_type, stay_days, ...). See templates/.

const fs = require("fs");
const { parseCsv } = require("./lib/csv");
const { runImport, printReport } = require("./lib/importCore");

(async function () {
  const file = process.argv[2];
  const dryRun = process.argv.includes("--dry-run");
  if (!file) {
    console.error("Usage: node import-csv.js <file.csv> [--dry-run]");
    process.exit(1);
  }

  let records;
  try { records = parseCsv(fs.readFileSync(file, "utf8")); }
  catch (e) { console.error("Cannot read/parse CSV:", e.message); process.exit(1); }

  if (!records.length) { console.error("No rows found in CSV."); process.exit(1); }

  if (dryRun) console.log("DRY RUN — validating only, no database writes.");
  const log = await runImport(records, { dryRun });
  printReport(log);
  process.exit(log.failed.length ? 2 : 0);
})().catch((e) => { console.error("Import error:", e.message); process.exit(1); });
