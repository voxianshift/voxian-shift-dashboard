"use client"

import { generatedPlanSchema, navigatorContext } from "@voxian/shared"
import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  CalendarPlus,
  BookOpen,
  CalendarClock,
  Lock,
  Check,
  Flame,
  Pencil,
} from "lucide-react"
import { AttendanceBadge } from "@/components/attendance-badge"
import { Button } from "@/components/ui/button"
import { PanelHeading } from "@/components/radar-panel"
import { CommitDirectionDialog } from "@/components/commit-direction-dialog"
import { PlanSheet } from "@/components/plan-sheet"
import { PlanBoard } from "@/components/plan-board"
import { useCareerProfile } from "@/components/career-profile-provider"
import { MILESTONES } from "@/lib/mock"
import {
  learningPhase,
  commitmentChanged,
  countdown,
  sessionState,
  toggledCommitment,
  attendanceStatus,
  dayNames,
  loadCommitment,
  saveCommitment,
  slotEnd,
  streak,
  studyDayOptions,
  timeOfDayOptions,
  weeklyHours,
  withProfile,
  commitmentSlots,
  type Commitment,
  type PlanDay,
} from "@/lib/commitment"
import { calendarIcs, googleCalendarUrl } from "@/lib/calendar"
import { cn } from "@/lib/utils"
import { editorialPage, eyebrow } from "@/lib/styles"

export default function ProgressPage() {
  const [commitment, setCommitment] = useState<Commitment | null | undefined>(undefined)
  const [error, setError] = useState("")
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    setError("")
    void loadCommitment()
      .then((saved) => {
        if (active) setCommitment(saved)
      })
      .catch(() => {
        if (active) setError("Your saved plan couldn’t load.")
      })
    const reload = () =>
      void loadCommitment().then((saved) => {
        if (active) setCommitment(saved)
      })
    window.addEventListener(commitmentChanged, reload)
    return () => {
      active = false
      window.removeEventListener(commitmentChanged, reload)
    }
  }, [attempt])
  if (error)
    return (
      <div role="alert" className={editorialPage}>
        {error}{" "}
        <Button variant="outline" onClick={() => setAttempt((n) => n + 1)}>
          Retry
        </Button>
      </div>
    )
  if (commitment === undefined)
    return (
      <p role="status" className="p-8 text-muted-foreground">
        Loading your plan…
      </p>
    )
  if (!commitment)
    return (
      <div className={editorialPage}>
        <PanelHeading kicker="04 / THE TRACKER" title="Show up for your next move.">
          Choose a direction in Navigator and pick when you like to learn. Your schedule and
          progress appear here.
        </PanelHeading>
        <Button asChild>
          <Link href="/roadmap">
            Choose a direction <ArrowRight />
          </Link>
        </Button>
      </div>
    )
  return <Progress commitment={commitment} onChange={setCommitment} />
}

function Progress({
  commitment: saved,
  onChange,
}: {
  commitment: Commitment
  onChange: (commitment: Commitment) => void
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [planOpen, setPlanOpen] = useState(false)
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const { profile } = useCareerProfile()
  // Legacy slots follow live preferences; validated plans retain their confirmed schedule until replanned.
  const commitment = withProfile(saved, profile)
  const session = sessionState(commitment, now)
  const { today, days, todayDay, dayNumber, missed, logLocked } = session
  const phase = learningPhase(commitment, today)
  const due = days.filter((day) => day.slot && day.date <= today)
  const doneCount = days.filter((day) => day.slot && day.done).length
  const slots = commitmentSlots(commitment)
  const todayFocus = commitment.flightPlan?.find((segment) => {
    const [start, end] = segment.days.replace(/D/g, "").split("–").map(Number)
    return dayNumber >= start! && dayNumber <= end!
  })
  async function toggle(date: string) {
    const next = toggledCommitment(commitment, date, today)
    if (saving || !next) return
    setSaving(true)
    setSaveError("")
    try {
      await saveCommitment(next)
      onChange(next)
    } catch {
      setSaveError("Session couldn’t be saved. Try logging it again.")
    } finally {
      setSaving(false)
    }
  }
  const label = (value: string, options: readonly { value: string; label: string }[]) =>
    options.find((option) => option.value === value)?.label ?? value
  return (
    <div className="bg-[#050810] text-slate-100 min-h-[calc(100dvh-48px)]">
    <div className={editorialPage}>
      <PanelHeading kicker="04 / THE TRACKER" title="Show up for your next move.">
        Small, regular sessions add up. Log each one to keep your streak going.
      </PanelHeading>
      <section className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-800/80 bg-[#0b1628]/60 p-5">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className={eyebrow}>YOUR COMMITMENT</p>
            <AttendanceBadge
              status={attendanceStatus(
                days.filter((day) => day.slot).map((day) => day.date),
                commitment.completed,
                today,
              )}
            />
          </div>
          <h2 className="mt-1 text-[22px] tracking-[-0.5px]">{commitment.direction}</h2>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {commitment.role ? `${commitment.role} · ` : ""}
            {commitment.sprint ? "Sprint · 90 days" : "Paced · 120 days"} ·{" "}
            {label(commitment.timeOfDay, timeOfDayOptions)} ·{" "}
            {label(commitment.days, studyDayOptions)} · {commitment.hours} a week
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={saving} onClick={() => setEditing(true)}>
            <Pencil /> Change schedule
          </Button>
          <Button variant="outline" disabled={!commitment.plan} onClick={() => setPlanOpen(true)}>
            Open plan <ArrowRight />
          </Button>
        </div>
      </section>

      <section
        aria-label="Today"
        className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-[#0b1628]/60 p-5"
      >
        <div className="max-w-[720px]">
          <p className={eyebrow}>
            {missed.length > 0
              ? `CATCH UP · PHASE 0${phase + 1}`
              : dayNumber === 0
                ? "STARTS SOON"
                : dayNumber > days.length
                  ? "PLAN COMPLETE"
                  : `DAY ${dayNumber} OF ${days.length} · PHASE 0${phase + 1} · ${(commitment.plan?.plan.phases[phase]?.title ?? MILESTONES[Math.min(phase, 2)]!.phase).toUpperCase()}`}
          </p>
          <p className="mt-1.5 text-[16px]">
            {todayDay?.slot
              ? `Today's sessions: ${(todayDay.slots ?? [todayDay.slot]).map((slot) => `${slot.start}–${slotEnd(slot)} (${slot.minutes} min)`).join(", ")}.`
              : todayDay
                ? "No session scheduled today."
                : dayNumber > days.length
                  ? "You reached the end of your plan. Review what you built and choose what is next."
                  : "Your plan starts soon."}
          </p>
          {session.next && (
            <p className="mt-1.5 font-mono text-[14px]" aria-live="off">
              Next session in {countdown(session.next.start.getTime() - now.getTime())}
            </p>
          )}
          {todayDay && todayFocus && (
            <p className="mt-1.5 text-[14px] text-muted-foreground">
              Focus ({todayFocus.days}): {todayFocus.focus}
              {todayFocus.module && (
                <>
                  {" "}
                  <BookOpen className="inline size-3.5" /> {todayFocus.module}
                </>
              )}
            </p>
          )}
        </div>
        <Button
          variant={todayDay?.done ? "outline" : "default"}
          aria-pressed={!!todayDay?.done}
          disabled={saving || !session.canLog}
          title={logLocked ? "Unlocks 30 minutes before your session" : undefined}
          onClick={() => toggle(today)}
        >
          {logLocked || !todayDay?.slot ? <Lock /> : <Check />}{" "}
          {saving ? "Saving…" : session.logLabel}
        </Button>
      </section>

      {missed.length > 0 && (
        <section
          aria-label="Missed learning"
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4"
        >
          <div>
            <AttendanceBadge status="Missed" />
            <p className="mt-2 text-sm">
              {missed.length} learning day{missed.length === 1 ? "" : "s"} to catch up. Attend
              missed sessions to advance your phase.
            </p>
          </div>
          <Button variant="outline" disabled={saving} onClick={() => toggle(missed[0]!.date)}>
            <Check /> Mark {missed[0]!.date} attended
          </Button>
        </section>
      )}
      {saveError && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {saveError}
        </p>
      )}
      <Suspense>
        <PlanBoard
          commitment={commitment}
          today={today}
          saving={saving}
          logLocked={logLocked}
          onToggle={toggle}
        />
      </Suspense>

      <div className="mt-4 grid grid-cols-[auto_1fr] gap-4 max-[900px]:grid-cols-1">
        <section aria-labelledby="activity-title" className="min-w-0 rounded-2xl border border-slate-800/80 bg-[#0b1628]/60 p-5">
          <h2 id="activity-title" className="text-[18px] tracking-[-0.4px]">
            Learning activity
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Select a scheduled day to mark attendance or undo it.
          </p>
          <fieldset disabled={saving}>
            <Heatmap days={days} today={today} onToggle={toggle} />
          </fieldset>
          <Legend />
        </section>
        <dl className="grid grid-cols-2 content-start gap-3">
          <Stat
            label="Weekly commitment"
            value={`${commitment.plan?.plan.schedule ? commitment.plan.plan.schedule.weeklyMinutes / 60 : weeklyHours(commitment.hours)} h`}
          />
          <Stat label="Sessions logged" value={`${doneCount} / ${due.length} due`} />
          <Stat
            label="Current streak"
            value={
              <span className="inline-flex items-center gap-1.5">
                <Flame className="size-5 text-warning" /> {streak(days, today)}
              </span>
            }
          />
          <Stat
            label="On schedule"
            value={`${due.length ? Math.round((due.filter((day) => day.done).length / due.length) * 100) : 0}%`}
          />
        </dl>
      </div>

      <section aria-labelledby="slots-title" className="mt-6 rounded-2xl border border-slate-800/80 bg-[#0b1628]/60 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2
            id="slots-title"
            className="mr-auto flex items-center gap-2 text-[18px] tracking-[-0.4px]"
          >
            <CalendarClock className="size-5" strokeWidth={1.5} /> Your weekly slots
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const url = URL.createObjectURL(
                new Blob([calendarIcs(commitment)], { type: "text/calendar" }),
              )
              Object.assign(document.createElement("a"), {
                href: url,
                download: "voxian-learning-plan.ics",
              }).click()
              URL.revokeObjectURL(url)
            }}
          >
            <CalendarPlus /> Apple, Outlook or phone calendar
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={googleCalendarUrl(commitment)} target="_blank" rel="noreferrer">
              <CalendarPlus /> Google Calendar <ArrowUpRight />
            </a>
          </Button>
        </div>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Repeating reminders until your plan ends, with an alert 15 minutes before each session.
          The calendar file opens in Apple Calendar, Outlook and most phone calendars.
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-2 max-[700px]:grid-cols-1">
          {slots.map((slot) => (
            <li
              key={`${slot.day}-${slot.start}`}
              className="flex justify-between gap-3 rounded-xl border border-slate-800/60 bg-slate-900/60 px-4 py-3 text-[14px]"
            >
              <span className="font-medium">{dayNames[slot.day]}</span>
              <span className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                <span className="font-mono text-muted-foreground">
                  {slot.start}–{slotEnd(slot)} · {slot.minutes} min
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
      <PlanSheet
        open={planOpen}
        onOpenChange={setPlanOpen}
        commitment={commitment}
        onCommitmentChange={onChange}
      />
      {editing && (
        <CommitDirectionDialog
          open={editing}
          onOpenChange={setEditing}
          pathId={commitment.pathId}
          direction={commitment.direction}
          role={commitment.role}
          sprint={commitment.sprint}
          profile={profile}
          initial={commitment}
          generate={
            commitment.plan?.plan.contractVersion === 3
              ? async (schedule) => {
                  const saved = commitment.plan!.plan
                  const response = await fetch("/api/plan", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    signal: AbortSignal.timeout(65_000),
                    body: JSON.stringify({
                      occupationCode: saved.occupationCode,
                      strategyId: saved.strategyId,
                      destinationId: saved.destinationId ?? null,
                      pace: commitment.sprint ? "intensive" : "lean",
                      profile: navigatorContext(profile),
                      schedule,
                    }),
                  })
                  const result = await response.json()
                  if (!response.ok)
                    throw new Error(result.error || "Your updated plan could not be generated.")
                  return generatedPlanSchema.parse(result)
                }
              : undefined
          }
          onSaved={onChange}
        />
      )}
    </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-[#0b1628]/60 p-4">
      <dt className="text-[13px] text-slate-400">{label}</dt>
      <dd className="mt-1 text-[22px] font-medium tracking-[-0.5px] text-slate-100">{value}</dd>
    </div>
  )
}

const cellBase = "size-[14px] rounded-[3px]"
function cellClass(day: PlanDay, today: string) {
  return cn(
    cellBase,
    day.done
      ? "bg-success"
      : day.slot
        ? day.date < today
          ? "bg-red-500/60"
          : "bg-sky-500/20 ring-1 ring-sky-500/50 ring-inset"
        : "bg-muted",
    day.date === today && "outline-2 outline-offset-1 outline-foreground",
  )
}

/** GitHub-style grid: one column per week, Monday at the top. */
function Heatmap({
  days,
  today,
  onToggle,
}: {
  days: PlanDay[]
  today: string
  onToggle: (date: string) => void
}) {
  const leading = (days[0]!.weekday + 6) % 7
  const cells: (PlanDay | null)[] = [...Array<null>(leading).fill(null), ...days]
  const weeks = Array.from({ length: Math.ceil(cells.length / 7) }, (_, i) =>
    cells.slice(i * 7, i * 7 + 7),
  )
  const describe = (day: PlanDay) =>
    `Day ${day.dayNumber}, ${day.date}: ${day.done ? "session logged" : day.slot ? `${day.slot.start} session ${day.date < today ? "missed" : day.date === today ? "today" : "planned"}` : "no session planned"}`
  return (
    <div className="mt-4 overflow-x-auto pb-1">
      <div className="flex gap-[3px]">
        <div className="mr-1 grid grid-rows-7 gap-[3px] text-[10px] leading-[14px] text-muted-foreground">
          {["Mon", "", "Wed", "", "Fri", "", "Sun"].map((name, i) => (
            <span key={i} aria-hidden="true">
              {name}
            </span>
          ))}
        </div>
        {weeks.map((week, w) => (
          <div key={w} className="grid grid-rows-7 gap-[3px]">
            {week.map((day, d) =>
              !day ? (
                <span key={d} className={cellBase} aria-hidden="true" />
              ) : day.slot && day.date <= today ? (
                <button
                  key={day.date}
                  type="button"
                  aria-label={describe(day)}
                  aria-pressed={day.done}
                  title={describe(day)}
                  onClick={() => onToggle(day.date)}
                  className={cn(cellClass(day, today), "hover:ring-2 hover:ring-ring")}
                />
              ) : (
                <span
                  key={day.date}
                  role="img"
                  aria-label={describe(day)}
                  title={describe(day)}
                  className={cellClass(day, today)}
                />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Legend() {
  const items = [
    ["bg-muted", "No session"],
    ["bg-sky-500/20 ring-1 ring-sky-500/50 ring-inset", "On track"],
    ["bg-red-500/60", "Missed"],
    ["bg-success", "Attended"],
  ]
  return (
    <ul className="mt-3 flex flex-wrap gap-4 text-[12px] text-muted-foreground">
      {items.map(([style, name]) => (
        <li key={name} className="flex items-center gap-1.5">
          <span className={cn(cellBase, style)} aria-hidden="true" /> {name}
        </li>
      ))}
    </ul>
  )
}
