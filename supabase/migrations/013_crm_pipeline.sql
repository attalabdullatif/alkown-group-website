-- ============================================================
-- Migration 013: CRM Lead Pipeline + Activity Log + Tasks
-- ============================================================

-- 1. Add pipeline_stage to clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS pipeline_stage text DEFAULT 'New Lead';

-- 2. Activity Log
CREATE TABLE IF NOT EXISTS client_activities (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id        uuid        REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  type             text        NOT NULL CHECK (type IN ('call','message','meeting','note','email')),
  description      text        NOT NULL,
  created_by       uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_email text,
  created_at       timestamptz DEFAULT now()
);

-- 3. Tasks
CREATE TABLE IF NOT EXISTS client_tasks (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id        uuid        REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  title            text        NOT NULL,
  description      text,
  due_date         date,
  assigned_to      text,
  status           text        DEFAULT 'pending'
                               CHECK (status IN ('pending','in_progress','completed','cancelled')),
  priority         text        DEFAULT 'medium'
                               CHECK (priority IN ('low','medium','high')),
  created_by       uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_email text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_activities_client_id ON client_activities(client_id);
CREATE INDEX IF NOT EXISTS idx_client_activities_created_at ON client_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_tasks_client_id ON client_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_client_tasks_due_date ON client_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_clients_pipeline_stage ON clients(pipeline_stage);

-- RLS
ALTER TABLE client_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_tasks      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all_activities"
  ON client_activities FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "auth_all_tasks"
  ON client_tasks FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Auto-update updated_at on tasks
CREATE OR REPLACE FUNCTION update_client_tasks_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_client_tasks_updated_at ON client_tasks;
CREATE TRIGGER trg_client_tasks_updated_at
  BEFORE UPDATE ON client_tasks
  FOR EACH ROW EXECUTE FUNCTION update_client_tasks_updated_at();
