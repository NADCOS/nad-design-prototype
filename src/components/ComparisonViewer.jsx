import React, { useRef, useCallback } from 'react';

// Generate step — before/after comparison slider over the generated image.
// `before` renders the uploaded room photo when present, else a placeholder.
// The divider can be dragged directly on the image (mouse or touch), with the
// range input kept underneath for keyboard/accessibility.
export default function ComparisonViewer({ beforeImageUrl, afterImageUrl, beforeLabel, afterLabel, versionLabel, sliderPos, onSliderChange }) {
  const afterClipStyle = { clipPath: 'inset(0 ' + (100 - sliderPos) + '% 0 0)' };
  const frameRef = useRef(null);
  const draggingRef = useRef(false);

  const setFromClientX = useCallback((clientX) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    onSliderChange({ target: { value: String(pct) } });
  }, [onSliderChange]);

  const onMouseDown = useCallback((e) => { draggingRef.current = true; setFromClientX(e.clientX); }, [setFromClientX]);
  const onMouseMove = useCallback((e) => { if (draggingRef.current) setFromClientX(e.clientX); }, [setFromClientX]);
  const onMouseUp = useCallback(() => { draggingRef.current = false; }, []);
  const onTouchMove = useCallback((e) => { if (e.touches && e.touches[0]) setFromClientX(e.touches[0].clientX); }, [setFromClientX]);

  return (
    <div>
      <div
        ref={frameRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchMove}
        onTouchMove={onTouchMove}
        style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 16, overflow: 'hidden', background: 'oklch(90% 0.02 75)', cursor: 'ew-resize', userSelect: 'none', touchAction: 'none' }}
      >
        {beforeImageUrl ? (
          <img src={beforeImageUrl} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt={beforeLabel} draggable={false} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg, oklch(88% 0.02 75) 0px, oklch(88% 0.02 75) 14px, oklch(80% 0.03 68) 14px, oklch(80% 0.03 68) 28px)' }} />
        )}
        <span style={{ position: 'absolute', bottom: 14, left: 14, fontFamily: 'ui-monospace,monospace', fontSize: 11, background: 'oklch(97% 0.01 80 / 0.85)', padding: '6px 10px', borderRadius: 6 }}>{beforeLabel}</span>
        <div style={{ position: 'absolute', inset: 0, ...afterClipStyle }}>
          <img src={afterImageUrl} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt={afterLabel} draggable={false} />
          <span style={{ position: 'absolute', bottom: 14, left: 14, fontFamily: 'ui-monospace,monospace', fontSize: 11, color: '#fff', background: 'oklch(20% 0.02 50 / 0.6)', padding: '6px 10px', borderRadius: 6 }}>{versionLabel}</span>
        </div>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: sliderPos + '%', width: 2, background: '#fff', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: sliderPos + '%', transform: 'translate(-50%,-50%)', width: 36, height: 36, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.25)', pointerEvents: 'none' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="oklch(24% 0.02 55)" strokeWidth="2.5" strokeLinecap="round"><path d="M8 6l-5 6 5 6M16 6l5 6-5 6" /></svg>
        </div>
      </div>
      <input type="range" min="0" max="100" value={sliderPos} onChange={onSliderChange} aria-label="Before/after comparison position" style={{ width: '100%', marginTop: 12, accentColor: 'oklch(64% 0.10 68)' }} />
    </div>
  );
}
