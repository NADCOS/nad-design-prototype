import React from 'react';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS, fmtSar } from '../data/translations.js';
import { DESIGN_LEVELS, PREFILL_LEVEL_IMAGES } from '../data/designLevels.js';
import Hoverable from '../components/Hoverable.jsx';
import DesignLevelCard from '../components/DesignLevelCard.jsx';

export default function HomePage({ headFont }) {
  const { state, goToStart, goToLevels, getLevelRangeFor, handleAdminImageChange } = useAppState();
  const lang = state.lang;
  const T = STRINGS[lang];
  const journeyList = T.steps.map((label, i) => ({ num: (i + 1 < 10 ? '0' : '') + (i + 1), label }));

  return (
    <main data-screen-label="Home" className="nad-page" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 28px' }}>
      <section className="nad-grid-hero" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 56, alignItems: 'center', padding: '88px 0 64px' }}>
        <div style={{ animation: 'nad-fade-up 0.6s ease both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'oklch(46% 0.09 60)', fontWeight: 600, marginBottom: 22 }}>
            <span style={{ width: 22, height: 1, background: 'oklch(46% 0.09 60)' }} aria-hidden="true" />{T.home.kicker}
          </div>
          <h1 style={{ fontFamily: headFont, fontSize: 52, lineHeight: 1.08, color: 'var(--text)', margin: '0 0 22px', fontWeight: 500 }}>{T.home.headline}</h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--text-2)', maxWidth: 480, margin: '0 0 34px' }}>{T.home.sub}</p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Hoverable as="button" type="button" style="font-size:14.5px;font-weight:600;color:var(--btn-text);background:var(--btn-bg);border:none;padding:15px 28px;border-radius:100px;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;" hoverStyle="transform:translateY(-2px);box-shadow:0 10px 22px -8px oklch(20% 0.02 50 / 0.4);filter:brightness(1.08);" onClick={goToStart}>{T.home.ctaPrimary}</Hoverable>
            <Hoverable as="button" type="button" style="font-size:14.5px;font-weight:600;color:var(--text);background:transparent;border:1px solid var(--border);padding:15px 28px;border-radius:100px;cursor:pointer;transition:transform .18s ease,background .18s ease;" hoverStyle="transform:translateY(-2px);background:var(--border);" onClick={goToLevels}>{T.home.ctaSecondary}</Hoverable>
          </div>
        </div>
        <div className="nad-hero-image" style={{ position: 'relative', aspectRatio: '4/5', borderRadius: 18, overflow: 'hidden', background: 'url("/assets/hero.jpeg") center / cover no-repeat', display: 'flex', alignItems: 'flex-end', padding: 22 }} role="img" aria-label="AI-generated villa majlis, luxury level">
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12, color: 'var(--text)', background: 'oklch(97% 0.01 80 / 0.85)', padding: '8px 12px', borderRadius: 8 }}>hero — AI-generated villa majlis, luxury level</span>
        </div>
      </section>

      <section style={{ padding: '20px 0 70px', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontFamily: headFont, fontSize: 15, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-2)', margin: '36px 0 26px', fontWeight: 500 }}>{T.home.journeyTitle}</h2>
        <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
          {journeyList.map((js, i) => (
            <div key={i} style={{ flex: 1, minWidth: 110, padding: '16px 14px 16px 0', position: 'relative' }}>
              <div style={{ fontFamily: headFont, fontSize: 22, color: 'oklch(64% 0.10 68)', marginBottom: 8 }}>{js.num}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{js.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 0 90px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, marginBottom: 30, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontFamily: headFont, fontSize: 30, color: 'var(--text)', margin: '0 0 8px', fontWeight: 500 }}>{T.home.levelsTitle}</h2>
            <p style={{ fontSize: 15, color: 'var(--text-2)', maxWidth: 520, margin: 0 }}>{T.home.levelsSub}</p>
          </div>
          <Hoverable as="button" type="button" style="font-size:13.5px;font-weight:600;color:var(--text);background:transparent;border:1px solid var(--border);padding:11px 20px;border-radius:100px;cursor:pointer;white-space:nowrap;transition:transform .18s ease,background .18s ease;" hoverStyle="transform:translateY(-2px);background:var(--border);" onClick={goToLevels}>{T.home.ctaSecondary}</Hoverable>
        </div>
        <div className="nad-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {DESIGN_LEVELS.map((lv) => {
            const range = getLevelRangeFor(lv.key);
            const priceLabel = T.common.from + ' ' + fmtSar(range.priceMin, lang) + ' ' + T.common.perSqm;
            const isAdmin = state.role === 'admin';
            const slotId = 'level-' + lv.key;
            return (
              <DesignLevelCard
                key={lv.key} level={lv} lang={lang} priceLabel={priceLabel} selected={false} showDescription={false}
                isAdmin={isAdmin} overrideUrl={state.imageOverrides[slotId] || ''} prefillSrc={PREFILL_LEVEL_IMAGES[lv.key] || ''}
                onAdminImageChange={(e) => handleAdminImageChange(slotId, e)}
                editLabel={T.common.edit} onSelect={goToLevels} headFont={headFont}
              />
            );
          })}
        </div>
      </section>
      <footer style={{ padding: '26px 0 50px', borderTop: '1px solid var(--border)', fontSize: 12.5, color: 'var(--text-2)' }}>{T.home.footerNote}</footer>
    </main>
  );
}
