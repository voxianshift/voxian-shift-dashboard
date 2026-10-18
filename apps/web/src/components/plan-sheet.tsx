"use client"

import { useState } from "react"
import { Roadmap } from "@/components/navigator-plan-view"
import { useNavigator } from "@/components/navigator-provider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import type { Commitment } from "@/lib/commitment"

/** Bottom sheet with the saved full plan; shared by Navigator canvas and Progress. */
export function PlanSheet({
  open,
  onOpenChange,
  commitment,
  onCommitmentChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  commitment: Commitment | null
  onCommitmentChange: (commitment: Commitment) => void
}) {
  const { data, profileKey } = useNavigator()
  const [planPhase, setPlanPhase] = useState(0)
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="data-[side=bottom]:h-[92dvh] gap-0 rounded-t-xl [--border:color-mix(in_srgb,var(--foreground)_20%,var(--background))]"
      >
        <SheetHeader className="shrink-0 border-b pr-14">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SheetTitle>Your full plan</SheetTitle>
            {commitment?.plan && (
              <Select
                value={String(Math.min(planPhase, commitment.plan.plan.phases.length - 1))}
                onValueChange={(value) => {
                  setPlanPhase(Number(value))
                  document.getElementById("flight-plan")?.scrollIntoView({ block: "start" })
                }}
              >
                <SelectTrigger
                  aria-label="Navigate plan phase"
                  className="w-full sm:w-auto sm:max-w-[280px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {commitment.plan.plan.phases.map((phase, index) => (
                    <SelectItem key={index} value={String(index)}>
                      Phase 0{index + 1} · {phase.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <SheetDescription>
            Review your phases, daily tasks, milestones and learning resources.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {commitment?.plan && data && (
            <Roadmap
              data={data}
              requestedPath={commitment.pathId}
              requestedRole={
                commitment.role === null
                  ? null
                  : String(
                      data.paths
                        .find((path) => path.id === commitment.pathId)
                        ?.roles.indexOf(commitment.role),
                    )
              }
              profileKey={profileKey}
              savedCommitment={commitment}
              phaseIndex={planPhase}
              onPhaseChange={setPlanPhase}
              onAttendanceChange={onCommitmentChange}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
