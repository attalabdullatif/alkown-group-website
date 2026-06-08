-- ================================================================
-- Messages & Notifications System
-- For Client Portal ↔ Staff Communication
-- ================================================================

-- Client Messages
CREATE TABLE IF NOT EXISTS client_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID REFERENCES clients(id) ON DELETE CASCADE,
  request_id  UUID REFERENCES requests(id) ON DELETE SET NULL,
  sender      TEXT NOT NULL CHECK (sender IN ('client','staff')),
  sender_name TEXT NOT NULL DEFAULT 'Support Team',
  message     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_messages_client   ON client_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_request  ON client_messages(request_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_unread   ON client_messages(client_id, is_read);

-- Client Notifications
CREATE TABLE IF NOT EXISTS client_notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID REFERENCES clients(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN (
                'status_update','new_message','invoice_ready',
                'document_request','approval','rejection','general'
              )),
  title_ar    TEXT NOT NULL,
  title_en    TEXT NOT NULL,
  body_ar     TEXT,
  body_en     TEXT,
  link        TEXT,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_client  ON client_notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_notif_unread  ON client_notifications(client_id, is_read);

-- RLS
ALTER TABLE client_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notifications ENABLE ROW LEVEL SECURITY;

-- Public read by client_id match (portal uses anon key with client lookup)
CREATE POLICY "client_messages_select"
  ON client_messages FOR SELECT USING (TRUE);
CREATE POLICY "client_messages_insert"
  ON client_messages FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "client_messages_update"
  ON client_messages FOR UPDATE USING (TRUE);

CREATE POLICY "client_notif_select"
  ON client_notifications FOR SELECT USING (TRUE);
CREATE POLICY "client_notif_update"
  ON client_notifications FOR UPDATE USING (TRUE);
CREATE POLICY "client_notif_insert"
  ON client_notifications FOR INSERT WITH CHECK (TRUE);

-- Helper: auto-notify client on request status change
-- (call this from your CRM when updating request status)
CREATE OR REPLACE FUNCTION notify_client_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO client_notifications(client_id, type, title_ar, title_en, body_ar, body_en, link)
    SELECT
      NEW.client_id,
      'status_update',
      'تحديث حالة طلبك',
      'Your Request Status Updated',
      'تم تغيير حالة طلبك ' || NEW.request_number || ' إلى: ' || NEW.status,
      'Your request ' || NEW.request_number || ' status changed to: ' || NEW.status,
      '/portal'
    WHERE NEW.client_id IS NOT NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_status ON requests;
CREATE TRIGGER trg_notify_status
  AFTER UPDATE OF status ON requests
  FOR EACH ROW EXECUTE FUNCTION notify_client_status_change();
