import { z } from "zod"
import { pathIdSchema, occupationCodeSchema, type StrategyId } from "@voxian/shared"
import data from "../data/navigator-pathways.json" with { type: "json" }

const pathwaySchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  humanEdge: z.string().min(1).max(500),
  skills: z.array(z.string().min(1).max(100)).min(3).max(5),
  firstStep: z.string().min(1).max(300),
  destinations: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        title: z.string().min(1).max(120),
        kind: z.literal("curated_pathway"),
        occupationCode: z.null(),
      }),
    )
    .min(1)
    .max(3),
})
const catalogue = z
  .object({
    version: z.string(),
    source: z.string(),
    reviewNotes: z.string(),
    occupations: z.record(
      occupationCodeSchema,
      z.object({
        prototypeRole: z.string(),
        strategies: z.partialRecord(pathIdSchema, pathwaySchema),
      }),
    ),
  })
  .parse(data)

export const pathwayVersion = catalogue.version
export const pathwaySource = catalogue.source
export function lookupPathways(occupationCode: string) {
  return catalogue.occupations[occupationCode]?.strategies ?? {}
}
export function pathwayRationale(strategy: StrategyId) {
  return {
    automate:
      "Prototype maps this occupation to workflow automation practice; validate technical prerequisites before a transition.",
    hybrid:
      "Prototype maps this occupation to combining domain judgment with AI tools; this is an exploration pathway, not proven career fit.",
    pivot:
      "Prototype proposes adjacent work drawing on domain knowledge; entry requirements and transferability need individual validation.",
    create:
      "The prototype proposes emerging responsibilities, including governance and ethics, as a curated Create pathway; validate requirements before a transition.",
  }[strategy]
}
