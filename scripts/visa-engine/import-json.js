#!/usr/bin/env node
// Import visa rules from a JSON file into vis_rules.
// Usage: node scripts/visa-engine/import-json.js <file.json> [--dry-run]
//
// File may be a plain array, or { "records": [...] } / { "visa_rules": [...] }.

const fs = require("fs");
const { runImport, printReport } = require("./lib/importCore");

(async function () {
  const file = process.argv[2];
  const dryRun = process.argv.includes("--dry-run");
  if (!file) {
    console.error("Usage: node import-json.js <file.json> [--dry-run]");
    process.exit(1);
  }

  let raw;
  try { raw = JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (e) { console.error("Cannot read/parse JSON:", e.message); process.exit(1); }

  const records = Array.isArray(raw) ? raw : (raw.records || raw.visa_rules || []);
  if (!records.length) { console.error("No records found in file."); process.exit(1); }

  if (dryRun) console.log("DRY RUN — validating only, no database writes.");
  const log = await runImport(records, { dryRun });
  printReport(log);
  process.exit(log.failed.length ? 2 : 0);
})().catch((e) => { console.error("Import error:", e.message); process.exit(1); });
