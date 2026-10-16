import { z } from "zod"

export const occupationCodeSchema = z.string().regex(/^\d{2}-\d{4}\.\d{2}$/)
export const occupationIdSchema = z.union([
  occupationCodeSchema,
  z.enum(["customer-support", "administrative-assistant"]),
])
export const occupationMatchSchema = z.object({
  code: occupationCodeSchema,
  title: z.string().max(200),
  description: z.string().max(2000),
  category: z.string().max(200),
  sourceVersion: z.string().max(20),
  baselineId: z.enum(["customer-support", "administrative-assistant"]).nullable(),
  reason: z.string().max(300),
  /** 0–100: how closely the query matches titles and tasks (relevance, not a probability) */
  match: z.number().int().min(0).max(100).optional(),
})
export type OccupationMatch = z.infer<typeof occupationMatchSchema>
export const occupationSearchSchema = z.object({
  occupations: z.array(occupationMatchSchema).max(10),
})
export const occupationSelectionSchema = z.object({
  occupations: z.array(occupationMatchSchema).max(5),
  primaryOccupation: z.union([occupationCodeSchema, z.literal("")]),
})
export function occupationCode(id: string): string {
  return id === "customer-support"
    ? "43-4051.00"
    : id === "administrative-assistant"
      ? "43-6011.00"
      : id
}
export function baselineIdForOccupation(id: string) {
  const code = occupationCode(id)
  return code === "43-4051.00"
    ? "customer-support"
    : code === "43-6011.00"
      ? "administrative-assistant"
      : null
}
