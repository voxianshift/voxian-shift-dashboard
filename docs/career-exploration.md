# Profile-based Navigator

Both `/roadmap` (plan) and `/roadmap/canvas` (map) now use the actual career profile. There is no customer-support fallback or sample mode. Missing main occupation opens a setup prompt; optional preferences never block access. Loading and retryable errors are explicit, with no example roles shown as personal recommendations.

A route-scoped `NavigatorProvider` shares one result across both views. It restores a validated tab cache only when its entire profile context matches. Changing occupations, strengths, task mix, goals, direction, available hours, flexibility, timeline, risk appetite or anxieties invalidates the result and prepares new directions. Display name and display-title overrides are excluded from provider requests. Profile reset also removes this derived cache. Existing occupation selections remain in Postgres; preferences and cached Navigator results stay in this browser tab. This is not cross-device sync.

## Backend

`POST /navigator/paths` receives `{ profile }` using the shared `navigatorContextSchema`. It requires a selected main role and looks up authoritative titles and descriptions for every selected occupation. ISCO/ILO task data is supplied when mapped. The configured provider (Rootsys for the MVP) generates three role-specific directions, each with a fit explanation, transferable skills, three alternative roles, a bridge project and a first-week action. Shared Zod schemas validate provider output. Stable direction IDs preserve links from The Curve while titles and roles are specific to the current profile.

Resource IDs are restricted to a reviewed list in `packages/shared/src/navigator.ts`; the server supplies URLs, provider names and credential types. The model cannot introduce course URLs or claim a reference is a certification. Current sources include HubSpot Academy, Salesforce Trailhead, Microsoft Learn, IAPP, NIST, MDN and Google for Developers. Credentials and course availability must be checked with providers. Suggestions are AI guidance, not verified vacancies, match probabilities or guaranteed outcomes.

The route enforces origin checks, a 24KB input limit, a 60-second provider timeout, no-store responses and ten provider requests per minute per API instance. Provider bodies and credentials are never returned. Failed requests show Retry rather than customer-support examples. Use shared deployment quotas before scaling public traffic.

The plan API receives the same actual role/code and full profile constraints. Choosing a specific role sends only that target role. Plans are invalidated when profile context, direction, target role or pace changes. The initial non-generated phases use the personalised first action and bridge project, with suggestions labelled as guidance.

## Canvas and navigation

The map uses React Flow with fixed cards, dot background, pan/zoom and fit controls. All nodes use the actual profile role and generated paths. Choosing a direction reveals its three peer role cards in one column. Each role connects directly to its direction; there are no role-to-role links or implied promotion steps. Uniform 260×208px cards retain at least 48px vertical and 60px horizontal clearance. Only the selected connection flows; card outlines stay static, and reduced-motion settings stop movement.

The non-modal detail panel stays inside the dotted canvas, up to 560px wide and 70% of the desktop canvas. Overview includes why the path fits the profile, Skills & project has practice actions, and Learning has reviewed resource links. Tabs and the plan action stay visible. No backdrop, blur or focus trap blocks the canvas; other app sheets are unchanged. On narrow screens the panel occupies the lower 90% of the canvas. Escape/Close restores focus and leaves the direction expanded.

`?path=advocate|operations|quality&role=0|1|2` preserves direction and optional role between map and plan. Invalid selections fall back to the profile recommendation. Context changes remount view state, preventing stale plans or wrong-role details from being reused.

## The Curve

`/insights` links ILO research separately from conceptual future scenarios. Its curves are not measured occupational forecasts or job-loss probabilities. Scenario links open the corresponding direction for the actual Navigator profile; they never force customer-support paths.

## Verification

Run `pnpm exec vp check`, `pnpm --filter @voxian/web test`, `pnpm --filter @voxian/api test`, and `pnpm --filter @voxian/web build`. Real database tests additionally require `TEST_DATABASE_URL`. Tests cover profile-specific root nodes, direct alternative branches, spacing, selected-role handoff, missing/loading/error screens, full preference forwarding, authoritative occupations, invalid provider data and unapproved resources. Live provider smoke checks use synthetic profiles and do not modify saved user data.
