# Voxian Shift — Tech Stack (current)

Updated 16 Oct 2026. This replaces the stack described in "Voxian Shift Prototype Specification.md" §2 (Next.js 14 API routes, Tailwind CDN) and fills in VS-03 in "Project tracking".

## Repository

  - One monorepo: `github.com/voxianshift/voxian-shift-dashboard` (branch `main`)
  - `voxian-shift-api` repo is not used
  - Toolchain: **Vite+** (`vp`), created with `vp create vite:monorepo`, pnpm workspaces

| Path              | What it is                                                                                                                        |
| :---------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web`        | Frontend: **Next.js 16 (App Router)**, React 19, Tailwind CSS v4, shadcn/ui (Radix, Nova preset), react-hook-form + zod           |
| `apps/api`        | Backend: **Node.js + Fastify 5**, Firebase Admin SDK (Auth, Firestore). Deploys to Cloud Run                                      |
| `packages/shared` | Shared TypeScript: deterministic exposure scoring ($E = 100 \\times \\sum w\_i \\cdot e\_i$), later the catalog and API contracts |

## Commands (repo root)

  - `vp install`: install dependencies
  - `vp run ready`: format + lint + type check, tests, and both builds
  - `vp run dev`: run web and api together; `vp run dev:web` / `vp run dev:api` for one
  - `vp check --fix`: auto-format

## Code style

  - No semicolons (enforced by `vp check`, which uses oxfmt with `semi: false`)
  - Double quotes, oxlint with type-aware checks

## Google services

  - Firebase Auth (anonymous) + Firestore through `firebase-admin` on the API, using Application Default Credentials (Cloud Run service account in prod, `gcloud auth application-default login` locally)
  - Gemini on Vertex AI: planned, not wired yet (VS-06 / VS-26)
  - Hosting: Firebase Hosting for `apps/web` (to confirm in VS-12), Cloud Run for `apps/api`
