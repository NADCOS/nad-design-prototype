// NAD Design — server-side Supabase client using the SERVICE ROLE key.
// This file only runs in Vercel serverless functions (never bundled to the
// browser) and is used solely to enforce the per-guest daily AI generation
// cap against the `generation_logs` table, bypassing RLS via the service key.
import { createClient } from '@supabase/supabase-js';

let client = null;

export function getSupabaseAdmin() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
