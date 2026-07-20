import React, { useEffect, useState } from 'react';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS } from '../data/translations.js';
import { PROJECT_TYPES, PREFILL_PROJECT_IMAGES } from '../data/projectTypes.js';
import { isSupabaseConfigured } from '../lib/supabase.js';
import ProjectTypeCard from '../components/ProjectTypeCard.jsx';
import ProjectTypeEditModal from '../components/ProjectTypeEditModal.jsx';
import JourneyNav from '../components/JourneyNav.jsx';

export default function TypePage() {
  const { state, selectProjectType, setCustomType, nextFromType, handleAdminImageChange, loadProjectTypes, openProjectTypeEditor, quickSaveProjectTypeImage } = useAppState();
  const lang = state.lang;
  const T = STRINGS[lang];
  const isAdmin = state.role === 'admin';
  const [brokenImageUrls, setBrokenImageUrls] = useState({});

  useEffect(() => {
    if (isSupabaseConfigured) loadProjectTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remoteReady = isSupabaseConfigured && state.projectTypesStatus === 'loaded' && state.projectTypesRemote.length > 0;
  const remoteLoading = isSupabaseConfigured && state.projectTypesStatus === 'loading' && state.projectTypesRemote.length === 0;
  const remoteError = isSupabaseConfigured && state.projectTypesStatus === 'error' && state.projectTypesRemote.length === 0;

  function localFallbackImageFor(name) {
    const match = PROJECT_TYPES.find((pt) => pt.en.toLowerCase() === (name || '').toLowerCase());
    return match ? (PREFILL_PROJECT_IMAGES[match.key] || '') : '';
  }

  // Prefer Supabase-managed rows once loaded; fall back to the built-in
  // catalogue if Supabase isn't configured, still loading, or came back empty.
  // A Supabase row with no uploaded image yet (or a broken URL) still shows
  // the matching built-in placeholder photo instead of the striped empty state.
  const cards = remoteReady
    ? state.projectTypesRemote.map((row) => ({
        key: row.id,
        name: row.name,
        desc: row.description || '',
        imageUrl: (row.imageUrl && !brokenImageUrls[row.imageUrl]) ? row.imageUrl : localFallbackImageFor(row.name),
        remoteRow: row,
      }))
    : PROJECT_TYPES.map((pt) => ({ key: pt.key, name: pt[lang], desc: pt[lang + 'Desc'], imageUrl: PREFILL_PROJECT_IMAGES[pt.key] || '', remoteRow: null }));

  const selectedKey = state.selections.projectType && state.selections.projectType.key;
  const isCustomTypeSelected = !!(state.selections.projectType && (state.selections.projectType.key === 'custom' || /custom/i.test(state.selections.projectType.en || '')));
  const canProceedType = !!state.selections.projectType;

  function handleSelect(card) {
    selectProjectType({ key: card.key, en: card.name, ar: card.name });
  }

  return (
    <section data-screen-label="Project Type">
      <h1 style={{ fontFamily: 'var(--head-font)', fontSize: 34, color: 'var(--text)', margin: '0 0 8px', fontWeight: 500 }}>{T.type.title}</h1>
      <p style={{ fontSize: 15, color: 'var(--text-2)', margin: '0 0 30px' }}>{T.type.sub}</p>

      {isAdmin && (
        <div style={{ background: 'oklch(94% 0.035 75)', border: '1px solid oklch(78% 0.06 68)', borderRadius: 12, padding: '13px 18px', marginBottom: 20, fontSize: 13, lineHeight: 1.5, color: 'oklch(36% 0.05 60)' }}>
          <strong style={{ fontWeight: 700 }}>Admin Mode.</strong> Use the camera icon on a card to instantly swap its photo, or "{T.common.edit}" to update its name, description, order, and visibility. Every change saves straight to the live site — guests never see these controls.
        </div>
      )}

      {remoteError && (
        <div role="alert" style={{ background: 'oklch(95% 0.03 30)', border: '1px solid oklch(80% 0.06 30)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13.5, color: 'oklch(35% 0.1 30)' }}>{state.projectTypesError || 'Could not load project types.'}</span>
          <button type="button" onClick={loadProjectTypes} style={{ fontSize: 13, fontWeight: 600, color: 'oklch(46% 0.09 60)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Retry</button>
        </div>
      )}

      <div className="nad-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {remoteLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 14, overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border)' }} aria-hidden="true">
                <div className="nad-skeleton" style={{ aspectRatio: '4/3' }} />
                <div style={{ padding: '14px 16px 16px' }}>
                  <div style={{ height: 14, width: '60%', background: 'var(--border)', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ height: 11, width: '85%', background: 'var(--border)', borderRadius: 4 }} />
                </div>
              </div>
            ))
          : cards.map((card) => (
              <ProjectTypeCard
                key={card.key}
                type={{ key: card.key, [lang]: card.name, [lang + 'Desc']: card.desc }}
                lang={lang}
                selected={selectedKey === card.key}
                isAdmin={isAdmin}
                overrideUrl={card.remoteRow ? '' : (state.imageOverrides['type-' + card.key] || '')}
                prefillSrc={card.imageUrl}
                onImageError={card.remoteRow && card.remoteRow.imageUrl ? () => setBrokenImageUrls((prev) => ({ ...prev, [card.remoteRow.imageUrl]: true })) : undefined}
                onAdminImageChange={(e) => handleAdminImageChange('type-' + card.key, e)}
                editLabel={T.common.edit}
                onSelect={() => handleSelect(card)}
                onEditClick={card.remoteRow ? () => openProjectTypeEditor(card.remoteRow) : undefined}
                onQuickImageUpload={card.remoteRow ? (file) => quickSaveProjectTypeImage(card.remoteRow, file) : undefined}
                saving={state.projectTypeSaving}
              />
            ))}
      </div>
      {isCustomTypeSelected && (
        <div style={{ marginTop: 22 }}>
          <label htmlFor="nad-custom-type" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>{T.type.customLabel}</label>
          <textarea id="nad-custom-type" value={state.customTypeText} onChange={setCustomType} placeholder={T.type.customPh} rows={3} style={{ width: '100%', maxWidth: 640, padding: '14px 16px', borderRadius: 10, border: '1px solid oklch(75% 0.02 70)', background: 'var(--surface)', fontSize: 14, color: 'var(--text)', resize: 'vertical' }} />
        </div>
      )}
      <JourneyNav onNext={nextFromType} nextDisabled={!canProceedType} />
      <ProjectTypeEditModal />
    </section>
  );
}
