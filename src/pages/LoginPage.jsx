import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS } from '../data/translations.js';
import Hoverable from '../components/Hoverable.jsx';
import { sx } from '../utils/sx.js';

const inputSm = 'padding:12px 14px;border-radius:10px;border:1px solid oklch(75% 0.02 70);background:var(--surface);font-size:14px;color:var(--text);width:100%;box-sizing:border-box;';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, setLoginPasscode, loginAsAdmin, setGuestEmail, setGuestPhone, registerGuest, patch, setGuestPanelMode, setGuestLoginIdentifier, loginAsGuest } = useAppState();
  const T = STRINGS[state.lang];
  const guestMode = state.guestPanelMode || 'signup';
  const tabBtnStyle = (active) => 'flex:1;padding:9px;border-radius:8px;border:none;font-size:12.5px;font-weight:600;cursor:pointer;transition:background .15s,color .15s;background:' + (active ? 'var(--btn-bg)' : 'transparent') + ';color:' + (active ? 'var(--btn-text)' : 'var(--text-2)') + ';';

  React.useEffect(() => {
    const intent = searchParams.get('intent');
    if (intent) patch({ loginIntent: intent });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main data-screen-label="Login" style={{ maxWidth: 900, margin: '0 auto', padding: '60px 28px 80px' }}>
      <button type="button" onClick={() => navigate('/')} style={{ fontSize: 13, color: 'var(--text-2)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>{T.login.back}</button>
      <h1 style={{ fontFamily: 'var(--head-font)', fontSize: 32, color: 'var(--text)', margin: '14px 0 6px', fontWeight: 500 }}>{T.login.title}</h1>
      <p style={{ fontSize: 15, color: 'var(--text-2)', margin: '0 0 34px' }}>{T.login.sub}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28 }}>
          <div style={{ fontFamily: 'var(--head-font)', fontSize: 19, color: 'var(--text)', marginBottom: 8 }}>{T.login.adminTitle}</div>
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, margin: '0 0 18px' }}>{T.login.adminDesc}</p>
          <label htmlFor="nad-admin-passcode" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>{T.login.passcodeLabel}</label>
          <input id="nad-admin-passcode" type="password" value={state.loginPasscode} onChange={setLoginPasscode} placeholder={T.login.passcodePlaceholder} style={{ ...sx(inputSm), marginBottom: 16 }} aria-describedby={state.loginError ? 'nad-admin-login-error' : undefined} />
          {state.loginError && <div id="nad-admin-login-error" role="alert" style={{ fontSize: 12.5, color: 'oklch(48% 0.14 30)', marginBottom: 14 }}>{state.loginError}</div>}
          <Hoverable as="button" type="button" style="width:100%;padding:14px;border-radius:100px;border:none;background:var(--btn-bg);color:var(--btn-text);font-weight:600;font-size:14px;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;" hoverStyle="transform:translateY(-2px);box-shadow:0 10px 22px -8px oklch(20% 0.02 50 / 0.4);filter:brightness(1.08);" onClick={loginAsAdmin}>{T.login.adminBtn}</Hoverable>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'var(--head-font)', fontSize: 19, color: 'var(--text)', marginBottom: 8 }}>{T.login.guestTitle}</div>
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 3, marginBottom: 18 }}>
            <button type="button" style={sx(tabBtnStyle(guestMode === 'signup'))} onClick={() => setGuestPanelMode('signup')}>{T.login.guestSignupTab}</button>
            <button type="button" style={sx(tabBtnStyle(guestMode === 'login'))} onClick={() => setGuestPanelMode('login')}>{T.login.guestLoginTab}</button>
          </div>
          {guestMode === 'signup' ? (
            <>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, margin: '0 0 18px' }}>{T.login.guestDesc}</p>
              <label htmlFor="nad-guest-email" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>{T.login.guestEmailLabel}</label>
              <input id="nad-guest-email" type="email" value={state.guestEmail} onChange={setGuestEmail} placeholder={T.login.guestEmailPlaceholder} style={{ ...sx(inputSm), marginBottom: 12 }} />
              <div style={{ fontSize: 11, color: 'var(--text-2)', textAlign: 'center', marginBottom: 12 }}>{T.login.guestOr}</div>
              <label htmlFor="nad-guest-phone" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>{T.login.guestPhoneLabel}</label>
              <input id="nad-guest-phone" type="tel" value={state.guestPhone} onChange={setGuestPhone} placeholder={T.login.guestPhonePlaceholder} style={{ ...sx(inputSm), marginBottom: 6 }} aria-describedby={state.guestFormError ? 'nad-guest-login-error' : undefined} />
              {state.guestFormError && <div id="nad-guest-login-error" role="alert" style={{ fontSize: 12.5, color: 'oklch(48% 0.14 30)', marginBottom: 10 }}>{state.guestFormError}</div>}
              <Hoverable as="button" type="button" style="margin-top:auto;width:100%;padding:14px;border-radius:100px;border:1px solid var(--border);background:transparent;color:var(--text);font-weight:600;font-size:14px;cursor:pointer;transition:transform .18s ease,background .18s ease;" hoverStyle="transform:translateY(-2px);background:var(--border);" onClick={registerGuest}>{T.login.guestBtn}</Hoverable>
            </>
          ) : (
            <>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, margin: '0 0 18px' }}>{T.login.guestLoginDesc}</p>
              <label htmlFor="nad-guest-login-id" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>{T.login.guestLoginIdentifierLabel}</label>
              <input id="nad-guest-login-id" type="text" value={state.guestLoginIdentifier} onChange={setGuestLoginIdentifier} placeholder={T.login.guestLoginIdentifierPlaceholder} style={{ ...sx(inputSm), marginBottom: 6 }} aria-describedby={state.guestLoginError ? 'nad-guest-login-id-error' : undefined} />
              {state.guestLoginError && <div id="nad-guest-login-id-error" role="alert" style={{ fontSize: 12.5, color: 'oklch(48% 0.14 30)', marginBottom: 10 }}>{state.guestLoginError}</div>}
              <Hoverable as="button" type="button" style="margin-top:auto;width:100%;padding:14px;border-radius:100px;border:none;background:var(--btn-bg);color:var(--btn-text);font-weight:600;font-size:14px;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;" hoverStyle="transform:translateY(-2px);box-shadow:0 10px 22px -8px oklch(20% 0.02 50 / 0.4);filter:brightness(1.08);" onClick={loginAsGuest}>{T.login.guestLoginBtn}</Hoverable>
            </>
          )}
        </div>
      </div>
    </main>
  );
}