import { buildPlanSchedule } from "@voxian/shared"
import { expect, test } from "vite-plus/test"
import {
  commitmentSlots,
  currentPhase,
  defaultStudyDays,
  planStartDate,
  timelineSprint,
  planBoard,
  planDays,
  sessionState,
  toggledCommitment,
  slotEnd,
  streak,
  weeklyHours,
  weeklySlots,
  withProfile,
  type Commitment,
} from "./commitment"

const total = (slots: { minutes: number }[]) => slots.reduce((sum, slot) => sum + slot.minutes, 0)

test("slots cover the committed hours in the chosen time of day and days", () => {
  const morning = weeklySlots(4, "morning", "weekdays")
  expect(morning.every((slot) => slot.day >= 1 && slot.day <= 5)).toBe(true)
  expect(morning.every((slot) => slot.start === "06:30")).toBe(true)
  expect(total(morning)).toBeGreaterThanOrEqual(240)
  const weekend = weeklySlots(6, "night", "weekends")
  expect(weekend.map((slot) => slot.day)).toEqual([6, 0])
  expect(weekend.every((slot) => slot.start === "20:00" && slot.minutes === 180)).toBe(true)
  const flexible = weeklySlots(2, "flexible", "flexible")
  expect(flexible.map((slot) => [slot.day, slot.start])).toEqual([
    [1, "12:30"],
    [3, "12:30"],
  ])
  expect(slotEnd({ day: 1, start: "21:00", minutes: 90 })).toBe("22:30")
})

test("profile hour answers map to weekly hours", () => {
  expect(weeklyHours("Under 1 hour")).toBe(1)
  expect(weeklyHours("5+ hours")).toBe(6)
  expect(weeklyHours("It varies")).toBe(3)
})

const commitment: Commitment = {
  version: 1,
  pathId: "quality",
  direction: "Quality",
  role: null,
  sprint: true,
  hours: "1–3 hours",
  timeOfDay: "morning",
  days: "weekdays",
  startDate: "2026-10-19", // a Monday
  completed: ["2026-10-19", "2026-10-21"],
}

test("plan days place sessions on the scheduled weekdays and track completion", () => {
  const days = planDays(commitment)
  expect(days).toHaveLength(90)
  expect(days[0]).toMatchObject({ date: "2026-10-19", weekday: 1, done: true })
  expect(days.filter((day) => day.slot).length).toBeGreaterThan(20)
  expect(days[5]!.slot).toBeUndefined() // Saturday
  expect(currentPhase(commitment, 21)).toBe(1)
  expect(currentPhase(commitment, 90)).toBe(2)
})

test("streak counts back from the last due session and ignores today's pending one", () => {
  const days = planDays(commitment)
  expect(streak(days, "2026-10-21")).toBe(2)
  // Today (Wed) not done yet does not break the streak.
  expect(streak(planDays({ ...commitment, completed: ["2026-10-19"] }), "2026-10-21")).toBe(1)
  // A missed Wednesday breaks it by Friday.
  expect(streak(planDays({ ...commitment, completed: ["2026-10-19"] }), "2026-10-23")).toBe(0)
})

test("weekly hours and short-session needs come from the live profile", () => {
  const live = withProfile(commitment, {
    hours: "5+ hours",
    flexibility: "Short sessions only",
  })
  expect(live.hours).toBe("5+ hours")
  const slots = commitmentSlots(live)
  expect(slots.every((slot) => slot.minutes <= 75)).toBe(true)
  expect(total(slots)).toBeGreaterThanOrEqual(360)
  // An empty profile answer keeps the saved snapshot.
  expect(withProfile(commitment, { hours: "", flexibility: "" }).hours).toBe("1–3 hours")
  expect(defaultStudyDays("Learning on weekends")).toBe("weekends")
  expect(defaultStudyDays("")).toBe("flexible")
})

test("the profile timeline sets the start date and pace", () => {
  const saturday = new Date(2026, 9, 17)
  expect(planStartDate("This month", saturday)).toBe("2026-10-17")
  expect(planStartDate("Next 3 months", saturday)).toBe("2026-10-19")
  expect(planStartDate("No deadline", new Date(2026, 9, 19))).toBe("2026-10-19")
  expect(planStartDate("Next 6 months", saturday)).toBe("2026-11-01")
  expect(timelineSprint("Next 3 months")).toBe(true)
  expect(timelineSprint("Next 6 months")).toBe(false)
  expect(timelineSprint("")).toBeNull()
})

test("validated schedules keep exact budgets, split short sessions and preserve four phase boundaries", () => {
  const planned: Commitment = {
    ...commitment,
    plan: {
      provider: "Test",
      plan: {
        summary: "Plan",
        firstStep: "Start",
        contractVersion: 3,
        schedule: {
          startDate: commitment.startDate,
          timeZone: "Asia/Kuala_Lumpur",
          weeklyMinutes: 301,
          studyDays: [1, 3, 5],
          sessionLimitMinutes: 45,
        },
        phases: [22, 45, 67, 90].map((endDay, index) => ({
          title: `Phase ${index + 1}`,
          days: "",
          endDay,
          focus: "",
          actions: [],
          deliverable: "",
          flightPlan: [],
        })),
      },
    },
  }
  const slots = commitmentSlots(planned)
  expect(total(slots)).toBe(301)
  expect(slots.every((slot) => slot.minutes <= 45)).toBe(true)
  expect(new Set(slots.map((slot) => `${slot.day}-${slot.start}`)).size).toBe(slots.length)
  expect(currentPhase(planned, 22)).toBe(0)
  expect(currentPhase(planned, 23)).toBe(1)
  expect(currentPhase(planned, 90)).toBe(3)
  expect(total(commitmentSlots(withProfile(planned, { hours: "5+ hours", flexibility: "" })))).toBe(
    301,
  )
})

test("flexible daily start times survive validation and apply to every session", async () => {
  const { commitmentSchema } = await import("@voxian/shared")
  const flexible: Commitment = {
    ...commitment,
    timeOfDay: "flexible",
    dayStartTimes: { 1: "18:00", 3: "07:30", 5: "16:00" },
    plan: {
      provider: "Test",
      plan: {
        summary: "Plan",
        firstStep: "Start",
        phases: [
          {
            title: "Learn",
            days: "1–90",
            focus: "Practice",
            actions: [],
            deliverable: "Work",
            flightPlan: [],
          },
        ],
        schedule: {
          startDate: commitment.startDate,
          timeZone: "Asia/Kuala_Lumpur",
          weeklyMinutes: 360,
          studyDays: [1, 3, 5],
          sessionLimitMinutes: 90,
        },
      },
    },
  }
  expect(commitmentSchema.parse(flexible).dayStartTimes).toEqual(flexible.dayStartTimes)
  const slots = commitmentSlots(flexible)
  expect(slots.filter((slot) => slot.day === 1).map((slot) => slot.start)).toEqual([
    "18:00",
    "19:30",
  ])
  expect(slots.find((slot) => slot.day === 3)?.start).toBe("07:30")
  expect(commitmentSlots({ ...flexible, timeOfDay: "morning" })[0]?.start).toBe("06:30")
  for (const dayStartTimes of [{ 7: "10:00" }, { 1: "24:00" }, { 1: "bad" }])
    expect(commitmentSchema.safeParse({ ...flexible, dayStartTimes }).success).toBe(false)
  const { calendarIcs } = await import("./calendar")
  expect(calendarIcs(flexible)).toContain("DTSTART:20261019T180000")
  expect(calendarIcs(flexible)).toContain("DTSTART:20261021T073000")
})

test("attendance distinguishes upcoming, attended, and overdue learning", async () => {
  const { attendanceStatus } = await import("./commitment")
  const dates = ["2026-10-19", "2026-10-21"]
  expect(attendanceStatus(dates, [], "2026-10-18")).toBe("On track")
  expect(attendanceStatus(dates, [], "2026-10-19")).toBe("On track")
  expect(attendanceStatus(dates, [], "2026-10-20")).toBe("Missed")
  expect(attendanceStatus(dates, [dates[0]!], "2026-10-20")).toBe("On track")
  expect(attendanceStatus(dates, dates, "2026-10-22")).toBe("Attended")
  expect(attendanceStatus(dates, [dates[1]!], "2026-10-22")).toBe("Missed")
})

test("missed attendance holds learning phase until earlier sessions are attended", async () => {
  const { learningPhase } = await import("./commitment")
  const today = "2026-11-20"
  const pending = { ...commitment, completed: [] }
  expect(learningPhase(pending, today)).toBe(0)
  const earlier = planDays(pending)
    .filter((day) => day.slot && day.dayNumber <= 20)
    .map((day) => day.date)
  expect(learningPhase({ ...pending, completed: earlier }, today)).toBe(1)
  const allDue = planDays(pending)
    .filter((day) => day.slot && day.date <= today)
    .map((day) => day.date)
  expect(learningPhase({ ...pending, completed: allDue }, today)).toBe(1)
  expect(learningPhase(pending, "2027-01-20")).toBe(0)
})

test("plan board sorts tasks into missed, past, in progress and upcoming with resource fallback", () => {
  const schedule = {
    startDate: "2026-10-19",
    timeZone: "Asia/Kuala_Lumpur",
    weeklyMinutes: 120,
    studyDays: [1, 3],
    sessionLimitMinutes: 90,
  }
  const { firstMonth, milestones } = buildPlanSchedule(schedule, 90)
  const planned: Commitment = {
    ...commitment,
    completed: ["2026-10-19"],
    plan: {
      provider: "Test",
      plan: {
        summary: "Plan",
        firstStep: "Start",
        contractVersion: 3,
        strategyId: "pivot",
        schedule,
        phases: [22, 45, 67, 90].map((endDay, index) => ({
          title: `Phase ${index + 1}`,
          days: "",
          focus: "",
          actions: [],
          deliverable: `Deliverable ${index + 1}`,
          flightPlan: [],
          endDay,
        })),
        firstMonth: firstMonth.map((day) => ({
          ...day,
          task: day.kind === "task" ? `Task ${day.day}` : null,
          doneWhen: day.kind === "task" ? `Done ${day.day}` : undefined,
          ...(day.day === 1 ? { resourceId: "crm" as const } : {}),
        })),
        milestones: milestones.map((milestone) => ({ ...milestone, action: "Practice" })),
      },
    },
  }
  // Wednesday of week two: day 1 logged, day 3 and day 8 missed, day 10 is today.
  const { phases, items } = planBoard(planned, "2026-10-28")
  const status = (id: string) => items.find((item) => item.id === id)?.status
  expect(status("day-1")).toBe("past")
  expect(status("day-3")).toBe("missed")
  expect(status("day-8")).toBe("missed")
  expect(status("day-10")).toBe("inProgress")
  expect(status("day-15")).toBe("upcoming")
  expect(items.find((item) => item.id === "day-2")).toBeUndefined() // rest day
  expect(items.find((item) => item.id === "day-3")).toMatchObject({
    resourceId: "crm",
    suggested: true,
    doneWhen: "Done 3",
  })
  expect(items.some((item) => item.id.startsWith("intermediate"))).toBe(true)
  expect(phases.map((phase) => phase.status)).toEqual([
    "inProgress",
    "upcoming",
    "upcoming",
    "upcoming",
  ])
  expect(phases[0]).toMatchObject({ done: 1, resources: ["crm"] })
  // Before day 1 everything is upcoming.
  expect(
    planBoard({ ...planned, completed: [] }, "2026-10-18").items.every(
      (item) => item.status === "upcoming",
    ),
  ).toBe(true)
})

test("session state locks logging until 30 minutes before, then finds current and next sessions", () => {
  // Mon and Wed mornings at 06:30 from Mon 19 Oct; both first-week sessions already logged.
  const before = sessionState(commitment, new Date(2026, 9, 18, 12))
  expect(before.dayNumber).toBe(0)
  expect(before.logLabel).toMatch(/^Starts /)
  expect(before.canLog).toBe(false)
  expect(before.next!.day.date).toBe("2026-10-26") // logged sessions are skipped
  const early = sessionState(commitment, new Date(2026, 9, 26, 5, 30))
  expect(early).toMatchObject({ logLocked: true, canLog: false })
  expect(early.logLabel).toBe("Unlocks 30 min before session")
  const ready = sessionState(commitment, new Date(2026, 9, 26, 6, 10))
  expect(ready).toMatchObject({ logLocked: false, canLog: true, logLabel: "Log today's session" })
  expect(ready.current).toBeUndefined()
  expect(sessionState(commitment, new Date(2026, 9, 26, 6, 40)).current?.day.date).toBe(
    "2026-10-26",
  )
  const saturday = sessionState(commitment, new Date(2026, 9, 31, 9))
  expect(saturday.logLabel).toBe("Rest day today")
  expect(saturday.missed.map((day) => day.date)).toEqual(["2026-10-26", "2026-10-28"])
  expect(toggledCommitment(commitment, "2026-10-27", "2026-10-31")).toBeNull() // rest day
  expect(toggledCommitment(commitment, "2026-11-02", "2026-10-31")).toBeNull() // future
  expect(toggledCommitment(commitment, "2026-10-26", "2026-10-31")!.completed).toContain(
    "2026-10-26",
  )
})
