# Navigator destination mappings

Contract version 3, recommendation rule version 2. Supersedes the destination-generation and preference-ranking portions of the v2 contract. Implementation: issue #9. Mapping dataset revision: `prototype-2.3.8-review-2`.

## Requirements and decisions

- [Original product concept](https://docs.google.com/document/d/1YVtBO8wHHMvmZcCDJ8eMMU0qm2LxjoqN/edit): deterministic exposure arithmetic; curated task/skill evidence grounds AI explanations, learning activities and personalized plans. It does not name four strategies, require fixed destination lookup or define Create narrowly.
- Later supplied HTML/changelog: four branches labeled Automate, Hybrid, Pivot and Create. Its fourth branches include emerging governance, ethics and accountability responsibilities. Preserve those curated pathways rather than interpreting Create as exclusively starting a new product or business.
- Explicit user direction: align Navigator with deterministic prototype mappings; do not let the LLM invent destination roles. Remove internal source filenames/version strings from Navigator UI.
- Implementation decisions: narrow prototype source groups to 25 explicit O*NET occupation codes, filter executive leaf labels, version mappings, retain stable destination IDs, and report honest missing coverage. These are documented product curation, not externally validated career-transition evidence.

The previous blanket Create exclusion was an implementation mistake. Revision 2 restores the fourth prototype branch for every mapped source occupation. New dataset revision invalidates earlier revision-1 Navigator caches; it does not erase saved commitments.

## Ownership

The source occupation code selects an explicit, versioned mapping when present; otherwise its SOC family selects clearly labelled exploration templates. Strategy order, pathway titles, destination IDs, labels and ordering are resolved before any provider call. LLM input contains those destinations; output contains narrative and an exact destination-ID echo only. Changed, missing or reordered destination IDs invalidate narrative output. Model-authored role titles are never consumed.

The current dataset is `apps/api/data/navigator-pathways.json`, adapted from the user-supplied HTML's ROLE_BRANCHES. It covers 26 specific O*NET source occupations, verified to exist in the local catalogue. This is product curation, not an external evaluation of career transferability.

## Grounding and limitations

- Explicit O*NET source codes replace loose title/ISCO inference. Content-moderator and broad office-supervisor mappings are withheld for lack of specificity; no other source is substituted automatically.
- Data analyst maps specifically to Business Intelligence Analysts, not all Data Scientists; teacher/trainer maps specifically to Training and Development Specialists, not all teachers. Other sources also apply only to the listed code, without automatic taxonomy widening.
- Destination labels remain prototype pathway labels (`kind: curated_pathway`, `occupationCode: null`). They are not represented as catalogue occupations, vacancies, qualifications or evidence of suitability.
- Include the branch label and up to two non-executive leaf labels. Chief/head/VP/director/principal/partner/CFO/CTO leaf destinations are excluded. Remaining labels can still describe advanced work: users must validate entry requirements; no promotion timeline is implied.
- Exact mapped occupations retain four branches; other catalogue-confirmed occupations use the versioned SOC family exploration templates described below. Unknown family codes remain unsupported; the LLM never invents destination titles.
- Do not use title-search relevance as proof that a transition is feasible.

Before narrative generation, resolve the selected occupation through the existing versioned O*NET–ISCO crosswalk and occupational task dataset. Supply task descriptions and exposure estimates, available gradient, mapping context and limitations to the LLM. Missing task evidence is explicitly unavailable, never manufactured or inferred from the user title. Do not modify exposure arithmetic or treat occupational estimates as personal skill measurements, job-loss probabilities or regional forecasts.

Supply curated per-strategy skill requirements separately from user-stated strengths, goals, available time and other confirmed constraints. Explain skill gaps as areas to validate, not measured deficiencies. The LLM personalizes human edge, tradeoffs, learning actions, bridge projects and explanations inside the fixed destinations; it never invents underlying labor-market statistics.

## Result and fallback

Four strategy cards remain present. Each has coverage (`available` or `unsupported`), internal mapping version/source/rationale, human edge, tradeoff, destinations and a legacy `roles` title projection. Destination and role-resource arrays can contain zero to three entries and must agree. Unsupported strategies have zero destinations and cannot start a new plan in the UI. Navigator exposes meaningful curation limitations, not internal filenames or revision labels.

Generation status is `personalized`, `reviewed_only` (no provider or no mapped pathways), or `unavailable` (failed/invalid narrative). Reviewed destinations stay identical across these states. Do not silently present fallback prose as generated personalization. Existing committed plans remain legacy until #11 migrates them.

Movement preferences alone no longer choose a recommended strategy: stay/grow→Hybrid and change→Pivot were product heuristics without suitability evidence. Only an explicitly selected strategy with available mappings is echoed as the user's starting option; all other requests have no recommendation. This is selection acknowledgment, not a career-fit ranking.

## Boundaries

Issue #10 must validate grounded destination IDs when committing/generating plans; the legacy Plan API still accepts title strings. Issue #11 handles saved commitments and #13 broader screen integration. Issue #6 remains owned by the chatbot developer and should consume these grounded fields without inventing destinations.

Future catalogue-backed mappings require exact codes and reviewed transition rationale. Widening source coverage is a dataset review, not permission for an LLM fallback. The original concept's actionable 30-day demo does not override the later 90/120-day scheduling baseline; the first month remains actionable.

## Updated strategy definitions (17 October 2026)

The user's latest definitions supersede the prototype's strategy interpretations. Automate means remaining in the field as the operator, supervisor or configurator of AI automating current work. Hybrid retains human judgment, relationships and creativity within the field while AI handles automatable tasks. Pivot redirects underlying skills into different work, with lower exposure and transferability requiring validation. Create means an owned service, practice, product or new role validated against market demand, rather than an employee job switch.

Shared meanings and Navigator/Plan prompts use these definitions. No literal 50/50 task split or individual risk/transferability claim follows from a strategy label. Create mappings have been revised, with explicit user approval, into occupation-specific owned practices, services and toolkits. These are curated offer hypotheses, not proven market opportunities. Other prototype strategy mappings remain pending semantic review against the updated meanings. The model must not silently rename deterministic destinations. Existing saved plans are not rewritten.

## Computer user support coverage

Revision 4 explicitly adds `15-1232.00` Computer User Support Specialists. Source tasks: https://www.onetonline.org/link/summary/15-1232.00 (2026; checked 17 October 2026). Diagnostics, user assistance, documentation, workflow analysis and user training ground these product-curated exploration options. The four strategies cover operating AI support workflows, retaining human support responsibilities, evaluating training/service-coordination moves, and validating an owned small-business IT support offer. These destinations are not O*NET-endorsed transitions; lower exposure, entry requirements and market demand require validation. This exact mapping takes priority over the subsequently authorized family exploration fallback; no source occupation is substituted.

## Scalable family exploration

The user authorized family-based coverage on 17 October 2026. Exact occupation/strategy mappings take priority. Missing exact mappings resolve through the two-digit SOC major group to versioned, product-curated exploration templates in `navigator-families.json`. Taxonomy reference: https://www.bls.gov/soc/2018/major_groups.htm. All 23 major groups have templates, including civilian exploration of military experience. API catalogue lookup still verifies the actual occupation; a valid-looking prefix alone never authorizes an unknown occupation.

`mappingLevel` identifies `occupation` or `family`; family rationale and card subtitles clearly identify broad exploration. Family destination IDs include the exact source occupation code, strategy and option index. Navigator and Plan share the resolver, preventing destination drift or cross-occupation ID reuse. These options name exploratory work, not verified destination occupations. Pivot starts with role/requirements/exposure research; it does not claim a lower-exposure transition exists. Create starts with customer and owned-offer validation. Missing task evidence remains unknown. Plans use synthetic low-consequence examples and retain qualification/permission limits.

Family templates do not automatically inherit occupation-specific course lists or label generic resources as mandatory. The LLM can personalize narrative and pick supplied reviewed resources but cannot author, rename, reorder or select deterministic destination titles. Existing commitment data is preserved; cache and combined mapping version change. All 865 crosswalk codes and all 1,016 occupations in the current local database resolve four strategies. This is exploration coverage, not validated career-transition coverage. Detailed mappings can incrementally replace family templates without manually blocking every other occupation.

## Full option lists and progressive canvas expansion

Destination, role-projection and per-destination resource arrays no longer have a three-option cap. Resource selections still allow up to three links per option. The data catalogue defines the complete curated list; the LLM must echo its full ordered ID list. Full role indices are accepted in both canvas and saved-plan links, with bounds checked against actual data.

Canvas shows every curated option for each strategy, filling columns of three rows to the right of the strategy card; every option edge starts at its strategy card. There is no overflow card. No generated extra roles or additional provider request is introduced.

## First expanded source mapping

Revision 5 expands Computer User Support Specialists (`15-1232.00`) to 8 Automate, 6 Hybrid, 5 Pivot and 7 Create options. Existing destination IDs 1–3 remain stable. Source tasks include systems monitoring, diagnostics, setup, user inquiries, records, training and workflow analysis: https://www.onetonline.org/link/summary/15-1232.00. Added technical-documentation and training exploration is also informed by https://www.onetonline.org/link/summary/27-3042.00 and https://www.onetonline.org/link/summary/13-1151.00 (checked 17 October 2026).

Automation options concern configuring and checking tools within support; Hybrid retains human incident handling and communication. Pivot options require comparison of actual entry requirements, writing/training samples and destination task exposure; no lower-exposure claim is established. Create options describe owned setup, content, workshop and toolkit offers requiring customer validation. These are product-curated applications of task evidence, not an exhaustive job catalogue or externally validated transitions.

Browser test occupation: Computer User Support Specialists shows 8, 6, 5 and 7 options. Dataset and cache revisions refresh earlier three-option results without rewriting saved commitments.

## Revision 6: all mapped occupations

Revision 6 appends three product-curated exploration options to every strategy of all other 25 mapped occupations, so each strategy now has 4–6 options. Existing destination IDs are unchanged; new IDs continue each strategy's sequence. Create additions keep the Practice/Service/Toolkit ownership form and still require customer validation. As with earlier labels, these are exploration labels, not verified vacancies, entry requirements or measured lower-exposure transitions; semantic review per occupation remains pending. Navigator cache key bumped to refresh earlier results.
