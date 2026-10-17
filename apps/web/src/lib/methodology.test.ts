import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, expect, test, vi } from "vite-plus/test"
import { computeExposure, emptyProfile } from "@voxian/shared"
import ResourcesPage from "../app/(dashboard)/resources/page"
import { iscoMeterModel, type IscoMeterModel } from "./isco-meter"
import { occupationModels, taskWeights } from "./occupations"

const state = vi.hoisted(() => ({
  profile: {} as typeof emptyProfile,
  confirmed: true,
  ready: true,
  isco: null as IscoMeterModel | "missing" | null,
}))
vi.mock("@/components/career-profile-provider", () => ({ useCareerProfile: () => state }))
vi.mock("@/hooks/use-isco-meter", () => ({ useIscoMeter: () => state.isco }))
const payload = {
  isco: "2512",
  iscoTitle: "Software developers",
  gradient: "G3",
  crosswalk: { escoTitle: "software developer", match: "closeMatch" },
  tasks: [
    { task: "Design software", exposure: 0.6 },
    { task: "Review requirements", exposure: 0.4 },
  ],
}
beforeEach(() => {
  state.profile = {
    ...emptyProfile,
    occupations: ["43-4051.00"],
    primaryOccupation: "43-4051.00",
    occupationNames: { "43-4051.00": "Customer Service Representatives" },
  }
  state.ready = true
  state.confirmed = true
  state.isco = null
})

test.each(["routine", "mixed", "escalations"] as const)(
  "%s demo evidence matches Meter calculation",
  (focus) => {
    state.profile.taskFocus = focus
    const model = occupationModels[0]
    const weights = taskWeights(model, focus)
    const score = computeExposure(
      model.tasks.map((task, index) => ({ ...task, weight: weights[index]! })),
    )
    const html = renderToStaticMarkup(createElement(ResourcesPage))
    expect(html).toContain(`data-methodology-score="${score.toFixed(1)}"`)
    expect(html).toContain("Illustrative prototype task estimates")
    expect(html).toContain("https://www.onetonline.org/link/summary/43-4051.00")
    expect(html).not.toContain("Calendar, travel")
  },
)

test("ISCO evidence uses validated equal-weight inputs and occupation-specific sources", () => {
  state.profile = {
    ...emptyProfile,
    occupations: ["15-1252.00"],
    primaryOccupation: "15-1252.00",
    occupationNames: { "15-1252.00": "Software Developers" },
  }
  state.isco = iscoMeterModel(payload, "15-1252.00", "Software Developers")
  expect(state.isco.tasks.map((task) => task.weight)).toEqual([0.5, 0.5])
  const html = renderToStaticMarkup(createElement(ResourcesPage))
  expect(html).toContain('data-methodology-score="50.0"')
  expect(html).toContain("equal task weights")
  expect(html).toContain("closeMatch")
  expect(html).toContain("https://www.onetonline.org/link/summary/15-1252.00")
  expect(html).not.toContain("43-4051.00")
  state.isco.crosswalkMatch = "ai"
  expect(renderToStaticMarkup(createElement(ResourcesPage))).toContain(
    "not an official crosswalk match",
  )
})

test("invalid API task data cannot produce a score", () => {
  expect(() => iscoMeterModel({ ...payload, tasks: [] }, "15-1252.00", "")).toThrow()
  expect(() =>
    iscoMeterModel({ ...payload, tasks: [{ task: "Task", exposure: 1.2 }] }, "15-1252.00", ""),
  ).toThrow()
  expect(() =>
    iscoMeterModel({ ...payload, tasks: [{ task: "Task", exposure: null }] }, "15-1252.00", ""),
  ).toThrow()
})

test("missing profile, unconfirmed demo and loading never show a personal score", () => {
  state.profile = emptyProfile
  expect(renderToStaticMarkup(createElement(ResourcesPage))).toContain("Set up my profile")
  state.profile = { ...emptyProfile, occupations: ["43-4051.00"], primaryOccupation: "43-4051.00" }
  state.confirmed = false
  let html = renderToStaticMarkup(createElement(ResourcesPage))
  expect(html).toContain("Review and calculate your baseline")
  expect(html).not.toContain("data-methodology-score")
  state.profile = { ...emptyProfile, occupations: ["15-1252.00"], primaryOccupation: "15-1252.00" }
  html = renderToStaticMarkup(createElement(ResourcesPage))
  expect(html).toContain("Loading your task evidence")
  expect(html).not.toContain("data-methodology-score")
  state.isco = "missing"
  html = renderToStaticMarkup(createElement(ResourcesPage))
  expect(html).toContain("Task evidence is unavailable")
  expect(html).not.toContain("data-methodology-score")
})
