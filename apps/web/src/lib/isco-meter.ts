import { z } from "zod"
import type { MeterModel } from "./occupations"

export const iscoMeterSchema = z.object({
  isco: z.string().regex(/^\d{4}$/),
  iscoTitle: z.string().min(1),
  gradient: z.string().min(1),
  crosswalk: z.object({ escoTitle: z.string(), match: z.string().min(1) }),
  tasks: z.array(z.object({ task: z.string().min(1), exposure: z.number().min(0).max(1) })).min(1),
})

export type IscoMeterModel = MeterModel & {
  gradient: string
  crosswalkMatch: string
  mappingNote: string
  isco: string
  iscoTitle: string
}

export function iscoMeterModel(input: unknown, code: string, title: string): IscoMeterModel {
  const data = iscoMeterSchema.parse(input)
  // ILO publishes task scores without task weights; both screens use equal weights.
  const weight = 1 / data.tasks.length
  return {
    id: "isco",
    title: title || data.iscoTitle,
    code: `ISCO-08 ${data.isco} · O*NET ${code}`,
    gradient: data.gradient,
    crosswalkMatch: data.crosswalk.match,
    mappingNote: data.crosswalk.escoTitle,
    isco: data.isco,
    iscoTitle: data.iscoTitle,
    tasks: data.tasks.map((task) => ({
      name: task.task,
      exposure: task.exposure,
      weight,
      moat: task.exposure < 0.5,
    })),
    escalationWeights: data.tasks.map(() => weight),
  }
}
