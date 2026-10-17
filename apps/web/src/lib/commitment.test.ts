import { expect, test } from "vite-plus/test"
import {
  commitmentSlots,
  currentPhase,
  defaultStudyDays,
  planStartDate,
  timelineSprint,
  planDays,
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
