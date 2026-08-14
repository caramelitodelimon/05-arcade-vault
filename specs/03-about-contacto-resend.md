# 03 — About: pantalla "Acerca de" + envío de correo de contacto con Resend

- **Estado:** Implementado
- **Depende de:** SPEC 02
- **Fecha:** 2026-08-13

**Objetivo:** Portar la pantalla `About` de `references/templates/home-about/about.jsx` a la ruta `/about` con su formulario de contacto conectado a un envío de correo real vía Resend hacia `shaddeveloper@gmail.com`, agregando el link "Sobre nosotros" al Nav.

## Alcance

**Dentro:**

- Ruta nueva `/about` (`app/about/page.tsx`, `"use client"`) portando 1:1 el contenido visual y de copy de `about.jsx`:
  - Sección hero: kicker "▸ ACERCA DE", título "ACERCA DE ARCADE VAULT", párrafo de misión, fila de 3 highlights (`HighlightIcon`: HEART/BROWSER/PLANT) con sus textos exactos del template.
  - Divider decorativo de píxeles animados (`about-divider`, `div-bar`, `div-pixels`).
  - Sección de contacto: columna de intro (`contact-intro`, kicker "▸ CONTACTO", título "CONTÁCTANOS", subtítulo, 3 tips) + formulario (`contact-form`) con campos NOMBRE, CORREO ELECTRÓNICO, MENSAJE.
  - Animación reveal-on-scroll en el divider y la sección de contacto, reutilizando `useReveal()` de `lib/use-reveal.ts` (creado en spec 02).
- El link de navegación al `/about` en el Nav (desktop + panel móvil) se llama **"Sobre nosotros"** (no "Acerca de" — decisión explícita del usuario, distinta del texto `kicker`/`título` dentro de la propia página, que sí se porta literal desde el template). Se agrega después de "Salón de la Fama", antes del botón de auth, igual posición relativa que en `references/templates/home-about/nav.jsx`.
- Estado activo del Nav: `isAbout = pathname === "/about"`.
- Envío real de correo al enviar el formulario:
  - Endpoint `app/api/contact/route.ts` (Next.js Route Handler, `POST`), que usa el SDK `resend` server-side.
  - Remitente: `Arcade Vault <onboarding@resend.dev>` (dominio de pruebas de Resend, sin verificación de dominio propio).
  - Destinatario: `shaddeveloper@gmail.com` (fijo, hardcodeado en el route handler).
  - `reply_to`: el email que el usuario escribió en el formulario, para que el equipo pueda responder directo.
  - Asunto fijo: `"Nuevo mensaje de contacto — Arcade Vault"`.
  - Cuerpo del correo con nombre, email y mensaje del formulario.
  - Validación server-side: nombre/email/mensaje no vacíos, email con formato válido (regex simple); si falla, responde `400`.
  - Campo honeypot oculto (`website`, fuera de la tab order y no visible) en el formulario; si llega con contenido, el endpoint responde `200 { ok: true }` sin llamar a Resend (spam descartado silenciosamente).
- Estados del formulario en el cliente, extendiendo el prototipo (que solo tenía `idle`/`shake`/`sent`):
  - Validación client-side antes de enviar: campos no vacíos (igual que el prototipo) **+** formato de email válido; si falla, dispara el `shake` existente.
  - Estado de envío (`sending`): botón deshabilitado, texto cambia a "ENVIANDO…" mientras la petición a `/api/contact` está en curso.
  - Estado de éxito (`sent`): se muestra la terminal de éxito **idéntica al template** (mismas líneas `[OK] Conectando…`, `[OK] Validando…`, `[OK] Transmitiendo…`, línea final con el nombre en mayúsculas), pero solo se renderiza cuando `/api/contact` responde éxito real — no es instantánea como en el prototipo.
  - Estado de error (`error`): si `/api/contact` responde error (validación, Resend caído, `RESEND_API_KEY` faltante/ inválida, red), se muestra una línea de error dentro de la misma terminal (p. ej. `[FAIL] No se pudo enviar el mensaje. Intenta de nuevo.` en rojo) y un botón para reintentar sin perder lo escrito.
- Dependencia nueva `resend` agregada a `package.json`.
- Variable de entorno `RESEND_API_KEY`:
  - Vive en `.env.local` en la raíz del repo (ya cubierto por `.env*` en `.gitignore` — no se versiona). **El usuario deja ahí su API key real** después de este spec, fuera de esta conversación.
  - Se crea `.env.example` (sí versionado) con `RESEND_API_KEY=` como plantilla documentando la variable requerida.
- Port de las clases CSS `about-*`, `contact-*`, `highlight-*`, `div-bar`, `div-pixels` desde `references/templates/home-about/styles.css` hacia `app/globals.css` (explícitamente dejadas fuera por spec 02).

**Fuera (explícitamente diferido):**

- Captcha o protección anti-bot avanzada — solo honeypot simple.
- Rate limiting por IP en `/api/contact`.
- Persistencia de los mensajes de contacto (no se guardan en DB ni localStorage; si Resend confirma el envío, se descarta el contenido).
- Verificación de dominio propio en Resend (`arcadevault.gg` o similar) — el remitente queda como `onboarding@resend.dev` hasta que exista ese dominio.
- Historial o panel de administración para ver mensajes recibidos.
- Cambiar la ruta a español (`/acerca-de`) — el usuario pidió explícitamente `/about`.
- Agregar contenido de "Acerca de" a la Home (`/home`) — la Home ya está implementada (spec 02) y no se toca aquí salvo que ya enlazara a `/about`.
- Tests automatizados — no hay test runner configurado (per `CLAUDE.md`).

## Modelo de datos

No se agregan tipos a `lib/data.ts`. Los únicos datos nuevos son:

```ts
// estado local en app/about/page.tsx (no exportado)
type ContactForm = { name: string; email: string; msg: string; website: string }; // "website" = honeypot
type ContactStatus = "idle" | "sending" | "sent" | "error";
```

```ts
// app/api/contact/route.ts — payload esperado en el POST
type ContactPayload = { name: string; email: string; msg: string; website?: string };
// respuesta: { ok: true } en éxito (incluye el caso honeypot) | { ok: false; error: string } con status 400/500
```

## Plan de implementación

Cada paso deja la app funcional y navegable.

1. **Dependencia y entorno.** `npm install resend`. Crear `.env.example` (versionado) con `RESEND_API_KEY=`. Confirmar que `.env.local` sigue ignorado por git (ya lo está vía `.env*`).
2. **CSS.** Portar las clases `about-*`, `contact-*`, `highlight-*`, `div-bar`, `div-pixels` desde `references/templates/home-about/styles.css` hacia `app/globals.css`.
3. **Endpoint de contacto.** Crear `app/api/contact/route.ts`: valida payload (nombre/email/mensaje no vacíos, email con regex), chequea honeypot (`website`), y si todo bien llama a `new Resend(process.env.RESEND_API_KEY).emails.send(...)` con `from`, `to: "shaddeveloper@gmail.com"`, `reply_to`, `subject` y `text`/`html` con el cuerpo. Maneja el caso `RESEND_API_KEY` ausente devolviendo `500` con mensaje claro en logs de servidor (no expuesto al cliente).
4. **Página About.** Crear `app/about/page.tsx` (`"use client"`) portando `about.jsx` completo: hero, `HighlightIcon` (inline en el mismo archivo, igual que el patrón de `auth.jsx`/`salon.jsx`), divider, sección de contacto y `contact-form` con los 4 estados (`idle`/`sending`/`sent`/`error`) descritos en el alcance, usando `useReveal()` para el reveal-on-scroll.
5. **Nav.** Agregar en `components/nav.tsx` el link "Sobre nosotros" → `/about` (desktop + panel móvil), después de "Salón de la Fama"; agregar `isAbout` al cálculo de estado activo.
6. **Verificación final.** Recorrer manualmente el flujo completo: llenar el formulario con datos válidos y confirmar que el correo llega a `shaddeveloper@gmail.com` con el `reply_to` correcto; probar validación de campos vacíos (shake) y de email inválido (shake); provocar un error (p. ej. `RESEND_API_KEY` vacía) y confirmar que se muestra el estado de error con opción de reintentar; confirmar que el link "Sobre nosotros" aparece y navega correctamente. Correr `npm run build` y `npm run lint`.

## Criterios de aceptación

- [ ] `/about` existe y muestra el hero, los 3 highlights, el divider animado y la sección de contacto, con el copy exacto del template (`about.jsx`).
- [ ] El Nav (desktop y panel móvil) muestra el link "Sobre nosotros" apuntando a `/about`, activo cuando `pathname === "/about"`.
- [ ] Enviar el formulario con nombre, email y mensaje válidos dispara una petición real a `/api/contact` y el correo llega a `shaddeveloper@gmail.com` con `reply_to` igual al email ingresado, asunto `"Nuevo mensaje de contacto — Arcade Vault"` y el nombre/email/mensaje en el cuerpo.
- [ ] Enviar el formulario con algún campo vacío dispara el `shake` sin llamar al endpoint.
- [ ] Enviar el formulario con un email con formato inválido dispara el `shake` sin llamar al endpoint.
- [ ] Mientras la petición está en curso, el botón de envío muestra "ENVIANDO…" y queda deshabilitado.
- [ ] Al confirmar éxito real desde el servidor, se muestra la terminal de éxito con el nombre en mayúsculas, igual al template.
- [ ] Si `/api/contact` responde error (simulado quitando/invalidando `RESEND_API_KEY`), se muestra un estado de error con opción de reintentar, sin perder lo escrito en el formulario.
- [ ] El campo honeypot (`website`) no es visible ni alcanzable por tab; si llega con contenido, el endpoint responde éxito sin enviar el correo vía Resend.
- [ ] `.env.example` existe versionado con `RESEND_API_KEY=`; `.env.local` (con la key real) no aparece en `git status` como archivo para commitear.
- [ ] `npm run build` y `npm run lint` pasan sin errores.

## Decisiones tomadas y descartadas

- **API Route (`app/api/contact/route.ts`)** (elegido por el usuario) sobre Server Action: patrón estándar de Next para no exponer la API key de Resend al navegador, y deja un endpoint HTTP explícito y testeable por separado del componente de UI.
- **Remitente `onboarding@resend.dev`** (elegido por el usuario) sobre un dominio propio verificado: no hay dominio verificado en Resend todavía; permite enviar de inmediato. Ver riesgo abajo sobre restricciones del dominio de pruebas.
- **`reply_to` con el email del formulario** (elegido): permite responder directo desde el cliente de correo del equipo sin copiar el email del cuerpo del mensaje.
- **Validación de formato de email + estado de error + estado de carga** (elegidos, los tres) agregados sobre el prototipo original: el prototipo solo validaba "no vacío" y no tenía red real de por medio; con envío real estos tres estados son necesarios para no dejar al usuario sin feedback.
- **Honeypot simple** (elegido) sobre no tener protección o sobre captcha: protección básica de bajo costo; captcha/rate-limiting quedan fuera de scope explícitamente.
- **Terminal de éxito idéntica al template, mostrada recién tras respuesta real** (elegido) sobre una versión de progreso línea-por-línea: mantiene el port 1:1 visual del prototipo con el mínimo trabajo adicional, solo retrasando su aparición hasta la confirmación real del servidor.
- **Nav dice "Sobre nosotros", pero el copy dentro de la página (kicker, título) se mantiene igual al template ("ACERCA DE")** (elegido por el usuario, explícito): son dos textos distintos a propósito — el link de navegación usa la etiqueta que pidió el usuario, el contenido de la página sigue el template al pie de la letra.
- **Ruta `/about` en inglés** (elegido por el usuario, explícito) sobre `/acerca-de`: continúa el patrón ya sentado en spec 02 (`/games`) de rutas en inglés cuando el usuario lo pide explícitamente, aunque diverja de la convención en español de spec 01.
- **`.env.local` para la API key + `.env.example` versionado como plantilla** (elegido): `.env.local` ya está cubierto por `.env*` en `.gitignore`, evitando que la key se suba a git; `.env.example` documenta la variable requerida para cualquiera que clone el repo.
- **Sin persistencia de mensajes enviados** (elegido): el correo es el único registro; no se guarda copia en DB ni localStorage, evitando modelar almacenamiento nuevo para un dato que no se reutiliza en ninguna otra pantalla.

## Riesgos identificados

- **Restricciones del dominio de pruebas de Resend (`onboarding@resend.dev`).** Cuentas de Resend sin dominio verificado pueden tener límites de envío o restricciones sobre a qué direcciones se puede enviar. Mitigación: verificar manualmente en el paso 6 que el correo efectivamente llega a `shaddeveloper@gmail.com`; si Resend lo bloquea, el siguiente paso sería verificar un dominio propio (fuera de este spec).
- **`RESEND_API_KEY` ausente o inválida en tiempo de ejecución.** Como la key se deja manualmente en `.env.local` fuera de esta conversación, el primer build/test podría fallar si el archivo no existe todavía. Mitigación: el endpoint responde `500` con mensaje claro en logs de servidor (no en el cliente, para no filtrar detalles), y el criterio de aceptación de "estado de error" cubre justamente este caso.
- **Contenido del formulario se pierde si el usuario recarga tras un error.** No hay borrador guardado entre sesiones. Mitigación: el estado de error no limpia el formulario dentro de la misma sesión de React, solo se pierde en un refresh completo — aceptable para este scope.
