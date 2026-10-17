import { expect, test } from "vite-plus/test"
import { calendarIcs, googleCalendarUrl } from "./calendar"
import { commitmentSlots, type Commitment } from "./commitment"

const commitment: Commitment = {
  version: 1,
  pathId: "quality",
  direction: "Quality, Testing",
  role: null,
  sprint: true,
  hours: "1–3 hours",
  timeOfDay: "morning",
  days: "weekdays",
  startDate: "2026-10-17", // Saturday
  completed: [],
}

test("ics has one weekly event per slot from its first weekday to the plan end, with alerts", () => {
  const ics = calendarIcs(commitment)
  expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(commitmentSlots(commitment).length)
  expect(ics).toContain("DTSTART:20261019T063000") // first Monday after the Saturday start
  expect(ics).toContain("RRULE:FREQ=WEEKLY;BYDAY=MO;UNTIL=20270111T235900")
  expect(ics).toContain("TRIGGER:-PT15M")
  expect(ics).toContain("SUMMARY:Learning: Quality\\, Testing")
  expect(ics.split("\r\n")[0]).toBe("BEGIN:VCALENDAR")
})

test("one Google link repeats on every slot day sharing a time; others go in the notes", () => {
  const url = new URL(googleCalendarUrl(commitment))
  expect(url.hostname).toBe("calendar.google.com")
  expect(url.searchParams.get("dates")).toBe("20261019T063000/20261019T073000")
  expect(url.searchParams.get("recur")).toContain("BYDAY=MO,WE")
  const mixed = new URL(
    googleCalendarUrl({
      ...commitment,
      hours: "5+ hours",
      timeOfDay: "flexible",
      days: "flexible",
    }),
  )
  expect(mixed.searchParams.get("details")).toContain("Also: Sat 10:00")
})

test("split sessions have distinct calendar IDs instead of overwriting the same weekday", () => {
  const planned: Commitment = {
    ...commitment,
    plan: {
      provider: "Test",
      plan: {
        summary: "",
        firstStep: "",
        phases: [],
        schedule: {
          startDate: commitment.startDate,
          timeZone: "Asia/Kuala_Lumpur",
          weeklyMinutes: 300,
          studyDays: [1, 3, 5],
          sessionLimitMinutes: 45,
        },
      },
    },
  }
  const ids = calendarIcs(planned)
    .split("\r\n")
    .filter((line) => line.startsWith("UID:"))
  expect(ids.length).toBeGreaterThan(3)
  expect(new Set(ids).size).toBe(ids.length)
})
