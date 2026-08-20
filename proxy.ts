// ===== proxy.ts — refresca la cookie de sesión de Supabase en cada request =====
// Ver specs/04-supabase-client-integracion.md. El spec original describía este
// archivo como `middleware.ts`, pero Next.js 16 deprecó esa convención y la
// renombró a `proxy.ts` (export `proxy` en vez de `middleware`, mismo
// comportamiento — ver node_modules/next/dist/docs/.../file-conventions/proxy.md).
// Decisión tomada durante /spec-impl, documentada en el spec.
//
// No protege ninguna ruta: solo mantiene el token de sesión vivo, de cara a
// cuando exista auth real (spec futuro).

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() (no getSession()) valida el token contra el servidor de Supabase
  // Auth, refrescándolo si hace falta — patrón oficial de @supabase/ssr.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
