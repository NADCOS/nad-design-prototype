// NAD Design — GET /api/admin-generation-counts
// Returns { [identifier]: count } aggregated from generation_logs so the admin
// dashboard can show how many images each registered guest has generated.
import { getSupabaseAdmin } from './services/supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ success: false, error: 'Only GET requests are supported.' });
    return;
  }
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    res.status(200).json({ success: true, counts: {} });
    return;
  }
  try {
    const { data, error } = await supabaseAdmin.from('generation_logs').select('identifier').limit(20000);
    if (error) throw error;
    const counts = {};
    (data || []).forEach((row) => {
      const id = (row.identifier || '').trim().toLowerCase();
      if (id) counts[id] = (counts[id] || 0) + 1;
    });
    res.status(200).json({ success: true, counts });
  } catch (err) {
    console.error('[admin-generation-counts] failed:', err);
    res.status(500).json({ success: false, error: 'Could not load generation counts.' });
  }
}
