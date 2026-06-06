-- ═══════════════════════════════════════════════════════════════
-- ALKOWN GLOBAL — Visa Rules Database Table
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS visa_rules_db (
  id              BIGSERIAL PRIMARY KEY,
  from_country    TEXT NOT NULL,        -- ISO code e.g. "SY"
  residence       TEXT,                 -- ISO code optional e.g. "AE"
  to_country      TEXT NOT NULL,        -- ISO code e.g. "DE"
  visa_type       TEXT NOT NULL DEFAULT 'embassy_visa',
  stay_duration   TEXT,
  processing_time TEXT,
  fee_amount      NUMERIC DEFAULT 0,
  fee_currency    TEXT DEFAULT 'USD',
  fee_note_ar     TEXT,
  notes_ar        TEXT,
  documents_ar    TEXT[],               -- Array of Arabic document names
  is_popular      BOOLEAN DEFAULT false,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE visa_rules_db ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active visa rules"
  ON visa_rules_db FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated can manage visa rules"
  ON visa_rules_db FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE TRIGGER visa_rules_updated_at
  BEFORE UPDATE ON visa_rules_db
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_visa_rules_route ON visa_rules_db(from_country, to_country);
