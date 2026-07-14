import React, { useState } from 'react';
import { sx } from '../utils/sx.js';

// Mirrors the prototype's `style` + `style-hover` CSS-string pattern using local hover state.
export default function Hoverable({ as: Tag = 'div', style, hoverStyle, children, ...rest }) {
  const [hover, setHover] = useState(false);
  const base = sx(style);
  const merged = hover && hoverStyle ? { ...base, ...sx(hoverStyle) } : base;
  return (
    <Tag style={merged} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} {...rest}>
      {children}
    </Tag>
  );
}
