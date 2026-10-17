import { expect, test } from "vite-plus/test"
import { emptyProfile, questions, type CareerProfile } from "./onboarding"
import { canAdvanceOnboarding, onboardingSteps } from "./onboarding-flow"

test("seven screens follow requested order and cover every existing preference once", () => {
  expect(onboardingSteps.map((step) => step.title)).toEqual([
    "About you",
    "Your work",
    "Identify Your Baseline Gravity",
    "What defines most of your daily workload?",
    "Your Moat & Strategic Posture",
    "Time Horizon & Risk Appetite",
    "Career North Star & Anxieties",
  ])
  expect(onboardingSteps.flatMap((step) => step.fields).sort()).toEqual(
    questions.map((question) => question.field).sort(),
  )
})

test("work matching, baseline, workload, and learning schedule gate their own screens", () => {
  expect(canAdvanceOnboarding(0, emptyProfile)).toBe(true)
  for (const step of [1, 2, 3, 4, 5, 6])
    expect(canAdvanceOnboarding(step, emptyProfile)).toBe(false)
  const complete: CareerProfile = {
    ...emptyProfile,
    currentWork: "Software developer",
    occupations: ["15-1252.00"],
    primaryOccupation: "15-1252.00",
    taskFocus: "mixed",
    hours: "1–3 hours",
    timeline: "Next 3 months",
  }
  for (let step = 0; step < 7; step++) expect(canAdvanceOnboarding(step, complete)).toBe(true)
  expect(canAdvanceOnboarding(2, { ...complete, primaryOccupation: "" })).toBe(false)
  expect(canAdvanceOnboarding(6, { ...complete, taskFocus: "" })).toBe(false)
  expect(canAdvanceOnboarding(6, { ...complete, hours: "" })).toBe(false)
  expect(canAdvanceOnboarding(6, { ...complete, timeline: "" })).toBe(false)
})
