// NAD Design — server-side EvoLink image service (nano-banana-beta =
// Gemini 2.5 Flash Image). This is the ONLY file that talks to EvoLink.
// EVOLINK_API_KEY is read here, on the server, and never sent to the browser.
import { getSupabaseAdmin } from './supabaseAdmin.js';

const BASE_URL = process.env.EVOLINK_BASE_URL || 'https://api.evolink.ai';
const MODEL = process.env.EVOLINK_MODEL || 'nano-banana-beta';
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 100000; // keep under the function's maxDuration

export function evolinkConfigured() {
  return Boolean(process.env.EVOLINK_API_KEY);
}

function fail(code, message) {
  const err = new Error(message || code);
  err.code = code;
  return err;
}

// EvoLink's image_urls must be server-fetchable URLs (no base64 payloads), so
// the client's uploaded room photo is stashed in a private Supabase Storage
// bucket and handed to EvoLink as a short-lived signed URL.
async function uploadInputImage(imageBase64, mimeType) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw fail('IMAGE_UPLOAD_UNAVAILABLE', 'Supabase Storage is required to pass uploaded images to EvoLink.');
  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const path = `inputs/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = Buffer.from(imageBase64, 'base64');
  const bucket = supabase.storage.from(process.env.EVOLINK_INPUT_BUCKET || 'generation-inputs');
  const { error: upErr } = await bucket.upload(path, bytes, { contentType: mimeType, upsert: false });
  if (upErr) throw fail('IMAGE_UPLOAD_FAILED', 'IMAGE_UPLOAD_FAILED: ' + upErr.message);
  const { data, error: signErr } = await bucket.createSignedUrl(path, 3600);
  if (signErr || !data || !data.signedUrl) throw fail('IMAGE_UPLOAD_FAILED', 'IMAGE_UPLOAD_FAILED: could not sign URL');
  return data.signedUrl;
}

// Task result schemas vary slightly across EvoLink models — check common shapes.
function findImageUrl(task) {
  const pools = [task.results, task.data, task.output, task.images, task.image_urls, task.result && task.result.urls, task.result && task.result.images];
  for (const pool of pools) {
    const list = Array.isArray(pool) ? pool : pool ? [pool] : [];
    for (const c of list) {
      if (typeof c === 'string' && /^https?:\/\//.test(c)) return c;
      if (c && typeof c === 'object' && typeof c.url === 'string') return c.url;
    }
  }
  return typeof task.url === 'string' ? task.url : null;
}

/**
 * Same contract as generateWithNanoBanana: resolves { imageDataUrl, interactionId }.
 * @param {Object} args
 * @param {string} args.prompt
 * @param {string} [args.imageBase64] - raw base64 (no data: prefix)
 * @param {string} [args.imageMimeType]
 * @param {string} [args.aspectRatio] - "16:9" | "4:3" | "1:1" | "9:16" | "3:2"
 */
export async function generateWithEvoLink({ prompt, imageBase64, imageMimeType, aspectRatio }) {
  const apiKey = process.env.EVOLINK_API_KEY;
  if (!apiKey) throw fail('MISSING_API_KEY');
  const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

  const body = { model: MODEL, prompt, size: aspectRatio || '16:9' };
  if (imageBase64) {
    body.image_urls = [await uploadInputImage(imageBase64, imageMimeType || 'image/jpeg')];
  }

  const createRes = await fetch(`${BASE_URL}/v1/images/generations`, {
    method: 'POST', headers, body: JSON.stringify(body),
  });
  const created = await createRes.json().catch(() => null);
  if (!createRes.ok || !created || !created.id) {
    const detail = (created && ((created.error && created.error.message) || created.message || created.error)) || `HTTP ${createRes.status}`;
    throw new Error(`EVOLINK_CREATE_FAILED (${createRes.status === 429 ? 'rate limit 429' : detail})`);
  }

  // Async task: poll /v1/tasks/{id} until it completes.
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let task = created;
  while (!['completed', 'succeeded', 'success'].includes(task.status)) {
    if (['failed', 'cancelled', 'canceled'].includes(task.status)) {
      throw new Error(`EVOLINK_TASK_FAILED: ${task.error || task.fail_reason || task.status}`);
    }
    if (Date.now() > deadline) throw new Error('EVOLINK_TIMEOUT: generation timeout');
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    const pollRes = await fetch(`${BASE_URL}/v1/tasks/${created.id}`, { headers });
    const polled = await pollRes.json().catch(() => null);
    if (!pollRes.ok || !polled) throw new Error(`EVOLINK_POLL_FAILED: HTTP ${pollRes.status}`);
    task = polled.task || polled.data || polled; // tolerate wrapped responses
  }

  const imageUrl = findImageUrl(task);
  if (!imageUrl) throw fail('NO_OUTPUT_IMAGE');

  // EvoLink result links expire after 24h — download now and return a data URL
  // so the frontend contract (imageDataUrl) and any stored results stay valid.
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw fail('NO_OUTPUT_IMAGE', 'NO_OUTPUT_IMAGE: result fetch ' + imgRes.status);
  const mime = imgRes.headers.get('content-type') || 'image/png';
  const buf = Buffer.from(await imgRes.arrayBuffer());
  return {
    imageDataUrl: `data:${mime};base64,${buf.toString('base64')}`,
    interactionId: created.id,
  };
}
