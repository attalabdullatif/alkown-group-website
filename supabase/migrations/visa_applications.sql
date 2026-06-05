-- ═══════════════════════════════════════════════════════════════
-- ALKOWN GLOBAL — Visa Center Database Schema
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Visa Applications Table
CREATE TABLE IF NOT EXISTS visa_applications (
  id              BIGSERIAL PRIMARY KEY,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  whatsapp        TEXT,
  nationality     TEXT NOT NULL,       -- ISO country code e.g. "SY"
  residence       TEXT,                -- ISO country code e.g. "AE"
  destination     TEXT NOT NULL,       -- ISO country code e.g. "DE"
  travel_date     DATE,
  return_date     DATE,
  trip_purpose    TEXT DEFAULT 'tourism',
  notes           TEXT,
  status          TEXT DEFAULT 'new',  -- new | reviewing | approved | rejected | completed
  assigned_to     TEXT,                -- Staff member name
  internal_notes  TEXT,               -- Admin-only notes
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE visa_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to INSERT (submit application)
CREATE POLICY "Anyone can submit visa application"
  ON visa_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to SELECT their own application by email or id
CREATE POLICY "Anyone can read own application"
  ON visa_applications FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated admins to UPDATE
CREATE POLICY "Admins can update applications"
  ON visa_applications FOR UPDATE
  TO authenticated
  USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER visa_applications_updated_at
  BEFORE UPDATE ON visa_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index for fast lookup
CREATE INDEX idx_visa_applications_email ON visa_applications(email);
CREATE INDEX idx_visa_applications_status ON visa_applications(status);
CREATE INDEX idx_visa_applications_created_at ON visa_applications(created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- Future Tables (Phase 3)
-- ─────────────────────────────────────────────────────────────

-- Uncomment when ready:

-- CREATE TABLE visa_documents (
--   id            BIGSERIAL PRIMARY KEY,
--   application_id BIGINT REFERENCES visa_applications(id),
--   file_name     TEXT NOT NULL,
--   file_url      TEXT NOT NULL,
--   doc_type      TEXT,               -- passport | photo | supporting
--   uploaded_at   TIMESTAMPTZ DEFAULT NOW()
-- );

-- CREATE TABLE visa_messages (
--   id            BIGSERIAL PRIMARY KEY,
--   application_id BIGINT REFERENCES visa_applications(id),
--   sender        TEXT NOT NULL,      -- client | staff
--   message       TEXT NOT NULL,
--   read          BOOLEAN DEFAULT false,
--   created_at    TIMESTAMPTZ DEFAULT NOW()
-- );
