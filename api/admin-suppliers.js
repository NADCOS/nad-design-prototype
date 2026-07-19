// Supplier directory — Supabase-backed instead of the admin's own browser
// localStorage, so it's shared across admins/devices. RLS enabled, no client
// policies; only this service-role endpoint touches the table.
//
// Run once in the Supabase SQL editor:
//   create table suppliers (
//     id bigint generated always as identity primary key,
//     name text not null,
//     category text not null default 'Furniture',
//     delivery text not null default '4-6 weeks',
//     website text, email text, phone text,
//     status text not null default 'approved',
//     sort_order int not null default 0,
//     created_at timestamptz not null default now()
//   );
//   alter table suppliers enable row level security;
//
//   -- optional: seed the same 8 suppliers the prototype shipped with
//   insert into suppliers (name, category, delivery, website, email, phone, status, sort_order) values
//     ('Alwafi Interiors', 'Flooring & Stone', '2-3 weeks', 'https://alwafiinteriors.sa', 'alwafiinteriors@supplier.sa', '+966 510 200 4000', 'approved', 0),
//     ('Studio Terra', 'Furniture', '4-6 weeks', 'https://studioterra.sa', 'studioterra@supplier.sa', '+966 511 211 4087', 'approved', 1),
//     ('Bergman Nordic', 'Lighting', '6-8 weeks', 'https://bergmannordic.sa', 'bergmannordic@supplier.sa', '+966 512 222 4174', 'approved', 2),
//     ('Casa Bronze', 'Fabrics', '2-3 weeks', 'https://casabronze.sa', 'casabronze@supplier.sa', '+966 513 233 4261', 'approved', 3),
//     ('Al Faisaliah Furnishings', 'Metal & Hardware', '4-6 weeks', 'https://alfaisaliahfurnishings.sa', 'alfaisaliahfurnishings@supplier.sa', '+966 514 244 4348', 'approved', 4),
//     ('Noir Metal Works', 'Flooring & Stone', '6-8 weeks', 'https://noirmetalworks.sa', 'noirmetalworks@supplier.sa', '+966 515 255 4435', 'approved', 5),
//     ('Linen & Co.', 'Furniture', '2-3 weeks', 'https://linenco.sa', 'linenco@supplier.sa', '+966 516 266 4522', 'approved', 6),
//     ('Riyadh Stone Co.', 'Lighting', '4-6 weeks', 'https://riyadhstoneco.sa', 'riyadhstoneco@supplier.sa', '+966 517 277 4609', 'approved', 7);
import { getSupabaseAdmin } from './services/supabaseAdmin.js';
import { requireAdmin } from './services/verifyAdmin.js';

function toClient(row) {
  return { id: row.id, name: row.name, category: row.category, delivery: row.delivery, website: row.website || '', email: row.email || '', phone: row.phone || '', status: row.status };
}

export default async function handler(req, res) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) { res.status(200).json({ success: true, suppliers: [] }); return; }
  if (!(await requireAdmin(req))) { res.status(401).json({ success: false, error: 'Unauthorized.' }); return; }

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin.from('suppliers').select('*').order('sort_order').order('id');
    if (error) { res.status(500).json({ success: false, error: 'Could not load suppliers.' }); return; }
    res.status(200).json({ success: true, suppliers: (data || []).map(toClient) });
    return;
  }
  if (req.method === 'POST') {
    const { name, website, email, phone } = req.body || {};
    const cleanName = String(name || '').trim();
    if (!cleanName) { res.status(400).json({ success: false, error: 'Name is required.' }); return; }
    const slug = cleanName.toLowerCase().replace(/[^a-z]+/g, '');
    const { data, error } = await supabaseAdmin.from('suppliers').insert({
      name: cleanName, category: 'Furniture', delivery: '4-6 weeks',
      website: String(website || '').trim() || ('https://' + slug + '.sa'),
      email: String(email || '').trim() || (slug + '@supplier.sa'),
      phone: String(phone || '').trim(), status: 'approved',
    }).select().single();
    if (error) { res.status(500).json({ success: false, error: 'Could not add supplier.' }); return; }
    res.status(200).json({ success: true, supplier: toClient(data) });
    return;
  }
  if (req.method === 'PATCH') {
    const { id, field, value, status } = req.body || {};
    if (!id) { res.status(400).json({ success: false, error: 'Missing id.' }); return; }
    const fields = {};
    if (typeof field === 'string' && value !== undefined) fields[field] = value;
    if (typeof status === 'string') fields.status = status;
    const { data, error } = await supabaseAdmin.from('suppliers').update(fields).eq('id', id).select().single();
    if (error) { res.status(500).json({ success: false, error: 'Could not update supplier.' }); return; }
    res.status(200).json({ success: true, supplier: toClient(data) });
    return;
  }
  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) { res.status(400).json({ success: false, error: 'Missing id.' }); return; }
    const { error } = await supabaseAdmin.from('suppliers').delete().eq('id', id);
    if (error) { res.status(500).json({ success: false, error: 'Could not remove supplier.' }); return; }
    res.status(200).json({ success: true });
    return;
  }
  res.status(405).json({ success: false, error: 'Method not supported.' });
}
