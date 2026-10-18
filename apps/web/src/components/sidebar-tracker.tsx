"use client"

import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"
import { AlertTriangle, Check, Lock } from "lucide-react"
import { useCareerProfile } from "@/components/career-profile-provider"
import { Button } from "@/components/ui/button"
import {
  commitmentChanged,
  countdown,
  loadCommitment,
  planBoard,
  saveCommitment,
  sessionState,
  toggledCommitment,
  withProfile,
  type Commitment,
} from "@/lib/commitment"
import { eyebrow } from "@/lib/styles"

const clock = (date: Date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`

/** Plan progress, countdown and a quick log button; shows `fallback` until a plan exists. */
export function SidebarTracker({
  collapsed,
  fallback,
}: {
  collapsed: boolean
  fallback: ReactNode
}) {
  const { profile } = useCareerProfile()
  const [saved, setSaved] = useState<Commitment | null>(null)
  const [now, setNow] = useState<Date | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)
  useEffect(() => {
    let active = true
    const reload = () =>
      void loadCommitment()
        .then((commitment) => {
          if (active) setSaved(commitment)
        })
        .catch(() => {
          /* The tracker is optional; Progress shows load errors. */
        })
    reload()
    window.addEventListener(commitmentChanged, reload)
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => {
      active = false
      window.removeEventListener(commitmentChanged, reload)
      clearInterval(id)
    }
  }, [])
  if (!saved?.plan || !now) return collapsed ? null : fallback

  const commitment = withProfile(saved, profile)
  const session = sessionState(commitment, now)
  const { phases } = planBoard(commitment, session.today)
  const phase =
    phases.find((item) => item.status === "inProgress") ??
    (session.dayNumber === 0 ? phases[0] : phases.at(-1))
  const percent = phase?.total ? Math.round((phase.done / phase.total) * 100) : 0
  const phaseLabel = phase ? `Phase 0${phase.index + 1}` : "Plan"
  const timing = session.current
    ? `Session now · ends ${clock(session.current.end)}`
    : session.next
      ? `Next in ${countdown(session.next.start.getTime() - now.getTime())}`
      : null

  async function log() {
    const next = toggledCommitment(commitment, session.today, session.today)
    if (saving || !next) return
    setSaving(true)
    setError(false)
    try {
      await saveCommitment(next)
    } catch {
      setError(true)
    } finally {
      setSaving(false)
    }
  }
  const logIcon = session.canLog ? <Check /> : <Lock />

  if (collapsed)
    return (
      <div className="flex flex-col items-center gap-2">
        <Link
          href="/progress"
          aria-label={`${phaseLabel}: ${phase?.done ?? 0} of ${phase?.total ?? 0} sessions`}
          title={`${phaseLabel} · ${phase?.done ?? 0}/${phase?.total ?? 0}${timing ? ` · ${timing}` : ""}`}
          className="relative grid size-9 place-items-center"
        >
          <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" className="stroke-muted" />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${percent} 100`}
              className="stroke-foreground"
            />
          </svg>
          <span className="font-mono text-[10px]">{percent}%</span>
          {session.missed.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-destructive" />
          )}
        </Link>
        <Button
          size="icon"
          variant={session.todayDay?.done ? "outline" : "default"}
          className="size-8"
          disabled={saving || !session.canLog}
          aria-label={session.logLabel}
          title={session.logLabel}
          onClick={log}
        >
          {logIcon}
        </Button>
      </div>
    )

  return (
    <section aria-label="Plan progress" className="border bg-background p-3">
      <p className={eyebrow}>
        {phaseLabel}
        {phase ? ` · ${phase.title}` : ""}
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={phase?.total ?? 0}
        aria-valuenow={phase?.done ?? 0}
        aria-label={`${phaseLabel} sessions logged`}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full bg-foreground" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1.5 font-mono text-[12px] text-muted-foreground">
        {phase?.done ?? 0}/{phase?.total ?? 0} sessions
        {session.dayNumber > 0 && session.dayNumber <= session.days.length
          ? ` · Day ${session.dayNumber}/${session.days.length}`
          : ""}
      </p>
      {timing && (
        <p className="mt-2 font-mono text-[13px]" aria-live="off">
          {timing}
        </p>
      )}
      {!session.current && session.next && (
        <p className="text-[12px] text-muted-foreground">{session.next.label}</p>
      )}
      {session.missed.length > 0 && (
        <Link
          href="/progress?tab=missed"
          className="mt-2 flex items-center gap-1.5 text-[12px] text-destructive underline-offset-4 hover:underline"
        >
          <AlertTriangle className="size-3.5" /> {session.missed.length} missed · catch up
        </Link>
      )}
      <Button
        size="sm"
        variant={session.todayDay?.done ? "outline" : "default"}
        className="mt-3 w-full"
        disabled={saving || !session.canLog}
        onClick={log}
      >
        {logIcon} {saving ? "Saving…" : session.logLabel}
      </Button>
      {error && (
        <p role="alert" className="mt-1.5 text-[12px] text-destructive">
          Couldn’t save. Try again.
        </p>
      )}
    </section>
  )
}
