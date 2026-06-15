-- ═══════════════════════════════════════════════════════════════
-- ALKOWN GLOBAL — Countries Table
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS countries_db (
  id          BIGSERIAL PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,   -- ISO 2-letter e.g. "SY"
  name_en     TEXT NOT NULL,
  name_ar     TEXT NOT NULL,
  flag        TEXT,                   -- emoji flag e.g. "🇸🇾"
  region      TEXT DEFAULT 'Other',
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE countries_db ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active countries"
  ON countries_db FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated can manage countries"
  ON countries_db FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE TRIGGER countries_updated_at
  BEFORE UPDATE ON countries_db
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_countries_code ON countries_db(code);
