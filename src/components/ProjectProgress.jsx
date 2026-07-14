import React from 'react';
import { useAppState } from '../hooks/useAppState.js';
import { STEP_KEYS } from '../data/navigation.js';
import { STRINGS } from '../data/translations.js';
import { sx } from '../utils/sx.js';

// Step progress rail shown across every /design/:step page — click a reached
// step to jump back to it.
export default function ProjectProgress({ current }) {
  const { state, goToStep } = useAppState();
  const T = STRINGS[state.lang];
  const curIdx = STEP_KEYS.indexOf(current);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '26px 0 34px', overflowX: 'auto' }} role="navigation" aria-label="Design journey progress">
      {STEP_KEYS.map((key, i) => {
        const active = i === curIdx;
        const reachable = i <= state.maxStepIndex;
        const done = i < curIdx;
        let bg = 'oklch(90% 0.02 75)'; let color = 'oklch(45% 0.02 55)'; let border = '1px solid var(--border)';
        if (active) { bg = 'var(--btn-bg)'; color = 'var(--btn-text)'; border = '1px solid var(--btn-bg)'; }
        else if (done) { bg = 'oklch(64% 0.10 68)'; color = 'oklch(99% 0.01 80)'; border = '1px solid oklch(64% 0.10 68)'; }
        const dotStyle = 'width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:' + bg + ';color:' + color + ';border:' + border + ';cursor:' + (reachable ? 'pointer' : 'default') + ';flex:none;';
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 'none' }}>
            <div
              onClick={() => reachable && goToStep(key)}
              style={sx(dotStyle)}
              role="button"
              tabIndex={reachable ? 0 : -1}
              aria-current={active ? 'step' : undefined}
              aria-disabled={!reachable}
              onKeyDown={(e) => { if (reachable && e.key === 'Enter') goToStep(key); }}
            >
              <span style={{ fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
            </div>
            <span style={{ fontSize: 12.5, whiteSpace: 'nowrap', color: 'var(--text-2)', marginInlineEnd: 10, fontWeight: active ? 700 : 500 }}>{T.steps[i]}</span>
          </div>
        );
      })}
    </div>
  );
}
