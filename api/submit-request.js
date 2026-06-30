// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Public booking submission (service-role, bypasses RLS)
// /api/submit-request
// The public booking form can't write to clients/requests directly (RLS is
// locked down), so it posts here and we create the records server-side.
// ═══════════════════════════════════════════════════════════════

const { applyCors } = require("./_cors");
const { checkRateLimit } = require("./_rateLimit");
const { createClient } = require("@supabase/supabase-js");

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
      .insert([{ request_number: requestNumber, client_id: client.id, service_id: serviceId, status: "New", notes }])
      .select().single();
    if (reqErr) throw reqErr;

    return res.status(200).json({
      ok: true,
      requestId: request.id,
      requestNumber,
      client: { id: client.id, full_name: client.full_name, email: client.email, phone: client.phone },
    });
  } catch (err) {
    console.error("[submit-request] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
