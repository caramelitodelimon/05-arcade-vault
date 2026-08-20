# 04 — Supabase: integración del cliente (sin esquema todavía)

- **Estado:** Implementado
- **Depende de:** SPEC 03
- **Fecha:** 2026-08-19

**Objetivo:** Conectar la app Next.js al proyecto Supabase ya existente instalando y configurando el SDK (`@supabase/supabase-js` + `@supabase/ssr`) — clientes de navegador/servidor, proxy de refresco de sesión y variables de entorno — sin crear tablas ni tocar ninguna pantalla todavía.

## Alcance

**Dentro:**

- Dependencias nuevas `@supabase/supabase-js` y `@supabase/ssr` en `package.json`.
- Variables de entorno `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (clave moderna `sb_publishable_...`, la que usa el código) y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (clave legacy JWT, documentada como referencia, sin uso en el código), apuntando al proyecto ya conectado (`https://yqkwmcncrasduumawfkv.supabase.co`), en `.env.local` (real, no versionado) y `.env.example` (plantilla, versionada), siguiendo el mismo patrón que `RESEND_API_KEY` de spec 03.
- `lib/supabase/client.ts`: cliente de navegador (`createBrowserClient` de `@supabase/ssr`), exportado como `createClient()`.
- `lib/supabase/server.ts`: cliente de servidor (`createServerClient` de `@supabase/ssr`, usando `cookies()` de `next/headers`), exportado como `createClient()` async, para Server Components y Route Handlers.
- `proxy.ts` en la raíz del repo (no `middleware.ts` — Next.js 16 deprecó esa convención y la renombró a `proxy.ts`/export `proxy`, mismo comportamiento; decisión tomada durante `/spec-impl`, ver Decisiones): refresca la cookie de sesión de Supabase en cada request (patrón oficial de `@supabase/ssr`). No redirige ni protege ninguna ruta — solo mantiene la sesión viva de cara a cuando exista auth real.
- Un route handler temporal de verificación, `app/api/supabase-health/route.ts` (`GET`), que usa el cliente de servidor para confirmar que la conexión funciona (responde `{ ok: true }` o `{ ok: false, error }`), sin depender de ninguna tabla.

**Fuera de alcance (para specs futuros):**

- Crear tablas o cualquier esquema en Postgres (`profiles`, `scores`, RLS, triggers) — spec futuro.
- Autenticación real en `/auth` (login/registro contra Supabase) — spec futuro. `app/auth/page.tsx` no se toca en este spec.
- Persistencia real de puntuaciones y Salón de la Fama real — spec futuro. `components/game-player.tsx` y `app/salon/page.tsx` no se tocan en este spec.
- `lib/session-context.tsx` no se toca: la sesión sigue siendo el estado en memoria de spec 01, sin ninguna llamada a Supabase todavía.
- Login social (Google/GitHub), recuperación de contraseña, Realtime, Edge Functions — ya estaban diferidos y lo siguen estando.
- Rutas protegidas — no aplica todavía; el proxy nuevo no redirige a nadie.
- Tests automatizados — no hay test runner configurado (per `CLAUDE.md`).

## Modelo de datos

Este spec no crea tablas ni estructuras en Postgres — es solo infraestructura de conexión. Los únicos "contratos" nuevos son las firmas de los clientes:

```ts
// lib/supabase/client.ts
export function createClient(): SupabaseClient;

// lib/supabase/server.ts
export async function createClient(): Promise<SupabaseClient>; // usa cookies() de next/headers

// app/api/supabase-health/route.ts
// GET → { ok: true } | { ok: false; error: string }
```

## Plan de implementación

Cada paso deja la app funcional y navegable.

1. **Dependencias.** `npm install @supabase/supabase-js @supabase/ssr`.
2. **Variables de entorno.** Agregar `NEXT_PUBLIC_SUPABASE_URL=`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=` y `NEXT_PUBLIC_SUPABASE_ANON_KEY=` a `.env.example`; completar los valores reales en `.env.local` (URL y claves del proyecto ya conectado).
3. **Cliente de navegador.** Crear `lib/supabase/client.ts` con `createClient()` (`createBrowserClient`, usando `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
4. **Cliente de servidor.** Crear `lib/supabase/server.ts` con `createClient()` async (`createServerClient` + `cookies()`, misma clave).
5. **Proxy.** Crear `proxy.ts` con el refresco de sesión estándar de `@supabase/ssr` (matcher que excluye assets estáticos), sin lógica de redirect.
6. **Health-check.** Crear `app/api/supabase-health/route.ts`: llama a `createClient().auth.getSession()` desde el cliente de servidor y responde `{ ok: true }` si no hay error, o `{ ok: false, error }` si lo hay.
7. **Verificación final.** Confirmar que el sitio sigue navegando igual que antes (el proxy no rompe ninguna ruta), pegarle a `/api/supabase-health` y confirmar `{ ok: true }`, y correr `npm run build` + `npm run lint`.

## Criterios de aceptación

- [ ] `@supabase/supabase-js` y `@supabase/ssr` aparecen en `package.json`.
- [ ] `.env.example` incluye `NEXT_PUBLIC_SUPABASE_URL=`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=` y `NEXT_PUBLIC_SUPABASE_ANON_KEY=` (además de `RESEND_API_KEY=` ya existente); `.env.local` con los valores reales no aparece en `git status` como archivo para commitear.
- [ ] Todas las rutas existentes (`/home`, `/games`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/auth`, `/salon`, `/about`) navegan exactamente igual que antes de este spec — el proxy nuevo no las rompe ni las redirige.
- [ ] `GET /api/supabase-health` responde `{ ok: true }`, confirmando que el cliente de servidor se conecta al proyecto Supabase con las variables de entorno configuradas.
- [ ] Ninguna pantalla ni `lib/session-context.tsx` cambió de comportamiento — la sesión sigue en memoria, sin llamadas a Supabase.
- [ ] `npm run build` y `npm run lint` pasan sin errores, incluyendo los archivos nuevos (`lib/supabase/client.ts`, `lib/supabase/server.ts`, `proxy.ts`, `app/api/supabase-health/route.ts`).

## Decisiones tomadas y descartadas

- **Spec de integración pura, sin esquema ni UI** (elegido por el usuario, explícito) sobre hacer esquema + auth + scores en el mismo spec (lo acordado inicialmente): se prefiere validar que la conexión al proyecto funciona antes de invertir en tablas, RLS y cambios de pantallas.
- **Route handler temporal `/api/supabase-health`** (elegido) sobre no tener ninguna verificación automatizable: sin tablas todavía, es la única forma concreta de comprobar que las env vars y el cliente de servidor están bien configurados, en vez de "confiar" en que compiló.
- **`proxy.ts` solo refresca la sesión, sin proteger rutas** (elegido): las decisiones de rutas protegidas y auth real quedan para el spec futuro que agregue login real.
- **`lib/session-context.tsx` no se toca en este spec** (elegido): evita mezclar la integración de infraestructura con cambios de comportamiento visibles para el usuario final.
- **Esquema (`profiles`/`scores`), RLS, auth real y persistencia de scores quedan sin planificar todavía** (elegido por el usuario, explícito): se documentará en un spec futuro con `/spec` cuando corresponda, no se redacta ahora.
- **`proxy.ts` en vez de `middleware.ts`** (decidido durante `/spec-impl`, con el usuario): Next.js 16 deprecó la convención `middleware.ts` y la renombró a `proxy.ts` (mismo comportamiento, export `proxy` en vez de `middleware` — ver `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`). Se sigue el aviso de deprecación en vez de la redacción original del spec, por instrucción explícita de `AGENTS.md`.
- **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (clave moderna) es la que usa el código** (decidido durante `/spec-impl`, con el usuario) sobre `NEXT_PUBLIC_SUPABASE_ANON_KEY` (legacy JWT): Supabase recomienda la publishable key para apps nuevas por rotación independiente y mejor seguridad. `NEXT_PUBLIC_SUPABASE_ANON_KEY` se deja documentada en `.env.example`/`.env.local` como referencia, sin uso en el código.

## Riesgos identificados

- **Variables de entorno mal configuradas romperían el proxy en cada request**, dejando toda la app sin cargar (no solo una pantalla). Mitigación: el paso 7 verifica manualmente la navegación completa y el health-check antes de cerrar el spec; si algo falla, el error queda aislado en `/api/supabase-health` en vez de manifestarse como una pantalla en blanco sin pista.

## Lo que **no** está en este spec

- Tablas, esquema o RLS en Postgres.
- Autenticación real (login/registro).
- Persistencia real de puntuaciones ni Salón de la Fama real.
- Cualquier cambio visible en `/auth`, `/juegos/[id]/jugar` o `/salon`.

Cada uno de estos, si se implementa, va en su propio spec futuro (`/spec`), no en este.
