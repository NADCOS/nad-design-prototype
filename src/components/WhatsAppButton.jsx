import React from 'react';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS } from '../data/translations.js';

const SESSION_KEY = 'nad_chat_session_id';
const SEEN_KEY = 'nad_chat_seen_count';
const POLL_OPEN_MS = 4000;
const POLL_CLOSED_MS = 20000;

function getSessionId() {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : ('sess-' + Date.now() + '-' + Math.random().toString(36).slice(2));
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch (e) {
    return 'sess-' + Date.now();
  }
}

export default function WhatsAppButton() {
  const { state } = useAppState();
  const lang = state.lang;
  const T = STRINGS[lang].chat;
  const [open, setOpen] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState([{ sender: 'admin', text: T.welcome, local: true }]);
  const [backendOk, setBackendOk] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [unread, setUnread] = React.useState(0);
  const listRef = React.useRef(null);
  const sessionId = React.useRef(getSessionId()).current;
  const replyTimer = React.useRef(null);

  const fetchMessages = React.useCallback((markSeen) => {
    fetch('/api/chat-messages?sessionId=' + encodeURIComponent(sessionId)).then((r) => r.json()).then((data) => {
      if (data && data.success) {
        setBackendOk(true);
        setMessages((prev) => {
          const welcome = prev.find((m) => m.local);
          const next = welcome ? [welcome, ...data.messages] : data.messages;
          if (!markSeen) {
            let seen = 0;
            try { seen = Number(localStorage.getItem(SEEN_KEY) || 0); } catch (e) {}
            const adminCount = next.filter((m) => m.sender === 'admin').length;
            setUnread(Math.max(0, adminCount - seen));
          }
          return next;
        });
      } else {
        setBackendOk(false);
      }
    }).catch(() => setBackendOk(false));
  }, [sessionId]);

  React.useEffect(() => { fetchMessages(false); }, [fetchMessages]);

  React.useEffect(() => {
    if (!backendOk) return undefined;
    const t = setInterval(() => fetchMessages(false), open ? POLL_OPEN_MS : POLL_CLOSED_MS);
    return () => clearInterval(t);
  }, [backendOk, open, fetchMessages]);

  React.useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  React.useEffect(() => {
    if (open) {
      const adminCount = messages.filter((m) => m.sender === 'admin').length;
      try { localStorage.setItem(SEEN_KEY, String(adminCount)); } catch (e) {}
      setUnread(0);
    }
  }, [open, messages]);

  React.useEffect(() => () => { if (replyTimer.current) clearTimeout(replyTimer.current); }, []);

  const send = () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    if (!backendOk) {
      setMessages((m) => [...m, { sender: 'user', text }]);
      replyTimer.current = setTimeout(() => setMessages((m) => [...m, { sender: 'admin', text: T.autoReply }]), 1200);
      return;
    }
    setMessages((m) => [...m, { sender: 'user', text, pending: true }]);
    setSending(true);
    const identifier = state.role === 'guest' ? state.currentGuestIdentifier : null;
    fetch('/api/chat-messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, identifier, sender: 'user', text }),
    }).then((r) => r.json()).then((data) => {
      setSending(false);
      if (data && data.success) fetchMessages(true);
      else setMessages((m) => [...m, { sender: 'admin', text: T.autoReply }]);
    }).catch(() => {
      setSending(false);
      setMessages((m) => [...m, { sender: 'admin', text: T.autoReply }]);
    });
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{ position: 'fixed', bottom: 26, insetInlineEnd: 26, zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
      {open && (
        <div style={{ width: 340, maxWidth: 'calc(100vw - 40px)', height: 460, maxHeight: 'calc(100vh - 140px)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 18, boxShadow: '0 20px 50px oklch(20% 0.02 50 / 0.35)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'oklch(24% 0.02 55)', color: '#fff' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'oklch(64% 0.10 68)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: 'oklch(16% 0.02 50)', flexShrink: 0 }}>ND</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{T.title}</div>
              <div style={{ fontSize: 11.5, opacity: 0.75 }}>{T.status}</div>
            </div>
            <button type="button" aria-label={T.ariaClose} onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 20, lineHeight: 1, cursor: 'pointer', padding: 4 }}>&times;</button>
          </div>
          <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--bg)' }}>
            {messages.map((m, i) => (
              <div key={m.id || i} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '82%', background: m.sender === 'user' ? 'oklch(64% 0.10 68)' : 'var(--surface)', color: m.sender === 'user' ? 'oklch(16% 0.02 50)' : 'var(--text)', border: m.sender === 'user' ? 'none' : '1px solid var(--border)', padding: '9px 12px', borderRadius: 14, fontSize: 13.5, lineHeight: 1.5, opacity: m.pending ? 0.6 : 1 }}>
                {m.text}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, padding: 10, borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={T.placeholder}
              style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 100, padding: '10px 14px', fontSize: 13.5, background: 'var(--bg)', color: 'var(--text)', outline: 'none' }}
            />
            <button type="button" onClick={send} aria-label={T.title} style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: 'oklch(64% 0.10 68)', color: 'oklch(16% 0.02 50)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? T.ariaClose : T.ariaOpen}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          position: 'relative', width: 58, height: 58, borderRadius: '50%', background: '#000', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: hover ? '0 12px 26px oklch(20% 0.02 50 / 0.45)' : '0 8px 20px oklch(20% 0.02 50 / 0.35)',
          transform: hover ? 'scale(1.08)' : 'scale(1)', transition: 'transform .18s ease,box-shadow .18s ease',
        }}
      >
        {!open && unread > 0 && (
          <span style={{ position: 'absolute', top: -2, insetInlineEnd: -2, minWidth: 20, height: 20, borderRadius: 100, background: 'oklch(58% 0.20 25)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', border: '2px solid var(--bg,#fff)' }}>{unread}</span>
        )}
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        ) : (
          <svg width="30" height="30" viewBox="0 0 32 32" fill="white" aria-hidden="true"><path d="M16.004 3C9.06 3 3.43 8.63 3.43 15.573c0 2.31.62 4.474 1.7 6.34L3 29l7.27-2.08a12.5 12.5 0 0 0 5.73 1.4h.005c6.943 0 12.573-5.63 12.573-12.574C28.578 8.803 22.948 3 16.004 3zm0 22.86h-.004a10.4 10.4 0 0 1-5.3-1.45l-.38-.226-3.94 1.128 1.05-3.84-.246-.394a10.36 10.36 0 0 1-1.586-5.505c0-5.732 4.665-10.395 10.41-10.395 2.78 0 5.39 1.083 7.353 3.048a10.33 10.33 0 0 1 3.05 7.35c0 5.733-4.665 10.284-10.407 10.284zm5.702-7.723c-.312-.157-1.848-.912-2.134-1.016-.286-.104-.494-.157-.702.157-.208.313-.807 1.016-.99 1.225-.182.208-.364.234-.676.078-.313-.157-1.32-.487-2.514-1.552-.93-.83-1.558-1.854-1.74-2.166-.182-.313-.02-.482.137-.638.14-.14.313-.365.47-.547.157-.183.208-.313.312-.522.104-.208.052-.39-.026-.547-.078-.157-.702-1.694-.963-2.32-.254-.61-.51-.527-.702-.537l-.598-.01c-.208 0-.547.078-.833.39-.286.313-1.09 1.066-1.09 2.6 0 1.535 1.116 3.017 1.272 3.226.156.208 2.198 3.356 5.326 4.706.744.32 1.325.512 1.778.656.747.238 1.427.204 1.965.124.6-.09 1.848-.756 2.108-1.486.26-.73.26-1.355.182-1.486-.078-.13-.286-.208-.598-.365z" /></svg>
        )}
      </button>
    </div>
  );
}
