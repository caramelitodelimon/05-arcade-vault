// ===== lib/supabase/client.ts — cliente de Supabase para el navegador =====
// Ver specs/04-supabase-client-integracion.md. Usado desde componentes
// "use client" (por ahora ninguno lo consume todavía; ver Alcance del spec).
// Usa la clave "publishable" moderna (sb_publishable_...), recomendada por
// Supabase para apps nuevas sobre la anon key legacy.

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
