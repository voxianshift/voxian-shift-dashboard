"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, Fingerprint, RotateCcw } from "lucide-react"
import { baselineIdForOccupation, computeExposure } from "@voxian/shared"
import { ProfileSheet } from "@/components/profile-sheet"
import { Button } from "@/components/ui/button"
import { PanelHeading, RadarFooter } from "@/components/radar-panel"
import { RadarEvidence } from "@/components/radar-overview"
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

const nextStepLink =
  "flex flex-wrap items-center gap-3 border-b px-4 py-[18px] text-[14px] transition-colors duration-150 hover:bg-muted max-[1100px]:gap-[5px] motion-reduce:transition-none"

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
  return (
    <div className="grid min-h-[calc(100dvh-48px)] grid-cols-[minmax(390px,46%)_minmax(0,1fr)] max-[1100px]:grid-cols-[minmax(350px,1fr)_minmax(0,1fr)] max-[850px]:block">
      <section className="flex min-w-0 flex-col border-r max-[850px]:border-r-0">
        <div className="flex h-[41px] items-center justify-between border-b px-[22px] text-[12px] tracking-[0.8px] text-muted-foreground">
          <span className="flex items-center gap-[7px]">
            <span className={statusDot} /> YOUR WORK, DECODED
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setOverrideFocus(null)
              setOverrideRole(null)
            }}
          >
            <RotateCcw /> Reset
          </Button>
        </div>
        <div className="px-[30px] pt-[29px] max-[1100px]:px-[22px] min-[1600px]:px-10 min-[1600px]:pt-10">
          <div className="flex items-center justify-between">
            <p className={eyebrow}>01 / THE METER</p>
            <span className={smallTag}>TASK EXPOSURE</span>
          </div>
          <h1 className="mt-5 text-[clamp(28px,2.7vw,42px)] font-[450] leading-[1.15] tracking-[-1.6px] max-[850px]:text-[36px]">
            Your AI exposure
          </h1>
          <p className="mt-3.5 max-w-[360px] text-[16px] leading-[1.8] text-muted-foreground">
            See which tasks AI can handle.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 py-[13px] text-[13px] leading-[1.7] text-muted-foreground">
            <p>
              {iscoRole
                ? `ILO task-level exposure · ${iscoRole.gradient}`
                : example ||
                    !confirmed ||
                    (overrideRole &&
                      !profile.occupations.some((id) => baselineIdForOccupation(id) === role.id))
                  ? "Example radar · illustrative task inputs"
                  : `Your confirmed profile${profile.preferredName ? ` · ${profile.preferredName}` : ""} · demo task inputs`}
            </p>
            <Link href="/home" className="flex items-center gap-[5px]">
              Edit profile <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="mt-[26px] border px-[15px] py-[13px]">
            <span className={eyebrow}>YOUR ROLE</span>
            <p className="my-1 text-[16px]">{role.title}</p>
            <span className="font-mono text-[13px] text-muted-foreground">{role.code}</span>
          </div>
          {!example && confirmed && profile.occupations.length > 1 && (
            <div
              className={cn(answerChips, "mt-3")}
              aria-label="Choose which occupation baseline to view"
            >
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
              <p className={fieldHelp}>Scores shown per role.</p>
            </div>
          )}
          {!iscoRole && !example && confirmed && !profile.taskFocus && (
            <p className={cn(fieldHelp, "mt-3")}>Default task mix. Adjust below.</p>
          )}
          {iscoRole ? (
            <details className={cn(fieldHelp, "mt-3")}>
              <summary className="cursor-pointer">Source & mapping</summary>
              <p className="mt-2">
                ILO WP140 (2025) · Equal task weights. Task-mix controls do not apply.
              </p>
              <p className="mt-1">
                {iscoRole.crosswalkMatch === "ai"
                  ? `AI-assisted ISCO mapping: ${iscoRole.mappingNote}`
                  : `ESCO–O*NET crosswalk (${iscoRole.crosswalkMatch}): ${iscoRole.mappingNote}`}
              </p>
            </details>
          ) : (
            <fieldset className="mt-[22px]">
              <legend className={eyebrow}>WHAT FILLS MOST OF YOUR DAY?</legend>
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
              <p className={cn(fieldHelp, "mt-3")}>
                Preview a task mix. Reset restores saved values.
              </p>
            </fieldset>
          )}
          <div className="pt-[27px] pb-[22px]" aria-live="polite">
            <div className="flex items-end justify-between">
              <div>
                <p className={eyebrow}>TASK EXPOSURE</p>
                <div
                  data-meter-score
                  className="text-[65px] font-normal leading-[1.2] tracking-[-4px] tabular-nums"
                >
                  {score.toFixed(1)}
                  <span className="ml-2 text-[17px] tracking-[-0.5px] text-muted-foreground">
                    / 100
                  </span>
                </div>
              </div>
              <span
                className={cn(
                  "mb-3.5 flex items-center gap-1.5 text-[13px]",
                  score >= 60
                    ? "text-red-700 dark:text-red-400"
                    : score >= 40
                      ? "text-yellow-700 dark:text-yellow-400"
                      : "text-emerald-700 dark:text-emerald-400",
                )}
              >
                {score >= 60 ? "High exposure" : score >= 40 ? "Moderate exposure" : "Low exposure"}
                <ArrowUpRight className="size-3.5" />
              </span>
            </div>
            <div className="mt-[17px] mb-2 h-[7px] bg-muted">
              <div
                className="h-full bg-linear-to-r from-emerald-500 via-yellow-400 to-red-500 transition-[clip-path] duration-400 motion-reduce:transition-none"
                style={{ clipPath: `inset(0 ${100 - score}% 0 0)` }}
              />
            </div>
            <div className="flex justify-between text-[13px] text-muted-foreground">
              <span>Less exposed</span>
              <span>More exposed</span>
            </div>
            <p className="mt-[15px] text-[13px] text-muted-foreground">
              Exposure measures AI capability, not job-loss risk.
            </p>
          </div>
        </div>
        <div className="flex h-9 items-center justify-between border-y px-[30px] text-[12px] tracking-[0.8px] text-muted-foreground">
          <span>TASK BREAKDOWN</span>
          <span>WEIGHT / AI CAPABILITY</span>
        </div>
        <div className="px-[30px] min-[1600px]:px-10">
          {tasks.map((task, i) => (
            <div className="flex items-center gap-[11px] border-b py-[17px]" key={task.name}>
              <span className="self-start pt-[3px] font-mono text-[12px] text-[#aaa]">
                0{i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] leading-[1.5]">{task.name}</p>
                <span
                  className={cn(
                    "text-[12px]",
                    task.exposure >= 0.6
                      ? "text-red-700 dark:text-red-400"
                      : task.exposure >= 0.4
                        ? "text-yellow-700 dark:text-yellow-400"
                        : "text-emerald-700 dark:text-emerald-400",
                  )}
                >
                  {task.moat ? "Human advantage" : "Automation exposed"}
                </span>
              </div>
              <div className="w-24 shrink-0 text-right font-mono text-[13px]">
                <span>
                  {Math.round(weights[i]! * 100)}%{" "}
                  <span className="text-muted-foreground">
                    / {Math.round(task.exposure * 100)}%
                  </span>
                </span>
                <div className="mt-[7px] h-[3px] bg-muted">
                  <div
                    className="h-full bg-linear-to-r from-emerald-500 via-yellow-400 to-red-500"
                    style={{ clipPath: `inset(0 ${100 - task.exposure * 100}% 0 0)` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between gap-2.5 px-[30px] pt-[15px] pb-6 text-[12px] text-muted-foreground">
          <span className="font-mono">E = 100 × Σ(wᵢ × eᵢ)</span>
          <Link href="/resources" className="flex items-center gap-1">
            See the math <ArrowUpRight className="size-3" />
          </Link>
        </div>
        <RadarFooter />
      </section>
      <aside className="min-w-0 bg-[#fafafa] px-[30px] max-[1100px]:px-4 max-[850px]:border-t max-[850px]:pb-[25px] min-[1600px]:px-10 dark:bg-[#191919]">
        <PanelHeading variant="panel" kicker="YOUR NEXT MOVE" title="Build on your strengths">
          Find skills worth building next.
        </PanelHeading>
        <div className="relative flex items-center justify-between gap-2.5 overflow-hidden bg-mauve-wash px-6 py-[22px] dark:bg-muted">
          <div>
            <p className="relative z-1 text-[16px] text-[#3d343a] dark:text-foreground">
              Turn insight into action.
            </p>
            <span className="mt-1.5 block text-[14px] text-[#7a6d75] dark:text-muted-foreground">
              Start with your human strengths.
            </span>
            <Link
              href="/roadmap"
              className="relative z-1 mt-[11px] flex items-center gap-1.5 text-[14px] text-[#78516c] dark:text-foreground"
            >
              Explore career paths <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div
            className="grid size-[87px] shrink-0 -rotate-20 place-items-center rounded-full border border-[#c6b0bf] outline outline-offset-[9px] outline-[#d6c3d0] max-[1100px]:hidden dark:border-border dark:outline-border"
            aria-hidden="true"
          >
            <Fingerprint
              className="size-[51px] text-[#b49eae] dark:text-muted-foreground"
              strokeWidth={0.8}
            />
          </div>
        </div>
        <RadarEvidence
          exposures={tasks.map((task) => task.exposure)}
          isco={iscoRole ? { code: iscoRole.isco, title: iscoRole.iscoTitle } : null}
          crosswalkMatch={iscoRole?.crosswalkMatch}
        />
        <div className="mt-[30px]">
          <p className={cn(eyebrow, "mx-4 mb-[18px]")}>EXPLORE</p>
          <Link href="/insights" className={nextStepLink}>
            <span className="shrink-0">AI trends</span>
            <ArrowUpRight className="ml-auto size-[13px] shrink-0 text-muted-foreground" />
          </Link>
          <Link href="/roadmap" className={nextStepLink}>
            <span className="shrink-0">Choose a direction</span>
            <ArrowUpRight className="ml-auto size-[13px] shrink-0 text-muted-foreground" />
          </Link>
          <Link href="/resources" className={nextStepLink}>
            <span className="shrink-0">Check the evidence</span>
            <ArrowUpRight className="ml-auto size-[13px] shrink-0 text-muted-foreground" />
          </Link>
        </div>
      </aside>
    </div>
  )
}
