import React, { useState, useMemo } from 'react';

const GEN_COLOR = '#1B6045';
const REG_COLOR = '#C4A05A';

function bucketRegistrations(registrations, periods, mode) {
  const map = {};
  (registrations || []).forEach((r) => {
    if (!r.registeredAt) return;
    const key = mode === 'year' ? r.registeredAt.slice(0, 4) : r.registeredAt.slice(0, 7);
    map[key] = (map[key] || 0) + 1;
  });
  return periods.map((p) => map[p.period] || 0);
}

// A "nice" axis maximum so gridline labels are round numbers.
function niceMax(v) {
  if (v <= 4) return Math.max(1, v);
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const norm = v / pow;
  const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return step * pow;
}

// Monotone-ish cubic path so the line curves gently without overshooting.
function smoothPath(pts) {
  if (pts.length === 0) return '';
  if (pts.length === 1) return 'M ' + pts[0].x + ' ' + pts[0].y;
  let d = 'M ' + pts[0].x + ' ' + pts[0].y;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const t = 0.16;
    const lo = Math.min(p1.y, p2.y), hi = Math.max(p1.y, p2.y), cl = (v) => Math.max(lo, Math.min(hi, v));
    const c1x = p1.x + (p2.x - p0.x) * t;
    const c1y = cl(p1.y + (p2.y - p0.y) * t);
    const c2x = p2.x - (p3.x - p1.x) * t;
    const c2y = cl(p2.y - (p3.y - p1.y) * t);
    d += ' C ' + c1x + ' ' + c1y + ' ' + c2x + ' ' + c2y + ' ' + p2.x + ' ' + p2.y;
  }
  return d;
}

// Overview graph: two series (AI designs generated — real Supabase counts;
// visitor registrations — from this browser's records) over the same period
// buckets, toggled between the last 12 months and the last 5 years.
export default function ActivityChart({ monthly, yearly, registrations, loading }) {
  const [mode, setMode] = useState('month');
  const [monthRange, setMonthRange] = useState(12);
  const [hover, setHover] = useState(null);
  const periods = mode === 'month' ? monthly.slice(-monthRange) : yearly;
  const genCounts = periods.map((p) => p.count);
  const regCounts = useMemo(() => bucketRegistrations(registrations, periods, mode), [registrations, periods, mode]);
  const genTotal = genCounts.reduce((a, b) => a + b, 0);
  const regTotal = regCounts.reduce((a, b) => a + b, 0);

  const width = 660, height = 250, padL = 40, padR = 16, padT = 16, padB = 34;
  const chartW = width - padL - padR, chartH = height - padT - padB;
  const maxVal = niceMax(Math.max(1, ...genCounts, ...regCounts));
  const n = periods.length;
  const x = (i) => padL + (n <= 1 ? chartW / 2 : (i * chartW) / (n - 1));
  const y = (v) => padT + chartH - (v / maxVal) * chartH;
  const pts = (vals) => vals.map((v, i) => ({ x: x(i), y: y(v) }));
  const genPts = pts(genCounts), regPts = pts(regCounts);
  const areaPath = (p) => p.length ? smoothPath(p) + ' L ' + p[p.length - 1].x + ' ' + (padT + chartH) + ' L ' + p[0].x + ' ' + (padT + chartH) + ' Z' : '';
  const lastIdx = n - 1;
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const labelEvery = n <= 14 ? 1 : Math.ceil(n / 14);

  const segBtn = (active, extra) => ({ fontSize: 12, fontWeight: 600, padding: '6px 13px', borderRadius: 100, cursor: 'pointer', border: 'none', background: active ? 'var(--surface)' : 'transparent', color: active ? 'var(--text)' : 'var(--text-2)', boxShadow: active ? '0 1px 3px oklch(20% 0.02 50 / 0.14)' : 'none', transition: 'color .15s ease', ...extra });
  const segWrap = { display: 'inline-flex', gap: 3, padding: 3, background: 'var(--bg, oklch(96% 0.008 70))', border: '1px solid var(--border)', borderRadius: 100 };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Site Activity</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>AI designs generated and visitor registrations over time</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {mode === 'month' && (
            <div style={segWrap}>
              {[3, 6, 12].map((r) => (
                <button key={r} type="button" onClick={() => setMonthRange(r)} style={segBtn(monthRange === r)}>{'Last ' + r + 'mo'}</button>
              ))}
            </div>
          )}
          <div style={segWrap}>
            {['month', 'year'].map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)} style={segBtn(mode === m)}>{m === 'month' ? 'Monthly' : 'Yearly'}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Totals row — doubles as the series legend */}
      <div style={{ display: 'flex', gap: 32, marginBottom: 6, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-2)' }}><span style={{ width: 9, height: 9, borderRadius: 3, background: GEN_COLOR, display: 'inline-block' }} />AI designs generated</div>
          <div style={{ fontSize: 26, fontWeight: 750, color: 'var(--text)', letterSpacing: '-0.02em', marginTop: 2 }}>{genTotal.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-2)' }}><span style={{ width: 9, height: 9, borderRadius: 3, background: REG_COLOR, display: 'inline-block' }} />Visitor registrations</div>
          <div style={{ fontSize: 26, fontWeight: 750, color: 'var(--text)', letterSpacing: '-0.02em', marginTop: 2 }}>{regTotal.toLocaleString()}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--text-2)' }}>Loading…</div>
      ) : (
        <div style={{ position: 'relative' }}>
          <svg viewBox={'0 0 ' + width + ' ' + height} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }} role="img" aria-label="Site activity chart">
            <defs>
              <linearGradient id="genFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GEN_COLOR} stopOpacity="0.16" />
                <stop offset="100%" stopColor={GEN_COLOR} stopOpacity="0" />
              </linearGradient>
              <linearGradient id="regFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={REG_COLOR} stopOpacity="0.16" />
                <stop offset="100%" stopColor={REG_COLOR} stopOpacity="0" />
              </linearGradient>
            </defs>

            {ticks.map((f) => {
              const gy = padT + chartH * (1 - f);
              return (
                <g key={f}>
                  <line x1={padL} x2={width - padR} y1={gy} y2={gy} stroke="var(--border)" strokeWidth="1" strokeDasharray={f === 0 ? '0' : '3 5'} opacity={f === 0 ? 1 : 0.7} />
                  <text x={padL - 10} y={gy + 3.5} textAnchor="end" fontSize="10" fill="var(--text-2)">{Math.round(maxVal * f)}</text>
                </g>
              );
            })}

            <path d={areaPath(regPts)} fill="url(#regFill)" />
            <path d={areaPath(genPts)} fill="url(#genFill)" />
            <path d={smoothPath(regPts)} fill="none" stroke={REG_COLOR} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
            <path d={smoothPath(genPts)} fill="none" stroke={GEN_COLOR} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />

            {/* Emphasize the latest data point */}
            {n > 0 && [{ p: regPts[lastIdx], c: REG_COLOR }, { p: genPts[lastIdx], c: GEN_COLOR }].map((o, k) => (
              <g key={'last' + k}>
                <circle cx={o.p.x} cy={o.p.y} r="6" fill={o.c} opacity="0.16" />
                <circle cx={o.p.x} cy={o.p.y} r="3.5" fill="var(--surface)" stroke={o.c} strokeWidth="1.75" />
              </g>
            ))}

            {/* Hover guide + points */}
            {hover !== null && (
              <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + chartH} stroke="var(--text-2)" strokeWidth="1" strokeDasharray="3 4" opacity="0.5" />
            )}
            {hover !== null && [{ p: regPts[hover], c: REG_COLOR }, { p: genPts[hover], c: GEN_COLOR }].map((o, k) => (
              <circle key={'h' + k} cx={o.p.x} cy={o.p.y} r="4" fill={o.c} stroke="var(--surface)" strokeWidth="2" />
            ))}

            {periods.map((p, i) => (i % labelEvery === 0 || i === lastIdx) && (
              <text key={'l' + i} x={x(i)} y={height - 8} textAnchor="middle" fontSize="10" fill="var(--text-2)">{p.label}</text>
            ))}

            {/* Invisible hit columns for hover */}
            {periods.map((p, i) => (
              <rect key={'hit' + i} x={x(i) - chartW / Math.max(1, n) / 2} y={padT} width={chartW / Math.max(1, n)} height={chartH} fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: 'crosshair' }} />
            ))}
          </svg>

          {hover !== null && (
            <div style={{ position: 'absolute', left: (x(hover) / width) * 100 + '%', top: -6, transform: (hover > n / 2 ? 'translate(-108%, 0)' : 'translate(8%, 0)'), background: 'var(--text)', color: 'var(--surface)', borderRadius: 10, padding: '9px 12px', fontSize: 11.5, lineHeight: 1.5, pointerEvents: 'none', whiteSpace: 'nowrap', boxShadow: '0 8px 22px -8px oklch(20% 0.02 50 / 0.5)', zIndex: 2 }}>
              <div style={{ fontWeight: 700, marginBottom: 3, opacity: 0.85 }}>{periods[hover].label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: GEN_COLOR, display: 'inline-block' }} />{genCounts[hover]} designs</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: REG_COLOR, display: 'inline-block' }} />{regCounts[hover]} registrations</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
