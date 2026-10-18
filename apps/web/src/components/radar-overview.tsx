import { useId } from "react"
import { ArrowDownRight } from "lucide-react"
import { ILO_GRADIENTS, iloGradient, taskStats } from "@voxian/shared"
import { eyebrow, smallTag } from "@/lib/styles"
import { cn } from "@/lib/utils"

type Level = "High" | "Medium" | "Low"
const levelColor: Record<Level, string> = {
  High: "text-success",
  Medium: "text-amber-700 dark:text-amber-400",
  Low: "text-destructive",
}
const cell = "relative px-4 pb-[23px] pt-4"

// Meter evidence: ILO exposure gradient + the Radar's four indicators, in the evidence panel.
// Only exposure has data today; adoption and employment say so instead of showing invented figures.
export function RadarEvidence({
  exposures,
  isco,
  crosswalkMatch,
}: {
  exposures: readonly number[]
  /** null = illustrative demo inputs, not ILO scores */
  isco: { code: string; title: string } | null
  crosswalkMatch?: string
}) {
  const { mean, sd } = taskStats(exposures)
  const gradient = iloGradient(mean, sd)
  const info = ILO_GRADIENTS[gradient]
  const tag = gradient.startsWith("G") ? `Gradient ${gradient.slice(1)}` : gradient
  const confidence: [string, Level][] = [
    ["Source quality", isco ? "High" : "Low"],
    [
      "Occupation mapping",
      !isco
        ? "Low"
        : ["exactMatch", "closeMatch", "roleLibrary"].includes(crosswalkMatch ?? "")
          ? "High"
          : "Medium",
    ],
    ["Regional relevance", "Low"],
  ]
  const overall: Level = confidence.some(([, l]) => l === "Low")
    ? "Low"
    : confidence.some(([, l]) => l === "Medium")
      ? "Medium"
      : "High"
  return (
    <>
      <div className="mt-[31px]">
        <p className={cn(eyebrow, "mx-4 mb-[18px]")}>ILO EXPOSURE GRADIENT</p>
        <div className="flex flex-wrap items-center gap-5 border-y px-4 py-5">
          <GradientDial mean={mean} code={gradient.startsWith("G") ? gradient : "–"} />
          <div className="min-w-[220px] flex-1">
            <span className={smallTag}>{tag.toUpperCase()}</span>
            <h2 className="mt-3 text-[16px] font-medium">{info.label}</h2>
            <details className="mt-2 text-sm text-muted-foreground">
              <summary className="cursor-pointer">What this means</summary>
              <p className="mt-2">{info.meaning}</p>
            </details>
            <p className="mt-2 font-mono text-[12px] text-muted-foreground">
              μ {mean.toFixed(2)} · σ {sd.toFixed(2)} · {exposures.length} tasks ·{" "}
              {isco ? `ISCO-08 ${isco.code}` : "illustrative inputs"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-[31px]">
        <p className={cn(eyebrow, "mx-4 mb-[18px]")}>THE FOUR SIGNALS</p>
        <div className="grid grid-cols-2 border-b [&>div:nth-child(even)]:border-l [&>div:nth-child(n+3)]:border-t">
          <div className={cell}>
            <span className={cn(smallTag, "ml-auto table")}>{tag}</span>
            <h3 className="mt-3 text-[15px] font-medium">Potential exposure</h3>
            <GradientBar mean={mean} />
            <p className="mt-2 text-[13px] leading-[1.7] text-muted-foreground">
              {isco ? "ILO WP140 task scores (2025)." : "Illustrative demo inputs."}
            </p>
          </div>
          <div className={cell}>
            <span className={cn(smallTag, "ml-auto table")}>Insufficient data</span>
            <h3 className="mt-3 text-[15px] font-medium">Observed adoption</h3>
            <p className="mt-1.5 text-[13px] leading-[1.7] text-muted-foreground">
              No adoption data linked.
            </p>
          </div>
          <div className={cell}>
            <span className={cn(smallTag, "ml-auto table")}>Data pending</span>
            <h3 className="mt-3 text-[15px] font-medium">Employment outcomes</h3>
            <p className="mt-1.5 text-[13px] leading-[1.7] text-muted-foreground">
              No local jobs or wage data linked.
            </p>
          </div>
          <div className={cell}>
            <span className={cn(smallTag, "ml-auto table", levelColor[overall])}>
              Overall {overall}
            </span>
            <h3 className="mt-3 text-[15px] font-medium">Evidence confidence</h3>
            <dl className="mt-2 space-y-1 text-[13px]">
              {confidence.map(([label, level]) => (
                <div key={label} className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className={levelColor[level]}>{level}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className="flex gap-2.5 px-4 py-[27px] text-[13px] leading-[1.8] text-muted-foreground">
        <ArrowDownRight className="size-4 shrink-0" />
        <p>
          {isco
            ? `Global ILO data; local evidence limited.${crosswalkMatch === "ai" ? " Occupation mapping is AI-assisted." : ""}`
            : "Illustrative demo inputs; not a personal forecast."}
        </p>
      </div>
    </>
  )
}

// Fixed exposure scale: green at low values, yellow midway, red at high values.
function GradientDial({ mean, code }: { mean: number; code: string }) {
  const id = useId()
  const r = 38
  const len = 2 * Math.PI * r * 0.75
  const value = Math.min(1, Math.max(0, mean))
  const angle = (135 + 270 * value) * (Math.PI / 180)
  return (
    <svg
      viewBox="0 0 100 100"
      className="size-[96px] shrink-0"
      role="img"
      aria-label={`${code}, mean ${mean.toFixed(2)}`}
    >
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="12" y1="50" x2="88" y2="50">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="var(--color-muted)"
        strokeWidth="6"
        strokeDasharray={`${len} 999`}
        strokeLinecap="round"
        transform="rotate(135 50 50)"
      />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="6"
        strokeDasharray={`${len * value} 999`}
        strokeLinecap="round"
        transform="rotate(135 50 50)"
      />
      <circle
        cx={50 + r * Math.cos(angle)}
        cy={50 + r * Math.sin(angle)}
        r="4"
        fill="var(--color-background)"
        stroke={value >= 0.6 ? "#ef4444" : value >= 0.4 ? "#eab308" : "#10b981"}
        strokeWidth="2"
      />
      <text x="50" y="57" textAnchor="middle" className="fill-foreground text-[22px] font-[450]">
        {code}
      </text>
    </svg>
  )
}

// Low → G2 (0.4) → G3 (0.5) → G4 (0.6) → max, marker at μ
function GradientBar({ mean }: { mean: number }) {
  const ticks = [
    ["Low", 0],
    ["G2", 40],
    ["G3", 50],
    ["G4", 60],
  ] as const
  return (
    <div className="mt-3">
      <div className="relative h-4 font-mono text-[10px] text-muted-foreground">
        {ticks.map(([label, at]) => (
          <span
            key={label}
            className="absolute -translate-x-1/2 first:translate-x-0"
            style={{ left: `${at}%` }}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="relative mt-1 h-[3px] bg-muted">
        <div
          className="h-full bg-linear-to-r from-emerald-500 via-yellow-400 to-red-500"
          style={{ clipPath: `inset(0 ${100 - Math.min(100, mean * 100)}% 0 0)` }}
        />
      </div>
    </div>
  )
}
