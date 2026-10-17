"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, BookOpen, CalendarClock, Check, Flame, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PanelHeading } from "@/components/radar-panel"
import { CommitDirectionDialog } from "@/components/commit-direction-dialog"
import { useCareerProfile } from "@/components/career-profile-provider"
import { MILESTONES } from "@/lib/mock"
import {
  currentPhase,
  dayNames,
  loadCommitment,
  localDate,
  planDays,
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
import { cn } from "@/lib/utils"
import { editorialPage, eyebrow } from "@/lib/styles"

export default function ProgressPage() {
  // undefined = not read yet; null = no commitment saved in this browser.
  const [commitment, setCommitment] = useState<Commitment | null | undefined>(undefined)
  useEffect(() => setCommitment(loadCommitment()), [])
  if (commitment === undefined) return null
  if (!commitment)
    return (
      <div className={editorialPage}>
        <PanelHeading kicker="04 / PROGRESS" title="Show up for your next move.">
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
  const { profile } = useCareerProfile()
  // Weekly hours and short-session needs follow the profile live.
  const commitment = withProfile(saved, profile)
  const today = localDate(new Date())
  const days = planDays(commitment)
  const todayDay = days.find((day) => day.date === today)
  const dayNumber = todayDay?.dayNumber ?? (today < commitment.startDate ? 0 : days.length + 1)
  const phase = currentPhase(commitment, Math.max(1, dayNumber))
  const due = days.filter((day) => day.slot && day.date <= today)
  const doneCount = days.filter((day) => day.done).length
  const slots = commitmentSlots(commitment)
  const todayFocus = commitment.flightPlan?.find((segment) => {
    const [start, end] = segment.days.replace(/D/g, "").split("–").map(Number)
    return dayNumber >= start! && dayNumber <= end!
  })
  function toggle(date: string) {
    const completed = commitment.completed.includes(date)
      ? commitment.completed.filter((item) => item !== date)
      : [...commitment.completed, date]
    const next = { ...commitment, completed }
    saveCommitment(next)
    onChange(next)
  }
  const label = (value: string, options: readonly { value: string; label: string }[]) =>
    options.find((option) => option.value === value)?.label ?? value
  return (
    <div className={editorialPage}>
      <PanelHeading kicker="04 / PROGRESS" title="Show up for your next move.">
        Small, regular sessions add up. Log each one to keep your streak going.
      </PanelHeading>
      <section className="flex flex-wrap items-start justify-between gap-4 rounded-xl border p-5">
        <div>
          <p className={eyebrow}>YOUR COMMITMENT</p>
          <h2 className="mt-1 text-[22px] tracking-[-0.5px]">{commitment.direction}</h2>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {commitment.role ? `${commitment.role} · ` : ""}
            {commitment.sprint ? "Sprint · 90 days" : "Paced · 120 days"} ·{" "}
            {label(commitment.timeOfDay, timeOfDayOptions)} ·{" "}
            {label(commitment.days, studyDayOptions)} · {commitment.hours} a week
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil /> Change schedule
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/roadmap?path=${commitment.pathId}`}>
              Open plan <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <section
        aria-label="Today"
        className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-muted p-5"
      >
        <div className="max-w-[720px]">
          <p className={eyebrow}>
            {dayNumber === 0
              ? "STARTS SOON"
              : dayNumber > days.length
                ? "PLAN COMPLETE"
                : `DAY ${dayNumber} OF ${days.length} · PHASE 0${phase + 1} · ${MILESTONES[phase]!.phase.toUpperCase()}`}
          </p>
          <p className="mt-1.5 text-[16px]">
            {todayDay?.slot
              ? `Today's session: ${todayDay.slot.start}–${slotEnd(todayDay.slot)} (${todayDay.slot.minutes} min).`
              : todayDay
                ? "No session scheduled today. Rest, or log an extra one."
                : dayNumber > days.length
                  ? "You reached the end of your plan. Review what you built and choose what is next."
                  : "Your plan starts soon."}
          </p>
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
        {todayDay && (
          <Button
            variant={todayDay.done ? "outline" : "default"}
            aria-pressed={todayDay.done}
            onClick={() => toggle(today)}
          >
            <Check /> {todayDay.done ? "Logged today · undo" : "Log today's session"}
          </Button>
        )}
      </section>

      <div className="mt-4 grid grid-cols-[auto_1fr] gap-4 max-[900px]:grid-cols-1">
        <section aria-labelledby="activity-title" className="min-w-0 rounded-xl border p-5">
          <h2 id="activity-title" className="text-[18px] tracking-[-0.4px]">
            Learning activity
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Select a past day to log or undo a session.
          </p>
          <Heatmap days={days} today={today} onToggle={toggle} />
          <Legend />
        </section>
        <dl className="grid grid-cols-2 content-start gap-3">
          <Stat label="Weekly commitment" value={`${weeklyHours(commitment.hours)} h`} />
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

      <section aria-labelledby="slots-title" className="mt-6 rounded-xl border p-5">
        <h2 id="slots-title" className="flex items-center gap-2 text-[18px] tracking-[-0.4px]">
          <CalendarClock className="size-5" strokeWidth={1.5} /> Your weekly slots
        </h2>
        <ul className="mt-3 grid grid-cols-2 gap-2 max-[700px]:grid-cols-1">
          {slots.map((slot) => (
            <li
              key={slot.day}
              className="flex justify-between gap-3 rounded-lg bg-muted px-4 py-3 text-[14px]"
            >
              <span className="font-medium">{dayNames[slot.day]}</span>
              <span className="font-mono text-muted-foreground">
                {slot.start}–{slotEnd(slot)} · {slot.minutes} min
              </span>
            </li>
          ))}
        </ul>
      </section>
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
          onSaved={onChange}
        />
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4">
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-[22px] font-medium tracking-[-0.5px]">{value}</dd>
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
          ? "bg-muted-foreground/30"
          : "bg-success/15 ring-1 ring-success/40 ring-inset"
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
              ) : day.date <= today ? (
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
    ["bg-success/15 ring-1 ring-success/40 ring-inset", "Planned"],
    ["bg-muted-foreground/30", "Missed"],
    ["bg-success", "Logged"],
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
