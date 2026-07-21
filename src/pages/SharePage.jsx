import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { STRINGS, fmtSar } from '../data/translations.js';

// Read-only shared summary — reached via a link created from Summary/Generate
// ("Share summary link"). No login required. Two data sources depending on
// whether the project has Supabase configured: a server-stored record keyed
// by a random "share-" identifier (reuses guest_projects), or — when there's
// no backend — the whole compact payload packed into the URL hash.
export default function SharePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (token === 'local') {
        try {
          const hash = window.location.hash.slice(1);
          const json = decodeURIComponent(escape(atob(hash)));
          if (!cancelled) { setData(JSON.parse(json)); setStatus('ready'); }
        } catch (e) { if (!cancelled) setStatus('error'); }
        return;
      }
      try {
        const res = await fetch('/api/guest-projects?identifier=' + encodeURIComponent('share-' + token));
        const json = await res.json();
        if (cancelled) return;
        if (json && json.success && json.found) { setData(json.project); setStatus('ready'); }
        else setStatus('error');
      } catch (e) { if (!cancelled) setStatus('error'); }
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  const lang = (data && data.lang) || 'en';
  const T = STRINGS[lang];
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  if (status === 'loading') {
    return <div style={{ padding: '80px 28px', textAlign: 'center', color: 'var(--text-2)' }}>…</div>;
  }
  if (status === 'error' || !data) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '90px 28px', textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: 'var(--text-2)', marginBottom: 24 }}>{STRINGS.en.extras.notFound}</p>
        <button type="button" onClick={() => navigate('/')} style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--btn-text)', background: 'var(--btn-bg)', border: 'none', padding: '12px 26px', borderRadius: 100, cursor: 'pointer' }}>{STRINGS.en.extras.startOwn}</button>
      </div>
    );
  }

  const sel = data.selections || {};
  const cost = data.cost || {};
  const rows = [
    [T.summary.projectType, sel.projectType ? (sel.projectType.key === 'custom' ? (data.customTypeText || sel.projectType[lang]) : sel.projectType[lang]) : T.summary.none],
    [T.summary.level, sel.designLevel ? sel.designLevel[lang] : T.summary.none],
    [T.summary.style, sel.stylePrimary ? sel.stylePrimary[lang] + (sel.styleSecondary ? ' + ' + sel.styleSecondary[lang] : '') : T.summary.none],
  ];
  const materialsList = Object.keys(sel.materials || {}).map((k) => sel.materials[k][lang]);
  const furnitureList = (sel.furniture || []).map((f) => f.name);

  return (
    <div dir={dir} style={{ maxWidth: 720, margin: '0 auto', padding: '40px 28px 80px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'oklch(46% 0.09 60)', marginBottom: 8 }}>{T.extras.readOnlyBanner}</div>
      <h1 style={{ fontFamily: 'var(--head-font)', fontSize: 30, color: 'var(--text)', margin: '0 0 24px' }}>{T.summary.title}</h1>

      {data.generatedImageUrl && (
        <img src={data.generatedImageUrl} alt="" style={{ width: '100%', borderRadius: 16, marginBottom: 24, display: 'block' }} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {rows.map(([label, value], i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>{label}</span>
            <span style={{ fontSize: 14.5, color: 'var(--text)' }}>{value}</span>
          </div>
        ))}
        {materialsList.length > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>{T.summary.materials}</div>
            <div style={{ fontSize: 13.5, color: 'var(--text)' }}>{materialsList.join(' \u2022 ')}</div>
          </div>
        )}
        {furnitureList.length > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>{T.summary.furniture}</div>
            <div style={{ fontSize: 13.5, color: 'var(--text)' }}>{furnitureList.join(' \u2022 ')}</div>
          </div>
        )}
      </div>

      {typeof cost.total === 'number' && (
        <div style={{ background: 'oklch(22% 0.02 50)', borderRadius: 16, padding: 24, color: 'oklch(96% 0.01 80)', marginBottom: 30 }}>
          <div style={{ fontFamily: "'Century Gothic', 'Futura', sans-serif", fontSize: 17, marginBottom: 12 }}>{T.summary.costBreakdown}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: 'oklch(72% 0.10 68)' }}><span>{T.summary.total}</span><span>{fmtSar(cost.total, lang)}</span></div>
          <div style={{ fontSize: 11, color: 'oklch(70% 0.01 80)', marginTop: 8 }}>{T.summary.disclaimer}</div>
        </div>
      )}

      <button type="button" onClick={() => navigate('/')} style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--btn-text)', background: 'var(--btn-bg)', border: 'none', padding: '13px 26px', borderRadius: 100, cursor: 'pointer' }}>{T.extras.startOwn}</button>
    </div>
  );
}
