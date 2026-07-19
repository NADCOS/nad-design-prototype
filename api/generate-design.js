// NAD Design — POST /api/generate-design
// Secure Vercel serverless function: validates the request, calls Nano Banana
// (Gemini 3.1 Flash Image) via api/_lib/nanoBanana.js, and returns a plain
// JSON result. GEMINI_API_KEY never leaves this file.
import { generateWithNanoBanana } from './_lib/nanoBanana.js';
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js';

const MAX_PROMPT_LENGTH = 6000;
// Per-guest daily cap, enforced server-side against the generation_logs table
// so it can't be bypassed by refreshing the page or clearing sessionStorage
// (unlike the client-side per-session counter in nanoBananaClient.js).
const DAILY_LIMIT_PER_GUEST = Number(process.env.GENERATION_DAILY_LIMIT) || 5;
const MAX_UPLOAD_BYTES = 7 * 1024 * 1024; // 7MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VALID_ASPECT_RATIOS = ['16:9', '4:3', '1:1', '9:16', '3:2'];
const VALID_IMAGE_SIZES = ['1K', '2K'];

function isValidBase64(str) {
  if (!str || typeof str !== 'string') return false;
  return /^[A-Za-z0-9+/]+={0,2}$/.test(str) && str.length % 4 === 0;
}

function base64ByteLength(str) {
  const padding = (str.endsWith('==') && 2) || (str.endsWith('=') && 1) || 0;
  return Math.floor((str.length * 3) / 4) - padding;
}

function safeError(message, status) {
  return { status, body: { success: false, error: message } };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    const { status, body } = safeError('Only POST requests are supported.', 405);
    res.status(status).json(body);
    return;
  }

  let payload = req.body;
  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload); } catch (e) { payload = null; }
  }
  if (!payload || typeof payload !== 'object') {
    const { status, body } = safeError('Invalid request body.', 400);
    res.status(status).json(body);
    return;
  }

  const { prompt, imageBase64, imageMimeType, aspectRatio, imageSize, guestIdentifier } = payload;

  // ---- validation ----
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    const { status, body } = safeError('A design prompt is required.', 400);
    res.status(status).json(body);
    return;
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    const { status, body } = safeError('The prompt is too long.', 400);
    res.status(status).json(body);
    return;
  }
  const finalAspectRatio = VALID_ASPECT_RATIOS.includes(aspectRatio) ? aspectRatio : '16:9';
  const finalImageSize = VALID_IMAGE_SIZES.includes(imageSize) ? imageSize : '2K';

  if (imageBase64 !== undefined && imageBase64 !== null) {
    if (typeof imageBase64 !== 'string' || !isValidBase64(imageBase64)) {
      const { status, body } = safeError('The uploaded image data is invalid.', 400);
      res.status(status).json(body);
      return;
    }
    if (base64ByteLength(imageBase64) > MAX_UPLOAD_BYTES) {
      const { status, body } = safeError('The uploaded image is too large (7MB max).', 400);
      res.status(status).json(body);
      return;
    }
    if (imageMimeType && !ALLOWED_MIME_TYPES.includes(imageMimeType)) {
      const { status, body } = safeError('Unsupported image type. Please use JPEG, PNG, or WebP.', 400);
      res.status(status).json(body);
      return;
    }
  }

  // ---- per-guest daily cap (admins send no guestIdentifier and are unlimited) ----
  const identifier = typeof guestIdentifier === 'string' ? guestIdentifier.trim().toLowerCase() : '';
  const supabaseAdmin = identifier ? getSupabaseAdmin() : null;
  if (identifier && supabaseAdmin) {
    try {
      const since = new Date();
      since.setUTCHours(0, 0, 0, 0);
      const { count, error: countError } = await supabaseAdmin
        .from('generation_logs')
        .select('id', { count: 'exact', head: true })
        .eq('identifier', identifier)
        .gte('created_at', since.toISOString());
      if (!countError && typeof count === 'number' && count >= DAILY_LIMIT_PER_GUEST) {
        res.status(429).json({ success: false, error: `You\u2019ve reached today\u2019s design generation limit (${DAILY_LIMIT_PER_GUEST}). Please try again tomorrow or contact NAD Design for more.` });
        return;
      }
    } catch (e) {
      // Fail open — don't block generation if the quota check itself errors.
      console.error('[generate-design] quota check failed:', e);
    }
  }

  // ---- generate ----
  try {
    const result = await generateWithNanoBanana({
      prompt,
      imageBase64: imageBase64 || undefined,
      imageMimeType: imageMimeType || 'image/jpeg',
      aspectRatio: finalAspectRatio,
      imageSize: finalImageSize,
    });
    if (identifier && supabaseAdmin) {
      supabaseAdmin.from('generation_logs').insert({ identifier }).then(({ error: insertError }) => {
        if (insertError) console.error('[generate-design] failed to log generation:', insertError);
      });
    }
    res.status(200).json({
      success: true,
      image: result.imageDataUrl,
      interactionId: result.interactionId,
    });
  } catch (err) {
    const code = err && err.code;
    let status = 500;
    let message = 'The design could not be generated at this time. Please try again or reduce the uploaded image size.';

    if (code === 'MISSING_API_KEY') {
      status = 500;
      message = 'The AI design generator is not configured yet. Please contact NAD Design.';
    } else if (code === 'NO_OUTPUT_IMAGE') {
      status = 502;
      message = 'The AI generator did not return an image. Please try again.';
    } else {
      const msg = String((err && err.message) || '');
      if (/quota|rate.?limit|429/i.test(msg)) {
        status = 429;
        message = 'Too many requests right now. Please wait a moment and try again.';
      } else if (/safety|blocked|policy/i.test(msg)) {
        status = 400;
        message = 'This request was blocked by the AI provider\u2019s safety filters. Please adjust your selections or notes and try again.';
      } else if (/timeout|network|fetch failed/i.test(msg)) {
        status = 502;
        message = 'The AI design generator timed out. Please try again.';
      } else if (/billing/i.test(msg)) {
        status = 502;
        message = 'The AI design generator is temporarily unavailable. Please try again shortly.';
      }
    }

    // Never leak stack traces, the API key, or raw provider errors to the client.
    console.error('[generate-design] generation failed:', code || err);
    res.status(status).json({ success: false, error: message });
  }
}
