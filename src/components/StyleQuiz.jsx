import React, { useState } from 'react';
import { QUIZ_ROUNDS, scoreQuiz } from '../data/styleQuiz.js';
import { STYLES, STYLE_PALETTES } from '../data/styles.js';
import { STRINGS } from '../data/translations.js';
import Hoverable from './Hoverable.jsx';

// "This or that" style quiz: 5 image pairs → suggested primary (+ secondary)
// style. Rendered inline on the Style step for users unsure of their style.
export default function StyleQuiz({ lang, headFont, onApply, onClose }) {
  const [round, setRound] = useState(0);
  const [picks, setPicks] = useState([]);
  const T = STRINGS[lang].quiz;
  const done = round >= QUIZ_ROUNDS.length;
  const result = done ? scoreQuiz(picks) : null;
  const styleByKey = (key) => STYLES.find((s) => s.key === key) || null;

  const pick = (weights) => { setPicks((p) => [...p, weights]); setRound((r) => r + 1); };
  const retake = () => { setPicks([]); setRound(0); };

  const optionCard = (opt, side) => (
    <Hoverable
      key={side}
      as="div"
      role="button"
      tabIndex={0}
      style="flex:1 1 240px;background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease;"
      hoverStyle="transform:translateY(-3px);box-shadow:0 14px 30px -12px oklch(20% 0.02 50 / 0.35);border-color:oklch(64% 0.10 68);"
      onClick={() => pick(opt.weights)}
      onKeyDown={(e) => e.key === 'Enter' && pick(opt.weights)}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + opt.imgs.length + ',1fr)', gap: 2, height: 170 }}>
        {opt.imgs.map((src, i) => (
          <div key={i} style={{ background: 'url("' + src + '") center / cover no-repeat' }} aria-hidden="true" />
        ))}
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{opt.label[lang]}</span>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'oklch(46% 0.09 60)', whiteSpace: 'nowrap' }}>{T.pickThis}</span>
      </div>
    </Hoverable>
  );

  return (
    <div style={{ background: 'oklch(94% 0.02 78)', border: '1px solid var(--border)', borderRadius: 18, padding: 26, marginBottom: 30 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: headFont, fontSize: 21, color: 'var(--text)', fontWeight: 500 }}>{done ? T.resultTitle : T.title}</div>
          {!done && <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>{T.progress.replace('{n}', String(round + 1)).replace('{total}', String(QUIZ_ROUNDS.length))}</div>}
        </div>
        <button type="button" onClick={onClose} style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, whiteSpace: 'nowrap' }}>{T.close}</button>
      </div>

      {!done && (
        <>
          <div style={{ display: 'flex', gap: 6, marginBottom: 18 }} aria-hidden="true">
            {QUIZ_ROUNDS.map((_, i) => (
              <span key={i} style={{ flex: 1, height: 4, borderRadius: 100, background: i < round ? 'oklch(64% 0.10 68)' : i === round ? 'oklch(46% 0.09 60)' : 'var(--border)' }} />
            ))}
          </div>
          <div style={{ fontSize: 16.5, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>{QUIZ_ROUNDS[round].q[lang]}</div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {optionCard(QUIZ_ROUNDS[round].a, 'a')}
            {optionCard(QUIZ_ROUNDS[round].b, 'b')}
          </div>
        </>
      )}

      {done && result && (() => {
        const primary = styleByKey(result.primary);
        const secondary = styleByKey(result.secondary);
        const palette = STYLE_PALETTES[result.primary] || STYLE_PALETTES.modern;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 26, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 260px' }}>
              <div style={{ fontFamily: headFont, fontSize: 28, color: 'var(--text)', marginBottom: 6 }}>
                {primary ? primary[lang] : ''}
                {secondary && <span style={{ fontSize: 16, color: 'var(--text-2)' }}> {T.withTouch} {secondary[lang]}</span>}
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--text-2)', marginBottom: 14 }}>{T.resultSub}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {palette.map((c, i) => <span key={i} style={{ width: 30, height: 30, borderRadius: 8, background: c, border: '1px solid var(--border)', display: 'inline-block' }} aria-hidden="true" />)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Hoverable as="button" type="button" style="font-size:14px;font-weight:600;color:var(--btn-text);background:var(--btn-bg);border:none;padding:13px 26px;border-radius:100px;cursor:pointer;transition:transform .18s ease,filter .18s ease;" hoverStyle="transform:translateY(-2px);filter:brightness(1.08);" onClick={() => onApply(result.primary, result.secondary)}>{T.apply}</Hoverable>
              <Hoverable as="button" type="button" style="font-size:13.5px;font-weight:600;color:var(--text);background:transparent;border:1px solid var(--border);padding:13px 22px;border-radius:100px;cursor:pointer;transition:transform .18s ease,background .18s ease;" hoverStyle="transform:translateY(-2px);background:var(--border);" onClick={retake}>{T.retake}</Hoverable>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
