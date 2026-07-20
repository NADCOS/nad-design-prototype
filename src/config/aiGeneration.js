// NAD Design — configurable Nano Banana 2 (Gemini 3.1 Flash Image) generation
// settings + prototype usage limits. Keep all tunables here so the rest of the
// app never hardcodes them.

export const AI_GENERATION_CONFIG = {
  model: 'gemini-3.1-flash-image',

  defaultAspectRatio: '16:9',
  defaultImageSize: '2K',

  aspectRatios: [
    { key: '16:9', en: 'Landscape — interior / exterior', ar: 'أفقي — داخلي / خارجي' },
    { key: '4:3', en: 'Standard architectural view', ar: 'منظور معماري قياسي' },
    { key: '1:1', en: 'Material / furniture preview', ar: 'معاينة خامة أو أثاث' },
    { key: '9:16', en: 'Mobile / social media', ar: 'جوال / وسائل التواصل' },
    { key: '3:2', en: 'Architectural photography', ar: 'تصوير معماري' },
  ],

  imageSizes: [
    { key: '1K', en: '1K Preview', ar: 'معاينة 1K' },
    { key: '2K', en: '2K Presentation', ar: 'عرض تقديمي 2K' },
  ],

  // Request validation
  maxPromptLength: 6000,
  maxUploadBytes: 7 * 1024 * 1024, // 7MB
  allowedImageMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],

  // Prototype usage limits (client-side, per browser session — see nanoBananaClient.js)
  maxGenerationsPerSession: 10,
  cooldownMs: 8000,
};

// ---------------------------------------------------------------------------
// Placeholders for future production hardening — not implemented in this
// prototype, listed here so the next engineer knows where they plug in:
//
// - Supabase user authentication (replace session-only limits with per-user)
// - Per-client generation credits / paid generation packages
// - Admin generation logs + project-level usage tracking (Supabase table)
// - Uploading generated images to Supabase Storage instead of returning base64
// - Server-side rate limiting / abuse protection (e.g. Vercel Edge Config, KV)
// ---------------------------------------------------------------------------
