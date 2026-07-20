// Admin-managed site data (design-level pricing overrides, clients list,
// consultation requests) — persisted in Supabase so dashboard edits survive
// redeploys and are the same for every admin on every device.
//
// Run once in the Supabase SQL editor:
//   create table site_data (
//     key text primary key,
//     data jsonb not null default '{}',
//     updated_at timestamptz not null default now()
//   );
//   alter table site_data enable row level security;
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js';
import { requireAdmin } from './_lib/verifyAdmin.js';

const KNOWN_KEYS = ['pricing', 'clients', 'consultations'];
const PUBLIC_KEYS = ['pricing']; // pricing affects what guests see site-wide

export default async function handler(req, res) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) { res.status(200).json({ success: true, data: {} }); return; }

  if (req.method === 'GET') {
    const requested = String((req.query && req.query.keys) || '').split(',').map((k) => k.trim()).filter((k) => KNOWN_KEYS.includes(k));
    const keys = requested.length ? requested : KNOWN_KEYS;
    const needsAdmin = keys.some((k) => !PUBLIC_KEYS.includes(k));
    if (needsAdmin && !(await requireAdmin(req))) { res.status(401).json({ success: false, error: 'Unauthorized.' }); return; }
    try {
      const { data, error } = await supabaseAdmin.from('site_data').select('*').in('key', keys);
      if (error) throw error;
      const out = {};
      (data || []).forEach((row) => { out[row.key] = row.data; });
      res.status(200).json({ success: true, data: out });
    } catch (err) {
      console.error('[admin-site-data] load failed:', err);
      res.status(500).json({ success: false, error: 'Could not load site data.' });
    }
    return;
  }

  if (req.method === 'POST') {
    if (!(await requireAdmin(req))) { res.status(401).json({ success: false, error: 'Unauthorized.' }); return; }
    const { key, data } = req.body || {};
    if (!KNOWN_KEYS.includes(key)) { res.status(400).json({ success: false, error: 'Unknown key.' }); return; }
    if (!data || typeof data !== 'object') { res.status(400).json({ success: false, error: 'Missing data.' }); return; }
    try {
      const { error } = await supabaseAdmin.from('site_data').upsert({ key, data, updated_at: new Date().toISOString() });
      if (error) throw error;
      res.status(200).json({ success: true });
    } catch (err) {
      console.error('[admin-site-data] save failed:', err);
      res.status(500).json({ success: false, error: 'Could not save.' });
    }
    return;
  }

  res.status(405).json({ success: false, error: 'Method not supported.' });
}
