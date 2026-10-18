import { Fragment, type CSSProperties } from "react"
import { ArrowRight } from "lucide-react"

type Node = { title: string; lines: string[]; step?: number }
type Tier = { title: string; color: string; nodes: Node[] }

// Keep in step with apps/api, apps/web and .github/workflows/deploy.yml.
const tiers: Tier[] = [
  {
    title: "Client · browser",
    color: "var(--chart-3)",
    nodes: [
      {
        title: "Next.js 16 app",
        lines: [
          "React 19 · Tailwind 4",
          "Meter · Curve · Navigator · Progress",
          "Plan task tabs · sidebar tracker",
        ],
        step: 1,
      },
      { title: "Career map canvas", lines: ["React Flow", "Pan, zoom, role details"] },
      {
        title: "Browser storage",
        lines: ["Navigator paths: tab cache", "Tracker and Progress sync on save"],
      },
      { title: "Guest identity", lines: ["HttpOnly, SameSite cookie", "No sign-in required"] },
    ],
  },
  {
    title: "Web · Cloud Run",
    color: "var(--tertiary)",
    nodes: [
      {
        title: "voxian-web",
        lines: ["Next.js standalone · Node 24", "Partial prerender + streaming"],
        step: 2,
      },
      {
        title: "/api/* rewrite",
        lines: ["Same-origin proxy to the API", "Crawlers kept off /api"],
      },
    ],
  },
  {
    title: "API · Cloud Run",
    color: "var(--chart-1)",
    nodes: [
      {
        title: "voxian-api",
        lines: [
          "Fastify 5 · Node 24",
          "/onboarding/chat · /occupations",
          "/navigator/paths · /plan",
          "/guest/profile · /guest/commitment",
        ],
        step: 3,
      },
      {
        title: "Abuse guards",
        lines: ["Per-IP rate limits", "Bot screen · origin check", "Zod validation · body limits"],
      },
    ],
  },
  {
    title: "AI · Gemini API",
    color: "var(--warning)",
    nodes: [
      {
        title: "Gemini 3.8 Flash · AI Studio",
        lines: ["Gemini Developer API", "Server-side key in Secret Manager"],
        step: 4,
      },
      {
        title: "Structured output",
        lines: ["Wire schema simplified for Gemini", "Full zod check before use"],
      },
      {
        title: "Grounding rules",
        lines: [
          "Courses from a reviewed catalogue",
          "Every task has a done-when check",
          "Invented modules are dropped",
        ],
      },
    ],
  },
  {
    title: "Data and scoring",
    color: "var(--success)",
    nodes: [
      {
        title: "Cloud SQL · Postgres",
        lines: [
          "O*NET 31.0 occupations + search",
          "Guest profile · plan · logged sessions",
          "Lumi chat turns",
        ],
        step: 5,
      },
      { title: "ILO task data", lines: ["ISCO-08 task exposure", "O*NET → ISCO crosswalk"] },
      {
        title: "Scoring engine",
        lines: ["Deterministic, shared package", "Same code in web and API", "No LLM input"],
      },
    ],
  },
]

const flow = [
  "The browser calls same-origin /api routes; no API keys ever reach the client.",
  "voxian-web proxies each call to voxian-api on Cloud Run.",
  "The API rate-limits, screens bots and validates input, then reads occupations, tasks and saved roles.",
  "Gemini drafts chat replies, directions and plans as schema-checked JSON grounded in that data; each plan task gets a reviewed course and a done-when check.",
  "Exposure scores come only from the deterministic engine; the AI never sets a score.",
]

const tint = (color: string) => ({ "--tier": color }) as CSSProperties

export function ArchitectureDiagram() {
  return (
    <div className="mt-5 rounded-xl border p-5 max-[700px]:p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr]">
        {tiers.map((tier, i) => (
          <Fragment key={tier.title}>
            {i > 0 && (
              <span
                aria-hidden="true"
                className="hidden items-center justify-center text-muted-foreground xl:flex"
              >
                <ArrowRight className="size-4" />
              </span>
            )}
            <section
              aria-label={tier.title}
              style={tint(tier.color)}
              className="rounded-lg border border-[color-mix(in_oklab,var(--tier)_45%,transparent)] bg-[color-mix(in_oklab,var(--tier)_7%,transparent)] p-3"
            >
              <h3 className="mb-2.5 font-mono text-[11px] tracking-[1.5px] text-[var(--tier)] uppercase">
                {tier.title}
              </h3>
              <ul className="space-y-2">
                {tier.nodes.map((node) => (
                  <li
                    key={node.title}
                    className="rounded-md border border-[color-mix(in_oklab,var(--tier)_35%,transparent)] bg-background p-2.5"
                  >
                    <p className="flex items-center gap-1.5 !text-[13px] font-medium !leading-snug !text-foreground">
                      {node.step && (
                        <span
                          aria-label={`Step ${node.step}`}
                          className="grid size-4 shrink-0 place-items-center rounded-full bg-[var(--tier)] text-[10px] font-semibold text-background"
                        >
                          {node.step}
                        </span>
                      )}
                      {node.title}
                    </p>
                    {node.lines.map((line) => (
                      <p key={line} className="mt-0.5 font-mono !text-[11px] !leading-snug">
                        {line}
                      </p>
                    ))}
                  </li>
                ))}
              </ul>
            </section>
          </Fragment>
        ))}
      </div>
      {/* Below xl the arrows are hidden; the numbered steps carry the request flow. */}
      <ol className="mt-5 grid gap-x-6 gap-y-2 text-[14px] leading-relaxed text-muted-foreground lg:grid-cols-2">
        {flow.map((step, i) => (
          <li key={step} className="flex gap-2.5">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border text-[11px] font-medium text-foreground">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
      <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t pt-4 font-mono !text-[12px] !leading-relaxed">
        <span className="text-foreground">Delivery</span> GitHub Actions
        <ArrowRight className="size-3" aria-label="then" /> check, test, build
        <ArrowRight className="size-3" aria-label="then" /> Artifact Registry
        <ArrowRight className="size-3" aria-label="then" /> Cloud Run, asia-southeast1
        <span className="mx-1 opacity-40">·</span> Workload Identity, no stored keys
        <span className="mx-1 opacity-40">·</span> budget alerts stop services at the cap
      </p>
    </div>
  )
}
