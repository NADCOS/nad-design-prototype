import React, { useState, useMemo } from 'react';

const GEN_COLOR = 'oklch(46% 0.09 60)';
const REG_COLOR = 'oklch(52% 0.06 250)';

function bucketRegistrations(registrations, periods, mode) {
  const map = {};
  (registrations || []).forEach((r) => {
    if (!r.registeredAt) return;
    const key = mode === 'year' ? r.registeredAt.slice(0, 4) : r.registeredAt.slice(0, 7);
    map[key] = (map[key] || 0) + 1;
  });
  return periods.map((p) => map[p.period] || 0);
}

// Overview graph: two series (AI designs generated — real Supabase counts;
// visitor registrations — from this browser's records) over the same period
// buckets, toggled between the last 12 months and the last 5 years.
export default function ActivityChart({ monthly, yearly, registrations, loading }) {
  const [mode, setMode] = useState('month');
  const [monthRange, setMonthRange] = useState(12);
  const periods = mode === 'month' ? monthly.slice(-monthRange) : yearly;
  const genCounts = periods.map((p) => p.count);
  const regCounts = useMemo(() => bucketRegistrations(registrations, periods, mode), [registrations, periods, mode]);

  const width = 640, height = 220, padL = 34, padR = 14, padT = 14, padB = 30;
  const chartW = width - padL - padR, chartH = height - padT - padB;
  const maxVal = Math.max(1, ...genCounts, ...regCounts);
  const n = periods.length;
  const x = (i) => padL + (n <= 1 ? 0 : (i * chartW) / (n - 1));
  const y = (v) => padT + chartH - (v / maxVal) * chartH;
  const linePoints = (vals) => vals.map((v, i) => x(i) + ',' + y(v)).join(' ');

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 22, marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Site Activity</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>AI designs generated and visitor registrations over time</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {mode === 'month' && [3, 6, 12].map((n) => (
            <button key={n} type="button" onClick={() => setMonthRange(n)} style={{ fontSize: 11.5, fontWeight: 600, padding: '7px 12px', borderRadius: 100, cursor: 'pointer', background: monthRange === n ? 'var(--border)' : 'transparent', color: 'var(--text-2)', border: '1px solid var(--border)' }}>{'Last ' + n + 'mo'}</button>
          ))}
          {['month', 'year'].map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} style={{ fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 100, cursor: 'pointer', background: mode === m ? 'var(--btn-bg)' : 'transparent', color: mode === m ? 'var(--btn-text)' : 'var(--text-2)', border: '1px solid ' + (mode === m ? 'var(--btn-bg)' : 'var(--border)') }}>{m === 'month' ? 'Monthly' : 'Yearly'}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--text-2)' }}>Loading…</div>
      ) : (
        <>
          <svg viewBox={'0 0 ' + width + ' ' + height} style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label="Site activity chart">
            {[0, 0.5, 1].map((f) => (
              <line key={f} x1={padL} x2={width - padR} y1={padT + chartH * (1 - f)} y2={padT + chartH * (1 - f)} stroke="var(--border)" strokeWidth="1" />
            ))}
            <polyline points={linePoints(regCounts)} fill="none" stroke={REG_COLOR} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            <polyline points={linePoints(genCounts)} fill="none" stroke={GEN_COLOR} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {genCounts.map((v, i) => <circle key={'g' + i} cx={x(i)} cy={y(v)} r="3" fill={GEN_COLOR} />)}
            {regCounts.map((v, i) => <circle key={'r' + i} cx={x(i)} cy={y(v)} r="3" fill={REG_COLOR} />)}
            {periods.map((p, i) => (n <= 14 || i % Math.ceil(n / 14) === 0) && (
              <text key={'l' + i} x={x(i)} y={height - 8} textAnchor="middle" fontSize="10" fill="var(--text-2)">{p.label}</text>
            ))}
          </svg>
          <div style={{ display: 'flex', gap: 18, marginTop: 10, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: GEN_COLOR, display: 'inline-block' }} />AI designs generated</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: REG_COLOR, display: 'inline-block' }} />Visitor registrations</span>
          </div>
        </>
      )}
    </div>
  );
}
