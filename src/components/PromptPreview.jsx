import React from 'react';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS } from '../data/translations.js';

// Generate step — editable structured-prompt textarea with a "reset to
// auto-generated" link once the client has edited it.
export default function PromptPreview() {
  const { state, getAutoPrompt, setPromptDraft, resetPromptToAuto } = useAppState();
  const T = STRINGS[state.lang];
  const autoPromptText = getAutoPrompt();
  const promptText = (state.promptDraft !== null && state.promptDraft !== undefined) ? state.promptDraft : autoPromptText;
  const isPromptEdited = state.promptDraft !== null && state.promptDraft !== undefined && state.promptDraft !== autoPromptText;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <label htmlFor="nad-prompt-textarea" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>{T.generate.promptTitle}</label>
        {isPromptEdited && <button type="button" onClick={resetPromptToAuto} style={{ fontSize: 11.5, fontWeight: 600, color: 'oklch(46% 0.09 60)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>{T.generate.resetPrompt}</button>}
      </div>
      <textarea
        id="nad-prompt-textarea"
        value={promptText}
        onChange={setPromptDraft}
        rows={12}
        aria-label={T.generate.promptTitle}
        style={{ width: '100%', boxSizing: 'border-box', whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace,monospace', fontSize: 12.5, lineHeight: 1.7, color: 'var(--text)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, margin: '0 0 8px', resize: 'vertical' }}
      />
      <div style={{ fontSize: 11.5, color: 'var(--text-2)', margin: '0 0 22px' }}>{T.generate.editPromptHint}</div>
    </>
  );
}
