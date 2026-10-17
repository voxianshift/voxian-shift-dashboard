"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { navigatorContext, navigatorResultSchema, type NavigatorResult } from "@voxian/shared"
import { useCareerProfile } from "@/components/career-profile-provider"
import { hasMeterInputs } from "@/lib/onboarding"

type NavigatorState = {
  key: string
  status: "loading" | "ready" | "error"
  data?: NavigatorResult
  error?: string
}
const NavigatorContext = createContext<{
  status: NavigatorState["status"] | "missing"
  data?: NavigatorResult
  error?: string
  profileKey: string
  retry: () => void
} | null>(null)
const storageKey = "voxian-navigator-v3"

export function NavigatorProvider({ children }: { children: ReactNode }) {
  const { profile, ready } = useCareerProfile()
  const valid = hasMeterInputs(profile)
  const context = navigatorContext(profile)
  const latest = JSON.stringify(context)
  // Weekly hours, flexibility and timeline shape the schedule and plan, not which directions fit,
  // so editing them (e.g. from the commit dialog) must not regenerate paths or remount the page.
  const key = JSON.stringify({ ...context, hours: "", flexibility: "", timeline: "" })
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<NavigatorState>({ key: "", status: "loading" })
  useEffect(() => {
    if (!ready || !valid) return
    const controller = new AbortController()
    async function load() {
      if (attempt === 0) {
        try {
          const cached = JSON.parse(sessionStorage.getItem(storageKey) ?? "null")
          if (cached?.key === key) {
            const data = navigatorResultSchema.parse(cached.data)
            if (data.occupationCode === JSON.parse(key).primaryOccupation) {
              setState({ key, status: "ready", data })
              return
            }
          }
        } catch {
          /* Ignore an unavailable or obsolete tab cache. */
        }
      }
      setState({ key, status: "loading" })
      try {
        const response = await fetch("/api/navigator/paths", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(65_000)]),
          body: JSON.stringify({ profile: JSON.parse(latest) }),
        })
        const body = await response.json()
        if (!response.ok)
          throw new Error(
            typeof body.error === "string"
              ? body.error.slice(0, 200)
              : "Your paths could not be loaded.",
          )
        const data = navigatorResultSchema.parse(body)
        if (data.occupationCode !== JSON.parse(key).primaryOccupation)
          throw new Error("Your profile changed. Try again.")
        if (controller.signal.aborted) return
        setState({ key, status: "ready", data })
        try {
          sessionStorage.setItem(storageKey, JSON.stringify({ key, data }))
        } catch {
          /* Paths remain available for this visit. */
        }
      } catch (error) {
        if (!controller.signal.aborted)
          setState({
            key,
            status: "error",
            error: error instanceof Error ? error.message : "Your paths could not be loaded.",
          })
      }
    }
    void load()
    return () => controller.abort()
  }, [key, ready, valid, attempt])
  const current = state.key === key ? state : { key, status: "loading" as const }
  return (
    <NavigatorContext.Provider
      value={{
        ...current,
        status: !ready ? "loading" : !valid ? "missing" : current.status,
        data: ready && valid ? current.data : undefined,
        profileKey: key,
        retry: () => setAttempt((value) => value + 1),
      }}
    >
      {children}
    </NavigatorContext.Provider>
  )
}

export function useNavigator() {
  const context = useContext(NavigatorContext)
  if (!context) throw new Error("Navigator provider missing")
  return context
}
