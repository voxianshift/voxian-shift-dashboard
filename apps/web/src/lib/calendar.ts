import {
  commitmentSlots,
  dayNames,
  planDays,
  slotEnd,
  type Commitment,
  type Slot,
} from "@/lib/commitment"

const icsDay = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"]
// Floating local times (no time zone): the session happens at that clock time wherever the learner is.
const stamp = (date: string, time: string) => `${date.replace(/-/g, "")}T${time.replace(":", "")}00`
const escape = (text: string) => text.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n")

function occurrences(commitment: Commitment, slot: Slot) {
  const days = planDays(commitment).filter((day) => day.weekday === slot.day)
  return { first: days[0]!.date, last: days.at(-1)!.date }
}

const title = (commitment: Commitment) => `Learning: ${commitment.direction}`
const details = (commitment: Commitment) =>
  `Your Voxian Shift study session${commitment.role ? ` for ${commitment.role}` : ""}. Log it on your Progress page when done.`

/** One weekly repeating event per slot until the plan ends, each with a 15-minute alert. */
export function calendarIcs(commitment: Commitment) {
  const events = commitmentSlots(commitment).map((slot) => {
    const { first, last } = occurrences(commitment, slot)
    return [
      "BEGIN:VEVENT",
      `UID:voxian-${commitment.startDate}-${slot.day}@voxian-shift`,
      `DTSTAMP:${stamp(commitment.startDate, "00:00")}`,
      `DTSTART:${stamp(first, slot.start)}`,
      `DTEND:${stamp(first, slotEnd(slot))}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${icsDay[slot.day]};UNTIL=${stamp(last, "23:59")}`,
      `SUMMARY:${escape(title(commitment))}`,
      `DESCRIPTION:${escape(details(commitment))}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "TRIGGER:-PT15M",
      `DESCRIPTION:${escape(title(commitment))}`,
      "END:VALARM",
      "END:VEVENT",
    ].join("\r\n")
  })
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Voxian Shift//Learning plan//EN",
    "CALSCALE:GREGORIAN",
    ...events,
    "END:VCALENDAR",
    "",
  ].join("\r\n")
}

/**
 * Google's add-event link creates one repeating event, so slots sharing a time and length become
 * one event on all their days. Mixed times: the largest group is the event; the rest go in notes.
 */
export function googleCalendarUrl(commitment: Commitment) {
  const slots = commitmentSlots(commitment)
  const groups = Map.groupBy(slots, (slot) => `${slot.start}-${slot.minutes}`)
  const main = [...groups.values()].sort((a, b) => b.length - a.length)[0]!
  const others = slots.filter((slot) => !main.includes(slot))
  const first = planDays(commitment).find((day) => main.some((slot) => slot.day === day.weekday))!
  const last = planDays(commitment).at(-1)!.date
  const slot = main[0]!
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title(commitment),
    details:
      details(commitment) +
      (others.length
        ? ` Also: ${others.map((o) => `${slotLabel(o)}–${slotEnd(o)}`).join(", ")}.`
        : ""),
    dates: `${stamp(first.date, slot.start)}/${stamp(first.date, slotEnd(slot))}`,
    recur: `RRULE:FREQ=WEEKLY;BYDAY=${main.map((m) => icsDay[m.day]).join(",")};UNTIL=${stamp(last, "23:59")}`,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

export const slotLabel = (slot: Slot) => `${dayNames[slot.day]} ${slot.start}`
