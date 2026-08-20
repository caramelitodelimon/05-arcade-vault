// ===== lib/supabase/server.ts — cliente de Supabase para Server Components /
// Route Handlers =====
// Ver specs/04-supabase-client-integracion.md. `cookies()` es async en Next
// 16 (ver node_modules/next/dist/docs/.../cookies.md), por eso createClient()
// también lo es.

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll fue llamado desde un Server Component (render), donde no se
            // pueden escribir cookies. Se puede ignorar porque proxy.ts refresca
            // la sesión en cada request.
          }
        },
      },
    },
  );
}
