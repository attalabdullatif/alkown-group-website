-- ============================================================
-- Migration 017: Phase 2 Enhancements
-- Adds priority, assigned_to_email, tags to requests
-- Adds file_size, expires_at to request_files
-- ============================================================

-- Requests: pipeline fields
ALTER TABLE requests ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium'
  CHECK (priority IN ('low','medium','high'));

ALTER TABLE requests ADD COLUMN IF NOT EXISTS assigned_to_email text;

ALTER TABLE requests ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

ALTER TABLE requests ADD COLUMN IF NOT EXISTS internal_notes text;

-- Request files: metadata
ALTER TABLE request_files ADD COLUMN IF NOT EXISTS file_size bigint;
ALTER TABLE request_files ADD COLUMN IF NOT EXISTS expires_at date;
ALTER TABLE request_files ADD COLUMN IF NOT EXISTS version int DEFAULT 1;
ALTER TABLE request_files ADD COLUMN IF NOT EXISTS uploaded_by text;

-- Index for priority filtering
CREATE INDEX IF NOT EXISTS idx_requests_priority ON requests(priority);
CREATE INDEX IF NOT EXISTS idx_requests_assigned_to ON requests(assigned_to_email);
CREATE INDEX IF NOT EXISTS idx_request_files_file_type ON request_files(file_type);
CREATE INDEX IF NOT EXISTS idx_request_files_request_id ON request_files(request_id);

-- Client tasks: add request link if missing
ALTER TABLE client_tasks ADD COLUMN IF NOT EXISTS request_id uuid REFERENCES requests(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_client_tasks_request_id ON client_tasks(request_id);
