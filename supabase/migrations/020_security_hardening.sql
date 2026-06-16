-- ═══════════════════════════════════════════════════════════════
-- Migration 020: Security Hardening
-- Closes anonymous data-exposure holes found in the security audit
-- (see docs/SECURITY_AUDIT.md). Replaces open `USING (true)` reads with
-- role-scoped policies + SECURITY DEFINER tracking functions.
--
-- Identity model:
--   • Staff  = a row in user_roles for the current auth.uid()
--   • Client = a row in clients whose email matches auth.email()
-- ═══════════════════════════════════════════════════════════════

-- ── Helper: is the current user a staff member? ───────────────
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()
  );
$$;

-- ═══════════════════════════════════════════════════════════════
-- 1. VISA APPLICATIONS — stop anonymous reads of all PII
-- ═══════════════════════════════════════════════════════════════

-- The old policy was named "read own application" but used USING (true),
-- exposing every application (incl. internal_notes) to anon.
DROP POLICY IF EXISTS "Anyone can read own application" ON public.visa_applications;

-- Staff can read every application (dashboard / admin intelligence).
DROP POLICY IF EXISTS "visa_apps_select_staff" ON public.visa_applications;
CREATE POLICY "visa_apps_select_staff"
  ON public.visa_applications FOR SELECT
  TO authenticated
  USING (public.is_staff());

-- Public submission stays open (the website form). Keep existing
-- "Anyone can submit visa application" INSERT policy as-is.

-- Restrict updates to staff only (was: any authenticated user).
DROP POLICY IF EXISTS "Admins can update applications" ON public.visa_applications;
CREATE POLICY "visa_apps_update_staff"
  ON public.visa_applications FOR UPDATE
  TO authenticated
  USING (public.is_staff());

-- Secure public tracking: requires the application id + the email used
-- to submit. Returns safe columns only (never internal_notes).
CREATE OR REPLACE FUNCTION public.track_visa_application(p_id bigint, p_email text)
RETURNS TABLE (
  id           bigint,
  full_name    text,
  status       text,
  nationality  text,
  destination  text,
  travel_date  date,
  created_at   timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, full_name, status, nationality, destination, travel_date, created_at
  FROM public.visa_applications
  WHERE id = p_id
    AND lower(email) = lower(trim(p_email));
$$;

GRANT EXECUTE ON FUNCTION public.track_visa_application(bigint, text) TO anon, authenticated;

-- ═══════════════════════════════════════════════════════════════
-- 2. REQUESTS — secure public tracking by request number
-- ═══════════════════════════════════════════════════════════════
-- requests SELECT is already authenticated-only (migration 014). The
-- public "track by number" feature now goes through this function so it
-- never needs anonymous table reads. The request number acts as the secret.
CREATE OR REPLACE FUNCTION public.track_request(p_number text)
RETURNS TABLE (
  request_number text,
  status         text,
  service_name   text,
  client_name    text,
  created_at     timestamptz,
  updated_at     timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.request_number, r.status, s.name, c.full_name, r.created_at, r.updated_at
  FROM public.requests r
  LEFT JOIN public.services s ON s.id = r.service_id
  LEFT JOIN public.clients  c ON c.id = r.client_id
  WHERE upper(r.request_number) = upper(trim(p_number));
$$;

GRANT EXECUTE ON FUNCTION public.track_request(text) TO anon, authenticated;

-- ═══════════════════════════════════════════════════════════════
-- 3. CLIENT MESSAGES & NOTIFICATIONS — scope to owner or staff
-- ═══════════════════════════════════════════════════════════════
-- Were USING (TRUE) for all roles → anyone could read/modify every
-- client's messages. Now: staff (all) OR the client who owns the row.

DROP POLICY IF EXISTS "client_messages_select" ON public.client_messages;
DROP POLICY IF EXISTS "client_messages_insert" ON public.client_messages;
DROP POLICY IF EXISTS "client_messages_update" ON public.client_messages;

CREATE POLICY "client_messages_select"
  ON public.client_messages FOR SELECT
  TO authenticated
  USING (
    public.is_staff()
    OR client_id IN (SELECT id FROM public.clients WHERE email = auth.email())
  );

CREATE POLICY "client_messages_insert"
  ON public.client_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_staff()
    OR client_id IN (SELECT id FROM public.clients WHERE email = auth.email())
  );

CREATE POLICY "client_messages_update"
  ON public.client_messages FOR UPDATE
  TO authenticated
  USING (
    public.is_staff()
    OR client_id IN (SELECT id FROM public.clients WHERE email = auth.email())
  );

DROP POLICY IF EXISTS "client_notif_select" ON public.client_notifications;
DROP POLICY IF EXISTS "client_notif_update" ON public.client_notifications;
DROP POLICY IF EXISTS "client_notif_insert" ON public.client_notifications;

CREATE POLICY "client_notif_select"
  ON public.client_notifications FOR SELECT
  TO authenticated
  USING (
    public.is_staff()
    OR client_id IN (SELECT id FROM public.clients WHERE email = auth.email())
  );

CREATE POLICY "client_notif_insert"
  ON public.client_notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_staff()
    OR client_id IN (SELECT id FROM public.clients WHERE email = auth.email())
  );

CREATE POLICY "client_notif_update"
  ON public.client_notifications FOR UPDATE
  TO authenticated
  USING (
    public.is_staff()
    OR client_id IN (SELECT id FROM public.clients WHERE email = auth.email())
  );

-- ═══════════════════════════════════════════════════════════════
-- Verify after applying:
--   SELECT * FROM public.track_request('REQ-XXXX');
--   SELECT * FROM public.track_visa_application(1, 'client@email.com');
-- ═══════════════════════════════════════════════════════════════
