#!/usr/bin/env node
// Export vis_rules from the database to JSON + CSV.
// Usage: node scripts/visa-engine/export.js [outDir]   (default: ./exports)

const fs = require("fs");
const path = require("path");
const { getClient } = require("./lib/db");
const { toCsv } = require("./lib/csv");
const { COLUMNS } = require("./lib/importCore");

(async function () {
  const outDir = process.argv[2] || path.join(process.cwd(), "exports");
  fs.mkdirSync(outDir, { recursive: true });

  const sb = getClient();
  const { data, error } = await sb
    .from("vis_rules")
    .select("*")
    .order("nationality_code")
    .order("destination_code");
  if (error) { console.error("Export failed:", error.message); process.exit(1); }

  const stamp = new Date().toISOString().slice(0, 10);
  const rows = data || [];

  const jsonPath = path.join(outDir, `visa_rules_${stamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2));

  const csvPath = path.join(outDir, `visa_rules_${stamp}.csv`);
  fs.writeFileSync(csvPath, toCsv(rows, ["id", ...COLUMNS, "is_active", "is_popular", "updated_at"]));

  console.log(`Exported ${rows.length} rules:`);
  console.log(`  JSON → ${jsonPath}`);
  console.log(`  CSV  → ${csvPath}`);
})().catch((e) => { console.error("Export error:", e.message); process.exit(1); });
