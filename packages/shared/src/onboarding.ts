import { occupationIdSchema, occupationMatchSchema } from "./occupations.ts"
import { z } from "zod"
import { cvContextSchema } from "./cv.ts"

const answer = z.string().max(800)
export const profileSchema = z.strictObject({
  preferredName: answer.max(80),
  currentWork: answer,
  occupations: z.array(occupationIdSchema).max(5),
  primaryOccupation: z.union([occupationIdSchema, z.literal("")]),
  occupationNames: z
    .record(occupationIdSchema, z.string().max(200))
    .refine((names) => Object.keys(names).length <= 5)
    .default({}),
  taskFocus: z.enum(["", "routine", "escalations", "mixed"]),
  strengths: z.array(answer).max(8),
  direction: answer.describe(
    "Desired career move only, such as stay and adapt or change careers. Not outcomes like stability or pay.",
  ),
  hours: answer,
  flexibility: answer,
  timeline: answer,
  risk: answer,
  goals: z
    .array(answer)
    .max(8)
    .describe(
      "Explicit desired outcomes: stability, better pay, meaningful work, flexibility, or progression.",
    ),
  anxieties: answer,
  cvContext: cvContextSchema.nullable().optional(),
})
export type CareerProfile = z.infer<typeof profileSchema>
export type ProfileField = Exclude<keyof CareerProfile, "cvContext">
export const emptyProfile: CareerProfile = {
  preferredName: "",
  currentWork: "",
  occupations: [],
  primaryOccupation: "",
  occupationNames: {},
  taskFocus: "",
  strengths: [],
  direction: "",
  hours: "",
  flexibility: "",
  timeline: "",
  risk: "",
  goals: [],
  anxieties: "",
}
export const profilePatchSchema = profileSchema.omit({ cvContext: true }).partial()
export const chatResultSchema = z.strictObject({
  reply: z.string().trim().min(1).max(1200),
  updates: profilePatchSchema,
  occupationSuggestions: z.array(occupationMatchSchema).max(3).optional(),
})
export const chatRequestSchema = z.strictObject({
  message: z.string().trim().min(1).max(2000),
  profile: profileSchema.omit({ cvContext: true }).strip(),
  question: z.string().max(100),
  history: z
    .array(z.strictObject({ role: z.enum(["user", "assistant"]), text: z.string().max(2000) }))
    .max(12),
})
