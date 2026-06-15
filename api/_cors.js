// ═══════════════════════════════════════════════════════════════
// Shared CORS helper for the /api serverless functions.
// Restricts browser cross-origin access to an allowlist instead of "*".
// Configure extra origins via the ALLOWED_ORIGINS env var (comma-separated).
// ═══════════════════════════════════════════════════════════════

const DEFAULT_ORIGINS = [
  "https://alkownglobal.com",
  "https://www.alkownglobal.com",
];

const ALLOWED_ORIGINS = [
  ...DEFAULT_ORIGINS,
  ...(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
];

// Applies CORS headers. Returns true if the caller's origin is allowed.
function applyCors(req, res) {
  const origin = req.headers.origin;
  const allowed = !origin || ALLOWED_ORIGINS.includes(origin);

  // Reflect the origin only when it's on the allowlist; otherwise fall back
  // to the canonical domain so browsers block disallowed cross-site calls.
  res.setHeader("Access-Control-Allow-Origin", allowed && origin ? origin : ALLOWED_ORIGINS[0]);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  return allowed;
}

module.exports = { applyCors, ALLOWED_ORIGINS };
