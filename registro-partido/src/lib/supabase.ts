import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Es null cuando no hay credenciales configuradas. En ese caso la app funciona
 * igual que antes de existir la nube: todo contra localStorage y sin login.
 * Asi el despliegue de GitHub Pages no se rompe si faltan los secrets.
 */
export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

export const cloudEnabled = supabase !== null;
