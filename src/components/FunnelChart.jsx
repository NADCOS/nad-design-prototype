import React from 'react';

// Journey funnel: how many guest journeys reached each design step, with
// per-step drop-off. Data comes from guest_projects.max_step_index.
export default function FunnelChart({ funnel, steps, lang }) {
  const hasData = Array.isArray(funnel) && funnel.some((v) => v > 0);
  const title = lang === 'ar' ? 'مسار رحلة التصميم' : 'Design Journey Funnel';
  const sub = lang === 'ar' ? 'عدد الرحلات التي وصلت إلى كل خطوة — وأين يتوقف الزوار' : 'How many journeys reached each step — and where visitors drop off';
  const emptyMsg = lang === 'ar' ? 'لا توجد بيانات رحلات بعد — تظهر البيانات عندما يبدأ الزوار رحلات التصميم.' : 'No journey data yet — data appears once visitors start design journeys.';
  const max = Math.max(1, ...(funnel || [0]));

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 22, marginTop: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2, marginBottom: 18 }}>{sub}</div>
      {!hasData && <div style={{ fontSize: 13, color: 'var(--text-2)', padding: '18px 0' }}>{emptyMsg}</div>}
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
                  <div style={{ width: w + '%', height: '100%', borderRadius: 6, background: 'linear-gradient(90deg, oklch(46% 0.09 60), oklch(64% 0.10 68))', transition: 'width .5s ease' }} />
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
