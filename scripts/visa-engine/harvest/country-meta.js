#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// Build country metadata (capital, currency, calling code, languages,
// neighbours, region, flag, Arabic name) for the visa result page, from the
// open mledoze/countries dataset (ODbL — free reuse with attribution).
// Source: https://github.com/mledoze/countries
//
// Output: src/data/countryMeta.json, keyed by ISO-3166-1 alpha-2.
//
// Usage: node scripts/visa-engine/harvest/country-meta.js
// ═══════════════════════════════════════════════════════════════

const fs = require("fs");
const path = require("path");

(async () => {
  const url = "https://raw.githubusercontent.com/mledoze/countries/master/countries.json";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`mledoze/countries ${res.status}`);
  const all = await res.json();

  // cca3 → cca2 (to turn the `borders` list into neighbour ISO-2 codes)
  const a3to2 = {};
  for (const c of all) a3to2[c.cca3] = c.cca2;

  const out = {};
  for (const c of all) {
    const curCode = Object.keys(c.currencies || {})[0] || null;
    const cur = curCode ? c.currencies[curCode] : null;
    const callingCode = c.idd?.root
      ? c.idd.root + (c.idd.suffixes?.length === 1 ? c.idd.suffixes[0] : "")
      : null;
    out[c.cca2] = {
      code: c.cca2,
      name_en: c.name?.common || null,
      name_ar: c.translations?.ara?.common || null,
      flag: c.flag || null,
      capital: (c.capital && c.capital[0]) || null,
      region: c.region || null,
      subregion: c.subregion || null,
      currency_code: curCode,
      currency_name: cur?.name || null,
      currency_symbol: cur?.symbol || null,
      calling_code: callingCode,
      languages: Object.values(c.languages || {}),
      neighbors: (c.borders || []).map((b) => a3to2[b]).filter(Boolean),
      demonym: c.demonyms?.eng?.m || null,
      area_km2: c.area || null,
    };
  }

  const outFile = path.join(__dirname, "..", "..", "..", "src", "data", "countryMeta.json");
  fs.writeFileSync(outFile, JSON.stringify(out, null, 0) + "\n");
  console.log(`Wrote metadata for ${Object.keys(out).length} countries → ${path.relative(process.cwd(), outFile)}`);
  console.log("Sample (TR):", JSON.stringify(out.TR));
})().catch((e) => { console.error("ERROR", e.message); process.exit(1); });
