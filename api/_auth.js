// ═══════════════════════════════════════════════════════════════
// Staff authentication for admin-only serverless endpoints.
// Verifies the caller's Supabase access token (Authorization: Bearer …)
// and that the user has a row in user_roles (i.e. is staff).
// Returns { ok, status, error } — caller short-circuits on !ok.
// ═══════════════════════════════════════════════════════════════

const { createClient } = require("@supabase/supabase-js");

async function requireStaff(req) {
  const url     = process.env.REACT_APP_SUPABASE_URL;
  const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  const svcKey  = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;
  if (!url || !anonKey) {
    return { ok: false, status: 500, error: "Auth not configured" };
  }

  const header = req.headers.authorization || "";
  const token  = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return { ok: false, status: 401, error: "Authentication required" };

  try {
    // Validate the token and resolve the user.
    const { data: userData, error: userErr } = await createClient(url, anonKey)
      .auth.getUser(token);
    if (userErr || !userData?.user) {
      return { ok: false, status: 401, error: "Invalid or expired session" };
    }

    // Confirm the user is staff (has a user_roles row).
    const { data: roleRow } = await createClient(url, svcKey)
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (!roleRow) return { ok: false, status: 403, error: "Staff access required" };

    return { ok: true, user: userData.user, role: roleRow.role };
  } catch (e) {
    return { ok: false, status: 401, error: "Authentication failed" };
  }
}

module.exports = { requireStaff };
