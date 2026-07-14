import React from 'react';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS } from '../data/translations.js';
import Hoverable from './Hoverable.jsx';

// "Book a Consultation" / "Request Professional Consultation" button — requires
// login and shows a confirmation toast (no backend booking system in this prototype).
export default function ConsultationButton({ style, hoverStyle, label }) {
  const { state, requestConsult } = useAppState();
  const T = STRINGS[state.lang];
  return (
    <Hoverable as="button" type="button" style={style} hoverStyle={hoverStyle} onClick={requestConsult}>
      {label || T.summary.consult}
    </Hoverable>
  );
}
