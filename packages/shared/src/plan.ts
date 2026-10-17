import { z } from "zod"
import { navigatorContextSchema, pathIdSchema, resourceIdSchema } from "./navigator.ts"
import { occupationCodeSchema } from "./occupations.ts"

const text = (max: number) => z.string().trim().min(1).max(max)
export const calendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`)
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  }, "Enter a valid calendar date")
export const planScheduleSchema = z
  .strictObject({
    startDate: calendarDateSchema,
    timeZone: text(100).refine((zone) => {
      try {
        new Intl.DateTimeFormat("en", { timeZone: zone })
        return true
      } catch {
        return false
      }
    }, "Enter a valid IANA time zone"),
    weeklyMinutes: z.number().int().min(1).max(1200),
    studyDays: z
      .array(z.number().int().min(0).max(6))
      .min(1)
      .max(7)
      .refine((days) => new Set(days).size === days.length),
    sessionLimitMinutes: z.number().int().min(1).max(180),
    dayMinutes: z
      .record(z.string().regex(/^[0-6]$/), z.number().int().min(0).max(1200).multipleOf(30))
      .optional(),
  })
  .refine(
    (schedule) =>
      !schedule.dayMinutes ||
      (Object.keys(schedule.dayMinutes).every((day) => schedule.studyDays.includes(Number(day))) &&
        Object.values(schedule.dayMinutes).reduce((total, minutes) => total + minutes, 0) ===
          schedule.weeklyMinutes),
    "Allocate all weekly minutes across selected study days",
  )
export type PlanScheduleInput = z.infer<typeof planScheduleSchema>
export const planRequestSchema = z
  .strictObject({
    occupationCode: occupationCodeSchema,
    strategyId: pathIdSchema,
    destinationId: text(100).nullable(),
    pace: z.enum(["lean", "intensive"]),
    profile: navigatorContextSchema,
    schedule: planScheduleSchema,
    resourceIds: z.array(resourceIdSchema).max(12).default([]),
  })
  .refine(
    ({ profile, occupationCode }) =>
      profile.primaryOccupation === occupationCode && profile.occupations.includes(occupationCode),
    "Plan occupation must match confirmed profile",
  )
export const learningPhases = [
  { id: "foundation", title: "Foundation" },
  { id: "intermediate", title: "Intermediate" },
  { id: "advanced", title: "Advanced" },
  { id: "leadership", title: "Leadership & ownership" },
] as const
export const learningPhaseIdSchema = z.enum([
  "foundation",
  "intermediate",
  "advanced",
  "leadership",
])
export function planPhaseRanges(horizon: 90 | 120): [number, number][] {
  const ends = [
    Math.floor(horizon / 4),
    Math.floor(horizon / 2),
    Math.floor((3 * horizon) / 4),
    horizon,
  ]
  return ends.map((end, i) => [i ? ends[i - 1]! + 1 : 1, end])
}
export function addCalendarDays(date: string, days: number) {
  const parsed = new Date(`${date}T00:00:00Z`)
  parsed.setUTCDate(parsed.getUTCDate() + days)
  return parsed.toISOString().slice(0, 10)
}
export function weeklyDayMinutes(schedule: PlanScheduleInput) {
  const days = [...schedule.studyDays].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
  if (schedule.dayMinutes)
    return days.map((day) => ({ day, minutes: schedule.dayMinutes![day] ?? 0 }))
  // Preserve saved minute-based schedules; new schedules use half-hour blocks.
  const block =
    schedule.weeklyMinutes % 30 === 0 && schedule.sessionLimitMinutes % 30 === 0 ? 30 : 1
  const blocks = schedule.weeklyMinutes / block
  return days.map((day, index) => ({
    day,
    minutes: (Math.floor(blocks / days.length) + (index < blocks % days.length ? 1 : 0)) * block,
  }))
}
export function buildPlanSchedule(input: PlanScheduleInput, horizon: 90 | 120) {
  const schedule = planScheduleSchema.parse(input)
  const ranges = planPhaseRanges(horizon)
  const allocations = weeklyDayMinutes(schedule)
  const firstMonth = Array.from({ length: 30 }, (_, index) => {
    const day = index + 1
    const localDate = addCalendarDays(schedule.startDate, index)
    const weekday = new Date(`${localDate}T00:00:00Z`).getUTCDay()
    const minutes = allocations.find((slot) => slot.day === weekday)?.minutes ?? 0
    const sessions: number[] = []
    for (let remaining = minutes; remaining > 0; remaining -= schedule.sessionLimitMinutes)
      sessions.push(Math.min(remaining, schedule.sessionLimitMinutes))
    return {
      id: `day-${day}`,
      day,
      localDate,
      phaseId: learningPhases[ranges.findIndex(([, end]) => day <= end)]!.id,
      kind: minutes ? ("task" as const) : ("rest" as const),
      minutes,
      sessions,
    }
  })
  const milestones = ranges.flatMap(([start, end], phase) => {
    const windows = []
    for (let day = Math.max(start, 31); day <= end; day += 7)
      windows.push({
        id: `${learningPhases[phase]!.id}-${day}`,
        phaseId: learningPhases[phase]!.id,
        startDay: day,
        endDay: Math.min(day + 6, end),
        minutes: Array.from({ length: Math.min(day + 6, end) - day + 1 }, (_, offset) => {
          const date = addCalendarDays(schedule.startDate, day + offset - 1)
          return (
            allocations.find(
              (allocation) => allocation.day === new Date(`${date}T00:00:00Z`).getUTCDay(),
            )?.minutes ?? 0
          )
        }).reduce((sum, minutes) => sum + minutes, 0),
      })
    return windows
  })
  return { firstMonth, milestones }
}
const resourcePick = { resourceId: resourceIdSchema.optional() }
export const planDraftSchema = z.object({
  summary: text(500),
  firstStep: text(240),
  phases: z
    .array(
      z.object({
        id: learningPhaseIdSchema,
        actions: z.array(text(220)).min(2).max(5),
        deliverable: text(220),
      }),
    )
    .length(4),
  tasks: z.array(z.object({ id: text(40), task: text(220), ...resourcePick })).max(30),
  milestones: z.array(z.object({ id: text(60), action: text(220), ...resourcePick })).max(20),
  goals: z
    .array(z.object({ id: z.enum(["day-30", "day-60", "day-90"]), outcome: text(220) }))
    .length(3),
})
export const flightPlanSchema = z.object({
  id: text(100),
  profileRevision: text(100),
  revision: z.literal(1),
  contractVersion: z.literal(3),
  occupationCode: occupationCodeSchema,
  strategyId: pathIdSchema,
  destinationId: text(100).nullable(),
  selectedRole: text(120).nullable(),
  mappingVersion: text(80),
  schedule: planScheduleSchema,
  horizonDays: z.union([z.literal(90), z.literal(120)]),
  generatedAt: z.string().datetime(),
  summary: text(500),
  firstStep: text(240),
  phases: z
    .array(
      z.object({
        id: learningPhaseIdSchema,
        title: text(80),
        days: text(40),
        startDay: z.number().int(),
        endDay: z.number().int(),
        focus: text(300),
        actions: z.array(text(220)).min(2).max(5),
        deliverable: text(220),
        flightPlan: z
          .array(z.object({ days: text(40), focus: text(240), module: text(180).optional() }))
          .length(2),
      }),
    )
    .length(4),
  firstMonth: z
    .array(
      z.object({
        id: text(40),
        day: z.number().int().min(1).max(30),
        localDate: calendarDateSchema,
        phaseId: learningPhaseIdSchema,
        kind: z.enum(["task", "rest"]),
        minutes: z.number().int().nonnegative(),
        sessions: z.array(z.number().int().positive()).max(1440),
        task: text(220).nullable(),
        resourceId: resourceIdSchema.optional(),
      }),
    )
    .length(30),
  milestones: z
    .array(
      z.object({
        id: text(60),
        phaseId: learningPhaseIdSchema,
        startDay: z.number().int(),
        endDay: z.number().int(),
        action: text(220),
        minutes: z.number().int().nonnegative(),
        resourceId: resourceIdSchema.optional(),
      }),
    )
    .max(20),
  goals: z
    .array(
      z.object({ day: z.union([z.literal(30), z.literal(60), z.literal(90)]), outcome: text(220) }),
    )
    .length(3),
})
export type FlightPlan = z.infer<typeof flightPlanSchema>
export const generatedPlanSchema = z
  .object({ plan: flightPlanSchema, provider: text(80) })
  .refine(({ plan }) => {
    try {
      validatePlanSchedule(plan)
      return true
    } catch {
      return false
    }
  }, "Plan does not match its confirmed schedule")

/** Validate content against the code-owned schedule, not model-supplied dates or budgets. */
export function validatePlanSchedule(plan: FlightPlan) {
  const expected = buildPlanSchedule(plan.schedule, plan.horizonDays)
  const ranges = planPhaseRanges(plan.horizonDays)
  const seen = new Set<string>()
  for (const entry of [...plan.firstMonth, ...plan.milestones]) {
    if (seen.has(entry.id)) throw new Error("Duplicate plan task ID")
    seen.add(entry.id)
  }
  for (const [i, entry] of plan.firstMonth.entries()) {
    const target = expected.firstMonth[i]!
    for (const field of [
      "id",
      "day",
      "localDate",
      "phaseId",
      "kind",
      "minutes",
      "sessions",
    ] as const)
      if (JSON.stringify(entry[field]) !== JSON.stringify(target[field]))
        throw new Error("Plan schedule differs from confirmed availability")
    if (entry.kind === "rest" && (entry.task !== null || entry.resourceId))
      throw new Error("Rest days cannot contain work")
    if (entry.kind === "task" && !entry.task) throw new Error("Scheduled task is missing")
  }
  if (plan.milestones.length !== expected.milestones.length)
    throw new Error("Milestone coverage is incomplete")
  for (const [i, milestone] of plan.milestones.entries())
    for (const field of ["id", "phaseId", "startDay", "endDay", "minutes"] as const)
      if (milestone[field] !== expected.milestones[i]![field])
        throw new Error("Milestone dates differ from schedule")
  for (const [i, phase] of plan.phases.entries()) {
    const [start, end] = ranges[i]!
    const midpoint = Math.floor((start + end) / 2)
    if (
      phase.id !== learningPhases[i]!.id ||
      phase.startDay !== start ||
      phase.endDay !== end ||
      phase.days !== `Days ${start}–${end}` ||
      phase.flightPlan[0]!.days !== `D${start}–D${midpoint}` ||
      phase.flightPlan[1]!.days !== `D${midpoint + 1}–D${end}`
    )
      throw new Error("Phase dates differ from schedule")
  }
  if (JSON.stringify(plan.goals.map((goal) => goal.day)) !== JSON.stringify([30, 60, 90]))
    throw new Error("Goal dates differ from schedule")
  return plan
}
