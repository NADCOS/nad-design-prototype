// NAD Design — server-side Nano Banana 2 (Gemini 3.1 Flash Image) service.
// This is the ONLY file that talks to Google's Gemini API. GEMINI_API_KEY is
// read here, on the server, and is never sent to the browser.
import { GoogleGenAI } from '@google/genai';

const MODEL = process.env.NANO_BANANA_MODEL || 'gemini-2.5-flash-image';

let client = null;
function getClient() {
  if (client) return client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error('MISSING_API_KEY');
    err.code = 'MISSING_API_KEY';
    throw err;
  }
  client = new GoogleGenAI({ apiKey });
  return client;
}

/**
 * @param {Object} args
 * @param {string} args.prompt - full structured NAD Design prompt
 * @param {string} [args.imageBase64] - raw base64 payload (no data: prefix) of an uploaded room image
 * @param {string} [args.imageMimeType] - mime type of the uploaded image (image/jpeg, image/png, image/webp)
 * @param {string} [args.aspectRatio] - e.g. "16:9"
 * @param {string} [args.imageSize] - "1K" | "2K"
 * @returns {Promise<{ imageDataUrl: string, interactionId: string }>}
 */
export async function generateWithNanoBanana({ prompt, imageBase64, imageMimeType, aspectRatio, imageSize }) {
  const ai = getClient();

  const response_format = {
    type: 'image',
    mime_type: 'image/jpeg',
    aspect_ratio: aspectRatio || '16:9',
    image_size: imageSize || '2K',
  };

  let input = prompt;
  if (imageBase64) {
    // Image-editing mode: preserve the uploaded room's architecture, edit only
    // the selected materials/furniture/lighting per the prompt's instructions.
    input = [
      { type: 'text', text: prompt },
      { type: 'image', mime_type: imageMimeType || 'image/jpeg', data: imageBase64 },
    ];
  }

  const interaction = await ai.interactions.create({
    model: MODEL,
    input,
    response_format,
  });

  const outputImage = interaction && interaction.output_image;
  if (!outputImage || !outputImage.data) {
    const err = new Error('NO_OUTPUT_IMAGE');
    err.code = 'NO_OUTPUT_IMAGE';
    throw err;
  }

  return {
    // Structured so a future version can upload to Supabase Storage and
    // return a URL instead of this base64 data URL — callers only see
    // `imageDataUrl`, so that swap won't require frontend changes.
    imageDataUrl: 'data:image/jpeg;base64,' + outputImage.data,
    interactionId: interaction.id,
  };
}
