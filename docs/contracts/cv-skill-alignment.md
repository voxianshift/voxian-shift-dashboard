# CV skill alignment: evidence definitions and retrieval gate

## Current implementation

All 300 occupation-specific skill labels (25 occupations × 4 strategies × 3 skills) produce deterministic requirement records through `apps/api/src/skill-requirements.ts`. A requirement ID hashes occupation, strategy and normalized label; display order changes do not change IDs. Changed definitions carry a new `skillRequirementsVersion`. The existing pathway catalogue remains the source for roles, branch descriptions and labels.

Every record includes its label, branch context, definition, exclusions, aliases, version and definition source. Eighteen labels have authored evidence rules, including all twelve Software Developer requirements. Remaining labels use the existing catalogue label and branch context plus conservative general evidence rules; they are **not represented as individually expert-reviewed definitions**. Broader domain review remains necessary before claiming validated competency assessment.

The Navigator's existing provider request receives complete requirement records and all accepted CV evidence. It returns `cvAssessments` with stable requirement ID, `supported`, `related` or `unsupported` status, an exact CV quote and a reason. Code resolves IDs against the current branch, checks citations against current reviewed evidence, and rejects ambiguous duplicate verdicts. Only supported assessments produce public `cvMatches`; related/unsupported verdicts cannot establish alignment. The LLM cannot choose exposure scores, percentages or destination roles.

The browser calculates supported requirements / distinct fixed requirements, rounded to an integer. When assessments exist, negative verdicts override keyword matches. When the provider is unavailable, fallback only accepts exact explicitly extracted skill labels or existing explicit aliases, never keyword/duty substring hits that may express negation or learning goals. No CV or qualifying evidence means no percentage. Source quotes and reasons remain visible in the tooltip. Profile/CV revisions invalidate existing Navigator context caches.

Accepted CV context remains in guest profile JSONB. Optional vector retrieval now adds separate reference and guest-owned evidence vectors through migration 006; raw CV files remain unstored. Lumi memory tables are not used for CV matching. Local pgvector is enabled and active candidate retrieval was enabled after the frozen-rule holdout check below; production deployment/configuration is unchanged.

## Diagnostic evaluation

Fixtures: `apps/api/data/evaluations/cv-skill-matching.json`.
Runner: `apps/api/scripts/evaluate-cv-matching.ts`.
Result: [recorded provider outputs and metrics](../evaluations/cv-skill-matching.json).

The 38 engineering-authored synthetic cases cover equivalent tools, domain-specific skills, related-but-insufficient tasks, alternative products, explicit negation, aspirational learning, missing CV evidence and document instructions. Expected labels are evidence support decisions, not employment recommendations or assessments of people.

Run fixture validation without provider calls:

```sh
pnpm --filter @voxian/api cv:evaluate
```

Run the label-only versus defined-requirements comparison (two provider requests, overwrites the synthetic diagnostic report):

```sh
pnpm --filter @voxian/api cv:evaluate --live
```

Recorded single run on 18 October 2026, made with a non-Google development model that has since been removed (re-run with Gemini before citing these figures):

| Diagnostic                   | Label-only | Defined requirements |
| ---------------------------- | ---------: | -------------------: |
| Correct evidence decisions   |    36 / 38 |              38 / 38 |
| Supported evidence recovered |    15 / 17 |              17 / 17 |
| False supported matches      |          0 |                    0 |
| Request duration             |     9.54 s |               8.60 s |

Label-only matching missed Cursor as an alternative coding assistant and Gemini/Claude as equivalent model API vendors. These fixtures informed the definitions, so this is a diagnostic/development set, **not a held-out accuracy estimate**. One provider run does not establish repeatability, domain-wide precision, probability calibration or performance on real CVs. Recorded duration includes provider variability and is not a latency benchmark. The baseline is a label-only standalone evidence classifier, not an end-to-end comparison against the old full Navigator response.

## Why active retrieval is gated

For a selected occupation, direct matching includes all 12 requirements and up to 74 deduplicated CV skill/keyword/duty phrases. There is no candidate retrieval truncation: all supplied pairs are available to the judge. Vectors cannot increase candidate coverage beyond that; they could reduce context by pruning candidates, at the cost of potential missed evidence and an embedding call. This diagnostic improved definitions and verdict quality; it did **not** test embeddings or vector ranking, and does not prove vectors would be worse.

Keep direct evidence verification as the default. Pgvector candidate retrieval is implemented; local mode moved from shadow to active after the held-out synthetic check below. Before activating candidate pruning for production:

1. Create an independent held-out set with domain-reviewed positive, adjacent, negated and missing-evidence examples; record per-domain precision/recall and supported citation validity over repeated runs.
2. Compare exact/alias, direct semantic and hybrid vector-candidate + verifier systems on the same set. Optimize supported-match precision first; do not choose a universal cosine cutoff without measurements.
3. Require candidate retrieval recall at least 98%, no worse end-to-end false-positive rate, and a measured cost or latency benefit before replacing exhaustive matching. These are proposed engineering gates, not measured guarantees.
4. Pin one embedding model, dimensionality, task type and content version. Reference requirements embed on content changes; CV phrases embed only after review/acceptance.
5. Use separate `skill_requirements` and guest-owned `cv_evidence` records, keyed by stable ID / owner hash / CV revision. Store model/version/content hash alongside embeddings. Do not mix private CV phrases into the public skill catalogue or Lumi history.
6. Replace/remove/reset must transactionally delete superseded CV evidence and matches. Every query filters guest owner and current CV revision; provider/cache failure must not reveal another guest's records or revive removed evidence.
7. Verify pgvector availability on the existing Cloud SQL instance and local container. Preserve the current PostgreSQL 18 volume using a compatible pgvector image and backup before any container change; no destructive volume recreation. Start with exact vector search for the small corpus; add an approximate index only after a measured need.
8. Expose supported evidence overlap, never raw cosine similarity as proficiency percentage. Retain LLM verification and exact citations after retrieval.

## Implemented vector retrieval (18 October 2026)

- Local database image: `pgvector/pgvector:0.8.7-pg18-trixie`, retaining the existing PostgreSQL 18 volume. Both old and new images reported PostgreSQL 18.6 / Debian trixie. A private pre-change dump was saved outside the repository under the user's Codex backups directory. Three existing guest profiles survived the change.
- Migration `006_cv_vectors.sql` installs `vector` and adds `skill_requirement_vectors` plus `cv_evidence_vectors`. No HNSW index: bounded exact cosine search uses owner, current CV revision, model and reference content hash filters.
- Vertex `gemini-embedding-001`, `SEMANTIC_SIMILARITY`, 768 dimensions. Uses application-default/service-account credentials independently of the narrative provider (`CHAT_PROVIDER` selects Gemini or Vertex for narrative output). Region defaults to `us-central1`, overridable through `CV_EMBEDDING_REGION`. Model/task/dimensionality are part of cache identity; invalid dimensions/nonfinite or zero vectors are rejected.
- All 300 reference vectors are seeded locally. Reference changes invalidate affected embeddings by input-content hash. Reviewed CV skills, keywords and duties embed on first Navigator retrieval, then reuse guest-owned cached vectors. Unreviewed/client-only CV revisions are not persisted; saved profile ownership/revision is checked before provider work and again under transaction lock before writes.
- Six concurrent embedding requests maximum, bounded batch size and timeouts. Concurrent requests for the same owner/CV/requirements share pending preparation. No API key/token/CV phrase is logged.
- Retrieval returns three closest phrases per requirement plus exact label/alias hits. Similarity retrieves candidates only; the LLM must still produce a supported verdict with a verbatim allowed citation. Active mode removes the full CV context from the provider profile, restricts global evidence to candidate union, and verifies every supported quote against that requirement's candidates. It never turns cosine similarity into a percentage.
- Profile CV replacement/removal transactionally clears derived vectors through a database trigger. Guest reset deletes the profile and cascades evidence deletion. In-flight embedding writes recheck ownership/revision after acquiring the same owner advisory lock as profile save/reset, preventing deleted evidence from being resurrected. Other preference changes retain valid vectors.
- Default `CV_VECTOR_MODE=off`: no vector provider work. Local `.env` is now set to `active` following held-out synthetic validation. `shadow` measures candidate coverage while preserving exhaustive verification. `active` enables candidate pruning after validation. Missing extension/migration, unavailable credentials/provider, stale CV revision or failed retrieval falls back to exhaustive matching. Cloud Run has not been changed.

Setup/run commands:

```sh
docker compose up -d --wait postgres
pnpm --filter @voxian/api db:migrate
pnpm --filter @voxian/api cv:seed-vectors
pnpm --filter @voxian/api cv:evaluate-retrieval --live
```

The last command sends synthetic fixtures only to Vertex and the configured verifier. It writes [retrieval diagnostic](../evaluations/cv-vector-retrieval.json), cleans up its disposable guest record and preserves public reference vectors. Run formatter after regenerating recorded JSON reports. Local ADC must be configured; Cloud Run uses its existing service account with Vertex permission. To disable retrieval, set `CV_VECTOR_MODE=off` and restart API; keep the compatible pgvector database image and existing volume. No volume deletion or rollback to a database image lacking installed extension binaries.

### Recorded retrieval diagnostic

38 authored cases each received its own evidence plus 15 synthetic distracting phrases. Unique embeddings were computed once in memory, then exercised through the actual PostgreSQL vector store. Results:

| Measure                             |                      Recorded result |
| ----------------------------------- | -----------------------------------: |
| Positive evidence recovered         |                              17 / 17 |
| Exhaustive verifier decisions       |   38 / 38 correct; 0 false positives |
| Vector-candidate verifier decisions |   38 / 38 correct; 0 false positives |
| Verifier input characters           |    48,212 → 28,795 (40.3% reduction) |
| Cold embedding requests / elapsed   |                         69 / 11.24 s |
| Cached database retrieval, mean     |                              23.8 ms |
| Verifier elapsed, one run           | 7.85 s exhaustive; 7.29 s candidates |

This passes the _synthetic diagnostic_ recall/error/input-size gate. It does not establish held-out accuracy, a statistically reliable latency benefit, token billing savings or amortized end-to-end cost. Cold embeddings make the first request slower. Active production rollout remains gated on independent cases and repeated measurements. Local saved-CV shadow verification recovered the same one supported match from 60 accepted evidence phrases; only aggregate counts were logged.

Verified tests cover real PostgreSQL owner isolation, cache reuse, reference changes, preference-only edits, CV removal, reset/deletion, deletion during an in-flight embedding, valid Vertex request/response shapes, active candidate constraints and exhaustive fallback. Existing Lumi JSONB fallback is unchanged; migration 004 does not convert old Lumi embeddings even after pgvector becomes available.

Implementation references: [Vertex text embedding request/response contract](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-reference/text-embeddings-api), [pgvector exact cosine search and PostgreSQL 18 images](https://github.com/pgvector/pgvector), [Cloud SQL supported extensions](https://docs.cloud.google.com/sql/docs/postgres/extensions).

## Frozen-rule held-out check and local activation

Implementation and matching rules were committed as `c3d2158` before authoring `apps/api/data/evaluations/cv-skill-holdout.json`. These 40 fresh synthetic cases cover 18 labels absent from the development diagnostic and all use untuned catalogue/context definitions. Tests enforce separation from development labels. No matching definition or prompt was changed to improve held-out results.

Run two repeats per strategy:

```sh
pnpm --filter @voxian/api cv:evaluate-retrieval --live --holdout
```

[Recorded held-out results](../evaluations/cv-vector-holdout.json):

| Measure                              |                            Result |
| ------------------------------------ | --------------------------------: |
| Positive evidence retrieval          |                           18 / 18 |
| Exhaustive correct decisions         |           39 / 40 in both repeats |
| Candidate-verifier correct decisions |             40 / 40, then 39 / 40 |
| False positives / invalid citations  |                0 / 0 in every run |
| Verifier input characters            | 50,477 → 29,794 (41.0% reduction) |
| Cold embedding requests / elapsed    |                      72 / 11.94 s |
| Cached database retrieval, mean      |                           21.8 ms |

The remaining conservative miss concerns whether a described litigation-hold/document-review workflow establishes eDiscovery management. It was left unchanged rather than fitting the rules to the holdout. Synthetic labels remain engineering-authored rather than independently expert-reviewed; no population accuracy or paid-token savings claim follows from these results. More real-world/domain-reviewed testing remains necessary before production activation.

The diagnostic retrieval gate passed across both repeats: no evidence loss, no increase in false-positive/negative decisions, zero invalid citations, and over 20% input reduction. Local `.env` was switched to `CV_VECTOR_MODE=active` for MVP testing. Production remains default-off and was not deployed or migrated by this task. Active matching retains exhaustive fallback for infrastructure failures. A stale/deleted/replaced CV now returns HTTP 409 instead of passing old CV context to the provider, and embedding preparation time is deducted from the provider timeout so the overall generation budget remains within the browser's 65-second request window.

Local active browser smoke check confirmed 60 accepted CV phrases reduced to 13 supplied evidence candidates; Hybrid alignment remained 33%. Aggregate API telemetry confirmed `CV vector retrieval applied`, and no source phrase or owner identifier was logged in that event. All 241 tests passed, including real PostgreSQL storage/isolation checks. Production activation and real-CV domain validation remain outside this local rollout.
