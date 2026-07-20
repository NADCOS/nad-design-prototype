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

// Loads any image URL (remote or data:) and returns a downscaled JPEG data URL,
// keeping furniture/lighting reference payloads small for /api/generate-design.
export function urlToResizedJpegDataUrl(url, maxDim = 768, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!String(url).startsWith('data:')) img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const scale = Math.min(1, maxDim / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
        const w = Math.max(1, Math.round((img.naturalWidth || 1) * scale));
        const h = Math.max(1, Math.round((img.naturalHeight || 1) * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); // flatten PNG transparency
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (e) { reject(e); }
    };
    img.onerror = () => reject(new Error('Could not load reference image.'));
    img.src = url;
  });
}
