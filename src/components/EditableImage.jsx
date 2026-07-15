import React from 'react';
import ImageSlot from './ImageSlot.jsx';

// The 4-layer editable-image pattern used for type/level/material/furniture cards & modals:
// 1) the fillable ImageSlot placeholder, 2) an admin-uploaded override image on top,
// 3) a small "Edit" label (admins only), 4) a transparent click-blocker for non-admins.
export default function EditableImage({ slotId, placeholder, prefillSrc, isAdmin, overrideUrl, onAdminImageChange, aspect, editLabel, stopClickPropagation, onEditClick, onImageError, onQuickImageUpload, saving }) {
  function handleQuickFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (file && onQuickImageUpload) onQuickImageUpload(file);
  }
  return (
    <div style={{ position: 'relative', aspectRatio: aspect || '4/3' }}>
      {overrideUrl ? (
        <img src={overrideUrl} alt="" onError={onImageError} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 3 }} />
      ) : (
        <ImageSlot id={slotId} src={prefillSrc} placeholder={placeholder} style="width:100%;height:100%;" />
      )}
      {isAdmin ? (
        <>
          {onEditClick ? (
            <button
              type="button"
              onClick={(e) => { if (stopClickPropagation) e.stopPropagation(); onEditClick(); }}
              style={{ position: 'absolute', top: 8, left: 8, background: 'oklch(20% 0.02 50 / 0.7)', color: '#fff', fontSize: 10.5, fontWeight: 600, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', zIndex: 5, border: 'none' }}
            >
              {editLabel}
            </button>
          ) : (
            <label
              onClick={stopClickPropagation ? (e) => e.stopPropagation() : undefined}
              style={{ position: 'absolute', top: 8, left: 8, background: 'oklch(20% 0.02 50 / 0.7)', color: '#fff', fontSize: 10.5, fontWeight: 600, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', zIndex: 5 }}
            >
              {editLabel}
              <input type="file" accept="image/*" onChange={onAdminImageChange} style={{ display: 'none' }} aria-label={placeholder ? `Upload image for ${placeholder}` : 'Upload image'} />
            </label>
          )}
          {onQuickImageUpload && (
            <label
              onClick={stopClickPropagation ? (e) => e.stopPropagation() : undefined}
              title="Quick-swap image — saves instantly to the live site"
              style={{ position: 'absolute', bottom: 8, right: 8, width: 30, height: 30, borderRadius: '50%', background: saving ? 'oklch(55% 0.1 68)' : 'oklch(20% 0.02 50 / 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: saving ? 'wait' : 'pointer', zIndex: 5 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleQuickFile} disabled={saving} style={{ display: 'none' }} aria-label={placeholder ? `Quick-swap image for ${placeholder}` : 'Quick-swap image'} />
            </label>
          )}
        </>
      ) : (
        <div style={{ position: 'absolute', inset: 0, zIndex: 4 }} />
      )}
    </div>
  );
}
