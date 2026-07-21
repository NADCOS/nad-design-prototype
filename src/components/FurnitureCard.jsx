import React from 'react';
import EditableImage from './EditableImage.jsx';
import Hoverable from './Hoverable.jsx';

// Step 5 — one furniture catalogue item card.
export default function FurnitureCard({ item, priceLabel, addLabel, isAdmin, overrideUrl, onAdminImageChange, editLabel, onOpenDetail, headFont, prefillSrc, onImageError, onEditClick, onQuickImageUpload, saving, favorited, onToggleFavorite, favoriteLabel }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <EditableImage slotId={'furn-' + item.id} placeholder={item.name} prefillSrc={prefillSrc} isAdmin={isAdmin} overrideUrl={overrideUrl} onAdminImageChange={onAdminImageChange} editLabel={editLabel} stopClickPropagation onEditClick={onEditClick} onImageError={onImageError} onQuickImageUpload={onQuickImageUpload} saving={saving} />
      <div style={{ padding: '16px 16px 16px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ fontFamily: headFont, fontSize: 17, color: 'var(--text)', marginBottom: 4 }}>{item.name}</div>
          {onToggleFavorite && (
            <button type="button" aria-label={favoriteLabel} aria-pressed={!!favorited} onClick={onToggleFavorite} style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill={favorited ? 'oklch(64% 0.10 68)' : 'none'} stroke={favorited ? 'oklch(64% 0.10 68)' : 'var(--text-2)'} strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
            </button>
          )}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-2)', fontFamily: 'ui-monospace,monospace', marginBottom: 8 }}>{item.code} · {item.supplier}</div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 14 }}>{item.dims}</div>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: 'oklch(46% 0.09 60)' }}>{priceLabel}</span>
          <Hoverable as="button" type="button" onClick={onOpenDetail} style="font-size:12.5px;font-weight:600;padding:9px 16px;border-radius:100px;background:var(--btn-bg);color:var(--btn-text);border:none;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;" hoverStyle="transform:translateY(-2px);box-shadow:0 8px 18px -6px oklch(20% 0.02 50 / 0.4);filter:brightness(1.08);">{addLabel}</Hoverable>
        </div>
      </div>
    </div>
  );
}
