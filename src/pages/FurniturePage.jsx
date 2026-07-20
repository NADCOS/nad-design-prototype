import React, { useEffect, useState } from 'react';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS, fmtSar } from '../data/translations.js';
import { FURNITURE_CATEGORIES, FURNITURE_ITEMS, WOOD_FINISH_OPTS, FABRIC_OPTS, METAL_OPTS } from '../data/furniture.js';
import { isSupabaseConfigured } from '../lib/supabase.js';
import FurnitureCard from '../components/FurnitureCard.jsx';
import FurnitureEditModal from '../components/FurnitureEditModal.jsx';
import JourneyNav from '../components/JourneyNav.jsx';
import { sx } from '../utils/sx.js';

function findFinish(opts, val) { return opts.find((o) => o[0] === val) || null; }

export default function FurniturePage({ headFont }) {
  const {
    state, setFurnitureTab, openFurnitureDetail, removeFurnitureItem, nextFromFurniture, handleAdminImageChange,
    loadFurnitureItems, openFurnitureEditor, openNewFurnitureItem, quickSaveFurnitureImage, seedFurnitureCatalog,
  } = useAppState();
  const [tab, setTab] = useState(state.furnitureTab || 'sofas');
  const [brokenImageUrls, setBrokenImageUrls] = useState({});
  const lang = state.lang;
  const T = STRINGS[lang];
  const isAdmin = state.role === 'admin';
  const activeCat = FURNITURE_CATEGORIES.find((c) => c.key === tab) || FURNITURE_CATEGORIES[0];

  useEffect(() => {
    if (isSupabaseConfigured) loadFurnitureItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remoteReady = isSupabaseConfigured && state.furnitureStatus === 'loaded' && state.furnitureRemote.length > 0;
  const remoteLoading = isSupabaseConfigured && state.furnitureStatus === 'loading' && state.furnitureRemote.length === 0;
  const remoteError = isSupabaseConfigured && state.furnitureStatus === 'error' && state.furnitureRemote.length === 0;

  const allItems = remoteReady
    ? state.furnitureRemote.map((row) => ({
        id: row.id, category: row.category, name: row.name, code: row.code, supplier: row.supplier, price: row.price, dims: row.dims,
        woodFinish: findFinish(WOOD_FINISH_OPTS, row.wood_finish), fabric: findFinish(FABRIC_OPTS, row.fabric), metal: findFinish(METAL_OPTS, row.metal),
        availability: row.availability, imageUrl: (row.imageUrl && !brokenImageUrls[row.imageUrl]) ? row.imageUrl : '', remoteRow: row,
      }))
    : FURNITURE_ITEMS.map((it) => ({ ...it, imageUrl: '', remoteRow: null }));
  const activeItems = allItems.filter((f) => f.category === activeCat.key);

  function selectTab(key) { setTab(key); setFurnitureTab(key); }

  return (
    <section data-screen-label="Furniture">
      <h1 style={{ fontFamily: headFont, fontSize: 34, color: 'var(--text)', margin: '0 0 8px', fontWeight: 500 }}>{T.furniture.title}</h1>
      <p style={{ fontSize: 15, color: 'var(--text-2)', margin: '0 0 24px' }}>{T.furniture.sub}</p>

      {isAdmin && (
        <div style={{ background: 'oklch(94% 0.035 75)', border: '1px solid oklch(78% 0.06 68)', borderRadius: 12, padding: '13px 18px', marginBottom: 20, fontSize: 13, lineHeight: 1.5, color: 'oklch(36% 0.05 60)' }}>
          <strong style={{ fontWeight: 700 }}>Admin Mode.</strong> Use the camera icon on a card to instantly swap its photo, or "{T.common.edit}" to update name, code, supplier, dimensions, price, category and finishes. Changes save straight to the live site.
        </div>
      )}

      {isAdmin && isSupabaseConfigured && !remoteReady && !remoteLoading && (
        <div style={{ background: 'oklch(95% 0.02 230)', border: '1px solid oklch(80% 0.06 230)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13.5, color: 'oklch(35% 0.08 230)' }}>These are sample items — view-only until imported. Import them once to edit or delete individual pieces.</span>
          <button type="button" onClick={seedFurnitureCatalog} disabled={state.furnitureSaving} style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', background: 'oklch(45% 0.1 230)', border: 'none', borderRadius: 100, padding: '9px 18px', cursor: state.furnitureSaving ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>{state.furnitureSaving ? 'Importing…' : 'Import catalogue to database'}</button>
        </div>
      )}

      {remoteError && (
        <div role="alert" style={{ background: 'oklch(95% 0.03 30)', border: '1px solid oklch(80% 0.06 30)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13.5, color: 'oklch(35% 0.1 30)' }}>{state.furnitureError || 'Could not load furniture items.'}</span>
          <button type="button" onClick={loadFurnitureItems} style={{ fontSize: 13, fontWeight: 600, color: 'oklch(46% 0.09 60)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Retry</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }} role="tablist" aria-label={T.furniture.title}>
        {FURNITURE_CATEGORIES.map((cat) => {
          const active = tab === cat.key;
          const tabStyle = 'padding:10px 18px;border-radius:100px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;background:' + (active ? 'var(--btn-bg)' : 'transparent') + ';color:' + (active ? 'var(--btn-text)' : 'oklch(40% 0.02 55)') + ';border:1px solid ' + (active ? 'var(--btn-bg)' : 'var(--border)') + ';';
          return <div key={cat.key} onClick={() => selectTab(cat.key)} style={sx(tabStyle)} role="tab" aria-selected={active} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && selectTab(cat.key)}>{cat[lang]}</div>;
        })}
      </div>

      {isAdmin && isSupabaseConfigured && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
          <button type="button" onClick={() => openNewFurnitureItem(activeCat.key)} style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--btn-text)', background: 'var(--btn-bg)', border: 'none', borderRadius: 100, padding: '10px 20px', cursor: 'pointer' }}>+ Add item to {activeCat.en}</button>
        </div>
      )}

      <div className="nad-grid-2 nad-swipe-row nad-swipe-row-lg" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
        {remoteLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }} aria-hidden="true">
                <div className="nad-skeleton" />
                <div style={{ padding: 16 }}>
                  <div style={{ height: 14, width: '60%', background: 'var(--border)', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ height: 11, width: '85%', background: 'var(--border)', borderRadius: 4 }} />
                </div>
              </div>
            ))
          : activeItems.map((item) => {
              const slotId = 'furn-' + item.id;
              return (
                <FurnitureCard
                  key={item.id} item={item} priceLabel={fmtSar(item.price, lang)} addLabel={T.common.addToDesign}
                  isAdmin={isAdmin} overrideUrl={item.remoteRow ? '' : (state.imageOverrides[slotId] || '')} prefillSrc={item.imageUrl}
                  onImageError={item.remoteRow && item.remoteRow.imageUrl ? () => setBrokenImageUrls((prev) => ({ ...prev, [item.remoteRow.imageUrl]: true })) : undefined}
                  onAdminImageChange={(e) => handleAdminImageChange(slotId, e)}
                  editLabel={T.common.edit} onOpenDetail={() => openFurnitureDetail(item)} headFont={headFont}
                  onEditClick={item.remoteRow ? () => openFurnitureEditor(item.remoteRow) : undefined}
                  onQuickImageUpload={item.remoteRow ? (file) => quickSaveFurnitureImage(item.remoteRow, file) : undefined}
                  saving={state.furnitureSaving}
                />
              );
            })}
      </div>
      <div style={{ marginTop: 30, paddingTop: 22, borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>{T.furniture.yourFurniture} ({state.selections.furniture.length})</div>
        {state.selections.furniture.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 10 }}>{T.furniture.empty}</div>}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {state.selections.furniture.map((f) => (
            <div key={f.uid} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', padding: '8px 8px 8px 14px', borderRadius: 100, fontSize: 12.5, color: 'var(--text)' }}>
              {f.name} · {fmtSar(f.price, lang)}
              <button type="button" onClick={() => removeFurnitureItem(f.uid)} aria-label={T.common.remove} style={{ cursor: 'pointer', width: 20, height: 20, borderRadius: '50%', background: 'oklch(90% 0.02 72)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: 'none', padding: 0 }}>×</button>
            </div>
          ))}
        </div>
      </div>
      <JourneyNav backTo="materials" onNext={nextFromFurniture} />
      <FurnitureEditModal />
    </section>
  );
}
