# Validated Flight Plan generation (issue #10)

The `/plan` endpoint accepts an occupation code, strategy ID, optional reviewed destination ID (null means explore the strategy), pace, current Navigator profile, confirmed schedule and optional reviewed resource IDs. It rejects the old free-text role/direction/target-title payload. Titles are resolved from the occupation catalogue and versioned pathway mapping before any provider call. A valid occupation without a reviewed strategy mapping cannot generate a committed plan.

## Code versus model

Code owns the 90/120-day horizon, four quarter-horizon phase boundaries, strategy-specific phase focus, start date, IANA time zone, weekly minute budget, study weekdays, session limits and task IDs. Phase 4 is Leadership & ownership of a small deliverable, not a promised promotion. Explicit schedule choices take precedence over ambiguous profile availability. The UI defaults recognized bands to their lower bound; missing, variable or under-one-hour availability requires an exact positive minute budget.

The provider receives actual occupational task descriptions/exposure from the versioned O*NET–ISCO/task data, curated pathway skill requirements, user-stated strengths/goals/constraints and code-generated time windows. Missing task evidence is explicitly unavailable. The model writes a summary, phase actions/deliverables, scheduled task content, later milestone actions and measurable learning goals. It cannot set dates, budgets, role titles or statistical scores. Exposure arithmetic is unchanged.

## Schedule representation

A plan has contractVersion 3, a unique plan ID, revision 1, profileRevision (hash of the parsed current profile), occupation/strategy/destination IDs, mapping version, generatedAt, summary, firstStep and a nested `schedule` object. The nested schedule contains `startDate`, `timeZone`, `weeklyMinutes`, `studyDays` and `sessionLimitMinutes`; these are the confirmed values, not LLM output.

- First month: exactly 30 consecutive calendar-day entries, each with a stable day ID scoped to the plan, date, phase, task/rest kind, minutes, session-minute splits, task text or null, and optional reviewed resource ID. One daily action can span several bounded sessions.
- Weekly allocation: divide the confirmed budget across selected weekdays in Monday-first order, allocating integer-minute remainder deterministically. This repeats weekly, so every rolling seven-day window respects the budget. Zero-allocation days are rest days even if selected.
- Session splits: never exceed the confirmed limit (45 minutes maximum when short sessions are required). Clock previews reject windows crossing midnight; users must change their budget, study days or time preference.
- Later milestones: cover days 31 through the horizon, in windows of at most seven days clipped to phase boundaries. Each window has code-owned available minutes; windows without study time receive a fixed no-work action instead of a generated task.
- Goals: day 30/60/90 portfolio or practice outcomes, not employment guarantees.

Shared validation checks exact coverage, unique IDs, phase boundaries, date arithmetic, rest-day rules, session splits, milestone minutes and goal dates. Provider output must match exactly the supplied active task/milestone IDs and use only the supplied reviewed resources. Missing, duplicate or invented items trigger at most one schema-repair request with safe validation feedback, within a shared 60-second generation deadline. Both calls count toward the existing quota. Provider/network/auth failures are not automatically retried. If repair fails, generation returns an error without saving a plan. Client response validation uses the same schedule validator.

Local dates are advanced as calendar dates, not 24-hour durations, so leap days and DST transitions do not move the plan's dates. Time-zone metadata determines today's date for validated plans. Existing calendar exports retain their floating-clock behavior; cross-zone calendar export is follow-up integration work, not a claim of this API.

## Compatibility and boundaries

New plans retain phase `days` and `flightPlan` presentation fields for current screens. Roadmap shows four phases, first-month task/rest entries, weekly milestones and goals. Confirmation passes the actual selected date/budget/days/zone into generation and saves the validated response. Editing a validated schedule regenerates the plan before replacing it; failures preserve the previous commitment. Confirmed budgets do not change silently when profile bands change.

Legacy three-phase commitments remain readable with their original boundaries; no destructive migration occurs. Broader stale-plan/profile migration is #11, full task-level Progress tracking is #14, and PostgreSQL synchronization is #20. This change does not modify chatbot #6 or shared LLM transport.
