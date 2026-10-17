import type { CareerPath } from "@voxian/shared"

export type FlightSegment = { days: string; focus: string; module?: string }

const ranges = {
  lean: [
    [1, 30],
    [31, 75],
    [76, 120],
  ],
  sprint: [
    [1, 20],
    [21, 55],
    [56, 90],
  ],
} as const

export function phaseRanges(sprint: boolean) {
  return ranges[sprint ? "sprint" : "lean"]
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
