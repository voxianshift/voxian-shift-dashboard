# Navigator destination mappings

Contract version 3, recommendation rule version 2. Supersedes the destination-generation and preference-ranking portions of the v2 contract. Implementation: issue #9.

## Ownership

The source occupation code selects an explicit, versioned mapping. Strategy order, pathway titles, destination IDs, labels and ordering are resolved before any provider call. LLM input contains those destinations; output contains narrative and an exact destination-ID echo only. Changed, missing or reordered destination IDs invalidate narrative output. Model-authored role titles are never consumed.

The current dataset is `apps/api/data/navigator-pathways.json`, version `prototype-2.3.8-review-1`, adapted from the user-supplied HTML's ROLE_BRANCHES. It covers 25 specific O*NET source occupations, verified to exist in the local catalogue. This is product curation, not an external evaluation of career transferability.

## Review decisions and limitations

- Explicit O*NET source codes replace loose title/ISCO inference. Content-moderator and broad office-supervisor mappings are withheld for lack of specificity.
- Data analyst maps specifically to Business Intelligence Analysts, not all Data Scientists; teacher/trainer maps specifically to Training and Development Specialists, not all teachers. Other sources also apply only to the listed code, without automatic taxonomy widening.
- Destination labels remain prototype pathway labels (`kind: curated_pathway`, `occupationCode: null`). They are not represented as catalogue occupations, vacancies, qualifications or evidence of suitability.
- Include the branch label and up to two non-executive leaf labels. Chief/head/VP/director/principal/partner/CFO/CTO leaf destinations are excluded. Remaining labels can still describe advanced work: users must validate entry requirements; no promotion timeline is implied.
- Magenta prototype branches mostly describe governance/ethics, which does not establish new-value creation. Create coverage is withheld until appropriate destinations are reviewed. Other missing mappings stay empty.
- Do not use title-search relevance as proof that a transition is feasible.

## Result and fallback

Four strategy cards remain present. Each has coverage (`available` or `unsupported`), mapping version/source/rationale, human edge, tradeoff, destinations and a legacy `roles` title projection. Destination and role-resource arrays can contain zero to three entries and must agree. Unsupported strategies have zero destinations and cannot start a new plan in the UI.

Generation status is `personalized`, `reviewed_only` (no provider or no mapped pathways), or `unavailable` (failed/invalid narrative). Reviewed destinations stay identical across these states. Do not silently present fallback prose as generated personalization. Cache namespace is v3; old generated-role data is not reused. Existing committed plans remain legacy until #11 migrates them.

Movement preferences alone no longer choose a recommended strategy: stay/grow→Hybrid and change→Pivot were product heuristics without suitability evidence. Only an explicitly selected strategy with available mappings is echoed as the user's starting option; all other requests have no recommendation. This is selection acknowledgment, not a career-fit ranking.

## Boundaries

Issue #10 must validate grounded destination IDs when committing/generating plans; the legacy Plan API still accepts title strings. Issue #11 handles saved commitments and #13 broader screen integration. Issue #6 remains owned by the chatbot developer and should consume these grounded fields without inventing destinations.

Future catalogue-backed mappings require exact codes and reviewed transition rationale. Adding reviewed Create pathways or widening source coverage is a dataset review, not permission for an LLM fallback.
