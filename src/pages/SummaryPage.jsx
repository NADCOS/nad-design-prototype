import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS } from '../data/translations.js';
import DesignSummary from '../components/DesignSummary.jsx';
import PriceSummary from '../components/PriceSummary.jsx';
import Hoverable from '../components/Hoverable.jsx';

export default function SummaryPage() {
  const navigate = useNavigate();
  const { state } = useAppState();
  const T = STRINGS[state.lang];

  return (
    <section data-screen-label="Design Summary">
      <h1 style={{ fontFamily: 'var(--head-font)', fontSize: 34, color: 'var(--text)', margin: '0 0 8px', fontWeight: 500 }}>{T.summary.title}</h1>
      <p style={{ fontSize: 15, color: 'var(--text-2)', margin: '0 0 28px' }}>{T.summary.sub}</p>
      <div className="nad-grid-split" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20 }}>
        <DesignSummary />
        <PriceSummary />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 30 }}>
        <Hoverable as="button" type="button" style="font-size:14px;font-weight:600;color:var(--text);background:transparent;border:1px solid var(--border);padding:13px 26px;border-radius:100px;cursor:pointer;transition:transform .18s ease,background .18s ease;" hoverStyle="transform:translateY(-2px);background:var(--border);" onClick={() => navigate('/design/upload')}>{T.common.back}</Hoverable>
      </div>
    </section>
  );
}
