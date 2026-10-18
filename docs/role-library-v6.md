# Role library v6

Navigator content now comes from the supplied **Role Library Master v6 (2026-10-18), E1–E6**, replacing the v2.3.8 destination content. The source SHA-256 is recorded in `apps/api/data/navigator-pathways.json`.

The snapshot contains **27 source roles, 108 strategy branches, 367 destination roles and 816 resource entries**. Each destination retains its description, day-to-day tasks, human edge, skills and resource labels/URLs, including source annotations. Source order is preserved. Branch titles use the first destination; branch skills use the source's “Skills focus”.

## Mapping coverage

**25 source roles have existing reviewed O\*NET source codes** and are enabled by the current occupation search and Navigator. `unmappedRoles` preserves the complete **Content Moderator** and **Call Centre Lead** entries, but does not enable them under guessed or neighboring O*NET codes. These two need a reviewed occupation mapping before becoming selectable. Source ISCO codes alone do not establish an exact O*NET occupation match.

Source ISCO codes, gradient bands and automation scores are retained as `sourceIsco`, `sourceBand` and `sourceAutomationScore` for provenance. They do not replace the Meter's independent ILO task exposure calculation or become individual risk estimates.

## Resources and identity

Resource labels, prices and URLs are supplied content, not independently checked course endorsements. Homepage-only, localized and unverified notes remain attached. Missing direct URLs remain `null`; no URL is invented. These destination learning resources are separate from the reviewed `navigatorResources` allowlist that a provider may select for plan generation.

Existing destination IDs remain attached to unchanged exact titles, even when v6 reorders those titles. New titles receive unused IDs within their source role and strategy. Removed destinations are not silently reassigned to a different role. Existing saved plan content is not rewritten; new plan generation for a removed destination requires choosing a current destination.

The mapping revision changes to `role-library-master-v6`, invalidating old Navigator mapping caches. CV matching uses the updated branch skills; embedding seed maintenance should be rerun using `pnpm --filter @voxian/api cv:seed-vectors` when deploying updated requirements. Existing CV evidence and saved commitments are not deleted.

## Validation

Catalogue tests validate all 27 records and all four strategies, source counts, complete destination fields, missing mapping boundaries, unique IDs and retained identity after reorder. Navigator response tests ensure metadata survives both provider-backed and fallback paths; Plan tests resolve current IDs and continue checking destination and schedule boundaries.

## Navigator detail panels

Overview descriptions, day-to-day tasks, human edges, skill labels and destination learning resources use the selected destination in the v6 JSON. Selecting a strategy uses its first destination, matching the panel title. Selecting a role card switches to that destination's content.

Pathway guidance, suggested bridge projects and first steps remain AI-generated when personalization succeeds, or general practice guidance otherwise. They are separate from authored role-library content. Generic reviewed resources are a fallback for destinations without source learning resources. Plan generation continues using its reviewed resource allowlist.
