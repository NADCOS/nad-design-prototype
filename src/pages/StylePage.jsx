import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS } from '../data/translations.js';
import StyleSelector from '../components/StyleSelector.jsx';
import StyleQuiz from '../components/StyleQuiz.jsx';
import Hoverable from '../components/Hoverable.jsx';

export default function StylePage({ headFont }) {
  const navigate = useNavigate();
  const { state, nextFromStyle, applyQuizStyles, showToast } = useAppState();
  const [quizOpen, setQuizOpen] = useState(false);
  const T = STRINGS[state.lang];
  const canProceedStyle = !!state.selections.stylePrimary;
  const btn = (enabled) => 'font-size:14.5px;font-weight:600;color:var(--btn-text);background:' + (enabled ? 'var(--btn-bg)' : 'var(--border)') + ';border:none;padding:14px 30px;border-radius:100px;cursor:' + (enabled ? 'pointer' : 'not-allowed') + ';transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;';
  const btnHover = (enabled) => (enabled ? 'transform:translateY(-2px);box-shadow:0 10px 22px -8px oklch(20% 0.02 50 / 0.4);filter:brightness(1.08);' : '');

  return (
    <section data-screen-label="Design Style">
      <h1 style={{ fontFamily: headFont, fontSize: 34, color: 'var(--text)', margin: '0 0 8px', fontWeight: 500 }}>{T.style.title}</h1>
      <p style={{ fontSize: 15, color: 'var(--text-2)', margin: '0 0 26px' }}>{T.style.sub}</p>
      {!quizOpen && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', background: 'oklch(94% 0.02 78)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', marginBottom: 26 }}>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text)' }}>{T.quiz.bannerTitle}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 3 }}>{T.quiz.bannerSub}</div>
          </div>
          <Hoverable as="button" type="button" style="font-size:13.5px;font-weight:600;color:var(--btn-text);background:var(--btn-bg);border:none;padding:12px 22px;border-radius:100px;cursor:pointer;white-space:nowrap;transition:transform .18s ease,filter .18s ease;" hoverStyle="transform:translateY(-2px);filter:brightness(1.08);" onClick={() => setQuizOpen(true)}>{T.quiz.bannerCta}</Hoverable>
        </div>
      )}
      {quizOpen && (
        <StyleQuiz
          lang={state.lang}
          headFont={headFont}
          onClose={() => setQuizOpen(false)}
          onApply={(primaryKey, secondaryKey) => { applyQuizStyles(primaryKey, secondaryKey); setQuizOpen(false); showToast(T.quiz.appliedToast); }}
        />
      )}
      <StyleSelector headFont={headFont} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36 }}>
        <Hoverable as="button" type="button" style="font-size:14px;font-weight:600;color:var(--text);background:transparent;border:1px solid var(--border);padding:13px 26px;border-radius:100px;cursor:pointer;transition:transform .18s ease,background .18s ease;" hoverStyle="transform:translateY(-2px);background:var(--border);" onClick={() => navigate('/design/level')}>{T.common.back}</Hoverable>
        <Hoverable as="button" type="button" disabled={!canProceedStyle} style={btn(canProceedStyle)} hoverStyle={btnHover(canProceedStyle)} onClick={nextFromStyle}>{T.common.next}</Hoverable>
      </div>
    </section>
  );
}
