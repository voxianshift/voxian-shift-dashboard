# Voxian Shift

**Understand how AI could reshape your work—and build a practical plan for your next move.**

Voxian Shift is a career-adaptation prototype for workers navigating AI-driven changes in their jobs. It combines occupation and task-exposure evidence with reviewed career pathways, Gemini-assisted guidance, and a learning plan users can follow and track.

[Live demo](https://voxian-web-184581024855.asia-southeast1.run.app/onboarding) · [Pitch write-up](pitch-deck-writeup.md) · [Process flow](docs/diagrams/voxian-process-flow-gemini.png) · [Architecture](ARCHITECTURE.md)

[![Deploy](https://github.com/voxianshift/voxian-shift-dashboard/actions/workflows/deploy.yml/badge.svg)](https://github.com/voxianshift/voxian-shift-dashboard/actions/workflows/deploy.yml)

## For evaluators

- **Repository:** <https://github.com/voxianshift/voxian-shift-dashboard>. Public visibility verified on 19 October 2026; source and supporting materials can be accessed without a GitHub invitation. Maintainers must preserve repository access throughout evaluation.
- **Access:** open the live demo and complete onboarding. No account or sign-in is required. Job-title search can be used without uploading a CV.
- **Suggested walkthrough:** confirm a supported occupation → inspect the Meter and Curve → compare Navigator directions → select a destination → confirm a study schedule → generate a plan → open the Tracker.
- **Lumi:** use the career copilot for questions about the current page and your reviewed profile.
- **Demo identity:** profiles and progress belong to a browser-based guest identity. Use the same browser to return to your saved work; cross-device account recovery is not part of this MVP.

The demo is a working prototype. AI requests depend on provider availability and quota, and plan generation may take up to about a minute. If generation fails, the app reports the failure rather than presenting an unvalidated plan.

## How it works

| Stage                  | What the user does                                         | What the app provides                                                                                 |
| ---------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1. Onboarding          | Enter a job title or upload a CV; review extracted details | Gemini-assisted CV understanding and profile setup                                                    |
| 2. Occupation matching | Review and confirm a suggested occupation                  | O*NET occupation search and an ISCO-08 research mapping, where available                              |
| 3. The Meter           | Inspect task exposure and its sources                      | Deterministic calculations using ILO task data; illustrative models are labelled separately           |
| 4. The Curve           | Explore adoption evidence and possible futures             | Dated evidence and clearly labelled scenarios                                                         |
| 5. The Navigator       | Compare Automate, Hybrid, Pivot and Create; choose a role  | Curated destinations, role details, learning resources and evidence-based CV alignment when available |
| 6. Commit              | Confirm weekly hours, study days and timeline              | A code-owned schedule used to constrain plan generation                                               |
| 7. Learning plan       | Generate and review a phased plan                          | Gemini-generated activities checked against structure, schedule and resource constraints              |
| 8. The Tracker         | Follow sessions and record attendance                      | Saved learning progress against the plan                                                              |

Lumi provides contextual AI assistance throughout the journey. CV alignment is shown only when reviewed evidence supports a comparison; it is not a validated measure of career suitability.

[Download the transparent process-flow PNG](docs/diagrams/voxian-process-flow-gemini.png).

## Evidence, authored content and AI

These have different responsibilities:

| Layer                           | Responsibility                                                                                                                |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Research and deterministic code | Occupation identifiers, mapped ILO task-exposure inputs, score calculations and schedule validation                           |
| Reviewed role library           | Destination identity, descriptions, daily tasks, human edges, skills and source learning resources                            |
| Gemini Developer API            | CV extraction, personalized pathway explanations, evidence-aware phrase matching, learning-plan generation and Lumi responses |
| Scenarios                       | Explicitly labelled possibilities for exploration, rather than predictions of individual outcomes                             |

The v6 library contains **27 source roles, 108 branches and 367 destinations**. **25 roles have reviewed O\*NET mappings enabled for occupation selection.** Content Moderator and Call Centre Lead remain stored but await reviewed mappings. See [role-library coverage and provenance](docs/role-library-v6.md).

Gemini does not set the Meter's exposure scores. A schema-valid AI response is not a guarantee of factual correctness, career fit or employment outcomes.

## Architecture

```mermaid
flowchart LR
  Browser[Guest browser] --> Web[Next.js web / Cloud Run]
  Web -->|Same-origin API proxy| API[Fastify API / Cloud Run]
  API -->|Parameterized SQL via pg| DB[(PostgreSQL)]
  Data[Versioned research + role-library JSON] --> API
  API -->|Server-side API key| Gemini[Gemini Developer API / Google AI Studio]
  Secrets[Secret Manager in production] --> API
```

| Component | Technology                                                                                         |
| --------- | -------------------------------------------------------------------------------------------------- |
| Frontend  | Next.js 16, React 19, Tailwind CSS 4, shadcn/Radix UI, React Flow                                  |
| Backend   | Node.js 24, Fastify 5, TypeScript, Zod                                                             |
| AI        | Gemini Developer API using Google AI Studio credentials                                            |
| Database  | PostgreSQL 18: Docker locally, Cloud SQL in production                                             |
| Delivery  | pnpm workspaces, Vite+, GitHub Actions, Workload Identity Federation, Artifact Registry, Cloud Run |

Application data uses PostgreSQL directly; Firebase Auth, Firestore and SQL Connect are not part of the current application request path. Legacy cloud resources and optional provider code are documented separately in the [provider/Firebase audit](docs/audits/ai-firebase-2026-10-19.md).

Optional Vertex CV-vector retrieval remains implemented but is **off in current production**. Lumi memory embeddings follow the selected Gemini provider. The presence of an alternative provider's model variable does not mean multiple providers run in parallel. See [current AI configuration](docs/ai-provider.md).

## Run locally

### Prerequisites

- Node.js **24** and pnpm **12.11.2**.
- Docker with Docker Compose.
- A Gemini API key and a generation model available to that key.
- Internet access for package installation and the initial O*NET reference-data download.

Commands below use a POSIX shell; Windows developers can use WSL. Only PostgreSQL runs in Docker; web and API run as local Node processes.

### 1. Install and configure

```sh
git clone https://github.com/voxianshift/voxian-shift-dashboard.git
cd voxian-shift-dashboard
pnpm install --frozen-lockfile
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Edit `apps/api/.env` and set `GEMINI_API_KEY`. Keep `CHAT_PROVIDER=gemini`. Set `GEMINI_MODEL` to a model available to your key; the example file records the deployed configuration, not a universal availability guarantee. AI Studio access does not imply free billing.

Local defaults:

| Setting            | Value                                                         |
| ------------------ | ------------------------------------------------------------- |
| API `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5433/voxian`        |
| API `WEB_ORIGIN`   | `http://localhost:3000`                                       |
| Web `API_BASE_URL` | `http://127.0.0.1:8080`                                       |
| `CV_VECTOR_MODE`   | `off`; no Vertex credentials are needed for the default setup |

Keep provider and database credentials server-side. Do not put secrets in `NEXT_PUBLIC_*` variables or commit `.env` files. The sample PostgreSQL credentials are for the local development container.

### 2. Start PostgreSQL and apply migrations

```sh
pnpm db:up
pnpm --filter @voxian/api db:migrate
```

Migrations run against the `DATABASE_URL` loaded by the API script. Local Docker and production Cloud SQL are separate databases; migrations do not copy local guest data into production.

### 3. Import the occupation catalogue

A fresh database needs the pinned O*NET 31.0 files for occupation search:

```sh
mkdir -p /tmp/voxian-onet-31.0
curl -fsSL --retry 2 --max-time 60 https://www.onetcenter.org/dl_files/database/db_31_0_json/occupation_data.json -o /tmp/voxian-onet-31.0/occupation_data.json
curl -fsSL --retry 2 --max-time 60 https://www.onetcenter.org/dl_files/database/db_31_0_json/job_titles.json -o /tmp/voxian-onet-31.0/job_titles.json
curl -fsSL --retry 2 --max-time 60 https://www.onetcenter.org/dl_files/database/db_31_0_json/task_statements.json -o /tmp/voxian-onet-31.0/task_statements.json
pnpm --filter @voxian/api db:import-occupations /tmp/voxian-onet-31.0
```

The importer validates the release and uses a transaction. Role-library and ILO mapping JSON are already included in the repository. See [catalogue setup and attribution](docs/occupation-catalogue.md).

### 4. Start the application

```sh
pnpm dev
```

Open <http://localhost:3000>. The API listens on port `8080`; `GET http://localhost:8080/health` provides a basic health check. The browser sends API requests through Next.js's same-origin `/api/*` proxy.

Stop the database with `pnpm db:down`; its named volume is retained. **`pnpm db:reset` deletes the local database volume and its data.**

## Validation

```sh
# Formatting, linting and TypeScript checks
pnpm exec vp check

# Workspace tests
pnpm exec vp run -r test

# Complete check, test and build sequence used by CI
pnpm ready
```

Database integration tests are conditional. To include them, use the migrated and imported local development database:

```sh
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/voxian pnpm --filter @voxian/api test
```

The tests create isolated synthetic records; use a development/test database, not production. A normal test run can skip database-dependent cases when `TEST_DATABASE_URL` is absent.

## Deployment

Pushes to `main` run [GitHub Actions](.github/workflows/deploy.yml): checks, tests and builds → container images in Artifact Registry → web and API services on Cloud Run. Google Cloud authentication uses Workload Identity Federation.

Database migrations and reference-data imports are separate deployment operations; the workflow does not run them automatically. Runtime secrets stay in Secret Manager. Review the [deployment runbook](docs/deployment.md) before operating production. Rate limits and budget alerts do not guarantee a hard spending cap.

## Repository map

```text
apps/web/          Next.js application and shared UI components
apps/api/src/      Fastify routes, provider transports and PostgreSQL stores
apps/api/data/     Versioned occupation mappings, ILO inputs and role library
apps/api/migrations/ Numbered PostgreSQL migrations
apps/api/scripts/  Migration, catalogue import and evaluation tools
packages/shared/   Zod contracts, deterministic scoring and schedule logic
docs/              Methodology, contracts, audits and supporting diagrams
infra/             Infrastructure support code
.github/workflows/ CI and deployment workflows
```

## Privacy and prototype limits

- No user authentication is implemented. Guest identity is browser-based; do not treat this demo as an authenticated production service.
- CVs are processed in memory; raw files and raw extracted text are not persisted by the application. Reviewed structured career context can be saved in the guest profile. AI processing sends relevant CV content to the configured provider. See [CV processing and review](docs/contracts/cv-processing.md).
- Chat turns, accepted profiles, plans and progress can persist in PostgreSQL. Use the app's reset controls to clear guest data; upload only information appropriate for an evaluation demo.
- Occupational exposure is not a prediction of job loss, timing, salary or an individual's replacement risk. O*NET describes US occupations; local titles, duties and labour markets may differ.
- Match and CV-alignment percentages are relevance/evidence indicators, not calibrated probabilities, measured proficiency or employment guarantees.
- Course links, prices and eligibility may change. AI guidance and learning plans need user review.

## Supporting materials and sources

| Material                                 | Location                                                                                                             |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Pitch content                            | [Pitch deck write-up](pitch-deck-writeup.md)                                                                         |
| Process diagram                          | [Transparent PNG](docs/diagrams/voxian-process-flow-gemini.png)                                                      |
| Full architecture and persistence        | [ARCHITECTURE.md](ARCHITECTURE.md)                                                                                   |
| Methodology in the demo                  | [Methodology & Proof](https://voxian-web-184581024855.asia-southeast1.run.app/resources) — complete onboarding first |
| Occupation data, scoring and attribution | [Occupation catalogue](docs/occupation-catalogue.md)                                                                 |
| Navigator library coverage               | [Role library v6](docs/role-library-v6.md)                                                                           |
| Onboarding                               | [Onboarding implementation](docs/onboarding.md)                                                                      |
| CV handling and alignment                | [CV processing](docs/contracts/cv-processing.md) · [CV skill alignment](docs/contracts/cv-skill-alignment.md)        |
| Plan validation                          | [Flight-plan generation contract](docs/contracts/flight-plan-generation.md)                                          |
| AI provider configuration                | [Current provider reference](docs/ai-provider.md)                                                                    |
| Production operations                    | [Deployment runbook](docs/deployment.md)                                                                             |

Research inputs include [ILO Working Paper 140](https://www.ilo.org/publications/generative-ai-and-jobs-refined-global-index-occupational-exposure), the [O*NET 31.0 Database](https://www.onetcenter.org/database.html), and the [ESCO–O*NET crosswalk](https://esco.ec.europa.eu/en/use-esco/other-crosswalks). O*NET occupation information is used under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); USDOL/ETA does not endorse Voxian's additions. Dataset attribution and modifications are detailed in the catalogue documentation. Dataset licences do not automatically grant a licence to this application's source code.

Built by the **Voxian Shift team**. See [repository contributors](https://github.com/voxianshift/voxian-shift-dashboard/graphs/contributors) for development history.
