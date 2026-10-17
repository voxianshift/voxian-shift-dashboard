import { demoBaselines } from "@voxian/shared"
import { BRANCHES, TASKS } from "./mock"

// Curated prototype inputs, not official occupational scores.
export const occupationModels = [
  {
    id: "customer-support",
    title: "Customer Support Specialist",
    code: "ISCO-08 4222 · O*NET 43-4051.00",
    tasks: TASKS,
    escalationWeights: demoBaselines["customer-support"].escalationWeights,
    branches: BRANCHES,
  },
  {
    id: "administrative-assistant",
    title: "Administrative & Executive Assistant",
    code: "ISCO-08 4120 · O*NET 43-6011.00",
    tasks: demoBaselines["administrative-assistant"].tasks,
    escalationWeights: demoBaselines["administrative-assistant"].escalationWeights,
    branches: [
      {
        name: "Operations & Coordination",
        color: "bg-chart-3",
        roles: ["Workflow Coordinator", "Executive Operations Partner", "Chief of Staff"],
        fit: "Systems",
      },
      {
        name: "People & Workplace Experience",
        color: "bg-warning",
        roles: [
          "Stakeholder Coordinator",
          "Workplace Experience Lead",
          "People Operations Partner",
        ],
        fit: "Empathy",
      },
      {
        name: "Operations Quality & Governance",
        color: "bg-tertiary",
        roles: [
          "Process Quality Coordinator",
          "Compliance Operations Specialist",
          "Governance Lead",
        ],
        fit: "Governance",
      },
    ],
  },
] as const

// Shape the Meter renders: demo models above, or ISCO models built from ILO task scores
export type MeterModel = {
  id: string
  title: string
  code: string
  tasks: readonly { name: string; exposure: number; weight: number; moat: boolean }[]
  escalationWeights: readonly number[]
}

export function taskWeights(model: MeterModel, focus: string) {
  return model.tasks.map((task, i) =>
    focus === "escalations"
      ? model.escalationWeights[i]!
      : focus === "mixed"
        ? (task.weight + model.escalationWeights[i]!) / 2
        : task.weight,
  )
}
