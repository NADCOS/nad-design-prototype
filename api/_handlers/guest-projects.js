// Guest saved projects — a guest's design-journey selections persist in
// Supabase keyed by their email/phone identifier, so they can resume from
// any device. Also powers the admin funnel + lead-quality views.
//
// Run once in the Supabase SQL editor:
//   create table guest_projects (
//     identifier text primary key,
//     data jsonb not null default '{}',
//     max_step_index int not null default 0,
//     updated_at timestamptz not null default now()
//   );
//   alter table guest_projects enable row level security;
//
// RLS with no client policies: only this service-role endpoint can touch it.
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { requireAdmin } from '../_lib/verifyAdmin.js';

const norm = (v) => String(v || '').trim().toLowerCase();

export default async function handler(req, res) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) { res.status(200).json({ success: true, found: false, projects: [] }); return; }

  if (req.method === 'GET') {
    const identifier = norm(req.query && req.query.identifier);
    if (identifier) {
      // Public: a guest loading their own saved project. Returns only the
      // one matching row — never the whole table.
      try {
        const { data, error } = await supabaseAdmin.from('guest_projects').select('*').eq('identifier', identifier).maybeSingle();
        if (error) throw error;
        if (!data) { res.status(200).json({ success: true, found: false }); return; }
        res.status(200).json({ success: true, found: true, project: { ...data.data, maxStepIndex: data.max_step_index, updatedAt: data.updated_at } });
      } catch (err) {
        console.error('[guest-projects] lookup failed:', err);
        res.status(500).json({ success: false, error: 'Could not load your saved project.' });
      }
      return;
    }
    // No identifier: admin-only full list (funnel + leads views).
    if (!(await requireAdmin(req))) { res.status(401).json({ success: false, error: 'Unauthorized.' }); return; }
    try {
      const { data, error } = await supabaseAdmin.from('guest_projects').select('*').order('updated_at', { ascending: false }).limit(2000);
      if (error) throw error;
      res.status(200).json({ success: true, projects: (data || []).map((r) => ({ identifier: r.identifier, maxStepIndex: r.max_step_index, updatedAt: r.updated_at, ...r.data })) });
    } catch (err) {
      console.error('[guest-projects] list failed:', err);
      res.status(500).json({ success: false, error: 'Could not load projects.' });
    }
    return;
  }

  if (req.method === 'POST') {
    // Public: a guest saving their own journey (upsert by identifier).
    const body = req.body || {};
    const identifier = norm(body.identifier);
    if (!identifier) { res.status(400).json({ success: false, error: 'Missing identifier.' }); return; }
    const maxStepIndex = Number.isFinite(Number(body.maxStepIndex)) ? Math.max(0, Math.min(16, Number(body.maxStepIndex))) : 0;
    let data = body.data && typeof body.data === 'object' ? body.data : {};
    // Safety: strip any large base64 payloads (uploads are saved as names only).
    try { if (JSON.stringify(data).length > 200000) data = { note: 'payload too large — truncated' }; } catch (e) { data = {}; }
    try {
      const { error } = await supabaseAdmin.from('guest_projects').upsert({ identifier, data, max_step_index: maxStepIndex, updated_at: new Date().toISOString() });
      if (error) throw error;
      res.status(200).json({ success: true });
    } catch (err) {
      console.error('[guest-projects] save failed:', err);
      res.status(500).json({ success: false, error: 'Could not save your project.' });
    }
    return;
  }

  res.status(405).json({ success: false, error: 'Method not supported.' });
}
