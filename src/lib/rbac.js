/**
 * RBAC — Role-Based Access Control
 *
 * Defines roles, permission checks, and a middleware-style guard function.
 * No UI changes. Safe to import anywhere.
 *
 * Current system roles map: existing 'Admin'/'Manager'/'Staff' from user_roles
 * are normalized to the new canonical names at the boundary (see normalizeRole).
 */

// ─── Role Hierarchy ───────────────────────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN:   'super_admin',
  COMPANY_ADMIN: 'company_admin',
  MANAGER:       'manager',
  STAFF:         'staff',
  CLIENT:        'client',
};

// Numeric level: higher = more access
export const ROLE_LEVEL = {
  super_admin:   100,
  company_admin:  80,
  manager:        60,
  staff:          40,
  client:         10,
};

// ─── Legacy role normalization ────────────────────────────────────────────────
// Maps existing user_roles values → canonical role names
const LEGACY_MAP = {
  admin:   'company_admin',
  Admin:   'company_admin',
  manager: 'manager',
  Manager: 'manager',
  staff:   'staff',
  Staff:   'staff',
};

export function normalizeRole(rawRole) {
  if (!rawRole) return null;
  return LEGACY_MAP[rawRole] ?? rawRole.toLowerCase();
}

// ─── Permission Matrix ────────────────────────────────────────────────────────
// Defines what each role is allowed to do.
// Format: { [resource]: [action, ...] }
const PERMISSION_MATRIX = {
  super_admin: { '*': ['*'] },   // unrestricted

  company_admin: {
    clients:          ['read','create','update','delete'],
    requests:         ['read','create','update','delete','change_status'],
    invoices:         ['read','create','update','delete'],
    payments:         ['read','create','delete'],
    expenses:         ['read','create','delete'],
    services:         ['read','create','update','delete'],
    reports:          ['read','export'],
    users:            ['read','invite','update','delete'],
    settings:         ['read','update'],
    visa_applications:['read','update','assign'],
    documents:        ['read','upload','delete'],
  },

  manager: {
    clients:          ['read','create','update','delete'],
    requests:         ['read','create','update','delete','change_status'],
    invoices:         ['read','create','update','delete'],
    payments:         ['read','create','delete'],
    expenses:         ['read','create','delete'],
    services:         ['read','create','update','delete'],
    reports:          ['read','export'],
    users:            ['read','invite','update'],
    settings:         ['read'],
    visa_applications:['read','update','assign'],
    documents:        ['read','upload','delete'],
  },

  staff: {
    clients:          ['read','create','update'],
    requests:         ['read','create','update','change_status'],
    invoices:         ['read'],
    payments:         ['read'],
    expenses:         ['read'],
    services:         ['read'],
    reports:          ['read'],
    users:            ['read'],
    visa_applications:['read'],
    documents:        ['read','upload'],
  },

  client: {
    requests:  ['read'],
    invoices:  ['read'],
    documents: ['read','upload'],
  },
};

// ─── Core Permission Check ────────────────────────────────────────────────────
/**
 * Check if a role has permission to perform an action on a resource.
 * @param {string} role    - canonical role name (use normalizeRole first)
 * @param {string} resource - e.g. 'invoices'
 * @param {string} action   - e.g. 'delete'
 * @returns {boolean}
 */
export function can(role, resource, action) {
  if (!role) return false;
  const normalized = normalizeRole(role);

  const matrix = PERMISSION_MATRIX[normalized];
  if (!matrix) return false;

  // super_admin wildcard
  if (matrix['*']?.includes('*')) return true;

  const allowed = matrix[resource];
  if (!allowed) return false;

  return allowed.includes('*') || allowed.includes(action);
}

/**
 * Check if a role meets a minimum level threshold.
 * @param {string} role
 * @param {string} minRole - minimum role required
 */
export function meetsLevel(role, minRole) {
  const normalized = normalizeRole(role);
  return (ROLE_LEVEL[normalized] ?? 0) >= (ROLE_LEVEL[minRole] ?? 0);
}

/**
 * Guard function — throws if the role lacks permission.
 * Use in service layer before any destructive operation.
 */
export function requirePermission(role, resource, action) {
  if (!can(role, resource, action)) {
    throw new Error(`Permission denied: ${role} cannot ${action} ${resource}`);
  }
}

/**
 * Filter a list of nav items by role.
 * Each item may have { roles: string[] } — null/undefined means public.
 */
export function filterNavByRole(navItems, role) {
  const normalized = normalizeRole(role);
  return navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.some(r => {
      const nr = normalizeRole(r);
      return nr === normalized || meetsLevel(normalized, nr);
    });
  });
}

// ─── Role Labels ─────────────────────────────────────────────────────────────
export const ROLE_LABELS = {
  super_admin:   { ar: 'مدير النظام',  en: 'Super Admin'   },
  company_admin: { ar: 'مدير الشركة',  en: 'Company Admin' },
  manager:       { ar: 'مدير',         en: 'Manager'       },
  staff:         { ar: 'موظف',         en: 'Staff'         },
  client:        { ar: 'عميل',         en: 'Client'        },
};

export function getRoleLabel(role, lang = 'ar') {
  const normalized = normalizeRole(role);
  return ROLE_LABELS[normalized]?.[lang] ?? role;
}
