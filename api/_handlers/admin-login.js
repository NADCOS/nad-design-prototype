// POST /api/admin-login — verifies the admin passcode server-side so it
// never ships in the client JS bundle (previously compared inline in
// useAppState.js, readable by anyone who opened devtools or the built file).
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Only POST requests are supported.' });
    return;
  }
  const configured = process.env.ADMIN_PASSCODE;
  if (!configured) {
    res.status(500).json({ success: false, error: 'Admin login is not configured yet.' });
    return;
  }
  const { passcode } = req.body || {};
  if (typeof passcode === 'string' && passcode === configured) {
    res.status(200).json({ success: true });
    return;
  }
  res.status(401).json({ success: false, error: 'Incorrect passcode.' });
}
