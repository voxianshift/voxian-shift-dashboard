import { z } from "zod"
import { profileSchema, type CareerProfile } from "./onboarding.ts"
import { occupationCode, occupationCodeSchema } from "./occupations.ts"

export const navigatorContextSchema = profileSchema.omit({
  preferredName: true,
  occupationNames: true,
})
export function navigatorContext(profile: CareerProfile) {
  const context = navigatorContextSchema.strip().parse(profile)
  return {
    ...context,
    occupations: context.occupations.map(occupationCode),
    primaryOccupation: occupationCode(context.primaryOccupation),
  }
}

// Provider chooses IDs; URLs and credential labels always come from this reviewed list.
export const navigatorResources = {
  hubspot: {
    title: "Service Hub Software Certification",
    provider: "HubSpot Academy",
    type: "Certification",
    note: "Service workflows, feedback and reporting. Check software access requirements for practical exercises.",
    href: "https://academy.hubspot.com/courses/hubspot-service-software",
  },
  crm: {
    title: "Salesforce CRM Basics",
    provider: "Salesforce Trailhead",
    type: "Learning module",
    note: "Learn customer relationship systems. A learning badge is not a professional certification.",
    href: "https://trailhead.salesforce.com/content/learn/modules/lex_implementation_basics/lex_implementation_basics_welcome",
  },
  automate: {
    title: "Get started with Power Automate",
    provider: "Microsoft Learn",
    type: "Learning module",
    note: "Basic workflows. Exercises require Power Automate and a work or school OneDrive account.",
    href: "https://learn.microsoft.com/en-us/training/modules/get-started-flows/",
  },
  aigp: {
    title: "Artificial Intelligence Governance Professional (AIGP)",
    provider: "IAPP",
    type: "Certification",
    note: "Professional exam. Review current fees, eligibility and maintenance requirements.",
    href: "https://iapp.org/certify/aigp",
  },
  governance: {
    title: "AIGP training",
    provider: "IAPP",
    type: "Course",
    note: "Governance training. Training and certification are separate; check current fees.",
    href: "https://www.iapp.org/train/aigp-training",
  },
  nist: {
    title: "AI Risk Management Framework",
    provider: "NIST",
    type: "Reference",
    note: "Framework for AI evaluation and risk management. No certification is awarded.",
    href: "https://www.nist.gov/itl/ai-risk-management-framework",
  },
  web: {
    title: "Learn web development",
    provider: "MDN",
    type: "Learning programme",
    note: "Frontend development tutorials and practice. Not a professional certification.",
    href: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
  },
  ml: {
    title: "Machine Learning Crash Course",
    provider: "Google for Developers",
    type: "Course",
    note: "Machine learning concepts and exercises. Check prerequisites before starting.",
    href: "https://developers.google.com/machine-learning/crash-course",
  },
  learn: {
    title: "Microsoft Learn training catalogue",
    provider: "Microsoft Learn",
    type: "Course catalogue",
    note: "Browse role-specific learning paths. Course completion and certification are separate.",
    href: "https://learn.microsoft.com/en-us/training/",
  },
} as const
export const pathIdSchema = z.enum(["advocate", "operations", "quality"])
const text = (max: number) => z.string().trim().min(1).max(max)
const pathFields = {
  id: pathIdSchema,
  title: text(100),
  focus: text(80),
  description: text(500),
  why: text(350),
  skills: z.array(text(100)).min(3).max(5),
  roles: z
    .array(text(120))
    .length(3)
    .refine((roles) => new Set(roles.map((role) => role.toLowerCase())).size === 3),
  project: text(500),
  firstStep: text(300),
}
const resourceIdSchema = z.enum(
  Object.keys(navigatorResources) as [
    keyof typeof navigatorResources,
    ...(keyof typeof navigatorResources)[],
  ],
)
export const navigatorDraftSchema = z
  .object({
    summary: text(500),
    recommendedPathId: pathIdSchema,
    paths: z
      .array(z.object({ ...pathFields, resourceIds: z.array(resourceIdSchema).min(1).max(3) }))
      .length(3),
  })
  .refine((data) => new Set(data.paths.map((path) => path.id)).size === 3)
const resourceSchema = z
  .object({
    title: text(180),
    provider: text(100),
    type: text(60),
    note: text(350),
    href: z.string().url(),
  })
  .refine((resource) =>
    Object.values(navigatorResources).some((known) => known.href === resource.href),
  )
export const careerPathSchema = z.object({
  ...pathFields,
  color: z.string().max(40),
  resources: z.array(resourceSchema).min(1).max(3),
})
export const navigatorResultSchema = z
  .object({
    roleTitle: text(200),
    occupationCode: occupationCodeSchema,
    summary: text(500),
    recommendedPathId: pathIdSchema,
    provider: text(80),
    paths: z.array(careerPathSchema).length(3),
  })
  .refine((data) => new Set(data.paths.map((path) => path.id)).size === 3)
export type CareerPath = z.infer<typeof careerPathSchema>
export type NavigatorResult = z.infer<typeof navigatorResultSchema>
