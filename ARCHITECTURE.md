# Voxian Shift architecture

Audited on **18 October 2026, Asia/Kuala_Lumpur** against application revision `df08dec`, repository code, live Cloud Run configuration, Cloud SQL metadata, and aggregate catalogue counts. This describes the deployed MVP, including its limitations. Resource names and observed settings are a dated snapshot, not an infrastructure provisioning specification.

## 1. What the app does

Voxian Shift helps a guest identify their current occupation, explore task exposure to generative AI, compare career directions, commit to a learning plan, and log study sessions. There is **no user sign-in** in the current product.

The application has three main parts:

| Part           | Responsibility                                                                                                           | Entry point                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Web            | Next.js 16.4.2, React 19, Tailwind 4, shadcn/Radix UI and React Flow; onboarding and dashboard UI; same-origin API proxy | [Web application](apps/web/src/app), [Next configuration](apps/web/next.config.ts) |
| API            | Fastify 5 on Node.js 24; validation, occupation lookup, guest persistence and AI orchestration                           | [Server](apps/api/src/server.ts), [application registration](apps/api/src/app.ts)  |
| Shared package | Zod contracts, profile and plan types, deterministic scoring and reviewed resource metadata                              | [Shared exports](packages/shared/src/index.ts)                                     |

The repository is a pnpm workspace. Vite+ runs formatting, linting, type checking and tests. The API uses parameterized SQL through the `pg` PostgreSQL driver.

## 2. PostgreSQL storage

**The app uses PostgreSQL directly through its Fastify API.** Local development connects to Docker PostgreSQL; production connects to Cloud SQL for PostgreSQL. Product schemas are managed by numbered SQL files in [API migrations](apps/api/migrations).

The active data path is **Browser → Next.js → Fastify API → `pg` → PostgreSQL**. Local and production databases are separate; promoting a release applies the same migrations and approved reference data to the target database rather than automatically copying local guest records.

### Trial status

Provisioning records identify the Cloud SQL instance as a no-cost trial. Live metadata shows the expected `db-f1-micro` tier and trial-related provisioning label. These are evidence of configuration, **not confirmation of active billing entitlement or an exact expiry date**.

The documented Cloud SQL trial for eligible Blaze projects lasts three months with the default configuration. Configuration changes can end the trial, and standard charges apply afterward. See [official Cloud SQL trial terms](https://firebase.google.com/docs/sql-connect/pricing). Verify this project's entitlement, end date and actual charges in its billing console. This audit did not inspect invoices or trial eligibility. Do not treat an estimated date as a confirmed billing deadline or assume the whole app is free.

**Estimated trial end: 16 January 2027.** The live Cloud SQL API reports creation at `2026-10-16T04:43:46.127Z` (16 October 2026, 12:43:46 MYT), and the project has billing enabled. Adding the published three-month trial period gives this planning estimate. The API exposes no expiry field; Firebase and Cloud console pages failed to load during the check. Active eligibility, exact expiry and any early termination remain unverified.

## 3. Runtime topology

### Local development

```mermaid
flowchart LR
  Browser[Browser at localhost:3000] --> Web[Next.js dev server]
  Web -->|/api/* rewrite| API[Fastify at localhost:8080]
  API -->|pg TCP localhost:5433| PG[(Docker PostgreSQL 18)]
  PG --- Volume[Named pgdata volume]
  API --> Data[Versioned JSON datasets]
  API -->|Configured provider only| AI[Rootsys / Gemini / Vertex AI]
```

Only PostgreSQL runs in Docker during the normal local workflow. Web and API run as host Node processes. Docker publishes host port `5433` to database container port `5432`; `DATABASE_URL` used by the host API must use `5433`.

### Production

```mermaid
flowchart LR
  Browser[Guest browser over HTTPS] --> Web[Cloud Run: voxian-web]
  Web -->|Build-time /api/* rewrite| API[Cloud Run: voxian-api]
  API -->|pg via attached Cloud SQL Unix socket| SQL[(Cloud SQL: voxian-db / voxian)]
  Secrets[Secret Manager] -->|DATABASE_URL and configured API secrets| API
  API -->|ADC service-account token: current provider| Vertex[Gemini on Vertex AI]
  Data[JSON datasets in API image] --> API
```

Browsers receive no PostgreSQL credentials or server AI keys.

### Observed deployment snapshot

| Setting                                | Observed value                                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Google Cloud project / region          | `voxian-shift-app` / `asia-southeast1`                                                                       |
| Frontend URL                           | [voxian-web](https://voxian-web-184581024855.asia-southeast1.run.app)                                        |
| API URL                                | [voxian-api](https://voxian-api-184581024855.asia-southeast1.run.app)                                        |
| Deployed application revision          | Both images tagged `df08dec2c9640102b6964945622cca8e351e4447`                                                |
| Web / API Cloud Run revisions          | `voxian-web-00026-n2v` / `voxian-api-00032-7w2`                                                              |
| Readiness / traffic                    | Both Ready; 100% traffic to the revisions above                                                              |
| Runtime identities                     | `voxian-web@voxian-shift-app.iam.gserviceaccount.com`; `voxian-api@voxian-shift-app.iam.gserviceaccount.com` |
| Maximum instances / concurrency        | Each service: maximum 2 instances; concurrency 80                                                            |
| Cloud SQL connection name              | `voxian-shift-app:asia-southeast1:voxian-db`                                                                 |
| PostgreSQL database / API DB user      | `voxian` / `voxian_api`                                                                                      |
| Database version / tier / availability | PostgreSQL 18; `db-f1-micro`; Enterprise edition; zonal                                                      |
| Database state / activation policy     | `RUNNABLE` / `ALWAYS`                                                                                        |
| Automated backups                      | `backupConfiguration.enabled=false`; no restore drill verified                                               |
| Current production AI provider         | `CHAT_PROVIDER=vertex`, `VERTEX_MODEL=gemini-2.5-flash`                                                      |
| Database secret binding                | `DATABASE_URL` → `voxian-database-url:latest`                                                                |
| Additional AI secret binding           | `GEMINI_API_KEY` → `voxian-gemini-api-key:latest`; not the active Vertex authentication method               |

These settings can change independently of a Git commit. Provider defaults in example files are not proof of the live provider. The observed release completed in [deployment run 39050504435](https://github.com/voxianshift/voxian-shift-dashboard/actions/runs/39050504435).

## 4. Anonymous identity and request boundaries

[chat-store.ts](apps/api/src/chat-store.ts) creates a random 32-byte token as the `voxian_chat` cookie. The API stores its SHA-256 hash as `owner_hash` and derives that hash from the cookie for each request. Clients do not choose an `owner_hash` in a request body.

Cookie properties are `HttpOnly`, `SameSite=Strict`, `Path=/`, a 30-day maximum age, and `Secure` when `NODE_ENV=production`. Initial guest reads establish the cookie when absent. Mutating guest routes require an existing valid-format cookie, validate request data and check origin/cross-site headers.

This provides browser-scoped ownership, **not an account**. Clearing or expiring the cookie, using a different browser, or switching from localhost to the production hostname creates a different identity. There is no cross-device recovery, account merge or automated ownership transfer. Database rows are not automatically removed when the cookie expires.

The browser requests `/api/...` on the web origin. Next rewrites these requests to the API, preserving the same-origin browser experience. `WEB_ORIGIN` must match the actual frontend origin for guarded writes. The onboarding gate is a client UI gate, not server authentication or authorization. Bot screening, origin checks and `robots.txt` are not a substitute for ownership checks.

## 5. User journey and feature data flows

### Onboarding and profile

1. `/` redirects to `/onboarding`. The root [CareerProfileProvider](apps/web/src/components/career-profile-provider.tsx) loads `/api/guest/profile` before making the saved profile available.
2. A first-time guest sees seven screens: About you; Your work; Baseline Gravity; Daily workload; Moat & Strategic Posture; Time Horizon & Risk Appetite; Career North Star & Anxieties. See [step definitions](apps/web/src/lib/onboarding-flow.ts).
3. Job-title search calls `/api/occupations`. A CV can instead be uploaded to `/api/onboarding/cv?format=pdf|docx|txt` for matching.
4. CV processing accepts up to 2 MB, extracts text in memory and searches the catalogue. It does not persist the uploaded file or extracted text. Scanned PDFs without readable text can fail.
5. Draft profile changes autosave after 500 ms. Explicit profile saves and final onboarding completion await a database response. Failed loads/saves show Retry; the UI does not silently replace unavailable database data with an empty profile.
6. The [dashboard gate](apps/web/src/components/onboarding-gate.tsx) waits for restoration and redirects incomplete onboarding to `/onboarding`. Completion persists in the database, so it survives a new visit in the same browser.
7. If no database profile exists, the provider can import the former session-storage profile and legacy occupation selections. Once a database profile exists, it is authoritative.

The profile includes preferred name, current work, occupation choices and primary occupation, task mix, strengths, direction, learning hours, flexibility, timeline, risk appetite, goals, anxieties, skipped questions, confirmation and onboarding completion. A client confirmation is user acknowledgement, not research validation.

### Meter and Curve

The Meter uses the selected occupation and task mix. Two demonstration models retain explicitly illustrative weighted task inputs. Other supported roles use `/api/occupations/:code/meter`, which resolves O*NET → ISCO-08 and retrieves ILO task exposure data from image-bundled JSON. Strong crosswalk matches are preferred; weak/missing mappings can use AI assistance when configured. Unavailable coverage remains unavailable rather than receiving a fabricated personal score.

The shared scoring function computes `100 × sum(weight × exposure) / sum(weight)`. ISCO task models use equal task weights. ILO gradient classification uses task mean and standard deviation, not a job-loss probability. The numerical aggregation is deterministic; AI-assisted mapping can still affect which occupation's tasks enter the calculation. See [scoring](packages/shared/src/scoring.ts), [ISCO loader](apps/web/src/lib/isco-meter.ts), and [Meter route](apps/api/src/occupation-catalogue.ts).

The Curve is an illustrative scenario UI with local scenario/horizon selection, not a trained personal forecasting service. Temporary Meter overrides and Curve selection do not change the stored profile or write exposure snapshots to PostgreSQL.

### Navigator, plan and progress

1. [NavigatorProvider](apps/web/src/components/navigator-provider.tsx) sends the profile context to `/api/navigator/paths`. Its validated response is cached in session storage. Weekly hours, flexibility and timeline are excluded from the path-cache identity because they affect scheduling rather than the direction set.
2. The API verifies occupations against the catalogue and builds `automate`, `hybrid`, `pivot`, and `create` branches from reviewed occupation/family mappings. AI can personalize narrative and select reviewed resources; destination identifiers and course URLs are controlled by code/data.
3. Selecting a direction is exploratory. Committing a direction supplies a target, pace, start date, timezone, weekly minutes, study days and session limit to `/api/plan`.
4. Backend code creates the 90- or 120-day schedule and validates generated narrative against the plan contract. `/plan` returns a plan; generation alone does **not** persist a commitment.
5. [CommitDirectionDialog](apps/web/src/components/commit-direction-dialog.tsx) writes the selected target/strategy, generated plan and schedule to `/api/guest/commitment`. It waits for success before navigation or closing as saved.
6. Progress loads that commitment from PostgreSQL. Logging or undoing a session writes its completed calendar dates back to the commitment. Schedule changes also wait for successful persistence.

```mermaid
sequenceDiagram
  participant UI as Browser
  participant Web as Next proxy
  participant API as Fastify
  participant PG as PostgreSQL
  UI->>Web: PUT /api/guest/profile + cookie
  Web->>API: PUT /guest/profile
  API->>API: Validate state and derive owner hash
  API->>PG: BEGIN + owner advisory lock
  API->>PG: Validate selected codes; read catalogue titles
  API->>PG: Replace role selections and upsert profile state
  API->>PG: COMMIT
  API-->>UI: Canonical saved profile
```

### Lumi: separate persistence paths

The dashboard copilot posts to `/api/copilot/chat`, passes recent browser messages and returns structured actions. Its visible transcript lives in session storage. Clearing that transcript does not clear server memories. Copilot attempts asynchronous memory writes and embedding retrieval separately; missing embeddings and storage failures can degrade silently.

Legacy onboarding-chat endpoints use `lumi_chat_turns` for server history. Dashboard copilot does not use those history load/append methods. Therefore a history table or a successful schema migration does **not** mean dashboard chat history is durable. Durable dashboard history was explicitly excluded from the recent guest-state work.

See [copilot route](apps/api/src/copilot.ts), [legacy onboarding chat](apps/api/src/onboarding.ts), [chat store](apps/api/src/chat-store.ts), and [client provider](apps/web/src/components/lumi-chat-provider.tsx).

### API inventory

These are Fastify paths. Browser calls prepend `/api` through the Next rewrite; the web app does not implement separate database route handlers for them.

| API path                                                       | Role / dependency                                                                                |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `GET /health`                                                  | Process liveness and scoring version; no database/provider probe                                 |
| `GET /occupations?q=...`                                       | PostgreSQL reference search filtered to enabled occupation codes                                 |
| `GET /occupations/:code/meter`                                 | Bundled research data and crosswalk; AI assistance possible for weak mappings                    |
| `POST /onboarding/cv?format=...`                               | In-memory CV extraction and PostgreSQL search                                                    |
| `GET/PUT /guest/profile`                                       | Full owner-scoped profile state and transactional role synchronization                           |
| `GET/PUT /guest/commitment`                                    | Selected plan, schedule and completed-session dates; PUT accepts `null` to delete the commitment |
| `DELETE /guest/state?scope=profile\|all`                       | Owner-scoped profile restart or full data reset                                                  |
| `GET/PUT /onboarding/occupations`                              | Legacy role-only persistence, also used during profile migration                                 |
| `POST /navigator/paths`                                        | Reviewed branches plus optional AI personalization                                               |
| `POST /plan`                                                   | Validated schedule plus AI narrative; persistence is a separate commitment write                 |
| `POST /copilot/chat`                                           | Dashboard AI assistant; optional best-effort server memory                                       |
| `GET /onboarding/status`                                       | Provider configuration presence, not a live credential check                                     |
| `GET/DELETE /onboarding/conversation`, `POST /onboarding/chat` | Legacy database-backed onboarding conversation                                                   |

## 6. Data ownership and schemas

| Storage                                                                          | Contents / lifecycle                                                                                                            |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `occupation_categories`, `occupations`, `occupation_aliases`, `occupation_tasks` | Imported O*NET reference catalogue and full-text search data; shared across guests                                              |
| `exposure_baselines`                                                             | Two illustrative demo models, provenance and task inputs; not a table of scores for every occupation                            |
| `career_occupation_selections`                                                   | Owner-scoped known occupation codes and primary flag; foreign key to occupations; one-primary-role index                        |
| `guest_profiles`                                                                 | One owner-keyed JSONB profile-state record plus update time                                                                     |
| `guest_commitments`                                                              | One owner-keyed JSONB commitment: target, strategy, plan, schedule and completed-session dates; later saves replace that record |
| `lumi_chat_turns`                                                                | Legacy onboarding conversation turns, ordered by generated ID                                                                   |
| `lumi_chat_memories`                                                             | Best-effort copilot memory with embeddings when available; separate from visible transcript                                     |
| API image JSON                                                                   | O*NET/ISCO crosswalk, ILO task scores, reviewed Navigator destinations and family templates                                     |
| Browser session storage                                                          | Navigator response cache; dashboard Lumi transcript; old profile key is migration input only                                    |
| Browser local storage / cookies                                                  | Theme/sidebar UI preferences; old commitment key is migration input only; anonymous owner cookie                                |
| React state                                                                      | Temporary selections, map focus/zoom, open dialogs and unsaved profile-sheet drafts                                             |

[Guest schemas](packages/shared/src/guest.ts) validate profile state, plan content, dates and completion-date uniqueness. [GuestStore](apps/api/src/guest-store.ts) canonicalizes occupation IDs/titles and saves profile plus role rows in one transaction under an owner advisory lock. Its pool has a maximum of five connections and bounded connection/query timeouts. Catalogue and chat stores each have their own pool of up to five, so the API can use up to 15 database connections per process; increasing Cloud Run instance limits multiplies this capacity.

Profile and commitment reads/writes use `Cache-Control: no-store`. Profile writes are queued within a provider instance. There is no record revision or multi-tab conflict detection; concurrent guests sharing the same owner cookie use last-write-wins document updates. Progress records completed **dates**, not audited study durations or independently completed task/milestone rows. No full plan-version history is retained.

Reset scope `profile` removes profile and role choices but preserves commitment/progress and existing chats. Scope `all` also removes that owner's commitment and existing chat/memory records when present. Local legacy caches are cleared after server success. Other open tabs are not forcibly invalidated.

## 7. Reference data and coverage

Production aggregate counts verified during this audit:

| Dataset                                            |       Count |
| -------------------------------------------------- | ----------: |
| O*NET 31.0 occupations                             |       1,016 |
| Alternate title rows                               |      54,269 |
| O*NET task statements                              |      18,838 |
| SOC major categories                               |          23 |
| Illustrative exposure baseline rows                |           2 |
| Occupations in current Navigator curated allowlist |          25 |
| O*NET codes in bundled ISCO crosswalk              |         865 |
| Bundled ISCO occupation units / ILO tasks          | 427 / 3,264 |

**Imported coverage is wider than enabled product coverage.** Search and occupation-selection SQL filter to `curatedOccupationCodes`, derived from `navigator-pathways.json`. Importing 1,016 occupations does not make all 1,016 selectable. Current reviewed/family pathways are a prototype, not verified future job availability.

Search relevance combines title overlap and full-text ranking; displayed match percentage is relevance, not probability of suitability. Dataset import, source attribution and research limitations are documented in [occupation catalogue](docs/occupation-catalogue.md). The importer pins O*NET 31.0 and validates release counts before writing. Research JSON and Navigator mapping files ship with the API image; SQL migrations do not download or rebuild them.

## 8. Local setup from a clean checkout

Prerequisites: Node.js 24 recommended (repository minimum 22.18), pnpm 12.11.2 and Docker with Compose. Google Cloud CLI, credentials and Cloud SQL Auth Proxy are needed for production operations, not for normal local PostgreSQL development.

```sh
pnpm install --frozen-lockfile

test -f apps/api/.env || cp apps/api/.env.example apps/api/.env
test -f apps/web/.env || cp apps/web/.env.example apps/web/.env

pnpm db:up
pnpm --filter @voxian/api db:migrate
```

The API's local database setting is:

```dotenv
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/voxian
PORT=8080
WEB_ORIGIN=http://localhost:3000
```

The web application's local setting is:

```dotenv
API_BASE_URL=http://127.0.0.1:8080
```

These Docker credentials are local development defaults, not production credentials. Keep actual `.env` values out of Git. Local API dev/migration/import scripts load `apps/api/.env`; Next reads its web environment separately.

A fresh schema also needs catalogue data. Follow the pinned download/import commands in [occupation-catalogue.md](docs/occupation-catalogue.md#import), then run:

```sh
pnpm --filter @voxian/api db:import-occupations /tmp/voxian-onet-31.0
pnpm dev
```

Alternatively, run `pnpm dev:api` and `pnpm dev:web` in separate terminals. Open [local app](http://localhost:3000). Without a configured AI provider, deterministic catalogue/profile/Meter operations can run, but AI-only generation is unavailable and Navigator may return reviewed-only guidance.

`pnpm db:down` stops/removes the container while retaining its named volume. `pnpm db:reset` removes the volume and destroys local database contents; it is not a normal migration step. Never substitute a production database into the reset workflow.

## 9. SQL migrations and catalogue import

[The migration runner](apps/api/scripts/migrate.ts) reads matching numbered `.sql` files in lexical order and executes **all files on every run**. There is no migration ledger, checksum registry or automatic rollback system. Existing files use repeatable statements where practical; new migrations must account for replay. The runner does not wrap the whole migration set in one transaction.

| File                             | Purpose                                                                                      |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| `001_chat_turns.sql`             | Legacy chat-turn table and owner/order index                                                 |
| `002_occupation_catalogue.sql`   | Catalogue, demo baselines and guest occupation-selection tables                              |
| `003_match_scoring.sql`          | Alternate-title full-text index and `voxian_words` normalization function                    |
| `004_chat_memories_pgvector.sql` | Best-effort vector extension and memory table; `vector(768)` when supported, JSONB otherwise |
| `005_guest_state.sql`            | Full guest-profile and commitment JSONB tables                                               |

The standard `postgres:18` local image does not package pgvector. After migration, local memory embeddings use JSONB. Production verified pgvector `0.8.5` and a `vector` embedding column. Rerunning migration 004 **does not convert an existing JSONB column to vector**; that requires a separate reviewed conversion migration. Vector availability also does not prove the configured embedding provider works.

The catalogue importer is separate from migrations. It validates the pinned release before opening a transaction, serializes imports with an advisory lock, upserts reference data, refreshes aliases/tasks/search documents and preserves guest selections. Run it on each fresh database; ordinary application deployments need not reimport an unchanged catalogue.

## 10. Moving from Docker PostgreSQL to Cloud SQL

The normal promotion is **same application contracts + same SQL migrations + same reference data, with a different connection string**. It is not an automatic copy of a developer's Docker volume. Local cookies, profiles, commitments and sessions do not transfer to the production hostname.

### First-time infrastructure preparation

Use the existing project and instance rather than creating another database to match this document. Historical provisioning commands are in [deployment.md](docs/deployment.md). The API needs:

- Its existing Cloud SQL instance attachment and a database user with the required SQL privileges.
- Cloud SQL connection permission for its runtime service account.
- Secret Manager access to the selected `DATABASE_URL` secret.
- A production database URL using the Cloud Run socket:

  ```text
  postgresql://voxian_api:<secret-password>@localhost/voxian?host=/cloudsql/voxian-shift-app:asia-southeast1:voxian-db
  ```

This is a format example only; never put the password in source, logs or documentation. Current access checks were functional smoke tests, not a complete IAM-policy audit.

### Apply migrations through an authenticated proxy

The workstation Cloud SQL Auth Proxy and Cloud Run's attached Unix socket are different connection mechanisms. Both reach the same Cloud SQL database.

Terminal 1, with Cloud SQL Auth Proxy and appropriate Google credentials already installed:

```sh
cloud-sql-proxy voxian-shift-app:asia-southeast1:voxian-db --address 127.0.0.1 --port 5434
```

Terminal 2, from repository root, uses the existing secret without printing it or replacing the local `.env` file:

```sh
cd apps/api
node --input-type=module <<'JS'
import { execFileSync, spawnSync } from 'node:child_process'
const secret = execFileSync('gcloud', [
  'secrets', 'versions', 'access', 'latest',
  '--secret=voxian-database-url', '--project=voxian-shift-app',
], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
const url = new URL(secret)
url.hostname = '127.0.0.1'
url.port = '5434'
url.searchParams.delete('host')
const result = spawnSync('pnpm', ['db:migrate'], {
  stdio: 'inherit', env: { ...process.env, DATABASE_URL: url.toString() },
})
process.exitCode = result.status ?? 1
JS
```

The process-level connection string overrides the local `.env` default. This changes the **production schema**, so first review pending SQL and existing backup/recovery arrangements. Stop the temporary proxy when finished. For a new production database, run the catalogue importer with that same process-level database URL and the pinned approved source directory; do not copy test guest records as part of importing reference data.

If real user data ever needs transfer, plan it separately: choose explicit tables, preserve source/version identifiers and owner mappings, back up the target, test a restore, and resolve conflicts. There is no repository tool that safely merges local anonymous identities into an existing production database. Do not blindly restore a development dump over production.

### Release ordering

1. Test code and migration changes locally using the pinned PostgreSQL major version.
2. Apply reviewed additive migrations to production before the API begins requiring them.
3. Import reference data only if the target is new or a reviewed dataset update requires it.
4. Deploy web and API images, then verify both live image SHAs and traffic targets.
5. Smoke-test through the public web origin: onboarding/profile restore, canonical roles, commitment save, progress update, guest isolation and scoped reset using disposable records.

All migrations through 005 were applied to local and production databases before documenting this release. This is an observed outcome, not automation provided by CI.

## 11. Build and deployment pipeline

[GitHub Actions](.github/workflows/deploy.yml) runs on pushes to `main` or manual dispatch:

1. Install the locked dependencies under Node 24.
2. Run `pnpm exec vp run ready`: format/lint/type check, workspace tests and builds.
3. Use GitHub OIDC / Workload Identity Federation to impersonate `voxian-deployer`; no static Google service-account key is stored in the workflow.
4. Build and push separate SHA-tagged web and API images to Artifact Registry.
5. Deploy each image to its Cloud Run service in a matrix job.

The [web Dockerfile](apps/web/Dockerfile) builds Next's standalone output. `API_BASE_URL` is a **build argument** because Next bakes rewrites into the output; changing only a runtime variable does not rebuild that proxy. Its build stage also copies the API Navigator JSON fixture imported by a web test during TypeScript checking. Missing that file caused the previous failed frontend deployment; commit `df08dec` fixed it.

The [API Dockerfile](apps/api/Dockerfile) installs production dependencies and runs TypeScript directly with Node 24 type stripping. It includes migrations/scripts/data but does not run migrations on startup. No database or secret is embedded into either image. [.dockerignore](.dockerignore) excludes local environment files and build artifacts.

[cloudbuild.yaml](cloudbuild.yaml) is an alternative image-build configuration; it is not the active push-to-main deployment workflow and does not deploy or migrate the database by itself.

**The release is not atomic across services.** One matrix leg can succeed while another fails or gets cancelled, leaving different web/API versions live. Check both services, not only whether one service is Ready. Rolling an image back also does not reverse SQL changes.

## 12. AI configuration and boundaries

[llm.ts](apps/api/src/llm.ts) supports explicit provider selection:

| `CHAT_PROVIDER` | Credentials                                                           | Model selection                                 |
| --------------- | --------------------------------------------------------------------- | ----------------------------------------------- |
| `rootsys`       | Server-side `ROOTSYS_API_KEY`                                         | `ROOTSYS_MODEL`; code default `glm-5.3-flashx`  |
| `gemini`        | Server-side `GEMINI_API_KEY`                                          | `GEMINI_MODEL`; code default `gemini-3.8-flash` |
| `vertex`        | Application Default Credentials; runtime service account on Cloud Run | `VERTEX_MODEL`; code default `gemini-2.5-flash` |

These are implementation defaults, not a guarantee of provider/model availability. The audit observed production using Vertex. [ai-provider.sh](scripts/ai-provider.sh) can switch production between Gemini and Vertex and changes service configuration/IAM; it is an operational mutation, not required for normal local development.

Chat, Navigator personalization, plan narrative and weak-crosswalk assistance may send supplied profile/message context to the selected provider. CV matching itself uses local parsing plus SQL search. Schemas and code constrain returned content, but output validation is not a factual guarantee. Reviewed destination/resource IDs and deterministic schedule calculations remain code-owned.

## 13. Operational checks

Run normal development verification from repository root:

```sh
pnpm exec vp run ready
```

Run database integration tests **against disposable local development data**, after migrations and reference import:

```sh
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/voxian pnpm --filter @voxian/api test
```

Tests insert isolated synthetic owners and clean them up. Standard CI does not configure `TEST_DATABASE_URL`, so database integration tests can be skipped even when CI is green. Relevant evidence includes [guest-store tests](apps/api/src/guest-store.test.ts), [occupation tests](apps/api/src/occupation-catalogue.test.ts), [profile tests](apps/web/src/lib/profile-confirmation.test.ts), [commitment persistence tests](apps/web/src/lib/guest-data.test.ts), and [plan tests](apps/api/src/plan.test.ts).

Inspect releases without printing secret values:

```sh
gh run list --workflow deploy.yml --limit 3
gcloud run services describe voxian-web --project voxian-shift-app --region asia-southeast1 \
  --format='json(status.conditions,status.traffic,spec.template.spec.containers[0].image)'
gcloud run services describe voxian-api --project voxian-shift-app --region asia-southeast1 \
  --format='json(status.conditions,status.traffic,spec.template.spec.containers[0].image)'
gcloud sql instances describe voxian-db --project voxian-shift-app \
  --format='json(state,databaseVersion,settings.tier,settings.backupConfiguration.enabled)'
```

`GET /api/health` through the web proxy confirms process/scoring-version response only. It does not query PostgreSQL, validate migrations or test AI credentials. Use actual profile/catalogue operations for database readiness. Avoid printing complete service environments or Secret Manager payloads while diagnosing failures.

| Symptom                                  | First check                                                                                         |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Preparing space + profile Retry          | Guest endpoint response, database reachability and migration 005; do not wipe user storage as a fix |
| Role search empty                        | Catalogue imported, query valid, and occupation in current 25-code allowlist                        |
| Save returns 401                         | Cookie established on the same origin before writing                                                |
| Save returns 403                         | `WEB_ORIGIN` and cross-site headers; alternate Cloud Run hostnames are distinct origins             |
| Save returns 503                         | Database/secret/socket connectivity and required tables; `/health` alone is insufficient            |
| AI returns 429/502/503                   | Rate limit/quota, configured provider credentials, provider response and timeout                    |
| Frontend still old after failed workflow | Separate web/API image SHAs and traffic revisions                                                   |
| Application suddenly inaccessible        | Cloud Run ingress, SQL activation policy and budget automation state                                |

## 14. Audit findings and explicit limits

| Finding                                | Evidence / effect                                                                                                               | Follow-up boundary                                                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Manual database release step           | Workflow deploys images but never invokes migration runner                                                                      | Add a controlled migration release step before API rollout when automating future releases                           |
| No automatic backup verified           | Live Cloud SQL reports backups disabled; no restore test performed                                                              | Review recovery and trial implications before storing irreplaceable data or changing instance configuration          |
| Trial entitlement unverified           | Expected instance tier and trial provisioning records; no billing entitlement/expiry data                                       | Confirm in the billing console; configuration labels do not prove zero charges                                       |
| Anonymous identity only                | Hashed cookie owners, no account binding or row-level auth session                                                              | Keep browser-loss limits visible; design identity migration before adding sign-in                                    |
| No retention/version conflict controls | JSONB document replacement, no revision token, no orphan-owner cleanup                                                          | Define retention and conflict behavior if multi-tab use or retention requirements expand                             |
| Limited enabled role coverage          | Imported 1,016 occupations; SQL filters to 25 curated codes                                                                     | Review and expand mappings explicitly; avoid claiming full selectable catalogue coverage                             |
| Vector deployment differs locally      | Local JSONB fallback; production pgvector 0.8.5                                                                                 | Test both paths; plan explicit JSONB→vector conversion if changing an existing local schema                          |
| Lumi remains separate/incomplete       | Session transcript, best-effort server memories, no durable dashboard-history hydration                                         | Do not promise durable chat history or semantic recall from table existence alone                                    |
| Copilot context/action drift           | Client imports mock metrics; strategy actions use older names/query parameter than Navigator                                    | Align context/actions before treating Lumi as an authoritative controller; outside this documentation change         |
| Old role-only endpoint remains         | `/onboarding/occupations` writes role rows independently of full guest profile                                                  | New profile UI uses full guest store; future external callers should use guest-profile endpoint to avoid split state |
| Existing visual documentation drifts   | [ArchitectureDiagram](apps/web/src/components/architecture-diagram.tsx) still describes browser-only profile/commitment storage | Treat this document and actual stores as current evidence; UI diagram update remains separate                        |
| In-memory abuse controls               | Per-IP limits and route quotas reset per process and multiply across instances                                                  | Shared limits are needed before materially increasing public scale                                                   |
| Liveness is not readiness              | `/health` returns without a database/provider probe                                                                             | Validate feature endpoints after deployments                                                                         |

### Live budget kill switch — verified 18 October 2026

The kill switch is **deployed, wired and receiving budget messages**. This verifies the notification path and handler invocation, not a successful production shutdown at the threshold.

| Component                    | Live evidence                                                                                                                                                     |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Budget                       | `voxian-shift-app RM4 cap`: MYR 4 per calendar month, scoped to project `184581024855`, including credits                                                         |
| Notification thresholds      | 50%, 90% and 100% of current spend; Pub/Sub also delivers periodic budget updates                                                                                 |
| Pub/Sub topic                | `projects/voxian-shift-app/topics/budget-alerts`; billing alert service has publisher permission                                                                  |
| Eventarc trigger             | `budget-kill-switch-423586` in `asia-southeast1`; consumes the topic and targets the kill-switch function                                                         |
| Deployed handler             | `budget-kill-switch`, Ready revision `budget-kill-switch-00002-zer`                                                                                               |
| Runtime identity             | `voxian-killswitch@voxian-shift-app.iam.gserviceaccount.com`; project roles `roles/run.developer` and `roles/cloudsql.editor`; handler invocation binding present |
| Latest observed notification | `cost 0.22 / budget 4 MYR` logged at 18 October 2026, 00:54:50 MYT; this is reported monthly spend, not an instant final invoice                                  |

[Handler code](infra/budget-kill-switch/index.js) returns while reported cost is below the budget amount. At or above the amount in the received message, it attempts to make all Cloud Run services in the configured region internal-only (excluding itself) and set all Cloud SQL instances in the project to activation policy `NEVER`. It does not delete data or disable the project's billing account. It has no automatic recovery when a new month starts.

**This is a custom alert-driven shutdown, not a guaranteed RM4 spending ceiling.** Billing reports and notifications can lag; stopping these services does not stop every possible project charge. The handler logs HTTP responses but does not establish that asynchronous shutdown operations completed successfully. See [Google Cloud budget alert limitations](https://docs.cloud.google.com/billing/docs/how-to/budgets) and [programmatic notifications](https://docs.cloud.google.com/billing/docs/how-to/budgets-programmatic-notifications).

The audit did not publish a threshold-crossing test event or shut down the live application. Before manually restoring public ingress or database activation after a real event, investigate the cause and review current costs/trial implications. Restore both app services' intended ingress and the database activation policy; restoring only PostgreSQL will not reopen an ingress-blocked frontend. These are operational changes, not steps performed by this audit.

## 15. Audit scope and maintenance

Verified from source: entry points, endpoint inventory, request schemas, storage owners, SQL migrations/import behavior, Docker packaging, CI steps, provider selection and known persistence gaps. Verified live: deployed image SHAs/readiness/traffic, runtime provider, socket/secret bindings, database version/tier/state, backup setting, table names, pgvector version, aggregate reference-data counts, monthly budget configuration, kill-switch service/trigger/topic wiring, relevant service-account roles and live below-threshold budget-message logs. Previous release verification exercised production profile/plan/progress save/restore/isolation/reset with disposable guest data and removed those records.

Not verified: actual trial entitlement/expiry or invoices, full IAM policies, threshold-crossing shutdown completion and timing, backup restoration, production LLM generation/embedding recall, load capacity or disaster recovery. This documentation audit made no production configuration or data changes; database inspection was metadata/aggregate read-only.

When changing routes, persistence, schemas, provider defaults, deployment steps or resource topology, update the relevant sections and refresh the dated deployment snapshot separately. Code and live configuration take precedence over stale prose. Related detail lives in [deployment runbook](docs/deployment.md), [onboarding](docs/onboarding.md), [catalogue/research provenance](docs/occupation-catalogue.md), and [flight-plan contract](docs/contracts/flight-plan-generation.md).
