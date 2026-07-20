// NAD Design — consolidated /api/admin function.
// Vercel Hobby allows max 12 serverless functions per deployment, so all
// admin-* endpoints live in this ONE function; vercel.json rewrites map the
// original /api/admin-<name> URLs here (the frontend is unchanged).
import h0 from './_handlers/admin-activity-stats.js';
import h1 from './_handlers/admin-generation-counts.js';
import h2 from './_handlers/admin-login.js';
import h3 from './_handlers/admin-registrations.js';
import h4 from './_handlers/admin-reset-generations.js';
import h5 from './_handlers/admin-site-data.js';
import h6 from './_handlers/admin-suppliers.js';

const routes = {
  'admin-activity-stats': h0,
  'admin-generation-counts': h1,
  'admin-login': h2,
  'admin-registrations': h3,
  'admin-reset-generations': h4,
  'admin-site-data': h5,
  'admin-suppliers': h6,
};

export default async function handler(req, res) {
  const action = (req.query && req.query.action) || '';
  const route = routes[action];
  if (!route) {
    res.status(404).json({ success: false, error: 'Unknown API action.' });
    return;
  }
  return route(req, res);
}
