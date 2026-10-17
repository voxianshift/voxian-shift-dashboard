import { phaseRanges, type FlightSegment } from "@/lib/flight-plan"

export type TimeOfDay = "morning" | "night" | "flexible"
export type StudyDays = "weekdays" | "weekends" | "flexible"
export type Slot = { day: number; start: string; minutes: number }

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
  /** Flight plan windows (D1–D15 …) saved when committing, so Progress needs no plan request. */
  flightPlan?: FlightSegment[]
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
export const hourOptions = ["Under 1 hour", "1–3 hours", "3–5 hours", "5+ hours"] as const

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
export function weeklySlots(hours: number, timeOfDay: TimeOfDay, days: StudyDays): Slot[] {
  const total = hours * 60
  const pool = dayPools[days]
  // Weekend sessions can run long; weekday ones stay short enough to fit around work.
  const longest = days === "weekends" ? 180 : 90
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
  done: boolean
}

/** Every day of the plan with its scheduled slot (if any) and completion. */
export function planDays(commitment: Commitment): PlanDay[] {
  const length = commitment.sprint ? 90 : 120
  const slots = weeklySlots(weeklyHours(commitment.hours), commitment.timeOfDay, commitment.days)
  const done = new Set(commitment.completed)
  return Array.from({ length }, (_, i) => {
    const day = addDays(commitment.startDate, i)
    const date = localDate(day)
    return {
      date,
      dayNumber: i + 1,
      weekday: day.getDay(),
      slot: slots.find((slot) => slot.day === day.getDay()),
      done: done.has(date),
    }
  })
}

export function currentPhase(commitment: Commitment, dayNumber: number) {
  const index = phaseRanges(commitment.sprint).findIndex(([, end]) => dayNumber <= end)
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
// ponytail: guest commitment lives in this browser only; move to the account store once sign-in exists.
export function loadCommitment(): Commitment | null {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? "null")
    return value?.version === 1 ? (value as Commitment) : null
  } catch {
    return null
  }
}
export function saveCommitment(commitment: Commitment | null) {
  try {
    if (commitment) localStorage.setItem(storageKey, JSON.stringify(commitment))
    else localStorage.removeItem(storageKey)
  } catch {
    /* Storage blocked; the commitment lasts for this visit only. */
  }
}
