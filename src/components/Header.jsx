import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS } from '../data/translations.js';
import Hoverable from './Hoverable.jsx';
import { sx } from '../utils/sx.js';

export default function Header({ headFont }) {
  const navigate = useNavigate();
  const { state, toggleTheme, toggleLang, goToStart, goToAdmin, logout, goToLogin } = useAppState();
  const [menuOpen, setMenuOpen] = useState(false);
  const T = STRINGS[state.lang];
  const isAdmin = state.role === 'admin';
  const isGuest = state.role === 'guest';
  const isLoggedIn = !!state.role;
  const roleBadgeLabel = isAdmin ? T.nav.adminBadge : (isGuest ? T.nav.guestBadge : '');
  const roleBadgeStyle = 'font-size:11.5px;font-weight:700;padding:5px 12px;border-radius:100px;background:' + (isAdmin ? 'oklch(64% 0.10 68)' : 'var(--surface)') + ';border:' + (isAdmin ? 'none' : '1px solid var(--border)') + ';color:' + (isAdmin ? 'oklch(99% 0.01 80)' : 'var(--text-2)') + ';';
  const themeToggleLabel = state.theme === 'dark' ? T.nav.lightMode : T.nav.darkMode;
  const closeAnd = (fn) => () => { setMenuOpen(false); fn(); };
  const menuItemStyle = { display: 'block', width: '100%', textAlign: 'start', fontSize: 14.5, fontWeight: 600, color: 'var(--text)', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', padding: '14px 16px', cursor: 'pointer', minHeight: 48 };

  return (
    <header className="nad-header" style={{ position: 'sticky', top: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: '14px 28px', background: 'var(--nav-bg)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => { setMenuOpen(false); navigate('/'); }} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/')}>
        <img src="/assets/nad-logo.jpg" alt="NAD Design logo" style={{ width: 40, height: 40, borderRadius: 0, objectFit: 'cover' }} />
        <span className="nad-header-brand-text" style={{ fontFamily: headFont, fontSize: 19, letterSpacing: '0.04em', color: 'var(--text)' }}>{T.brand}</span>
      </div>

      <nav className="nad-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 26, flexWrap: 'wrap' }} aria-label="Main navigation">
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

      <div className="nad-nav-mobile" style={{ alignItems: 'center', gap: 10 }}>
        <button type="button" style={{ fontSize: 13, fontWeight: 600, color: 'var(--btn-text)', background: 'var(--btn-bg)', border: 'none', padding: '11px 18px', borderRadius: 100, cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 44 }} onClick={closeAnd(goToStart)}>{T.nav.start}</button>
        <button type="button" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)} style={{ width: 44, height: 44, borderRadius: 12, border: '1px solid var(--border)', background: menuOpen ? 'var(--border)' : 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4.5, padding: 0 }}>
          <span style={{ width: 18, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'transform .2s ease', transform: menuOpen ? 'translateY(6.5px) rotate(45deg)' : 'none' }} />
          <span style={{ width: 18, height: 2, background: 'var(--text)', borderRadius: 2, opacity: menuOpen ? 0 : 1, transition: 'opacity .15s ease' }} />
          <span style={{ width: 18, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'transform .2s ease', transform: menuOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none' }} />
        </button>
      </div>

      {menuOpen && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', insetInlineEnd: 14, width: 250, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: '0 20px 50px -12px oklch(20% 0.02 50 / 0.4)', overflow: 'hidden', animation: 'nad-fade-up .2s ease both', zIndex: 60 }} role="menu">
          {isLoggedIn && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={sx(roleBadgeStyle)}>{roleBadgeLabel}</span>
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{T.login.loggedInAs} {roleBadgeLabel}</span>
            </div>
          )}
          <button type="button" role="menuitem" style={menuItemStyle} onClick={closeAnd(() => navigate('/'))}>{T.nav.home}</button>
          {isAdmin && <button type="button" role="menuitem" style={menuItemStyle} onClick={closeAnd(goToAdmin)}>{T.nav.adminPanel}</button>}
          {isLoggedIn
            ? <button type="button" role="menuitem" style={menuItemStyle} onClick={closeAnd(logout)}>{T.nav.logout}</button>
            : <button type="button" role="menuitem" style={menuItemStyle} onClick={closeAnd(() => goToLogin())}>{T.nav.login}</button>}
          <button type="button" role="menuitem" style={menuItemStyle} onClick={() => toggleTheme()}>{themeToggleLabel}</button>
          <button type="button" role="menuitem" style={{ ...menuItemStyle, borderBottom: 'none' }} onClick={() => { setMenuOpen(false); toggleLang(); }}>{T.nav.langToggle}</button>
        </div>
      )}
    </header>
  );
}
