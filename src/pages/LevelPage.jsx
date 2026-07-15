import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS, fmtSar } from '../data/translations.js';
import { DESIGN_LEVELS, PREFILL_LEVEL_IMAGES } from '../data/designLevels.js';
import DesignLevelCard from '../components/DesignLevelCard.jsx';
import Hoverable from '../components/Hoverable.jsx';

export default function LevelPage({ headFont }) {
  const navigate = useNavigate();
  const { state, selectLevel, toggleCompare, nextFromLevel, getLevelRangeFor, handleAdminImageChange } = useAppState();
  const lang = state.lang;
  const T = STRINGS[lang];
  const isAdmin = state.role === 'admin';
  const canProceedLevel = !!state.selections.designLevel;
  const compareLabel = state.compareOpen ? T.level.hideCompare : T.level.compare;
  const btn = (enabled) => 'font-size:14.5px;font-weight:600;color:var(--btn-text);background:' + (enabled ? 'var(--btn-bg)' : 'var(--border)') + ';border:none;padding:14px 30px;border-radius:100px;cursor:' + (enabled ? 'pointer' : 'not-allowed') + ';transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;';
  const btnHover = (enabled) => (enabled ? 'transform:translateY(-2px);box-shadow:0 10px 22px -8px oklch(20% 0.02 50 / 0.4);filter:brightness(1.08);' : '');

  return (
    <section data-screen-label="Design Level">
      <h1 style={{ fontFamily: headFont, fontSize: 34, color: 'var(--text)', margin: '0 0 8px', fontWeight: 500 }}>{T.level.title}</h1>
      <p style={{ fontSize: 15, color: 'var(--text-2)', margin: '0 0 24px' }}>{T.level.sub}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
        <Hoverable as="button" type="button" style="font-size:13px;font-weight:600;color:var(--text);background:transparent;border:1px solid var(--border);padding:9px 18px;border-radius:100px;cursor:pointer;transition:transform .18s ease,background .18s ease;" hoverStyle="transform:translateY(-2px);background:var(--border);" onClick={toggleCompare} aria-expanded={state.compareOpen}>{compareLabel}</Hoverable>
      </div>
      {state.compareOpen && (
        <div style={{ overflowX: 'auto', marginBottom: 30, border: '1px solid var(--border)', borderRadius: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '140px repeat(4,1fr)', minWidth: 760 }}>
            <div style={{ padding: '14px 16px', background: 'var(--surface)' }} />
            {DESIGN_LEVELS.map((lv) => <div key={lv.key} style={{ padding: '14px 16px', fontFamily: headFont, fontSize: 16, color: 'var(--text)', borderBottom: '1px solid oklch(90% 0.02 72)', background: 'var(--surface)' }}>{lv[lang]}</div>)}
            <div style={{ padding: '14px 16px', fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)', borderTop: '1px solid oklch(90% 0.02 72)' }}>{T.level.priceRange}</div>
            {DESIGN_LEVELS.map((lv) => {
              const range = getLevelRangeFor(lv.key);
              return <div key={lv.key} style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text)', borderTop: '1px solid oklch(90% 0.02 72)' }}>{fmtSar(range.priceMin, lang)} \u2013 {fmtSar(range.priceMax, lang)} {T.common.perSqm}</div>;
            })}
            <div style={{ padding: '14px 16px', fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)', borderTop: '1px solid oklch(90% 0.02 72)' }}>{T.level.example}</div>
            {DESIGN_LEVELS.map((lv) => <div key={lv.key} style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text)', borderTop: '1px solid oklch(90% 0.02 72)' }}>{lv[lang + 'Materials']}</div>)}
            <div style={{ padding: '14px 16px', fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)', borderTop: '1px solid oklch(90% 0.02 72)' }}>{T.level.quality}</div>
            {DESIGN_LEVELS.map((lv) => <div key={lv.key} style={{ padding: '14px 16px 18px', fontSize: 13, color: 'var(--text)', borderTop: '1px solid oklch(90% 0.02 72)' }}>{lv[lang + 'Quality']}</div>)}
          </div>
        </div>
      )}
      <div className="nad-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {DESIGN_LEVELS.map((lv) => {
          const selected = state.selections.designLevel && state.selections.designLevel.key === lv.key;
          const range = getLevelRangeFor(lv.key);
          const priceLabel = T.common.from + ' ' + fmtSar(range.priceMin, lang) + ' ' + T.common.perSqm;
          const slotId = 'level-' + lv.key;
          return (
            <DesignLevelCard
              key={lv.key} level={lv} lang={lang} priceLabel={priceLabel} selected={selected}
              isAdmin={isAdmin} overrideUrl={state.imageOverrides[slotId] || ''} prefillSrc={PREFILL_LEVEL_IMAGES[lv.key] || ''}
              onAdminImageChange={(e) => handleAdminImageChange(slotId, e)}
              editLabel={T.common.edit} headFont={headFont}
              onSelect={() => selectLevel({ key: lv.key, en: lv.en, ar: lv.ar })}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36 }}>
        <Hoverable as="button" type="button" style="font-size:14px;font-weight:600;color:var(--text);background:transparent;border:1px solid var(--border);padding:13px 26px;border-radius:100px;cursor:pointer;transition:transform .18s ease,background .18s ease;" hoverStyle="transform:translateY(-2px);background:var(--border);" onClick={() => navigate('/design/type')}>{T.common.back}</Hoverable>
        <Hoverable as="button" type="button" disabled={!canProceedLevel} style={btn(canProceedLevel)} hoverStyle={btnHover(canProceedLevel)} onClick={nextFromLevel}>{T.common.next}</Hoverable>
      </div>
    </section>
  );
}
