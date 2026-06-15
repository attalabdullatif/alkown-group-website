-- Fix 1: requests.client_id — when client deleted, set NULL (preserve request history)
ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_client_id_fkey;
ALTER TABLE requests
  ADD CONSTRAINT requests_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- Fix 1b: invoices.client_id — when client deleted, set NULL
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_client_id_fkey;
ALTER TABLE invoices
  ADD CONSTRAINT invoices_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- Fix 2: invoices.request_id — when request deleted, set NULL (preserve invoice history)
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_request_id_fkey;
ALTER TABLE invoices
  ADD CONSTRAINT invoices_request_id_fkey
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE SET NULL;

-- Fix 3: acc_invoices.request_id (new accounting table)
ALTER TABLE acc_invoices DROP CONSTRAINT IF EXISTS acc_invoices_request_id_fkey;
ALTER TABLE acc_invoices
  ADD CONSTRAINT acc_invoices_request_id_fkey
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE SET NULL;

-- Fix 4: acc_invoices.client_id
ALTER TABLE acc_invoices DROP CONSTRAINT IF EXISTS acc_invoices_client_id_fkey;
ALTER TABLE acc_invoices
  ADD CONSTRAINT acc_invoices_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- Fix 5: acc_payments.client_id
ALTER TABLE acc_payments DROP CONSTRAINT IF EXISTS acc_payments_client_id_fkey;
ALTER TABLE acc_payments
  ADD CONSTRAINT acc_payments_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- Fix 6: client_notes.client_id
ALTER TABLE client_notes DROP CONSTRAINT IF EXISTS client_notes_client_id_fkey;
ALTER TABLE client_notes
  ADD CONSTRAINT client_notes_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- Fix 7: request_files.request_id
ALTER TABLE request_files DROP CONSTRAINT IF EXISTS request_files_request_id_fkey;
ALTER TABLE request_files
  ADD CONSTRAINT request_files_request_id_fkey
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE;
