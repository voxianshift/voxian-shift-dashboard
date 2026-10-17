# Career onboarding

`/home` offers two distinct input modes: AI Chat or Questionnaire. They update the same draft profile and preserve answers when switching. AI Chat uses one natural follow-up at a time; it does not render questionnaire cards below the conversation. Questionnaire has structured fields, Back, Continue, and Skip, without a chat transcript or composer.

The right-hand summary opens a shadcn Sheet for edits. The Sheet groups fields under Your work, Your next step, and Preferences, with a fixed Save/Cancel footer. Edits remain local to the Sheet until saved; cancelling or closing discards them. Sonner reports saves, clears, confirmation, and chat failures. Chat errors also remain beside the composer, and failed messages are preserved.

Review replaces the entry heading with a starting-picture card. A supported main occupation is necessary to confirm a personal baseline. Task mix may be omitted, but default routine weights are disclosed before confirmation and in the Meter. Goals and other preferences remain optional. Skipping every question or describing unsupported work never confirms a personal score. The Meter shows an empty state until confirmation, unless the user explicitly chooses an example (`/meter?example=1`).

The Your workspace shortcuts appear in a separate card only for a confirmed, supported profile. They do not appear inside a chat or questionnaire. Home always shows The Meter in its toolbar, including narrow screens with a collapsed sidebar. An empty or unsupported Meter explains the missing input and opens the profile Sheet directly. A supported profile always shows a View my Meter action in the starting-picture sidebar, including during AI Chat. This confirms the displayed baseline and opens its local calculation. Visiting `/meter` with an unconfirmed supported draft offers Calculate my Meter directly; empty and unsupported profiles remain unscored. Meter task-mix switches are temporary comparisons, and Reset restores the saved role and mix. Explicit example mode uses its own routine defaults. Confirmation opens the Meter and its existing local calculation immediately; there is no artificial calibration delay or blocking overlay.

The profile is stored in `sessionStorage` for the current browser tab. It survives reloads, is not an account, and can be removed with Clear profile. Lumi conversation turns are saved in Postgres and restored on page load. An opaque, HttpOnly, SameSite=Strict guest cookie identifies this browser for 30 days; the database stores only its SHA-256 hash. This is browser ownership, not an account or cross-device sync. Clear profile deletes the browser’s stored conversation before clearing local answers; failures preserve both. Existing conversations lost before this feature cannot be recovered. When storage is blocked, the interface reports that the profile will be lost on reload. Do not treat tab storage as secure storage on a shared device.

## API and providers

LLM integration lives in `apps/api/src/onboarding.ts`, registered by Fastify's `buildApp`. The web app has no provider handler or LLM credentials. Next.js proxies `/api/*` to `API_BASE_URL` (default `http://127.0.0.1:8080`). Configure this destination before building the web deployment because Next.js rewrites are built into the route manifest.

Actual backend routes:

- `GET /onboarding/status` → `{ connected, provider }`. Status means credentials are configured; it does not verify them with the provider.
- `GET /onboarding/conversation` → `{ messages }`; initializes the private guest cookie if missing.
- `DELETE /onboarding/conversation` → 204; deletes only this guest’s turns and rotates the cookie.
- `POST /onboarding/chat` → `{ reply, updates }`. Body contains `message`, `profile`, `question`, and up to 12 recent `history` messages. History is loaded from Postgres on the server; supplied history cannot overwrite stored context. Successful replies are saved atomically with the user message before returning. Shared Zod schemas live in `packages/shared/src/onboarding.ts`.

The browser uses `/api/onboarding/status` and `/api/onboarding/chat` through the same-origin proxy. Run both services with `pnpm dev`, or `pnpm dev:api` and `pnpm dev:web` in separate terminals. The API accepts browser requests from `WEB_ORIGIN` (default `http://localhost:3000`). Set the public web origin on deployment.

### Postgres chat storage

Run `pnpm db:up`, set `DATABASE_URL` in `apps/api/.env`, then run `pnpm --filter @voxian/api db:migrate`. Migration `apps/api/migrations/001_chat_turns.sql` adds an indexed chat-turn table without changing existing assessment data. Run the migration against the deployment database before releasing the API; the migration is repeatable. All queries use parameters and a bounded pool. Missing/unavailable storage blocks chat, with retry feedback; Questionnaire still works locally. Production cookies require HTTPS.

Run the real database test with `TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/voxian pnpm --filter @voxian/api test`. It writes isolated synthetic owners, reopens connections to verify durability, checks SQL-like text stays data, verifies isolation/deletion, and removes its rows.

### Rootsys for MVP

Add credentials to `apps/api/.env`, which is ignored by Git:

```dotenv
CHAT_PROVIDER=rootsys
ROOTSYS_API_KEY=your-key
ROOTSYS_MODEL=glm-5.3-flashx
WEB_ORIGIN=http://localhost:3000
```

Rootsys is the default even if `GEMINI_API_KEY` exists. Its [official setup](https://rootsys.cloud/setup) documents OpenAI-compatible `POST https://rootsys.cloud/v1/chat/completions` with Bearer authentication. The selected model appears in its [catalogue](https://rootsys.cloud/models). Requests use JSON-object output plus an explicit schema in the system message; the API independently validates the returned profile patch. Do not put provider secrets in the web environment or prefix them with `NEXT_PUBLIC_`.

### Gemini for submission/demo

Set `CHAT_PROVIDER=gemini`, `GEMINI_API_KEY`, and optionally `GEMINI_MODEL` in the API environment. Restart the API. Rootsys failures never automatically fall back to Gemini. The web identifies the selected provider and shows the corresponding data-use disclosure.

Providers only extract draft preferences; they never set scores or confirm profiles. The user reviews and confirms before the Meter and Navigator use the profile. With no key, Questionnaire and the profile Sheet still work locally. Authentication failures offer Questionnaire instead; other errors preserve the message for retry. No provider error bodies or keys are returned to the client.

The API enforces a 48 KB request limit, origin checks, a 20-second provider timeout, no-store responses, and a process-wide limit of 20 provider calls per minute. Use a shared quota and deployment-level access controls before scaling public traffic. Configure provider budget limits independently.

## Baselines and plans

Two curated, illustrative task models are supported: Customer Support Specialist and Administrative & Executive Assistant. Multiple occupations may be selected, but the user must choose a primary role. The Meter shows one occupation at a time, never an unweighted blend. Routine, exception-heavy, and mixed weights feed the existing deterministic scoring function. The mixed option averages the two demo weight sets.

Unsupported work is kept as a description without a numerical exposure score. Navigator labels customer-support fallback paths as examples. Confirmed occupation and strengths affect suggested branches; available time seeds the plan pace. Other preferences remain visible as planning context, not a claim that all constraints have been solved by a generated plan. Plan steps are local templates, not Gemini-generated career advice.

Tests: `pnpm exec vp run -r test`. Tests cover optional progress, primary-role consistency, unsupported occupations, model weights, input/output validation, credential handling, quota, and provider failure paths. Gemini branch follows [Gemini structured output documentation](https://ai.google.dev/gemini-api/docs/generate-content/structured-output) for the REST request format.

## Occupation matching

Profiles now accept confirmed O*NET occupation codes and authoritative titles, preserving old demo IDs for compatibility. Role selection is stored in Postgres; other preferences remain in tab storage. Lumi returns catalogue candidates separately from profile patches, and users confirm matches explicitly. Recognised roles without an exposure model show Baseline being prepared. See [occupation catalogue](occupation-catalogue.md) for import, sources, APIs and coverage.
