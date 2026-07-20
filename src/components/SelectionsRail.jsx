import React from 'react';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS, fmtSar } from '../data/translations.js';
import { STEP_KEYS } from '../data/navigation.js';

// Desktop-only sticky rail (≥1100px) showing selections so far with a
// running total — each filled row jumps back to its step for editing.
export default function SelectionsRail() {
  const { state, goToStep, computeCost } = useAppState();
  const lang = state.lang;
  const T = STRINGS[lang];
  const s = state.selections;
  const matCount = Object.keys(s.materials).length;
  const rows = [
    { step: 'type', label: T.summary.projectType, value: s.projectType ? s.projectType[lang] : null },
    { step: 'level', label: T.summary.level, value: s.designLevel ? s.designLevel[lang] : null },
    { step: 'style', label: T.summary.style, value: s.stylePrimary ? s.stylePrimary[lang] + (s.styleSecondary ? ' + ' + s.styleSecondary[lang] : '') : null },
    { step: 'materials', label: T.summary.materials, value: matCount ? Object.values(s.materials).slice(0, 3).map((m) => m[lang]).join(' · ') + (matCount > 3 ? ' +' + (matCount - 3) : '') : null },
    { step: 'furniture', label: T.summary.furniture, value: s.furniture.length ? String(s.furniture.length) : null },
    { step: 'upload', label: T.summary.area, value: s.projectInfo.area ? s.projectInfo.area + ' m²' : null },
  ];
  const cost = s.designLevel ? computeCost() : null;

  return (
    <aside className="nad-journey-rail" aria-label={T.rail.title}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 20px 16px' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'oklch(46% 0.09 60)', marginBottom: 14 }}>{T.rail.title}</div>
        {rows.map((r) => {
          const reachable = STEP_KEYS.indexOf(r.step) <= state.maxStepIndex;
          return (
            <div
              key={r.step}
              onClick={() => reachable && goToStep(r.step)}
              role={reachable ? 'button' : undefined}
              tabIndex={reachable ? 0 : -1}
              onKeyDown={(e) => { if (reachable && e.key === 'Enter') goToStep(r.step); }}
              style={{ padding: '9px 0', borderBottom: '1px solid var(--border)', cursor: reachable ? 'pointer' : 'default' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{r.label}</span>
                {reachable && <span style={{ fontSize: 11, color: 'oklch(64% 0.10 68)', fontWeight: 700 }} aria-hidden="true">{lang === 'ar' ? '↖' : '↗'}</span>}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: r.value ? 'var(--text)' : 'var(--text-2)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.value || T.summary.none}</div>
            </div>
          );
        })}
        {cost && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>{T.summary.total}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'oklch(46% 0.09 60)' }}>{fmtSar(cost.total, lang)}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
