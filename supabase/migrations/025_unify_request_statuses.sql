-- ═══════════════════════════════════════════════════════════════
-- Migration 025: One request-status vocabulary + client history RPC
--
-- Staff tools use the 9-stage visa workflow (Lead … Completed) while older
-- rows / the public booking endpoint used legacy values (New, In Progress,
-- Pending Documents). The UI now normalises both, and this migration:
--   1. converts legacy values on `requests` to the 9-stage vocabulary
--      (with the client-notification trigger paused, so clients are NOT
--      spammed with one "status changed" notification per old request)
--   2. sends client notifications with Arabic status labels
--   3. adds client_request_history(): a client's own status timeline
--      (status + date only — no internal notes, no staff emails), since
--      request_history itself is staff-only after migration 024
--
-- Idempotent: safe to re-run.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Convert legacy statuses (notification trigger paused) ──
DO $$
DECLARE
  has_notify  boolean := EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_notify_status'
                                 AND tgrelid = 'public.requests'::regclass);
  has_updated boolean := EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_requests_updated_at'
                                 AND tgrelid = 'public.requests'::regclass);
BEGIN
  IF has_notify  THEN ALTER TABLE public.requests DISABLE TRIGGER trg_notify_status;       END IF;
  IF has_updated THEN ALTER TABLE public.requests DISABLE TRIGGER set_requests_updated_at; END IF;

  UPDATE public.requests SET status = CASE status
      WHEN 'New'               THEN 'Lead'
      WHEN 'In Progress'       THEN 'Consultation'   -- conservative: never imply "submitted"
      WHEN 'Pending Documents' THEN 'Documents Pending'
    END
  WHERE status IN ('New', 'In Progress', 'Pending Documents');

  IF has_notify  THEN ALTER TABLE public.requests ENABLE TRIGGER trg_notify_status;       END IF;
  IF has_updated THEN ALTER TABLE public.requests ENABLE TRIGGER set_requests_updated_at; END IF;
END $$;

-- ── 2. Arabic status labels (shared by the trigger) ──────────
CREATE OR REPLACE FUNCTION public.status_label_ar(p_status text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_status
    WHEN 'Lead'                 THEN 'عميل محتمل'
    WHEN 'New'                  THEN 'عميل محتمل'
    WHEN 'Consultation'         THEN 'استشارة'
    WHEN 'In Progress'          THEN 'استشارة'
    WHEN 'Documents Pending'    THEN 'بانتظار وثائق'
    WHEN 'Pending Documents'    THEN 'بانتظار وثائق'
    WHEN 'Ready For Submission' THEN 'جاهز للتقديم'
    WHEN 'Submitted'            THEN 'تم التقديم'
    WHEN 'Processing'           THEN 'قيد المعالجة'
    WHEN 'Approved'             THEN 'موافق عليه'
    WHEN 'Rejected'             THEN 'مرفوض'
    WHEN 'Completed'            THEN 'مكتمل'
    ELSE p_status
  END;
$$;

CREATE OR REPLACE FUNCTION public.notify_client_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.client_notifications(client_id, type, title_ar, title_en, body_ar, body_en, link)
    SELECT
      NEW.client_id,
      'status_update',
      'تحديث حالة طلبك',
      'Your Request Status Updated',
      'تم تغيير حالة طلبك ' || NEW.request_number || ' إلى: ' || public.status_label_ar(NEW.status),
      'Your request ' || NEW.request_number || ' status changed to: ' || NEW.status,
      '/portal'
    WHERE NEW.client_id IS NOT NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── 3. Client's own status timeline ──────────────────────────
DROP FUNCTION IF EXISTS public.client_request_history(uuid);
CREATE FUNCTION public.client_request_history(p_request_id uuid)
RETURNS TABLE (from_status text, to_status text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT h.from_status, h.to_status, h.created_at
  FROM public.request_history h
  JOIN public.requests r ON r.id = h.request_id
  WHERE h.request_id = p_request_id
    AND (public.is_staff()
         OR r.client_id IN (SELECT c.id FROM public.clients c WHERE c.email = auth.email()))
  ORDER BY h.created_at;
$$;
GRANT EXECUTE ON FUNCTION public.client_request_history(uuid) TO authenticated;

-- Verify:
--   SELECT status, count(*) FROM public.requests GROUP BY 1 ORDER BY 2 DESC;
