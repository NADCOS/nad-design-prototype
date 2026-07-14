// NAD Design — Supabase-backed persistence for the Project Type step.
//
// This is the ONLY file that talks to the `project_types` table and the
// `project-images` storage bucket. It never returns raw Supabase/Postgres
// errors to the UI — callers get a small { ok, error } shape (error is
// already a client-safe message) or throw only for programmer errors.
import { supabase, isSupabaseConfigured, PROJECT_TYPES_TABLE, PROJECT_IMAGES_BUCKET } from '../lib/supabase.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 7 * 1024 * 1024; // 7MB

function friendlyDbError(error) {
  if (!error) return null;
  const msg = String(error.message || error);
  if (error.code === '42501' || /permission|policy|row-level security|rls/i.test(msg)) {
    return 'You do not have permission to modify this content.';
  }
  return 'Something went wrong saving your changes. Please try again.';
}

function safeFileName(name) {
  return (name || 'image').toLowerCase().replace(/[^a-z0-9.\-_]+/g, '-').replace(/-+/g, '-');
}

/**
 * Public list for the client-facing Project Type step — active rows only, in display order.
 * @returns {Promise<{ ok: boolean, data?: Array, error?: string }>}
 */
export async function getProjectTypes() {
  if (!isSupabaseConfigured) return { ok: false, data: [], error: 'Supabase is not configured.' };
  const { data, error } = await supabase
    .from(PROJECT_TYPES_TABLE)
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error) return { ok: false, data: [], error: friendlyDbError(error) };
  return { ok: true, data: (data || []).map(attachImageUrl) };
}

/**
 * Full list for the Admin Panel — includes inactive rows, in display order.
 * @returns {Promise<{ ok: boolean, data?: Array, error?: string }>}
 */
export async function getAllProjectTypesForAdmin() {
  if (!isSupabaseConfigured) return { ok: false, data: [], error: 'Supabase is not configured.' };
  const { data, error } = await supabase
    .from(PROJECT_TYPES_TABLE)
    .select('*')
    .order('sort_order');
  if (error) return { ok: false, data: [], error: friendlyDbError(error) };
  return { ok: true, data: (data || []).map(attachImageUrl) };
}

/**
 * Update a project type row's editable fields (name, description, sort_order,
 * is_active, and/or image_path). Always stamps updated_at.
 * @returns {Promise<{ ok: boolean, data?: object, error?: string }>}
 */
export async function updateProjectType(id, fields) {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase is not configured.' };
  const { data, error } = await supabase
    .from(PROJECT_TYPES_TABLE)
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) return { ok: false, error: friendlyDbError(error) };
  return { ok: true, data: attachImageUrl(data) };
}

/**
 * Validates and uploads an image file to the project-images bucket under
 * `project-types/{projectTypeId}/{timestamp}-{safeFilename}`.
 * @returns {Promise<{ ok: boolean, storagePath?: string, error?: string }>}
 */
export async function uploadProjectTypeImage(projectTypeId, file) {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase is not configured.' };
  if (!file) return { ok: false, error: 'No file selected.' };
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, error: 'Please choose a JPG, PNG, or WebP image.' };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: 'Images must be 7MB or smaller.' };
  }

  const storagePath = `project-types/${projectTypeId}/${Date.now()}-${safeFileName(file.name)}`;
  const { error } = await supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .upload(storagePath, file, { cacheControl: '3600', upsert: false });
  if (error) return { ok: false, error: friendlyDbError(error) };
  return { ok: true, storagePath };
}

/**
 * Removes an image from the project-images bucket (used both for explicit
 * "remove image" actions and to clean up an orphaned upload if the following
 * database update fails).
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function deleteProjectTypeImage(imagePath) {
  if (!isSupabaseConfigured || !imagePath) return { ok: true };
  const { error } = await supabase.storage.from(PROJECT_IMAGES_BUCKET).remove([imagePath]);
  if (error) return { ok: false, error: friendlyDbError(error) };
  return { ok: true };
}

/**
 * Resolves a stored `image_path` to its permanent public URL. Never store the
 * result of this function in the database — only the storage path.
 */
export function getProjectTypeImageUrl(imagePath) {
  if (!isSupabaseConfigured || !imagePath) return '';
  const { data } = supabase.storage.from(PROJECT_IMAGES_BUCKET).getPublicUrl(imagePath);
  return data ? data.publicUrl : '';
}

function attachImageUrl(row) {
  if (!row) return row;
  return { ...row, imageUrl: getProjectTypeImageUrl(row.image_path) };
}

/**
 * Orchestrates a full admin save: optionally uploads a new image, then updates
 * the row with the new fields (+ image_path if a new image was uploaded). If
 * the database update fails after a successful upload, the orphaned file is
 * removed so Storage never accumulates unreferenced images.
 * @param {string|number} id
 * @param {{ name?: string, description?: string, sort_order?: number, is_active?: boolean }} fields
 * @param {File|null} imageFile
 * @returns {Promise<{ ok: boolean, data?: object, error?: string }>}
 */
export async function saveProjectTypeEdit(id, fields, imageFile) {
  let uploadedPath = null;
  if (imageFile) {
    const uploadResult = await uploadProjectTypeImage(id, imageFile);
    if (!uploadResult.ok) return { ok: false, error: uploadResult.error };
    uploadedPath = uploadResult.storagePath;
  }

  const updateResult = await updateProjectType(id, uploadedPath ? { ...fields, image_path: uploadedPath } : fields);
  if (!updateResult.ok) {
    if (uploadedPath) await deleteProjectTypeImage(uploadedPath);
    return { ok: false, error: updateResult.error };
  }
  return updateResult;
}
