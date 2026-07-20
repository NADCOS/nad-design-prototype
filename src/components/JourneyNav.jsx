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
  const nextStyle = 'min-height:48px;font-size:14.5px;font-weight:600;color:var(--btn-text);background:' + (enabled ? 'var(--btn-bg)' : 'var(--border)') + ';border:none;padding:13px 30px;border-radius:100px;cursor:' + (enabled ? 'pointer' : 'not-allowed') + ';white-space:nowrap;transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;';
  const nextHover = enabled ? 'transform:translateY(-2px);box-shadow:0 10px 22px -8px oklch(20% 0.02 50 / 0.4);filter:brightness(1.08);' : '';

  const bar = (
    <div className="nad-journey-nav">
      {backTo ? (
        <Hoverable as="button" type="button" style="min-height:48px;font-size:14px;font-weight:600;color:var(--text);background:transparent;border:1px solid var(--border);padding:12px 24px;border-radius:100px;cursor:pointer;white-space:nowrap;transition:transform .18s ease,background .18s ease;" hoverStyle="transform:translateY(-2px);background:var(--border);" onClick={() => goToStep(backTo)}>{T.common.back}</Hoverable>
      ) : <span />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flexWrap: 'wrap', justifyContent: 'center' }}>
        {cost && <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 100, padding: '8px 14px', whiteSpace: 'nowrap' }}>≈ {fmtSar(cost.total, lang)}</span>}
        {showSaved && <span style={{ fontSize: 11.5, fontWeight: 600, color: 'oklch(45% 0.08 145)', whiteSpace: 'nowrap' }} role="status">✓ {T.common.saved}</span>}
      </div>
      <Hoverable as="button" type="button" disabled={!enabled} style={nextStyle} hoverStyle={nextHover} onClick={onNext}>{nextLabel || T.common.next}</Hoverable>
    </div>
  );

  return (
    <>
      <div className="nad-journey-nav-spacer" aria-hidden="true" />
      {createPortal(bar, document.body)}
    </>
  );
}
