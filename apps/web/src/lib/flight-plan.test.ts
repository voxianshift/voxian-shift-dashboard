import { expect, test } from "vite-plus/test"
import { defaultFlightPlan, phaseRanges } from "./flight-plan"
import { navigatorFixture } from "./navigator.fixture"

const path = navigatorFixture.paths[2]!
const courses = ["A", "B", "C", "D", "E", "F"]

test("each phase splits into contiguous windows that cover its days", () => {
  for (const sprint of [false, true]) {
    const plan = defaultFlightPlan(sprint, path, path.roles, courses)
    plan.forEach((segments, phase) => {
      const [start, end] = phaseRanges(sprint)[phase]!
      expect(segments[0]!.days.startsWith(`D${start}–`)).toBe(true)
      expect(segments.at(-1)!.days.endsWith(`–D${end}`)).toBe(true)
    })
  }
})

test("study windows follow course order; the final window is for conversations", () => {
  const plan = defaultFlightPlan(false, path, [path.roles[1]!], courses)
  expect(plan.flat().map((segment) => segment.module)).toEqual(["A", "B", "C", "D", "E", undefined])
  expect(plan[0]![1]!.focus).toBe(path.firstStep)
  expect(plan[1]![1]!.focus).toBe(path.project)
  expect(plan[2]![1]!.focus).toContain(path.roles[1])
})
