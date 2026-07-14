import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS } from '../data/translations.js';
import Hoverable from './Hoverable.jsx';
import { sx } from '../utils/sx.js';

export default function Header({ headFont }) {
  const navigate = useNavigate();
  const { state, toggleTheme, toggleLang, goToStart, goToAdmin, logout, goToLogin } = useAppState();
  const T = STRINGS[state.lang];
  const isAdmin = state.role === 'admin';
  const isGuest = state.role === 'guest';
  const isLoggedIn = !!state.role;
  const roleBadgeLabel = isAdmin ? T.nav.adminBadge : (isGuest ? T.nav.guestBadge : '');
  const roleBadgeStyle = 'font-size:11.5px;font-weight:700;padding:5px 12px;border-radius:100px;background:' + (isAdmin ? 'oklch(64% 0.10 68)' : 'var(--surface)') + ';border:' + (isAdmin ? 'none' : '1px solid var(--border)') + ';color:' + (isAdmin ? 'oklch(99% 0.01 80)' : 'var(--text-2)') + ';';
  const themeToggleLabel = state.theme === 'dark' ? T.nav.lightMode : T.nav.darkMode;

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: '14px 28px', background: 'var(--nav-bg)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/')}>
        <img src="/assets/nad-logo.jpg" alt="NAD Design logo" style={{ width: 40, height: 40, borderRadius: 0, objectFit: 'cover' }} />
        <span style={{ fontFamily: headFont, fontSize: 19, letterSpacing: '0.04em', color: 'var(--text)' }}>{T.brand}</span>
      </div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 26, flexWrap: 'wrap' }} aria-label="Main navigation">
        <span style={{ fontSize: 14, color: 'var(--text-2)', cursor: 'pointer' }} onClick={() => navigate('/')} role="link" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/')}>{T.nav.home}</span>
        <Hoverable as="button" type="button" style="font-size:13.5px;font-weight:600;color:var(--btn-text);background:var(--btn-bg);border:none;padding:10px 20px;border-radius:100px;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;" hoverStyle="transform:translateY(-2px);box-shadow:0 10px 22px -8px oklch(20% 0.02 50 / 0.4);filter:brightness(1.08);" onClick={goToStart}>{T.nav.start}</Hoverable>
        {isAdmin ? <span style={{ fontSize: 14, color: 'var(--text-2)', cursor: 'pointer' }} onClick={goToAdmin} role="link" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && goToAdmin()}>{T.nav.adminPanel}</span> : null}
        {isLoggedIn ? (
          <>
            <span style={sx(roleBadgeStyle)}>{roleBadgeLabel}</span>
            <span style={{ fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }} onClick={logout} role="link" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && logout()}>{T.nav.logout}</span>
          </>
        ) : (
          <span style={{ fontSize: 14, color: 'var(--text-2)', cursor: 'pointer' }} onClick={() => goToLogin()} role="link" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && goToLogin()}>{T.nav.login}</span>
        )}
        <Hoverable as="button" type="button" aria-label={themeToggleLabel} style="font-size:13px;font-weight:600;color:var(--text);background:transparent;border:1px solid var(--border);padding:8px 14px;border-radius:100px;cursor:pointer;transition:transform .18s ease,background .18s ease;" hoverStyle="transform:translateY(-2px);background:var(--border);" onClick={toggleTheme}>{themeToggleLabel}</Hoverable>
        <Hoverable as="button" type="button" aria-label="Toggle language" style="font-size:13px;font-weight:600;color:var(--text);background:transparent;border:1px solid var(--border);padding:8px 14px;border-radius:100px;cursor:pointer;transition:transform .18s ease,background .18s ease;" hoverStyle="transform:translateY(-2px);background:var(--border);" onClick={toggleLang}>{T.nav.langToggle}</Hoverable>
      </nav>
    </header>
  );
}
