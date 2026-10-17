"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Check, Clock, Compass, Route, Sparkles } from "lucide-react"
import { toast } from "sonner"
import type { CopilotAction } from "@voxian/shared"
import { useCareerProfile } from "@/components/career-profile-provider"
import { Button } from "@/components/ui/button"

export function LumiActionCard({ action }: { action: CopilotAction }) {
  const router = useRouter()
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

  if (action.type === "SELECT_STRATEGY") {
    const handleSelectStrategy = () => {
      setApplied(true)
      toast.success(`Strategy ${action.strategy.toUpperCase()} activated`)
      router.push(`/roadmap?strategy=${action.strategy}`)
    }

    return (
      <div className="mt-2.5 rounded-lg border border-cyan-500/40 bg-card p-3 shadow-xs">
        <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-cyan-600 dark:text-cyan-400">
          <Route className="size-3" />
          <span>CAREER PATHWAY STRATEGY</span>
        </div>
        <div className="mt-1 font-semibold text-[14px] text-foreground">{action.label}</div>
        {action.explanation && (
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            {action.explanation}
          </p>
        )}
        <div className="mt-2.5 flex items-center justify-between">
          <span className="font-mono uppercase text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">
            {action.strategy}
          </span>
          <Button
            size="sm"
            variant={applied ? "secondary" : "default"}
            disabled={applied}
            onClick={handleSelectStrategy}
            className="h-7 gap-1 px-2.5 text-[12px]"
          >
            {applied ? (
              <>
                <Check className="size-3" /> Activated
              </>
            ) : (
              "Activate Pathway"
            )}
          </Button>
        </div>
      </div>
    )
  }

  if (action.type === "UPDATE_STUDY_HOURS") {
    const isCurrentHours = profile.hours === action.hours || applied

    const handleApplyHours = () => {
      update({ hours: action.hours })
      setApplied(true)
      toast.success(`Study commitment set to ${action.hours}/week`)
    }

    return (
      <div className="mt-2.5 rounded-lg border border-border/80 bg-card p-3 shadow-xs">
        <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-primary">
          <Clock className="size-3" />
          <span>STUDY COMMITMENT</span>
        </div>
        <div className="mt-1 font-semibold text-[14px] text-foreground">
          {action.hours} per week
        </div>
        {action.explanation && (
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            {action.explanation}
          </p>
        )}
        <div className="mt-2.5 flex justify-end">
          <Button
            size="sm"
            variant={isCurrentHours ? "secondary" : "default"}
            disabled={isCurrentHours}
            onClick={handleApplyHours}
            className="h-7 gap-1 px-2.5 text-[12px]"
          >
            {isCurrentHours ? (
              <>
                <Check className="size-3" /> Applied
              </>
            ) : (
              "Apply Commitment"
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
