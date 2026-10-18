# Occupation catalogue

See [architecture](../ARCHITECTURE.md) for the full local-to-production flow and current persistence audit.

Occupation matching uses the O*NET® 31.0 Database: 1,016 occupations, 54,269 job-title rows and 18,838 task statements, grouped into 23 SOC 2018 major categories. These describe US occupations; regional titles and duties may differ. This is imported reference coverage, not every occupation worldwide. Current search and selection queries filter to the 25 reviewed occupation codes in `navigator-pathways.json`; imported counts do not mean all roles are enabled in the product. The [v6 role library](role-library-v6.md) stores all 27 source roles; Content Moderator and Call Centre Lead retain complete content but await reviewed O*NET mappings.

Sources: [O*NET data files](https://www.onetcenter.org/database.html), [SOC 2018 categories](https://www.bls.gov/soc/2018/major_groups.htm), [O*NET database licence](https://www.onetcenter.org/license_db.html).

Occupation information comes from the U.S. Department of Labor, Employment and Training Administration's O*NET® 31.0 Database, under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Voxian adds shortened category labels, search ranking, role matching, and illustrative exposure models. USDOL/ETA has not endorsed these additions. O*NET metadata does not provide or validate Voxian exposure scores.

## Import

Set `DATABASE_URL` in `apps/api/.env`, start Postgres with `pnpm db:up`, then run:

```sh
pnpm --filter @voxian/api db:migrate
mkdir -p /tmp/voxian-onet-31.0
curl -fsSL --retry 2 --max-time 60 https://www.onetcenter.org/dl_files/database/db_31_0_json/occupation_data.json -o /tmp/voxian-onet-31.0/occupation_data.json
curl -fsSL --retry 2 --max-time 60 https://www.onetcenter.org/dl_files/database/db_31_0_json/job_titles.json -o /tmp/voxian-onet-31.0/job_titles.json
curl -fsSL --retry 2 --max-time 60 https://www.onetcenter.org/dl_files/database/db_31_0_json/task_statements.json -o /tmp/voxian-onet-31.0/task_statements.json
pnpm --filter @voxian/api db:import-occupations /tmp/voxian-onet-31.0
```

Import validates schema and release counts before opening a transaction. It upserts occupations, refreshes release aliases/tasks, and rebuilds weighted full-text search. A transaction lock serializes imports. Repeating it does not duplicate rows or erase user selections. The pinned release is deliberate; review schema, row counts and occupation changes before upgrading.

## Storage and API

Migration `002_occupation_catalogue.sql` creates `occupation_categories`, `occupations`, `occupation_aliases`, `occupation_tasks`, `exposure_baselines`, and `career_occupation_selections`. Records retain source release; occupations also record import time and source URL. Baseline rows contain model version, provenance, status and task inputs. Demo task inputs live once in the shared package and seed the two illustrative models.

- `GET /occupations?q=software%20developer`: up to three candidates with title, code, description, category, source version, explanation and baseline availability.
- `GET /onboarding/occupations`: restores this guest's confirmed role choices; initializes the private guest cookie when absent.
- `PUT /onboarding/occupations`: `{ occupations: ["15-1252.00"], primaryOccupation: "15-1252.00" }`. Saves up to five known catalogue codes; main role must belong to the selection. Parameterized queries, origin validation, owner checks and transactional replacement protect writes.

Each candidate gets a match % (migration `003_match_scoring.sql`): exact title, code or alternate title = 100; otherwise 80% best title score (F0.5 word overlap between the user's words and the official or alternate title, plural-normalised and unstemmed so "customer" ≠ "customs"; one-word titles count half) + 20% full-text relevance over description and tasks. It is a relevance score, not a calibrated probability, and the UI says so. `GET /occupations/:code/meter` returns the mapped ISCO unit and its ILO task scores; there is no current `/occupations/:code/tasks` route. No vector service or scraping of job boards is required.

Lumi extracts work descriptions and preferences, then server search supplies occupation candidates. Provider output cannot assign occupation IDs or mark a match confirmed. User chooses the roles and saves them explicitly. Home provides one search → select main role → confirm and open Meter flow. Profile Sheet changes stay local until Save. Stored chat data and backend routes remain available, but Home no longer shows chat or questionnaires. `/explore` uses the same live catalogue.

Full profile answers, role IDs, authoritative titles, confirmation and onboarding completion now persist in `guest_profiles` under the hashed guest identity. The guest-profile endpoint updates its profile document and `career_occupation_selections` in one transaction. The older role-only endpoint remains available, but independent writes there do not synchronize the full profile document. Restart profile clears profile/roles while keeping plan/progress/chats; Reset everything clears those additional records too. Guest identity is browser-based, not cross-device authentication.

## Meter coverage

Catalogue recognition is independent of scoring coverage. Only `43-4051.00` (Customer Service Representatives) and `43-6011.00` (Executive Secretaries and Executive Administrative Assistants) currently map to illustrative Voxian models. Other recognised occupations load the ISCO-08 research mapping described below; roles without research coverage remain saved and show **Baseline being prepared**, without a numeric score. Existing legacy IDs remain compatible. Navigator uses the saved occupation and optional preferences to generate relevant directions; no customer-support fallback is used.

## Verification

```sh
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/voxian pnpm --filter @voxian/api test
pnpm --filter @voxian/web test
pnpm exec vp check
```

Database tests require the migrated and imported catalogue. Synthetic selections are isolated and removed. Tests cover alias/task search, SQL-like input, known-code validation, rollback, ownership, durability, provider assignment rejection, legacy profiles and Meter coverage states.

## ISCO-08 Meter (task-level exposure)

`GET /occupations/:code/meter` serves two static files in `apps/api/data/`, built 2026-10-17:

- `onet-isco.json`: O*NET-SOC code → ISCO-08 4-digit unit (865 codes). Built from the official [ESCO–O\*NET crosswalk](https://esco.ec.europa.eu/en/use-esco/other-crosswalks) (Sep 2022, v1): for each O*NET code take the best ESCO match (exact > close > narrow > broad), then read its ISCO group from the ESCO API (`broaderIscoGroup`). ESCO concepts the API no longer serves fall back to the next match.
- `isco-tasks.json`: ISCO-08 unit → ILO exposure gradient and task statements with task-level GenAI exposure scores (427 units, 3,264 tasks), from ILO Working Paper 140 (2025), published at https://pgmyrek.github.io/2025_GenAI_scores_ISCO08/ (CC BY 4.0).

The Meter index for these roles is the mean of the ISCO unit's task scores × 100; ILO publishes no task weights, so tasks count equally. It closely tracks the paper's Table A1 occupation means (e.g. 2514 Applications Programmers: 57.1 vs 0.57). Roles without a crosswalk entry or ILO tasks keep the "Baseline being prepared" state. The two illustrative demo models (customer support, executive assistant) still use their own weighted task inputs.

`/resources` reproduces the saved main occupation's baseline using the same validated ISCO loader and shared scoring function as the Meter. It shows normalized task weights, point contributions, occupation-specific O*NET links and the actual crosswalk or AI-assisted mapping. Demo estimates remain labelled separately from ILO task data. An unconfirmed demo profile, unavailable data or missing main role never receives a substitute personal score. Temporary Meter example/task-mix overrides are not saved and do not alter this evidence page. Navigator guidance is explained separately from the exposure calculation.
