#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// Import every draft dataset into vis_rules in the correct order, in one
// command. Order matters so the higher-quality curated Syria rows win:
//   1. data/generated/*.json   (breadth — all 22 nationalities, incl. sy.json)
//   2. data/syria-batch1.json, syria-batch2.json  (override SY-outbound rows)
//   3. data/syria-inbound.json (X -> SY routes; distinct keys, no conflict)
//
// Every row still lands as REQUIRES_MANUAL_REVIEW — nothing is published
// until staff verify it. Pass --dry-run to validate without writing.
//
// Requires (unless --dry-run):
//   REACT_APP_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
//
// Usage:
//   node scripts/visa-engine/import-all.js --dry-run
//   node scripts/visa-engine/import-all.js
// ═══════════════════════════════════════════════════════════════

const fs = require("fs");
const path = require("path");
const { runImport } = require("./lib/importCore");

const dryRun = process.argv.includes("--dry-run");
const dataDir = path.join(__dirname, "data");
const genDir = path.join(dataDir, "generated");

// Build the ordered file list.
const files = [];
if (fs.existsSync(genDir)) {
  for (const f of fs.readdirSync(genDir).sort()) {
    if (f.endsWith(".json")) files.push(path.join(genDir, f));
  }
}
for (const f of ["syria-batch1.json", "syria-batch2.json", "syria-inbound.json"]) {
  const p = path.join(dataDir, f);
  if (fs.existsSync(p)) files.push(p);
}

if (!files.length) { console.error("No data files found."); process.exit(1); }

(async function () {
  if (dryRun) console.log("DRY RUN — validating only, no database writes.\n");
  const grand = { total: 0, created: 0, updated: 0, unchanged: 0, review: 0, failed: 0 };
  const failures = [];

  for (const file of files) {
    let rows;
    try { rows = JSON.parse(fs.readFileSync(file, "utf8")); }
    catch (e) { console.error(`✖ ${path.basename(file)}: cannot parse (${e.message})`); continue; }
    if (!Array.isArray(rows)) rows = rows.records || rows.visa_rules || [];

    const log = await runImport(rows, { dryRun });
    const rel = path.relative(process.cwd(), file);
    console.log(
      `${log.failed.length ? "✖" : "✓"} ${rel.padEnd(48)} ` +
      `rows ${String(log.total).padStart(4)} | ` +
      `created ${String(log.created.length).padStart(4)} | ` +
      `updated ${String(log.updated.length).padStart(4)} | ` +
      `review ${String(log.review.length).padStart(4)} | ` +
      `failed ${log.failed.length}`
    );
    grand.total += log.total;
    grand.created += log.created.length;
    grand.updated += log.updated.length;
    grand.unchanged += log.unchanged.length;
    grand.review += log.review.length;
    grand.failed += log.failed.length;
    for (const f of log.failed) failures.push({ file: rel, ...f });
  }

  console.log("\n══════════ GRAND TOTAL ══════════");
  console.log(`Files            : ${files.length}`);
  console.log(`Total input rows : ${grand.total}`);
  console.log(`✅ Created        : ${grand.created}`);
  console.log(`♻️  Updated        : ${grand.updated}`);
  console.log(`➖ Unchanged      : ${grand.unchanged}`);
  console.log(`🔍 Needs review   : ${grand.review}`);
  console.log(`❌ Failed         : ${grand.failed}`);
  console.log("═════════════════════════════════");

  if (failures.length) {
    console.log("\n— Failed rows —");
    failures.slice(0, 40).forEach((f) => console.log(`  ${f.file} ${f.key}: ${f.errors.join("; ")}`));
    if (failures.length > 40) console.log(`  …and ${failures.length - 40} more`);
  }
  process.exit(grand.failed ? 2 : 0);
})().catch((e) => { console.error("Import error:", e.message); process.exit(1); });
