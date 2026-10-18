"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  ChartNoAxesCombined,
  ExternalLink,
  Fingerprint,
  Lightbulb,
} from "lucide-react"
import { useCareerProfile } from "@/components/career-profile-provider"
import { Button } from "@/components/ui/button"
import { PanelHeading } from "@/components/radar-panel"
import { editorialPage, eyebrow } from "@/lib/styles"
import { cn } from "@/lib/utils"

const scenarios = [
  {
    id: "augmentation",
    name: "People + AI",
    label: "Augmentation",
    color: "#eab308",
    path: "M330 215 C450 204 550 151 850 117",
    longer: "M330 215 C450 204 650 100 850 70",
    headline: "AI assists. People decide.",
    detail: "AI handles routine work. People review outputs and resolve exceptions.",
    signals: ["AI-assisted workflows", "Human quality checks", "People handle complex cases"],
    action: "Test one AI workflow. Track time saved and errors.",
  },
  {
    id: "autonomy",
    name: "More automation",
    label: "Autonomy",
    color: "#ef4444",
    path: "M330 215 C460 195 620 66 850 44",
    longer: "M330 215 C450 160 650 45 850 28",
    headline: "Tools run more of the workflow.",
    detail: "AI completes multi-step work. People set limits and handle failures.",
    signals: ["Multi-step automation", "Clear human handoffs", "Failure and recovery tracking"],
    action: "Map one process. Define when a person takes over.",
  },
  {
    id: "japac",
    name: "Regional JAPAC",
    label: "Regional JAPAC Context",
    color: "#a855f7",
    path: "M330 215 C500 205 640 190 850 174",
    longer: "M330 215 C490 204 650 182 850 148",
    headline: "Relationships slow full replacement.",
    detail:
      "Relationship-based commerce in Southeast Asia dampens full replacement. Hybrid models, with people handling empathy and trust, stay common in enterprise deployments.",
    signals: [
      "People own client relationships",
      "AI supports, people sign off",
      "Trust shapes adoption pace",
    ],
    action: "List the client or stakeholder moments in your work that rely on trust.",
  },
] as const

const evidence = [
  {
    date: "AUG 2023",
    title: "AI changes tasks.",
    text: "ILO research on task automation and augmentation.",
    href: "https://www.ilo.org/publications/generative-ai-and-jobs-global-analysis-potential-effects-job-quantity-and",
    source: "ILO · Working Paper 96",
  },
  {
    date: "MAY 2025",
    title: "Global AI exposure",
    text: "ILO–NASK’s updated task-exposure index.",
    href: "https://www.ilo.org/resource/news/one-four-jobs-risk-being-transformed-genai-new-ilo%E2%80%93nask-global-index-shows",
    source: "ILO–NASK · 2025 index",
  },
]

export default function InsightsPage() {
  const { profile } = useCareerProfile()
  const [selected, setSelected] = useState(0)
  const [horizon, setHorizon] = useState<2028 | 2030>(2028)
  const scenario = scenarios[selected]!
  const role = profile.occupationNames[profile.primaryOccupation] || profile.currentWork
  return (
    <div className="bg-background text-foreground min-h-[calc(100dvh-48px)]">
      <div className={editorialPage}>
        <PanelHeading kicker="02 / THE CURVE" title="Three possible futures">
          Select a curve to explore your next move.
        </PanelHeading>
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/60 px-5 py-4 text-[15px]">
          <span className="flex items-center gap-2">
            <Fingerprint className="size-4 text-cyan-700 dark:text-cyan-400" />
            {role ? role : "Future of work"}
          </span>
          <Link
            href="/meter"
            className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 hover:text-brand-ink"
          >
            Your Meter <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_280px] gap-6 max-[1000px]:grid-cols-1">
          <section
            className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card/60"
            aria-labelledby="curve-title"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 px-6 pt-6">
              <div>
                <p className={eyebrow}>POSSIBLE FUTURES</p>
                <h2 id="curve-title" className="mt-2 text-[22px] font-medium tracking-[-0.5px]">
                  How work could change
                </h2>
              </div>
              <div
                className="inline-flex gap-1 rounded-lg bg-muted border border-border p-1"
                aria-label="Scenario horizon"
              >
                {([2028, 2030] as const).map((year) => (
                  <Button
                    key={year}
                    variant="ghost"
                    aria-pressed={horizon === year}
                    className={cn("text-[14px]", horizon === year && "bg-background shadow-sm")}
                    onClick={() => setHorizon(year)}
                  >
                    To {year}
                  </Button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto px-5 pt-6 pb-2">
              <svg
                viewBox="0 0 910 320"
                role="group"
                aria-label={`${scenario.label} scenario to ${horizon}. Conceptual change in work, not a measured forecast or probability.`}
                className="w-full min-w-[580px] overflow-visible"
              >
                <defs>
                  <pattern id="curve-dots" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="currentColor" opacity=".12" />
                  </pattern>
                </defs>
                <rect x="30" y="20" width="850" height="240" fill="url(#curve-dots)" />
                <rect
                  x="330"
                  y="20"
                  width="550"
                  height="240"
                  rx="5"
                  fill="var(--brand)"
                  opacity=".07"
                />
                <text x="40" y="40" fill="currentColor" opacity=".55" fontSize="20">
                  MORE CHANGE TO WORK ↑
                </text>
                <text x="600" y="40" fill="currentColor" opacity=".55" fontSize="20">
                  ILLUSTRATIVE SCENARIOS
                </text>
                <line
                  x1="330"
                  y1="65"
                  x2="330"
                  y2="270"
                  stroke="var(--brand)"
                  strokeDasharray="4 5"
                />
                <path
                  d="M50 242 C160 239 230 225 330 215"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity=".5"
                  strokeWidth="2"
                />
                {scenarios.map((item, index) => (
                  <g
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Focus ${item.name}`}
                    aria-pressed={index === selected}
                    className="cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-ring"
                    onClick={() => setSelected(index)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        setSelected(index)
                      }
                    }}
                  >
                    <path
                      d={horizon === 2028 ? item.path : item.longer}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="18"
                      pointerEvents="stroke"
                    />
                    <path
                      d={horizon === 2028 ? item.path : item.longer}
                      fill="none"
                      stroke={item.color}
                      strokeWidth={index === selected ? 3.5 : 1.5}
                      strokeOpacity={index === selected ? 1 : 0.5}
                      strokeDasharray={index === selected ? "7 5" : "3 7"}
                      pointerEvents="none"
                    />
                  </g>
                ))}
                <circle
                  cx="330"
                  cy="215"
                  r="6"
                  fill={scenario.color}
                  stroke="var(--background)"
                  strokeWidth="3"
                />
                <g aria-label="You are here in 2026">
                  <rect x="304" y="166" width="52" height="30" rx="6" fill="var(--foreground)" />
                  <path d="M324 196 L330 202 L336 196" fill="var(--foreground)" />
                  <text
                    x="330"
                    y="186"
                    textAnchor="middle"
                    fill="var(--background)"
                    fontSize="16"
                    fontWeight="600"
                  >
                    You
                  </text>
                </g>
                <text x="45" y="295" fill="currentColor" opacity=".55" fontSize="22">
                  Research context
                </text>
                <text x="310" y="295" fill="currentColor" fontSize="22">
                  2026
                </text>
                <text x="815" y="295" fill="currentColor" opacity=".55" fontSize="22">
                  {horizon}
                </text>
              </svg>
            </div>
            <div className="flex flex-wrap gap-2 px-6 pb-5" aria-label="Explore a scenario">
              {scenarios.map((item, index) => (
                <Button
                  key={item.id}
                  variant="outline"
                  aria-pressed={selected === index}
                  onClick={() => setSelected(index)}
                  className={cn(
                    "min-h-10 text-[14px]",
                    index === selected && "border-brand bg-brand-tint",
                  )}
                >
                  <span className="size-2 rounded-full" style={{ background: item.color }} />
                  {item.name}
                </Button>
              ))}
            </div>
            <p className="border-t border-border bg-muted/60 px-6 py-4 text-[13px] leading-relaxed text-muted-foreground">
              Illustrative scenarios, not measured trends or personal forecasts. Colors show change
              intensity, not job-loss probability.
            </p>
          </section>
          <aside className="flex flex-col justify-between rounded-2xl border border-border bg-card/60 p-6">
            <div>
              <p className={eyebrow}>WHAT RESEARCH SAYS</p>
              <p className="mt-6 text-[58px] font-[450] leading-none tracking-[-3px] text-cyan-700 dark:text-cyan-400">
                1 in 4
              </p>
              <p className="mt-4 text-[16px] leading-relaxed">
                jobs worldwide are potentially exposed to generative AI.
              </p>
              <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
                ILO–NASK, 2025 · Exposure does not mean job loss.
              </p>
            </div>
            <a
              href={evidence[1]!.href}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-2 text-[14px] underline underline-offset-4"
            >
              ILO findings <ExternalLink className="size-3.5" />
            </a>
          </aside>
        </div>
        <section
          className="mt-6 grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-8 rounded-2xl border border-border bg-card/40 p-7 max-[700px]:grid-cols-1 max-[700px]:p-5"
          aria-live="polite"
        >
          <div>
            <p className={eyebrow}>SCENARIO / {scenario.label.toUpperCase()}</p>
            <h2 className="mt-3 text-[27px] leading-tight tracking-[-0.7px]">
              {scenario.headline}
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
              {scenario.detail}
            </p>
            <h3 className="mt-6 text-[15px] font-medium">Watch for</h3>
            <ul className="mt-3 space-y-2 text-[15px] text-muted-foreground">
              {scenario.signals.map((signal) => (
                <li className="flex items-start gap-3" key={signal}>
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full"
                    style={{ background: scenario.color }}
                  />
                  {signal}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-muted p-6">
            <div>
              <Lightbulb className="size-5 text-brand-deep" />
              <p className="mt-3 text-[13px] tracking-[1px] text-muted-foreground">TRY THIS</p>
              <p className="mt-3 text-[18px] leading-relaxed">{scenario.action}</p>
            </div>
            <Link
              href="/roadmap/canvas"
              className="mt-6 flex items-center justify-between gap-4 border-t pt-4 text-[15px]"
            >
              Explore strategies
              <ArrowRight className="size-4 shrink-0" />
            </Link>
          </div>
        </section>
        <section className="mt-10 pb-4">
          <div className="mb-5 flex items-center gap-3">
            <ChartNoAxesCombined className="size-5 text-brand-deep" />
            <h2 className="text-[23px] tracking-[-0.5px]">Sources</h2>
          </div>
          <div className="grid grid-cols-2 gap-5 max-[700px]:grid-cols-1">
            {evidence.map((item) => (
              <a
                key={item.date}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl border border-border bg-card/60 p-6 transition-colors hover:border-cyan-700/60 focus-visible:outline-2 focus-visible:outline-ring"
              >
                <p className={eyebrow}>
                  {item.date} / {item.source}
                </p>
                <h3 className="mt-4 flex justify-between gap-3 text-[20px] leading-snug">
                  {item.title}
                  <ArrowUpRight className="size-4 shrink-0" />
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
