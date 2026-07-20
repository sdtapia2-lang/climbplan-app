import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente con la service role key: bypassea RLS por completo.
 * SOLO se debe importar desde código server-side (Route Handlers, Server
 * Components) -- nunca desde un archivo "use client". La service role key
 * vive en SUPABASE_SERVICE_ROLE_KEY (sin prefijo NEXT_PUBLIC_) para que
 * Next.js nunca la incluya en el bundle del navegador.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno del servidor.");
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
