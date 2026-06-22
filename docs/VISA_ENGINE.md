# Visa Rules Engine

Infrastructure for building and maintaining Alkown Global's visa database
on top of the **existing live `vis_rules` table** (managed by the Visa Admin
page, read by the public visa pages). The engine adds accuracy/audit fields,
validation, import/export tooling, and change history.

> **Accuracy principle:** data is entered/verified by staff from official
> sources — **never fabricated**. A missing record is acceptable; an incorrect
> one is not. Unverified rows stay `review_status = 'REQUIRES_MANUAL_REVIEW'`.

---

## 1. Schema (migration 023)

`023_visa_rules_engine.sql` extends `vis_rules` with (all nullable / defaulted,
so the public site is unaffected):

| Column | Meaning |
|--------|---------|
| `visa_required` | boolean (does the route need any visa/authorization) |
| `entry_type` | `single` · `multiple` · `single_or_multiple` · `unknown` |
| `passport_validity_months` | required passport validity |
| `official_website` | official info/apply URL shown to clients |
| `source_url` | the exact source the data was verified from |
| `source_name` | name of the authority |
| `source_type` | `government` · `mfa` · `embassy` · `evisa_portal` · `border_control` · `secondary` |
| `confidence_level` | `HIGH` (govt) · `MEDIUM` (embassy) · `LOW` (secondary/unverified) |
| `review_status` | `VERIFIED` · `REQUIRES_MANUAL_REVIEW` · `CONFLICT` |

The visa-type enum on `visa_requirement` is extended with
`electronic_authorization`, `restricted`, `special_permission`.

A **`vis_rules_history`** table + trigger records every insert/update/delete
(old/new JSON, who, when) — powering the dashboard "view history / compare
changes" actions.

`vis_rules` already enforces **`UNIQUE(nationality_code, destination_code,
residence_code)`** → no duplicate routes.

---

## 2. Field mapping (spec JSON ↔ DB column)

| Spec field | DB column |
|------------|-----------|
| `passport_country` | `nationality_code` |
| `destination_country` | `destination_code` |
| `residence` | `residence_code` (default `''`) |
| `visa_type` | `visa_requirement` |
| `visa_required` | `visa_required` |
| `stay_days` | `stay_days` |
| `processing_time` | `processing_min` / `processing_max` |
| `government_fee` | `fee_usd` |
| `documents_required` | `documents` (jsonb) |
| `notes` | `notes_en` (`notes_ar` optional) |
| `last_updated` | `last_verified` |
| `status` | `review_status` |
| others | same name |

---

## 3. Importing data

Set env first (service-role key — server-side only):

```bash
export REACT_APP_SUPABASE_URL="https://xxxx.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service role key>"
```

```bash
# Validate only — no DB writes (always do this first):
node scripts/visa-engine/import-json.js my-data.json --dry-run
node scripts/visa-engine/import-csv.js  my-data.csv  --dry-run

# Import for real:
node scripts/visa-engine/import-json.js my-data.json
node scripts/visa-engine/import-csv.js  my-data.csv
```

Each run prints a report: **created / updated (with changed fields) /
unchanged / needs-review / failed**, plus the list of source URLs logged.
Existing routes are matched on the unique key and only updated if a field
actually changed (this is the "detect changed rules" step).

Templates: `scripts/visa-engine/templates/visa_rules.template.{json,csv}`.

---

## 4. Exporting data

```bash
node scripts/visa-engine/export.js ./exports
# → exports/visa_rules_<date>.json  and  .csv
```

---

## 5. Validation rules (`lib/validate.js`)

- ISO-3166-1 alpha-2 codes only (validated against `lib/iso-countries.json`).
- Passport must be one of the 22 Arab codes (others → warning, still allowed).
- Enums checked (visa_type, entry_type, source_type, confidence, status).
- **No confidence without a source:** `HIGH`/`MEDIUM` with no `source_url` +
  `source_type` is downgraded to `LOW` + `REQUIRES_MANUAL_REVIEW`.
- Incomplete rows (no visa_type / stay_days / source) → `REQUIRES_MANUAL_REVIEW`.
- Invalid rows are **never written** — they're reported under "failed".

---

## 6. Team workflow (data entry)

1. Research each route from an **official** source (govt immigration / MFA /
   embassy / eVisa portal / border authority).
2. Enter it via the **Visa Admin page** (`/visa-admin`) or prepare a JSON/CSV
   from the template.
3. Fill `source_url`, `source_name`, `source_type`, set `confidence_level`,
   and only then `status = VERIFIED`.
4. If you can't verify: leave unknown fields null, add a `notes` explanation,
   keep `status = REQUIRES_MANUAL_REVIEW`.

Recommended order (per the brief): all 22 Arab passports × top 50 destinations
first, then expand.

---

## 7. Scheduling updates (optional, later)

Run a periodic re-import / re-verification with a scheduled job (Vercel Cron or
the project's scheduling tooling) calling `import-*` against a maintained source
file, then review the report's "changed rules" section. Not enabled by default.

---

## 8. Future: official data source

For scale + auto-freshness, feed verified data from an authoritative visa API
(e.g. IATA Timatic, sherpa°) into the import scripts instead of manual entry —
the schema, validation, and history already support it.
