import { navigatorResources, type NavigatorResult } from "@voxian/shared"

export const navigatorFixture: NavigatorResult = {
  roleTitle: "Software Developers",
  occupationCode: "15-1252.00",
  summary: "Options based on software development and limited weekly study time.",
  recommendedPathId: "operations",
  provider: "Test provider",
  paths: (
    [
      ["advocate", "Technical Product Collaboration"],
      ["operations", "Developer Tooling & Automation"],
      ["quality", "Software Quality & AI Evaluation"],
    ] as const
  ).map(([id, title]) => ({
    id,
    title,
    focus: "Transfer software experience",
    color: "var(--ring)",
    description: "Use development experience to improve real software outcomes.",
    why: "Builds on coding skills while respecting limited weekly time.",
    skills: ["Testing", "Communication", "Workflow design"],
    roles: [`${title} Specialist`, `${title} Analyst`, `${title} Engineer`],
    project: "Build a small reviewable software tool using synthetic data.",
    firstStep: "Map one recurring development task and its review checkpoints.",
    resources: [navigatorResources.web, navigatorResources.learn],
    roleResources: [
      [navigatorResources.istqb],
      [navigatorResources.kaggle, navigatorResources.web],
      [navigatorResources.sre],
    ],
  })),
}
