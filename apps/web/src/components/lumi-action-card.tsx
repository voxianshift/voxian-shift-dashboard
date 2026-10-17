"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, Compass, Sparkles } from "lucide-react"
import { toast } from "sonner"
import type { CopilotAction } from "@voxian/shared"
import { useCareerProfile } from "@/components/career-profile-provider"
import { Button } from "@/components/ui/button"

export function LumiActionCard({ action }: { action: CopilotAction }) {
  const { profile, update } = useCareerProfile()
  const [applied, setApplied] = useState(false)

  if (action.type === "PICK_TARGET_ROLE") {
    const isCurrentPrimary = profile.primaryOccupation === action.occupationId || applied

    const handleSelectRole = () => {
      update({
        primaryOccupation: action.occupationId,
        occupations: Array.from(new Set([action.occupationId, ...profile.occupations])),
        occupationNames: {
          ...profile.occupationNames,
          [action.occupationId]: action.title,
        },
      })
      setApplied(true)
      toast.success(`Target role updated to ${action.title}`)
    }

    return (
      <div className="mt-2.5 rounded-lg border border-border/80 bg-card p-3 shadow-xs">
        <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-primary">
          <Sparkles className="size-3" />
          <span>SUGGESTED TARGET ROLE</span>
        </div>
        <div className="mt-1 font-semibold text-[14px] text-foreground">{action.title}</div>
        {action.explanation && (
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            {action.explanation}
          </p>
        )}
        <div className="mt-2.5 flex items-center justify-between">
          <span className="font-mono text-[11px] text-muted-foreground">{action.occupationId}</span>
          <Button
            size="sm"
            variant={isCurrentPrimary ? "secondary" : "default"}
            disabled={isCurrentPrimary}
            onClick={handleSelectRole}
            className="h-7 gap-1 px-2.5 text-[12px]"
          >
            {isCurrentPrimary ? (
              <>
                <Check className="size-3" /> Selected
              </>
            ) : (
              "Set as Target"
            )}
          </Button>
        </div>
      </div>
    )
  }

  if (action.type === "NAVIGATE") {
    return (
      <div className="mt-2 rounded-lg border border-border/80 bg-card p-2.5 shadow-xs">
        <Link
          href={action.href}
          className="flex items-center justify-between text-[13px] font-medium text-foreground hover:text-primary transition-colors"
        >
          <span className="flex items-center gap-2">
            <Compass className="size-3.5 text-muted-foreground" />
            {action.label}
          </span>
          <ArrowRight className="size-3.5 text-muted-foreground" />
        </Link>
      </div>
    )
  }

  return null
}
