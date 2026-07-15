import React, { useState, useRef, useEffect } from 'react';
import { sx } from '../utils/sx.js';

// Lightweight stand-in for the prototype's <image-slot> web component:
// a drag-and-drop / click-to-browse image placeholder that persists to
// localStorage under its `id`, with an optional `src` prefill.
export default function ImageSlot({ id, src, placeholder, style }) {
  const storageKey = 'nad_slot_' + id;
  const [dataUrl, setDataUrl] = useState(() => {
    try {
      return localStorage.getItem(storageKey) || src || '';
    } catch (e) {
      return src || '';
    }
  });
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const prevSrcRef = useRef(src);

  // Keep this in sync when `src` changes after a fresh save (e.g. a new
  // Supabase-hosted image URL from the admin edit modal) — otherwise this
  // component's local state would keep showing whatever it first mounted with.
  useEffect(() => {
    if (src !== prevSrcRef.current) {
      prevSrcRef.current = src;
      if (src) {
        setDataUrl(src);
        try { localStorage.setItem(storageKey, src); } catch (e) {}
      }
    }
  }, [src, storageKey]);

  const readFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target.result;
      setDataUrl(url);
      try { localStorage.setItem(storageKey, url); } catch (err) {}
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: 'oklch(90% 0.02 75)', ...sx(style) }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); readFile(e.dataTransfer.files && e.dataTransfer.files[0]); }}
      onClick={() => inputRef.current && inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => readFile(e.target.files && e.target.files[0])}
      />
      {dataUrl ? (
        <img src={dataUrl} alt={placeholder || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <div
          style={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: 10, fontSize: 11.5, lineHeight: 1.4, color: 'oklch(48% 0.02 60)',
            background: dragOver ? 'oklch(85% 0.03 75)' : 'repeating-linear-gradient(135deg, oklch(92% 0.015 78) 0px, oklch(92% 0.015 78) 10px, oklch(87% 0.02 72) 10px, oklch(87% 0.02 72) 20px)',
            cursor: 'pointer'
          }}
        >
          {placeholder || 'Drop an image or click to browse'}
        </div>
      )}
    </div>
  );
}
