import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS, fmtSar } from '../data/translations.js';
import { STYLE_PALETTES } from '../data/styles.js';
import { materialSlotId, PREFILL_MATERIAL_IMAGES } from '../data/materials.js';
import Hoverable from './Hoverable.jsx';

// Unified journey navigation: thumb-reachable fixed bottom bar on every size.
// The bar is PORTALED to <body>: the step wrapper animates with a transform
// (nad-fade-up, fill both), and a transformed ancestor becomes the containing
// block for position:fixed — inside it the bar would pin to the content's
// bottom (forcing a scroll) instead of the viewport. Portaling escapes that.
export default function JourneyNav({ backTo, onNext, nextDisabled, nextLabel }) {
  const { state, goToStep, computeCost } = useAppState();
  const [previewOpen, setPreviewOpen] = useState(false);
  const lang = state.lang;
  const T = STRINGS[lang];
  const enabled = !nextDisabled;
  const cost = state.selections.designLevel ? computeCost() : null;
  const showSaved = state.role === 'guest' && !!state.lastSavedAt;
  const nextStyle = {
    minHeight: 48, display: 'inline-flex', alignItems: 'center', gap: 9,
    fontSize: 14.5, fontWeight: 650, letterSpacing: '.01em',
    color: enabled ? accentText : 'var(--muted)',
    background: enabled ? 'linear-gradient(180deg, color-mix(in oklch, ' + accent + ' 86%, white), ' + accent + ')' : 'var(--border)',
    border: 'none', padding: '14px 30px', borderRadius: 100,
    cursor: enabled ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap',
    boxShadow: enabled ? 'inset 0 1px 0 oklch(100% 0 0 / 0.18), 0 6px 16px -8px oklch(20% 0.02 50 / 0.45)' : 'none',
    transition: 'transform .18s ease,box-shadow .18s ease,filter .18s ease',
  };
  const nextHover = enabled ? { transform: 'translateY(-2px)', boxShadow: 'inset 0 1px 0 oklch(100% 0 0 / 0.22), 0 12px 26px -8px oklch(20% 0.02 50 / 0.5)', filter: 'brightness(1.06)' } : {};
  const arrow = lang === 'ar' ? '\u2190' : '\u2192';
  const accent = state.theme === 'dark' ? '#C4A05A' : '#1B6045';
  const accentText = state.theme === 'dark' ? '#2a2013' : '#ffffff';

  // ---- Live design preview data ---------------------------------------
  const sel = state.selections;
  const primaryKey = sel.stylePrimary && sel.stylePrimary.key;
  const palette = primaryKey ? (STYLE_PALETTES[primaryKey] || STYLE_PALETTES.modern) : null;
  const resolveMat = (catKey, en) => {
    const slot = materialSlotId(catKey, en);
    return state.imageOverrides[slot] || PREFILL_MATERIAL_IMAGES[slot.slice(4)] || '';
  };
  const materialImgs = Object.keys(sel.materials || {}).map((k) => resolveMat(k, sel.materials[k].en)).filter(Boolean);
  const furnitureImgs = (sel.furniture || []).map((f) => f.imageUrl || state.imageOverrides['furn-' + f.id] || '').filter(Boolean);
  const roomPhoto = (sel.uploads || []).find((u) => u.isImage && u.dataUrl);
  const roomSrc = roomPhoto ? roomPhoto.dataUrl : '';

  const matCount = Object.keys(sel.materials || {}).length;
  const furnCount = (sel.furniture || []).length;
  const hasStyle = !!sel.stylePrimary;
  const choices = [!!sel.designLevel, hasStyle, matCount > 0, furnCount > 0, !!roomPhoto];
  const choicesMade = choices.filter(Boolean).length;
  const progressPct = Math.round((choicesMade / choices.length) * 100);
  const showThumb = choicesMade > 0 || hasStyle;

  const chips = [roomSrc, furnitureImgs[0], materialImgs[0]].filter(Boolean).slice(0, 3);
  const tiles = [];
  if (roomSrc) tiles.push({ src: roomSrc, span: '1 / -1', aspect: '16 / 9' });
  materialImgs.slice(0, 3).forEach((src) => tiles.push({ src }));
  furnitureImgs.slice(0, 2).forEach((src) => tiles.push({ src }));

  const styleText = hasStyle
    ? sel.stylePrimary[lang] + (sel.styleSecondary ? ' +1' : '')
    : '\u2014';
  const dash = 'oklch(70% 0.02 60)';
  const rows = [
    { label: T.summary.projectType, value: sel.projectType ? (sel.projectType.key === 'custom' ? (state.customTypeText || sel.projectType[lang]) : sel.projectType[lang]) : '\u2014', on: !!sel.projectType },
    { label: T.summary.level, value: sel.designLevel ? sel.designLevel[lang] : '\u2014', on: !!sel.designLevel },
    { label: T.summary.style, value: styleText, on: hasStyle },
    { label: T.summary.materials, value: matCount ? String(matCount) : '\u2014', on: matCount > 0 },
    { label: T.summary.furniture, value: furnCount ? String(furnCount) : '\u2014', on: furnCount > 0 },
  ];

  const thumbBase = hasStyle
    ? { position: 'absolute', inset: 0, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,' + palette[0] + ',' + palette[1] + ' 45%,' + palette[2] + ' 78%,' + palette[3] + ')' }
    : { position: 'absolute', inset: 0, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'repeating-linear-gradient(135deg,var(--surface),var(--surface) 6px,var(--border) 6px,var(--border) 12px)' };

  const previewLabel = lang === 'ar' ? 'تصميمك حتى الآن' : 'Your design so far';
  const chosenLabel = lang === 'ar' ? (choicesMade + ' من ' + choices.length) : (choicesMade + ' / ' + choices.length + ' chosen');

  const previewThumb = showThumb && (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <Hoverable
        as="button"
        type="button"
        className="nad-jnav-thumb"
        style={{ position: 'relative', width: 50, height: 50, borderRadius: 14, padding: 0, border: '1px solid var(--border)', cursor: 'pointer', background: 'transparent', flexShrink: 0, transition: 'transform .18s ease' }}
        hoverStyle={{ transform: 'translateY(-2px)' }}
        onClick={() => setPreviewOpen((o) => !o)}
        aria-label={previewLabel}
      >
        <span key={choicesMade + '-' + matCount + '-' + furnCount} style={thumbBase} className="nad-thumb-face">
          <div style={{ position: 'absolute', right: -4, bottom: -4, display: 'flex' }}>
            {chips.map((src, i) => (
              <span key={i} className="nad-pop" style={{ width: 20, height: 20, borderRadius: 6, overflow: 'hidden', border: '2px solid var(--surface)', marginLeft: i ? -7 : 0, boxShadow: '0 2px 5px oklch(20% 0.02 50 / 0.25)' }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </span>
            ))}
          </div>
        </span>
        <span style={{ position: 'absolute', top: -7, right: -7, minWidth: 19, height: 19, padding: '0 5px', borderRadius: 100, background: 'var(--accent, oklch(58% 0.09 65))', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--surface)' }}>{choicesMade}</span>
      </Hoverable>

      {previewOpen && (
        <div className="nad-mood-pop" style={{ position: 'absolute', bottom: 'calc(100% + 14px)', insetInlineStart: 0, width: 300, maxWidth: '86vw', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, boxShadow: '0 24px 60px -22px oklch(20% 0.02 50 / 0.42)', padding: 16, zIndex: 95 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{previewLabel}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)' }}>{chosenLabel}</div>
          </div>
          <div style={{ height: 5, borderRadius: 100, background: 'var(--border)', overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ height: '100%', borderRadius: 100, background: 'var(--accent, oklch(58% 0.09 65))', width: progressPct + '%', transition: 'width .4s cubic-bezier(.4,0,.2,1)' }} />
          </div>

          {cost && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)' }}>{lang === 'ar' ? 'التقدير' : 'Estimated total'}</span>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)' }}>≈ {fmtSar(cost.total, lang)}</span>
            </div>
          )}

          {hasStyle && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tiles.length ? 8 : 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sel.stylePrimary[lang]}{sel.styleSecondary ? ' + ' + sel.styleSecondary[lang] : ''}</div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                {palette.map((c, i) => (
                  <span key={i} style={{ width: 16, height: 16, borderRadius: 5, background: c, border: '1px solid oklch(0% 0 0 / 0.06)' }} />
                ))}
              </div>
            </div>
          )}

          {tiles.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 14 }}>
              {tiles.map((t, i) => (
                <div key={i} className="nad-pop" style={{ gridColumn: t.span || 'auto', aspectRatio: t.aspect || '1', borderRadius: 10, overflow: 'hidden', background: 'var(--border)' }}>
                  <img src={t.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {rows.map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, gap: 12 }}>
                <span style={{ color: 'var(--text-2)', flexShrink: 0 }}>{r.label}</span>
                <span style={{ fontWeight: 700, color: r.on ? 'var(--text)' : dash, textAlign: 'end', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const bar = (
    <div className="nad-journey-nav" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 90 }}>{/* phone: compact single row via .nad-jnav-* rules */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {previewThumb}
        {backTo ? (
          <Hoverable as="button" type="button" className="nad-jnav-back" style={{ minHeight: 48, fontSize: 14, fontWeight: 600, color: 'var(--text)', background: 'transparent', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: 100, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'transform .18s ease,background .18s ease' }} hoverStyle={{ transform: 'translateY(-2px)', background: 'var(--border)' }} onClick={() => goToStep(backTo)}>{T.common.back}</Hoverable>
        ) : null}
      </div>
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
