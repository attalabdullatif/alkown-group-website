-- ═══════════════════════════════════════════════════════════════
-- Migration 021: Re-enable RLS on user_roles
-- A prior manual "Disable RLS on User Roles" query left the staff
-- roster (user_id ↔ role) readable/writable by anyone. Re-enable RLS.
--
-- App usage: src/lib/auth.js reads only the current user's own row
-- (user_id = auth.uid()). There is no frontend write path — roles are
-- managed via the dashboard / service_role, which bypasses RLS.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- SELECT: a user can read only their own role row. This is all the app
-- needs (auth.js). Kept deliberately simple — referencing user_roles from
-- its own policy would risk infinite recursion. Admins read the full
-- roster via the dashboard (service_role bypasses RLS).
DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
CREATE POLICY "user_roles_select_own"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- No INSERT/UPDATE/DELETE policies: writes are blocked for anon and
-- authenticated callers. Role changes go through the Supabase dashboard
-- or a service_role key (both bypass RLS) — never the public API.

-- Verify:
--   SELECT relrowsecurity FROM pg_class WHERE relname = 'user_roles';  -- → t
