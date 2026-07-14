import React from 'react';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS } from '../data/translations.js';
import { PROJECT_TYPES, PREFILL_PROJECT_IMAGES } from '../data/projectTypes.js';
import ProjectTypeCard from '../components/ProjectTypeCard.jsx';
import Hoverable from '../components/Hoverable.jsx';

export default function TypePage() {
  const { state, selectProjectType, setCustomType, nextFromType, handleAdminImageChange } = useAppState();
  const lang = state.lang;
  const T = STRINGS[lang];
  const isAdmin = state.role === 'admin';
  const isCustomTypeSelected = !!(state.selections.projectType && state.selections.projectType.key === 'custom');
  const canProceedType = !!state.selections.projectType;
  const btn = (enabled) => 'font-size:14.5px;font-weight:600;color:var(--btn-text);background:' + (enabled ? 'var(--btn-bg)' : 'var(--border)') + ';border:none;padding:14px 30px;border-radius:100px;cursor:' + (enabled ? 'pointer' : 'not-allowed') + ';transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;';
  const btnHover = (enabled) => (enabled ? 'transform:translateY(-2px);box-shadow:0 10px 22px -8px oklch(20% 0.02 50 / 0.4);filter:brightness(1.08);' : '');

  return (
    <section data-screen-label="Project Type">
      <h1 style={{ fontFamily: 'var(--head-font)', fontSize: 34, color: 'var(--text)', margin: '0 0 8px', fontWeight: 500 }}>{T.type.title}</h1>
      <p style={{ fontSize: 15, color: 'var(--text-2)', margin: '0 0 30px' }}>{T.type.sub}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {PROJECT_TYPES.map((pt) => {
          const selected = state.selections.projectType && state.selections.projectType.key === pt.key;
          const slotId = 'type-' + pt.key;
          return (
            <ProjectTypeCard
              key={pt.key} type={pt} lang={lang} selected={selected} isAdmin={isAdmin}
              overrideUrl={state.imageOverrides[slotId] || ''} prefillSrc={PREFILL_PROJECT_IMAGES[pt.key] || ''}
              onAdminImageChange={(e) => handleAdminImageChange(slotId, e)}
              editLabel={T.common.edit}
              onSelect={() => selectProjectType({ key: pt.key, en: pt.en, ar: pt.ar })}
            />
          );
        })}
      </div>
      {isCustomTypeSelected && (
        <div style={{ marginTop: 22 }}>
          <label htmlFor="nad-custom-type" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>{T.type.customLabel}</label>
          <textarea id="nad-custom-type" value={state.customTypeText} onChange={setCustomType} placeholder={T.type.customPh} rows={3} style={{ width: '100%', maxWidth: 640, padding: '14px 16px', borderRadius: 10, border: '1px solid oklch(75% 0.02 70)', background: 'var(--surface)', fontSize: 14, color: 'var(--text)', resize: 'vertical' }} />
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 36 }}>
        <Hoverable as="button" type="button" disabled={!canProceedType} style={btn(canProceedType)} hoverStyle={btnHover(canProceedType)} onClick={nextFromType}>{T.common.next}</Hoverable>
      </div>
    </section>
  );
}
