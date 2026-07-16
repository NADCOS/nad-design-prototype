// NAD Design — Supabase-backed persistence for Furniture & Lighting catalogue
// items (Step 5). Mirrors projectTypesService.js: this is the only file that
// talks to the `furniture_items` table and the `project-images` storage
// bucket (shared with Project Types, under a `furniture-items/` prefix).
//
// Run once in the Supabase SQL editor:
//   create table furniture_items (
//     id bigint generated always as identity primary key,
//     category text not null,
//     name text not null,
//     code text,
//     supplier text,
//     price numeric not null default 0,
//     dims text,
//     wood_finish text,
//     fabric text,
//     metal text,
//     availability text not null default 'inStock' check (availability in ('inStock','madeToOrder')),
//     image_path text,
//     sort_order int not null default 0,
//     is_active boolean not null default true,
//     created_at timestamptz not null default now(),
//     updated_at timestamptz not null default now()
//   );
//   create index furniture_items_category_idx on furniture_items(category, sort_order);
//   alter table furniture_items enable row level security;
//   create policy "Public can read active furniture" on furniture_items for select using (is_active = true);
//   create policy "Authenticated can manage furniture" on furniture_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
import { supabase, isSupabaseConfigured, FURNITURE_TABLE, PROJECT_IMAGES_BUCKET } from '../lib/supabase.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 7 * 1024 * 1024;

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

function attachImageUrl(row) {
  if (!row) return row;
  return { ...row, imageUrl: getFurnitureImageUrl(row.image_path) };
}

export function getFurnitureImageUrl(imagePath) {
  if (!isSupabaseConfigured || !imagePath) return '';
  const { data } = supabase.storage.from(PROJECT_IMAGES_BUCKET).getPublicUrl(imagePath);
  return data ? data.publicUrl : '';
}

/** Public list for the client-facing Furniture step — active rows only. */
export async function getFurnitureItems() {
  if (!isSupabaseConfigured) return { ok: false, data: [], error: 'Supabase is not configured.' };
  const { data, error } = await supabase
    .from(FURNITURE_TABLE).select('*').eq('is_active', true).order('category').order('sort_order');
  if (error) return { ok: false, data: [], error: friendlyDbError(error) };
  return { ok: true, data: (data || []).map(attachImageUrl) };
}

/** Full list for the Admin Panel — includes inactive rows. */
export async function getAllFurnitureForAdmin() {
  if (!isSupabaseConfigured) return { ok: false, data: [], error: 'Supabase is not configured.' };
  const { data, error } = await supabase
    .from(FURNITURE_TABLE).select('*').order('category').order('sort_order');
  if (error) return { ok: false, data: [], error: friendlyDbError(error) };
  return { ok: true, data: (data || []).map(attachImageUrl) };
}

export async function uploadFurnitureImage(itemId, file) {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase is not configured.' };
  if (!file) return { ok: false, error: 'No file selected.' };
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return { ok: false, error: 'Please choose a JPG, PNG, or WebP image.' };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: 'Images must be 7MB or smaller.' };
  const storagePath = `furniture-items/${itemId}/${Date.now()}-${safeFileName(file.name)}`;
  const { error } = await supabase.storage.from(PROJECT_IMAGES_BUCKET).upload(storagePath, file, { cacheControl: '3600', upsert: false });
  if (error) return { ok: false, error: friendlyDbError(error) };
  return { ok: true, storagePath };
}

export async function deleteFurnitureImage(imagePath) {
  if (!isSupabaseConfigured || !imagePath) return { ok: true };
  const { error } = await supabase.storage.from(PROJECT_IMAGES_BUCKET).remove([imagePath]);
  if (error) return { ok: false, error: friendlyDbError(error) };
  return { ok: true };
}

export async function createFurnitureItem(fields) {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase is not configured.' };
  const { data, error } = await supabase.from(FURNITURE_TABLE).insert(fields).select().single();
  if (error) return { ok: false, error: friendlyDbError(error) };
  return { ok: true, data: attachImageUrl(data) };
}

export async function updateFurnitureItem(id, fields) {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase is not configured.' };
  const { data, error } = await supabase
    .from(FURNITURE_TABLE).update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) return { ok: false, error: friendlyDbError(error) };
  return { ok: true, data: attachImageUrl(data) };
}

export async function deleteFurnitureItem(id, imagePath) {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase is not configured.' };
  const { error } = await supabase.from(FURNITURE_TABLE).delete().eq('id', id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  if (imagePath) await deleteFurnitureImage(imagePath);
  return { ok: true };
}

/** Orchestrates create/update: uploads the image (if any) then writes the row. */
export async function saveFurnitureEdit(id, fields, imageFile, isNew) {
  let uploadedPath = null;
  if (imageFile && !isNew) {
    const uploadResult = await uploadFurnitureImage(id, imageFile);
    if (!uploadResult.ok) return { ok: false, error: uploadResult.error };
    uploadedPath = uploadResult.storagePath;
  }

  if (isNew) {
    const createResult = await createFurnitureItem(fields);
    if (!createResult.ok) return createResult;
    if (imageFile) {
      const uploadResult = await uploadFurnitureImage(createResult.data.id, imageFile);
      if (uploadResult.ok) {
        const updateResult = await updateFurnitureItem(createResult.data.id, { image_path: uploadResult.storagePath });
        if (updateResult.ok) return updateResult;
      }
    }
    return createResult;
  }

  const updateResult = await updateFurnitureItem(id, uploadedPath ? { ...fields, image_path: uploadedPath } : fields);
  if (!updateResult.ok) {
    if (uploadedPath) await deleteFurnitureImage(uploadedPath);
    return { ok: false, error: updateResult.error };
  }
  return updateResult;
}
