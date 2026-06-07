/**
 * Application Service
 *
 * Manages visa / residency / company-formation applications as a unified
 * concept. Currently wraps visa_applications table. Future: extend with
 * application_type to handle all service types uniformly.
 */
import { supabase } from "../supabase";
import { requirePermission } from "../rbac";
import { withCompany } from "../companyService";
import { notifyNewContact } from "./notificationService";

export const APPLICATION_STATUSES = ["new","reviewing","approved","rejected","completed"];

export const STATUS_AR = {
  new:       "جديد",
  reviewing: "قيد المراجعة",
  approved:  "موافق عليه",
  rejected:  "مرفوض",
  completed: "مكتمل",
};

// ─── Fetch ────────────────────────────────────────────────────────────────────
export async function getApplications({ companyId = null, role = null, status = null } = {}) {
  if (role) requirePermission(role, "visa_applications", "read");
  let q = supabase
    .from("visa_applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (companyId) q = q.eq("company_id", companyId);
  if (status)    q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function getApplicationById(id) {
  const { data, error } = await supabase
    .from("visa_applications").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

// ─── Submit (public — no auth required) ──────────────────────────────────────
export async function submitApplication(formData, { companyId = null } = {}) {
  const payload = withCompany({
    full_name:    formData.full_name,
    email:        formData.email,
    phone:        formData.phone,
    whatsapp:     formData.whatsapp || formData.phone,
    nationality:  formData.nationality,
    residence:    formData.residence,
    destination:  formData.destination,
    travel_date:  formData.travel_date   || null,
    return_date:  formData.return_date   || null,
    trip_purpose: formData.trip_purpose  || null,
    notes:        formData.notes         || null,
    status:       "new",
  }, companyId);

  const { data, error } = await supabase
    .from("visa_applications")
    .insert([payload])
    .select()
    .single();
  if (error) throw error;

  // Fire-and-forget notification
  await notifyNewContact({
    requestNumber: data.id,
    client: { full_name: data.full_name, email: data.email, phone: data.phone },
    form:   formData,
  });

  return data;
}

// ─── Update ───────────────────────────────────────────────────────────────────
export async function updateApplicationStatus(id, status, { role = null, internalNotes = null } = {}) {
  if (role) requirePermission(role, "visa_applications", "update");
  const patch = { status };
  if (internalNotes !== null) patch.internal_notes = internalNotes;
  const { data, error } = await supabase
    .from("visa_applications").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function assignApplication(id, assignedTo, { role = null } = {}) {
  if (role) requirePermission(role, "visa_applications", "assign");
  const { data, error } = await supabase
    .from("visa_applications")
    .update({ assigned_to: assignedTo }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
