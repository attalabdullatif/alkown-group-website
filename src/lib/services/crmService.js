/**
 * CRM Service — business logic layer
 *
 * Separates business rules from UI components and raw DB calls.
 * All functions accept an optional context { companyId, role } for
 * future tenant-aware and permission-aware behavior.
 */
import { supabase } from "../supabase";
import { requirePermission, normalizeRole } from "../rbac";
import { withCompany } from "../companyService";

// ─── Clients ──────────────────────────────────────────────────────────────────
export async function getClients({ companyId = null, role = null } = {}) {
  if (role) requirePermission(role, "clients", "read");
  let q = supabase.from("clients").select("*").order("full_name");
  if (companyId) q = q.eq("company_id", companyId);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function createClient(payload, { companyId = null, role = null } = {}) {
  if (role) requirePermission(role, "clients", "create");
  const { data, error } = await supabase
    .from("clients")
    .insert([withCompany(payload, companyId)])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateClient(id, payload, { role = null } = {}) {
  if (role) requirePermission(role, "clients", "update");
  const { data, error } = await supabase
    .from("clients").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteClient(id, { role = null } = {}) {
  if (role) requirePermission(role, "clients", "delete");
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw error;
}

export async function searchClients(query, { companyId = null } = {}) {
  let q = supabase
    .from("clients")
    .select("id, full_name, phone, email")
    .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(20);
  if (companyId) q = q.eq("company_id", companyId);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

// ─── Requests ─────────────────────────────────────────────────────────────────
export async function getRequests({ companyId = null, role = null, status = null } = {}) {
  if (role) requirePermission(role, "requests", "read");
  let q = supabase
    .from("requests")
    .select("*, clients(full_name, phone), services(name)")
    .order("created_at", { ascending: false });
  if (companyId) q = q.eq("company_id", companyId);
  if (status)    q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function createRequest(payload, { companyId = null, role = null } = {}) {
  if (role) requirePermission(role, "requests", "create");
  const requestNumber = `REQ-${Date.now()}`;
  const { data, error } = await supabase
    .from("requests")
    .insert([withCompany({ ...payload, request_number: requestNumber }, companyId)])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateRequestStatus(id, status, { role = null } = {}) {
  if (role) requirePermission(role, "requests", "change_status");
  const { data, error } = await supabase
    .from("requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Services Catalog ─────────────────────────────────────────────────────────
export async function getServices({ companyId = null, activeOnly = false } = {}) {
  let q = supabase.from("services").select("*").order("name");
  if (companyId)  q = q.eq("company_id", companyId);
  if (activeOnly) q = q.eq("is_active", true);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function createService(payload, { companyId = null, role = null } = {}) {
  if (role) requirePermission(role, "services", "create");
  const { data, error } = await supabase
    .from("services")
    .insert([withCompany(payload, companyId)])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export async function getOverview({ companyId = null, role = null } = {}) {
  if (role) requirePermission(role, "reports", "read");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const filters = companyId ? { company_id: companyId } : {};

  const [clientsRes, requestsRes, invoicesRes] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }).match(filters),
    supabase.from("requests").select("id", { count: "exact", head: true }).match(filters),
    supabase.from("acc_invoices").select("amount, paid_amount, status").match(filters),
  ]);

  const invoices = invoicesRes.data || [];
  const totalRevenue   = invoices.reduce((s, i) => s + Number(i.paid_amount || 0), 0);
  const outstanding    = invoices
    .filter(i => ["Sent","Partially Paid","Overdue"].includes(i.status))
    .reduce((s, i) => s + (Number(i.amount) - Number(i.paid_amount || 0)), 0);

  return {
    totalClients:  clientsRes.count  ?? 0,
    totalRequests: requestsRes.count ?? 0,
    totalRevenue,
    outstanding,
  };
}
