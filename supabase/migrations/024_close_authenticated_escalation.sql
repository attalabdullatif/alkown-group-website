-- ═══════════════════════════════════════════════════════════════
-- Migration 024: Close the "authenticated = staff" privilege escalation
--
-- PROBLEM: the client portal allows open self-registration
-- (supabase.auth.signUp). Any self-registered client becomes role
-- `authenticated` — and ~30 tables granted `authenticated` FULL access
-- (USING (true)), so anyone could sign up and then read every client's
-- PII, all invoices & accounting, internal staff notes, AI data, and
-- modify/delete visa rules and website content. Six tables from
-- migrations 018/019 also had NO RLS at all (open even to anon).
--
-- FIX: staff = a row in user_roles (public.is_staff()). Every policy is
-- rebuilt from scratch per table (ALL existing policies are dropped first,
-- so no leftover/manual permissive policy can undermine the fix):
--   A. staff-only tables          → is_staff() only
--   B. public-read + staff-write  → anon/auth may read; only staff write
--   C. client-owned tables        → staff, or the client owning the row
--                                    (clients.email = auth.email())
--
-- Public booking already goes through /api/submit-request (service role,
-- bypasses RLS), so the old anon INSERT policies on clients/requests/
-- bookings are no longer needed and are removed (spam vector).
--
-- Idempotent: safe to re-run. Requires migrations 020/021 (is_staff).
-- ═══════════════════════════════════════════════════════════════

-- Re-assert the staff helper (identical to migration 020).
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid());
$$;

-- Drops every policy on a table so we rebuild from a clean slate.
CREATE OR REPLACE FUNCTION public._drop_all_policies(p_table text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies
           WHERE schemaname = 'public' AND tablename = p_table LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, p_table);
  END LOOP;
END;
$$;

-- ═══ A. STAFF-ONLY TABLES ═══════════════════════════════════════
DO $$
DECLARE
  t text;
  staff_only text[] := ARRAY[
    -- accounting & internal CRM
    'acc_invoices','acc_payments','acc_expenses','client_notes','admins','documents',
    'request_history','client_activities','client_tasks','vis_rules_history',
    -- AI engine (server reads use the service role, which bypasses RLS)
    'ai_knowledge_collections','ai_documents','ai_chunks','ai_rag_queries',
    'ai_agent_sessions','ai_content_items','ai_content_calendar','ai_automation_runs',
    'ai_automation_insights','ai_brand_memory','ai_analytics_events',
    'ai_document_links','ai_document_versions',
    -- legacy Timatic schema (migration 018) — had NO RLS at all
    'country_profiles','visa_rules','residency_programs','citizenship_programs'
  ];
BEGIN
  FOREACH t IN ARRAY staff_only LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      PERFORM public._drop_all_policies(t);
      EXECUTE format(
        'CREATE POLICY staff_all ON public.%I FOR ALL TO authenticated
           USING (public.is_staff()) WITH CHECK (public.is_staff())', t);
    END IF;
  END LOOP;
END $$;

-- ═══ B. PUBLIC-READ + STAFF-WRITE TABLES ════════════════════════
DO $$
DECLARE
  t text;
  has_active boolean;
  pub_read text[] := ARRAY[
    'site_content','vis_countries','vis_rules','crm_stages','categories',
    'knowledge_articles','residency_page_content','services'
  ];
BEGIN
  FOREACH t IN ARRAY pub_read LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      PERFORM public._drop_all_policies(t);

      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = t AND column_name = 'is_active'
      ) INTO has_active;

      IF has_active THEN
        EXECUTE format(
          'CREATE POLICY public_read ON public.%I FOR SELECT TO anon, authenticated
             USING (is_active = true OR public.is_staff())', t);
      ELSE
        EXECUTE format(
          'CREATE POLICY public_read ON public.%I FOR SELECT TO anon, authenticated
             USING (true)', t);
      END IF;

      EXECUTE format(
        'CREATE POLICY staff_write ON public.%I FOR ALL TO authenticated
           USING (public.is_staff()) WITH CHECK (public.is_staff())', t);
    END IF;
  END LOOP;
END $$;

-- ═══ C. CLIENT-OWNED TABLES (staff OR the owning client) ════════

-- clients: a client sees/edits only their own row (matched by email).
DO $$ BEGIN
  IF to_regclass('public.clients') IS NOT NULL THEN
    ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
    PERFORM public._drop_all_policies('clients');
    CREATE POLICY clients_select ON public.clients FOR SELECT TO authenticated
      USING (public.is_staff() OR email = auth.email());
    CREATE POLICY clients_insert ON public.clients FOR INSERT TO authenticated
      WITH CHECK (public.is_staff() OR email = auth.email());
    CREATE POLICY clients_update ON public.clients FOR UPDATE TO authenticated
      USING (public.is_staff() OR email = auth.email())
      WITH CHECK (public.is_staff() OR email = auth.email());
    CREATE POLICY clients_delete ON public.clients FOR DELETE TO authenticated
      USING (public.is_staff());
  END IF;
END $$;

-- requests: a client sees/creates only requests on their own client record.
DO $$ BEGIN
  IF to_regclass('public.requests') IS NOT NULL THEN
    ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
    PERFORM public._drop_all_policies('requests');
    CREATE POLICY requests_select ON public.requests FOR SELECT TO authenticated
      USING (public.is_staff()
             OR client_id IN (SELECT id FROM public.clients WHERE email = auth.email()));
    CREATE POLICY requests_insert ON public.requests FOR INSERT TO authenticated
      WITH CHECK (public.is_staff()
             OR client_id IN (SELECT id FROM public.clients WHERE email = auth.email()));
    CREATE POLICY requests_update ON public.requests FOR UPDATE TO authenticated
      USING (public.is_staff()) WITH CHECK (public.is_staff());
    CREATE POLICY requests_delete ON public.requests FOR DELETE TO authenticated
      USING (public.is_staff());
  END IF;
END $$;

-- invoices: a client sees only invoices on their own requests.
DO $$ BEGIN
  IF to_regclass('public.invoices') IS NOT NULL THEN
    ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
    PERFORM public._drop_all_policies('invoices');
    CREATE POLICY invoices_select ON public.invoices FOR SELECT TO authenticated
      USING (public.is_staff()
             OR request_id IN (
               SELECT r.id FROM public.requests r
               WHERE r.client_id IN (SELECT c.id FROM public.clients c WHERE c.email = auth.email())));
    CREATE POLICY invoices_staff ON public.invoices FOR ALL TO authenticated
      USING (public.is_staff()) WITH CHECK (public.is_staff());
  END IF;
END $$;

-- request_files: a client sees/uploads files only on their own requests.
DO $$ BEGIN
  IF to_regclass('public.request_files') IS NOT NULL THEN
    ALTER TABLE public.request_files ENABLE ROW LEVEL SECURITY;
    PERFORM public._drop_all_policies('request_files');
    CREATE POLICY request_files_select ON public.request_files FOR SELECT TO authenticated
      USING (public.is_staff()
             OR request_id IN (
               SELECT r.id FROM public.requests r
               WHERE r.client_id IN (SELECT c.id FROM public.clients c WHERE c.email = auth.email())));
    CREATE POLICY request_files_insert ON public.request_files FOR INSERT TO authenticated
      WITH CHECK (public.is_staff()
             OR request_id IN (
               SELECT r.id FROM public.requests r
               WHERE r.client_id IN (SELECT c.id FROM public.clients c WHERE c.email = auth.email())));
    CREATE POLICY request_files_update ON public.request_files FOR UPDATE TO authenticated
      USING (public.is_staff()) WITH CHECK (public.is_staff());
    CREATE POLICY request_files_delete ON public.request_files FOR DELETE TO authenticated
      USING (public.is_staff());
  END IF;
END $$;

-- bookings: staff only (public bookings are written server-side).
DO $$ BEGIN
  IF to_regclass('public.bookings') IS NOT NULL THEN
    ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
    PERFORM public._drop_all_policies('bookings');
    CREATE POLICY bookings_staff ON public.bookings FOR ALL TO authenticated
      USING (public.is_staff()) WITH CHECK (public.is_staff());
  END IF;
END $$;

-- appointments: staff, plus the owning client may read (if client_id exists).
DO $$
DECLARE has_client boolean;
BEGIN
  IF to_regclass('public.appointments') IS NOT NULL THEN
    ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
    PERFORM public._drop_all_policies('appointments');
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'client_id'
    ) INTO has_client;
    IF has_client THEN
      EXECUTE 'CREATE POLICY appointments_select ON public.appointments FOR SELECT TO authenticated
                 USING (public.is_staff()
                        OR client_id IN (SELECT id FROM public.clients WHERE email = auth.email()))';
    END IF;
    EXECUTE 'CREATE POLICY appointments_staff ON public.appointments FOR ALL TO authenticated
               USING (public.is_staff()) WITH CHECK (public.is_staff())';
  END IF;
END $$;

-- ═══ PUBLIC INVOICE VERIFICATION (/verify-invoice?inv=...) ══════
-- The public verify page read `invoices` directly, which anon has never
-- been allowed to do (migration 014) — so it was broken for visitors.
-- This SECURITY DEFINER function returns only what verification needs,
-- for one exact invoice number. The client's phone is NOT exposed.
DROP FUNCTION IF EXISTS public.verify_invoice(text);
CREATE FUNCTION public.verify_invoice(p_number text)
RETURNS TABLE (
  invoice_number text,
  amount         numeric,
  status         text,
  created_at     timestamptz,
  service_name   text,
  client_name    text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.invoice_number::text, i.amount::numeric, i.status::text,
         i.created_at::timestamptz, s.name::text, c.full_name::text
  FROM public.invoices i
  LEFT JOIN public.requests r ON r.id = i.request_id
  LEFT JOIN public.services s ON s.id = r.service_id
  LEFT JOIN public.clients  c ON c.id = r.client_id
  WHERE i.invoice_number = trim(p_number)
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.verify_invoice(text) TO anon, authenticated;

-- Remove the temporary helper — it must not stay callable as an API RPC.
DROP FUNCTION IF EXISTS public._drop_all_policies(text);

-- ═══ VERIFY ═════════════════════════════════════════════════════
-- 1) Tables in `public` that still have RLS DISABLED (should be empty):
--      SELECT tablename FROM pg_tables
--      WHERE schemaname = 'public' AND NOT rowsecurity ORDER BY 1;
-- 2) Policies still granting authenticated USING (true) (review any hits):
--      SELECT tablename, policyname, cmd, qual FROM pg_policies
--      WHERE schemaname = 'public' AND qual = 'true' AND 'authenticated' = ANY(roles);
