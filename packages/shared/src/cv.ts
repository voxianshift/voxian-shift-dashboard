import { z } from "zod"
import { occupationMatchSchema } from "./occupations.ts"

const detail = z.string().trim().min(1).max(180)
export const cvExtractionSchema = z.strictObject({
  confidence: z.number().min(0).max(1),
  jobTitles: z.array(detail).max(6),
  skills: z.array(detail).max(20),
  workHistory: z
    .array(
      z.strictObject({
        title: detail,
        employerContext: z.string().trim().max(180),
        duties: z.array(detail).max(5),
      }),
    )
    .max(6),
  keywords: z.array(detail).max(24),
})
export const cvContextSchema = cvExtractionSchema.extend({
  confidence: z.number().min(0.6).max(1),
  jobTitles: z.array(detail).min(1).max(6),
  keywords: z.array(detail).min(1).max(24),
  reviewed: z.literal(true),
})
export const cvUploadResultSchema = z.discriminatedUnion("status", [
  z.strictObject({
    status: z.literal("ready"),
    extraction: cvContextSchema.omit({ reviewed: true }),
    occupations: z.array(occupationMatchSchema).max(3),
    provider: z.string().max(80),
  }),
  z.strictObject({
    status: z.literal("needs_review"),
    confidence: z.number().min(0).max(1),
    occupations: z.array(occupationMatchSchema).length(0),
    provider: z.string().max(80),
  }),
])
export type CvExtraction = z.infer<typeof cvExtractionSchema>
export type CvContext = z.infer<typeof cvContextSchema>
export type CvUploadResult = z.infer<typeof cvUploadResultSchema>

export function cvEvidence(cv?: CvContext | null): string[] {
  if (!cv?.reviewed || cv.confidence < 0.6) return []
  return [
    ...new Set([...cv.skills, ...cv.keywords, ...cv.workHistory.flatMap((job) => job.duties)]),
  ]
}

export const cvAssessmentSchema = z.strictObject({
  requirementId: z.string().min(1).max(80),
  status: z.enum(["supported", "related", "unsupported"]),
  evidence: z.string().max(180),
  reason: z.string().min(1).max(250),
})
export type CvAssessment = z.infer<typeof cvAssessmentSchema>
