-- ═══════════════════════════════════════════════════════════════
-- Migration 022: API rate limiting
-- Backs the per-IP rate limit on the public serverless endpoints
-- (/api/ai-rag, /api/send-contact-email). The functions call
-- check_rate_limit() via the server-side Supabase client.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id         bigserial PRIMARY KEY,
  identifier text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_lookup
  ON public.api_rate_limits (identifier, created_at);

-- RLS on, no policies → no direct anon/authenticated access. The
-- SECURITY DEFINER function below is the only way in.
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Returns TRUE if the call is allowed (under the limit) and records it;
-- FALSE if the identifier has hit p_max requests within p_window_seconds.
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier     text,
  p_max            int,
  p_window_seconds int
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  -- Drop expired entries for this identifier.
  DELETE FROM public.api_rate_limits
   WHERE identifier = p_identifier
     AND created_at < now() - make_interval(secs => p_window_seconds);

  SELECT count(*) INTO v_count
    FROM public.api_rate_limits
   WHERE identifier = p_identifier;

  IF v_count >= p_max THEN
    RETURN false;
  END IF;

  INSERT INTO public.api_rate_limits (identifier) VALUES (p_identifier);
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, int, int)
  TO anon, authenticated, service_role;
