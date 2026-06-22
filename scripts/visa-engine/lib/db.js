// ═══════════════════════════════════════════════════════════════
// Visa Rules Engine — Supabase client for the import/export scripts.
// Uses the SERVICE ROLE key (server-side only) so scripts can write to
// vis_rules. Never expose this key in the browser bundle.
//
// Required env vars (e.g. in a local .env you source before running):
//   REACT_APP_SUPABASE_URL        = https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY     = <service role key>
// ═══════════════════════════════════════════════════════════════

const { createClient } = require("@supabase/supabase-js");

function getClient() {
  const url = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing env: set REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running."
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

module.exports = { getClient };
