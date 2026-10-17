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
    color: "#9d7d91",
    path: "M330 215 C450 204 550 151 850 117",
    longer: "M330 215 C450 204 650 100 850 70",
    headline: "Less routine. More room for judgment.",
    detail:
      "AI drafts, searches and organises. People check the work, resolve exceptions and own the relationship. The opportunity is to become better at the decisions around the tools.",
    signals: [
      "AI drafts become part of everyday workflows",
      "Quality checks matter as much as speed",
      "Complex cases still reach people",
    ],
    action: "Try one reviewed AI workflow. Track time saved and errors caught before expanding it.",
  },
  {
    id: "autonomy",
    name: "More automation",
    label: "Autonomy",
    color: "#63978c",
    path: "M330 215 C460 195 620 66 850 44",
    longer: "M330 215 C450 160 650 45 850 28",
    headline: "More workflows run end to end.",
    detail:
      "Tools handle longer sequences of work. People define boundaries, monitor outcomes and intervene when a workflow fails. Systems thinking becomes useful alongside hands-on experience.",
    signals: [
      "Tools complete multi-step requests",
      "Human handoffs become more deliberate",
      "Teams measure failures and recovery",
    ],
    action: "Map one process, identify its failure points, and design a safe human handoff.",
  },
  {
    id: "oversight",
    name: "More oversight",
    label: "Accountability",
    color: "#b09360",
    path: "M330 215 C500 205 640 190 850 174",
    longer: "M330 215 C490 204 650 182 850 148",
    headline: "Trust and accountability shape adoption.",
    detail:
      "Workplaces introduce AI more cautiously where errors have consequences. Evidence, documented decisions and human accountability influence what can be automated.",
    signals: [
      "Approval gates become explicit",
      "Audit trails accompany AI outputs",
      "Customer trust affects tool choices",
    ],
    action:
      "Build a small evaluation checklist. Record when a person should review or override an AI output.",
  },
] as const

const evidence = [
  {
    date: "AUG 2023",
    title: "Tasks change before whole jobs do.",
    text: "The ILO’s initial global analysis examined how generative AI could complement or automate occupational tasks.",
    href: "https://www.ilo.org/publications/generative-ai-and-jobs-global-analysis-potential-effects-job-quantity-and",
    source: "ILO · Working Paper 96",
  },
  {
    date: "MAY 2025",
    title: "A more detailed exposure picture.",
    text: "The ILO–NASK refined index found potential exposure in one quarter of global employment. This measures exposure, not job losses.",
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
    <div className={editorialPage}>
      <PanelHeading kicker="02 / THE CURVE" title="Change has a direction. You have options.">
        Explore how work could change, what to watch for, and what you can do next.
      </PanelHeading>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-5 py-4 text-[15px]">
        <span className="flex items-center gap-2">
          <Fingerprint className="size-4 text-mauve-deep" />
          {role ? `Your perspective: ${role}` : "A wider view of the future of work"}
        </span>
        <Link href="/meter" className="flex items-center gap-2 text-mauve-deep">
          See your task exposure <ArrowUpRight className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_280px] gap-6 max-[1000px]:grid-cols-1">
        <section
          className="min-w-0 overflow-hidden rounded-xl border bg-background"
          aria-labelledby="curve-title"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 px-6 pt-6">
            <div>
              <p className={eyebrow}>POSSIBLE FUTURES</p>
              <h2 id="curve-title" className="mt-2 text-[22px] font-medium tracking-[-0.5px]">
                One starting point. Different paths.
              </h2>
            </div>
            <div
              className="inline-flex gap-1 rounded-lg bg-muted p-1"
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
              role="img"
              aria-label={`${scenario.label} scenario to ${horizon}. Conceptual change in work, not a measured forecast or probability.`}
              className="w-full min-w-[580px] overflow-visible"
            >
              <defs>
                <pattern id="curve-dots" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" fill="currentColor" opacity=".12" />
                </pattern>
              </defs>
              <rect x="30" y="20" width="850" height="240" fill="url(#curve-dots)" />
              <rect x="330" y="20" width="550" height="240" rx="5" fill="#b69aa9" opacity=".07" />
              <text x="40" y="40" fill="currentColor" opacity=".55" fontSize="20">
                MORE CHANGE TO WORK ↑
              </text>
              <text x="600" y="40" fill="currentColor" opacity=".55" fontSize="20">
                ILLUSTRATIVE SCENARIOS
              </text>
              <line x1="330" y1="65" x2="330" y2="270" stroke="#b69aa9" strokeDasharray="4 5" />
              <path
                d="M50 242 C160 239 230 225 330 215"
                fill="none"
                stroke="currentColor"
                strokeOpacity=".5"
                strokeWidth="2"
              />
              {scenarios.map((item, index) => (
                <path
                  key={item.id}
                  d={horizon === 2028 ? item.path : item.longer}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={index === selected ? 3.5 : 1.5}
                  strokeOpacity={index === selected ? 1 : 0.3}
                  strokeDasharray={index === selected ? "7 5" : "3 7"}
                />
              ))}
              <circle
                cx="330"
                cy="215"
                r="6"
                fill={scenario.color}
                stroke="var(--background)"
                strokeWidth="3"
              />
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
                  index === selected && "border-mauve bg-mauve-tint",
                )}
              >
                <span className="size-2 rounded-full" style={{ background: item.color }} />
                {item.name}
              </Button>
            ))}
          </div>
          <p className="border-t bg-muted/40 px-6 py-4 text-[13px] leading-relaxed text-muted-foreground">
            All lines are conceptual, including the research-context segment. No measured time
            series, probability or occupation-specific forecast is implied.
          </p>
        </section>
        <aside className="flex flex-col justify-between rounded-xl border bg-mauve-tint-faint p-6">
          <div>
            <p className={eyebrow}>WHAT RESEARCH SAYS</p>
            <p className="mt-6 text-[58px] font-[450] leading-none tracking-[-3px]">1 in 4</p>
            <p className="mt-4 text-[16px] leading-relaxed">
              jobs worldwide are potentially exposed to generative AI.
            </p>
            <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
              The ILO–NASK 2025 index describes task exposure. It does not mean one in four jobs
              will disappear.
            </p>
          </div>
          <a
            href={evidence[1]!.href}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex items-center gap-2 text-[14px] underline underline-offset-4"
          >
            Read the ILO findings <ExternalLink className="size-3.5" />
          </a>
        </aside>
      </div>
      <section
        className="mt-6 grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-8 rounded-xl border p-7 max-[700px]:grid-cols-1 max-[700px]:p-5"
        aria-live="polite"
      >
        <div>
          <p className={eyebrow}>IF THIS SCENARIO UNFOLDS / {scenario.label.toUpperCase()}</p>
          <h2 className="mt-3 text-[27px] leading-tight tracking-[-0.7px]">{scenario.headline}</h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
            {scenario.detail}
          </p>
          <h3 className="mt-6 text-[15px] font-medium">Signals to watch in your workplace</h3>
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
        <div className="flex flex-col justify-between rounded-xl bg-muted/60 p-6">
          <div>
            <Lightbulb className="size-5 text-mauve-deep" />
            <p className="mt-3 text-[13px] tracking-[1px] text-muted-foreground">
              ONE PRACTICAL MOVE
            </p>
            <p className="mt-3 text-[18px] leading-relaxed">{scenario.action}</p>
          </div>
          <Link
            href="/roadmap/canvas"
            className="mt-6 flex items-center justify-between gap-4 border-t pt-4 text-[15px]"
          >
            Explore your strategies
            <ArrowRight className="size-4 shrink-0" />
          </Link>
        </div>
      </section>
      <section className="mt-10 pb-4">
        <div className="mb-5 flex items-center gap-3">
          <ChartNoAxesCombined className="size-5 text-mauve-deep" />
          <h2 className="text-[23px] tracking-[-0.5px]">Evidence behind the conversation.</h2>
        </div>
        <div className="grid grid-cols-2 gap-5 max-[700px]:grid-cols-1">
          {evidence.map((item) => (
            <a
              key={item.date}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="group rounded-xl border p-6 transition-colors hover:border-mauve focus-visible:outline-2 focus-visible:outline-ring"
            >
              <p className={eyebrow}>
                {item.date} / {item.source}
              </p>
              <h3 className="mt-4 flex justify-between gap-3 text-[20px] leading-snug">
                {item.title}
                <ArrowUpRight className="size-4 shrink-0" />
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{item.text}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
