import React from 'react';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS } from '../data/translations.js';
import JourneyNav from '../components/JourneyNav.jsx';
import { sx } from '../utils/sx.js';

const inputStyle = 'width:100%;box-sizing:border-box;padding:12px 14px;border-radius:10px;border:1px solid oklch(75% 0.02 70);background:var(--surface);font-size:13.5px;color:var(--text);';

export default function UploadPage() {
  const { state, handleFileUpload, removeUpload, setProjectInfoField, nextFromUpload } = useAppState();
  const lang = state.lang;
  const T = STRINGS[lang];
  const pi = state.selections.projectInfo;
  const uploads = state.selections.uploads;

  const fields = [
    { key: 'location', label: T.upload.location, type: 'text' },
    { key: 'area', label: T.upload.area, type: 'number' },
    { key: 'ceiling', label: T.upload.ceiling, type: 'text' },
    { key: 'colors', label: T.upload.colors, type: 'text' },
    { key: 'functions', label: T.upload.functions, type: 'text' },
    { key: 'budget', label: T.upload.budget, type: 'text' },
  ];

  return (
    <section data-screen-label="Upload Project Info">
      <h1 style={{ fontFamily: 'var(--head-font)', fontSize: 34, color: 'var(--text)', margin: '0 0 8px', fontWeight: 500 }}>{T.upload.title}</h1>
      <p style={{ fontSize: 15, color: 'var(--text-2)', margin: '0 0 26px' }}>{T.upload.sub}</p>
      <label style={{ display: 'block', border: '2px dashed var(--border)', borderRadius: 16, padding: '40px 24px', textAlign: 'center', cursor: 'pointer', background: 'oklch(95% 0.02 75)', marginBottom: 20 }}>
        <input type="file" multiple accept="image/*,.pdf,.dwg,.skp" onChange={handleFileUpload} style={{ display: 'none' }} aria-label={T.upload.dropTitle} />
        <div style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{T.upload.dropTitle}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{T.upload.dropSub}</div>
      </label>
      {uploads.length > 0 && (
        <div className="nad-grid-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10, marginBottom: 30 }}>
          {uploads.map((up, i) => (
            <div key={i} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 10, overflow: 'hidden', background: 'oklch(90% 0.02 75)' }}>
              {up.isImage && up.dataUrl ? (
                <img src={up.dataUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={up.name} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'ui-monospace,monospace', fontSize: 11, color: 'var(--text-2)', textAlign: 'center', padding: 6 }}>{up.name}</div>
              )}
              <button type="button" onClick={() => removeUpload(i)} aria-label={T.common.remove} style={{ position: 'absolute', top: 4, right: 4, cursor: 'pointer', width: 20, height: 20, borderRadius: '50%', background: 'oklch(20% 0.02 50 / 0.7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: 'none', padding: 0 }}>×</button>
            </div>
          ))}
        </div>
      )}
      <div className="nad-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: 30 }}>
        {fields.map((f) => (
          <div key={f.key}>
            <label htmlFor={'nad-pi-' + f.key} style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>{f.label}</label>
            <input id={'nad-pi-' + f.key} type={f.type} value={pi[f.key]} onChange={setProjectInfoField(f.key)} style={sx(inputStyle)} />
          </div>
        ))}
        <div style={{ gridColumn: 'span 2' }}>
          <label htmlFor="nad-pi-special" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>{T.upload.special}</label>
          <textarea id="nad-pi-special" rows={3} value={pi.special} onChange={setProjectInfoField('special')} style={sx(inputStyle)} />
        </div>
      </div>
      <JourneyNav backTo="furniture" onNext={nextFromUpload} />
    </section>
  );
}
