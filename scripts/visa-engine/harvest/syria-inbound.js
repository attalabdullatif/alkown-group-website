#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// Build INBOUND-to-Syria rows (nationality X → destination SY) from the
// official Syrian entry-visa fee schedule (country groups, provided as an
// official table). Each group has 4 fee tiers:
//   [single/1-month, double/3-month, multiple/6-month, transit/15-day]
//
// The engine row stores one fee/entry_type, so we use the base tier
// (single entry, 1 month) as government_fee and put the full tier table in
// notes_ar. All rows → REQUIRES_MANUAL_REVIEW (staff confirm + publish).
//
// ⚠️ Group membership was transcribed from the source image — verify each
// country's group before publishing (the fee depends on the group).
//
// Usage: node scripts/visa-engine/harvest/syria-inbound.js
// ═══════════════════════════════════════════════════════════════

const fs = require("fs");
const path = require("path");

// group → { fees:[single,double,multiple,transit], countries:[ISO...] }
const GROUPS = {
  1: { visaFree: true, countries: ["LB", "JO", "MY", "MR"] },
  3: { fees: [25, 40, 50, 15], countries: [
    "DZ","CU","EG","PK","TZ","CN","TT","AZ","PE","ME","MA","AO","BW","TD",
    "LK","TJ","KH","MN","MU","NA","EC","TV","SD","YE","SC"] },
  4: { fees: [50, 75, 100, 25], countries: [
    "TR","IQ","QA","SA","ID","SN","AM","VE","CL","JP","RU","KR","CO","BR",
    "CY","CF","UY","AL","BA","NE","MX","IN","BJ","BF","TM","TL","JM","KM",
    "GD","ET","VU","GE","CI","LU","RW","ZM","ZW","SG","SZ","SR","GM","GY",
    "GN","LA","LY","LR","MW","ML","TH","MZ","MM","NP"] },
  5: { fees: [75, 110, 150, 40], countries: [
    "ZA","AT","RO","HU","GR","CH","BY","BE","SE","PY","NL","BG","OM","PH",
    "BH","PT","DK","SO","NO","IS","IT","PL","CZ","SK","SI","GW","FI","KZ",
    "LV","LT","LS","MT","MD","MK","BS"] },
  6: { fees: [100, 150, 200, 50], countries: ["AE", "UG", "DJ", "SL", "CA"] },
  7: { fees: [150, 225, 300, 75], countries: [
    "NG","GB","AR","KE","UZ","AU","AF","BI","DO","FJ","ST","CM","GQ","GH","NZ"] },
};

const records = [];
for (const [g, def] of Object.entries(GROUPS)) {
  for (const iso of def.countries) {
    if (iso === "SY") continue;
    if (def.visaFree) {
      records.push(row(iso, {
        visa_required: false, visa_type: "visa_free", fee: 0,
        notes_ar: `لا تحتاج تأشيرة لدخول سوريا (إعفاء — المجموعة ${g}).`,
        notes: `Visa-free entry to Syria (exempt — group ${g}).`,
      }));
    } else {
      const [s, d, m, tr] = def.fees;
      records.push(row(iso, {
        visa_required: true, visa_type: "visa_required", fee: s, entry_type: "single",
        notes_ar: `رسوم تأشيرة دخول سوريا (المجموعة ${g}): دخول مفرد/شهر $${s} · دخول مرتين/3 أشهر $${d} · متعدد/6 أشهر $${m} · مرور/15 يوم $${tr}.`,
        notes: `Syria entry-visa fees (group ${g}): single/1mo $${s} · double/3mo $${d} · multiple/6mo $${m} · transit/15d $${tr}.`,
      }));
    }
  }
}

function row(iso, o) {
  return {
    passport_country: iso,
    destination_country: "SY",
    residence: "",
    visa_required: o.visa_required,
    visa_type: o.visa_type,
    stay_days: null,
    processing_time: null,
    passport_validity_months: 6,
    entry_type: o.entry_type || "unknown",
    government_fee: o.fee,
    documents_required: [],
    official_website: null,
    notes: o.notes,
    notes_ar: o.notes_ar,
    last_updated: new Date().toISOString().slice(0, 10),
    source_type: "government",
    source_name: "Official Syrian entry-visa fee schedule (country-group table) — verify before publishing",
    source_url: null,
    confidence_level: "LOW",
    status: "REQUIRES_MANUAL_REVIEW",
  };
}

const outFile = path.join(__dirname, "..", "data", "syria-inbound.json");
fs.writeFileSync(outFile, JSON.stringify(records, null, 2) + "\n");
console.log(`Wrote ${records.length} inbound→SY rows → ${path.relative(process.cwd(), outFile)}`);
