# 02 — Home: landing page del prototipo `home-about/`

- **Estado:** Implementado
- **Depende de:** SPEC 01
- **Fecha:** 2026-08-13

**Objetivo:** Portar solo la pantalla `Home` de `references/templates/home-about/home.jsx` a `/home` como nueva landing canónica de Next.js, renombrando el catálogo de `/biblioteca` a `/games` (con redirect de compatibilidad), sin implementar `about.jsx`.

## Alcance

**Dentro:**

- Pantalla Home portada de `home.jsx`, con sus 7 secciones:
  - Hero: eyebrow, título de 3 líneas, subtítulo, dos CTAs ("EXPLORAR JUEGOS" → `/games`, "CREAR CUENTA" → `/auth`), indicador de scroll y las siluetas pixel decorativas (`FloatingSilhouettes`).
  - "¿POR QUÉ ARCADE VAULT?": grilla de 4 feature cards con iconos pixel (`FeatureIcon`: GAMEPAD/FREE/TROPHY/ROCKET).
  - "JUEGOS DISPONIBLES AHORA": mini-rail con los primeros 6 juegos de `lib/data.ts` (`GAMES.slice(0, 6)`), cada mini-card navega a `/juegos/[id]`; botón "VER TODOS LOS JUEGOS →" a `/games`.
  - "STATS": 3 bloques de números (hardcodeados: "12+ JUEGOS", "MILES DE PARTIDAS", "GLOBAL RANKING").
  - "ACTIVIDAD EN VIVO": ticker de últimas puntuaciones + top 5 jugadores de hoy, ambos hardcodeados como en el prototipo; link "VER SALÓN →" a `/salon`.
  - "PRECIOS": price card único (plan gratuito) con CTA "EMPEZAR GRATIS →" a `/auth`, y bloque de FAQ (3 preguntas), todo hardcodeado.
  - CTA final: "INSERTAR MONEDA →" a `/games`.
  - Animación reveal-on-scroll (IntersectionObserver) en las secciones marcadas `reveal` en el prototipo.
- Ruta `/home` (nueva) como landing.
- `/` redirige a `/home` (reemplaza el redirect a `/biblioteca` de spec 01).
- Renombre de ruta: `app/biblioteca/` → `app/games/` (mismo contenido, sin cambios funcionales). `/biblioteca` pasa a ser un redirect de compatibilidad hacia `/games`.
- Actualización de todos los links/navegaciones internas que apuntaban a `/biblioteca` (Nav, Salón, Auth, Detalle de juego, Reproductor) para que apunten a `/games`.
- Nav: se agrega el link "Inicio" (desktop + panel móvil) apuntando a `/home`; el logo pasa a apuntar a `/home`; el link "Biblioteca" pasa a apuntar a `/games`; el estado activo se recalcula (`/home` → Inicio activo; `/games` y `/juegos/*` → Biblioteca activo).
- Port de las clases CSS relacionadas a Home (`home-*`, `feature-*`, `mini-*`, `stats-*`, `activity-*`, `tick-*`, `top-*`, `pricing-*`, `price-*`, `faq-*`, `.reveal`/`.reveal.in`, `@keyframes float`, `@keyframes bounce`) desde `references/templates/home-about/styles.css` hacia `app/globals.css`.

**Fuera (explícitamente diferido):**

- La pantalla "Acerca de" (`about.jsx`), aunque vive en la misma carpeta `references/templates/home-about/`. Se implementa en un spec futuro.
- El link "Acerca de" en el Nav: no se agrega en este spec, para no dejar un link roto hacia una ruta inexistente.
- Cualquier lógica real detrás de "ACTIVIDAD EN VIVO" o "STATS": siguen siendo datos decorativos hardcodeados, no leen de `seededScores()`, de `useSession()` ni de ningún backend.
- Cambios funcionales a `/juegos/[id]` y `/juegos/[id]/jugar`: solo se actualizan los links que apuntaban a `/biblioteca` dentro de esos archivos.
- Sistema de créditos funcional, login social real, backend real, persistencia entre recargas — igual que spec 01.
- Tests automatizados — no hay test runner configurado (per `CLAUDE.md`).

## Modelo de datos

No se agregan tipos ni estructuras a `lib/data.ts`. `GAMES` (ya existente) se reutiliza vía `GAMES.slice(0, 6)` para la sección "JUEGOS DISPONIBLES AHORA".

Los datos decorativos de "ACTIVIDAD EN VIVO" y "STATS" quedan como arrays/objetos literales **inline dentro de `app/home/page.tsx`** (no exportados, no tipados en `lib/data.ts`), portados tal cual desde `home.jsx`:

```ts
// inline en app/home/page.tsx, sin exportar
{ p: string; g: string; s: number; t: string; c: "cyan" | "magenta" | "yellow" | "green" }[] // ticker de puntuaciones
{ r: number; p: string; s: number }[]                                                        // top 5 jugadores
{ n: string; u: string; s: string }[]                                                         // stats
```

## Plan de implementación

Cada paso deja la app funcional y navegable.

1. **Renombrar catálogo.** Mover `app/biblioteca/page.tsx` a `app/games/page.tsx` (contenido sin cambios). Crear un nuevo `app/biblioteca/page.tsx` que solo hace `redirect("/games")`. Actualizar todos los `Link`/`router.push`/`isActive` que apuntan a `"/biblioteca"` en `components/nav.tsx`, `app/salon/page.tsx`, `app/auth/page.tsx`, `app/juegos/[id]/page.tsx` y `components/game-player.tsx` para que apunten a `"/games"`.
2. **Redirect raíz.** Cambiar `app/page.tsx` de `redirect("/biblioteca")` a `redirect("/home")`.
3. **CSS.** Portar las clases listadas en el alcance (`home-*`, `feature-*`, `mini-*`, `stats-*`, `activity-*`, `tick-*`, `top-*`, `pricing-*`, `price-*`, `faq-*`, `.reveal`/`.reveal.in`, `@keyframes float`, `@keyframes bounce`) desde `references/templates/home-about/styles.css` hacia `app/globals.css`. No portar clases `about-*`/`contact-*`/`highlight-*`/`div-*` (quedan para el spec de About).
4. **Hook de reveal.** Crear `lib/use-reveal.ts` con el hook basado en `IntersectionObserver` (portado de `useReveal` en `home.jsx`), reutilizable a futuro por About.
5. **Componentes de soporte.** Crear `components/mini-game-card.tsx` (portado de `MiniCard`) y `components/home-feature-icon.tsx` (portado de `FeatureIcon`); las siluetas decorativas (`FloatingSilhouettes`) se portan como parte de `app/home/page.tsx` o un componente `components/home-silhouettes.tsx`.
6. **Página Home.** Crear `app/home/page.tsx` (`"use client"`, usa `useReveal`), portando las 7 secciones de `home.jsx` con los datos hardcodeados inline y `GAMES.slice(0, 6)` desde `lib/data.ts`.
7. **Nav.** Agregar link "Inicio" (desktop + móvil) apuntando a `/home`; logo apunta a `/home`; "Biblioteca" apunta a `/games`; actualizar el helper de estado activo (`isGames` para `/games` y `/juegos/*`, `isHome` para `/home`).
8. **Verificación final.** Recorrer manualmente (o con el navegador) todos los flujos de extremo a extremo — ver Criterios de aceptación — y correr `npm run build` + `npm run lint`.

## Criterios de aceptación

- [ ] `/` redirige a `/home`.
- [ ] `/home` muestra las 7 secciones (hero, why, games preview, stats, actividad en vivo, precios, cta final) con el tema visual neón.
- [ ] Los botones "EXPLORAR JUEGOS", "VER TODOS LOS JUEGOS →" e "INSERTAR MONEDA →" navegan a `/games`.
- [ ] Los botones "CREAR CUENTA" y "EMPEZAR GRATIS →" navegan a `/auth`.
- [ ] El link "VER SALÓN →" navega a `/salon`.
- [ ] "JUEGOS DISPONIBLES AHORA" muestra los primeros 6 juegos de `lib/data.ts` (`GAMES`) y cada mini-card navega a `/juegos/[id]` al hacer click.
- [ ] Las secciones marcadas `reveal` (why, games preview, stats, actividad, precios, cta final) aparecen con la animación fade-up al hacer scroll.
- [ ] `/biblioteca` redirige a `/games`.
- [ ] `/games` muestra el catálogo igual que antes de este spec (hero, buscador, chips, grilla), sin cambios de contenido, solo de ruta.
- [ ] El Nav muestra "Inicio" (activo en `/home`), "Biblioteca" (activo en `/games` y `/juegos/*`) y "Salón de la Fama", tanto en desktop como en el panel móvil; el logo navega a `/home`.
- [ ] Ningún link interno del sitio (salón, auth, detalle de juego, reproductor) apunta a `/biblioteca`; todos apuntan a `/games`.
- [ ] No existe ruta `/acerca-de` ni link "Acerca de" en el Nav.
- [ ] `npm run build` y `npm run lint` pasan sin errores.

## Decisiones tomadas y descartadas

- **Renombrar `/biblioteca` a `/games` (en inglés)** (elegido por el usuario, explícitamente) sobre mantener `/biblioteca` o usar `/juegos`: diverge de la convención de rutas en español que spec 01 había fijado como decisión explícita; se documenta aquí como decisión consciente del usuario, no como inconsistencia pasada por alto.
- **`/biblioteca` queda como redirect permanente** (elegido) sobre eliminarla sin más: evita romper bookmarks o links duros existentes a la URL anterior.
- **`/` redirige a `/home`** (elegido) sobre mantenerlo apuntando a `/games`: Home pasa a ser la landing canónica del sitio, igual que en el prototipo, donde `home` y `biblioteca` son rutas distintas del router hash.
- **Redirects vía `redirect()` de `next/navigation` dentro del page component** (elegido) sobre `redirects()` en `next.config.ts`: mantiene el mismo patrón que spec 01 ya usaba en `app/page.tsx`, sin introducir un mecanismo nuevo.
- **Acerca de (`about.jsx`) queda fuera de este spec** aunque vive en la misma carpeta `references/templates/home-about/` que `home.jsx`: el usuario pidió explícitamente "solo el home page". El link "Acerca de" no se agrega al Nav para no dejar una ruta rota.
- **Datos de "actividad en vivo" y "stats" hardcodeados inline en `app/home/page.tsx`**, sin exportarlos desde `lib/data.ts` (elegido por el usuario): no se reutilizan en otra pantalla y no representan datos reales, igual que otros elementos decorativos ya aceptados en spec 01 (créditos, tags fijos).
- **`useReveal` extraído a `lib/use-reveal.ts`** (elegido) sobre dejarlo inline en `app/home/page.tsx`: permite reutilizarlo cuando se implemente About (que también usa `reveal`) sin refactor adicional.
- **`MiniCard` portado como componente nuevo `components/mini-game-card.tsx`** (elegido) sobre reusar `components/game-card.tsx`: son visualmente distintos en el prototipo (portada cuadrada, sin badges ni stats), según las clases `mini-card`/`mini-cover`/`mini-meta` de `styles.css`.

## Riesgos identificados

- **Fidelidad visual del CSS portado:** `references/templates/home-about/styles.css` tiene ~1744 líneas y mezcla clases de Home con clases de About (`about-*`, `contact-*`, `highlight-*`, `div-*`). Mitigación: portar únicamente las clases listadas en el plan (paso 3) y dejar las de About sin portar hasta su propio spec.
- **Ruptura de la ruta canónica `/`:** spec 01 (ya "Implementado") fijó `/` → `/biblioteca`; este spec lo cambia a `/` → `/home`. Mitigación: el redirect de compatibilidad `/biblioteca` → `/games` cubre bookmarks antiguos; hay que verificar con `grep -rn "/biblioteca"` antes de cerrar el paso 1 que no queden referencias sin actualizar.
