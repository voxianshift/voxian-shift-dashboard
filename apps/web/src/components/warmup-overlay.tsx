"use client"

import { useEffect, useState } from "react"
import { Check, Compass, Gauge, LoaderCircle, UserRound } from "lucide-react"
import { useCareerProfile } from "@/components/career-profile-provider"
import { useNavigator } from "@/components/navigator-provider"
import { prefetchProfileMeter } from "@/hooks/use-isco-meter"
import { cn } from "@/lib/utils"

/** Set by onboarding just before it routes into the dashboard. */
export const warmupFlag = "voxian-warmup"
const minimumStepMs = 900
const maximumMs = 75_000

const steps = [
  { label: "Reading your profile", icon: UserRound },
  { label: "Personalising your AI exposure", icon: Gauge },
  { label: "Navigating your career paths", icon: Compass },
] as const

/**
 * Centered loader after onboarding: holds the dashboard until the Meter model and Navigator
 * paths are fetched, so Meter, Curve and Navigator open ready. Pages read the same caches.
 */
export function WarmupOverlay() {
  const { profile, ready } = useCareerProfile()
  const navigator = useNavigator()
  const [active, setActive] = useState(false)
  const [meterDone, setMeterDone] = useState(false)
  const [shown, setShown] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(warmupFlag) !== "1") return
      sessionStorage.removeItem(warmupFlag)
    } catch {
      return
    }
    setActive(true)
    const timeout = setTimeout(() => setLeaving(true), maximumMs)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (!active || !ready) return
    void prefetchProfileMeter(profile).then(() => setMeterDone(true))
  }, [active, ready, profile])

  const done = [ready, meterDone, navigator.status !== "loading"]
  // Reveal completed steps one at a time so each stage is readable, even when data is cached.
  useEffect(() => {
    if (!active || leaving || !done[shown]) return
    const timer = setTimeout(() => setShown((count) => count + 1), minimumStepMs)
    return () => clearTimeout(timer)
  })
  useEffect(() => {
    if (shown < steps.length) return
    const timer = setTimeout(() => setLeaving(true), 600)
    return () => clearTimeout(timer)
  }, [shown])
  useEffect(() => {
    if (!leaving) return
    const timer = setTimeout(() => setActive(false), 400)
    return () => clearTimeout(timer)
  }, [leaving])

  if (!active) return null
  const name = profile.preferredName?.trim()
  const pathsFailed = navigator.status === "error"
  const CurrentIcon = shown < steps.length ? steps[shown]!.icon : Check
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Preparing your workspace"
      className={cn(
        "fixed inset-0 z-50 grid place-items-center bg-background/95 p-4 backdrop-blur-sm transition-opacity duration-400",
        leaving && "opacity-0",
      )}
    >
      <div className="w-full max-w-sm text-center">
        <div className="relative mx-auto size-20">
          <span className="absolute inset-0 animate-ping rounded-full bg-foreground/10 motion-reduce:animate-none" />
          <span className="absolute inset-2 rounded-full border border-foreground/20" />
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-foreground motion-reduce:animate-none [animation-duration:1.4s]" />
          <CurrentIcon className="absolute inset-0 m-auto size-7" strokeWidth={1.5} />
        </div>
        <h2 className="mt-6 text-[22px] tracking-[-0.5px]">
          {shown < steps.length
            ? name
              ? `Setting things up for you, ${name}`
              : "Setting up your workspace"
            : "You're all set"}
        </h2>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Meter, Curve and Navigator will open ready.
        </p>
        <ol className="mt-6 space-y-2.5 text-left">
          {steps.map((step, index) => {
            const complete = index < shown
            const current = index === shown
            return (
              <li
                key={step.label}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-4 py-3 text-[14px] transition-all duration-500",
                  complete && "border-foreground/30",
                  !complete && !current && "opacity-40",
                )}
              >
                {complete ? (
                  <Check className="size-4 shrink-0" />
                ) : current ? (
                  <LoaderCircle className="size-4 shrink-0 animate-spin motion-reduce:animate-none" />
                ) : (
                  <span className="size-4 shrink-0 rounded-full border" />
                )}
                <span className="flex-1">{step.label}</span>
                {complete && index === 2 && pathsFailed && (
                  <span className="text-[12px] text-muted-foreground">Retry in Navigator</span>
                )}
              </li>
            )
          })}
        </ol>
        <div className="mt-5 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground transition-[width] duration-700"
            style={{ width: `${(shown / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
