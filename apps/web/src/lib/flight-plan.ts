import type { CareerPath } from "@voxian/shared"

export type FlightSegment = { days: string; focus: string; module?: string }

export { learningPhases } from "@voxian/shared"
import { planPhaseRanges } from "@voxian/shared"
export function phaseRanges(sprint: boolean) {
  return planPhaseRanges(sprint ? 90 : 120)
}

/** Flight plan shown before a plan is generated: each phase splits into a learn half and an apply half. */
export function defaultFlightPlan(
  sprint: boolean,
  path: CareerPath,
  targetRoles: string[],
  courses: string[],
): FlightSegment[][] {
  const steps = [
    [
      "Map your current tasks and note where AI tools help and where they fall short.",
      path.firstStep,
    ],
    [
      `Build the skills your bridge project needs: ${path.skills.slice(0, 2).join(" and ")}.`,
      path.project,
    ],
    [
      "Turn your project into evidence: a short write-up of the problem, results and what you would improve.",
      `Talk to people working as ${targetRoles.join(", ")}. Check entry requirements and collect feedback before deciding.`,
    ],
    [
      "Review your sample with a practitioner and document limitations.",
      "Choose a next step based on feedback, without assuming promotion or employment.",
    ],
  ]
  return phaseRanges(sprint).map(([start, end], phase) => {
    const mid = Math.floor((start + end) / 2)
    return [
      { days: `D${start}–D${mid}`, focus: steps[phase]![0]!, module: courses[phase * 2] },
      // The last window is for conversations, not study.
      {
        days: `D${mid + 1}–D${end}`,
        focus: steps[phase]![1]!,
        module: phase < 2 ? courses[phase * 2 + 1] : undefined,
      },
    ]
  })
}
