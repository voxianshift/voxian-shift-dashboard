# CLAUDE.md

Guidelines and reference for AI agents working in `voxian-shift-dashboard`.

## Project Overview

`voxian-shift-dashboard` is a TypeScript monorepo managed with `pnpm`:
- `apps/web`: Next.js 16 frontend application (React 19, Tailwind CSS, shadcn/ui, Radix UI).
- `apps/api`: Fastify backend API services.
- `packages/shared`: Shared types, utilities, and schemas (Zod).

## Key Commands

- **Development**: `pnpm dev` (runs all applications via Turborepo / workspace)
- **Install dependencies**: `pnpm install`
- **Lint**: `pnpm lint`
- **Build**: `pnpm build`
- **Token Optimization (RTK)**: When running dev operations, use RTK commands (`rtk gain`, `rtk discover`, etc.) for token savings.

---

## Styling & UI Component Rules (STRICT - DO NOT OVERRIDE)

- **Mandatory Usage of Existing Components**: Always reuse existing UI components from [`apps/web/src/components/ui/`](file:///Users/f/Hackathon/japac/voxian-shift-dashboard/apps/web/src/components/ui) (e.g. `Button`, `Card`, `Badge`, `Dialog`, `Sheet`, `Select`, `Sidebar`, `Input`, `Tabs`, etc.) and domain components in [`apps/web/src/components/`](file:///Users/f/Hackathon/japac/voxian-shift-dashboard/apps/web/src/components). Do NOT create redundant, ad-hoc raw HTML controls or duplicate components.
- **Mandatory Usage of Existing CSS**: Always inspect and reuse the established design system tokens, layout classes, and utilities already defined in [`apps/web/src/app/globals.css`](file:///Users/f/Hackathon/japac/voxian-shift-dashboard/apps/web/src/app/globals.css) (such as `.radar-workspace`, `.meter-workbench`, `.pane-toolbar`, `.workbench-title`, `.evidence-panel`, `.insight-grid`, semantic CSS variables, etc.).
- **NEVER Override or Re-declare Existing CSS/Components**: Under no circumstances should existing CSS tokens, variables, component variants, or styles in `globals.css` or `components/ui/` be wiped out, overwritten, or clobbered. Do not duplicate or create colliding resets.
- **Token & Theme Consistency**: Always style using defined theme tokens (`bg-background`, `text-foreground`, `border-border`, `text-muted-foreground`, etc.) or the existing layout utilities in `globals.css`. Avoid hardcoding arbitrary hex colors or rogue inline styles that override the design tokens.

---

## Agent skills

### Issue tracker

Local markdown issues tracked in `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default 5 canonical triage roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context (`GLOSSARY.md` + `docs/adr/` at repo root). See `docs/agents/domain.md`.

---

## Grilling & Planning Workflow (/grill-me)

When running `/grill-me`, `/grill-with-docs`, or when the user asks to be "grilled":

1. **Relentless Interviewing**: Interview the user until reaching a shared understanding. Map problems as a **design tree** where decisions branch into sub-decisions.
2. **Work the Frontier in Rounds**:
   - The frontier consists of every decision whose prerequisites are already settled.
   - For every question in the frontier, number it and provide a recommended answer so "yes" can accept it directly.
   - Use the `ask_question` tool whenever interactive user selection is needed.
3. **Fact-Finding First**:
   - Finding facts from the codebase or environment is the agent's job, never the user's.
   - Explore files, packages, and code before asking questions.
4. **Document Artifacts Lazily**:
   - Create domain models and definitions in `GLOSSARY.md`.
   - Record architectural choices in `docs/adr/` (e.g. `docs/adr/0001-<decision>.md`).
   - Break down implementation into spec and tickets under `.scratch/<feature>/`.
