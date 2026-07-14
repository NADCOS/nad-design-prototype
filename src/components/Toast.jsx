import React from 'react';
import { useAppState } from '../hooks/useAppState.js';

export default function Toast() {
  const { state } = useAppState();
  if (!state.toast) return null;
  return (
    <div role="status" aria-live="polite" style={{ position: 'fixed', bottom: 26, left: '50%', transform: 'translateX(-50%)', background: 'var(--btn-bg)', color: 'var(--btn-text)', padding: '14px 24px', borderRadius: 100, fontSize: 13.5, fontWeight: 600, boxShadow: '0 10px 30px oklch(20% 0.02 50 / 0.3)', zIndex: 100 }}>
      {state.toast}
    </div>
  );
}
