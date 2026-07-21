import React from 'react';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS } from '../data/translations.js';
import { MATERIAL_CATEGORIES } from '../data/materials.js';

// Summary step — left-column editable summary cards (project type, level,
// style, materials, furniture, uploads) plus material-compatibility warnings.
export default function DesignSummary() {
  const { state, goToStep, computeWarnings } = useAppState();
  const lang = state.lang;
  const T = STRINGS[lang];
  const s = state.selections;

  const summaryProjectType = s.projectType ? (s.projectType.key === 'custom' ? (state.customTypeText || s.projectType[lang]) : s.projectType[lang]) : T.summary.none;
  const summaryLevel = s.designLevel ? s.designLevel[lang] : T.summary.none;
  const summaryStyle = s.stylePrimary
    ? s.stylePrimary[lang] + (s.styleSecondary ? (lang === 'ar' ? ' مع لمسة ' + s.styleSecondary[lang] : ' with a touch of ' + s.styleSecondary[lang]) : '')
    : T.summary.none;
  const summaryMaterialsList = Object.keys(s.materials).map((catKey) => {
    const cat = MATERIAL_CATEGORIES.find((c) => c.key === catKey);
    return cat[lang] + ': ' + s.materials[catKey][lang];
  });
  const summaryMaterialsText = summaryMaterialsList.length ? summaryMaterialsList.join(' \u2022 ') : T.summary.none;
  const summaryFurnitureText = s.furniture.length ? s.furniture.map((f) => f.name).join(' \u2022 ') : T.summary.none;
  const summaryUploadsText = s.uploads.length + (lang === 'ar' ? ' ملف' : ' files');
  const warningsList = computeWarnings();
  const hasWarnings = warningsList.length > 0;
  const favMaterials = Object.values(state.favorites.materials || {});
  const favFurniture = Object.values(state.favorites.furniture || {});
  const hasFavorites = favMaterials.length > 0 || favFurniture.length > 0;

  const Row = ({ label, value, step }) => (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 4 }}>{label}</div><div style={{ fontSize: 15, color: 'var(--text)' }}>{value}</div></div>
      <button type="button" onClick={() => goToStep(step)} style={{ cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: 'oklch(46% 0.09 60)', background: 'none', border: 'none', padding: 0 }}>{T.common.edit}</button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Row label={T.summary.projectType} value={summaryProjectType} step="type" />
      <Row label={T.summary.level} value={summaryLevel} step="level" />
      <Row label={T.summary.style} value={summaryStyle} step="style" />
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>{T.summary.materials}</div><button type="button" onClick={() => goToStep('materials')} style={{ cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: 'oklch(46% 0.09 60)', background: 'none', border: 'none', padding: 0 }}>{T.common.edit}</button></div>
        <div style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.8 }}>{summaryMaterialsText}</div>
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>{T.summary.furniture}</div><button type="button" onClick={() => goToStep('furniture')} style={{ cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: 'oklch(46% 0.09 60)', background: 'none', border: 'none', padding: 0 }}>{T.common.edit}</button></div>
        <div style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.8 }}>{summaryFurnitureText}</div>
      </div>
      <Row label={T.summary.uploads} value={summaryUploadsText} step="upload" />
      {hasFavorites && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>{T.extras.favoritesTitle}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {favMaterials.map((f, i) => <span key={'m' + i} style={{ fontSize: 12.5, padding: '6px 12px', borderRadius: 100, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>{f[lang]}</span>)}
            {favFurniture.map((f, i) => <span key={'f' + i} style={{ fontSize: 12.5, padding: '6px 12px', borderRadius: 100, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>{f.name}</span>)}
          </div>
        </div>
      )}
      {hasWarnings && (
        <div style={{ background: 'oklch(93% 0.03 65)', border: '1px solid oklch(75% 0.06 60)', borderRadius: 14, padding: '16px 20px' }} role="alert">
          <div style={{ fontSize: 12, fontWeight: 700, color: 'oklch(35% 0.06 55)', marginBottom: 8 }}>{T.materials.warning}</div>
          {warningsList.map((w, i) => <div key={i} style={{ fontSize: 13, color: 'oklch(30% 0.05 55)', marginBottom: 4 }}>— {w}</div>)}
        </div>
      )}
    </div>
  );
}
