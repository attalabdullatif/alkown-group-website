-- ═══════════════════════════════════════════════════════════════
-- PHASE 2 — STEP 8: Knowledge Engine Expansion
-- ═══════════════════════════════════════════════════════════════

-- ── Document ↔ Request links ──────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_document_links (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES ai_documents(id) ON DELETE CASCADE,
  request_id  uuid NOT NULL REFERENCES requests(id)     ON DELETE CASCADE,
  note        text,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(document_id, request_id)
);

CREATE INDEX IF NOT EXISTS idx_doc_links_document ON ai_document_links(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_links_request  ON ai_document_links(request_id);

-- ── Document version history ──────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_document_versions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  uuid NOT NULL REFERENCES ai_documents(id) ON DELETE CASCADE,
  raw_text     text NOT NULL,
  version_note text,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_doc_versions_document ON ai_document_versions(document_id);

-- ── Enrich ai_documents with version + source_url columns ────
ALTER TABLE ai_documents ADD COLUMN IF NOT EXISTS version          int     DEFAULT 1;
ALTER TABLE ai_documents ADD COLUMN IF NOT EXISTS source_url       text;
ALTER TABLE ai_documents ADD COLUMN IF NOT EXISTS linked_country   text;   -- ISO code
ALTER TABLE ai_documents ADD COLUMN IF NOT EXISTS visa_type        text;   -- tourist, work, etc.
ALTER TABLE ai_documents ADD COLUMN IF NOT EXISTS valid_until      date;
ALTER TABLE ai_documents ADD COLUMN IF NOT EXISTS citation_text    text;

-- Index for visa-specific filtering
CREATE INDEX IF NOT EXISTS idx_ai_docs_country    ON ai_documents(linked_country);
CREATE INDEX IF NOT EXISTS idx_ai_docs_visa_type  ON ai_documents(visa_type);
