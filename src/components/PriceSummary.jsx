import React, { useRef, useState, useEffect } from 'react';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS, fmtSar } from '../data/translations.js';
import { useCountUp } from '../hooks/useCountUp.js';
import Hoverable from './Hoverable.jsx';

// Summary step — sticky cost-breakdown card (right column) with the Generate CTA,
// WhatsApp share, and consultation request.
export default function PriceSummary() {
  const { state, computeCost, goGenerate, buildWhatsAppLink, requestConsult, printCostBreakdown, buildShareLink } = useAppState();
  const lang = state.lang;
  const T = STRINGS[lang];
  const cost = computeCost();
  const [copied, setCopied] = useState(false);
  const copyShareLink = () => {
    if (!state.shareUrl || !navigator.clipboard) return;
    navigator.clipboard.writeText(state.shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {});
  };
  const animatedTotal = useCountUp(cost.total);
  const prevTotal = useRef(cost.total);
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    if (prevTotal.current !== cost.total) {
      setPulse(true);
      prevTotal.current = cost.total;
      const t = setTimeout(() => setPulse(false), 500);
      return () => clearTimeout(t);
    }
  }, [cost.total]);
  const costFmt = {
    perSqm: fmtSar(cost.perSqm, lang), materials: fmtSar(cost.materialsAddon, lang), furniture: fmtSar(cost.furnitureCost, lang),
    lighting: fmtSar(cost.lightingCost, lang), installation: fmtSar(cost.installation, lang), designFee: fmtSar(cost.designFee, lang), total: fmtSar(animatedTotal, lang),
  };
  const whatsappLink = buildWhatsAppLink();

  return (
    <div style={{ background: 'oklch(22% 0.02 50)', borderRadius: 16, padding: 26, color: 'oklch(96% 0.01 80)', height: 'fit-content', position: 'sticky', top: 90 }}>
      <div style={{ fontFamily: "'Century Gothic', 'Futura', sans-serif", fontSize: 19, marginBottom: 18 }}>{T.summary.costBreakdown}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, padding: '9px 0', borderBottom: '1px solid oklch(40% 0.02 55)' }}><span>{T.summary.perSqm}</span><span>{costFmt.perSqm}</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, padding: '9px 0', borderBottom: '1px solid oklch(40% 0.02 55)' }}><span>{T.summary.materialsCost}</span><span>{costFmt.materials}</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, padding: '9px 0', borderBottom: '1px solid oklch(40% 0.02 55)' }}><span>{T.summary.furnitureCost}</span><span>{costFmt.furniture}</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, padding: '9px 0', borderBottom: '1px solid oklch(40% 0.02 55)' }}><span>{T.summary.lightingCost}</span><span>{costFmt.lighting}</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, padding: '9px 0', borderBottom: '1px solid oklch(40% 0.02 55)' }}><span>{T.summary.installationCost}</span><span>{costFmt.installation}</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, padding: '9px 0', borderBottom: '1px solid oklch(40% 0.02 55)' }}><span>{T.summary.designFee}</span><span>{costFmt.designFee}</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16.5, fontWeight: 700, padding: '16px 0 6px', color: 'oklch(72% 0.10 68)' }}><span>{T.summary.total}</span><span style={pulse ? { animation: 'nad-pulse-total .5s ease' } : undefined}>{costFmt.total}</span></div>
      <div style={{ fontSize: 11.5, color: 'oklch(70% 0.01 80)', lineHeight: 1.5, marginTop: 10 }}>{T.summary.disclaimer}</div>
      <Hoverable as="button" type="button" style="width:100%;margin-top:20px;padding:15px;border-radius:100px;border:none;background:oklch(64% 0.10 68);color:oklch(16% 0.02 50);font-weight:700;font-size:14.5px;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;" hoverStyle="transform:translateY(-2px);box-shadow:0 10px 24px -8px oklch(0% 0 0 / 0.4);filter:brightness(1.08);" onClick={goGenerate}>{T.summary.generateCta}</Hoverable>
      <a href={whatsappLink} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
        <Hoverable style="display:block;text-align:center;width:100%;margin-top:10px;padding:13px;border-radius:100px;border:1px solid oklch(45% 0.02 55);color:oklch(96% 0.01 80);font-weight:600;font-size:13px;text-decoration:none;box-sizing:border-box;transition:transform .18s ease,background .18s ease;" hoverStyle="transform:translateY(-2px);background:oklch(30% 0.02 55);">{T.summary.whatsapp}</Hoverable>
      </a>
      <Hoverable as="button" type="button" style="width:100%;margin-top:10px;padding:13px;border-radius:100px;border:1px solid oklch(45% 0.02 55);background:transparent;color:oklch(96% 0.01 80);font-weight:600;font-size:13px;cursor:pointer;transition:transform .18s ease,background .18s ease;" hoverStyle="transform:translateY(-2px);background:oklch(30% 0.02 55);" onClick={requestConsult}>{T.summary.consult}</Hoverable>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
        <Hoverable as="button" type="button" style="padding:12px;border-radius:100px;border:1px solid oklch(45% 0.02 55);background:transparent;color:oklch(96% 0.01 80);font-weight:600;font-size:12.5px;cursor:pointer;transition:transform .18s ease,background .18s ease;" hoverStyle="transform:translateY(-2px);background:oklch(30% 0.02 55);" onClick={printCostBreakdown}>{T.extras.pdfBtn}</Hoverable>
        <Hoverable as="button" type="button" style="padding:12px;border-radius:100px;border:1px solid oklch(45% 0.02 55);background:transparent;color:oklch(96% 0.01 80);font-weight:600;font-size:12.5px;cursor:pointer;transition:transform .18s ease,background .18s ease;" hoverStyle="transform:translateY(-2px);background:oklch(30% 0.02 55);" onClick={buildShareLink}>{state.shareStatus === 'creating' ? T.extras.shareCreating : T.extras.shareBtn}</Hoverable>
      </div>
      {state.shareStatus === 'ready' && state.shareUrl && (
        <div style={{ marginTop: 10, background: 'oklch(28% 0.02 55)', border: '1px solid oklch(42% 0.02 55)', borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 11, color: 'oklch(78% 0.02 70)', marginBottom: 8 }}>{T.extras.shareDesc}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input readOnly value={state.shareUrl} onFocus={(e) => e.target.select()} style={{ flex: 1, minWidth: 0, fontSize: 11.5, padding: '8px 10px', borderRadius: 8, border: '1px solid oklch(42% 0.02 55)', background: 'oklch(20% 0.02 50)', color: '#fff' }} />
            <button type="button" onClick={copyShareLink} style={{ fontSize: 11.5, fontWeight: 700, padding: '8px 14px', borderRadius: 8, border: 'none', background: 'oklch(64% 0.10 68)', color: 'oklch(16% 0.02 50)', cursor: 'pointer', whiteSpace: 'nowrap' }}>{copied ? T.extras.shareCopied : T.extras.shareCopy}</button>
          </div>
        </div>
      )}
    </div>
  );
}
