import React from 'react';
import Hoverable from './Hoverable.jsx';
import EditableImage from './EditableImage.jsx';

// Step 2 card — one design level (Luxury / High-End / Mid-Range / Budget-Friendly).
export default function DesignLevelCard({ level, lang, priceLabel, selected, isAdmin, overrideUrl, onAdminImageChange, editLabel, onSelect, headFont, showDescription = true, prefillSrc }) {
  const name = level[lang];
  const desc = level[lang + 'Desc'];
  const cardStyle = 'border-radius:14px;overflow:hidden;cursor:pointer;background:var(--surface);border:2px solid ' + (selected ? 'oklch(64% 0.10 68)' : 'var(--border)') + ';transition:transform .18s ease,box-shadow .18s ease;';
  return (
    <Hoverable onClick={onSelect} style={cardStyle} hoverStyle="transform:translateY(-4px);box-shadow:0 16px 32px -12px oklch(20% 0.02 50 / 0.3);" role="button" tabIndex={0} aria-pressed={selected} onKeyDown={(e) => e.key === 'Enter' && onSelect()}>
      <EditableImage slotId={'level-' + level.key} placeholder={name + ' mood'} prefillSrc={prefillSrc} isAdmin={isAdmin} overrideUrl={overrideUrl} onAdminImageChange={onAdminImageChange} editLabel={editLabel} stopClickPropagation />
      <div style={{ padding: 16 }}>
        <div style={{ fontFamily: headFont, fontSize: showDescription ? 19 : 18, color: 'var(--text)', marginBottom: 6 }}>{name}</div>
        {showDescription && <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.45, marginBottom: 10 }}>{desc}</div>}
        <div style={{ fontSize: 12.5, color: 'oklch(46% 0.09 60)', fontWeight: 600 }}>{priceLabel}</div>
      </div>
    </Hoverable>
  );
}
