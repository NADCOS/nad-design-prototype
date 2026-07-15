import React, { useState } from 'react';
import { sx } from '../utils/sx.js';

// Mirrors the prototype's `style` + `style-hover` CSS-string pattern using local hover state.
export default function Hoverable({ as: Tag = 'div', style, hoverStyle, children, onMouseEnter, onMouseLeave, ...rest }) {
  const [hover, setHover] = useState(false);
  const base = sx(style);
  const merged = hover && hoverStyle ? { ...base, ...sx(hoverStyle) } : base;
  return (
    <Tag
      style={merged}
      onMouseEnter={(e) => { setHover(true); if (onMouseEnter) onMouseEnter(e); }}
      onMouseLeave={(e) => { setHover(false); if (onMouseLeave) onMouseLeave(e); }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
