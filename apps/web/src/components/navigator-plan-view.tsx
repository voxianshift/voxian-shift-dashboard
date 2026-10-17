"use client"

import {
  generatedPlanSchema,
  navigatorResources,
  learningPhases,
  type PlanScheduleInput,
  courseList,
  navigatorContext,
  type NavigatorResult,
} from "@voxian/shared"

import { Suspense, useEffect, useState, type ReactNode } from "react"
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Compass,
  Copy,
  Download,
  GitBranch,
  Star,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PanelHeading } from "@/components/radar-panel"
import {
  loadCommitment,
  timelineSprint,
  type Commitment,
  type GeneratedPlan,
} from "@/lib/commitment"
import { CommitDirectionDialog } from "@/components/commit-direction-dialog"
import { defaultFlightPlan, phaseRanges } from "@/lib/flight-plan"
import { useCareerProfile } from "@/components/career-profile-provider"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useNavigator } from "@/components/navigator-provider"
import { NavigatorStatus } from "@/components/navigator-status"
import { cn } from "@/lib/utils"
import { editorialPage, eyebrow, segmentButton, segmentControl, smallTag } from "@/lib/styles"

export default function RoadmapPage() {
  return (
    <Suspense
      fallback={
        <p className="px-6 py-12" role="status">
          Loading your plan…
        </p>
      }
    >
      <RoadmapRoute />
    </Suspense>
  )
}

function RoadmapRoute() {
  const params = useSearchParams()
  const { data, status, profileKey } = useNavigator()
  if (status !== "ready" || !data) return <NavigatorStatus />
  return (
    <Roadmap
      key={`${profileKey}-${params.get("path")}-${params.get("role")}`}
      data={data}
      requestedPath={params.get("path")}
      requestedRole={params.get("role")}
      profileKey={profileKey}
    />
  )
}

export function Roadmap({
  data,
  requestedPath,
  requestedRole,
  profileKey,
  savedCommitment,
}: {
  data: NavigatorResult
  requestedPath: string | null
  requestedRole: string | null
  profileKey: string
  savedCommitment?: Commitment
}) {
  const { profile } = useCareerProfile()
  const branches = data.paths.map((path) => ({ ...path, name: path.title, fit: path.focus }))
  const requested = branches.findIndex((path) => path.id === requestedPath)
  const recommended = branches.findIndex((path) => path.id === data.recommendedPathId)
  const [branchOverride, setBranch] = useState<number | null>(null)
  const branch = branchOverride ?? (requested >= 0 ? requested : Math.max(0, recommended))
  const [targetRole, setTargetRole] = useState<number | null>(
    requested >= 0 &&
      /^(0|[1-9]\d*)$/.test(requestedRole ?? "") &&
      branches[requested]!.roles[Number(requestedRole)]
      ? Number(requestedRole)
      : null,
  )
  const [paceOverride, setSprint] = useState<boolean | null>(null)
  const sprint =
    savedCommitment?.sprint ??
    paceOverride ??
    timelineSprint(profile.timeline) ??
    profile.hours === "5+ hours"
  const [commitOpen, setCommitOpen] = useState(false)
  // Read after mount: the commitment lives in localStorage, which the server render cannot see.
  const [commitment, setCommitment] = useState<Commitment | null>(savedCommitment ?? null)
  useEffect(() => setCommitment(loadCommitment()), [])
  const selected = branches[branch]!
  const planKey = `${profileKey}-${selected.id}-${targetRole}-${sprint}`
  const [generated, setGenerated] = useState<(GeneratedPlan & { key: string }) | null>(null)
  const roleName = targetRole === null ? null : selected.roles[targetRole]!
  // A plan only applies to the direction, role and pace it was generated for
  const committedPlan =
    commitment?.pathId === selected.id &&
    commitment.role === roleName &&
    commitment.sprint === sprint
      ? commitment.plan
      : undefined
  const plan = generated?.key === planKey ? generated : (committedPlan ?? null)
  const courses = courseList(selected, targetRole)
  const [phaseOverride, setActivePhase] = useState(0)
  const roleTargets = targetRole === null ? selected.roles : [selected.roles[targetRole]!]
  const flightPlans = plan
    ? plan.plan.phases.map((phase) => phase.flightPlan)
    : defaultFlightPlan(
        sprint,
        selected,
        roleTargets,
        courses.map((course) => course.title),
      )
  const phaseLabels = plan
    ? plan.plan.phases.map((phase) => ({ title: phase.title, days: phase.days }))
    : learningPhases.map((m, i) => {
        const [start, end] = phaseRanges(sprint)[i]!
        return { title: m.title, days: `Days ${start}–${end}` }
      })
  const activePhase = Math.min(phaseOverride, phaseLabels.length - 1)
  async function generatePlan(schedule: PlanScheduleInput): Promise<GeneratedPlan> {
    const response = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(65_000),
      body: JSON.stringify({
        occupationCode: data.occupationCode,
        strategyId: selected.id,
        destinationId: targetRole === null ? null : selected.destinations[targetRole]!.id,
        profile: navigatorContext(profile),
        pace: sprint ? "intensive" : "lean",
        schedule,
        resourceIds: Object.entries(navigatorResources)
          .filter(([, resource]) => courses.some((course) => course.href === resource.href))
          .map(([id]) => id),
      }),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || "Your plan could not be generated.")
    const generatedPlan = generatedPlanSchema.parse(result)
    setGenerated({ key: planKey, ...generatedPlan })
    return generatedPlan
  }
  const planText = plan
    ? [
        `# ${selected.name} · ${sprint ? 90 : 120}-day plan`,
        plan.plan.summary,
        ...plan.plan.phases.map(
          (ph) =>
            `## ${ph.days}: ${ph.title}\n${ph.focus}\n${ph.actions.map((a) => `- ${a}`).join("\n")}\nDeliverable: ${ph.deliverable}\n\nFlight plan:\n${ph.flightPlan.map((f) => `- ${f.days}: ${f.focus}${f.module ? ` (Module: ${f.module})` : ""}`).join("\n")}`,
        ),
        ...(plan.plan.firstMonth
          ? [
              "## First 30 days",
              ...plan.plan.firstMonth.map(
                (day) =>
                  `${day.localDate} (Day ${day.day}): ${day.kind === "rest" ? "Rest" : `${day.task} (${day.minutes} min; sessions ${day.sessions.join(" + ")})`}`,
              ),
            ]
          : []),
        ...(plan.plan.milestones
          ? [
              "## Later milestones",
              ...plan.plan.milestones.map(
                (milestone) =>
                  `Days ${milestone.startDay}–${milestone.endDay}: ${milestone.action} (${milestone.minutes} min)`,
              ),
            ]
          : []),
        ...(plan.plan.goals
          ? ["## Goals", ...plan.plan.goals.map((goal) => `Day ${goal.day}: ${goal.outcome}`)]
          : []),
        `This week: ${plan.plan.firstStep}`,
        `Generated by ${plan.provider} from your saved profile. Guidance, not a guarantee.`,
      ].join("\n\n")
    : ""
  if (selected.coverage === "unsupported")
    return (
      <div className={editorialPage}>
        <PanelHeading kicker="03 / NAVIGATOR" title="Reviewed pathways are limited.">
          {data.roleTitle}: no reviewed destinations for {selected.label} yet.
        </PanelHeading>
        <div className="flex flex-wrap gap-2">
          {branches.map((path, index) => (
            <Button
              key={path.id}
              variant="outline"
              onClick={() => {
                setBranch(index)
                setTargetRole(null)
              }}
            >
              {path.label}
              {path.coverage === "unsupported" ? " · unavailable" : ""}
            </Button>
          ))}
        </div>
        <p className="mt-4">{selected.mappingRationale}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          No roles or plans are invented to fill missing coverage. Update your occupation or explore
          an available strategy.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/home">Review your profile</Link>
        </Button>
      </div>
    )
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className={editorialPage}>
          {!savedCommitment && (
            <>
              <PanelHeading
                kicker="03 / NAVIGATOR"
                title="One starting point. More than one future."
              >
                Your existing skills are a starting point. Explore four possible strategies,
                <br />
                then turn one into a practical next step.
              </PanelHeading>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 text-[15px]">
                <div>
                  <p>{data.summary}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {data.recommendation.explanation}
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link
                    href={`/roadmap/canvas?path=${selected.id}${targetRole === null ? "" : `&role=${targetRole}`}`}
                  >
                    <GitBranch /> Open career map <ArrowRight />
                  </Link>
                </Button>
              </div>
              <div className="mb-5 bg-muted p-[18px] text-[14px] leading-[1.8] [&_a]:underline [&_a]:underline-offset-3">
                <p>
                  Starting from {data.roleTitle}.{" "}
                  {profile.goals.length
                    ? `Your priorities: ${profile.goals.join(" · ")}.`
                    : "Goals are optional; these paths start with your work."}{" "}
                  {profile.timeline && `Preferred timing: ${profile.timeline}.`}{" "}
                  {profile.risk && `Comfort with change: ${profile.risk}.`}
                </p>
                <Link href="/home">Update your profile</Link>
              </div>
              <div className="relative grid grid-cols-[1fr_2fr] gap-[65px] border-y bg-[radial-gradient(circle,#b69aa929_1px,transparent_1px)] bg-size-[16px_16px] px-10 py-8 max-[700px]:grid-cols-1 max-[700px]:gap-[25px] max-[700px]:px-2.5 max-[700px]:py-[25px]">
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 size-full max-[700px]:hidden"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  {branches
                    .map(
                      (_, index) => `M33 50 C37 50 35 ${12.5 + index * 25} 45 ${12.5 + index * 25}`,
                    )
                    .map((path, index) => (
                      <g key={path}>
                        <path
                          d={path}
                          stroke={branch === index ? "var(--ring)" : "var(--border)"}
                          strokeWidth="1.5"
                          vectorEffect="non-scaling-stroke"
                        />
                        {branch === index && (
                          <path
                            d={path}
                            data-slot="flowing-connection"
                            pathLength="100"
                            stroke="var(--ring)"
                            strokeWidth="2.5"
                            strokeDasharray="12 12"
                            vectorEffect="non-scaling-stroke"
                            className="motion-reduce:hidden"
                          >
                            <animate
                              attributeName="stroke-dashoffset"
                              from="48"
                              to="0"
                              dur="1.4s"
                              repeatCount="indefinite"
                            />
                          </path>
                        )}
                      </g>
                    ))}
                </svg>
                <div className="flex flex-col items-center justify-center text-center text-[16px] leading-[1.7]">
                  <Compass strokeWidth={1} className="size-8 text-[#a28a9a]" />
                  <span className={cn(eyebrow, "mt-3")}>YOU ARE HERE</span>
                  <p>{data.roleTitle}</p>
                  <span className={cn(smallTag, "mt-3")}>DAY 0</span>
                </div>
                <div className="flex flex-col gap-3.5">
                  {branches.map((b, i) => (
                    <button
                      key={b.name}
                      aria-pressed={branch === i}
                      onClick={() => {
                        setBranch(i)
                        setTargetRole(null)
                      }}
                      className={cn(
                        "relative z-10 flex items-center gap-4 rounded-xl border bg-background p-[17px] text-left",
                        branch === i && "border-mauve bg-mauve-tint",
                      )}
                    >
                      <GitBranch className="size-5" strokeWidth={1.3} />
                      <span>
                        <span className={eyebrow}>
                          {b.label.toUpperCase()} / {b.fit.toUpperCase()}
                        </span>
                        <strong className="my-[5px] block text-[16px] font-medium">{b.name}</strong>
                        <small className="text-[14px] text-muted-foreground">{b.roles[0]}</small>
                      </span>
                      <ArrowRight className="ml-auto size-4" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 rounded-xl border p-4 text-sm text-muted-foreground">
                <p>{selected.mappingRationale}</p>
                <p className="mt-2">Human edge: {selected.humanEdge}</p>
                <p className="mt-2">Tradeoff: {selected.tradeoff}</p>
                {data.generationStatus !== "personalized" && (
                  <p className="mt-2">
                    Showing reviewed content; personalized explanation is unavailable.
                  </p>
                )}
              </div>
              <div className="mt-[30px] flex items-center justify-between gap-5 max-[700px]:flex-col max-[700px]:items-start">
                <div>
                  <p className={eyebrow}>{selected.label.toUpperCase()} / SELECTED STRATEGY</p>
                  <h2 className="mt-[5px] text-[24px] tracking-[-0.8px]">{selected.name}</h2>
                </div>
                <div className={segmentControl}>
                  <Button
                    variant="ghost"
                    className={segmentButton}
                    aria-pressed={!sprint}
                    onClick={() => setSprint(false)}
                  >
                    Paced · 120 days
                  </Button>
                  <Button
                    variant="ghost"
                    className={segmentButton}
                    aria-pressed={sprint}
                    onClick={() => setSprint(true)}
                  >
                    Sprint · 90 days
                  </Button>
                </div>
              </div>
              <p className="mt-5 text-[14px] text-muted-foreground">{selected.why}</p>
              <p className="mt-5 text-[14px] font-medium">
                Curated pathway labels · not verified occupations or job openings
              </p>
              <div className="my-[18px] flex flex-wrap gap-2" aria-label="Target role options">
                {selected.roles.map((role, index) => (
                  <Button
                    key={role}
                    variant="outline"
                    aria-pressed={targetRole === index}
                    className={cn(
                      "h-auto min-h-10 whitespace-normal text-left text-[14px]",
                      targetRole === index && "border-mauve bg-mauve-tint",
                    )}
                    onClick={() => {
                      setTargetRole(targetRole === index ? null : index)
                    }}
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </>
          )}
          <div className="grid grid-cols-2 border-y max-[700px]:grid-cols-1 max-[700px]:gap-[15px]">
            {plan
              ? plan.plan.phases.map((ph, i) => (
                  <section key={ph.title} className={phaseClass(i, activePhase)}>
                    <span className={eyebrow}>
                      PHASE 0{i + 1} · {ph.days.toUpperCase()}
                    </span>
                    <h3 className="mt-3.5 mb-2.5 text-[15px]">
                      <PhaseButton index={i} active={activePhase} onSelect={setActivePhase}>
                        {ph.title}
                      </PhaseButton>
                    </h3>
                    <p className="text-[14px] leading-[1.8] text-muted-foreground">{ph.focus}</p>
                    <ul className="mt-3 list-disc space-y-1.5 pl-4 text-[14px] leading-[1.7]">
                      {ph.actions.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                    <p className="mt-3 text-[13px] text-muted-foreground">
                      <span className="text-foreground">Deliverable:</span> {ph.deliverable}
                    </p>
                  </section>
                ))
              : learningPhases.map((m, i) => (
                  <section key={m.title} className={phaseClass(i, activePhase)}>
                    <span className={eyebrow}>
                      PHASE 0{i + 1} · {phaseLabels[i]!.days.toUpperCase()}
                    </span>
                    <h3 className="mt-3.5 mb-2.5 text-[15px]">
                      <PhaseButton index={i} active={activePhase} onSelect={setActivePhase}>
                        {m.title}
                      </PhaseButton>
                    </h3>
                    <p className="text-[16px] leading-[1.9] text-muted-foreground">
                      {i === 0
                        ? selected.firstStep
                        : i === 1
                          ? selected.project
                          : `Use your project to discuss fit for ${targetRole === null ? selected.roles.join(", ") : selected.roles[targetRole]}. Check actual entry requirements and collect feedback before deciding.`}
                    </p>
                  </section>
                ))}
          </div>
          <section
            id="flight-plan"
            aria-labelledby="flight-plan-title"
            className="mt-5 rounded-xl border p-5 max-[700px]:p-4"
          >
            <p className={eyebrow}>
              FLIGHT PLAN · PHASE 0{activePhase + 1} ·{" "}
              {phaseLabels[activePhase]!.days.toUpperCase()}
            </p>
            <h3 id="flight-plan-title" className="mt-[5px] text-[18px] tracking-[-0.4px]">
              {phaseLabels[activePhase]!.title}
            </h3>
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              Choose a phase above to see what to focus on in each window.
            </p>
            <ol className="mt-4">
              {flightPlans[activePhase]!.map((segment, i, all) => {
                const course = courses.find((item) => item.title === segment.module)
                return (
                  <li
                    key={segment.days}
                    className="grid grid-cols-[96px_16px_1fr] gap-x-3 max-[700px]:grid-cols-[72px_16px_1fr]"
                  >
                    <span className="pt-0.5 font-mono text-[13px] text-muted-foreground">
                      {segment.days}
                    </span>
                    <span aria-hidden="true" className="flex flex-col items-center">
                      <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-foreground" />
                      {i < all.length - 1 && <span className="w-px flex-1 bg-border" />}
                    </span>
                    <div className="pb-5">
                      <p className="text-[15px] leading-[1.7]">{segment.focus}</p>
                      {segment.module && (
                        <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground">
                          <BookOpen className="size-3.5" /> Module:
                          {course ? (
                            <a
                              href={course.href}
                              target="_blank"
                              rel="noreferrer"
                              className="text-foreground underline underline-offset-3"
                            >
                              {course.title}
                            </a>
                          ) : (
                            <span className="text-foreground">{segment.module}</span>
                          )}
                          {course?.mustHave && <Badge>Must have</Badge>}
                          {course && <Badge variant="outline">{course.cost}</Badge>}
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
          {plan && (
            <div className="mt-5 bg-muted p-[18px] text-[14px] leading-[1.8]">
              <p>{plan.plan.summary}</p>
              <p className="mt-2">
                <span className="font-medium">This week:</span> {plan.plan.firstStep}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigator.clipboard.writeText(planText).then(() => toast.success("Plan copied"))
                  }
                >
                  <Copy /> Copy plan
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = URL.createObjectURL(new Blob([planText], { type: "text/markdown" }))
                    Object.assign(document.createElement("a"), {
                      href: url,
                      download: "voxian-plan.md",
                    }).click()
                    URL.revokeObjectURL(url)
                  }}
                >
                  <Download /> Download .md
                </Button>
              </div>
              <p className="mt-3 text-[12px] text-muted-foreground">
                Generated by {plan.provider} from your saved work and preferences. Guidance, not a
                guarantee; adjust to your situation.
              </p>
            </div>
          )}
          {plan?.plan.firstMonth && (
            <section className="mt-6" aria-label="First 30 days">
              <h2 className="text-xl">Your first 30 days</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {plan.plan.schedule?.weeklyMinutes} minutes/week · {plan.plan.schedule?.timeZone}.
                Rest days carry no work.
              </p>
              <ol className="mt-3 grid gap-2 sm:grid-cols-2">
                {plan.plan.firstMonth.map((day) => (
                  <li key={day.id} className="rounded-lg border p-3 text-sm">
                    <strong>
                      {day.localDate} · Day {day.day}
                    </strong>
                    <p>{day.kind === "rest" ? "Rest day" : day.task}</p>
                    {day.resourceId && (
                      <a
                        className="mt-1 block underline"
                        href={navigatorResources[day.resourceId].href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {navigatorResources[day.resourceId].title}
                      </a>
                    )}
                    {day.kind === "task" && (
                      <p className="text-muted-foreground">
                        {day.minutes} min · sessions: {day.sessions.join(" + ")} min
                      </p>
                    )}
                  </li>
                ))}
              </ol>
              <h3 className="mt-5 font-medium">Later weekly milestones</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {plan.plan.milestones?.map((milestone) => (
                  <li key={milestone.id}>
                    Days {milestone.startDay}–{milestone.endDay} · {milestone.minutes} min:{" "}
                    {milestone.action}
                  </li>
                ))}
              </ul>
              <h3 className="mt-5 font-medium">Measurable goals</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {plan.plan.goals?.map((goal) => (
                  <li key={goal.day}>
                    Day {goal.day}: {goal.outcome}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section aria-labelledby="courses-title" className="mt-[30px]">
            <p className={eyebrow}>LEARNING COURSES</p>
            <h2
              id="courses-title"
              className="mt-[5px] flex items-center gap-2 text-[20px] tracking-[-0.5px]"
            >
              <BookOpen className="size-5" strokeWidth={1.5} />
              {targetRole === null
                ? `Courses for ${selected.name}`
                : `Courses for ${selected.roles[targetRole]}`}
            </h2>
            <p className="mt-2 text-[14px] text-muted-foreground">
              Must have picks are the most valuable for your profile.{" "}
              {targetRole === null
                ? "Choose a role above to see courses for that role."
                : "Role-specific courses follow the must haves."}
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-3 max-[700px]:grid-cols-1">
              {courses.map((course) => (
                <li key={course.href}>
                  <a
                    href={course.href}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "group flex h-full flex-col rounded-xl border p-4 transition-colors hover:border-mauve focus-visible:outline-2 focus-visible:outline-ring",
                      course.mustHave && "border-foreground/40",
                    )}
                  >
                    <span className="flex flex-wrap items-center gap-1.5">
                      {course.mustHave && (
                        <Badge>
                          <Star data-icon="inline-start" className="fill-current" /> Must have
                        </Badge>
                      )}
                      {course.forRole && <Badge variant="secondary">For this role</Badge>}
                      <Badge
                        variant="outline"
                        className={cn(
                          course.cost === "Free" && "border-success/40 bg-success/10 text-success",
                        )}
                      >
                        {course.cost}
                      </Badge>
                      <span className="text-[12px] text-muted-foreground">
                        {course.provider} · {course.type}
                      </span>
                    </span>
                    <span className="mt-2.5 flex items-start justify-between gap-3 text-[15px] font-medium">
                      {course.title}
                      <ArrowUpRight className="mt-0.5 size-4 shrink-0" />
                    </span>
                    <span className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
                      {course.note}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] text-muted-foreground">
              Official provider links checked October 2026. Fees, availability and eligibility can
              change. Credentials do not guarantee employment.
            </p>
          </section>
        </div>
      </div>
      <footer aria-label="Plan actions" className="shrink-0 border-t bg-background">
        <div className={cn(editorialPage, "w-full py-4")}>
          <div className="flex flex-wrap items-center justify-between gap-4 text-[14px]">
            <p>
              Suggested plan · {sprint ? "90" : "120"} days
              <br />
              <span className="text-[13px] text-muted-foreground">
                {profile.hours ? `Your availability: ${profile.hours} per week. ` : ""}Suggested
                guidance; adjust steps to your schedule.
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {commitment?.pathId === selected.id ? (
                <Button asChild>
                  <Link href="/progress">
                    <Check /> View progress
                  </Link>
                </Button>
              ) : (
                <Button onClick={() => setCommitOpen(true)}>
                  <Compass /> Choose this direction
                </Button>
              )}
            </div>
          </div>
          {commitment && commitment.pathId !== selected.id && (
            <p className="mt-4 text-[14px] text-muted-foreground">
              You are committed to {commitment.direction}. Choosing this direction replaces it.
            </p>
          )}
          {commitOpen && (
            <CommitDirectionDialog
              open={commitOpen}
              onOpenChange={setCommitOpen}
              pathId={selected.id}
              direction={selected.name}
              role={roleName}
              sprint={sprint}
              profile={profile}
              generate={generatePlan}
            />
          )}
        </div>
      </footer>
    </div>
  )
}

function phaseClass(index: number, active: number) {
  return cn(
    "relative px-5 py-6 transition-colors max-[700px]:px-4 max-[700px]:py-5",
    index > 0 && "border-l max-[700px]:border-t max-[700px]:border-l-0",
    index === active && "bg-mauve-tint",
  )
}

// Stretched button: the whole phase column opens its flight plan.
function PhaseButton({
  index,
  active,
  onSelect,
  children,
}: {
  index: number
  active: number
  onSelect: (index: number) => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={index === active}
      aria-controls="flight-plan"
      onClick={() => onSelect(index)}
      className="text-left after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-ring"
    >
      {children}
    </button>
  )
}
