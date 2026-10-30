// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Public booking submission (service-role, bypasses RLS)
// /api/submit-request
// The public booking form can't write to clients/requests directly (RLS is
// locked down), so it posts here and we create the records server-side.
// Attachments: anonymous visitors can't write to Storage, so for each file
// the form announces we return a one-time signed upload URL scoped to the
// new request's folder, and record the request_files row.
// ═══════════════════════════════════════════════════════════════

const { applyCors } = require("./_cors");
const { checkRateLimit } = require("./_rateLimit");
const { createClient } = require("@supabase/supabase-js");

const MAX_FILES = 6;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_FILE = /^(image\/[\w.+-]+|application\/pdf)$/;

function cleanFiles(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, MAX_FILES)
    .map((f, i) => ({
      index:   Number.isInteger(f?.index) ? f.index : i,
      name:    String(f?.name || "file").slice(0, 120),
      type:    String(f?.type || ""),
      size:    Number(f?.size) || 0,
      docType: String(f?.docType || "وثيقة").slice(0, 60),
    }))
    .filter(f => ALLOWED_FILE.test(f.type) && f.size > 0 && f.size <= MAX_FILE_BYTES);
}

module.exports = async (req, res) => {
  applyCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  // Throttle abuse on the public form: 6 submissions / minute per IP.
  const allowed = await checkRateLimit(req, { bucket: "submit-request", max: 6, windowSeconds: 60 });
  if (!allowed) return res.status(429).json({ error: "Too many requests. Please slow down." });

  const url = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("[submit-request] Missing SUPABASE_SERVICE_ROLE_KEY / URL");
    return res.status(500).json({ error: "Server not configured." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const full_name = String(body.name  || "").trim();
    const phone     = String(body.phone || "").trim();
    const email     = String(body.email || "").trim().toLowerCase();
    const serviceId = body.serviceId || null;
    const notes     = String(body.notes || "").slice(0, 4000);
    const files     = cleanFiles(body.files);

    if (!full_name || !phone) {
      return res.status(400).json({ error: "Name and phone are required." });
    }

    const sb = createClient(url, key, { auth: { persistSession: false } });

    // ── Find-or-create the client (dedup by email then phone) ──
    let client = null;
    if (email) {
      const { data } = await sb.from("clients").select("*").eq("email", email).maybeSingle();
      client = data || null;
    }
    if (!client && phone) {
      const { data } = await sb.from("clients").select("*").eq("phone", phone).maybeSingle();
      client = data || null;
    }
    if (client) {
      const { data, error } = await sb.from("clients")
        .update({ full_name, phone, email: email || client.email })
        .eq("id", client.id).select().single();
      if (error) throw error;
      client = data;
    } else {
      const { data, error } = await sb.from("clients")
        .insert([{ full_name, phone, email }]).select().single();
      if (error) throw error;
      client = data;
    }

    // ── Create the request ──
    const requestNumber = `REQ-${Date.now()}`;
    const { data: request, error: reqErr } = await sb.from("requests")
      .insert([{ request_number: requestNumber, client_id: client.id, service_id: serviceId, status: "Lead", notes }])
      .select().single();
    if (reqErr) throw reqErr;

    // ── Signed upload URLs for the attachments (best-effort) ──
    const uploads = [];
    for (const f of files) {
      const safeName = f.name.replace(/[^\w.-]+/g, "-");
      const path = `${request.id}/${Date.now()}-${f.index}-${safeName}`;
      const { data: signed, error: signErr } = await sb.storage
        .from("request-documents").createSignedUploadUrl(path);
      if (signErr) { console.error("[submit-request] sign upload:", signErr.message); continue; }
      const { error: rowErr } = await sb.from("request_files").insert([{
        request_id: request.id, file_type: f.docType, file_name: f.name, storage_path: signed.path,
      }]);
      if (rowErr) { console.error("[submit-request] file row:", rowErr.message); continue; }
      uploads.push({ index: f.index, path: signed.path, token: signed.token });
    }

    return res.status(200).json({
      ok: true,
      requestId: request.id,
      requestNumber,
      uploads,
      client: { id: client.id, full_name: client.full_name, email: client.email, phone: client.phone },
    });
  } catch (err) {
    console.error("[submit-request] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
