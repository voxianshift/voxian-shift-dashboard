# Career onboarding

See [architecture](../ARCHITECTURE.md) for runtime diagrams, anonymous identity, storage schemas and local-to-Cloud-SQL deployment.

`/` opens `/onboarding`, which has five screens defined in `apps/web/src/lib/onboarding-flow.ts`. The dashboard waits for the saved profile and onboarding completion flag. A main occupation, task focus, weekly learning time and timeline are required to finish the current UI flow; other answers are optional. Returning guests with completed onboarding continue to Home.

`/home` provides role review/editing through one flow: search by job title or duties, choose matching occupations, select a main role, then confirm and open the Meter. Up to five occupations are supported. A description or display label alone cannot unlock the Meter. Goals, strengths and other optional preferences can be edited through the profile Sheet; weekly time and timeline were required during initial onboarding. No chat/questionnaire mode chooser or separate completion card appears on Home.

Returning visitors see their saved main role and Continue to my Meter, with secondary Change roles and Edit preferences actions. Role choices save to Postgres before navigation; failure keeps edits and shows a Sonner toast. Confirmation atomically uses the server-returned role IDs and titles, including catalogue roles outside the two demo models. Confirmation means the user selected their role; it does not guarantee research coverage or create a score.

The right-side shadcn Sheet groups fields under Your work, Your next step, and Preferences. Edits remain local until Save; Cancel discards them. Reset remains beside the profile card heading. Both reset scopes wait for the server before clearing local state and preserve answers if the request fails. Cancel leaves everything intact. Other open tabs load the latest saved profile on reload.

Full profile answers, confirmation, skipped questions and onboarding completion now live in Postgres `guest_profiles`. An opaque HttpOnly, SameSite=Strict guest cookie identifies records for 30 days; Postgres stores only its SHA-256 hash. This is browser ownership, not an account or cross-device sync. Clearing cookies loses access. Profile edits autosave after 500 ms; explicit saves and onboarding completion await the database. Load failures offer Retry without overwriting saved data. Legacy session answers migrate only when no database profile exists.

`guest_commitments` stores the chosen target role, strategy, generated plan, schedule and completed session dates. Progress and schedule changes await successful saves. Existing localStorage commitments migrate when no database commitment exists; server data wins thereafter. Calculated exposure and temporary canvas state are not stored. Lumi history persistence is unchanged.

Guest endpoints: `GET/PUT /api/guest/profile`, `GET/PUT /api/guest/commitment`, and `DELETE /api/guest/state?scope=profile|all`. Profile saves update `career_occupation_selections` in the same transaction and use catalogue titles. Restart profile clears answers and role choices but keeps plan/progress and chats. Reset everything also clears plan/progress and existing chat data without depending on pgvector availability. Apply `apps/api/migrations/005_guest_state.sql` before running this version (included in `pnpm --filter @voxian/api db:migrate`).

## CV upload and review

Your work in onboarding and the profile editor accept PDF, DOC, DOCX and UTF-8 TXT files up to 2 MB. PDF uploads are limited to 20 pages and extracted text to 64,000 characters. The server validates format signatures; DOCX actual and declared expanded archive content is bounded to 16 MB before parsing. Parsing uses PDFParse, Mammoth and word-extractor without executing document macros.

`POST /api/onboarding/cv?format=pdf|doc|docx|txt` returns structured job titles, skills, duties, non-identifying employer context, keywords, AI extraction confidence and up to three catalogue matches. It uses the configured provider: production currently selects Gemini Developer API / Google AI Studio credentials (verified 19 October 2026). Both supported Gemini transports accept PDF inline document input, including scanned pages. AI instructions embedded in documents are untrusted. Extraction confidence is a model estimate, not a calibrated probability or the SQL role-match percentage.

Confidence below 0.6, missing job titles or missing keywords returns `needs_review` with no occupations or career signals. No low-confidence data enters profile or planning. Unrelated chat payloads strip CV context. This is an in-request quarantine/fallback state, not a persistent raw-document queue.

Users review details and choose **Use reviewed CV details** or **Discard**. Acceptance never confirms an occupation or sets exposure; users choose a reviewed match separately. Profile editor acceptance edits its draft only; Cancel discards it, Save persists it. Onboarding acceptance enters the existing autosaved draft. **Remove CV details** clears accepted context; both profile reset scopes clear it too.

Accepted `profile.cvContext` is schema-validated (confidence at least 0.6, `reviewed: true`) and saved in guest profile JSONB. Old profiles omit it. It is included in Navigator/Flightplan context and profile revision; user-stated strengths remain separate. Raw file, original text and filename are not persisted. Provider failures preserve previous accepted context. See [source audit and CV contract](contracts/cv-processing.md).

## API and providers

LLM integration lives in `apps/api/src/onboarding.ts`, registered by Fastify's `buildApp`. The web app has no provider handler or LLM credentials. Next.js proxies `/api/*` to `API_BASE_URL` (default `http://127.0.0.1:8080`). Configure this destination before building the web deployment because Next.js rewrites are built into the route manifest.

Actual backend routes:

- `GET /onboarding/status` → `{ connected, provider }`. Status means credentials are configured; it does not verify them with the provider.
- `GET /onboarding/conversation` → `{ messages }`; initializes the private guest cookie if missing.
- `DELETE /onboarding/conversation` → 204; deletes only this guest’s turns and rotates the cookie.
- `POST /onboarding/chat` → `{ reply, updates }`. Body contains `message`, `profile`, `question`, and up to 12 recent `history` messages. History is loaded from Postgres on the server; supplied history cannot overwrite stored context. Successful replies are saved atomically with the user message before returning. Shared Zod schemas live in `packages/shared/src/onboarding.ts`.

Legacy chat clients can use `/api/onboarding/status` and `/api/onboarding/chat` through the same-origin proxy. Home uses the occupation routes instead. Run both services with `pnpm dev`, or `pnpm dev:api` and `pnpm dev:web` in separate terminals. The API accepts browser requests from `WEB_ORIGIN` (default `http://localhost:3000`). Set the public web origin on deployment.

### Postgres chat storage

Run `pnpm db:up`, set `DATABASE_URL` in `apps/api/.env`, then run `pnpm --filter @voxian/api db:migrate`. Migration `apps/api/migrations/001_chat_turns.sql` adds an indexed chat-turn table without changing existing assessment data. Run the migration against the deployment database before releasing the API; the migration is repeatable. All queries use parameters and a bounded pool. Missing/unavailable storage blocks chat and role saves. Home preserves unsaved role selections for retry. Production cookies require HTTPS.

Run the real database test with `TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/voxian pnpm --filter @voxian/api test`. It writes isolated synthetic owners, reopens connections to verify durability, checks SQL-like text stays data, verifies isolation/deletion, and removes its rows.

### Rootsys for MVP

Add credentials to `apps/api/.env`, which is ignored by Git:

```dotenv
CHAT_PROVIDER=rootsys
ROOTSYS_API_KEY=your-key
ROOTSYS_MODEL=glm-5.3-flashx
WEB_ORIGIN=http://localhost:3000
```

Gemini Developer API (Google AI Studio credentials) is the current production provider and local default; `GEMINI_MODEL` optionally overrides the model. For Gemini on Vertex AI set `CHAT_PROVIDER=vertex` instead; it uses Application Default Credentials and needs no key. Requests use JSON output with a response schema; the API independently validates the returned profile patch. Do not put provider secrets in the web environment or prefix them with `NEXT_PUBLIC_`.

Providers only extract draft preferences; they never set scores or confirm profiles. The user reviews and confirms before the Meter and Navigator use the profile. Home role search and the profile Sheet do not use the chat provider. No provider error bodies or keys are returned to the client.

The API enforces a 48 KB request limit, origin checks, a 20-second provider timeout, no-store responses, and a process-wide limit of 20 provider calls per minute. Use a shared quota and deployment-level access controls before scaling public traffic. Configure provider budget limits independently.

## Baselines and plans

Two curated, illustrative task models are supported: Customer Support Specialist and Administrative & Executive Assistant. Other catalogue roles can use ISCO-08 mappings and ILO task exposure data, as documented below. Multiple occupations may be selected, but the user must choose a primary role. The Meter shows one occupation at a time, never an unweighted blend. Routine, exception-heavy, and mixed weights feed the existing deterministic scoring function. The mixed option averages the two demo weight sets.

Work without a matching research baseline receives no numerical exposure score. Navigator now generates paths from the actual saved occupation and preferences; there is no customer-support fallback. All saved career preferences are sent as planning context; available time also seeds the plan pace. Recommendations remain guidance, not a guarantee that every constraint can be met. Navigator may request a generated plan through its own API.

Tests: `pnpm exec vp run -r test`. Tests cover optional progress, primary-role consistency, unsupported occupations, model weights, input/output validation, credential handling, quota, and provider failure paths. Gemini branch follows [Gemini structured output documentation](https://ai.google.dev/gemini-api/docs/generate-content/structured-output) for the REST request format.

## Occupation matching

Profiles accept O*NET codes and authoritative titles, preserving legacy demo IDs. Role choices are stored in Postgres; other preferences remain in tab storage. Input readiness is separate from exposure-model coverage. General catalogue roles load an ISCO-08 crosswalk and ILO task exposure data when available; missing coverage shows an empty state without a numeric score. See [occupation catalogue](occupation-catalogue.md) for sources, routes and coverage.

When optional CV vector retrieval is enabled, reviewed skill/keyword/duty phrases and their derived embeddings are cached per guest and CV revision in PostgreSQL. Raw documents remain unstored. Removing/replacing CV context or resetting the guest clears derived private vectors; phrases are not added to the shared requirement catalogue. See [CV skill alignment](contracts/cv-skill-alignment.md) for shadow/active mode and provider details.
