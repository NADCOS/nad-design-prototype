// Guest registrations — Supabase-backed instead of the admin's own browser
// localStorage, so every admin sees the same list and a guest can log back
// in from any device. RLS is enabled with NO client policies: the table is
// invisible to the anon/publishable key, and only this service-role endpoint
// (plus guest-lookup.js) can read or write it.
//
// Run once in the Supabase SQL editor:
//   create table registrations (
//     id bigint generated always as identity primary key,
//     email text,
//     phone text,
//     registered_at date not null default current_date,
//     status text not null default 'pending',
//     suspended boolean not null default false,
//     created_at timestamptz not null default now()
//   );
//   alter table registrations enable row level security;
import { getSupabaseAdmin } from './services/supabaseAdmin.js';
import { requireAdmin } from './services/verifyAdmin.js';

function toClient(row) {
  return { id: row.id, email: row.email || '', phone: row.phone || '', registeredAt: row.registered_at, status: row.status, suspended: row.suspended };
}

export default async function handler(req, res) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) { res.status(200).json({ success: true, registrations: [] }); return; }

  if (req.method === 'POST' && req.body && req.body.action === 'dedupe') {
    if (!(await requireAdmin(req))) { res.status(401).json({ success: false, error: 'Unauthorized.' }); return; }
    const { data, error } = await supabaseAdmin.from('registrations').select('*');
    if (error) { res.status(500).json({ success: false, error: 'Could not load registrations.' }); return; }
    const bestByKey = new Map(); const noKey = [];
    (data || []).forEach((r) => {
      const key = (r.email || r.phone || '').trim().toLowerCase();
      if (!key) { noKey.push(r); return; }
      const score = (r.status === 'verified' ? 1 : 0) * 1e15 + new Date(r.registered_at || 0).getTime();
      const existing = bestByKey.get(key);
      if (!existing || score > existing.score) bestByKey.set(key, { r, score });
    });
    const keep = new Set([...Array.from(bestByKey.values()).map((x) => x.r.id), ...noKey.map((r) => r.id)]);
    const toDelete = (data || []).filter((r) => !keep.has(r.id)).map((r) => r.id);
    if (toDelete.length) await supabaseAdmin.from('registrations').delete().in('id', toDelete);
    const { data: remaining } = await supabaseAdmin.from('registrations').select('*').order('id', { ascending: true });
    res.status(200).json({ success: true, registrations: (remaining || []).map(toClient) });
    return;
  }

  if (req.method === 'GET') {
    if (!(await requireAdmin(req))) { res.status(401).json({ success: false, error: 'Unauthorized.' }); return; }
    const { data, error } = await supabaseAdmin.from('registrations').select('*').order('id', { ascending: true });
    if (error) { res.status(500).json({ success: false, error: 'Could not load registrations.' }); return; }
    res.status(200).json({ success: true, registrations: (data || []).map(toClient) });
    return;
  }

  if (req.method === 'POST') {
    // Public — this is how a visitor registers. No admin auth required.
    const { email, phone } = req.body || {};
    const cleanEmail = typeof email === 'string' ? email.trim() : '';
    const cleanPhone = typeof phone === 'string' ? phone.trim() : '';
    if (!cleanEmail && !cleanPhone) { res.status(400).json({ success: false, error: 'Email or phone is required.' }); return; }
    const { data, error } = await supabaseAdmin.from('registrations').insert({ email: cleanEmail || null, phone: cleanPhone || null, status: 'pending' }).select().single();
    if (error) { res.status(500).json({ success: false, error: 'Could not save your registration.' }); return; }
    res.status(200).json({ success: true, registration: toClient(data) });
    return;
  }

  if (req.method === 'PATCH') {
    if (!(await requireAdmin(req))) { res.status(401).json({ success: false, error: 'Unauthorized.' }); return; }
    const { id, status, suspended } = req.body || {};
    if (!id) { res.status(400).json({ success: false, error: 'Missing id.' }); return; }
    const fields = {};
    if (typeof status === 'string') fields.status = status;
    if (typeof suspended === 'boolean') fields.suspended = suspended;
    const { data, error } = await supabaseAdmin.from('registrations').update(fields).eq('id', id).select().single();
    if (error) { res.status(500).json({ success: false, error: 'Could not update registration.' }); return; }
    res.status(200).json({ success: true, registration: toClient(data) });
    return;
  }

  res.status(405).json({ success: false, error: 'Method not supported.' });
}
