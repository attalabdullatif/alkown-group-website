-- Accounting Module: Invoices, Payments, Expenses
-- Prefixed with acc_ to avoid conflicts with existing invoices table

-- Extended invoices for the accounting module
CREATE TABLE IF NOT EXISTS acc_invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number  TEXT UNIQUE NOT NULL,
  client_id       UUID REFERENCES clients(id) ON DELETE SET NULL,
  request_id      UUID REFERENCES requests(id) ON DELETE SET NULL,
  service_name    TEXT NOT NULL,
  description     TEXT,
  amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_date        DATE,
  status          TEXT NOT NULL DEFAULT 'Draft'
                  CHECK (status IN ('Draft','Sent','Paid','Partially Paid','Overdue')),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Payments linked to acc_invoices
CREATE TABLE IF NOT EXISTS acc_payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID REFERENCES acc_invoices(id) ON DELETE CASCADE,
  client_id       UUID REFERENCES clients(id) ON DELETE SET NULL,
  amount          NUMERIC(12,2) NOT NULL,
  payment_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  method          TEXT NOT NULL DEFAULT 'Cash'
                  CHECK (method IN ('Cash','Bank Transfer','Card','Online Payment')),
  reference       TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses
CREATE TABLE IF NOT EXISTS acc_expenses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category        TEXT NOT NULL
                  CHECK (category IN ('Embassy Fees','Courier','Translation','Medical','Marketing','Operations')),
  description     TEXT NOT NULL,
  amount          NUMERIC(12,2) NOT NULL,
  expense_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  reference       TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on acc_invoices
CREATE OR REPLACE FUNCTION update_acc_invoice_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS acc_invoices_updated ON acc_invoices;
CREATE TRIGGER acc_invoices_updated
  BEFORE UPDATE ON acc_invoices
  FOR EACH ROW EXECUTE FUNCTION update_acc_invoice_timestamp();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_acc_invoices_client  ON acc_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_acc_invoices_status  ON acc_invoices(status);
CREATE INDEX IF NOT EXISTS idx_acc_payments_invoice ON acc_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_acc_expenses_date    ON acc_expenses(expense_date);

-- Enable RLS (mirror existing table policies)
ALTER TABLE acc_invoices  ENABLE ROW LEVEL SECURITY;
ALTER TABLE acc_payments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE acc_expenses  ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (adjust per your RLS policy needs)
CREATE POLICY "auth_full_acc_invoices"  ON acc_invoices  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_full_acc_payments"  ON acc_payments  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_full_acc_expenses"  ON acc_expenses  FOR ALL USING (auth.role() = 'authenticated');
