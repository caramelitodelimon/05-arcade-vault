# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md



No test runner is configured — there is no test script, framework, or test file in the repo. If tests become necessary, ask which runner to add rather than assuming one.

## Skills
Usa siempre  /frontend-desing para diseñar interfaces de usuario.

## Stack

Next.js 16.3.0 (App Router) · React 19.2.8 · TypeScript strict · Tailwind CSS v4 · ESLint 9 flat config.

Two consequences worth remembering, both easy to get wrong from older training data:

- **Tailwind v4 is CSS-first.** There is no `tailwind.config.js`. `app/globals.css` does `@import "tailwindcss"` and declares design tokens inside an `@theme inline { ... }` block; PostCSS wiring lives in `postcss.config.mjs` via `@tailwindcss/postcss`. Add theme values to the `@theme` block, not to a JS config.
- **Next 16 generates route-typed props.** `app/layout.tsx` types its props as `LayoutProps<"/">` — a global type generated per route into `.next/types`, not a hand-written `{ children: React.ReactNode }`. Use `LayoutProps<"/route">` / `PageProps<"/route">` for new routes. Per `AGENTS.md`, read the relevant guide under `node_modules/next/dist/docs/` before writing framework code.

Path alias: `@/*` → repo root.

## Current state

`app/` is still the untouched `create-next-app` scaffold (`layout.tsx`, `page.tsx`, `globals.css`). Essentially nothing of the product has been implemented yet — treat almost any feature request here as greenfield.

## The design prototype in `references/`

`references/templates/` is the **source of truth for the product's UX and visual design**, and is not part of the built app. It's a standalone browser prototype: `Arcade Vault.html` loads React 18 + Babel from CDN and pulls in each `.jsx` file as a `text/babel` script, so the files share one global scope — no imports, no modules, and component names are globals. Do not copy that structure into `app/`; read it for behavior and styling, then port to real App Router components.

What it defines:

| Prototype file | Component | Screen (route name) |
| --- | --- | --- |
| `nav.jsx` | `Nav` | persistent top nav |
| `biblioteca.jsx` | `Library` | `biblioteca` — game catalog with category filter |
| `detalle.jsx` | `GameDetail` | `detalle` — single game page |
| `reproductor.jsx` | `GamePlayer` | `player` — plays a game, reports a score |
| `auth.jsx` | `Auth` | `auth` — sign in |
| `salon.jsx` | `HallOfFame` | `salon` — leaderboard |

- `app.jsx` holds the whole prototype's state: routing is a JSON blob in `location.hash`, the session user is `localStorage["av_user"]`, and submitted scores are appended to `localStorage["av_scores"]`. These are prototype stand-ins for real routing/auth/persistence — port the *screens and flows*, not the hash router or localStorage.
- `data.jsx` is mock data: the `GAMES` array (id, title, short/long copy, `cat`, `cover`, `color`, `best`, `plays`), `CATS`, and `seededScores()` for fake leaderboard rows. Keep game ids and shapes stable when moving to real data.
- `styles.css` (~950 lines) carries the neon-arcade theme: CSS custom properties on `:root` (`--bg`, `--ink`, `--cyan`, `--magenta`, `--yellow`, `--green`, gold/silver/bronze rank colors, `--pixel`/`--mono` font stacks) plus the `av-bg` perspective-grid / scanline / noise layers and `av-`prefixed component classes. Port these tokens into the `@theme` block in `globals.css` when building the real UI.
- Prototype fonts are Google Fonts (`Press Start 2P`, `JetBrains Mono`, `Courier Prime`); the scaffold currently uses Geist via `next/font/google`.

## Conventions

- **All user-facing copy is in Spanish**, as is the project's own documentation. Match that.
- Per `README.md`, this project follows spec-driven development using the `/spec` and `/spec-impl` skills from [Klerith/fernando-skills](https://github.com/Klerith/fernando-skills) (`npx skills@latest add Klerith/fernando-skills`). Those skills are not currently installed in this checkout; prefer writing a spec before implementing a feature.
