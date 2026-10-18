import { expect, test } from "vite-plus/test"
import { cvContextSchema, cvUploadResultSchema } from "./cv.ts"
import { emptyProfile, profileSchema, profilePatchSchema } from "./onboarding.ts"
import { copilotProfileSchema } from "./copilot.ts"
import { chatRequestSchema } from "./onboarding.ts"
import { navigatorContext } from "./navigator.ts"

const cv = {
  confidence: 0.9,
  reviewed: true as const,
  jobTitles: ["Software Developer"],
  skills: ["TypeScript"],
  workHistory: [
    {
      title: "Software Developer",
      employerContext: "software team",
      duties: ["Build applications"],
    },
  ],
  keywords: ["TypeScript", "automated testing"],
}

test("reviewed career evidence persists in profile and flows into planning context", () => {
  const profile = profileSchema.parse({ ...emptyProfile, cvContext: cv })
  expect(profile.cvContext).toEqual(cv)
  expect(navigatorContext(profile).cvContext?.keywords).toEqual(cv.keywords)
  expect(navigatorContext(profile)).not.toHaveProperty("preferredName")
  expect(profileSchema.parse({ ...profile, cvContext: null }).cvContext).toBeNull()
  expect(profileSchema.parse(emptyProfile)).toEqual(emptyProfile)
})

test("unreviewed and low-confidence CV evidence cannot be saved or used for planning", () => {
  expect(cvContextSchema.safeParse({ ...cv, confidence: 0.6 }).success).toBe(true)
  for (const change of [
    { confidence: 0.59 },
    { reviewed: false },
    { keywords: ["x".repeat(181)] },
    { rawText: "private CV" },
  ])
    expect(
      profileSchema.safeParse({ ...emptyProfile, cvContext: { ...cv, ...change } }).success,
    ).toBe(false)
  expect(profilePatchSchema.safeParse({ cvContext: cv }).success).toBe(false)
  expect(
    cvUploadResultSchema.safeParse({
      status: "ready",
      extraction: { ...cv, reviewed: undefined, confidence: 0.4 },
      occupations: [],
      provider: "Test",
    }).success,
  ).toBe(false)
})

test("CV context stays out of unrelated chat payloads and chat-generated updates", () => {
  const profile = { ...emptyProfile, cvContext: cv }
  expect(copilotProfileSchema.parse(profile)).not.toHaveProperty("cvContext")
  expect(
    chatRequestSchema.parse({ profile, message: "Hello", question: "Work?", history: [] }).profile,
  ).not.toHaveProperty("cvContext")
})
