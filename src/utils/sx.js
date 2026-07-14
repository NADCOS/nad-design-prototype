// Tiny helper: turns a CSS-string (as used throughout the original prototype)
// into a React style object, so style strings can be ported almost verbatim.
// Also accepts an already-built object and passes it through.
const cache = new Map();

export function sx(str) {
  if (!str) return undefined;
  if (typeof str === 'object') return str;
  if (cache.has(str)) return cache.get(str);
  const obj = {};
  str.split(';').forEach((decl) => {
    const idx = decl.indexOf(':');
    if (idx === -1) return;
    const rawKey = decl.slice(0, idx).trim();
    const rawVal = decl.slice(idx + 1).trim();
    if (!rawKey || !rawVal) return;
    const key = rawKey.startsWith('--')
      ? rawKey
      : rawKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    obj[key] = rawVal;
  });
  cache.set(str, obj);
  return obj;
}

// Merge a base style string/object with a hover style string/object,
// returning [baseStyleObj, mergedHoverStyleObj] for use with onMouseEnter/Leave.
export function withHover(base, hover) {
  return { base: sx(base), hover: hover ? { ...sx(base), ...sx(hover) } : sx(base) };
}
