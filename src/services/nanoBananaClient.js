// NAD Design — frontend client for the secure /api/generate-design endpoint.
// The React app NEVER talks to Google Gemini directly and never sees an API key.
import { AI_GENERATION_CONFIG } from '../config/aiGeneration.js';
import { stripDataUrlPrefix, extractMimeType } from '../utils/imageToBase64.js';

let activeRequest = null; // in-flight guard — prevents duplicate/parallel requests
let lastGenerationAt = 0;

const SESSION_KEY = 'nad_ai_gen_count';

function readSessionCount() {
  try { return Number(sessionStorage.getItem(SESSION_KEY) || '0'); } catch (e) { return 0; }
}
function writeSessionCount(n) {
  try { sessionStorage.setItem(SESSION_KEY, String(n)); } catch (e) {}
}

export function getRemainingGenerations() {
  return Math.max(0, AI_GENERATION_CONFIG.maxGenerationsPerSession - readSessionCount());
}

function mapStatusToMessage(status) {
  if (status === 400) return 'The request was invalid. Please check your prompt and image, then try again.';
  if (status === 405) return 'Unsupported request method.';
  if (status === 429) return 'Too many generation requests. Please wait a moment and try again.';
  if (status === 502) return 'The AI design generator is temporarily unavailable. Please try again shortly.';
  return 'The design could not be generated at this time. Please try again or reduce the uploaded image size.';
}

/**
 * @param {Object} args
 * @param {string} args.prompt
 * @param {string} [args.imageDataUrl] - full data URL of an uploaded room photo
 * @param {string} [args.aspectRatio] - e.g. "16:9"
 * @param {string} [args.imageSize] - "1K" | "2K"
 * @param {string} [args.projectId]
 * @returns {Promise<{ success: boolean, image?: string, interactionId?: string, error?: string }>}
 */
export async function generateDesign({ prompt, imageDataUrl, aspectRatio, imageSize, projectId }) {
  if (activeRequest) {
    return { success: false, error: 'A design is already being generated. Please wait for it to finish.' };
  }

  const trimmedPrompt = (prompt || '').trim();
  if (!trimmedPrompt) {
    return { success: false, error: 'Please enter a design prompt before generating.' };
  }
  if (trimmedPrompt.length > AI_GENERATION_CONFIG.maxPromptLength) {
    return { success: false, error: 'The prompt is too long. Please shorten your notes and try again.' };
  }

  const remaining = getRemainingGenerations();
  if (remaining <= 0) {
    return { success: false, error: `You\u2019ve reached the ${AI_GENERATION_CONFIG.maxGenerationsPerSession}-generation limit for this prototype session. Please refresh or contact NAD Design for more.` };
  }
  const now = Date.now();
  if (now - lastGenerationAt < AI_GENERATION_CONFIG.cooldownMs) {
    return { success: false, error: 'Please wait a few seconds before generating again.' };
  }

  const body = {
    prompt: trimmedPrompt,
    aspectRatio: aspectRatio || AI_GENERATION_CONFIG.defaultAspectRatio,
    imageSize: imageSize || AI_GENERATION_CONFIG.defaultImageSize,
    projectId: projectId || null,
  };
  if (imageDataUrl) {
    const mime = extractMimeType(imageDataUrl, 'image/jpeg');
    if (!AI_GENERATION_CONFIG.allowedImageMimeTypes.includes(mime)) {
      return { success: false, error: 'Unsupported image type. Please use JPEG, PNG, or WebP.' };
    }
    body.imageBase64 = stripDataUrlPrefix(imageDataUrl);
    body.imageMimeType = mime;
  }

  const requestPromise = fetch('/api/generate-design', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  activeRequest = requestPromise;

  try {
    const res = await requestPromise;
    let data = null;
    try { data = await res.json(); } catch (e) { /* fall through to status mapping */ }

    if (!res.ok || !data || !data.success) {
      const message = (data && data.error) || mapStatusToMessage(res.status);
      return { success: false, error: message };
    }

    lastGenerationAt = Date.now();
    writeSessionCount(readSessionCount() + 1);
    return { success: true, image: data.image, interactionId: data.interactionId };
  } catch (e) {
    return { success: false, error: 'A network error interrupted the design generation. Please check your connection and try again.' };
  } finally {
    activeRequest = null;
  }
}
