// NAD Design — GET /api/chat-conversations
// Aggregates chat_messages into one row per visitor session for the admin
// dashboard's Chats tab: identifier, last message preview, timestamp, and
// how many of the visitor's messages the admin hasn't seen yet.
import { getSupabaseAdmin } from './services/supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ success: false, error: 'Only GET requests are supported.' });
    return;
  }
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) { res.status(200).json({ success: true, conversations: [] }); return; }
  try {
    const { data, error } = await supabaseAdmin
      .from('chat_messages').select('*').order('created_at', { ascending: true }).limit(5000);
    if (error) throw error;
    const bySession = new Map();
    (data || []).forEach((m) => {
      const entry = bySession.get(m.session_id) || {
        sessionId: m.session_id, identifier: null, lastMessage: '', lastSender: null, lastMessageAt: null, unreadCount: 0,
      };
      if (m.identifier) entry.identifier = m.identifier;
      entry.lastMessage = m.text;
      entry.lastSender = m.sender;
      entry.lastMessageAt = m.created_at;
      if (m.sender === 'user' && !m.read_by_admin) entry.unreadCount += 1;
      bySession.set(m.session_id, entry);
    });
    const conversations = Array.from(bySession.values())
      .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
    res.status(200).json({ success: true, conversations });
  } catch (err) {
    console.error('[chat-conversations] failed:', err);
    res.status(500).json({ success: false, error: 'Could not load conversations.' });
  }
}
