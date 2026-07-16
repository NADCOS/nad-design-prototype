// NAD Design — POST /api/chat-mark-read
// Marks a visitor's messages in a session as seen, once the admin opens that
// conversation in the Chats tab (clears its unread badge).
import { getSupabaseAdmin } from './services/supabaseAdmin.js';

function parseBody(req) {
  let payload = req.body;
  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload); } catch (e) { return null; }
  }
  return payload && typeof payload === 'object' ? payload : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Only POST requests are supported.' });
    return;
  }
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) { res.status(200).json({ success: false }); return; }
  const payload = parseBody(req);
  const sessionId = payload && payload.sessionId;
  if (!sessionId) { res.status(400).json({ success: false, error: 'sessionId is required.' }); return; }
  try {
    const { error } = await supabaseAdmin
      .from('chat_messages').update({ read_by_admin: true }).eq('session_id', sessionId).eq('sender', 'user');
    if (error) throw error;
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[chat-mark-read] failed:', err);
    res.status(500).json({ success: false, error: 'Could not mark messages read.' });
  }
}
