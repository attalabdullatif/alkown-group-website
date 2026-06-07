/**
 * Company Service
 *
 * All company/tenant operations. Currently operates on a single implicit
 * company (the existing deployment). When multi-tenancy is activated,
 * callers pass companyId explicitly.
 */
import { supabase } from "./supabase";

// ─── Company CRUD ─────────────────────────────────────────────────────────────
export async function getCompany(companyId) {
  const { data, error } = await supabase
    .from("companies")
    .select("*, company_settings(*)")
    .eq("id", companyId)
    .single();
  if (error) throw error;
  return data;
}

export async function createCompany({ name, slug, ownerId }) {
  const { data, error } = await supabase
    .from("companies")
    .insert([{ name, slug: slug || slugify(name), owner_id: ownerId }])
    .select()
    .single();
  if (error) throw error;

  // Seed default settings
  await supabase.from("company_settings").insert([{
    company_id: data.id,
    brand_name: name,
    currency:   "USD",
    default_language: "ar",
    timezone:   "Asia/Dubai",
  }]);

  return data;
}

export async function updateCompany(companyId, payload) {
  const { data, error } = await supabase
    .from("companies")
    .update(payload)
    .eq("id", companyId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Company Settings ─────────────────────────────────────────────────────────
export async function getCompanySettings(companyId) {
  const { data, error } = await supabase
    .from("company_settings")
    .select("*")
    .eq("company_id", companyId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function updateCompanySettings(companyId, payload) {
  const { data, error } = await supabase
    .from("company_settings")
    .upsert({ company_id: companyId, ...payload }, { onConflict: "company_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Company Users ─────────────────────────────────────────────────────────────
export async function getCompanyUsers(companyId) {
  const { data, error } = await supabase
    .from("company_users")
    .select("*, auth_users:user_id(email)")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("joined_at");
  if (error) throw error;
  return data || [];
}

export async function addUserToCompany({ companyId, userId, roleName, fullName }) {
  const { data, error } = await supabase
    .from("company_users")
    .insert([{
      company_id: companyId,
      user_id:    userId,
      role_name:  roleName,
      full_name:  fullName,
      joined_at:  new Date().toISOString(),
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateUserRole(companyId, userId, roleName) {
  const { data, error } = await supabase
    .from("company_users")
    .update({ role_name: roleName })
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeUserFromCompany(companyId, userId) {
  const { error } = await supabase
    .from("company_users")
    .update({ is_active: false })
    .eq("company_id", companyId)
    .eq("user_id", userId);
  if (error) throw error;
}

// ─── Tenant Context Helpers ───────────────────────────────────────────────────
/**
 * Returns the company_id for the currently authenticated user.
 * When a user belongs to multiple companies, returns the first active one.
 * Returns null for legacy/pre-SaaS users.
 */
export async function getCurrentCompanyId(userId) {
  if (!userId) return null;
  const { data } = await supabase
    .from("company_users")
    .select("company_id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .limit(1)
    .single();
  return data?.company_id ?? null;
}

/**
 * Inject company_id into a query payload if available.
 * Passes through unchanged if companyId is null (backward-compatible).
 */
export function withCompany(payload, companyId) {
  if (!companyId) return payload;
  return { ...payload, company_id: companyId };
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-|-$/g, "");
}
