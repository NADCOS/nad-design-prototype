import React from 'react';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS } from '../data/translations.js';

const STORAGE_KEY = 'nad_chat_messages';

function loadMessages() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (e) {}
  return null;
}

function saveMessages(msgs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs)); } catch (e) {}
}

export default function WhatsAppButton() {
  const { state } = useAppState();
  const lang = state.lang;
  const T = STRINGS[lang].chat;
  const [open, setOpen] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [typing, setTyping] = React.useState(false);
  const [messages, setMessages] = React.useState(() => loadMessages() || [{ from: 'agent', text: T.welcome }]);
  const listRef = React.useRef(null);
  const replyTimer = React.useRef(null);

  React.useEffect(() => { saveMessages(messages); }, [messages]);
  React.useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, typing, open]);
  React.useEffect(() => () => { if (replyTimer.current) clearTimeout(replyTimer.current); }, []);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: 'user', text }]);
    setInput('');
    setTyping(true);
    replyTimer.current = setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: 'agent', text: T.autoReply }]);
    }, 1200);
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
              <div key={i} style={{ alignSelf: m.from === 'user' ? 'flex-end' : 'flex-start', maxWidth: '82%', background: m.from === 'user' ? 'oklch(64% 0.10 68)' : 'var(--surface)', color: m.from === 'user' ? 'oklch(16% 0.02 50)' : 'var(--text)', border: m.from === 'user' ? 'none' : '1px solid var(--border)', padding: '9px 12px', borderRadius: 14, fontSize: 13.5, lineHeight: 1.5 }}>
                {m.text}
              </div>
            ))}
            {typing && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 4, padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14 }}>
                {[0, 1, 2].map((d) => (
                  <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-2)', opacity: 0.6, animation: 'nad-chat-dot 1s ease-in-out infinite', animationDelay: (d * 0.15) + 's' }} />
                ))}
              </div>
            )}
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
          width: 58, height: 58, borderRadius: '50%', background: '#000', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: hover ? '0 12px 26px oklch(20% 0.02 50 / 0.45)' : '0 8px 20px oklch(20% 0.02 50 / 0.35)',
          transform: hover ? 'scale(1.08)' : 'scale(1)', transition: 'transform .18s ease,box-shadow .18s ease',
        }}
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        ) : (
          <svg width="30" height="30" viewBox="0 0 32 32" fill="white" aria-hidden="true"><path d="M16.004 3C9.06 3 3.43 8.63 3.43 15.573c0 2.31.62 4.474 1.7 6.34L3 29l7.27-2.08a12.5 12.5 0 0 0 5.73 1.4h.005c6.943 0 12.573-5.63 12.573-12.574C28.578 8.803 22.948 3 16.004 3zm0 22.86h-.004a10.4 10.4 0 0 1-5.3-1.45l-.38-.226-3.94 1.128 1.05-3.84-.246-.394a10.36 10.36 0 0 1-1.586-5.505c0-5.732 4.665-10.395 10.41-10.395 2.78 0 5.39 1.083 7.353 3.048a10.33 10.33 0 0 1 3.05 7.35c0 5.733-4.665 10.284-10.407 10.284zm5.702-7.723c-.312-.157-1.848-.912-2.134-1.016-.286-.104-.494-.157-.702.157-.208.313-.807 1.016-.99 1.225-.182.208-.364.234-.676.078-.313-.157-1.32-.487-2.514-1.552-.93-.83-1.558-1.854-1.74-2.166-.182-.313-.02-.482.137-.638.14-.14.313-.365.47-.547.157-.183.208-.313.312-.522.104-.208.052-.39-.026-.547-.078-.157-.702-1.694-.963-2.32-.254-.61-.51-.527-.702-.537l-.598-.01c-.208 0-.547.078-.833.39-.286.313-1.09 1.066-1.09 2.6 0 1.535 1.116 3.017 1.272 3.226.156.208 2.198 3.356 5.326 4.706.744.32 1.325.512 1.778.656.747.238 1.427.204 1.965.124.6-.09 1.848-.756 2.108-1.486.26-.73.26-1.355.182-1.486-.078-.13-.286-.208-.598-.365z" /></svg>
        )}
      </button>
    </div>
  );
}
