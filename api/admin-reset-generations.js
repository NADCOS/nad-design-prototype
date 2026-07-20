// NAD Design — POST /api/admin-reset-generations
// Admin-only: clears a guest's generation_logs rows so they can generate
// again immediately (the daily cap counts rows since UTC midnight).
import { requireAdmin } from './_lib/verifyAdmin.js';
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Only POST requests are supported.' });
    return;
  }
  if (!(await requireAdmin(req))) {
    res.status(401).json({ success: false, error: 'Admin authentication required.' });
    return;
  }
  let payload = req.body;
  if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch (e) { payload = null; } }
  const identifier = payload && typeof payload.identifier === 'string' ? payload.identifier.trim().toLowerCase() : '';
  if (!identifier) {
    res.status(400).json({ success: false, error: 'A guest identifier (email or phone) is required.' });
    return;
  }
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    res.status(500).json({ success: false, error: 'Supabase is not configured on the server.' });
    return;
  }
  try {
    const { error } = await supabaseAdmin.from('generation_logs').delete().eq('identifier', identifier);
    if (error) throw error;
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[admin-reset-generations] failed:', err);
    res.status(500).json({ success: false, error: 'Could not reset generations for this client.' });
  }
}
