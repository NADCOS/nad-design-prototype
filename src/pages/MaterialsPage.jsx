import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS } from '../data/translations.js';
import { MATERIAL_CATEGORIES, PREFILL_MATERIAL_IMAGES, materialSlotId } from '../data/materials.js';
import { STYLE_RECS } from '../data/styles.js';
import MaterialCard from '../components/MaterialCard.jsx';
import Hoverable from '../components/Hoverable.jsx';
import { sx } from '../utils/sx.js';

export default function MaterialsPage() {
  const navigate = useNavigate();
  const { state, setMaterialTab, chooseMaterial, openMaterialDetail, removeFromBoard, nextFromMaterials, handleAdminImageChange } = useAppState();
  const [tab, setTab] = useState(state.materialTab || 'flooring');
  const lang = state.lang;
  const T = STRINGS[lang];
  const isAdmin = state.role === 'admin';
  const badgeSide = lang === 'ar' ? 'left' : 'right';

  const activeCat = MATERIAL_CATEGORIES.find((c) => c.key === tab) || MATERIAL_CATEGORIES[0];
  const recs = (state.selections.stylePrimary && STYLE_RECS[state.selections.stylePrimary.key]) || [];

  function selectTab(key) { setTab(key); setMaterialTab(key); }

  return (
    <section data-screen-label="Materials">
      <h1 style={{ fontFamily: 'var(--head-font)', fontSize: 34, color: 'var(--text)', margin: '0 0 8px', fontWeight: 500 }}>{T.materials.title}</h1>
      <p style={{ fontSize: 15, color: 'var(--text-2)', margin: '0 0 24px' }}>{T.materials.sub}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }} role="tablist" aria-label={T.materials.title}>
        {MATERIAL_CATEGORIES.map((cat) => {
          const active = tab === cat.key;
          const tabStyle = 'padding:10px 18px;border-radius:100px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;background:' + (active ? 'var(--btn-bg)' : 'transparent') + ';color:' + (active ? 'var(--btn-text)' : 'oklch(40% 0.02 55)') + ';border:1px solid ' + (active ? 'var(--btn-bg)' : 'var(--border)') + ';';
          return <div key={cat.key} onClick={() => selectTab(cat.key)} style={sx(tabStyle)} role="tab" aria-selected={active} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && selectTab(cat.key)}>{cat[lang]}</div>;
        })}
      </div>
      <div className="nad-grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
        {activeCat.items.map((item) => {
          const chosen = state.selections.materials[activeCat.key] && state.selections.materials[activeCat.key].en === item[0];
          const slotId = materialSlotId(activeCat.key, item[0]);
          const name = item[lang === 'ar' ? 1 : 0];
          return (
            <MaterialCard
              key={item[0]} name={name} isRecommended={recs.includes(item[0])} recommendedLabel={T.materials.recommended} badgeSide={badgeSide}
              slotId={slotId} prefillSrc={PREFILL_MATERIAL_IMAGES[slotId.slice(4)] || ''} isAdmin={isAdmin}
              overrideUrl={state.imageOverrides[slotId] || ''} onAdminImageChange={(e) => handleAdminImageChange(slotId, e)}
              editLabel={T.common.edit} chosen={chosen}
              onSelect={() => { chooseMaterial(activeCat.key, item); openMaterialDetail(activeCat.key, item); }}
            />
          );
        })}
      </div>
      <div style={{ marginTop: 30, paddingTop: 22, borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>{T.materials.board}</div>
        {state.selections.board.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 10 }}>{T.materials.boardEmpty}</div>}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {state.selections.board.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', padding: '8px 8px 8px 14px', borderRadius: 100, fontSize: 12.5, color: 'var(--text)' }}>
              {b[lang]}
              <button type="button" onClick={() => removeFromBoard(i)} aria-label={T.common.remove} style={{ cursor: 'pointer', width: 20, height: 20, borderRadius: '50%', background: 'oklch(90% 0.02 72)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: 'none', padding: 0 }}>×</button>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36 }}>
        <Hoverable as="button" type="button" style="font-size:14px;font-weight:600;color:var(--text);background:transparent;border:1px solid var(--border);padding:13px 26px;border-radius:100px;cursor:pointer;transition:transform .18s ease,background .18s ease;" hoverStyle="transform:translateY(-2px);background:var(--border);" onClick={() => navigate('/design/style')}>{T.common.back}</Hoverable>
        <Hoverable as="button" type="button" style="font-size:14.5px;font-weight:600;color:var(--btn-text);background:var(--btn-bg);border:none;padding:14px 30px;border-radius:100px;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;" hoverStyle="transform:translateY(-2px);box-shadow:0 10px 22px -8px oklch(20% 0.02 50 / 0.4);filter:brightness(1.08);" onClick={nextFromMaterials}>{T.common.next}</Hoverable>
      </div>
    </section>
  );
}
