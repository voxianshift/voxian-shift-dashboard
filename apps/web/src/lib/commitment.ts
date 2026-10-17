import { commitmentSchema, weeklyDayMinutes, type FlightPlan } from "@voxian/shared"
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
  { value: "flexible", label: "Flexible hours", hint: "Lunch or early evening" },
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
      const start = starts[commitment.timeOfDay][day === 0 || day === 6 ? "weekend" : "weekday"]
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
  )
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
  try {
    localStorage.removeItem(storageKey)
  } catch {
    /* Legacy cache only. */
  }
}
