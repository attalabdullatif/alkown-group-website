// ═══════════════════════════════════════════════════════════════
// Per-IP rate limit for the public serverless endpoints.
// Backed by the check_rate_limit() SQL function (migration 022).
// Fails OPEN (allows the request) if Supabase isn't configured, so a
// missing env var can never take the endpoint down.
// ═══════════════════════════════════════════════════════════════

const { createClient } = require("@supabase/supabase-js");

// Best-effort client IP from common proxy headers (Vercel sets these).
function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown";
}

// Returns true if allowed, false if the limit is exceeded.
async function checkRateLimit(req, { bucket, max, windowSeconds }) {
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (!url || !key) return true; // not configured → don't block

  try {
    const sb = createClient(url, key);
    const { data, error } = await sb.rpc("check_rate_limit", {
      p_identifier:     `${bucket}:${clientIp(req)}`,
      p_max:            max,
      p_window_seconds: windowSeconds,
    });
    if (error) return true;     // function missing / transient → fail open
    return data !== false;
  } catch {
    return true;                // never block on infra error
  }
}

module.exports = { checkRateLimit, clientIp };
