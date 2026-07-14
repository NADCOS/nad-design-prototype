import React from 'react';
import ImageSlot from './ImageSlot.jsx';

// The 4-layer editable-image pattern used for type/level/material/furniture cards & modals:
// 1) the fillable ImageSlot placeholder, 2) an admin-uploaded override image on top,
// 3) a small "Edit" label (admins only), 4) a transparent click-blocker for non-admins.
export default function EditableImage({ slotId, placeholder, prefillSrc, isAdmin, overrideUrl, onAdminImageChange, aspect, editLabel, stopClickPropagation }) {
  return (
    <div style={{ position: 'relative', aspectRatio: aspect || '4/3' }}>
      <ImageSlot id={slotId} src={prefillSrc} placeholder={placeholder} style="width:100%;height:100%;" />
      {overrideUrl ? (
        <img src={overrideUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 3, pointerEvents: 'none' }} />
      ) : null}
      {isAdmin ? (
        <label
          onClick={stopClickPropagation ? (e) => e.stopPropagation() : undefined}
          style={{ position: 'absolute', top: 8, left: 8, background: 'oklch(20% 0.02 50 / 0.7)', color: '#fff', fontSize: 10.5, fontWeight: 600, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', zIndex: 5 }}
        >
          {editLabel}
          <input type="file" accept="image/*" onChange={onAdminImageChange} style={{ display: 'none' }} aria-label={placeholder ? `Upload image for ${placeholder}` : 'Upload image'} />
        </label>
      ) : (
        <div style={{ position: 'absolute', inset: 0, zIndex: 4 }} />
      )}
    </div>
  );
}
