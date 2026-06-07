# SaaS Readiness Report — Alkown Global

**Date:** 2026-06-07  
**Status:** Foundation Complete — SaaS Not Active

---

## 1. Executive Summary

The codebase has been prepared for future multi-tenant SaaS expansion without changing any current behavior. All changes are additive: nullable foreign keys, new tables, new service files. Existing data and user experience are untouched.

---

## 2. Database Changes

### New Tables

| Table | Purpose |
|-------|---------|
| `companies` | Tenant root. Owns all data within a company. |
| `company_settings` | Brand (logo, colors), contact info, locale per company. |
| `company_users` | Maps `auth.users` → `companies` with a canonical role. |
| `roles` | Role registry: super_admin, company_admin, manager, staff, client. |
| `permissions` | Action-on-resource registry (37 permissions seeded). |
| `role_permissions` | Default permission matrix (many-to-many). |

### Modified Tables (additive only)

All changes are `ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL`.  
`company_id = NULL` means "legacy record" — existing queries are unaffected.

| Table | Change |
|-------|--------|
| `clients` | + company_id |
| `requests` | + company_id |
| `services` | + company_id |
| `acc_invoices` | + company_id |
| `acc_payments` | + company_id |
| `acc_expenses` | + company_id |
| `visa_applications` | + company_id |

### Indexes Added

9 new indexes on `company_id` columns and `companies.slug` for fast tenant filtering.

---

## 3. New Source Files

### `src/lib/rbac.js`
Role-Based Access Control engine.

- `can(role, resource, action)` — permission check
- `requirePermission(role, resource, action)` — throws if denied
- `normalizeRole(rawRole)` — maps legacy Admin/Manager/Staff → canonical names
- `meetsLevel(role, minRole)` — hierarchy check
- `filterNavByRole(navItems, role)` — filter navigation by role

**Legacy compatibility:** Existing roles `Admin`, `Manager`, `Staff` from `user_roles` table map to `company_admin`, `manager`, `staff` via `normalizeRole()`.

### `src/lib/companyService.js`
Company/tenant operations.

- `getCompany(id)` / `createCompany()` / `updateCompany()`
- `getCompanySettings()` / `updateCompanySettings()`
- `getCompanyUsers()` / `addUserToCompany()` / `updateUserRole()` / `removeUserFromCompany()`
- `getCurrentCompanyId(userId)` — resolves active company for a user
- `withCompany(payload, companyId)` — injects company_id into any payload (no-op if null)

### `src/lib/services/crmService.js`
Business logic separated from UI.

- `getClients()` / `createClient()` / `updateClient()` / `deleteClient()`
- `getRequests()` / `createRequest()` / `updateRequestStatus()`
- `getServices()` / `createService()`
- `getOverview()` — dashboard aggregates
- All functions accept optional `{ companyId, role }` context

### `src/lib/services/notificationService.js`
Channel-agnostic notification layer.

- `notifyNewContact()` / `notifyStatusChange()`
- `notifyInvoiceSent()` / `notifyPaymentReceived()`
- `notify({ channel, type, payload })` — generic dispatcher
- Currently wraps Netlify email. Future: SMS, WhatsApp, push via channel routing.

### `src/lib/services/applicationService.js`
Unified application lifecycle (visa, residency, company formation).

- `getApplications()` / `getApplicationById()`
- `submitApplication()` — public, fire-and-forget notification
- `updateApplicationStatus()` / `assignApplication()`

### `src/lib/services/index.js`
Barrel export for stable import paths.

---

## 4. Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                         React App                             │
│                                                              │
│  Pages / Components                                          │
│    │                                                         │
│    ▼                                                         │
│  Service Layer  (src/lib/services/)                          │
│    ├── crmService.js        ← clients, requests, services    │
│    ├── applicationService.js ← visa/residency apps          │
│    └── notificationService.js ← email, SMS (future)         │
│    │                                                         │
│    ▼                                                         │
│  Core Lib  (src/lib/)                                        │
│    ├── supabase.js          ← DB client                      │
│    ├── auth.js              ← session + role lookup          │
│    ├── rbac.js              ← permission checks ✨NEW        │
│    ├── companyService.js    ← tenant management ✨NEW        │
│    ├── accounting.js        ← invoice/payment/expense        │
│    └── crmActions.js        ← raw DB actions                 │
│    │                                                         │
│    ▼                                                         │
│  Supabase (PostgreSQL)                                       │
│    ├── companies            ✨NEW — tenant root              │
│    ├── company_settings     ✨NEW — brand config             │
│    ├── company_users        ✨NEW — membership + roles       │
│    ├── roles                ✨NEW — role registry            │
│    ├── permissions          ✨NEW — permission registry      │
│    ├── role_permissions     ✨NEW — role-permission matrix   │
│    ├── clients              + company_id ✨                  │
│    ├── requests             + company_id ✨                  │
│    ├── services             + company_id ✨                  │
│    ├── acc_invoices         + company_id ✨                  │
│    ├── acc_payments         + company_id ✨                  │
│    ├── acc_expenses         + company_id ✨                  │
│    └── visa_applications    + company_id ✨                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. RBAC Permission Matrix

| Resource | super_admin | company_admin | manager | staff | client |
|----------|:-----------:|:-------------:|:-------:|:-----:|:------:|
| clients — read | ✅ | ✅ | ✅ | ✅ | — |
| clients — create/update | ✅ | ✅ | ✅ | ✅ | — |
| clients — delete | ✅ | ✅ | ✅ | — | — |
| requests — read | ✅ | ✅ | ✅ | ✅ | ✅ |
| requests — change_status | ✅ | ✅ | ✅ | ✅ | — |
| invoices — read | ✅ | ✅ | ✅ | ✅ | ✅ |
| invoices — create/update/delete | ✅ | ✅ | ✅ | — | — |
| payments — create/delete | ✅ | ✅ | ✅ | — | — |
| expenses — create/delete | ✅ | ✅ | ✅ | — | — |
| reports — export | ✅ | ✅ | ✅ | — | — |
| users — invite/update | ✅ | ✅ | ✅ | — | — |
| users — delete | ✅ | ✅ | — | — | — |
| settings — update | ✅ | ✅ | — | — | — |
| visa_applications — assign | ✅ | ✅ | ✅ | — | — |

---

## 6. Future SaaS Migration Roadmap

### Phase 1 — Tenant Activation (1–2 weeks)
- Create first `company` record for Alkown Global (seeds all existing data)
- Run `UPDATE clients SET company_id = '<alkown_id>'` etc. for all existing tables
- Add `companyId` to `AuthContext` alongside existing `role`
- Wire `withCompany()` into all create/fetch calls

### Phase 2 — Admin UI (1 week)
- Expose `company_settings` editor (brand colors, logo, contact) — shell already in `companyService.js`
- Add company user management page (invite, role change, deactivate)

### Phase 3 — Permission Enforcement (1 week)
- Pass `role` into service layer calls: `getClients({ role: userRole })`
- `requirePermission()` already throws — UI will catch and show "غير مصرح"
- Replace `ProtectedRoute allowed={[...]}` with `can(role, resource, 'read')`

### Phase 4 — Multi-Company Support (2–4 weeks)
- Add company switcher to navigation
- Scope all queries with `company_id` from context
- RLS policies extended per company
- Onboarding flow for new companies

### Phase 5 — SaaS Platform (future)
- Subscription/plan management
- White-label domains (DNS + SSL automation)
- Billing integration
- Reseller / partner portal

---

## 7. What Was NOT Changed

- No existing tables altered destructively
- No existing queries modified
- No UI components changed
- No user-facing behavior changed
- No auth flow changed
- `user_roles` table still works as before
- All existing routes and pages unchanged
