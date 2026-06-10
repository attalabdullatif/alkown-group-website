-- ============================================================
-- Migration 012: Visa Workflow Engine
-- Adds request_history for full audit trail
-- ============================================================

CREATE TABLE IF NOT EXISTS request_history (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id    uuid        REFERENCES requests(id) ON DELETE CASCADE NOT NULL,
  from_status   text,
  to_status     text        NOT NULL,
  note          text,
  changed_by    uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_by_email text,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_request_history_request_id
  ON request_history(request_id);

CREATE INDEX IF NOT EXISTS idx_request_history_created_at
  ON request_history(created_at DESC);

ALTER TABLE request_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_insert_history"
  ON request_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_select_history"
  ON request_history FOR SELECT
  TO authenticated
  USING (true);
