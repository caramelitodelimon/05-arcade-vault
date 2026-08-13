# 01 — MVP: pantallas visuales de Arcade Vault

- **Estado:** Implementado
- **Depende de:** ninguna
- **Fecha:** 2026-08-12

**Objetivo:** Portar las 6 pantallas del prototipo (`Nav`, `Library`, `GameDetail`, `GamePlayer`, `Auth`, `HallOfFame`) de `references/templates/` a componentes reales de Next.js App Router, con navegación, tema visual y flujos funcionando de extremo a extremo, sin implementar ningún motor de juego real.

## Alcance

**Dentro:**

- Las 6 pantallas del prototipo, portadas como rutas/componentes reales:
  - Nav persistente (desktop + panel móvil con hamburguesa).
  - Biblioteca (`/biblioteca`): hero, buscador por título, chips de categoría (TODOS/ARCADE/PUZZLE/SHOOTER/VERSUS), grilla de tarjetas de juego, estado vacío "NO HAY RESULTADOS".
  - Detalle de juego (`/juegos/[id]`): portada, tags, descripción larga, stat strip (partidas/mejor global/dificultad), tabla de mejores puntuaciones, acciones (jugar / volver).
  - Reproductor (`/juegos/[id]/jugar`): HUD (jugador/puntuación/vidas/nivel), marco CRT con elementos decorativos animados, pausa/reanudar, botón FIN, modal de fin de partida con formulario de iniciales y guardado de puntuación, reinicio, salir.
  - Auth (`/auth`): tabs iniciar sesión/crear cuenta, formulario, botón de invitado, elementos decorativos (social, divisor).
  - Salón de la Fama (`/salon`): tabs por juego, podio top 3, tabla completa, fila "tu mejor marca" condicionada a sesión iniciada.
- Ruta raíz `/` redirigiendo a `/biblioteca`.
- 404 real de Next.js (`notFound()`) cuando `/juegos/[id]` o `/juegos/[id]/jugar` reciben un id de juego inexistente.
- Sesión de usuario y puntuaciones "guardadas" como estado en memoria (React Context), sin persistencia entre recargas.
- Port del tema visual completo de `styles.css` (tokens de color, tipografías, fondo de grilla/scanlines/ruido, clases `av-`) hacia `app/globals.css`, usando el bloque `@theme inline` de Tailwind v4 para los tokens de diseño.
- Reemplazo de las fuentes Geist del scaffold por Press Start 2P, JetBrains Mono y Courier Prime vía `next/font/google`.
- Mock data (`GAMES`, `CATS`, `seededScores`) portado a TypeScript manteniendo ids y formas estables respecto a `data.jsx`.
- Elementos decorativos sin lógica real (botones sociales Google/GitHub, contador "CRÉDITOS · 03", tags fijos "1 JUGADOR/TECLADO-TÁCTIL/RETRO 1985") se portan tal cual, sin funcionalidad.

**Fuera (explícitamente diferido):**

- El motor de juego real de cualquiera de los 8 juegos. La pantalla de reproductor simula una partida (puntuación aleatoria autoincremental, como en el prototipo) pero no implementa ninguna mecánica jugable.
- Backend/API real, base de datos, autenticación real (OAuth, hashing de contraseñas, validación de credenciales contra un servidor).
- Persistencia de sesión o puntuaciones entre recargas de página, pestañas o dispositivos.
- Sistema de créditos funcional.
- Login social real (los botones Google/GitHub no disparan ningún flujo OAuth).
- Tests automatizados — no hay test runner configurado en el repo (per `CLAUDE.md`).
- Nuevos juegos, categorías o campos de datos más allá de los 8 juegos y 4 categorías ya definidos en `data.jsx`.

## Modelo de datos

Todo vive en memoria del cliente; no hay esquema persistente ni base de datos.

```ts
// lib/data.ts
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type GameColor = "cyan" | "magenta" | "yellow" | "green";

export interface Game {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: GameCategory;
  cover: string; // clase CSS de portada, ej. "cover-bricks"
  color: GameColor;
  best: number;
  plays: string; // ej. "12.4K"
}

export const GAMES: Game[]; // los mismos 8 juegos de data.jsx, ids intactos
export const CATS: readonly ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"];

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string; // dd/mm/yyyy
}

export function seededScores(seed: number, count?: number): ScoreRow[];
```

```ts
// lib/session-context.tsx
export interface SessionUser {
  name: string;
}

export interface SavedScore {
  game: string; // Game.id
  score: number;
  name: string;
  at: number; // Date.now()
}

interface SessionContextValue {
  user: SessionUser | null;
  login: (user: SessionUser | null) => void; // null = invitado, equivalente a no logueado
  logout: () => void;
  scores: SavedScore[];
  saveScore: (entry: { game: string; score: number; name: string }) => void;
}
```

`SessionProvider` envuelve el árbol en `app/layout.tsx`. No hay `localStorage` ni cookies: al recargar la página, `user` vuelve a `null` y `scores` vuelve a `[]`.

## Plan de implementación

Cada paso deja la app funcional y navegable.

1. **Tokens de diseño y fuentes.** Portar las custom properties y clases (`av-bg`, scanlines, ruido, `av-`*) de `references/templates/styles.css` a `app/globals.css`, con los tokens de color/tipografía dentro de `@theme inline { ... }`. Configurar Press Start 2P, JetBrains Mono y Courier Prime vía `next/font/google` en `app/layout.tsx`, reemplazando Geist.
2. **Mock data.** Crear `lib/data.ts` con `Game`, `GAMES`, `CATS` y `seededScores()` portados desde `data.jsx`, manteniendo ids y formas.
3. **Contexto de sesión.** Crear `lib/session-context.tsx` (`SessionProvider` + hook `useSession`) con `user`, `login`, `logout`, `scores`, `saveScore` en estado de React, sin persistencia.
4. **Layout raíz y Nav.** Implementar `app/layout.tsx` (fuentes + `SessionProvider` + `Nav` + footer) y `components/nav.tsx` (portado de `nav.jsx`: links desktop, panel móvil con hamburguesa, contador de créditos fijo, botón de auth que refleja `useSession`). `app/page.tsx` hace `redirect("/biblioteca")`.
5. **Biblioteca.** `app/biblioteca/page.tsx` + `components/game-card.tsx`, portado de `biblioteca.jsx` (hero, buscador, chips, grilla, estado vacío).
6. **Detalle.** `app/juegos/[id]/page.tsx`, portado de `detalle.jsx` (portada, tags, descripción, stat strip, leaderboard con `seededScores`, acciones). `notFound()` si el id no existe en `GAMES`.
7. **Auth.** `app/auth/page.tsx`, portado de `auth.jsx` (tabs, formulario, botón invitado, elementos decorativos). El submit llama a `login()` del contexto y navega a `/biblioteca`.
8. **Reproductor.** `app/juegos/[id]/jugar/page.tsx`, portado de `reproductor.jsx` (HUD, marco CRT con elementos decorativos animados, pausa, modal de fin de partida, `saveScore()` del contexto, reinicio, salir). `notFound()` si el id no existe.
9. **Salón de la Fama.** `app/salon/page.tsx`, portado de `salon.jsx` (tabs por juego, podio, tabla completa, fila "tu mejor marca" condicionada a `useSession().user`).
10. **Verificación final.** Recorrer manualmente (o con el navegador) todos los flujos de extremo a extremo (ver Criterios de aceptación) y correr `npm run build` + `npm run lint`.

## Criterios de aceptación

- [ ] `npm run dev` levanta la app sin errores y `/` redirige a `/biblioteca`.
- [ ] `/biblioteca` muestra hero, buscador, chips de categoría y la grilla de los 8 juegos desde `lib/data.ts`; filtrar por texto o categoría reduce la grilla, y sin coincidencias se muestra "NO HAY RESULTADOS".
- [ ] Cada tarjeta de juego navega a `/juegos/[id]` al hacer click en la tarjeta o en JUGAR.
- [ ] `/juegos/[id]` muestra portada, tags, descripción larga, stat strip y tabla de mejores puntuaciones para un id válido; un id inexistente devuelve la página 404 de Next.
- [ ] Desde el detalle, JUGAR AHORA navega a `/juegos/[id]/jugar` y VOLVER AL VAULT navega a `/biblioteca`.
- [ ] `/juegos/[id]/jugar` muestra el HUD, incrementa la puntuación automáticamente, permite pausar/reanudar, y FIN abre el modal de fin de partida; GUARDAR PUNTUACIÓN registra la entrada vía `useSession().saveScore` y muestra el toast de confirmación; JUGAR DE NUEVO reinicia el estado local; SALIR vuelve al detalle. Un id inexistente devuelve 404.
- [ ] `/auth` muestra tabs, formulario, botón JUGAR COMO INVITADO y elementos decorativos; enviar el formulario o pulsar invitado establece la sesión (o la deja en `null` para invitado) vía `useSession().login` y navega a `/biblioteca`.
- [ ] El Nav refleja el estado de sesión (usuario logueado vs "Iniciar Sesión") en desktop y en el panel móvil.
- [ ] `/salon` muestra tabs por juego, podio, tabla completa y, solo con sesión iniciada, la fila "TU MEJOR MARCA"; VOLVER A LA BIBLIOTECA navega a `/biblioteca`.
- [ ] El tema visual (colores neón, tipografías, fondo de grilla/scanlines/ruido) coincide visualmente con `references/templates/styles.css` en las 6 pantallas.
- [ ] `npm run build` y `npm run lint` pasan sin errores.

## Decisiones tomadas y descartadas

- **Reproductor con simulación completa** (elegido) sobre mockup estático o placeholder "próximamente": representa el flujo completo del producto (HUD, pausa, fin de partida, guardado) aunque el motor de juego real quede fuera de alcance.
- **Sesión en memoria vía React Context** (elegido) sobre `localStorage` o "sin sesión funcional": `CLAUDE.md` indica explícitamente no portar el detalle de `localStorage` del prototipo tal cual; y una sesión no funcional rompería la fila "tu mejor marca" del Salón de la Fama y la reacción del Nav al login.
- **Rutas `/biblioteca`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/auth`, `/salon`** (elegido) sobre nombres literales del router hash del prototipo o biblioteca en `/`: `jugar` es una acción sobre un juego concreto, y el copy del proyecto está en español.
- **404 real de Next.js (`notFound()`)** (elegido) sobre redirect silencioso: es el comportamiento estándar de Next 16 con rutas dinámicas reales; el prototipo solo hacía `return null` porque no tenía rutas de servidor.
- **`/` redirige a `/biblioteca`** (elegido) sobre dejar el scaffold intacto: mantiene una única URL canónica para la pantalla principal.
- **Elementos decorativos sin funcionalidad** (botones sociales, contador de créditos, tags fijos) se portan tal cual: consistente con el alcance "solo visual" y sin sugerir features no solicitadas (login social real, sistema de créditos).
- **Guardado de puntuaciones en el contexto de sesión**, replicando `av_scores` del prototipo pero sin `localStorage`, ya que no hay backend.

## Riesgos identificados

- **Fidelidad visual del port de CSS:** `styles.css` tiene ~950 líneas de CSS custom (no utilidades Tailwind); un port incompleto o mal organizado dentro de `@theme inline` puede romper el look neón. Mitigación: portar la mayoría de las clases `av-`/componente como CSS plano dentro de `globals.css`, y usar `@theme` solo para los tokens de diseño reutilizables (colores, fuentes).
- **Next 16 route-typed props:** las páginas dinámicas (`app/juegos/[id]/page.tsx`, `app/juegos/[id]/jugar/page.tsx`) deben usar `PageProps<"/ruta">` generado, no tipos escritos a mano. Mitigación: revisar `node_modules/next/dist/docs/` antes de tipar cada página, tal como indica `AGENTS.md`.
