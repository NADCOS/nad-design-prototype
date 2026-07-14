// NAD Design — small helpers for turning uploaded files into the base64 shape
// the Nano Banana (Gemini) API expects, and back again.

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Could not read the selected file.'));
    reader.readAsDataURL(file);
  });
}

// Gemini wants the raw base64 payload only — "ABC123", not "data:image/jpeg;base64,ABC123".
export function stripDataUrlPrefix(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return dataUrl;
  const idx = dataUrl.indexOf('base64,');
  return idx === -1 ? dataUrl : dataUrl.slice(idx + 7);
}

export function extractMimeType(dataUrl, fallback) {
  if (!dataUrl || typeof dataUrl !== 'string') return fallback || 'image/jpeg';
  const m = dataUrl.match(/^data:([^;]+);base64,/);
  return m ? m[1] : (fallback || 'image/jpeg');
}

export function isValidBase64(str) {
  if (!str || typeof str !== 'string') return false;
  return /^[A-Za-z0-9+/]+={0,2}$/.test(str) && str.length % 4 === 0;
}
