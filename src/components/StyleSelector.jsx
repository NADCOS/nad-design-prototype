import React from 'react';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS } from '../data/translations.js';
import { STYLES, STYLE_PALETTES } from '../data/styles.js';
import { sx } from '../utils/sx.js';

// Step 3 — primary + optional secondary style grid, plus the combined-style
// summary card with a suggested colour palette.
export default function StyleSelector({ headFont }) {
  const { state, selectPrimaryStyle, selectSecondaryStyle } = useAppState();
  const lang = state.lang;
  const T = STRINGS[lang];
  const primaryKey = state.selections.stylePrimary && state.selections.stylePrimary.key;
  const secondaryKey = state.selections.styleSecondary && state.selections.styleSecondary.key;
  const hasPrimaryStyle = !!state.selections.stylePrimary;
  const combinedStyleText = hasPrimaryStyle
    ? state.selections.stylePrimary[lang] + (state.selections.styleSecondary ? (lang === 'ar' ? ' مع لمسة ' + state.selections.styleSecondary[lang] : ' with a touch of ' + state.selections.styleSecondary[lang]) : '')
    : '';
  const paletteSwatches = STYLE_PALETTES[primaryKey] || STYLE_PALETTES.modern;

  return (
    <>
      <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'oklch(46% 0.09 60)', marginBottom: 12 }}>{T.style.primary}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 30 }}>
        {STYLES.map((st) => {
          const active = primaryKey === st.key;
          const cardStyle = 'padding:14px 10px;border-radius:12px;text-align:center;cursor:pointer;font-size:13.5px;font-weight:600;background:' + (active ? 'var(--btn-bg)' : 'var(--surface)') + ';color:' + (active ? 'var(--btn-text)' : 'oklch(30% 0.02 55)') + ';border:1px solid ' + (active ? 'var(--btn-bg)' : 'var(--border)') + ';';
          return <div key={st.key} onClick={() => selectPrimaryStyle({ key: st.key, en: st.en, ar: st.ar })} style={sx(cardStyle)} role="button" tabIndex={0} aria-pressed={active} onKeyDown={(e) => e.key === 'Enter' && selectPrimaryStyle({ key: st.key, en: st.en, ar: st.ar })}>{st[lang]}</div>;
        })}
      </div>
      {hasPrimaryStyle && (
        <>
          <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: 12 }}>{T.style.secondary}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8, marginBottom: 30 }}>
            {STYLES.map((st) => {
              const active = secondaryKey === st.key;
              const isPrimary = primaryKey === st.key;
              const cardStyle = 'padding:11px 8px;border-radius:10px;text-align:center;cursor:pointer;font-size:12.5px;font-weight:600;background:' + (active ? 'oklch(64% 0.10 68)' : 'var(--surface)') + ';color:' + (active ? 'oklch(99% 0.01 80)' : 'oklch(40% 0.02 55)') + ';border:1px solid ' + (active ? 'oklch(64% 0.10 68)' : 'var(--border)') + ';opacity:' + (isPrimary ? '0.35' : '1') + ';';
              return <div key={st.key} onClick={() => selectSecondaryStyle({ key: st.key, en: st.en, ar: st.ar })} style={sx(cardStyle)} role="button" tabIndex={0} aria-pressed={active} onKeyDown={(e) => e.key === 'Enter' && selectSecondaryStyle({ key: st.key, en: st.en, ar: st.ar })}>{st[lang]}</div>;
            })}
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>{T.style.combined}</div>
              <div style={{ fontFamily: headFont, fontSize: 20, color: 'var(--text)' }}>{combinedStyleText}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>{T.style.palette}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {paletteSwatches.map((c, i) => <div key={i} style={{ width: 36, height: 36, borderRadius: 8, background: c, border: '1px solid var(--border)' }} aria-hidden="true" />)}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
