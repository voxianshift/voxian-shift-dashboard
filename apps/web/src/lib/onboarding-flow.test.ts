import { expect, test } from "vite-plus/test"
import { emptyProfile, questions, type CareerProfile } from "./onboarding"
import { canAdvanceOnboarding, onboardingSteps } from "./onboarding-flow"

test("five screens follow requested order and ask only the quick essentials", () => {
  expect(onboardingSteps.map((step) => step.title)).toEqual([
    "Your work",
    "Identify Your Baseline Gravity",
    "What defines most of your daily workload?",
    "Your Moat & Strategic Posture",
    "Career North Star & Anxieties",
  ])
  const asked = onboardingSteps.flatMap((step) => step.fields)
  expect(asked).toEqual([
    "preferredName",
    "currentWork",
    "taskFocus",
    "hours",
    "timeline",
    "anxieties",
  ])
  // Everything else stays editable later in the profile.
  for (const field of ["strengths", "direction", "flexibility", "risk", "goals"])
    expect(questions.some((question) => question.field === field)).toBe(true)
})

test("work matching, baseline, workload, and learning schedule gate their own screens", () => {
  for (const step of [0, 1, 2, 3, 4]) expect(canAdvanceOnboarding(step, emptyProfile)).toBe(false)
  const complete: CareerProfile = {
    ...emptyProfile,
    currentWork: "Software developer",
    occupations: ["15-1252.00"],
    primaryOccupation: "15-1252.00",
    taskFocus: "mixed",
    hours: "1–3 hours",
    timeline: "Next 3 months",
  }
  for (let step = 0; step < 5; step++) expect(canAdvanceOnboarding(step, complete)).toBe(true)
  expect(canAdvanceOnboarding(1, { ...complete, primaryOccupation: "" })).toBe(false)
  expect(canAdvanceOnboarding(3, { ...complete, hours: "" })).toBe(false)
  expect(canAdvanceOnboarding(3, { ...complete, timeline: "" })).toBe(false)
  expect(canAdvanceOnboarding(4, { ...complete, taskFocus: "" })).toBe(false)
  expect(canAdvanceOnboarding(4, { ...complete, hours: "" })).toBe(false)
  expect(canAdvanceOnboarding(4, { ...complete, timeline: "" })).toBe(false)
})
