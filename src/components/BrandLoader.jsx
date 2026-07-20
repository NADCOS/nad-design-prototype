import React from 'react';

// Branded loading screen built around the NAD Designs logo: black canvas,
// the logo softly breathing, and a sweeping progress line beneath it.
export default function BrandLoader({ title, subtitle }) {
  return (
    <div role="status" aria-live="polite" style={{ aspectRatio: '4/3', borderRadius: 16, background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, overflow: 'hidden', padding: 24 }}>
      <img src="/assets/nad-logo.jpg" alt="NAD Designs" style={{ width: '40%', maxWidth: 220, animation: 'nad-logo-pulse 2.2s ease-in-out infinite' }} />
      <div style={{ width: 160, height: 2, background: 'rgba(255,255,255,0.18)', borderRadius: 100, overflow: 'hidden' }} aria-hidden="true">
        <div style={{ width: '40%', height: '100%', background: '#fff', borderRadius: 100, animation: 'nad-loader-sweep 1.4s ease-in-out infinite' }} />
      </div>
      {title && <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{title}</div>}
      {subtitle && <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12.5, textAlign: 'center', maxWidth: 300 }}>{subtitle}</div>}
    </div>
  );
}
