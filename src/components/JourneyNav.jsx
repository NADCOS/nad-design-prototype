import React from 'react';
import { createPortal } from 'react-dom';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS, fmtSar } from '../data/translations.js';
import Hoverable from './Hoverable.jsx';

// Unified journey navigation: thumb-reachable fixed bottom bar on every size.
// The bar is PORTALED to <body>: the step wrapper animates with a transform
// (nad-fade-up, fill both), and a transformed ancestor becomes the containing
// block for position:fixed — inside it the bar would pin to the content's
// bottom (forcing a scroll) instead of the viewport. Portaling escapes that.
export default function JourneyNav({ backTo, onNext, nextDisabled, nextLabel }) {
  const { state, goToStep, computeCost } = useAppState();
  const lang = state.lang;
  const T = STRINGS[lang];
  const enabled = !nextDisabled;
  const cost = state.selections.designLevel ? computeCost() : null;
  const showSaved = state.role === 'guest' && !!state.lastSavedAt;
  const nextStyle = 'min-height:48px;display:inline-flex;align-items:center;gap:9px;font-size:14.5px;font-weight:650;letter-spacing:.01em;color:' + (enabled ? 'var(--btn-text)' : 'var(--muted)') + ';background:' + (enabled ? 'linear-gradient(180deg, color-mix(in oklch, var(--btn-bg) 88%, white), var(--btn-bg))' : 'var(--border)') + ';border:none;padding:14px 30px;border-radius:100px;cursor:' + (enabled ? 'pointer' : 'not-allowed') + ';white-space:nowrap;box-shadow:' + (enabled ? 'inset 0 1px 0 oklch(100% 0 0 / 0.18), 0 6px 16px -8px oklch(20% 0.02 50 / 0.45)' : 'none') + ';transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;';
  const nextHover = enabled ? 'transform:translateY(-2px);box-shadow:inset 0 1px 0 oklch(100% 0 0 / 0.22), 0 12px 26px -8px oklch(20% 0.02 50 / 0.5);filter:brightness(1.06);' : '';
  const arrow = lang === 'ar' ? '←' : '→';

  const bar = (
    <div className="nad-journey-nav">{/* phone: compact single row via .nad-jnav-* rules */}
      {backTo ? (
        <Hoverable as="button" type="button" className="nad-jnav-back" style="min-height:48px;font-size:14px;font-weight:600;color:var(--text);background:transparent;border:1px solid var(--border);padding:12px 24px;border-radius:100px;cursor:pointer;white-space:nowrap;transition:transform .18s ease,background .18s ease;" hoverStyle="transform:translateY(-2px);background:var(--border);" onClick={() => goToStep(backTo)}>{T.common.back}</Hoverable>
      ) : <span />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flexWrap: 'wrap', justifyContent: 'center' }}>
        {cost && <span className="nad-jnav-price" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 100, padding: '8px 14px', whiteSpace: 'nowrap' }}>≈ {fmtSar(cost.total, lang)}</span>}
        {showSaved && <span style={{ fontSize: 11.5, fontWeight: 600, color: 'oklch(45% 0.08 145)', whiteSpace: 'nowrap' }} role="status">✓<span className="nad-jnav-saved-label"> {T.common.saved}</span></span>}
      </div>
      <Hoverable as="button" type="button" className="nad-jnav-next" disabled={!enabled} style={nextStyle} hoverStyle={nextHover} onClick={onNext}>{nextLabel || T.common.next}<span aria-hidden="true" style={{ display: 'inline-block', fontSize: 15, lineHeight: 1 }}>{arrow}</span></Hoverable>
    </div>
  );

  return (
    <>
      <div className="nad-journey-nav-spacer" aria-hidden="true" />
      {createPortal(bar, document.body)}
    </>
  );
}
