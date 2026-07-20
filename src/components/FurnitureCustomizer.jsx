import React from 'react';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS, fmtSar } from '../data/translations.js';
import { FURNITURE_CATEGORIES, WOOD_FINISH_OPTS, FABRIC_OPTS, METAL_OPTS } from '../data/furniture.js';
import EditableImage from './EditableImage.jsx';
import Hoverable from './Hoverable.jsx';
import { sx } from '../utils/sx.js';

const chipStyle = (active) => 'padding:8px 14px;border-radius:100px;font-size:12px;font-weight:600;cursor:pointer;background:' + (active ? 'var(--btn-bg)' : 'var(--surface)') + ';color:' + (active ? 'var(--btn-text)' : 'oklch(35% 0.02 55)') + ';border:1px solid ' + (active ? 'var(--btn-bg)' : 'var(--border)') + ';';

// Furniture detail modal: preview + fabric/wood/metal finish pickers. The
// product's design and geometry never change here — only the finish swatch.
export default function FurnitureCustomizer() {
  const { state, closeFurnitureDetail, setDraftFinish, addFurnitureToDesign, handleAdminImageChange } = useAppState();
  const item = state.furnitureDetail;
  if (!item) return null;

  const lang = state.lang;
  const T = STRINGS[lang];
  const isAdmin = state.role === 'admin';
  const cat = FURNITURE_CATEGORIES.find((c) => c.key === item.category);
  const draft = state.furnitureDraftFinish;
  const slotId = 'furn-' + item.id;
  const overrideUrl = item.remoteRow ? '' : (state.imageOverrides[slotId] || '');

  const renderOptions = (type, opts) => (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
      {opts.map((o) => {
        const active = draft[type] && draft[type][0] === o[0];
        return <div key={o[0]} onClick={() => setDraftFinish(type, o)} style={sx(chipStyle(active))} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setDraftFinish(type, o)}>{o[lang === 'ar' ? 1 : 0]}</div>;
      })}
    </div>
  );

  return (
    <div className="nad-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'oklch(20% 0.02 50 / 0.4)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={closeFurnitureDetail} role="dialog" aria-modal="true" aria-label={item.name}>
      <div onClick={(e) => e.stopPropagation()} className="nad-modal-panel" style={{ background: 'var(--surface)', borderRadius: 18, padding: 30, maxWidth: 460, width: '90%', maxHeight: '86vh', overflow: 'auto' }}>
        <div className="nad-sheet-handle" aria-hidden="true" />
        <EditableImage slotId={slotId} placeholder={item.name} prefillSrc={item.imageUrl || ''} aspect="4/3" isAdmin={isAdmin} overrideUrl={overrideUrl} onAdminImageChange={(e) => handleAdminImageChange(slotId, e)} editLabel={T.common.edit} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '16px 0' }}>
          <div>
            <div style={{ fontFamily: "'Century Gothic', 'Futura', sans-serif", fontSize: 21, color: 'var(--text)' }}>{item.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-2)', fontFamily: 'ui-monospace,monospace', marginTop: 4 }}>{item.code} · {item.supplier}</div>
          </div>
          <button type="button" onClick={closeFurnitureDetail} style={{ cursor: 'pointer', fontSize: 13, color: 'var(--text-2)', background: 'none', border: 'none', padding: 0 }}>{T.common.close}</button>
        </div>
        <div style={{ display: 'flex', gap: 18, fontSize: 13, marginBottom: 18, color: 'var(--text)', flexWrap: 'wrap' }}>
          <div>{T.furniture.dims}: {item.dims}</div>
          <div>{fmtSar(item.price, lang)}</div>
          <div>{item.availability === 'inStock' ? T.furniture.inStock : T.furniture.madeToOrder}</div>
        </div>
        {cat && cat.finishes.includes('wood') && (<><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>{T.furniture.wood}</div>{renderOptions('wood', WOOD_FINISH_OPTS)}</>)}
        {cat && cat.finishes.includes('fabric') && (<><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>{T.furniture.fabric}</div>{renderOptions('fabric', FABRIC_OPTS)}</>)}
        {cat && cat.finishes.includes('metal') && (<><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>{T.furniture.metal}</div>{renderOptions('metal', METAL_OPTS)}</>)}
        <Hoverable as="button" type="button" style="width:100%;padding:14px;border-radius:100px;border:none;background:var(--btn-bg);color:var(--btn-text);font-weight:600;font-size:14px;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;" hoverStyle="transform:translateY(-2px);box-shadow:0 10px 22px -8px oklch(20% 0.02 50 / 0.4);filter:brightness(1.08);" onClick={addFurnitureToDesign}>{T.common.addToDesign}</Hoverable>
      </div>
    </div>
  );
}
