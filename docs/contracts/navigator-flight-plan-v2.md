# Navigator and Flight Plan contract v2

Status: implementation baseline for issue #7; runtime implementation follows in #8–#14.
Contract version: `2`. Scoring version remains independent.

## Scope and authority

The backend owns strategy metadata, recommendation rules, dates, budgets and evidence. The LLM supplies qualitative content within those boundaries. Client-supplied exposure values are never authoritative. Resolve occupation and scores against the trusted catalogue before generation. Missing evidence is explicit, never a customer-support fallback.

This contract describes target behavior, not deployed capability. Source references: [issue #7](https://github.com/voxianshift/voxian-shift-dashboard/issues/7), [prototype changelog](https://drive.google.com/file/d/1qryPfkqNCSs-FTss5HxofuQV_nzdd-Ug/view).

## Four strategies

Return exactly these IDs once, in this order. Titles may be personalized; IDs and labels cannot change.

| ID         | Label    | Meaning                                                                     | Existing semantic color token |
| ---------- | -------- | --------------------------------------------------------------------------- | ----------------------------- |
| `automate` | Automate | Improve current work through automation with human review.                  | `chart-3` (cyan)              |
| `hybrid`   | Hybrid   | Combine domain expertise with AI assistance while retaining human judgment. | `tertiary` (purple)           |
| `pivot`    | Pivot    | Validate adjacent work using transferable skills.                           | `warning` (amber)             |
| `create`   | Create   | Validate a new service, product or original body of work.                   | `success` (green)             |

Reuse existing tokens in both themes; no new hex values or theme overrides. Prototype magenta for Create is adapted to available green token. Labels/icons remain visible, so color is never the sole identifier. Strategy colors do not indicate risk or evidence confidence.

People, operations and quality are possible themes inside strategies, not replacement strategy IDs. Suggested roles are alternative destinations, not chronological promotions. User selection is separate from recommendation and always wins.

## Deterministic recommendation

MVP recommendation expresses an explicit preference, not predicted fit. Do not rank using exposure bands, job title, inferred personality or an LLM-extracted free-text interpretation.

1. If occupation cannot be resolved, return no recommendation (`missing_occupation`).
2. If the user explicitly chooses one strategy, record it as selection; recommend that strategy with reason `explicit_strategy`.
3. Otherwise accept only a canonical movement preference captured by an explicit control: `stay`, `grow`, `change`, `explore`, `create`, or `unknown`. Do not silently convert existing free text. Map `stay` and `grow` to Hybrid; `change` to Pivot; `create` to Create. Reason: `explicit_direction`.
4. For `explore`, `unknown`, missing or unrecognized legacy answers, return null with reason `insufficient_preferences`.
5. Risk, hours and anxieties constrain project scope and schedule, not strategy eligibility. Show all four; never interpret missing answers as permission to leave employment.

Automate requires explicit strategy selection in this conservative MVP rule set. No percentages, hidden weights or tie-breakers. Changing these rules requires a new rule version. A recommendation means “starting option based on stated preference,” not “best career.”

## Plan structure and horizon

Use four learning phases: `foundation`, `intermediate`, `advanced`, `leadership`. Display the last as “Leadership & ownership”: ownership of a small deliverable, not promotion or management readiness. Roles remain separate from phases.

Keep existing 90/120-day pace concepts: explicit user-selected horizon wins; otherwise a confirmed near-term preference can select 90 days, with 120 days as an explicitly disclosed default. Unknown availability requires confirmation before committing a schedule. Neither horizon predicts time to employment or skill mastery.

For horizon H (90 or 120), phase end days are `floor(H/4)`, `floor(H/2)`, `floor(3H/4)`, H. Start days are 1 or previous end + 1. Thus 90 days gives 1–22, 23–45, 46–67, 68–90; 120 days gives 1–30, 31–60, 61–90, 91–120. Backend computes these values; model cannot modify them.

First 30 calendar days have explicit task or rest entries, including any phase boundary. This resolves the prototype's 28/30 discrepancy. Later days have weekly milestone windows clipped to phase boundaries, covering the remaining horizon without overlap. Do not force daily work or a completion streak on rest days. Goals at days 30, 60 and 90 are portfolio/practice outcomes, never employment guarantees.

Hours change task load, not horizon. If scope cannot fit, reduce deliverable scope and disclose the limit; extending the horizon requires user action. No inverse-hours formula that implies mastery accelerates linearly.

## Availability and dates

Accept a confirmed positive weekly minute budget; retain original profile answer. For existing bands, conservative defaults are Under 1 hour → ask exact minutes; 1–3 hours → 60; 3–5 hours → 180; 5+ hours → 300. “It varies”, missing and arbitrary free text require confirmation. These defaults are disclosed planning assumptions, not extracted facts.

Backend allocates tasks to explicitly selected study days and session limits. Every task has positive integer minutes; rest entries have zero minutes. Sum of scheduled task minutes in every seven-day window must not exceed weekly budget. Split tasks rather than exceeding the session limit. Do not schedule on excluded days. No schedule commitment until start date, time zone, availability and study days are confirmed.

Store local date as YYYY-MM-DD plus IANA time zone (default Asia/Kuala_Lumpur only when no user zone is available and disclose it). Add calendar days rather than 24-hour durations. Replanning creates a new revision; never erase completion history.

## Shared result fields

The following is the target wire shape; fields are not a claim that endpoints already expose them.

- `contractVersion: 2`, `ruleVersion: 1`, `profileRevision: string`.
- `occupation: { code, title }`; `evidence: { status: available | unavailable, scoringVersion, sourceVersion, exposure: number | null, gradient: string | null }`. Preserve all supported gradient labels, not only G1–G4.
- `recommendation: { strategyId: StrategyId | null, reasonCode, explanation }`; `selectedStrategyId: StrategyId | null` is user-owned.
- `strategies`: exactly four `{ id, label, colorToken, title, description, humanEdge, tradeoff, skills, roles, project, firstStep, resourceIds }`. Resource IDs reference reviewed catalogue; URLs and credential labels come from backend.
- Plan: `{ id, revision, contractVersion, profileRevision, strategyId, occupationCode, selectedRole: string | null, startDate, timeZone, horizonDays, weeklyMinutes, studyDays, sessionLimitMinutes, phases, firstMonth, goals, resources, generatedAt, provider }`.
- Phase: `{ id, startDay, endDay, focus, deliverable, milestones }`; milestone `{ id, startDay, endDay, action }`.
- First-month entry: `{ id, day, localDate, phaseId, kind: task | rest, task: string | null, minutes, resourceIds }`. A scheduled day can contain multiple entries; every day 1–30 must be represented, with rest exclusive of task entries.
- Completion: `{ planId, planRevision, taskId, completedAt }`. IDs remain stable for unchanged tasks; edits cannot reuse an ID for different work.

Use bounded schema fields and exact enums in implementation. Recommended display budgets: title 6 words, description/human edge/tradeoff one short sentence, 3–5 skills. These are editorial targets; hard field limits belong in shared schema. Reject invalid model content before persistence. Do not ask the model to echo authoritative dates, scores or colors; compose those server-side.

## Chatbot integration boundary

Issue #6 owns chat UI, context tools, summaries, actions and conversation storage. It may consume versioned occupation/evidence, strategy, selection and plan fields. Never expose system prompts or credentials. Chat actions must use the same validated selection/commitment endpoints as the UI and cannot silently replace user commitments. This issue adds no chatbot implementation and requires no changes to shared LLM transport.

## Compatibility and verification cases

- Legacy advocate/operations/quality IDs are not synonyms for new strategies. Keep old commitments readable and require explicit selection for a new v2 plan.
- Version caches by contract and profile revision. Reject stale responses and make stale saved plans visible without deleting history.
- Same canonical inputs yield identical recommendation, dates and budgets; narrative may vary.
- Missing direction → null recommendation; stay → Hybrid; change → Pivot; explicit Automate overrides stay. No resolved occupation → null recommendation.
- A 60-minute budget must not generate seven 30-minute tasks. A rest day never becomes missed work. A day-30 entry remains present in both horizons.
- Test both horizons, unavailable evidence, unsupported gradient assumptions, legacy free text, date rollover, constrained study days, invalid resources and completion preservation.

## Delivery mapping

#8 implements metadata/rules/schema; #9 narrative; #10 schedule and validation; #11 migration; #12 canvas; #13 screen integration; #14 progress; #16 failure states. #20 extends existing PostgreSQL persistence rather than introducing Firestore.
