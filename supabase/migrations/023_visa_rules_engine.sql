-- ═══════════════════════════════════════════════════════════════
-- Migration 023: Visa Rules Engine
-- Extends the EXISTING live vis_rules table (managed by the Visa Admin
-- page, read by the public visa pages) with accuracy + audit fields.
--
-- All new columns are nullable / defaulted, so the public site keeps
-- working unchanged. Visa data is entered by verified staff workflows —
-- never fabricated. Unverified rows stay review_status =
-- 'REQUIRES_MANUAL_REVIEW' with confidence_level 'LOW'.
--
-- Idempotent: safe to re-run (ADD COLUMN IF NOT EXISTS, DROP CONSTRAINT
-- IF EXISTS before each ADD CONSTRAINT).
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Extend the visa-type enum on visa_requirement ──────────
-- Existing values stay valid; add the 3 standardized types from the
-- engine spec (electronic_authorization, restricted, special_permission).
ALTER TABLE public.vis_rules DROP CONSTRAINT IF EXISTS vis_rules_visa_requirement_check;
ALTER TABLE public.vis_rules DROP CONSTRAINT IF EXISTS vis_rules_visa_type_check;
ALTER TABLE public.vis_rules
  ADD CONSTRAINT vis_rules_visa_type_check CHECK (visa_requirement IN (
    'visa_free','visa_on_arrival','evisa','eta','visa_required','embassy_visa',
    'electronic_authorization','restricted','special_permission'
  ));

-- ── 2. New accuracy & audit columns ───────────────────────────
ALTER TABLE public.vis_rules ADD COLUMN IF NOT EXISTS visa_required            BOOLEAN;
ALTER TABLE public.vis_rules ADD COLUMN IF NOT EXISTS entry_type               TEXT DEFAULT 'unknown';
ALTER TABLE public.vis_rules ADD COLUMN IF NOT EXISTS passport_validity_months INT;
ALTER TABLE public.vis_rules ADD COLUMN IF NOT EXISTS official_website         TEXT;
ALTER TABLE public.vis_rules ADD COLUMN IF NOT EXISTS source_url               TEXT;
ALTER TABLE public.vis_rules ADD COLUMN IF NOT EXISTS source_name              TEXT;
ALTER TABLE public.vis_rules ADD COLUMN IF NOT EXISTS source_type              TEXT;
ALTER TABLE public.vis_rules ADD COLUMN IF NOT EXISTS confidence_level         TEXT DEFAULT 'LOW';
ALTER TABLE public.vis_rules ADD COLUMN IF NOT EXISTS review_status            TEXT DEFAULT 'REQUIRES_MANUAL_REVIEW';

-- ── 3. Enum guards (named so they are re-runnable; all allow NULL) ──
ALTER TABLE public.vis_rules DROP CONSTRAINT IF EXISTS vis_rules_entry_type_check;
ALTER TABLE public.vis_rules ADD CONSTRAINT vis_rules_entry_type_check
  CHECK (entry_type IS NULL OR entry_type IN ('single','multiple','single_or_multiple','unknown'));

ALTER TABLE public.vis_rules DROP CONSTRAINT IF EXISTS vis_rules_source_type_check;
ALTER TABLE public.vis_rules ADD CONSTRAINT vis_rules_source_type_check
  CHECK (source_type IS NULL OR source_type IN
    ('government','mfa','embassy','evisa_portal','border_control','secondary'));

ALTER TABLE public.vis_rules DROP CONSTRAINT IF EXISTS vis_rules_confidence_check;
ALTER TABLE public.vis_rules ADD CONSTRAINT vis_rules_confidence_check
  CHECK (confidence_level IS NULL OR confidence_level IN ('HIGH','MEDIUM','LOW'));

ALTER TABLE public.vis_rules DROP CONSTRAINT IF EXISTS vis_rules_review_status_check;
ALTER TABLE public.vis_rules ADD CONSTRAINT vis_rules_review_status_check
  CHECK (review_status IS NULL OR review_status IN
    ('VERIFIED','REQUIRES_MANUAL_REVIEW','CONFLICT'));

-- ── 4. Indexes for admin filtering ────────────────────────────
CREATE INDEX IF NOT EXISTS idx_vis_rules_review     ON public.vis_rules(review_status);
CREATE INDEX IF NOT EXISTS idx_vis_rules_confidence ON public.vis_rules(confidence_level);

-- ── 5. Change history / audit table ───────────────────────────
-- Powers the dashboard "view history" / "compare changes" actions.
CREATE TABLE IF NOT EXISTS public.vis_rules_history (
  id               BIGSERIAL PRIMARY KEY,
  rule_id          UUID,
  nationality_code CHAR(2),
  destination_code CHAR(2),
  residence_code   CHAR(2),
  action           TEXT NOT NULL,          -- insert | update | delete
  changed_by       TEXT,                   -- staff email, or NULL for service-role imports
  old_data         JSONB,
  new_data         JSONB,
  changed_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vis_history_rule  ON public.vis_rules_history(rule_id);
CREATE INDEX IF NOT EXISTS idx_vis_history_route ON public.vis_rules_history(nationality_code, destination_code);

ALTER TABLE public.vis_rules_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vis_rules_history_auth ON public.vis_rules_history;
CREATE POLICY vis_rules_history_auth ON public.vis_rules_history
  FOR ALL USING (auth.role() = 'authenticated');

-- ── 6. Trigger: log every insert/update/delete into history ───
CREATE OR REPLACE FUNCTION public.vis_rules_log_history()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_email text := current_setting('request.jwt.claim.email', true);
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.vis_rules_history
      (rule_id, nationality_code, destination_code, residence_code, action, changed_by, old_data)
    VALUES (OLD.id, OLD.nationality_code, OLD.destination_code, OLD.residence_code,
            'delete', v_email, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.vis_rules_history
      (rule_id, nationality_code, destination_code, residence_code, action, changed_by, old_data, new_data)
    VALUES (NEW.id, NEW.nationality_code, NEW.destination_code, NEW.residence_code,
            'update', v_email, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSE
    INSERT INTO public.vis_rules_history
      (rule_id, nationality_code, destination_code, residence_code, action, changed_by, new_data)
    VALUES (NEW.id, NEW.nationality_code, NEW.destination_code, NEW.residence_code,
            'insert', v_email, to_jsonb(NEW));
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS vis_rules_history_trg ON public.vis_rules;
CREATE TRIGGER vis_rules_history_trg
  AFTER INSERT OR UPDATE OR DELETE ON public.vis_rules
  FOR EACH ROW EXECUTE FUNCTION public.vis_rules_log_history();

-- Verify:
--   SELECT column_name FROM information_schema.columns WHERE table_name='vis_rules';
--   SELECT * FROM public.vis_rules_history ORDER BY changed_at DESC LIMIT 5;
