import React from 'react';
import Hoverable from './Hoverable.jsx';
import EditableImage from './EditableImage.jsx';

// Step 1 card — one project type (Villa, Apartment, Office, ...).
export default function ProjectTypeCard({ type, lang, selected, isAdmin, overrideUrl, onAdminImageChange, editLabel, onSelect, prefillSrc, onEditClick, onImageError, onQuickImageUpload, saving }) {
  const name = type[lang];
  const desc = type[lang + 'Desc'];
  const borderColor = selected ? 'oklch(64% 0.10 68)' : (isAdmin ? 'oklch(72% 0.07 70)' : 'var(--border)');
  const borderStyle = !selected && isAdmin ? 'dashed' : 'solid';
  const cardStyle = 'border-radius:14px;overflow:hidden;cursor:pointer;background:var(--surface);border:2px ' + borderStyle + ' ' + borderColor + ';transition:border-color .15s;';
  return (
    <Hoverable onClick={onSelect} style={cardStyle} hoverStyle="transform:translateY(-4px);box-shadow:0 16px 32px -12px oklch(20% 0.02 50 / 0.3);" role="button" tabIndex={0} aria-pressed={selected} onKeyDown={(e) => e.key === 'Enter' && onSelect()}>
      <EditableImage slotId={'type-' + type.key} placeholder={name} prefillSrc={prefillSrc} isAdmin={isAdmin} overrideUrl={overrideUrl} onAdminImageChange={onAdminImageChange} editLabel={editLabel} stopClickPropagation onEditClick={onEditClick} onImageError={onImageError} onQuickImageUpload={onQuickImageUpload} saving={saving} />
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{name}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.4 }}>{desc}</div>
      </div>
    </Hoverable>
  );
}
