-- ═══════════════════════════════════════════════════════════════
-- Migration 014: Fix RLS Security — Enable Row-Level Security
-- on all public tables that were missing policies.
-- Reported by Supabase Security Advisor — 08 Jun 2026
-- ═══════════════════════════════════════════════════════════════

-- ── 1. ADMINS ─────────────────────────────────────────────────
-- Only authenticated users can read the admins table.
-- No public access at all.
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_select_authenticated"
  ON public.admins FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admins_insert_authenticated"
  ON public.admins FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "admins_update_authenticated"
  ON public.admins FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "admins_delete_authenticated"
  ON public.admins FOR DELETE
  TO authenticated
  USING (true);

-- ── 2. BOOKINGS ───────────────────────────────────────────────
-- CRM bookings — authenticated staff only.
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings_select_authenticated"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "bookings_insert_authenticated"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "bookings_update_authenticated"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "bookings_delete_authenticated"
  ON public.bookings FOR DELETE
  TO authenticated
  USING (true);

-- Allow anonymous INSERT so website visitors can submit booking forms
CREATE POLICY "bookings_insert_anon"
  ON public.bookings FOR INSERT
  TO anon
  WITH CHECK (true);

-- ── 3. CATEGORIES ─────────────────────────────────────────────
-- Public read (used in public website), authenticated write.
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_public"
  ON public.categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "categories_insert_authenticated"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "categories_update_authenticated"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "categories_delete_authenticated"
  ON public.categories FOR DELETE
  TO authenticated
  USING (true);

-- ── 4. CLIENT_NOTES ───────────────────────────────────────────
-- Internal CRM notes — authenticated staff only.
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_notes_select_authenticated"
  ON public.client_notes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "client_notes_insert_authenticated"
  ON public.client_notes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "client_notes_update_authenticated"
  ON public.client_notes FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "client_notes_delete_authenticated"
  ON public.client_notes FOR DELETE
  TO authenticated
  USING (true);

-- ── 5. CLIENTS ────────────────────────────────────────────────
-- Core CRM table — authenticated staff only.
-- Anonymous INSERT allowed so website forms can create new clients.
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_select_authenticated"
  ON public.clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "clients_insert_authenticated"
  ON public.clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "clients_insert_anon"
  ON public.clients FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "clients_update_authenticated"
  ON public.clients FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "clients_delete_authenticated"
  ON public.clients FOR DELETE
  TO authenticated
  USING (true);

-- ── 6. CRM_STAGES ─────────────────────────────────────────────
-- Lookup/config table — public read, authenticated write.
ALTER TABLE public.crm_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_stages_select_public"
  ON public.crm_stages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "crm_stages_insert_authenticated"
  ON public.crm_stages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "crm_stages_update_authenticated"
  ON public.crm_stages FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "crm_stages_delete_authenticated"
  ON public.crm_stages FOR DELETE
  TO authenticated
  USING (true);

-- ── 7. DOCUMENTS ──────────────────────────────────────────────
-- Client documents — authenticated staff only.
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_select_authenticated"
  ON public.documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "documents_insert_authenticated"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "documents_update_authenticated"
  ON public.documents FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "documents_delete_authenticated"
  ON public.documents FOR DELETE
  TO authenticated
  USING (true);

-- ── 8. INVOICES ───────────────────────────────────────────────
-- Financial data — authenticated staff only (highly sensitive).
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_select_authenticated"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "invoices_insert_authenticated"
  ON public.invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "invoices_update_authenticated"
  ON public.invoices FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "invoices_delete_authenticated"
  ON public.invoices FOR DELETE
  TO authenticated
  USING (true);

-- ── 9. REQUEST_FILES ──────────────────────────────────────────
-- Uploaded files linked to requests — authenticated only.
ALTER TABLE public.request_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "request_files_select_authenticated"
  ON public.request_files FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "request_files_insert_authenticated"
  ON public.request_files FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "request_files_update_authenticated"
  ON public.request_files FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "request_files_delete_authenticated"
  ON public.request_files FOR DELETE
  TO authenticated
  USING (true);

-- ── 10. REQUESTS ──────────────────────────────────────────────
-- Core CRM requests — authenticated staff + anon INSERT
-- so website booking forms can create requests.
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "requests_select_authenticated"
  ON public.requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "requests_insert_authenticated"
  ON public.requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "requests_insert_anon"
  ON public.requests FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "requests_update_authenticated"
  ON public.requests FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "requests_delete_authenticated"
  ON public.requests FOR DELETE
  TO authenticated
  USING (true);

-- ═══════════════════════════════════════════════════════════════
-- Done. All 10 tables now have RLS enabled.
-- Verify with:
--   SELECT tablename, rowsecurity
--   FROM pg_tables
--   WHERE schemaname = 'public'
--   ORDER BY tablename;
-- ═══════════════════════════════════════════════════════════════
