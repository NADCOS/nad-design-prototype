// NAD Design — Supabase client.
//
// Reads the two Vite-exposed env vars set in Vercel / .env:
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_PUBLISHABLE_KEY
// Both are safe to expose to the browser (this is Supabase's public anon/publishable
// key, meant for client-side use — access control is enforced by Row Level Security
// policies on the Supabase project, not by hiding this key).
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

if (!isSupabaseConfigured && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn('[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY are not set — project-type persistence will be unavailable until they are configured.');
}

export const PROJECT_TYPES_TABLE = 'project_types';
export const PROJECT_IMAGES_BUCKET = 'project-images';
export const FURNITURE_TABLE = 'furniture_items';
