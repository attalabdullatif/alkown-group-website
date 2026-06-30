# Product Requirements Document (PRD)
## ALKOWN Global — الكون العالمية

**Version:** 1.0 · **Last updated:** 2026-06-29
**Product type:** Web application (public marketing site + Visa Intelligence Center + internal CRM)

---

## 1. Overview

ALKOWN Global is a global mobility services company (visas, company formation,
residency & citizenship, travel). The web application has two faces:

1. **Public website** — an Arabic-first (RTL), bilingual (AR/EN) marketing site
   whose flagship feature is a **Visa Intelligence Center**: an instant
   nationality → destination visa checker backed by a live database of visa
   rules and country facts.
2. **Internal CRM / admin** — authenticated tools for staff to manage clients,
   requests, pipeline, invoices, accounting, and the visa-rules database.

**Primary audience:** Arab travelers (the 22 Arab nationalities, with Syrian
passport holders as the priority segment) seeking accurate visa information and
mobility services.

---

## 2. Goals & success metrics

| Goal | Metric |
|------|--------|
| Give travelers accurate, instant visa answers | Visa checker returns a result in < 2s for any covered route |
| Broadest accurate coverage for Arab passports | 22 nationalities × ~193 destinations available (drafts → verified) |
| Convert lookups into consultations/applications | Click-through from result page to "Apply" / "Book consultation" |
| Trustworthy data | Every published rule traceable to an official source; drafts hidden until verified |
| Protect proprietary data | AI scraping blocked via robots.txt; admin data behind auth + RLS |

---

## 3. Tech stack

- **Frontend:** React 18 (Create React App), React Router v7, Arabic-first RTL + English i18n, inline-styled components.
- **Backend / data:** Supabase (PostgreSQL, Auth, Row-Level Security).
- **Hosting:** Vercel (auto-deploy on push to `main`); domain `alkownglobal.com`.
- **Visa data pipeline:** Node scripts under `scripts/visa-engine/` (import, enrich, generate from open sources).
- **Auth model:** Supabase Auth + role-based access control (RBAC); protected routes via `ProtectedRoute`.

---

## 4. User roles

| Role | Access |
|------|--------|
| **Visitor (anonymous)** | Public site, visa checker, knowledge center, booking/consultation form, track request, verify invoice |
| **Client** | The above + client portal (`/portal`) |
| **Staff / Admin** | CRM: dashboard, clients, requests, pipeline, tasks, documents, invoices, accounting, notifications, Visa Admin, AI tools |

---

## 5. Features & functional requirements

### 5.1 Public marketing site
- **FR-1** Landing page presents the company's service pillars: Visa Services, Company Formation, Residency & Citizenship, Travel & Tourism, Knowledge Center.
- **FR-2** Global header navigation (RTL): Home, About, Knowledge Center, Company Formation, Residency & Citizenship, Visa Center, plus "Book a consultation" and (for staff) Dashboard.
- **FR-3** Language toggle (AR ⇄ EN) switches all UI text and layout direction.
- **FR-4** All public pages render without console errors and are responsive (mobile 375px → desktop) with no horizontal overflow.

### 5.2 Visa Intelligence Center (flagship)
- **FR-5 Visa checker form:** user selects **Nationality** (required), **Country of Residence** (optional), **Destination** (required), and submits. Validation: nationality + destination required.
- **FR-6 Country selectors:** searchable dropdowns listing countries with flag + Arabic/English name + ISO code.
- **FR-7 Lookup logic:** results come from the live `vis_rules` database first (residence-specific rule preferred over the general rule), filtered to **published** rows (`is_active = true`); falls back to the curated dataset for routes not in the DB.
- **FR-8 Result page** (destination-style layout) shows:
  - Verdict badge (visa-free / visa on arrival / eVisa / eTA / embassy visa / visa required / …) with localized label + colour.
  - Key stats: fee, processing time, max stay, entry type, passport validity.
  - Required documents checklist.
  - Application steps (tailored: electronic vs embassy route).
  - Photo specifications (common guidance).
  - Tips & warnings (derived from the rule).
  - Destination country info: capital, currency, calling code, language(s), region, area.
  - Neighbouring countries (flags + names).
  - FAQs.
  - Official source link + last-verified date + disclaimer.
- **FR-9 No-data state:** if no rule exists for a route, show a graceful "no data — consult our experts" screen with CTAs (apply / new search).
- **FR-10 Popular routes:** the Visa Center landing shows clickable popular routes that deep-link into a result.
- **FR-11 Data accuracy guard:** unverified/draft rules (`review_status = REQUIRES_MANUAL_REVIEW`) are managed in Visa Admin; only rows explicitly published (`is_active = true`) appear publicly.

### 5.3 Conversion & support flows
- **FR-12** "Book a consultation" / "Apply now" entry points from the visa result and landing.
- **FR-13** Visa application submission stores a record (`visa_applications`).
- **FR-14** Track request / verify invoice public utilities.

### 5.4 Internal CRM / admin (authenticated)
- **FR-15** Login (Supabase Auth); unauthenticated users are redirected from protected routes.
- **FR-16** Dashboard + role-scoped views (management / sales / finance).
- **FR-17** Manage clients, requests, pipeline, tasks, documents, notifications.
- **FR-18** Invoices & accounting.
- **FR-19 Visa Admin** — CRUD over `vis_rules`: edit a rule, set `review_status` (VERIFIED / REQUIRES_MANUAL_REVIEW / CONFLICT), toggle `is_active` (publish/unpublish), view change history.
- **FR-20** AI tools section (knowledge, search, agents, content, calendar, memory).

---

## 6. Data model (key tables)

- **`vis_rules`** — nationality_code, destination_code, residence_code, visa_requirement, visa_required, stay_days, processing_min/max, fee_usd, passport_validity_months, entry_type, documents (JSONB), official_website, notes_ar/en, source_type/url/name, confidence_level, review_status, is_active, is_popular.
- **`vis_rules_history`** — audit log (old_data/new_data per insert/update/delete).
- **`vis_countries`** — country reference (code, names, is_active).
- **`countryMeta.json`** (client) — 250 countries: capital, currency, calling code, languages, neighbours, region (open data, ODbL).
- **`visa_applications`**, **`site_content`**, **`services`**, **`company_users`**, invoices/accounting tables.

---

## 7. Non-functional requirements

- **Security:** Row-Level Security on all tables; public can read only `is_active = true` rows; admin actions require an authenticated session. Service-role key never shipped to the browser.
- **AI-scraping protection:** `robots.txt` sets `Content-Signal: ai-train=no` and blocks major AI crawlers; CRM/admin/auth paths disallowed from indexing.
- **Internationalization:** full AR (RTL) + EN (LTR) support across the app.
- **Performance:** route-level code-splitting (lazy routes); visa lookup < 2s.
- **Reliability:** public site must keep working even if the DB is unreachable (graceful fallback).
- **Accuracy/ethics:** visa data sourced from official portals / open licensed datasets only; third-party sites that disallow collection are not scraped.

---

## 8. Out of scope (current version)

- Online visa fee payment / checkout.
- Automated real-time sync with government visa APIs.
- Native mobile apps.
- "Best time to visit" climate data (omitted — no reliable open source yet).

---

## 9. Key end-to-end test scenarios (for QA / TestSprite)

1. **Visa-free route:** Syria → Malaysia ⇒ verdict "visa-free", country info + steps shown.
2. **Visa-required route:** Syria → UAE ⇒ verdict "visa required" (not visa-on-arrival), official source link present.
3. **eVisa route:** any Arab nationality → an eVisa destination ⇒ verdict "eVisa" + official portal link.
4. **Residence override:** Syrian residing in UAE → Germany ⇒ residence-specific result when available.
5. **Form validation:** submit with missing nationality or destination ⇒ inline error, no navigation.
6. **No-data route:** an uncovered route ⇒ graceful "no data" screen with CTAs.
7. **Language toggle:** switch AR ⇄ EN on the visa result ⇒ all labels and direction update.
8. **Responsive:** visa checker on mobile (375px) ⇒ no horizontal overflow, form usable.
9. **Auth guard:** open `/dashboard` or `/visa-admin` unauthenticated ⇒ redirected to login.
10. **Admin publish:** in Visa Admin, set a draft rule to VERIFIED + `is_active = true` ⇒ it then appears in the public checker.
11. **Console health:** navigate Home → Visa Center → result → other nav pages ⇒ zero console errors.
12. **robots.txt:** `/robots.txt` returns `ai-train=no` and disallows AI crawlers + admin paths.
