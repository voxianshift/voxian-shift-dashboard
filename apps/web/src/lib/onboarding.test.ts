import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { expect, test } from "vite-plus/test"
import { ProfileEditor } from "../components/profile-editor"
import { TooltipProvider } from "../components/ui/tooltip"
import { computeExposure } from "@voxian/shared"
import {
  askedQuestions,
  canConfirmProfile,
  hasScheduleAnswers,
  hasMeterInputs,
  chatResultSchema,
  emptyProfile,
  mergeProfile,
  nextQuestion,
  questions,
} from "./onboarding"
import { occupationModels, taskWeights } from "./occupations"

test("skips optional questions and never repeats supplied answers", () => {
  const profile = mergeProfile(emptyProfile, {
    currentWork: "I teach",
    goals: ["Stability"],
    hours: "1–3 hours",
  })
  expect(nextQuestion(profile, [])?.field).toBe("taskFocus")
  // Quick mode still asks the required timeline after the first four questions.
  expect(nextQuestion(profile, ["taskFocus"])?.field).toBe("timeline")
  expect(nextQuestion({ ...profile, timeline: "No deadline" }, ["taskFocus"])).toBeUndefined()
  expect(nextQuestion(profile, ["taskFocus"], true)?.field).toBe("preferredName")
  expect(nextQuestion({ ...emptyProfile, currentWork: "  " }, [])?.field).toBe("currentWork")
})

test("requires explicit primary selection for multiple occupations and repairs stale primary", () => {
  const multiple = mergeProfile(emptyProfile, {
    occupations: ["customer-support", "administrative-assistant"],
  })
  expect(multiple.occupations).toHaveLength(2)
  expect(multiple.primaryOccupation).toBe("")
  const selected = mergeProfile(multiple, { primaryOccupation: "administrative-assistant" })
  expect(selected.primaryOccupation).toBe("administrative-assistant")
  expect(mergeProfile(selected, { occupations: ["customer-support"] }).primaryOccupation).toBe(
    "customer-support",
  )
  expect(mergeProfile(selected, { occupations: [] }).primaryOccupation).toBe("")
})

test("unsupported occupation stays unscored; model cannot inject unsupported fields", () => {
  const profile = mergeProfile(emptyProfile, { currentWork: "Teacher" })
  expect(profile.primaryOccupation).toBe("")
  expect(chatResultSchema.safeParse({ reply: "Done", updates: { exposure: 99 } }).success).toBe(
    false,
  )
  expect(
    chatResultSchema.safeParse({ reply: "Done", updates: { occupations: ["teacher"] } }).success,
  ).toBe(false)
})

test("both demo occupations use normalized task mixes with stable example scores", () => {
  expect(occupationModels.map((model) => computeExposure(model.tasks).toFixed(1))).toEqual([
    "74.8",
    "68.2",
  ])
  for (const model of occupationModels) {
    for (const focus of ["routine", "escalations", "mixed"]) {
      const weights = taskWeights(model, focus)
      expect(weights.reduce((sum, weight) => sum + weight, 0)).toBeCloseTo(1)
      const score = computeExposure(
        model.tasks.map((task, i) => ({ ...task, weight: weights[i]! })),
      )
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    }
  }
  expect(
    computeExposure(
      occupationModels[0].tasks.map((task, i) => ({
        ...task,
        weight: taskWeights(occupationModels[0], "escalations")[i]!,
      })),
    ).toFixed(1),
  ).toBe("44.8")
})

test("all skipped or unsupported profiles cannot confirm a personal baseline", () => {
  expect(
    nextQuestion(
      emptyProfile,
      questions.map((q) => q.field),
    ),
  ).toBeUndefined()
  expect(canConfirmProfile(emptyProfile)).toBe(false)
  expect(
    canConfirmProfile(mergeProfile(emptyProfile, { currentWork: "Teacher", goals: ["Stability"] })),
  ).toBe(false)
  const roles = mergeProfile(emptyProfile, {
    occupations: ["customer-support", "administrative-assistant"],
  })
  expect(canConfirmProfile(roles)).toBe(false)
  const baselineOnly = mergeProfile(emptyProfile, { occupations: ["customer-support"] })
  expect(canConfirmProfile(baselineOnly)).toBe(true)
  expect(baselineOnly.taskFocus).toBe("")
})

test("Meter recalculates known role baselines for each task mix", () => {
  const expected = [
    [74.75, 44.75, 59.75],
    [68.2, 42.35, 55.275],
  ]
  for (const [roleIndex, model] of occupationModels.entries()) {
    for (const [focusIndex, focus] of ["routine", "escalations", "mixed"].entries()) {
      const weights = taskWeights(model, focus)
      const score = computeExposure(
        model.tasks.map((task, i) => ({ ...task, weight: weights[i]! })),
      )
      expect(score).toBeCloseTo(expected[roleIndex]![focusIndex]!, 8)
    }
  }
})

test("catalogue roles are preserved without inventing exposure coverage; old profiles still parse", () => {
  const software = mergeProfile(emptyProfile, {
    occupations: ["15-1252.00"],
    occupationNames: { "15-1252.00": "Software Developers" },
  })
  expect(software.primaryOccupation).toBe("15-1252.00")
  expect(canConfirmProfile(software)).toBe(false)
  expect(nextQuestion(software, [])?.field).toBe("taskFocus")
  const support = mergeProfile(emptyProfile, { occupations: ["43-4051.00"] })
  expect(canConfirmProfile(support)).toBe(true)
  const mixed = mergeProfile(support, {
    occupations: ["43-4051.00", "15-1252.00"],
    primaryOccupation: "15-1252.00",
  })
  expect(canConfirmProfile(mixed)).toBe(false)
  expect(canConfirmProfile(mergeProfile(mixed, { primaryOccupation: "43-4051.00" }))).toBe(true)
  expect(canConfirmProfile(mergeProfile(emptyProfile, { occupations: ["customer-support"] }))).toBe(
    true,
  )
})

test("Meter review requires a selected main occupation, not optional planning answers", () => {
  expect(hasMeterInputs(emptyProfile)).toBe(false)
  expect(
    hasMeterInputs({
      ...emptyProfile,
      currentWork: "Software developer",
      occupationNames: { "15-1252.00": "Software Developers" },
    }),
  ).toBe(false)
  expect(hasMeterInputs({ ...emptyProfile, occupations: ["15-1252.00", "43-4051.00"] })).toBe(false)
  expect(
    hasMeterInputs({
      ...emptyProfile,
      occupations: ["15-1252.00"],
      primaryOccupation: "43-4051.00",
    }),
  ).toBe(false)
  const matched = mergeProfile(emptyProfile, { occupations: ["15-1252.00"] })
  expect(hasMeterInputs(matched)).toBe(true)
  expect(matched.goals).toEqual([])
  expect(matched.hours).toBe("")
  expect(matched.taskFocus).toBe("")
  expect(canConfirmProfile(matched)).toBe(false)
})

test("weekly time and timeline are asked even in quick mode and are required for scheduling", () => {
  const quick = askedQuestions().map((q) => q.field)
  expect(quick).toContain("hours")
  expect(quick).toContain("timeline")
  const answered = mergeProfile(emptyProfile, {
    currentWork: "I teach",
    taskFocus: "mixed",
    goals: ["Stability"],
    hours: "1–3 hours",
  })
  // Optional detail questions are skipped in quick mode; the required timeline is not.
  expect(nextQuestion(answered, [])?.field).toBe("timeline")
  expect(hasScheduleAnswers(answered)).toBe(false)
  expect(hasScheduleAnswers(mergeProfile(answered, { timeline: "Next 3 months" }))).toBe(true)
})

test("option questions render answer chips only; free text stays for name and work", () => {
  const html = renderToStaticMarkup(
    createElement(
      TooltipProvider,
      null,
      createElement(ProfileEditor, {
        profile: mergeProfile(emptyProfile, { hours: "About 2 hours from chat" }),
        onChange: () => {},
        fields: ["hours", "timeline", "goals", "preferredName"],
      }),
    ),
  )
  expect(html.match(/<input/g)).toHaveLength(1) // preferredName only
  expect(html).toContain("About 2 hours from chat") // earlier custom answer kept as a chip
  expect(html.match(/Required · used to schedule your learning/g)).toHaveLength(2)
})

test("profile editor respects tab field order and work offers search without a description input", () => {
  const fields = ["preferredName", "currentWork", "taskFocus", "strengths"] as const
  const html = renderToStaticMarkup(
    createElement(
      TooltipProvider,
      null,
      createElement(ProfileEditor, { profile: emptyProfile, onChange: () => {}, fields }),
    ),
  )
  const positions = fields.map((field) => html.indexOf(`id="profile-${field}-label"`))
  expect(positions.every((position) => position >= 0)).toBe(true)
  expect(positions).toEqual([...positions].sort((a, b) => a - b))
  expect(html).toContain("Search your job title or duties")
  expect(html).not.toContain("<textarea")
  expect(html).not.toContain("Or describe your work")
})
