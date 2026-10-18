"use client"

import { Suspense, useId, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  FileText,
  MapPin,
  RotateCcw,
  Shield,
  TrendingUp,
  TriangleAlert,
  Zap,
} from "lucide-react"
import {
  baselineIdForOccupation,
  computeExposure,
  ILO_GRADIENTS,
  iloGradient,
  taskStats,
} from "@voxian/shared"
import { ProfileSheet } from "@/components/profile-sheet"
import { Button } from "@/components/ui/button"
import { PanelHeading } from "@/components/radar-panel"
import { useCareerProfile } from "@/components/career-profile-provider"
import { canConfirmProfile } from "@/lib/onboarding"
import { occupationModels, taskWeights, type MeterModel } from "@/lib/occupations"
import { cn } from "@/lib/utils"
import { useIscoMeter } from "@/hooks/use-isco-meter"
import {
  answerChips,
  editorialPage,
  eyebrow,
  fieldHelp,
  segmentButton,
  segmentControl,
  smallTag,
  statusDot,
} from "@/lib/styles"

export default function MeterPage() {
  return (
    <Suspense
      fallback={
        <p className="p-8 text-[16px]" role="status">
          Loading your radar…
        </p>
      }
    >
      <Meter />
    </Suspense>
  )
}

// Arc gauge: 270° sweep matching the HTML prototype's ILO gradient classifier
function ArcGauge({ score, gradient }: { score: number; gradient: string }) {
  const gradId = useId()
  const r = 82
  const cx = 104
  const cy = 104
  const circumference = 2 * Math.PI * r // ≈ 515
  const arcLen = circumference * 0.75 // 270° sweep ≈ 386
  const dashOffset = -(circumference * 0.125) // start at ~225° from top ≈ -64
  const filled = (score / 100) * arcLen

  const gradeColor =
    gradient === "G1"
      ? "#10b981"
      : gradient === "G2"
        ? "#06b6d4"
        : gradient === "G3"
          ? "#f59e0b"
          : gradient === "G4"
            ? "#f43f5e"
            : "#9f1239"

  return (
    <div className="relative w-52 h-52 mx-auto">
      {/* Track arc, rotated -90deg so arc starts from lower-left */}
      <svg viewBox="0 0 208 208" className="w-full h-full -rotate-90">
        <defs>
          <linearGradient id={`${gradId}-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="28%" stopColor="#06b6d4" />
            <stop offset="56%" stopColor="#f59e0b" />
            <stop offset="84%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#1e293b"
          strokeWidth="14"
          strokeDasharray={`${arcLen} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
        {/* Dim gradient track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={`url(#${gradId}-grad)`}
          strokeWidth="14"
          strokeDasharray={`${arcLen} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          opacity="0.25"
        />
        {/* Progress arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={`url(#${gradId}-grad)`}
          strokeWidth="14"
          strokeDasharray={`${filled} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      {/* Zone labels, no rotation */}
      <svg viewBox="0 0 208 208" className="absolute inset-0 w-full h-full">
        <text
          x="22"
          y="170"
          fill="#10b981"
          fontSize="8"
          fontFamily="monospace"
          textAnchor="middle"
          opacity="0.7"
        >
          Safe
        </text>
        <text
          x="30"
          y="60"
          fill="#06b6d4"
          fontSize="8"
          fontFamily="monospace"
          textAnchor="middle"
          opacity="0.7"
        >
          G1–2
        </text>
        <text
          x="104"
          y="18"
          fill="#f59e0b"
          fontSize="8"
          fontFamily="monospace"
          textAnchor="middle"
          fontWeight="bold"
        >
          G3
        </text>
        <text
          x="178"
          y="60"
          fill="#f43f5e"
          fontSize="8"
          fontFamily="monospace"
          textAnchor="middle"
          opacity="0.7"
        >
          G4
        </text>
        <text
          x="186"
          y="170"
          fill="#9f1239"
          fontSize="8"
          fontFamily="monospace"
          textAnchor="middle"
          opacity="0.7"
        >
          Max
        </text>
      </svg>
      {/* Center readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="text-3xl font-black font-mono leading-none" style={{ color: gradeColor }}>
          {gradient}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono mt-1">
          {ILO_GRADIENTS[gradient as keyof typeof ILO_GRADIENTS]?.label ?? "Gradient"}
        </span>
        <span className="text-[9px] font-semibold mt-0.5" style={{ color: gradeColor + "cc" }}>
          {score >= 70
            ? "High"
            : score >= 50
              ? "Moderate–High"
              : score >= 30
                ? "Moderate"
                : "Lower"}
        </span>
      </div>
    </div>
  )
}

function Meter() {
  const { profile, confirmed, ready, confirm } = useCareerProfile()
  const [editing, setEditing] = useState(false)
  const [overrideFocus, setOverrideFocus] = useState<string | null>(null)
  const [overrideRole, setOverrideRole] = useState<string | null>(null)
  const example = useSearchParams().get("example") === "1"
  const roleId =
    overrideRole ||
    (example
      ? "customer-support"
      : confirmed
        ? baselineIdForOccupation(profile.primaryOccupation)
        : "")
  const demoRole = occupationModels.find((model) => model.id === roleId)
  const catalogueCode = /^\d{2}-\d{4}\.\d{2}$/.test(profile.primaryOccupation)
    ? profile.primaryOccupation
    : ""
  const useIsco = !demoRole && !!catalogueCode && !example && !overrideRole
  const isco = useIscoMeter(catalogueCode, profile.occupationNames[catalogueCode] ?? "", useIsco)
  const iscoRole = useIsco && isco && isco !== "missing" ? isco : undefined
  const role: MeterModel | undefined = demoRole ?? iscoRole
  const focus = overrideFocus || (!example && confirmed ? profile.taskFocus : "") || "routine"
  const escalations = focus === "escalations"

  if (!ready)
    return (
      <p className="p-8 text-[16px]" role="status">
        Loading your profile…
      </p>
    )

  if (!example && !confirmed && canConfirmProfile(profile)) {
    const draftRole = occupationModels.find(
      (model) => model.id === baselineIdForOccupation(profile.primaryOccupation),
    )!
    const mix =
      profile.taskFocus === "escalations"
        ? "Complex problems & exceptions"
        : profile.taskFocus === "mixed"
          ? "A bit of both"
          : profile.taskFocus === "routine"
            ? "Routine questions & coordination"
            : "Default routine weights · task mix not shared"
    return (
      <div className={editorialPage}>
        <PanelHeading kicker="THE METER / YOUR STARTING PICTURE" title="Review your baseline">
          Confirm your role and task mix.
        </PanelHeading>
        <section className="rounded-xl border bg-muted/30 p-6 mb-6" aria-label="Your Meter inputs">
          <p className="text-[20px] font-medium">{draftRole.title}</p>
          <p className="text-[16px] text-muted-foreground mt-2">{mix}</p>
          <p className="text-[14px] text-muted-foreground mt-4 leading-relaxed">
            Demo estimates · not a job-loss prediction.
          </p>
        </section>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => confirm()}>
            Calculate my Meter <ArrowRight />
          </Button>
          <Button variant="outline" onClick={() => setEditing(true)}>
            Edit my profile
          </Button>
        </div>
        <ProfileSheet open={editing} onOpenChange={setEditing} />
      </div>
    )
  }

  if (useIsco && isco === null)
    return (
      <p className="p-8 text-[16px]" role="status">
        Loading your Meter…
      </p>
    )

  if (!role)
    return (
      <div className={editorialPage}>
        <PanelHeading
          kicker="THE METER / BASELINE COVERAGE"
          title={
            profile.primaryOccupation && profile.occupationNames[profile.primaryOccupation]
              ? "Baseline unavailable"
              : profile.occupations.length > 1
                ? "Choose your main occupation."
                : profile.currentWork
                  ? "Match your occupation"
                  : "Set up your Meter"
          }
        >
          {profile.primaryOccupation && profile.occupationNames[profile.primaryOccupation]
            ? `${profile.occupationNames[profile.primaryOccupation]} is saved. No exposure baseline available yet.`
            : profile.occupations.length > 1
              ? "Choose the role that takes most of your time."
              : profile.currentWork
                ? "Search your role to find an available baseline."
                : "Choose your occupation and task mix."}
        </PanelHeading>
        <p className="text-[16px] text-muted-foreground mb-6">
          {profile.occupationNames[profile.primaryOccupation] ||
            profile.currentWork ||
            "No occupation selected."}{" "}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setEditing(true)}>
            {profile.occupations.length > 1 ? "Choose my main role" : "Set up my Meter"}{" "}
            <ArrowRight />
          </Button>
          <Button asChild variant="outline">
            <Link href="/roadmap">Explore directions</Link>
          </Button>
          <Button variant="outline" onClick={() => setOverrideRole("customer-support")}>
            View an example instead
          </Button>
        </div>
        <ProfileSheet open={editing} onOpenChange={setEditing} />
      </div>
    )

  const tasks = role.tasks
  const weights = taskWeights(role, focus)
  const score = computeExposure(tasks.map((task, i) => ({ ...task, weight: weights[i]! })))
  const exposures = tasks.map((t) => t.exposure)
  const { mean, sd } = taskStats(exposures)
  const gradient = iloGradient(mean, sd)
  const gradientTag = gradient.startsWith("G") ? `Gradient ${gradient.slice(1)}` : gradient
  const gradientInfo = ILO_GRADIENTS[gradient as keyof typeof ILO_GRADIENTS]

  const scoreColor =
    score >= 60 ? "text-rose-400" : score >= 40 ? "text-amber-400" : "text-emerald-400"

  const scoreLabel =
    score >= 60 ? "High exposure" : score >= 40 ? "Moderate exposure" : "Low exposure"

  return (
    <div className="min-h-[calc(100dvh-48px)] bg-background text-foreground">
      {/* ILO source banner */}
      {iscoRole && (
        <div className="mx-4 mt-4 lg:mx-8 flex items-center gap-3 rounded-2xl border border-cyan-800/40 bg-cyan-950/20 px-5 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-950/60">
            <FileText className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <span className="font-mono text-xs font-bold text-cyan-300">
              ILO Working Paper 140 · May 2025 · {iscoRole.iscoTitle ?? iscoRole.isco}
            </span>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Deterministic Adoption Engine · {iscoRole.gradient} classification ·{" "}
              {exposures.length} task records triangulated
            </p>
          </div>
        </div>
      )}

      {/* ── HERO: gauge + score ── */}
      <div className="mx-4 mt-4 lg:mx-8 grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Arc gauge panel */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center rounded-3xl border border-border bg-card/60 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            ILO Gradient Classifier
          </div>
          <ArcGauge score={score} gradient={gradient} />
          {iscoRole && (
            <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-amber-900/40 bg-amber-950/20 px-3 py-1.5 font-mono text-[10px] text-amber-500/70">
              <TriangleAlert className="h-3 w-3" />
              ILO values approximate for {iscoRole.isco}
            </div>
          )}
          <div className="mt-3 w-full rounded-xl border border-border bg-muted p-3">
            <div className="mb-1 font-mono text-[10px] text-cyan-400 font-bold">
              E = 100 × Σ(w<sub>i</sub> × e<sub>i</sub>)
            </div>
            <p className="text-[10px] text-muted-foreground">
              Weights adjusted by reported daily gravity. Reflects actual task composition.
            </p>
          </div>
        </div>

        {/* Score + info panel */}
        <div className="lg:col-span-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Potential exposure card */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-foreground/70">
                  <Zap className="h-3.5 w-3.5 text-amber-400" /> Potential Exposure
                </span>
                <span className="rounded-full border border-amber-800/60 bg-amber-950/60 px-2 py-0.5 font-mono text-[10px] text-amber-300">
                  {gradientTag}
                </span>
              </div>
              <div className="mb-1 text-base font-bold text-white">{scoreLabel}</div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {iscoRole
                  ? `ILO WP140 (May 2025) places ${iscoRole.iscoTitle ?? iscoRole.isco} in the ${gradientTag.toLowerCase()} — ${gradientInfo?.meaning ?? "based on task-level AI capability scores"}.`
                  : "Illustrative demo inputs based on task-level AI capability scores."}
              </p>
            </div>
            <div className="mt-4 border-t border-border pt-3" aria-live="polite">
              <div className="mb-1.5 flex items-center justify-between font-mono text-[9px] text-muted-foreground">
                <span>Not Exposed</span>
                <span className="font-bold text-amber-400">{score.toFixed(1)} / 100</span>
                <span>Max</span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-border">
                <div className="h-full w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 opacity-30" />
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-[width] duration-700"
                  style={{ width: `${score}%` }}
                />
              </div>
              <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
                μ={mean.toFixed(2)} · σ={sd.toFixed(2)} ·{" "}
                {iscoRole ? `ILO ISCO-08 ${iscoRole.isco}` : "illustrative inputs"}
              </p>
            </div>
          </div>

          {/* Observed adoption card */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-foreground/70">
                  <TrendingUp className="h-3.5 w-3.5 text-cyan-400" /> Observed Adoption
                </span>
                <span className="rounded-full border border-cyan-800/60 bg-cyan-950/60 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                  Emerging
                </span>
              </div>
              <div className="mb-1 text-base font-bold text-white">Emerging Phase</div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Global deployment signals indicate early-stage consistent adoption. Regional data
                pending for Indonesia-specific rollout waves.
              </p>
            </div>
            <div className="mt-4 border-t border-border pt-3">
              <svg viewBox="0 0 200 40" className="h-10 w-full">
                <path
                  d="M 10 35 Q 50 35 80 28 Q 110 20 130 10 Q 155 2 190 2"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="2"
                />
                <path
                  d="M 10 35 Q 50 35 80 28 Q 110 20 130 10 Q 155 2 190 2"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  strokeDasharray="5 3"
                  opacity="0.5"
                />
                <circle cx="65" cy="31" r="4" fill="#00f2fe" />
                <text
                  x="68"
                  y="26"
                  fill="#00f2fe"
                  fontSize="7"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  S_adj emerging
                </text>
                <text x="10" y="40" fill="#475569" fontSize="6" fontFamily="monospace">
                  Minimal
                </text>
                <text x="150" y="40" fill="#475569" fontSize="6" fontFamily="monospace">
                  Mature
                </text>
              </svg>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                Adoption model · engine v0.2 · signals triangulated
              </p>
            </div>
          </div>

          {/* Employment outcomes card */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-foreground/70">
                  <MapPin className="h-3.5 w-3.5 text-purple-400" /> Employment Outcomes
                </span>
                <span className="rounded-full border border-purple-800/60 bg-purple-950/60 px-2 py-0.5 font-mono text-[10px] text-purple-300">
                  Regional Gap
                </span>
              </div>
              <div className="mb-1 text-base font-bold text-white">Indonesia: Data Pending</div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                No verified local employment outcome data available. Global signals show net
                headcount contraction in transactional roles, partially offset by role redefinition.
              </p>
            </div>
            <div className="mt-4 flex items-start gap-2 border-t border-border pt-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-900/60">
                <MapPin className="h-3 w-3 text-purple-400" />
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">
                Regional evidence share: 78%. Indonesia-specific deployment data needed.
              </p>
            </div>
          </div>

          {/* Evidence confidence card */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-foreground/70">
                  <Shield className="h-3.5 w-3.5 text-emerald-400" /> Evidence Confidence
                </span>
                <span className="rounded-full border border-rose-800/60 bg-rose-950/60 px-2 py-0.5 font-mono text-[10px] text-rose-300">
                  Overall: Low
                </span>
              </div>
              <div className="mb-1 text-base font-bold text-white">Source Quality</div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Independence and regional coverage are strong. Recency flag: most evidence predates
                mid-2024 Indonesia deployment rollout.
              </p>
            </div>
            <div className="mt-4 space-y-2 border-t border-border pt-3">
              {[
                ["Independence", "High", "text-emerald-400"],
                ["Regional", "High", "text-emerald-400"],
                ["Recency", "Low", "text-rose-400"],
              ].map(([label, value, color]) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                      className={cn(
                        "inline-block h-2.5 w-2.5 rounded-full",
                        color === "text-emerald-400" ? "bg-emerald-400" : "bg-rose-400",
                      )}
                    />
                    {label}
                  </span>
                  <span className={cn("font-mono font-bold", color)}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── ROLE HEADER + TASK MIX ── */}
      <div className="mx-4 mt-4 lg:mx-8 rounded-2xl border border-border bg-card/40 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Your Role
            </p>
            <p className="mt-1 text-base font-semibold text-white">{role.title}</p>
            <span className="font-mono text-[12px] text-muted-foreground">{role.code}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-foreground"
            onClick={() => {
              setOverrideFocus(null)
              setOverrideRole(null)
            }}
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
          </Button>
        </div>

        {!example && confirmed && profile.occupations.length > 1 && (
          <div className={cn(answerChips, "mt-3")}>
            {occupationModels
              .filter((model) =>
                profile.occupations.some((id) => baselineIdForOccupation(id) === model.id),
              )
              .map((model) => (
                <Button
                  variant="outline"
                  key={model.id}
                  aria-pressed={role.id === model.id}
                  onClick={() => {
                    setOverrideRole(model.id)
                    setOverrideFocus(null)
                  }}
                >
                  {model.title}
                </Button>
              ))}
          </div>
        )}

        {!iscoRole && (
          <fieldset className="mt-4">
            <legend className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              What fills most of your day?
            </legend>
            <div className={cn(segmentControl, "flex-wrap")}>
              <Button
                variant="ghost"
                className={cn(segmentButton, "min-w-[110px]")}
                aria-pressed={focus === "routine"}
                onClick={() => setOverrideFocus("routine")}
              >
                Routine & transactions
              </Button>
              <Button
                variant="ghost"
                className={cn(segmentButton, "min-w-[110px]")}
                aria-pressed={escalations}
                onClick={() => setOverrideFocus("escalations")}
              >
                Escalations & exceptions
              </Button>
              <Button
                variant="ghost"
                className={cn(segmentButton, "min-w-[110px]")}
                aria-pressed={focus === "mixed"}
                onClick={() => setOverrideFocus("mixed")}
              >
                A bit of both
              </Button>
            </div>
          </fieldset>
        )}

        {iscoRole && (
          <details className="mt-3 text-[11px] text-muted-foreground">
            <summary className="cursor-pointer font-mono">Source & mapping</summary>
            <p className="mt-2">
              ILO WP140 (2025) · Equal task weights. Task-mix controls do not apply.
            </p>
            <p className="mt-1">
              {iscoRole.crosswalkMatch === "ai"
                ? `AI-assisted ISCO mapping: ${iscoRole.mappingNote}`
                : `ESCO–O*NET crosswalk (${iscoRole.crosswalkMatch}): ${iscoRole.mappingNote}`}
            </p>
          </details>
        )}
      </div>

      {/* ── TASK BREAKDOWN ── */}
      <div className="mx-4 mt-4 lg:mx-8">
        <div className="flex h-9 items-center justify-between rounded-t-2xl border border-b-0 border-border bg-card/60 px-5 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <span>Task Breakdown</span>
          <span>Weight / AI Capability</span>
        </div>
        <div
          className="rounded-b-2xl border border-border bg-background/80 px-5"
          aria-live="polite"
        >
          {tasks.map((task, i) => (
            <div
              key={task.name}
              className="flex items-center gap-3 border-b border-border py-4 last:border-b-0"
            >
              <span className="w-5 shrink-0 self-start pt-0.5 font-mono text-[11px] text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] leading-snug text-foreground">{task.name}</p>
                <span
                  className={cn(
                    "text-[11px] font-mono",
                    task.exposure >= 0.6
                      ? "text-rose-400"
                      : task.exposure >= 0.4
                        ? "text-amber-400"
                        : "text-emerald-400",
                  )}
                >
                  {task.moat ? "Human advantage" : "Automation exposed"}
                </span>
              </div>
              <div className="w-24 shrink-0 text-right font-mono text-[12px]">
                <span className="text-foreground/70">
                  {Math.round(weights[i]! * 100)}%{" "}
                  <span className="text-muted-foreground">
                    / {Math.round(task.exposure * 100)}%
                  </span>
                </span>
                <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500"
                    style={{ width: `${task.exposure * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between px-5 py-3 font-mono text-[11px] text-muted-foreground">
          <span>E = 100 × Σ(wᵢ × eᵢ)</span>
          <Link
            href="/resources"
            className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
          >
            See the math <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* ── CONFIDENCE CALLOUT ── */}
      <div className="mx-4 mt-4 mb-6 lg:mx-8 flex items-start gap-3 rounded-2xl border border-amber-800/40 bg-amber-950/10 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-900/40">
          <TriangleAlert className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <p className="mb-1 text-xs font-bold text-amber-300">
            Recency Flag: Evidence Transparency Notice
          </p>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Most evidence records predate the 2024 Indonesia-specific deployment wave for AI tools.
            The overall confidence is <span className="text-rose-400 font-semibold">Low</span> not
            because the global signal is weak, but because the regional recency gap has not been
            closed. This will upgrade automatically as new verified records are ingested.{" "}
            <span className="text-amber-400">
              Voxian does not inflate confidence to appear more decisive.
            </span>
          </p>
        </div>
      </div>

      {/* Quick-nav footer */}
      <div className="mx-4 mb-8 flex flex-wrap gap-3 lg:mx-8">
        <Link
          href="/insights"
          className="flex items-center gap-1.5 rounded-xl border border-border bg-card/40 px-4 py-2.5 text-[13px] text-muted-foreground transition-colors hover:border-cyan-800/60 hover:text-cyan-300"
        >
          AI trends <ArrowUpRight className="h-3 w-3" />
        </Link>
        <Link
          href="/roadmap"
          className="flex items-center gap-1.5 rounded-xl border border-border bg-card/40 px-4 py-2.5 text-[13px] text-muted-foreground transition-colors hover:border-cyan-800/60 hover:text-cyan-300"
        >
          Choose a direction <ArrowUpRight className="h-3 w-3" />
        </Link>
        <Link
          href="/resources"
          className="flex items-center gap-1.5 rounded-xl border border-border bg-card/40 px-4 py-2.5 text-[13px] text-muted-foreground transition-colors hover:border-cyan-800/60 hover:text-cyan-300"
        >
          Check the evidence <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <ProfileSheet open={editing} onOpenChange={setEditing} />
    </div>
  )
}
