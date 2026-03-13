# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Core development commands

- Install deps: `pnpm install`
- Start dev server: `pnpm dev`
- Build production app: `pnpm build`
- Run production server (after build): `pnpm start`
- Lint: `pnpm lint`
- Static export: `pnpm export`

### PWA / Android packaging commands

- Build PWA artifacts + validate required files: `pnpm build:pwa`
- Deploy PWA helper script: `pnpm deploy:pwa`
- Install Bubblewrap CLI globally: `pnpm apk:setup`
- Capacitor Android sync/open flow (from docs): `pnpm build && npx cap sync android && npx cap open android`

### Tests

- There is currently no test script or test framework configured in `package.json`.
- Single-test execution is not available until a test runner is added.

## Big-picture architecture

## Runtime stack

- Next.js App Router app (React + TypeScript) with routes in `app/`.
- Authentication via Auth.js/NextAuth v5 beta with Google OAuth + credentials.
- Data persisted in MongoDB using Mongoose models and API route handlers.
- UI is primarily client-rendered for dashboard/workout flows.
- PWA behavior is first-class (service worker + manifest + install prompts), with optional Android packaging through Capacitor/TWA tooling.

## Auth architecture (important split)

- `auth.config.ts` is edge-safe config (providers/pages only) and is reused by middleware.
- `proxy.ts` uses edge-safe config to protect most routes and redirect unauthenticated users to `/sign-in`.
- `auth.ts` is server-side full auth setup (MongoDB adapter + credentials provider + JWT/session callbacks).
- `/api/auth/[...nextauth]` exports handlers from `auth.ts`.

This split is intentional: middleware must remain edge-compatible (no DB adapter imports there).

## Data flow and persistence model

- API routes under `app/api/**` are the backend surface for workouts, goals, templates, profile, user settings, and AI workout generation.
- Most client-side data access goes through `lib/*-storage.ts` modules (e.g. `lib/workout-storage.ts`, `lib/goal-storage.ts`) which call `/api/*` endpoints via `fetch`.
- These storage modules dispatch browser events (e.g. `workoutDataChanged`, `goalDataChanged`) that components use for refresh synchronization.
- Active in-progress workout state is separate from persisted workouts and is stored in `localStorage` via `lib/workout-session-storage.ts`.

## Domain model layout

- Mongoose schemas are in `lib/models/*`:
  - `workout.ts`, `goal.ts`, `template.ts`, `profile.ts`, `user.ts`
- Connection utilities:
  - `lib/mongoose.ts` for Mongoose model operations
  - `lib/mongodb.ts` for MongoDB adapter client promise
- Both connection layers cache connection promises in development globals to survive hot reloads.

## App structure

- `app/layout.tsx` wires global providers and shell concerns:
  - `SessionProvider` (auth session)
  - `ThemeProvider`
  - bottom navigation, toaster, session cleanup/guard components
  - service worker registration and cache cleanup script
- `app/page.tsx` is the main dashboard and orchestrates:
  - onboarding gate (`/api/profile` + redirect to `/onboarding` when incomplete)
  - dashboard/new-user branching
  - stats/templates/recent-workouts components
- Feature routes (examples): `log-workout`, `progress`, `goals`, `templates`, `generate-workout`, `profile`, `settings`.

## AI workout generation

- Endpoint: `app/api/ai/generate-workout/route.ts`
- Uses Anthropic SDK and expects `ANTHROPIC_API_KEY`.
- Includes an in-memory per-user daily rate limiter (10/day).
- Returns structured workout JSON parsed from model output.

## Project-specific caveats

- TypeScript build errors are currently ignored in production builds (`next.config.mjs` sets `typescript.ignoreBuildErrors = true`).
- Path alias `@/*` maps to repository root (see `tsconfig.json`).
- This codebase uses `pnpm` (lockfile is `pnpm-lock.yaml`).
