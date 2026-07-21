import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS } from '../data/translations.js';
import { LIGHT_MOODS, QUALITY_OPTS } from '../data/aiOptions.js';
import { AI_GENERATION_CONFIG } from '../config/aiGeneration.js';
import PromptPreview from '../components/PromptPreview.jsx';
import ComparisonViewer from '../components/ComparisonViewer.jsx';
import BrandLoader from '../components/BrandLoader.jsx';
import ConsultationButton from '../components/ConsultationButton.jsx';
import GenerationQuota from '../components/GenerationQuota.jsx';
import Hoverable from '../components/Hoverable.jsx';
import { sx } from '../utils/sx.js';
import { AI_GENERATION_CONFIG as AI_CFG } from '../config/aiGeneration.js';

const ghostBtnStyle = 'font-size:12px;font-weight:600;padding:11px 10px;border-radius:100px;border:1px solid var(--border);background:transparent;color:var(--text);cursor:pointer;transition:transform .18s ease,background .18s ease;';
const ghostBtnHoverStyle = 'transform:translateY(-2px);background:var(--border);';
const chipStyle = (active) => 'min-height:40px;display:inline-flex;align-items:center;padding:8px 14px;border-radius:100px;font-size:12px;font-weight:600;cursor:pointer;background:' + (active ? 'var(--btn-bg)' : 'var(--surface)') + ';color:' + (active ? 'var(--btn-text)' : 'oklch(35% 0.02 55)') + ';border:1px solid ' + (active ? 'var(--btn-bg)' : 'var(--border)') + ';';

export default function GeneratePage() {
  const navigate = useNavigate();
  const {
    state, setLightMood, setQuality, setAspectRatio, setImageSize, toggleAllowFullRedesign,
    generateDesign, regenerate, resetGeneration, downloadGeneratedImage, saveProject,
    buildWhatsAppLink, setSliderPos, getRemainingGenerations,
    toggleCompareStyles, generateCompareDesigns, viewHistoryEntry, buildShareLink,
  } = useAppState();
  const lang = state.lang;
  const T = STRINGS[lang];

  const mood = state.generationMood || 'daylight';
  const quality = state.generationQuality || 'photorealistic';
  const genStatus = state.generationStatus || 'idle';
  const isGenIdle = genStatus === 'idle', isGenLoading = genStatus === 'generating', isGenDone = genStatus === 'done', isGenError = genStatus === 'error';
  const genVersion = state.generationVersion || 1;
  const sliderPos = state.sliderPos === undefined ? 50 : state.sliderPos;
  const remainingGenerations = getRemainingGenerations();
  const uploadedImage = (state.selections.uploads || []).find((u) => u.isImage && u.dataUrl);
  const whatsappLink = buildWhatsAppLink();
  const disableGenerate = isGenLoading || remainingGenerations <= 0;
  const hasSecondaryStyle = !!state.selections.styleSecondary;
  const compareOn = hasSecondaryStyle && state.compareStyles;
  const compareStatus = state.compareStatus || 'idle';
  // Phone: the result panel sits BELOW the controls, so on generate/finish
  // bring it into view (the loading screen is the user's only feedback).
  const previewRef = React.useRef(null);
  React.useEffect(() => {
    if (genStatus === 'idle') return;
    if (window.innerWidth >= 900 || !previewRef.current) return;
    const top = previewRef.current.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top, behavior: 'smooth' });
  }, [genStatus]);

  return (
    <section data-screen-label="AI Design Generator">
      <h1 style={{ fontFamily: 'var(--head-font)', fontSize: 34, color: 'var(--text)', margin: '0 0 8px', fontWeight: 500 }}>{T.generate.title}</h1>
      <p style={{ fontSize: 15, color: 'var(--text-2)', margin: '0 0 28px', maxWidth: 640 }}>{T.generate.sub}</p>
      <div className="nad-grid-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        <div>
          <PromptPreview />
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>{T.generate.lighting}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
            {LIGHT_MOODS.map((m) => <div key={m.key} onClick={() => setLightMood(m.key)} style={sx(chipStyle(mood === m.key))} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setLightMood(m.key)}>{m[lang]}</div>)}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>{T.generate.quality}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
            {QUALITY_OPTS.map((q) => <div key={q.key} onClick={() => setQuality(q.key)} style={sx(chipStyle(quality === q.key))} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setQuality(q.key)}>{q[lang]}</div>)}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>{T.generate.aspectRatio}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
            {AI_GENERATION_CONFIG.aspectRatios.map((ar) => (
              <div key={ar.key} onClick={() => setAspectRatio(ar.key)} style={sx(chipStyle((state.generationAspectRatio || AI_GENERATION_CONFIG.defaultAspectRatio) === ar.key))} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setAspectRatio(ar.key)}>{ar[lang]}</div>
            ))}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>{T.generate.imageSize}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
            {AI_GENERATION_CONFIG.imageSizes.map((sz) => (
              <div key={sz.key} onClick={() => setImageSize(sz.key)} style={sx(chipStyle((state.generationImageSize || AI_GENERATION_CONFIG.defaultImageSize) === sz.key))} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setImageSize(sz.key)}>{sz[lang]}</div>
            ))}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-2)', marginBottom: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={!!state.allowFullRedesign} onChange={toggleAllowFullRedesign} />
            {T.generate.allowFullRedesign}
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: hasSecondaryStyle ? 'var(--text-2)' : 'var(--border)', marginBottom: 24, cursor: hasSecondaryStyle ? 'pointer' : 'not-allowed' }} title={hasSecondaryStyle ? '' : T.extras.compareNeedsSecondary}>
            <input type="checkbox" checked={compareOn} disabled={!hasSecondaryStyle} onChange={toggleCompareStyles} />
            {T.extras.compareToggle}
          </label>
          <Hoverable
            as="button" type="button" disabled={disableGenerate}
            style={'width:100%;padding:16px;border-radius:100px;border:none;background:var(--btn-bg);color:var(--btn-text);font-weight:700;font-size:15px;cursor:' + (disableGenerate ? 'not-allowed' : 'pointer') + ';opacity:' + (disableGenerate ? '0.7' : '1') + ';transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;'}
            hoverStyle={isGenLoading ? '' : 'transform:translateY(-2px);box-shadow:0 10px 22px -8px oklch(20% 0.02 50 / 0.4);filter:brightness(1.08);'}
            onClick={compareOn ? generateCompareDesigns : generateDesign}
          >
            {compareOn ? (compareStatus === 'generating' ? T.extras.compareGenerating : T.extras.compareBtn) : (isGenLoading ? T.generate.generatingBtn : T.generate.generateBtn)}
          </Hoverable>
          <div className="nad-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
            <Hoverable as="button" type="button" style={ghostBtnStyle} hoverStyle={ghostBtnHoverStyle} onClick={() => navigate('/design/materials')}>{T.generate.changeMaterials}</Hoverable>
            <Hoverable as="button" type="button" style={ghostBtnStyle} hoverStyle={ghostBtnHoverStyle} onClick={() => navigate('/design/level')}>{T.generate.changeLevel}</Hoverable>
            <Hoverable as="button" type="button" style={ghostBtnStyle} hoverStyle={ghostBtnHoverStyle} onClick={() => navigate('/design/furniture')}>{T.generate.changeFurniture}</Hoverable>
            <ConsultationButton style={ghostBtnStyle} hoverStyle={ghostBtnHoverStyle} label={T.generate.consult} />
          </div>
          <GenerationQuota used={Math.max(0, AI_CFG.maxGenerationsPerSession - remainingGenerations)} cap={AI_CFG.maxGenerationsPerSession} label={T.generate.remainingGenerations.replace('{n}', String(remainingGenerations))} />
        </div>
        <div ref={previewRef}>
          {compareOn ? (
            <div>
              {compareStatus === 'idle' && (
                <div style={{ aspectRatio: '4/3', borderRadius: 16, background: 'repeating-linear-gradient(135deg, oklch(90% 0.02 75) 0px, oklch(90% 0.02 75) 14px, oklch(84% 0.035 68) 14px, oklch(84% 0.035 68) 28px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12.5, color: 'var(--text)', background: 'oklch(97% 0.01 80 / 0.85)', padding: '8px 14px', borderRadius: 8 }}>awaiting generation</span>
                </div>
              )}
              {compareStatus === 'generating' && <BrandLoader title={T.extras.compareGenerating} subtitle={T.generate.creatingSubMessage} />}
              {compareStatus === 'done' && state.compareResults && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {state.compareResults.map((r, i) => (
                    <div key={i}>
                      <div style={{ aspectRatio: '4/3', borderRadius: 14, overflow: 'hidden', background: 'oklch(90% 0.02 75)', position: 'relative' }}>
                        {r.ok ? <img src={r.image} alt={r.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, color: 'oklch(40% 0.1 30)', padding: 12, textAlign: 'center' }}>{r.error}</div>
                        )}
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)', textAlign: 'center', marginTop: 8 }}>{r.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
          <>
          {isGenIdle && (
            <div style={{ aspectRatio: '4/3', borderRadius: 16, background: 'repeating-linear-gradient(135deg, oklch(90% 0.02 75) 0px, oklch(90% 0.02 75) 14px, oklch(84% 0.035 68) 14px, oklch(84% 0.035 68) 28px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12.5, color: 'var(--text)', background: 'oklch(97% 0.01 80 / 0.85)', padding: '8px 14px', borderRadius: 8 }}>awaiting generation</span>
            </div>
          )}
          {isGenLoading && <BrandLoader title={T.generate.creatingMessage} subtitle={T.generate.creatingSubMessage} />}
          {isGenError && (
            <div style={{ aspectRatio: '4/3', borderRadius: 16, background: 'oklch(95% 0.03 30)', border: '1px solid oklch(80% 0.06 30)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24, textAlign: 'center' }} role="alert">
              <span style={{ fontSize: 15, fontWeight: 700, color: 'oklch(40% 0.14 30)' }}>{T.generate.errorTitle}</span>
              <span style={{ fontSize: 13, color: 'oklch(35% 0.1 30)', maxWidth: 320 }}>{state.generationError}</span>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Hoverable as="button" type="button" style={ghostBtnStyle} hoverStyle={ghostBtnHoverStyle} onClick={generateDesign}>{T.generate.retry}</Hoverable>
                <Hoverable as="button" type="button" style={ghostBtnStyle} hoverStyle={ghostBtnHoverStyle} onClick={resetGeneration}>{T.generate.resetBtn}</Hoverable>
              </div>
            </div>
          )}
          {isGenDone && (
            <div>
              <ComparisonViewer
                beforeImageUrl={uploadedImage ? uploadedImage.dataUrl : null}
                afterImageUrl={state.generatedImageUrl}
                beforeLabel={T.generate.before}
                afterLabel={T.generate.after}
                versionLabel={T.generate.after + ' \u00b7 v' + genVersion}
                sliderPos={sliderPos}
                onSliderChange={(e) => setSliderPos(Number(e.target.value))}
              />
              <div style={{ fontSize: 11.5, color: 'var(--text-2)', textAlign: 'center', marginTop: 6, fontStyle: 'italic' }}>{T.generate.conceptual}</div>
              <div className="nad-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
                <Hoverable as="button" type="button" style={ghostBtnStyle} hoverStyle={ghostBtnHoverStyle} onClick={regenerate}>{T.generate.regenerate}</Hoverable>
                <Hoverable as="button" type="button" style={ghostBtnStyle} hoverStyle={ghostBtnHoverStyle} onClick={downloadGeneratedImage}>{T.generate.download}</Hoverable>
                <Hoverable as="button" type="button" style={ghostBtnStyle} hoverStyle={ghostBtnHoverStyle} onClick={saveProject}>{T.generate.save}</Hoverable>
                <Hoverable as="button" type="button" style={ghostBtnStyle} hoverStyle={ghostBtnHoverStyle} onClick={resetGeneration}>{T.generate.resetBtn}</Hoverable>
                <a href={whatsappLink} target="_blank" rel="noreferrer" style={{ display: 'block', gridColumn: 'span 2' }}>
                  <Hoverable style={ghostBtnStyle + 'text-align:center;text-decoration:none;box-sizing:border-box;width:100%;'} hoverStyle={ghostBtnHoverStyle}>{T.generate.share}</Hoverable>
                </a>
                <Hoverable as="button" type="button" style={ghostBtnStyle + 'grid-column:span 2;'} hoverStyle={ghostBtnHoverStyle} onClick={buildShareLink}>{state.shareStatus === 'creating' ? T.extras.shareCreating : T.extras.shareBtn}</Hoverable>
                {state.shareStatus === 'ready' && state.shareUrl && (
                  <div style={{ gridColumn: 'span 2', display: 'flex', gap: 6 }}>
                    <input readOnly value={state.shareUrl} onFocus={(e) => e.target.select()} style={{ flex: 1, minWidth: 0, fontSize: 11.5, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
                  </div>
                )}
              </div>
            </div>
          )}
          </>
          )}
          {!compareOn && state.generationHistory && state.generationHistory.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>{T.extras.historyTitle}</div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                {state.generationHistory.map((h, i) => (
                  <button key={i} type="button" onClick={() => viewHistoryEntry(h)} style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', padding: 0, cursor: 'pointer', background: 'none' }} title={T.extras.historyView}>
                    <img src={h.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
