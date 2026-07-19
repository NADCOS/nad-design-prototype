// NAD Design — GET /api/admin-activity-stats
// Aggregates generation_logs by month (last 12) and year (last 5) so the
// admin Overview graph has real, site-wide counts (not per-browser data).
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js';

function monthKey(d) { return d.toISOString().slice(0, 7); }
function yearKey(d) { return String(d.getUTCFullYear()); }

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ success: false, error: 'Only GET requests are supported.' });
    return;
  }
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    res.status(200).json({ success: true, monthly: [], yearly: [] });
    return;
  }
  try {
    const since = new Date();
    since.setUTCFullYear(since.getUTCFullYear() - 5);
    const { data, error } = await supabaseAdmin.from('generation_logs').select('created_at').gte('created_at', since.toISOString()).limit(50000);
    if (error) throw error;

    const monthlyMap = {}; const yearlyMap = {};
    (data || []).forEach((row) => {
      const d = new Date(row.created_at);
      if (isNaN(d)) return;
      const mk = monthKey(d); const yk = yearKey(d);
      monthlyMap[mk] = (monthlyMap[mk] || 0) + 1;
      yearlyMap[yk] = (yearlyMap[yk] || 0) + 1;
    });

    const now = new Date();
    const monthly = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const key = monthKey(d);
      monthly.push({ period: key, label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), count: monthlyMap[key] || 0 });
    }
    const yearly = [];
    for (let i = 4; i >= 0; i--) {
      const y = now.getUTCFullYear() - i;
      yearly.push({ period: String(y), label: String(y), count: yearlyMap[String(y)] || 0 });
    }
    res.status(200).json({ success: true, monthly, yearly });
  } catch (err) {
    console.error('[admin-activity-stats] failed:', err);
    res.status(500).json({ success: false, error: 'Could not load activity stats.' });
  }
}
