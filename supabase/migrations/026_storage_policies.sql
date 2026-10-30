-- ═══════════════════════════════════════════════════════════════
-- Migration 026: Lock down Storage (same escalation as 024, in buckets)
--
-- PROBLEM: every storage policy granted the `authenticated` role full
-- access, and any visitor can self-register in the client portal. So a
-- freshly signed-up account could list, download, overwrite or delete
-- every client's passports and documents (request-documents,
-- client-documents) and replace the website's images (site-images).
--
-- FIX (staff = row in user_roles, public.is_staff()):
--   request-documents  staff: everything
--                      client: read + upload only inside the folder of a
--                              request they own  (<request_id>/...)
--   client-documents   staff only (not used by the app today)
--   site-images        anyone may read (public bucket); only staff write
--
-- All app uploads use the path "<request_id>/<...>/<file>", so the first
-- folder identifies the request.
--
-- Idempotent: safe to re-run. Requires migration 024 (is_staff).
-- ═══════════════════════════════════════════════════════════════

-- Does the signed-in client own this request? (folder name = request id)
CREATE OR REPLACE FUNCTION public.client_owns_request(p_request_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.requests r
    JOIN public.clients c ON c.id = r.client_id
    WHERE r.id::text = p_request_id
      AND c.email = auth.email()
  );
$$;
GRANT EXECUTE ON FUNCTION public.client_owns_request(text) TO authenticated;

-- Drop every existing policy that touches these buckets (including the
-- duplicates created by hand over time), then rebuild.
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND (   coalesce(qual, '')       ~ '(request-documents|client-documents|site-images)'
           OR coalesce(with_check, '') ~ '(request-documents|client-documents|site-images)')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', p.policyname);
  END LOOP;
END $$;

-- ── request-documents ───────────────────────────────────────
CREATE POLICY req_docs_select ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'request-documents'
         AND (public.is_staff() OR public.client_owns_request((storage.foldername(name))[1])));

CREATE POLICY req_docs_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'request-documents'
              AND (public.is_staff() OR public.client_owns_request((storage.foldername(name))[1])));

CREATE POLICY req_docs_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'request-documents' AND public.is_staff())
  WITH CHECK (bucket_id = 'request-documents' AND public.is_staff());

CREATE POLICY req_docs_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'request-documents' AND public.is_staff());

-- ── client-documents (staff only) ───────────────────────────
CREATE POLICY client_docs_staff ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'client-documents' AND public.is_staff())
  WITH CHECK (bucket_id = 'client-documents' AND public.is_staff());

-- ── site-images (public read, staff write) ──────────────────
CREATE POLICY site_images_read ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'site-images');

CREATE POLICY site_images_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-images' AND public.is_staff());

CREATE POLICY site_images_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'site-images' AND public.is_staff())
  WITH CHECK (bucket_id = 'site-images' AND public.is_staff());

CREATE POLICY site_images_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-images' AND public.is_staff());

-- Verify:
--   SELECT policyname, cmd, roles, qual, with_check FROM pg_policies
--   WHERE schemaname = 'storage' AND tablename = 'objects' ORDER BY policyname;
