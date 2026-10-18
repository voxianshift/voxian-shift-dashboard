import {
  commitmentSchema,
  pathCourseIds,
  weeklyDayMinutes,
  type FlightPlan,
  type ResourceId,
} from "@voxian/shared"
import { guestRequest } from "@/lib/guest-data"
import { type FlightSegment } from "@/lib/flight-plan"

export type TimeOfDay = "morning" | "night" | "flexible"
export type StudyDays = "weekdays" | "weekends" | "flexible"
export type Slot = { day: number; start: string; minutes: number }

export type Plan = {
  schedule?: FlightPlan["schedule"]
  firstMonth?: FlightPlan["firstMonth"]
  milestones?: FlightPlan["milestones"]
  goals?: FlightPlan["goals"]
  profileRevision?: string
  contractVersion?: 3
  occupationCode?: string
  strategyId?: FlightPlan["strategyId"]
  destinationId?: string | null
  summary: string
  phases: {
    id?: string
    startDay?: number
    endDay?: number
    title: string
    days: string
    focus: string
    actions: string[]
    deliverable: string
    flightPlan: FlightSegment[]
  }[]
  firstStep: string
}
export type GeneratedPlan = { plan: Plan; provider: string }

export type Commitment = {
  version: 1
  pathId: string
  direction: string
  role: string | null
  sprint: boolean
  hours: string
  timeOfDay: TimeOfDay
  dayStartTimes?: Partial<Record<number, string>>
  days: StudyDays
  /** Local calendar date (YYYY-MM-DD) of day 1. */
  startDate: string
  /** Local dates with a completed session. */
  completed: string[]
  /** From the profile's "Short sessions only"; keeps each session to 45 minutes or less. */
  shortSessions?: boolean
  /** Flight plan windows (D1–D15 …) saved when committing, so Progress needs no plan request. */
  flightPlan?: FlightSegment[]
  /** The AI plan generated when committing; the Plan view shows it again on return. */
  plan?: GeneratedPlan
}

export const timeOfDayOptions = [
  { value: "morning", label: "Morning person", hint: "Early slots before work" },
  { value: "night", label: "Night owl learner", hint: "Late evening slots" },
  { value: "flexible", label: "Flexible hours", hint: "Choose a time for each day" },
] as const
export const studyDayOptions = [
  { value: "weekdays", label: "Weekdays", hint: "Shorter sessions, Monday to Friday" },
  { value: "weekends", label: "Weekends", hint: "Longer sessions on Saturday and Sunday" },
  { value: "flexible", label: "Flexible", hint: "Spread across the whole week" },
] as const

export const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

/** Weekly study hours from the profile answer; "It varies" or blank gets a modest default. */
export function weeklyHours(answer: string) {
  return { "Under 1 hour": 1, "1–3 hours": 2, "3–5 hours": 4, "5+ hours": 6 }[answer] ?? 3
}

// Day order spreads sessions out before doubling up neighbours.
const dayPools: Record<StudyDays, number[]> = {
  weekdays: [1, 3, 5, 2, 4],
  weekends: [6, 0],
  flexible: [1, 3, 6, 5, 2, 0, 4],
}
const starts: Record<TimeOfDay, { weekday: string; weekend: string }> = {
  morning: { weekday: "06:30", weekend: "08:00" },
  night: { weekday: "21:00", weekend: "20:00" },
  flexible: { weekday: "12:30", weekend: "10:00" },
}

/** Weekly slots that add up to the committed hours, placed in the learner's preferred times. */
export function weeklySlots(
  hours: number,
  timeOfDay: TimeOfDay,
  days: StudyDays,
  shortSessions = false,
): Slot[] {
  const total = hours * 60
  const pool = dayPools[days]
  // Weekend sessions can run long; weekday ones stay short enough to fit around work.
  // Short sessions win when the week has room; many hours on few days still means longer ones.
  const longest = shortSessions ? 45 : days === "weekends" ? 180 : 90
  const count = Math.min(pool.length, Math.max(1, Math.ceil(total / longest)))
  const minutes = Math.ceil(total / count / 15) * 15
  return pool
    .slice(0, count)
    .sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
    .map((day) => ({
      day,
      start: starts[timeOfDay][day === 0 || day === 6 ? "weekend" : "weekday"],
      minutes,
    }))
}

export function commitmentSlots(commitment: Commitment) {
  const schedule = commitment.plan?.plan.schedule
  if (schedule)
    return weeklyDayMinutes(schedule).flatMap(({ day, minutes }) => {
      const result: Slot[] = []
      const start =
        (commitment.timeOfDay === "flexible" && commitment.dayStartTimes?.[day]) ||
        starts[commitment.timeOfDay][day === 0 || day === 6 ? "weekend" : "weekday"]
      const [hour, minute] = start.split(":").map(Number) as [number, number]
      let offset = 0
      for (let remaining = minutes; remaining > 0; remaining -= schedule.sessionLimitMinutes) {
        const length = Math.min(remaining, schedule.sessionLimitMinutes)
        const clock = hour * 60 + minute + offset
        result.push({
          day,
          start: `${String(Math.floor(clock / 60) % 24).padStart(2, "0")}:${String(clock % 60).padStart(2, "0")}`,
          minutes: length,
        })
        offset += length
      }
      return result
    })
  return weeklySlots(
    weeklyHours(commitment.hours),
    commitment.timeOfDay,
    commitment.days,
    commitment.shortSessions,
  ).map((slot) => ({
    ...slot,
    start:
      (commitment.timeOfDay === "flexible" && commitment.dayStartTimes?.[slot.day]) || slot.start,
  }))
}

type SchedulePrefs = { hours: string; flexibility: string }
/** The profile already holds weekly hours and constraints; those answers stay the source of truth. */
export function withProfile(commitment: Commitment, profile: SchedulePrefs): Commitment {
  return {
    ...commitment,
    hours: profile.hours || commitment.hours,
    shortSessions: profile.flexibility
      ? profile.flexibility.includes("Short sessions only")
      : commitment.shortSessions,
  }
}
export function defaultStudyDays(flexibility: string): StudyDays {
  return flexibility.includes("Learning on weekends") ? "weekends" : "flexible"
}

/** Day 1 of the plan, from the profile's "When would you like to make progress?" answer. */
export function planStartDate(timeline: string, today = new Date()) {
  const y = today.getFullYear()
  const m = today.getMonth()
  const d = today.getDate()
  if (timeline === "This month") return localDate(today)
  // Six months out: a calm start on the first of next month.
  if (timeline === "Next 6 months") return localDate(new Date(y, m + 1, 1))
  // Next 3 months, no deadline, or unknown: start the coming Monday (today if it is Monday).
  return localDate(new Date(y, m, d + ((8 - today.getDay()) % 7)))
}

/** Sprint (90 days) fits a goal within three months; anything longer gets the paced 120 days. */
export function timelineSprint(timeline: string) {
  if (timeline === "This month" || timeline === "Next 3 months") return true
  if (timeline === "Next 6 months" || timeline === "No deadline") return false
  return null
}

export function slotEnd(slot: Slot) {
  const [h, m] = slot.start.split(":").map(Number) as [number, number]
  const end = h * 60 + m + slot.minutes
  return `${String(Math.floor(end / 60) % 24).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`
}

export function localDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
function addDays(date: string, days: number) {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number]
  return new Date(y, m - 1, d + days)
}

export type PlanDay = {
  date: string
  dayNumber: number
  weekday: number
  slot?: Slot
  slots?: Slot[]
  done: boolean
}

/** Every day of the plan with its scheduled slot (if any) and completion. */
export function planDays(commitment: Commitment): PlanDay[] {
  const length = commitment.sprint ? 90 : 120
  const slots = commitmentSlots(commitment)
  const done = new Set(commitment.completed)
  return Array.from({ length }, (_, i) => {
    const day = addDays(commitment.startDate, i)
    const date = localDate(day)
    return {
      date,
      dayNumber: i + 1,
      weekday: day.getDay(),
      slot: slots.find((slot) => slot.day === day.getDay()),
      slots: slots.filter((slot) => slot.day === day.getDay()),
      done: done.has(date),
    }
  })
}

export function currentPhase(commitment: Commitment, dayNumber: number) {
  const phases = commitment.plan?.plan.phases
  if (commitment.plan?.plan.contractVersion === 3 && phases) {
    const index = phases.findIndex((phase) => dayNumber <= (phase.endDay ?? Infinity))
    return index === -1 ? phases.length - 1 : index
  }
  // Legacy commitments retain their original three-phase boundaries until migration (#11).
  const ends = commitment.sprint ? [20, 55, 90] : [30, 75, 120]
  const index = ends.findIndex((end) => dayNumber <= end)
  return index === -1 ? 2 : index
}

/** Consecutive scheduled sessions completed, counting back from the most recent one due. */
export function streak(days: PlanDay[], today: string) {
  let count = 0
  for (const day of days.filter((d) => d.slot && d.date <= today).reverse()) {
    // Today's session still counts as pending, not missed.
    if (!day.done && day.date === today) continue
    if (!day.done) break
    count++
  }
  return count
}

const storageKey = "voxian-commitment-v1"
export const commitmentChanged = "voxian:commitment-changed"
export async function loadCommitment(): Promise<Commitment | null> {
  const result = await guestRequest("commitment")
  if (result.commitment !== null) return commitmentSchema.parse(result.commitment)
  let legacy: Commitment | null = null
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? "null")
    const parsed = commitmentSchema.safeParse(value)
    if (parsed.success) legacy = parsed.data
  } catch {
    /* Browser cache is optional. */
  }
  if (legacy) await saveCommitment(legacy)
  return legacy
}
export async function saveCommitment(commitment: Commitment | null) {
  const parsed = commitmentSchema.nullable().parse(commitment)
  await guestRequest("commitment", "PUT", parsed)
  // The sidebar tracker and Progress each hold a copy; tell them to reload.
  globalThis.window?.dispatchEvent(new Event(commitmentChanged))
  try {
    localStorage.removeItem(storageKey)
  } catch {
    /* Legacy cache only. */
  }
}

export function planToday(commitment: Commitment, now = new Date()) {
  const timeZone = commitment.plan?.plan.schedule?.timeZone
  return timeZone
    ? new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(now)
    : localDate(now)
}

export function attendanceStatus(dates: string[], completed: string[], today: string) {
  const attended = new Set(completed)
  if (dates.length && dates.every((date) => attended.has(date))) return "Attended"
  return dates.some((date) => date < today && !attended.has(date)) ? "Missed" : "On track"
}

/** Overdue learning stays in its phase until attendance is recorded. */
export function learningPhase(commitment: Commitment, today: string) {
  const days = planDays(commitment)
  const pending = days.find((day) => day.slot && !day.done && day.date <= today)
  const current = days.find((day) => day.date === today)
  return currentPhase(
    commitment,
    pending?.dayNumber ?? current?.dayNumber ?? (today < commitment.startDate ? 1 : days.length),
  )
}

export type BoardStatus = "inProgress" | "missed" | "upcoming" | "past"
export type BoardItem = {
  id: string
  phase: number
  title: string
  doneWhen?: string
  resourceId?: ResourceId
  /** True when the AI picked no resource and the card shows the phase's usual one instead. */
  suggested: boolean
  /** Scheduled session dates inside this task or milestone window. */
  dates: string[]
  status: BoardStatus
}
export type BoardPhase = {
  index: number
  title: string
  days: string
  deliverable: string
  status: Exclude<BoardStatus, "missed">
  done: number
  total: number
  resources: ResourceId[]
}

/** Phases plus first-month tasks and later milestones, each with a status for today. */
export function planBoard(commitment: Commitment, today: string) {
  const plan = commitment.plan?.plan
  const days = planDays(commitment)
  const byNumber = new Map(days.map((day) => [day.dayNumber, day]))
  const done = new Set(commitment.completed)
  const ends = plan?.phases.every((phase) => phase.endDay)
    ? plan.phases.map((phase) => phase.endDay!)
    : commitment.sprint
      ? [20, 55, 90]
      : [30, 75, 120]
  const phaseOf = (day: number) => {
    const index = ends.findIndex((end) => day <= end)
    return index === -1 ? ends.length - 1 : index
  }
  const window = (start: number, end: number) =>
    days.filter((day) => day.dayNumber >= start && day.dayNumber <= end)
  const raw = [
    ...(plan?.firstMonth ?? [])
      .filter((day) => day.kind === "task" && day.task)
      .map((day) => ({ ...day, title: day.task!, startDay: day.day, endDay: day.day })),
    ...(plan?.milestones ?? [])
      .filter((milestone) => milestone.minutes > 0)
      .map((milestone) => ({ ...milestone, title: milestone.action })),
  ]
  const usual = (picks: (ResourceId | undefined)[]) => {
    const counts = new Map<ResourceId, number>()
    for (const id of picks) if (id) counts.set(id, (counts.get(id) ?? 0) + 1)
    return [...counts].sort((a, b) => b[1] - a[1]).map(([id]) => id)
  }
  const fallback =
    usual(raw.map((item) => item.resourceId))[0] ??
    (plan?.strategyId ? pathCourseIds[plan.strategyId][0] : undefined)
  const items: BoardItem[] = raw.flatMap((item) => {
    const dates = window(item.startDay, item.endDay)
      .filter((day) => day.slot)
      .map((day) => day.date)
    if (!dates.length) return []
    const phase = phaseOf(item.startDay)
    const resourceId =
      item.resourceId ??
      usual(raw.filter((other) => phaseOf(other.startDay) === phase).map((o) => o.resourceId))[0] ??
      fallback
    const end = byNumber.get(item.endDay)?.date ?? dates.at(-1)!
    const status: BoardStatus = dates.every((date) => done.has(date))
      ? "past"
      : end < today
        ? "missed"
        : (byNumber.get(item.startDay)?.date ?? dates[0]!) <= today
          ? "inProgress"
          : "upcoming"
    return [
      {
        id: item.id,
        phase,
        title: item.title,
        doneWhen: item.doneWhen,
        resourceId,
        suggested: !item.resourceId && !!resourceId,
        dates,
        status,
      },
    ]
  })
  const todayNumber = days.find((day) => day.date === today)?.dayNumber
  const current = todayNumber ?? (today < commitment.startDate ? 0 : Number.POSITIVE_INFINITY)
  const phases: BoardPhase[] = (plan?.phases ?? []).map((phase, index) => {
    const start = index ? ends[index - 1]! + 1 : 1
    const sessions = window(start, ends[index] ?? start).filter((day) => day.slot)
    return {
      index,
      title: phase.title,
      days: phase.days,
      deliverable: phase.deliverable,
      status: current > (ends[index] ?? 0) ? "past" : current >= start ? "inProgress" : "upcoming",
      done: sessions.filter((day) => done.has(day.date)).length,
      total: sessions.length,
      resources: usual(items.filter((item) => item.phase === index).map((i) => i.resourceId)).slice(
        0,
        2,
      ),
    }
  })
  return { phases, items }
}

export function countdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(total / 86400)
  const hms = [Math.floor(total / 3600) % 24, Math.floor(total / 60) % 60, total % 60]
    .map((n) => String(n).padStart(2, "0"))
    .join(":")
  return d ? `${d}d ${hms}` : hms
}

const shortDay = (date: string) =>
  new Date(`${date}T00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  })

/** Today's log button, the next session and the current one; shared by Progress and the sidebar. */
export function sessionState(commitment: Commitment, now = new Date()) {
  const today = planToday(commitment, now)
  const days = planDays(commitment)
  const todayDay = days.find((day) => day.date === today)
  const dayNumber = todayDay?.dayNumber ?? (today < commitment.startDate ? 0 : days.length + 1)
  // ponytail: slot times read as browser-local wall time; convert via plan timeZone if users travel.
  const at = (date: string, start: string) => new Date(`${date}T${start}:00`)
  const sessions = days.flatMap((day) =>
    (day.slots ?? []).map((slot) => {
      const start = at(day.date, slot.start)
      return { day, slot, start, end: new Date(start.getTime() + slot.minutes * 60_000) }
    }),
  )
  const next = sessions.find((session) => !session.day.done && session.start > now)
  const current = sessions.find((session) => session.start <= now && now < session.end)
  const todayStart = todayDay?.slot && at(today, (todayDay.slots ?? [todayDay.slot])[0]!.start)
  const logLocked =
    !!todayStart && !todayDay?.done && now.getTime() < todayStart.getTime() - 30 * 60_000
  const logLabel =
    dayNumber === 0
      ? `Starts ${shortDay(commitment.startDate)}`
      : dayNumber > days.length
        ? "Plan complete"
        : !todayDay?.slot
          ? "Rest day today"
          : todayDay.done
            ? "Logged today · undo"
            : logLocked
              ? "Unlocks 30 min before session"
              : "Log today's session"
  return {
    today,
    days,
    todayDay,
    dayNumber,
    next: next && {
      ...next,
      label: `${shortDay(next.day.date)} · ${next.slot.start}–${slotEnd(next.slot)}`,
    },
    current,
    logLocked,
    logLabel,
    canLog: !!todayDay?.slot && !logLocked,
    missed: days.filter((day) => day.slot && !day.done && day.date < today),
  }
}

/** Toggle attendance for a scheduled, non-future day; null when that day can't be logged. */
export function toggledCommitment(commitment: Commitment, date: string, today: string) {
  if (date > today || !planDays(commitment).some((day) => day.date === date && day.slot))
    return null
  const completed = commitment.completed.includes(date)
    ? commitment.completed.filter((item) => item !== date)
    : [...commitment.completed, date]
  return { ...commitment, completed }
}
