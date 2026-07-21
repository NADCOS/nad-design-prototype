'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/context/AppStateContext';
import { STRINGS } from '@/lib/i18n';
import { headFontFor } from '@/lib/theme';
import { btn, btnHover, backBtnStyle, backBtnHoverStyle, inputStyle } from '@/lib/uiStyles';
import { sx } from '@/lib/sx';
import Hoverable from '@/components/Hoverable';
import type { ProjectInfo } from '@/lib/types';

export default function UploadStep() {
  const router = useRouter();
  const { state, handleFileUpload, removeUpload, setProjectInfoField, advance } = useAppState();
  const lang = state.lang;
  const T = STRINGS[lang];
  const headFont = headFontFor(lang);
  const pi = state.selections.projectInfo;

  function next() { advance('summary'); router.push('/design/summary'); }
  function back() { router.push('/design/furniture'); }

  const fields: Array<{ key: keyof ProjectInfo; label: string; type?: string }> = [
    { key: 'location', label: T.upload.location },
    { key: 'area', label: T.upload.area, type: 'number' },
    { key: 'ceiling', label: T.upload.ceiling },
    { key: 'colors', label: T.upload.colors },
    { key: 'functions', label: T.upload.functions },
    { key: 'budget', label: T.upload.budget },
  ];

  return (
    <section data-screen-label="Upload Project Info">
      <h1 style={{ fontFamily: headFont, fontSize: 34, color: 'var(--text)', margin: '0 0 8px', fontWeight: 500 }}>{T.upload.title}</h1>
      <p style={{ fontSize: 15, color: 'var(--text-2)', margin: '0 0 26px' }}>{T.upload.sub}</p>
      <label style={{ display: 'block', border: '2px dashed var(--border)', borderRadius: 16, padding: '40px 24px', textAlign: 'center', cursor: 'pointer', background: 'oklch(95% 0.02 75)', marginBottom: 20 }}>
        <input type="file" multiple onChange={(e) => e.target.files && handleFileUpload(e.target.files)} style={{ display: 'none' }} />
        <div style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{T.upload.dropTitle}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{T.upload.dropSub}</div>
      </label>
      {state.selections.uploads.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 mb-7">
          {state.selections.uploads.map((up, i) => (
            <div key={i} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 10, overflow: 'hidden', background: 'oklch(90% 0.02 75)' }}>
              {up.isImage && up.dataUrl ? (
                <img src={up.dataUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={up.name} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'ui-monospace,monospace', fontSize: 11, color: 'var(--text-2)', textAlign: 'center', padding: 6 }}>{up.name}</div>
              )}
              <span onClick={() => removeUpload(i)} style={{ position: 'absolute', top: 4, right: 4, cursor: 'pointer', width: 20, height: 20, borderRadius: '50%', background: 'oklch(20% 0.02 50 / 0.7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>×</span>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-7">
        {fields.map((f) => (
          <div key={f.key}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>{f.label}</label>
            <input type={f.type || 'text'} value={pi[f.key]} onChange={(e) => setProjectInfoField(f.key, e.target.value)} style={sx(inputStyle)} />
          </div>
        ))}
        <div className="md:col-span-2">
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>{T.upload.special}</label>
          <textarea rows={3} value={pi.special} onChange={(e) => setProjectInfoField('special', e.target.value)} style={sx(inputStyle)} />
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <Hoverable as="button" style={backBtnStyle} hoverStyle={backBtnHoverStyle} onClick={back}>{T.common.back}</Hoverable>
        <Hoverable as="button" style={btn(true)} hoverStyle={btnHover(true)} onClick={next}>{T.common.next}</Hoverable>
      </div>
    </section>
  );
}
