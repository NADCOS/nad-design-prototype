import React from 'react';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS } from '../data/translations.js';
import { materialSlotId, materialMeta, PREFILL_MATERIAL_IMAGES } from '../data/materials.js';
import EditableImage from './EditableImage.jsx';
import Hoverable from './Hoverable.jsx';

// Material preview popup — uses a 50%-opaque frosted-glass panel with a darker
// backdrop and high-contrast text so it stays readable over any background.
export default function MaterialPreviewModal() {
  const { state, closeMaterialDetail, saveMaterialToBoard, handleAdminImageChange } = useAppState();
  const detail = state.materialDetail;
  if (!detail) return null;

  const lang = state.lang;
  const T = STRINGS[lang];
  const isAdmin = state.role === 'admin';
  const meta = materialMeta(detail.catKey, detail, lang);
  const inBoard = state.selections.board.some((b) => b.catKey === detail.catKey && b.en === detail.en);
  const slotId = materialSlotId(detail.catKey, detail.en);
  const name = lang === 'ar' ? detail.ar : detail.en;
  const overrideUrl = state.imageOverrides[slotId] || '';

  return (
    <div
      className="nad-modal-overlay"
      style={{ position: 'fixed', inset: 0, background: 'oklch(20% 0.02 50 / 0.55)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={closeMaterialDetail}
      role="dialog"
      aria-modal="true"
      aria-label={name}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="nad-modal-panel"
        style={{ background: 'oklch(100% 0 0 / 0.5)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1px solid oklch(100% 0 0 / 0.6)', boxShadow: '0 20px 50px -12px oklch(20% 0.02 50 / 0.45)', borderRadius: 18, padding: 30, maxWidth: 440, width: '90%' }}
      >
        <div className="nad-sheet-handle" aria-hidden="true" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div style={{ fontFamily: "'Century Gothic', 'Futura', sans-serif", fontSize: 22, color: 'oklch(18% 0.02 50)' }}>{name}</div>
          <button type="button" onClick={closeMaterialDetail} style={{ cursor: 'pointer', fontSize: 13, color: 'oklch(32% 0.02 55)', background: 'none', border: 'none', padding: 0 }}>{T.common.close}</button>
        </div>
        <EditableImage
          slotId={slotId}
          placeholder={name}
          prefillSrc={PREFILL_MATERIAL_IMAGES[slotId.slice(4)] || ''}
          aspect="16/9"
          isAdmin={isAdmin}
          overrideUrl={overrideUrl}
          onAdminImageChange={(e) => handleAdminImageChange(slotId, e)}
          editLabel={T.common.edit}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', fontSize: 13, margin: '20px 0' }}>
          <div><div style={{ color: 'oklch(38% 0.02 55)', fontWeight: 600, marginBottom: 2 }}>{T.materials.supplier}</div><div style={{ color: 'oklch(18% 0.02 50)' }}>{meta.supplier}</div></div>
          <div><div style={{ color: 'oklch(38% 0.02 55)', fontWeight: 600, marginBottom: 2 }}>{T.materials.code}</div><div style={{ color: 'oklch(18% 0.02 50)' }}>{meta.code}</div></div>
          <div><div style={{ color: 'oklch(38% 0.02 55)', fontWeight: 600, marginBottom: 2 }}>{T.materials.price}</div><div style={{ color: 'oklch(18% 0.02 50)' }}>{meta.priceLabel}</div></div>
          <div><div style={{ color: 'oklch(38% 0.02 55)', fontWeight: 600, marginBottom: 2 }}>{T.materials.colors}</div><div style={{ color: 'oklch(18% 0.02 50)' }}>{meta.colorsList.join(' \u00b7 ')}</div></div>
          <div><div style={{ color: 'oklch(38% 0.02 55)', fontWeight: 600, marginBottom: 2 }}>{T.materials.sustainability}</div><div style={{ color: 'oklch(18% 0.02 50)' }}>{meta.sustain}</div></div>
          <div><div style={{ color: 'oklch(38% 0.02 55)', fontWeight: 600, marginBottom: 2 }}>{T.materials.maintenance}</div><div style={{ color: 'oklch(18% 0.02 50)' }}>{meta.maint}</div></div>
        </div>
        <Hoverable
          as="button"
          type="button"
          disabled={inBoard}
          style="width:100%;padding:14px;border-radius:100px;border:none;background:var(--btn-bg);color:var(--btn-text);font-weight:600;font-size:14px;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;"
          hoverStyle="transform:translateY(-2px);box-shadow:0 10px 22px -8px oklch(20% 0.02 50 / 0.4);filter:brightness(1.08);"
          onClick={() => saveMaterialToBoard(detail.catKey, [detail.en, detail.ar])}
        >
          {inBoard ? T.common.added : T.common.addToBoard}
        </Hoverable>
      </div>
    </div>
  );
}
