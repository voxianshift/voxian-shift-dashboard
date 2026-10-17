import { z } from "zod"
import { profileSchema } from "./onboarding.ts"
import { occupationIdSchema } from "./occupations.ts"

export const copilotPickRoleActionSchema = z.strictObject({
  type: z.literal("PICK_TARGET_ROLE"),
  occupationId: occupationIdSchema,
  title: z.string().min(1).max(200),
  explanation: z.string().max(400).optional(),
})

export const copilotNavigateActionSchema = z.strictObject({
  type: z.literal("NAVIGATE"),
  href: z.string().min(1).max(100),
  label: z.string().min(1).max(100),
})

export const copilotActionSchema = z.discriminatedUnion("type", [
  copilotPickRoleActionSchema,
  copilotNavigateActionSchema,
])
export type CopilotAction = z.infer<typeof copilotActionSchema>

export const copilotProfileSchema = profileSchema.partial().strip().default({})

export const copilotChatRequestSchema = z.object({
  message: z.string().trim().min(1).max(3000),
  route: z.string().max(200).default("/home"),
  profile: copilotProfileSchema,
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(5000) }))
    .max(16)
    .default([]),
})
export type CopilotChatRequest = z.infer<typeof copilotChatRequestSchema>

export const copilotChatResultSchema = z.strictObject({
  reply: z.string().trim().min(1).max(4000),
  actions: z.array(copilotActionSchema).max(4).default([]),
  suggestedQuestions: z.array(z.string().max(120)).max(4).default([]),
})
export type CopilotChatResult = z.infer<typeof copilotChatResultSchema>
