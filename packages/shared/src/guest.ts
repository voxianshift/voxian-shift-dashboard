import { z } from "zod"
import { profileSchema } from "./onboarding.ts"
import { calendarDateSchema, flightPlanSchema } from "./plan.ts"

export const profileStateSchema = z
  .strictObject({
    profile: profileSchema,
    confirmed: z.boolean(),
    onboardingComplete: z.boolean().default(false),
    skipped: z.array(z.string().max(80)).max(20),
  })
  .refine(
    ({ profile, confirmed }) =>
      !confirmed ||
      (!!profile.primaryOccupation && profile.occupations.includes(profile.primaryOccupation)),
    "Choose a main occupation before confirming",
  )
export type ProfileState = z.infer<typeof profileStateSchema>

const segmentSchema = z.object({
  days: z.string().max(40),
  focus: z.string().max(1000),
  module: z.string().max(300).optional(),
})
// Accept existing plans too, so guests keep commitments made before database storage.
const savedPlanSchema = flightPlanSchema.partial().extend({
  summary: z.string().max(2000),
  firstStep: z.string().max(1000),
  phases: z
    .array(
      z.object({
        id: z.string().max(80).optional(),
        startDay: z.number().int().min(1).max(120).optional(),
        endDay: z.number().int().min(1).max(120).optional(),
        title: z.string().max(200),
        days: z.string().max(80),
        focus: z.string().max(1000),
        actions: z.array(z.string().max(1000)).max(20),
        deliverable: z.string().max(1000),
        flightPlan: z.array(segmentSchema).max(20),
      }),
    )
    .min(1)
    .max(12),
})
export const commitmentSchema = z
  .strictObject({
    version: z.literal(1),
    pathId: z.string().min(1).max(100),
    direction: z.string().min(1).max(200),
    role: z.string().max(300).nullable(),
    sprint: z.boolean(),
    hours: z.string().max(800),
    timeOfDay: z.enum(["morning", "night", "flexible"]),
    dayStartTimes: z
      .record(z.string().regex(/^[0-6]$/), z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/))
      .optional(),
    days: z.enum(["weekdays", "weekends", "flexible"]),
    startDate: calendarDateSchema,
    completed: z.array(calendarDateSchema).max(1000),
    shortSessions: z.boolean().optional(),
    flightPlan: z.array(segmentSchema).max(40).optional(),
    plan: z.object({ plan: savedPlanSchema, provider: z.string().max(80) }).optional(),
  })
  .refine(
    ({ completed }) => new Set(completed).size === completed.length,
    "Completed sessions must have unique dates",
  )
