import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState.js';
import { STEP_KEYS } from '../data/navigation.js';
import ProjectProgress from '../components/ProjectProgress.jsx';
import SelectionsRail from '../components/SelectionsRail.jsx';
import MaterialPreviewModal from '../components/MaterialPreviewModal.jsx';
import FurnitureCustomizer from '../components/FurnitureCustomizer.jsx';

// Shared shell for all /design/:step pages: auth + step-unlock guard, the
// progress rail, and the material/furniture modals (which can be triggered
// from the Materials/Furniture steps regardless of which step is active).
export default function DesignJourneyLayout({ step, children }) {
  const navigate = useNavigate();
  const { state } = useAppState();
  const idx = STEP_KEYS.indexOf(step);

  useEffect(() => {
    if (!state.role) { navigate('/login?intent=' + step, { replace: true }); return; }
    if (idx > state.maxStepIndex) { navigate('/design/' + STEP_KEYS[state.maxStepIndex], { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.role, state.maxStepIndex, step]);

  if (!state.role || idx > state.maxStepIndex) return null;

  // Rail only on the selection steps — summary/generate have their own layouts.
  const showRail = step !== 'summary' && step !== 'generate';

  return (
    <div data-screen-label="Journey" className="nad-page" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 28px 60px' }}>
      <ProjectProgress current={step} />
      <div className={showRail ? 'nad-journey-grid' : undefined}>
        <div key={step} style={{ animation: 'nad-fade-up .3s ease both', minWidth: 0 }}>{children}</div>
        {showRail && <SelectionsRail />}
      </div>
      <MaterialPreviewModal />
      <FurnitureCustomizer />
    </div>
  );
}
