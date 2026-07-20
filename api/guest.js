// NAD Design — consolidated /api/guest function.
// Vercel Hobby allows max 12 serverless functions per deployment, so all
// guest-* endpoints live in this ONE function; vercel.json rewrites map the
// original /api/guest-<name> URLs here (the frontend is unchanged).
import h0 from './_handlers/guest-lookup.js';
import h1 from './_handlers/guest-projects.js';

const routes = {
  'guest-lookup': h0,
  'guest-projects': h1,
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
