// NAD Design — GET/POST /api/chat-messages
// Backs the floating chat widget: fetches a visitor session's message
// history and appends new messages (from the widget or the admin dashboard).
//
// Run once in the Supabase SQL editor:
//   create table chat_messages (
//     id bigint generated always as identity primary key,
//     session_id text not null,
//     identifier text,
//     sender text not null check (sender in ('user','admin')),
//     text text not null,
//     created_at timestamptz not null default now(),
//     read_by_admin boolean not null default false
//   );
//   create index chat_messages_session_idx on chat_messages(session_id, created_at);
import { getSupabaseAdmin } from './services/supabaseAdmin.js';

function parseBody(req) {
  let payload = req.body;
  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload); } catch (e) { return null; }
  }
  return payload && typeof payload === 'object' ? payload : null;
}

export default async function handler(req, res) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    res.status(200).json({ success: false, error: 'Chat backend not configured.' });
    return;
  }

  if (req.method === 'GET') {
    const sessionId = (req.query.sessionId || '').toString().trim();
    if (!sessionId) { res.status(400).json({ success: false, error: 'sessionId is required.' }); return; }
    try {
      const { data, error } = await supabaseAdmin
        .from('chat_messages').select('*').eq('session_id', sessionId)
        .order('created_at', { ascending: true }).limit(500);
      if (error) throw error;
      res.status(200).json({ success: true, messages: data || [] });
    } catch (err) {
      console.error('[chat-messages] GET failed:', err);
      res.status(500).json({ success: false, error: 'Could not load messages.' });
    }
    return;
  }

  if (req.method === 'POST') {
    const payload = parseBody(req);
    const sessionId = payload && payload.sessionId;
    const sender = payload && payload.sender;
    const text = payload && payload.text;
    const identifier = payload && payload.identifier;
    if (!sessionId || !text || !['user', 'admin'].includes(sender)) {
      res.status(400).json({ success: false, error: 'sessionId, sender and text are required.' });
      return;
    }
    try {
      const row = {
        session_id: String(sessionId).slice(0, 200),
        identifier: identifier ? String(identifier).slice(0, 200) : null,
        sender,
        text: String(text).trim().slice(0, 4000),
        read_by_admin: sender === 'admin',
      };
      const { data, error } = await supabaseAdmin.from('chat_messages').insert(row).select().single();
      if (error) throw error;
      res.status(200).json({ success: true, message: data });
    } catch (err) {
      console.error('[chat-messages] POST failed:', err);
      res.status(500).json({ success: false, error: 'Could not send message.' });
    }
    return;
  }

  res.status(405).json({ success: false, error: 'Only GET and POST are supported.' });
}
