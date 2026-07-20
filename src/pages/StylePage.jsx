import React, { useState } from 'react';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS } from '../data/translations.js';
import StyleSelector from '../components/StyleSelector.jsx';
import StyleQuiz from '../components/StyleQuiz.jsx';
import Hoverable from '../components/Hoverable.jsx';
import JourneyNav from '../components/JourneyNav.jsx';

export default function StylePage({ headFont }) {
  const { state, nextFromStyle, applyQuizStyles, showToast } = useAppState();
  const [quizOpen, setQuizOpen] = useState(false);
  const T = STRINGS[state.lang];
  const canProceedStyle = !!state.selections.stylePrimary;

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
      <JourneyNav backTo="level" onNext={nextFromStyle} nextDisabled={!canProceedStyle} />
    </section>
  );
}
