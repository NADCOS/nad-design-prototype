import React from 'react';
import Hoverable from './Hoverable.jsx';
import EditableImage from './EditableImage.jsx';

// Step 4 — one selectable material swatch card.
export default function MaterialCard({ name, isRecommended, recommendedLabel, badgeSide, slotId, prefillSrc, isAdmin, overrideUrl, onAdminImageChange, editLabel, chosen, onSelect }) {
  const cardStyle = 'border-radius:12px;overflow:hidden;cursor:pointer;background:var(--surface);border:2px solid ' + (chosen ? 'oklch(64% 0.10 68)' : 'var(--border)') + ';position:relative;transition:transform .18s ease,box-shadow .18s ease;';
  return (
    <Hoverable onClick={onSelect} style={cardStyle} hoverStyle="transform:translateY(-3px);box-shadow:0 12px 24px -10px oklch(20% 0.02 50 / 0.3);" role="button" tabIndex={0} aria-pressed={chosen} onKeyDown={(e) => e.key === 'Enter' && onSelect()}>
      {isRecommended && (
        <div style={{ position: 'absolute', top: 8, [badgeSide]: 8, background: 'oklch(64% 0.10 68)', color: 'var(--btn-text)', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100, zIndex: 2 }}>{recommendedLabel}</div>
      )}
      <EditableImage slotId={slotId} placeholder={name} prefillSrc={prefillSrc} aspect="1/1" isAdmin={isAdmin} overrideUrl={overrideUrl} onAdminImageChange={onAdminImageChange} editLabel={editLabel} stopClickPropagation />
      <div style={{ padding: '10px 12px', fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>{name}</div>
    </Hoverable>
  );
}
