import React from 'react';

// Persistent daily/session quota indicator — shown near the Generate button
// at all times, not just as an error once the cap is hit.
export default function GenerationQuota({ used, cap, label }) {
  const exhausted = used >= cap;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} aria-hidden="true">
        {Array.from({ length: cap }, (_, i) => (
          <div
            key={i}
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: i < used ? (exhausted ? 'oklch(55% 0.16 30)' : 'oklch(46% 0.09 60)') : 'oklch(88% 0.015 75)',
              transition: 'background .2s ease',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 11.5, color: exhausted ? 'oklch(48% 0.14 30)' : 'var(--text-2)', fontWeight: exhausted ? 600 : 400 }}>{label}</span>
    </div>
  );
}
