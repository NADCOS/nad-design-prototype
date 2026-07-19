// Verifies a Supabase access token belongs to a signed-in session. The admin
// signs in anonymously (supabase.auth.signInAnonymously()) only after passing
// the passcode check in admin-login.js, so a valid session == verified admin.
// Used to gate every admin-only serverless endpoint below.
import { getSupabaseAdmin } from './supabaseAdmin.js';

export async function requireAdmin(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (!token) return false;
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return false;
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    return !error && !!(data && data.user);
  } catch (e) {
    return false;
  }
}
