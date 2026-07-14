import React from 'react';

// Generate step — before/after comparison slider over the generated image.
// `before` renders the uploaded room photo when present, else a placeholder.
export default function ComparisonViewer({ beforeImageUrl, afterImageUrl, beforeLabel, afterLabel, versionLabel, sliderPos, onSliderChange }) {
  const afterClipStyle = { clipPath: 'inset(0 ' + (100 - sliderPos) + '% 0 0)' };
  return (
    <div>
      <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 16, overflow: 'hidden', background: 'oklch(90% 0.02 75)' }}>
        {beforeImageUrl ? (
          <img src={beforeImageUrl} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt={beforeLabel} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg, oklch(88% 0.02 75) 0px, oklch(88% 0.02 75) 14px, oklch(80% 0.03 68) 14px, oklch(80% 0.03 68) 28px)' }} />
        )}
        <span style={{ position: 'absolute', bottom: 14, left: 14, fontFamily: 'ui-monospace,monospace', fontSize: 11, background: 'oklch(97% 0.01 80 / 0.85)', padding: '6px 10px', borderRadius: 6 }}>{beforeLabel}</span>
        <div style={{ position: 'absolute', inset: 0, ...afterClipStyle }}>
          <img src={afterImageUrl} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt={afterLabel} />
          <span style={{ position: 'absolute', bottom: 14, left: 14, fontFamily: 'ui-monospace,monospace', fontSize: 11, color: '#fff', background: 'oklch(20% 0.02 50 / 0.6)', padding: '6px 10px', borderRadius: 6 }}>{versionLabel}</span>
        </div>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: sliderPos + '%', width: 2, background: '#fff' }} />
      </div>
      <input type="range" min="0" max="100" value={sliderPos} onChange={onSliderChange} aria-label="Before/after comparison position" style={{ width: '100%', marginTop: 12, accentColor: 'oklch(64% 0.10 68)' }} />
    </div>
  );
}
