import { supabase } from "./supabase";

export function normalizeContact(value) {
  return String(value || "").trim();
}

export async function findOrCreateClient({ full_name, phone, email }) {
  const cleanName = normalizeContact(full_name);
  const cleanPhone = normalizeContact(phone);
  const cleanEmail = normalizeContact(email).toLowerCase();

  if (!cleanName || !cleanPhone) {
    throw new Error("Client name and phone are required.");
  }

  let existingClient = null;

  if (cleanEmail) {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (error) throw error;
    existingClient = data;
  }

  if (!existingClient && cleanPhone) {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("phone", cleanPhone)
      .maybeSingle();

    if (error) throw error;
    existingClient = data;
  }

  if (existingClient) {
    const updates = {
      full_name: cleanName || existingClient.full_name,
      phone: cleanPhone || existingClient.phone,
      email: cleanEmail || existingClient.email,
    };

    const { data, error } = await supabase
      .from("clients")
      .update(updates)
      .eq("id", existingClient.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("clients")
    .insert([
      {
        full_name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createRequestForClient({ clientId, serviceId = null, status = "New", notes = "" }) {
  const requestNumber = `REQ-${Date.now()}`;

  const { data, error } = await supabase
    .from("requests")
    .insert([
      {
        request_number: requestNumber,
        client_id: clientId,
        service_id: serviceId,
        status,
        notes,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function sendContactNotification({ requestNumber, client, form }) {
  try {
    await fetch("/.netlify/functions/send-contact-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestNumber, client, form }),
    });
  } catch (error) {
    console.warn("Email notification failed:", error);
  }
}

export async function sendStatusNotification({ requestNumber, client, form, status }) {
  try {
    await fetch("/.netlify/functions/send-contact-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "status_update",
        requestNumber,
        client,
        form,
        status,
      }),
    });
  } catch (error) {
    console.warn("Status email notification failed:", error);
  }
}
