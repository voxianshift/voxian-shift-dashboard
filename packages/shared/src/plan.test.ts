import { expect, test } from "vite-plus/test"
import { buildPlanSchedule, planScheduleSchema, planPhaseRanges, addCalendarDays } from "./plan.ts"

const schedule = {
  startDate: "2026-10-19",
  timeZone: "Asia/Kuala_Lumpur",
  weeklyMinutes: 60,
  studyDays: [1, 3, 5],
  sessionLimitMinutes: 45,
}
test("both horizons have four contiguous phases and full milestone coverage after day 30", () => {
  for (const horizon of [90, 120] as const) {
    const ranges = planPhaseRanges(horizon)
    expect(
      ranges.flatMap(([start, end]) =>
        Array.from({ length: end - start + 1 }, (_, i) => start + i),
      ),
    ).toEqual(Array.from({ length: horizon }, (_, i) => i + 1))
    const result = buildPlanSchedule(schedule, horizon)
    expect(result.firstMonth.map((entry) => entry.day)).toEqual(
      Array.from({ length: 30 }, (_, i) => i + 1),
    )
    expect(
      result.milestones.flatMap((entry) =>
        Array.from({ length: entry.endDay - entry.startDay + 1 }, (_, i) => entry.startDay + i),
      ),
    ).toEqual(Array.from({ length: horizon - 30 }, (_, i) => i + 31))
    for (const milestone of result.milestones) {
      expect(milestone.endDay - milestone.startDay).toBeLessThan(7)
      const phase = ranges.find(
        ([start, end]) => milestone.startDay >= start && milestone.endDay <= end,
      )
      expect(phase).toBeDefined()
    }
  }
})
test("every rolling seven-day window respects tiny and large budgets and short-session limits", () => {
  for (const weeklyMinutes of [1, 17, 60, 301, 1200])
    for (const studyDays of [[0], [1, 3, 5], [0, 1, 2, 3, 4, 5, 6]]) {
      const result = buildPlanSchedule(
        { ...schedule, weeklyMinutes, studyDays, sessionLimitMinutes: 15 },
        90,
      )
      for (let i = 0; i < 24; i++)
        expect(
          result.firstMonth.slice(i, i + 7).reduce((sum, d) => sum + d.minutes, 0),
        ).toBeLessThanOrEqual(weeklyMinutes)
      for (const day of result.firstMonth) {
        expect(day.sessions.reduce((a, b) => a + b, 0)).toBe(day.minutes)
        expect(day.sessions.every((minutes) => minutes <= 15 && minutes > 0)).toBe(true)
        if (!studyDays.includes(new Date(`${day.localDate}T00:00:00Z`).getUTCDay()))
          expect(day.kind).toBe("rest")
      }
    }
})
test("calendar arithmetic handles month/year rollover, leap days and DST dates without hour drift", () => {
  expect(addCalendarDays("2028-02-28", 1)).toBe("2028-02-29")
  expect(addCalendarDays("2026-12-31", 1)).toBe("2027-01-01")
  const result = buildPlanSchedule(
    { ...schedule, startDate: "2026-03-07", timeZone: "America/New_York" },
    120,
  )
  expect(result.firstMonth[2]!.localDate).toBe("2026-03-09")
  expect(result.firstMonth[29]!.localDate).toBe("2026-04-05")
})
test("invalid dates, zones, budgets and duplicate study days are rejected", () => {
  for (const change of [
    { startDate: "2026-02-30" },
    { timeZone: "Not/AZone" },
    { weeklyMinutes: 0 },
    { weeklyMinutes: 1.5 },
    { studyDays: [] },
    { studyDays: [1, 1] },
    { sessionLimitMinutes: 0 },
  ])
    expect(planScheduleSchema.safeParse({ ...schedule, ...change }).success).toBe(false)
})

test("half-hour schedules allocate exact budgets in 30-minute blocks", () => {
  for (const weeklyMinutes of [30, 60, 90, 120, 240, 360, 1200])
    for (const studyDays of [
      [6, 0],
      [1, 2, 3, 4, 5],
      [1, 2, 3, 4, 5, 6, 0],
    ])
      for (const sessionLimitMinutes of [30, 90, 180]) {
        const result = buildPlanSchedule(
          { ...schedule, weeklyMinutes, studyDays, sessionLimitMinutes },
          90,
        )
        expect(result.firstMonth.slice(0, 7).reduce((sum, day) => sum + day.minutes, 0)).toBe(
          weeklyMinutes,
        )
        for (const day of result.firstMonth)
          expect(
            day.sessions.every(
              (minutes) => minutes > 0 && minutes % 30 === 0 && minutes <= sessionLimitMinutes,
            ),
          ).toBe(true)
      }
})

test("custom daily minutes must use whole half-hours and exhaust weekly budget", () => {
  const custom = {
    ...schedule,
    weeklyMinutes: 240,
    studyDays: [1, 3, 5],
    sessionLimitMinutes: 90,
    dayMinutes: { 1: 30, 3: 90, 5: 120 },
  }
  expect(planScheduleSchema.safeParse(custom).success).toBe(true)
  const result = buildPlanSchedule(custom, 90)
  expect(result.firstMonth.slice(0, 7).map((day) => day.minutes)).toEqual([30, 0, 90, 0, 120, 0, 0])
  expect(result.firstMonth[4]!.sessions).toEqual([90, 30])
  for (const dayMinutes of [
    { 1: 30 },
    { 1: 270 },
    { 1: 240, 6: 0 },
    { 1: 45, 3: 195 },
    { 1: -30, 3: 270 },
  ])
    expect(planScheduleSchema.safeParse({ ...custom, dayMinutes }).success).toBe(false)
})
