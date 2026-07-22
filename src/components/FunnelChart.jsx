import React from 'react';

// Journey funnel: how many guest journeys reached each design step, with
// per-step drop-off. Data comes from guest_projects.max_step_index.
export default function FunnelChart({ funnel, steps, lang }) {
  const hasData = Array.isArray(funnel) && funnel.some((v) => v > 0);
  const title = lang === 'ar' ? 'مسار رحلة التصميم' : 'Design Journey Funnel';
  const sub = lang === 'ar' ? 'عدد الرحلات التي وصلت إلى كل خطوة — وأين يتوقف الزوار' : 'How many journeys reached each step — and where visitors drop off';
  const emptyMsg = lang === 'ar' ? 'لا توجد بيانات رحلات بعد — تظهر البيانات عندما يبدأ الزوار رحلات التصميم.' : 'No journey data yet — data appears once visitors start design journeys.';
  const max = Math.max(1, ...(funnel || [0]));
  let worstIdx = -1, worstPct = 0;
  (funnel || []).forEach((count, i) => {
    if (i === 0) return;
    const prev = funnel[i - 1];
    if (prev > 0) {
      const pct = Math.round(((prev - count) / prev) * 100);
      if (pct > worstPct) { worstPct = pct; worstIdx = i; }
    }
  });
  const dropAlert = worstIdx > 0 && worstPct >= 20
    ? (lang === 'ar'
      ? '\u0623\u0643\u0628\u0631 \u062a\u0633\u0631\u0628: ' + worstPct + '% \u064a\u062a\u0648\u0642\u0641\u0648\u0646 \u0628\u064a\u0646 \u00ab' + (steps[worstIdx - 1] || '') + '\u00bb \u0648\u00ab' + (steps[worstIdx] || '') + '\u00bb.'
      : 'Biggest drop-off: ' + worstPct + '% leave between \u201c' + (steps[worstIdx - 1] || '') + '\u201d and \u201c' + (steps[worstIdx] || '') + '\u201d.')
    : null;

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 22, marginTop: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2, marginBottom: 18 }}>{sub}</div>
      {!hasData && <div style={{ fontSize: 13, color: 'var(--text-2)', padding: '18px 0' }}>{emptyMsg}</div>}
      {hasData && dropAlert && (
        <div role="alert" style={{ fontSize: 12.5, color: 'oklch(40% 0.12 30)', background: 'oklch(93% 0.04 30)', border: '1px solid oklch(78% 0.07 30)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>{dropAlert}</div>
      )}
      {hasData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {funnel.map((count, i) => {
            const prev = i === 0 ? count : funnel[i - 1];
            const dropPct = i > 0 && prev > 0 ? Math.round(((prev - count) / prev) * 100) : 0;
            const w = Math.max(2, Math.round((count / max) * 100));
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 1fr auto', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>{(i + 1 < 10 ? '0' : '') + (i + 1) + ' ' + (steps[i] || '')}</span>
                <div style={{ background: 'var(--bg)', borderRadius: 6, height: 26, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ width: w + '%', height: '100%', borderRadius: 6, background: 'linear-gradient(90deg, #1B6045, #C4A05A)', transition: 'width .5s ease' }} />
                </div>
                <span style={{ fontSize: 12.5, color: 'var(--text-2)', whiteSpace: 'nowrap', minWidth: 96, textAlign: 'end' }}>
                  <strong style={{ color: 'var(--text)' }}>{count}</strong>
                  {i > 0 && dropPct > 0 && <span style={{ color: 'oklch(50% 0.12 30)', marginInlineStart: 8 }}>−{dropPct}%</span>}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
