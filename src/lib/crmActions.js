/**
 * ALKOWN GLOBAL — CRM Service Layer
 * AI-Ready Architecture (Phase 10)
 *
 * Clean reusable actions for CRM operations.
 * Each action returns { data, error } for consistent handling.
 */

import { supabase } from "./supabase";

// ── CLIENTS ───────────────────────────────────────────────────
export const clientActions = {
  async getAll() {
    return supabase.from("clients").select("*").order("created_at", { ascending: false });
  },
  async getById(id) {
    return supabase.from("clients").select("*, client_notes(*), requests(*, services(name)), invoices(*)").eq("id", id).single();
  },
  async create(data) {
    return supabase.from("clients").insert([data]).select().single();
  },
  async update(id, data) {
    return supabase.from("clients").update(data).eq("id", id).select().single();
  },
  async delete(id) {
    return supabase.from("clients").delete().eq("id", id);
  },
  async search(term) {
    return supabase.from("clients").select("*")
      .or(`full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`)
      .order("created_at", { ascending: false });
  },
  async addNote(clientId, note, createdBy) {
    return supabase.from("client_notes").insert([{ client_id: clientId, note, created_by: createdBy }]).select().single();
  },
};

// ── REQUESTS ──────────────────────────────────────────────────
export const requestActions = {
  async getAll() {
    return supabase.from("requests")
      .select("*, clients(full_name, phone, email), services(name, price)")
      .order("created_at", { ascending: false });
  },
  async getById(id) {
    return supabase.from("requests")
      .select("*, clients(*), services(*), request_files(*)")
      .eq("id", id).single();
  },
  async create(data) {
    const requestNumber = `REQ-${Date.now()}`;
    return supabase.from("requests").insert([{ ...data, request_number: requestNumber }]).select().single();
  },
  async update(id, data) {
    return supabase.from("requests").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  },
  async updateStatus(id, status) {
    return supabase.from("requests").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  },
  async delete(id) {
    return supabase.from("requests").delete().eq("id", id);
  },
  async getByStatus(status) {
    return supabase.from("requests")
      .select("*, clients(full_name), services(name)")
      .eq("status", status)
      .order("created_at", { ascending: false });
  },
  async getByClient(clientId) {
    return supabase.from("requests")
      .select("*, services(name)")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });
  },
};

// ── SERVICES ──────────────────────────────────────────────────
export const serviceActions = {
  async getAll(activeOnly = false) {
    const q = supabase.from("services").select("*").order("name");
    return activeOnly ? q.eq("is_active", true) : q;
  },
  async getById(id) {
    return supabase.from("services").select("*").eq("id", id).single();
  },
  async create(data) {
    return supabase.from("services").insert([data]).select().single();
  },
  async update(id, data) {
    return supabase.from("services").update(data).eq("id", id).select().single();
  },
  async delete(id) {
    return supabase.from("services").delete().eq("id", id);
  },
  async toggleActive(id, current) {
    return supabase.from("services").update({ is_active: !current }).eq("id", id);
  },
};

// ── INVOICES ──────────────────────────────────────────────────
export const invoiceActions = {
  async getAll() {
    return supabase.from("invoices")
      .select("*, requests(request_number, clients(full_name), services(name))")
      .order("created_at", { ascending: false });
  },
  async getById(id) {
    return supabase.from("invoices")
      .select("*, requests(*, clients(*), services(*))")
      .eq("id", id).single();
  },
  async create(data) {
    const invoice_number = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Date.now().toString().slice(-4)}`;
    return supabase.from("invoices").insert([{ ...data, invoice_number }]).select().single();
  },
  async update(id, data) {
    return supabase.from("invoices").update(data).eq("id", id).select().single();
  },
  async markPaid(id) {
    return supabase.from("invoices").update({ status: "Paid" }).eq("id", id);
  },
  async markUnpaid(id) {
    return supabase.from("invoices").update({ status: "Pending" }).eq("id", id);
  },
  async delete(id) {
    return supabase.from("invoices").delete().eq("id", id);
  },
};

// ── ANALYTICS ─────────────────────────────────────────────────
export const analyticsActions = {
  async getOverview() {
    const [clients, requests, invoices, services] = await Promise.all([
      supabase.from("clients").select("id", { count: "exact" }),
      supabase.from("requests").select("id, status", { count: "exact" }),
      supabase.from("invoices").select("amount, status"),
      supabase.from("services").select("id", { count: "exact" }).eq("is_active", true),
    ]);
    const totalRevenue = (invoices.data || []).filter(i => i.status === "Paid").reduce((s, i) => s + Number(i.amount), 0);
    const pendingRevenue = (invoices.data || []).filter(i => i.status === "Pending").reduce((s, i) => s + Number(i.amount), 0);
    const statusCounts = {};
    (requests.data || []).forEach(r => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });
    return {
      totalClients: clients.count || 0,
      totalRequests: requests.count || 0,
      activeServices: services.count || 0,
      totalRevenue,
      pendingRevenue,
      statusCounts,
    };
  },

  async getMonthlyRequests(months = 6) {
    const from = new Date();
    from.setMonth(from.getMonth() - months);
    const { data } = await supabase.from("requests")
      .select("created_at, status")
      .gte("created_at", from.toISOString())
      .order("created_at");
    const counts = {};
    (data || []).forEach(r => {
      const label = new Date(r.created_at).toLocaleString("ar", { month: "short", year: "2-digit" });
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts);
  },

  async getTopServices(limit = 5) {
    const { data } = await supabase.from("requests")
      .select("service_id, services(name)")
      .not("service_id", "is", null);
    const counts = {};
    (data || []).forEach(r => {
      const name = r.services?.name || r.service_id;
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit);
  },
};

// ── DOCUMENTS ─────────────────────────────────────────────────
export const documentActions = {
  async upload(requestId, file, fileType) {
    const safeName = file.name.replace(/[^\w.-]+/g, "-");
    const path = `${requestId}/${Date.now()}-${safeName}`;
    const { error: upErr } = await supabase.storage.from("request-documents").upload(path, file);
    if (upErr) return { error: upErr };
    return supabase.from("request_files").insert([{
      request_id: requestId,
      file_type: fileType,
      file_name: file.name,
      storage_path: path,
    }]).select().single();
  },
  async getSignedUrl(storagePath, expiresIn = 60) {
    return supabase.storage.from("request-documents").createSignedUrl(storagePath, expiresIn);
  },
  async delete(fileId, storagePath) {
    await supabase.storage.from("request-documents").remove([storagePath]);
    return supabase.from("request_files").delete().eq("id", fileId);
  },
};
