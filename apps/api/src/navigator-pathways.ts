import { z } from "zod"
import {
  pathIdSchema,
  occupationCodeSchema,
  navigatorDestinationSchema,
  type StrategyId,
} from "@voxian/shared"
import families from "../data/navigator-families.json" with { type: "json" }
import data from "../data/navigator-pathways.json" with { type: "json" }

const pathwaySchema = z.object({
  title: z.string().min(1).max(100),
  orientation: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(1000),
  humanEdge: z.string().min(1).max(500),
  skills: z.array(z.string().min(1).max(100)).min(3).max(5),
  firstStep: z.string().min(1).max(300),
  destinations: z.array(navigatorDestinationSchema).min(1),
})
const roleSchema = z.object({
  prototypeRole: z.string(),
  sourceTitle: z.string(),
  sourceIsco: z.string(),
  sourceBand: z.enum(["G1", "G2", "G3", "G4"]),
  sourceAutomationScore: z.number().min(0).max(100),
  strategies: z.object({
    automate: pathwaySchema,
    hybrid: pathwaySchema,
    pivot: pathwaySchema,
    create: pathwaySchema,
  }),
})
const occupationsSchema = z.record(occupationCodeSchema, roleSchema)
const catalogue = z
  .object({
    version: z.string(),
    source: z.string(),
    reviewNotes: z.string(),
    occupations: occupationsSchema,
    unmappedRoles: z.record(z.string(), roleSchema),
    sourceSha256: z.string().length(64),
  })
  .parse(data)
// Search requires a reviewed O*NET mapping; unmapped source roles remain preserved separately.
export const curatedOccupationCodes = Object.keys(catalogue.occupations)
export const unmappedRoleLibrary = catalogue.unmappedRoles

export const pathwayVersion = `${catalogue.version}+${curatedOccupationCodes.length}-curated+${families.version}`
export const pathwaySource = catalogue.source
export function lookupPathways(occupationCode: string) {
  if (!occupationCodeSchema.safeParse(occupationCode).success) return {}
  const familyCode = occupationCode.slice(0, 2)
  const family = families.families[familyCode as keyof typeof families.families]
  const exact = catalogue.occupations[occupationCode]?.strategies ?? {}
  if (!family) return exact
  const fallback = Object.fromEntries(
    pathIdSchema.options.map((id) => {
      const template = families.strategies[id]
      return [
        id,
        {
          title: `${family} · ${template.title}`,
          description: template.description,
          humanEdge: template.humanEdge,
          skills: template.skills,
          firstStep: template.firstStep,
          destinations: template.options.map((option, index) => ({
            id: `family-${occupationCode}-${id}-${index + 1}`,
            title: `${family} · ${option}`,
            kind: "curated_pathway",
            occupationCode: null,
          })),
        },
      ]
    }),
  )
  return z.partialRecord(pathIdSchema, pathwaySchema).parse({ ...fallback, ...exact })
}
export function pathwayLevel(occupationCode: string, strategy: StrategyId) {
  return catalogue.occupations[occupationCode]?.strategies[strategy] ? "occupation" : "family"
}
export function pathwaySourceFor(occupationCode: string, strategy: StrategyId) {
  return catalogue.occupations[occupationCode]?.strategies[strategy]
    ? pathwaySource
    : families.source
}
export function pathwayRationale(strategy: StrategyId, occupationCode?: string) {
  if (occupationCode && !catalogue.occupations[occupationCode]?.strategies[strategy])
    return "Family-level exploration template, not an occupation-specific destination match. Validate task relevance, prerequisites and permitted scope; lower exposure, transferability and market demand are unverified."
  return {
    automate:
      "Role library maps this occupation to workflow automation practice; validate technical prerequisites before a transition.",
    hybrid:
      "Role library maps this occupation to combining domain judgment with AI tools; this is an exploration pathway, not proven career fit.",
    pivot:
      "Role library proposes adjacent work drawing on domain knowledge; entry requirements and transferability need individual validation.",
    create:
      "Role library maps this occupation to roles creating new value in AI governance, ethics or oversight; requirements and fit need individual validation.",
  }[strategy]
}
