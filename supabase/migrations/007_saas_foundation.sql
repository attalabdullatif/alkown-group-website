-- ============================================================
-- SaaS Foundation Migration
-- Purpose: Prepare multi-tenant architecture without breaking
--          any existing functionality. All changes are additive.
-- ============================================================

-- ─── 1. COMPANIES (Tenant Root) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE,                   -- future: subdomain routing
  status       TEXT NOT NULL DEFAULT 'active'
               CHECK (status IN ('active','suspended','trial')),
  plan         TEXT NOT NULL DEFAULT 'default'
               CHECK (plan IN ('default','starter','professional','enterprise')),
  owner_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. COMPANY SETTINGS ─────────────────────────────────────────────────────
-- Stores brand + contact config per company. Not exposed in UI yet.
CREATE TABLE IF NOT EXISTS company_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  -- Brand
  brand_name      TEXT,
  logo_url        TEXT,
  favicon_url     TEXT,
  primary_color   TEXT DEFAULT '#c9a84c',
  secondary_color TEXT DEFAULT '#1a1510',
  -- Contact
  email           TEXT,
  phone_primary   TEXT,
  phone_secondary TEXT,
  website         TEXT,
  -- Address
  address_line1   TEXT,
  address_line2   TEXT,
  city            TEXT,
  country         TEXT,
  -- Locale
  default_language TEXT DEFAULT 'ar' CHECK (default_language IN ('ar','en')),
  timezone        TEXT DEFAULT 'Asia/Dubai',
  currency        TEXT DEFAULT 'USD',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (company_id)
);

-- ─── 3. ROLES ────────────────────────────────────────────────────────────────
-- Canonical role registry. Existing user_roles table keeps working unchanged.
CREATE TABLE IF NOT EXISTS roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL,           -- machine name
  label_ar    TEXT NOT NULL,
  label_en    TEXT NOT NULL,
  level       INT NOT NULL DEFAULT 0,         -- higher = more access
  is_system   BOOLEAN DEFAULT FALSE,          -- system roles cannot be deleted
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed canonical roles (idempotent)
INSERT INTO roles (name, label_ar, label_en, level, is_system, description) VALUES
  ('super_admin',   'مدير النظام',     'Super Admin',   100, TRUE, 'Full platform access across all companies'),
  ('company_admin', 'مدير الشركة',     'Company Admin',  80, TRUE, 'Full access within their company'),
  ('manager',       'مدير',            'Manager',        60, TRUE, 'Manage clients, requests, invoices'),
  ('staff',         'موظف',            'Staff',          40, TRUE, 'Operational access, limited delete'),
  ('client',        'عميل',            'Client',         10, TRUE, 'Client portal access only')
ON CONFLICT (name) DO NOTHING;

-- ─── 4. PERMISSIONS ──────────────────────────────────────────────────────────
-- Permission registry — each row is an action on a resource.
CREATE TABLE IF NOT EXISTS permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource    TEXT NOT NULL,    -- e.g. 'clients', 'invoices', 'reports'
  action      TEXT NOT NULL,    -- e.g. 'read', 'create', 'update', 'delete'
  description TEXT,
  UNIQUE (resource, action)
);

-- Seed permissions
INSERT INTO permissions (resource, action, description) VALUES
  -- Clients
  ('clients', 'read',   'View client list and profiles'),
  ('clients', 'create', 'Create new clients'),
  ('clients', 'update', 'Edit client information'),
  ('clients', 'delete', 'Delete clients'),
  -- Requests
  ('requests', 'read',          'View all requests'),
  ('requests', 'create',        'Create new requests'),
  ('requests', 'update',        'Edit request details'),
  ('requests', 'delete',        'Delete requests'),
  ('requests', 'change_status', 'Change request status'),
  -- Invoices / Accounting
  ('invoices', 'read',          'View invoices'),
  ('invoices', 'create',        'Create invoices'),
  ('invoices', 'update',        'Edit invoices'),
  ('invoices', 'delete',        'Delete invoices'),
  ('payments', 'read',          'View payments'),
  ('payments', 'create',        'Record payments'),
  ('payments', 'delete',        'Delete payment records'),
  ('expenses', 'read',          'View expenses'),
  ('expenses', 'create',        'Log expenses'),
  ('expenses', 'delete',        'Delete expenses'),
  -- Services
  ('services', 'read',   'View service catalog'),
  ('services', 'create', 'Add new services'),
  ('services', 'update', 'Edit services'),
  ('services', 'delete', 'Delete services'),
  -- Reports
  ('reports', 'read',   'View financial and operational reports'),
  ('reports', 'export', 'Export report data'),
  -- Users / Team
  ('users', 'read',   'View team members'),
  ('users', 'invite', 'Invite new users'),
  ('users', 'update', 'Edit user roles'),
  ('users', 'delete', 'Remove users from company'),
  -- Company Settings
  ('settings', 'read',   'View company settings'),
  ('settings', 'update', 'Edit company settings'),
  -- Visa
  ('visa_applications', 'read',          'View visa applications'),
  ('visa_applications', 'update',        'Update visa application status'),
  ('visa_applications', 'assign',        'Assign visa applications to staff'),
  -- Documents
  ('documents', 'read',   'View uploaded documents'),
  ('documents', 'upload', 'Upload documents'),
  ('documents', 'delete', 'Delete documents')
ON CONFLICT (resource, action) DO NOTHING;

-- ─── 5. ROLE PERMISSIONS (default permission matrix) ─────────────────────────
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Populate default matrix via a helper function
DO $$
DECLARE
  r_super      UUID; r_cadmin UUID; r_manager UUID; r_staff UUID; r_client UUID;
  p            RECORD;
BEGIN
  SELECT id INTO r_super  FROM roles WHERE name = 'super_admin';
  SELECT id INTO r_cadmin FROM roles WHERE name = 'company_admin';
  SELECT id INTO r_manager FROM roles WHERE name = 'manager';
  SELECT id INTO r_staff  FROM roles WHERE name = 'staff';
  SELECT id INTO r_client FROM roles WHERE name = 'client';

  -- super_admin & company_admin get ALL permissions
  FOR p IN SELECT id FROM permissions LOOP
    INSERT INTO role_permissions VALUES (r_super,  p.id) ON CONFLICT DO NOTHING;
    INSERT INTO role_permissions VALUES (r_cadmin, p.id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- manager: everything except company settings update and user delete
  FOR p IN SELECT id FROM permissions
           WHERE NOT (resource = 'settings' AND action = 'update')
             AND NOT (resource = 'users'    AND action = 'delete') LOOP
    INSERT INTO role_permissions VALUES (r_manager, p.id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- staff: read most things, create/update requests + clients, no delete, no reports export
  FOR p IN SELECT id FROM permissions
           WHERE (action = 'read')
              OR (resource IN ('clients','requests') AND action IN ('create','update','change_status'))
              OR (resource = 'documents' AND action IN ('upload'))
              OR (resource = 'visa_applications' AND action = 'read') LOOP
    INSERT INTO role_permissions VALUES (r_staff, p.id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- client: own portal access only
  FOR p IN SELECT id FROM permissions
           WHERE (resource = 'requests' AND action = 'read')
              OR (resource = 'invoices' AND action = 'read')
              OR (resource = 'documents' AND action IN ('read','upload')) LOOP
    INSERT INTO role_permissions VALUES (r_client, p.id) ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;

-- ─── 6. COMPANY USERS ────────────────────────────────────────────────────────
-- Links auth.users to companies with a role. One user can belong to multiple companies.
CREATE TABLE IF NOT EXISTS company_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_name   TEXT NOT NULL REFERENCES roles(name) ON DELETE RESTRICT,
  full_name   TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  invited_at  TIMESTAMPTZ,
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (company_id, user_id)
);

-- ─── 7. ADD company_id TO ALL MAJOR ENTITIES ─────────────────────────────────
-- All nullable — existing data remains valid, company_id = NULL means "legacy/global"

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

ALTER TABLE acc_invoices
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

ALTER TABLE acc_payments
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

ALTER TABLE acc_expenses
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

ALTER TABLE visa_applications
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- client_notes and request_files inherit company via their parent (no direct company_id needed)

-- ─── 8. INDEXES ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_companies_slug         ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_owner        ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_company_users_company  ON company_users(company_id);
CREATE INDEX IF NOT EXISTS idx_company_users_user     ON company_users(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_company        ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_requests_company       ON requests(company_id);
CREATE INDEX IF NOT EXISTS idx_acc_invoices_company   ON acc_invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_acc_expenses_company   ON acc_expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_visa_apps_company      ON visa_applications(company_id);

-- ─── 9. UPDATED_AT TRIGGERS ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS companies_updated        ON companies;
DROP TRIGGER IF EXISTS company_settings_updated ON company_settings;
CREATE TRIGGER companies_updated        BEFORE UPDATE ON companies        FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER company_settings_updated BEFORE UPDATE ON company_settings FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ─── 10. RLS ─────────────────────────────────────────────────────────────────
ALTER TABLE companies         ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions  ENABLE ROW LEVEL SECURITY;

-- Roles and permissions are public-readable (needed by frontend RBAC checks)
CREATE POLICY "public_read_roles"       ON roles        FOR SELECT USING (TRUE);
CREATE POLICY "public_read_permissions" ON permissions   FOR SELECT USING (TRUE);
CREATE POLICY "public_read_role_perms"  ON role_permissions FOR SELECT USING (TRUE);

-- Company data: only company members can access their own company
CREATE POLICY "company_member_select" ON companies
  FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM company_users cu WHERE cu.company_id = id AND cu.user_id = auth.uid() AND cu.is_active = TRUE)
  );

CREATE POLICY "company_settings_member" ON company_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM company_users cu WHERE cu.company_id = company_id AND cu.user_id = auth.uid() AND cu.is_active = TRUE)
  );

CREATE POLICY "company_users_member" ON company_users
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM company_users WHERE user_id = auth.uid())
  );

-- Authenticated users can manage their own company memberships
CREATE POLICY "auth_insert_companies" ON companies FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "auth_update_companies" ON companies FOR UPDATE USING (auth.uid() = owner_id);
