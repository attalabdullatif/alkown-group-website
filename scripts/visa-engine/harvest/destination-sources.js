// ═══════════════════════════════════════════════════════════════
// Destination ISO → official entry/eVisa portal (the verification target
// for any nationality → that destination). Supplied + verified by staff on
// 2026-04-01. Used by enrich-sources.js to fill `official_website` on draft
// rows. Filling this does NOT verify the verdict — rows stay LOW /
// REQUIRES_MANUAL_REVIEW until a human confirms against this portal.
//
// NOT mappable to a single ISO-2 (handle manually, excluded here):
//   - Iraqi Kurdistan Region → https://visit.gov.krd
//   - Schengen Area / ETIAS  → https://travel-europe.europa.eu
//     (ETIAS is for visa-exempt travellers only — do NOT blanket-apply it
//      to Schengen states for visa-required nationalities.)
// ═══════════════════════════════════════════════════════════════

const VERIFIED_DATE = "2026-04-01";

const u = (s) => "https://" + s.replace(/^https?:\/\//, "");

const DESTINATION_SOURCES = {
  // ── Asia ──
  AM: u("evisa.mfa.am"), AZ: u("evisa.gov.az"), BH: u("evisa.gov.bh"),
  KH: u("evisa.gov.kh"), CN: u("mfa.gov.cn"), GE: u("evisa.gov.ge"),
  HK: u("immd.gov.hk"), IN: u("indianvisaonline.gov.in"), ID: u("evisa.imigrasi.go.id"),
  IR: u("evisatraveller.mfa.ir"), IQ: u("evisa.iq"), IL: u("israel-entry.piba.gov.il"),
  JP: u("evisa.mofa.go.jp"), JO: u("eservices.moi.gov.jo"), KZ: u("vmp.gov.kz"),
  KW: u("kuwaitvisa.moi.gov.kw"), KG: u("evisa.e-gov.kg"), LA: u("laoevisa.gov.la"),
  MY: u("malaysiavisa.imi.gov.my"), MN: u("evisa.mn"), MM: u("evisa.moip.gov.mm"),
  OM: u("evisa.rop.gov.om"), PK: u("visa.nadra.gov.pk"), PH: u("evisa.gov.ph"),
  QA: u("hayya.qa"), SA: u("visa.visitsaudi.com"), SG: u("eservices.ica.gov.sg"),
  KR: u("k-eta.go.kr"), LK: u("eta.gov.lk"), TJ: u("evisa.tj"),
  TH: u("thaievisa.go.th"), TR: u("evisa.gov.tr"), UZ: u("e-visa.gov.uz"),
  VN: u("evisa.gov.vn"),

  // ── Africa ──
  AO: u("smevisa.gov.ao"), BJ: u("evisa.bj"), BF: u("visaburkina.bf"),
  BI: u("migration.gov.bi"), CM: u("evisacam.cm"), CV: u("ease.gov.cv"),
  TD: u("evisa.td"), CD: u("evisa.gouv.cd"), DJ: u("evisa.gouv.dj"),
  EG: u("visa2egypt.gov.eg"), GQ: u("equatorialguinea-evisa.com"), ET: u("evisa.gov.et"),
  GA: u("evisa.dgdi.ga"), GN: u("paf.gov.gn"), CI: u("snedai.com"),
  KE: u("etakenya.go.ke"), LY: u("evisa.gov.ly"), MG: u("evisamada-mg.com"),
  MW: u("evisa.gov.mw"), MR: u("anrpts.gov.mr"), MA: u("acces-maroc.ma"),
  MZ: u("evisa.gov.mz"), NA: u("eservices.mhaiss.gov.na"), RW: u("irembo.gov.rw"),
  ST: u("smf.st"), SC: u("seychelles.govtas.com"), SL: u("evisa.sl"),
  TZ: u("visa.immigration.go.tz"), TG: u("voyage.gouv.tg"), UG: u("visas.immigration.go.ug"),
  ZM: u("eservices.zambiaimmigration.gov.zm"), ZW: u("evisa.gov.zw"),

  // ── Americas ──
  BR: u("brazil.vfsevisa.com"), CA: u("canada.ca"), CU: u("evisacuba.cu"),
  SR: u("suriname.vfsevisa.com"), US: u("esta.cbp.dhs.gov"),

  // ── Europe ──
  BY: u("evisa.by"), MD: u("evisa.gov.md"), RU: u("evisa.kdmid.ru"),
  GB: u("gov.uk"),

  // ── Oceania ──
  AU: u("homeaffairs.gov.au"), NZ: u("immigration.govt.nz"),
};

// Added via web research 2026-06-28 (official government domains, NOT part of
// the staff-verified 2026-04-01 set — confirm the verdict against these too).
const WEB_RESEARCHED = {
  NG: u("evisa.immigration.gov.ng"),   // Nigeria Immigration Service
  GH: u("evisa.immigration.gov.gh"),   // Ghana Immigration Service
  AE: u("icp.gov.ae/en"),              // UAE Federal Authority (ICP)
  MV: u("imuga.immigration.gov.mv"),   // Maldives Immigration (IMUGA)
  BD: u("visa.gov.bd"),                // Bangladesh online MRV portal
  ZA: u("ehome.dha.gov.za"),           // South Africa Dept of Home Affairs eVisa
  UA: u("evisa.mfa.gov.ua"),           // Ukraine MFA eVisa
  LB: u("general-security.gov.lb"),    // Lebanon General Security (entry authority)
  BW: u("evisa.gov.bw"),               // Botswana eVisa
  NP: u("nepaliport.immigration.gov.np"), // Nepal Dept of Immigration
  GM: u("gid.gov.gm"),                 // Gambia Immigration Department
};

Object.assign(DESTINATION_SOURCES, WEB_RESEARCHED);

module.exports = { DESTINATION_SOURCES, VERIFIED_DATE };
