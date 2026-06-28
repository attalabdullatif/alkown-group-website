#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// The live vis_rules table requires visa_requirement NOT NULL, but a few
// Wikipedia rows had wording the parser couldn't classify (e.g. Seychelles
// "Travel Authorisation"), leaving visa_type null → those rows fail import.
//
// This patches such rows IN PLACE to a conservative placeholder
// (visa_required) so they import into the review queue, flagged for staff to
// set the real type. Idempotent. Run once, then re-run import-all.js.
//
// Usage: node scripts/visa-engine/harvest/fix-null-visatype.js
// ═══════════════════════════════════════════════════════════════

const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const dirs = [path.join(dataDir, "generated"), dataDir];
const FLAG_AR = " (نوع التأشيرة غير محدّد من المصدر — وُضع 'تأشيرة مطلوبة' مؤقتاً، تحقّق.)";
const FLAG_EN = " (Visa type unparsed from source — set to 'visa_required' as a placeholder; verify.)";

let fixed = 0;
for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    const file = path.join(dir, f);
    let rows;
    try { rows = JSON.parse(fs.readFileSync(file, "utf8")); } catch { continue; }
    if (!Array.isArray(rows)) continue;
    let changed = false;
    for (const r of rows) {
      if (r.visa_type == null || r.visa_type === "") {
        r.visa_type = "visa_required";
        if (r.visa_required == null) r.visa_required = true;
        r.notes_ar = (r.notes_ar ? r.notes_ar : "") + FLAG_AR;
        r.notes = (r.notes ? r.notes : "") + FLAG_EN;
        fixed++; changed = true;
      }
    }
    if (changed) fs.writeFileSync(file, JSON.stringify(rows, null, 2) + "\n");
  }
}
console.log(`Patched ${fixed} rows with null visa_type → 'visa_required' (flagged for review).`);
