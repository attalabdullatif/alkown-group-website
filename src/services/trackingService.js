// ═══════════════════════════════════════════════════════════════
// Public tracking service — single source for the request/visa
// tracking RPC calls shared by TrackRequest, ClientPortal and
// VisaTrackPage. Wraps the SECURITY DEFINER functions from
// migration 020 so no page reads the tables directly.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "../lib/supabase";

// Extracts the numeric id from a visa reference like "VISA-123" or "123".
export function parseVisaId(reference) {
  return Number((String(reference || "").match(/\d+/) || [])[0]) || null;
}

// Track a CRM request by its number. Returns a normalized object the
// tracking UIs render, or null if not found.
export async function trackRequest(number) {
  const term = (number || "").trim();
  if (!term) return null;

  const { data } = await supabase.rpc("track_request", { p_number: term });
  const row = data?.[0];
  if (!row) return null;

  return {
    request_number: row.request_number,
    status: row.status,
    notes: row.notes,
    clients: { full_name: row.client_name },
    services: { name: row.service_name },
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// Track a visa application — requires the application id (parsed from the
// reference) AND the email used to apply. Returns the row or null.
export async function trackVisaApplication(reference, email) {
  const id = parseVisaId(reference);
  if (!id || !email?.trim()) return null;

  const { data } = await supabase.rpc("track_visa_application", {
    p_id: id,
    p_email: email.trim(),
  });
  return data?.[0] || null;
}
