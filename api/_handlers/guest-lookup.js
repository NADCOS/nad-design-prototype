// POST /api/guest-lookup — lets a returning guest sign back in by email/phone
// without exposing the full registrations table to the browser. The table
// has no client-readable RLS policy; only this service-role lookup can query
// it, and it only ever returns the ONE matching row, never the whole list.
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ success: false, error: 'Only POST requests are supported.' }); return; }
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) { res.status(200).json({ success: true, found: false }); return; }
  const identifier = String((req.body || {}).identifier || '').trim().toLowerCase();
  if (!identifier) { res.status(400).json({ success: false, error: 'Missing identifier.' }); return; }
  try {
    // Prototype scale: pull a bounded page and match in memory (mirrors the
    // original client-side matching logic exactly). Swap for a proper
    // .or() filter if the registrations table grows large.
    const { data, error } = await supabaseAdmin.from('registrations').select('*').limit(2000);
    if (error) throw error;
    const match = (data || []).find((r) => (r.email && r.email.toLowerCase() === identifier) || (r.phone && r.phone.replace(/\s+/g, '') === identifier.replace(/\s+/g, '')));
    if (!match) { res.status(200).json({ success: true, found: false }); return; }
    res.status(200).json({ success: true, found: true, email: match.email || '', phone: match.phone || '' });
  } catch (err) {
    console.error('[guest-lookup] failed:', err);
    res.status(500).json({ success: false, error: 'Could not look up your registration.' });
  }
}
