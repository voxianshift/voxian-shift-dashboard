import { useId } from "react"
import { BookOpen, CircleAlert } from "lucide-react"
import { ILO_GRADIENTS, iloGradient, taskStats } from "@voxian/shared"
import { cn } from "@/lib/utils"

type Level = "High" | "Medium" | "Low"
const levelColor: Record<Level, string> = {
  High: "text-success",
  Medium: "text-warning",
  Low: "text-destructive",
}

const card = "rounded-xl border bg-card p-5"
const cardKicker = "font-mono text-[12px] tracking-[1.5px] text-muted-foreground uppercase"
const badge = "rounded-full border px-2 py-0.5 font-mono text-[11px] whitespace-nowrap"

// Radar overview: ILO gradient dial + four indicators (exposure, adoption, employment, confidence).
// Only exposure has data today; the others say so instead of showing invented numbers.
export function RadarOverview({
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
  const short = gradient.startsWith("G") ? gradient : gradient === "Minimal" ? "MIN" : "NE"
  const confidence: [string, Level][] = [
    ["Source quality", isco ? "High" : "Low"],
    [
      "Occupation mapping",
      !isco
        ? "Low"
        : ["exactMatch", "closeMatch"].includes(crosswalkMatch ?? "")
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
    <section
      className="space-y-4 border-b px-[30px] py-6 min-[1600px]:px-10"
      aria-label="Radar overview"
    >
      <div className={cn(card, "flex items-center gap-3 py-3")}>
        <BookOpen className="size-5 shrink-0 text-mauve" strokeWidth={1.4} />
        <div className="min-w-0">
          <p className="font-mono text-[13px] text-mauve-deep">
            {isco
              ? `ILO Working Paper 140 · May 2025 · ISCO-08 ${isco.code} ${isco.title}`
              : "Illustrative demo inputs · not ILO scores"}
          </p>
          <p className="text-[12px] text-muted-foreground">
            Deterministic · μ={mean.toFixed(2)} σ={sd.toFixed(2)} · {exposures.length} tasks · ILO
            Table 5 gradient rule
          </p>
        </div>
      </div>

      <div className="grid gap-4 min-[1100px]:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className={cn(card, "flex flex-col items-center gap-3 py-6")}>
          <p className={cardKicker}>ILO exposure gradient</p>
          <GradientDial mean={mean} code={short} label={info.label} sd={sd} />
          <p className="max-w-80 text-center text-[12px] leading-relaxed text-muted-foreground">
            Gradient from the mean (μ) and spread (σ) of task scores, using ILO’s published
            thresholds. Exposure ≠ probability of losing your job.
          </p>
        </div>

        <div className="grid gap-4 min-[700px]:grid-cols-2">
          <div className={card}>
            <div className="flex items-center justify-between gap-2">
              <p className={cardKicker}>Potential exposure</p>
              <span className={cn(badge, "border-mauve text-mauve-deep")}>
                {gradient.startsWith("G") ? `Gradient ${gradient.slice(1)}` : gradient}
              </span>
            </div>
            <h3 className="mt-3 text-[18px] font-medium">{info.label}</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
              {info.meaning}
            </p>
            <GradientBar mean={mean} />
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">
              {isco
                ? `Source: ILO WP-140 task scores · μ=${mean.toFixed(2)}`
                : "Illustrative inputs"}
            </p>
          </div>

          <div className={card}>
            <div className="flex items-center justify-between gap-2">
              <p className={cardKicker}>Observed adoption</p>
              <span className={cn(badge, "text-muted-foreground")}>Insufficient data</span>
            </div>
            <h3 className="mt-3 text-[18px] font-medium">No dated evidence yet</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
              No verified adoption records are linked for this occupation, so no trend is shown. It
              will appear once dated employer surveys or deployments are added.
            </p>
          </div>

          <div className={card}>
            <div className="flex items-center justify-between gap-2">
              <p className={cardKicker}>Employment outcomes</p>
              <span className={cn(badge, "text-muted-foreground")}>Data pending</span>
            </div>
            <h3 className="mt-3 text-[18px] font-medium">Not linked yet</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
              No observed employment or wage outcomes are linked for your country. Task exposure
              describes what AI could do, not what has happened to jobs.
            </p>
          </div>

          <div className={card}>
            <div className="flex items-center justify-between gap-2">
              <p className={cardKicker}>Evidence confidence</p>
              <span className={cn(badge, levelColor[overall])}>Overall: {overall}</span>
            </div>
            <h3 className="mt-3 text-[18px] font-medium">Source quality</h3>
            <dl className="mt-3 space-y-2 text-[14px]">
              {confidence.map(([label, level]) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full bg-current", levelColor[level])} />
                    {label}
                  </dt>
                  <dd className={levelColor[level]}>{level}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className={cn(card, "flex gap-3 py-4")}>
        <CircleAlert className="mt-0.5 size-5 shrink-0 text-warning" />
        <div>
          <p className="text-[14px] font-medium text-warning">Evidence transparency notice</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Confidence is <span className={levelColor[overall]}>{overall}</span>{" "}
            {isco
              ? "because ILO’s task scores are global and US-based occupation data is mapped to ISCO through the ESCO crosswalk, not because the exposure signal is weak."
              : "because these are illustrative demo inputs."}{" "}
            It rises as local, dated evidence is added. Voxian does not inflate confidence to look
            more decisive.
          </p>
        </div>
      </div>
    </section>
  )
}

// 270° gauge; marker at μ on a 0–1 scale
function GradientDial({
  mean,
  sd,
  code,
  label,
}: {
  mean: number
  sd: number
  code: string
  label: string
}) {
  const id = useId()
  const r = 70
  const len = 2 * Math.PI * r * 0.75
  const value = Math.min(1, Math.max(0, mean))
  const angle = (135 + 270 * value) * (Math.PI / 180)
  return (
    <svg
      viewBox="0 0 180 180"
      className="size-48"
      role="img"
      aria-label={`${code}, ${label}, mean ${mean.toFixed(2)}`}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-success)" />
          <stop offset="55%" stopColor="var(--color-warning)" />
          <stop offset="100%" stopColor="var(--color-destructive)" />
        </linearGradient>
      </defs>
      <circle
        cx="90"
        cy="90"
        r={r}
        fill="none"
        stroke="var(--color-muted)"
        strokeWidth="10"
        strokeDasharray={`${len} 999`}
        strokeLinecap="round"
        transform="rotate(135 90 90)"
      />
      <circle
        cx="90"
        cy="90"
        r={r}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="10"
        strokeDasharray={`${len * value} 999`}
        strokeLinecap="round"
        transform="rotate(135 90 90)"
      />
      <circle
        cx={90 + r * Math.cos(angle)}
        cy={90 + r * Math.sin(angle)}
        r="6"
        fill="var(--color-background)"
        stroke="currentColor"
        strokeWidth="2"
      />
      <text x="90" y="88" textAnchor="middle" className="fill-foreground font-mono text-[30px]">
        {code}
      </text>
      <text x="90" y="108" textAnchor="middle" className="fill-mauve text-[10px]">
        {label}
      </text>
      <text
        x="90"
        y="124"
        textAnchor="middle"
        className="fill-muted-foreground font-mono text-[9px]"
      >
        μ={mean.toFixed(2)} σ={sd.toFixed(2)}
      </text>
    </svg>
  )
}

// Low (G1/minimal) → G2 (0.4) → G3 (0.5) → G4 (0.6) → max, marker at μ
function GradientBar({ mean }: { mean: number }) {
  const ticks = [
    ["Low", 0],
    ["G2", 40],
    ["G3", 50],
    ["G4", 60],
    ["Max", 100],
  ] as const
  return (
    <div className="mt-4">
      <div className="relative h-4 font-mono text-[10px] text-muted-foreground">
        {ticks.map(([label, at]) => (
          <span
            key={label}
            className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full"
            style={{ left: `${at}%` }}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="relative mt-1 h-1.5 rounded-full bg-linear-to-r from-success via-warning to-destructive">
        <span
          className="absolute top-1/2 size-3 -translate-1/2 rounded-full border-2 border-background bg-foreground"
          style={{ left: `${Math.min(100, mean * 100)}%` }}
        />
      </div>
    </div>
  )
}
