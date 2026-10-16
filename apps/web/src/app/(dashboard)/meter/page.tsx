"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Fingerprint,
  Layers,
  RotateCcw,
  ShieldCheck,
} from "lucide-react"
import { baselineIdForOccupation, computeExposure } from "@voxian/shared"
import { ProfileSheet } from "@/components/profile-sheet"
import { Button } from "@/components/ui/button"
import { PanelHeading, RadarFooter } from "@/components/radar-panel"
import { useCareerProfile } from "@/components/career-profile-provider"
import { canConfirmProfile } from "@/lib/onboarding"
import { occupationModels, taskWeights } from "@/lib/occupations"

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
  const role = occupationModels.find((model) => model.id === roleId)
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
      <div className="editorial-page">
        <PanelHeading
          kicker="THE METER / YOUR STARTING PICTURE"
          title="Your profile is ready for the Meter."
        >
          Check your occupation and task mix, then calculate your exposure baseline. Other
          preferences are optional.
        </PanelHeading>
        <section className="rounded-xl border bg-muted/30 p-6 mb-6" aria-label="Your Meter inputs">
          <p className="text-[20px] font-medium">{draftRole.title}</p>
          <p className="text-[16px] text-muted-foreground mt-2">{mix}</p>
          <p className="text-[14px] text-muted-foreground mt-4 leading-relaxed">
            Uses illustrative task estimates. Exposure is not a prediction of job loss.
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
  if (!role)
    return (
      <div className="editorial-page">
        <PanelHeading
          kicker="THE METER / BASELINE COVERAGE"
          title={
            profile.primaryOccupation && profile.occupationNames[profile.primaryOccupation]
              ? "Baseline being prepared."
              : profile.occupations.length > 1
                ? "Choose your main occupation."
                : profile.currentWork
                  ? "Your work needs a supported baseline."
                  : "Let’s set up your Meter."
          }
        >
          {profile.primaryOccupation && profile.occupationNames[profile.primaryOccupation]
            ? `${profile.occupationNames[profile.primaryOccupation]} is recognised and saved. We do not yet have an exposure baseline for this role, so there is no personal score to show.`
            : profile.occupations.length > 1
              ? "You’ve selected multiple roles. Choose which takes most of your time so we can calculate one baseline."
              : profile.currentWork
                ? "Search the occupation catalogue to match your work. Only roles with an exposure baseline can show a score."
                : "No occupation is saved yet. Search for your role and choose your task mix to calculate an exposure baseline."}{" "}
          Other preferences are optional.
        </PanelHeading>
        <p className="text-[16px] text-muted-foreground mb-6">
          {profile.occupationNames[profile.primaryOccupation] ||
            profile.currentWork ||
            "No occupation selected."}{" "}
          Personal scores remain empty until your baseline is confirmed.
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
    <div className="radar-workspace">
      <section className="meter-workbench">
        <div className="pane-toolbar">
          <span>
            <span className="status-dot" /> YOUR WORK, DECODED
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
        <div className="workbench-body">
          <div className="flex items-center justify-between">
            <p className="eyebrow">01 / THE METER</p>
            <span className="small-tag">TASK EXPOSURE</span>
          </div>
          <h1 className="workbench-title">
            Change starts
            <br />
            at the task level.
          </h1>
          <p className="intro-copy">
            Your job is more than a job title. See where AI meets your work — and where you make the
            difference.
          </p>
          <div className="baseline-context">
            <p>
              {example ||
              !confirmed ||
              (overrideRole &&
                !profile.occupations.some((id) => baselineIdForOccupation(id) === role.id))
                ? "Example radar · illustrative task inputs"
                : `Your confirmed profile${profile.preferredName ? ` · ${profile.preferredName}` : ""} · demo task inputs`}
            </p>
            <Link href="/home">
              Edit profile <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="occupation-field">
            <span className="eyebrow">OCCUPATIONAL ANCHOR</span>
            <p>{role.title}</p>
            <span className="font-mono text-[13px] text-muted-foreground">{role.code}</span>
          </div>
          {!example && confirmed && profile.occupations.length > 1 && (
            <div
              className="answer-chips mt-3"
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
              <p className="field-help">One role at a time; these scores are not blended.</p>
            </div>
          )}
          {!example && confirmed && !profile.taskFocus && (
            <p className="field-help mt-3">
              Occupation baseline: task mix not shared. Showing default routine weights; change the
              mix below to refine.
            </p>
          )}
          <fieldset className="gravity-control">
            <legend className="eyebrow">WHAT FILLS MOST OF YOUR DAY?</legend>
            <div className="segment-control">
              <Button
                variant="ghost"
                aria-pressed={focus === "routine"}
                onClick={() => setOverrideFocus("routine")}
              >
                Routine & transactions
              </Button>
              <Button
                variant="ghost"
                aria-pressed={escalations}
                onClick={() => setOverrideFocus("escalations")}
              >
                Escalations & exceptions
              </Button>
              <Button
                variant="ghost"
                aria-pressed={focus === "mixed"}
                onClick={() => setOverrideFocus("mixed")}
              >
                A bit of both
              </Button>
            </div>
            <p className="field-help mt-3">
              Explore a different task mix here. Reset returns to{" "}
              {example || !confirmed ? "the example" : "your saved profile"}.
            </p>
          </fieldset>
          <div className="exposure-block" aria-live="polite">
            <div className="flex items-end justify-between">
              <div>
                <p className="eyebrow">YOUR TASK EXPOSURE INDEX</p>
                <div className="score-value">
                  {score.toFixed(1)}
                  <span>/ 100</span>
                </div>
              </div>
              <span className="exposure-label">
                {score >= 60 ? "High exposure" : "Moderate exposure"}
                <ArrowUpRight className="size-3.5" />
              </span>
            </div>
            <div className="meter-track">
              <div style={{ width: `${score}%` }} />
            </div>
            <div className="flex justify-between text-[13px] text-muted-foreground">
              <span>Less exposed</span>
              <span>More exposed</span>
            </div>
            <p className="score-note">Task exposure ≠ probability of losing your job.</p>
          </div>
        </div>
        <div className="pane-toolbar task-toolbar">
          <span>TASK BREAKDOWN</span>
          <span>WEIGHT / AI CAPABILITY</span>
        </div>
        <div className="task-list">
          {tasks.map((task, i) => (
            <div className="task-row" key={task.name}>
              <span className="task-number">0{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p>{task.name}</p>
                <span className={`task-kind ${task.moat ? "human" : ""}`}>
                  {task.moat ? "Human advantage" : "Automation exposed"}
                </span>
              </div>
              <div className="task-stats">
                <span>
                  {Math.round(weights[i]! * 100)}%{" "}
                  <span className="text-muted-foreground">
                    / {Math.round(task.exposure * 100)}%
                  </span>
                </span>
                <div className="task-mini-track">
                  <div style={{ width: `${task.exposure * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="formula-note">
          <span className="font-mono">E = 100 × Σ(wᵢ × eᵢ)</span>
          <Link href="/resources">
            See the math <ArrowUpRight className="size-3" />
          </Link>
        </div>
        <RadarFooter />
      </section>
      <aside className="evidence-panel">
        <PanelHeading
          kicker="A CLEARER SIGNAL. A BETTER NEXT STEP."
          title="Your work is changing. You still have agency."
        >
          Understand the shift. Find your human advantage.
          <br className="hidden xl:block" /> Build a future that works for you.
        </PanelHeading>
        <div className="signal-banner">
          <div>
            <p>Your role evolves. Your value doesn’t disappear.</p>
            <span>Start with what makes you hard to replace.</span>
            <Link href="/roadmap">
              Find your next direction <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="signal-orbit" aria-hidden="true">
            <Fingerprint />
          </div>
        </div>
        <div className="panel-section">
          <p className="eyebrow">READING YOUR SIGNAL</p>
          <div className="insight-grid">
            <div className="insight-cell">
              <span className="small-tag">The shift</span>
              <Layers className="insight-icon" strokeWidth={1} />
              <h2>Tasks change before titles.</h2>
              <p>
                Routine answers and coordination are more exposed. Your whole role is a bigger
                picture.
              </p>
            </div>
            <div className="insight-cell">
              <span className="small-tag">Your advantage</span>
              <ShieldCheck className="insight-icon" strokeWidth={1} />
              <h2>Human is a strength.</h2>
              <p>Judgment, trust, and de-escalation are the capabilities to build on.</p>
            </div>
          </div>
        </div>
        <div className="next-steps">
          <p className="eyebrow">FROM AWARENESS TO ACTION</p>
          <Link href="/insights">
            <span>Follow the curve</span>
            <span>See what’s observed. Explore what’s next.</span>
            <ArrowUpRight />
          </Link>
          <Link href="/roadmap">
            <span>Choose a direction</span>
            <span>Three paths from the skills you already have.</span>
            <ArrowUpRight />
          </Link>
          <Link href="/resources">
            <span>Check the evidence</span>
            <span>Open methodology. Visible assumptions.</span>
            <ArrowUpRight />
          </Link>
        </div>
        <div className="context-note">
          <ArrowDownRight className="size-4 shrink-0" />
          <p>
            <strong>A signal, not a sentence.</strong> This prototype models tasks, not individual
            outcomes. Use it to start a conversation about your next move.
          </p>
        </div>
      </aside>
    </div>
  )
}
