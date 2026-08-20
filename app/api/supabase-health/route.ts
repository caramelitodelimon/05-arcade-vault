// ===== app/api/supabase-health/route.ts =====
// Route handler temporal de verificación (specs/04-supabase-client-integracion.md,
// paso 6): confirma que el cliente de servidor de Supabase puede conectarse al
// proyecto con las env vars configuradas. No depende de ninguna tabla.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
