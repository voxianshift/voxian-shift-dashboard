"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  navigatorContext,
  navigatorResultSchema,
  type CareerProfile,
  type NavigatorResult,
} from "@voxian/shared"
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
const storageKey = "voxian-navigator-v3-cv-vector-active1-roles-v6"

function navigatorKeys(profile: CareerProfile) {
  const context = navigatorContext(profile)
  // Weekly hours, flexibility and timeline shape the schedule and plan, not which directions fit,
  // so editing them (e.g. from the commit dialog) must not regenerate paths or remount the page.
  return {
    key: JSON.stringify({ ...context, hours: "", flexibility: "", timeline: "" }),
    latest: JSON.stringify(context),
  }
}

// Shared across mounts so onboarding can start the request before the dashboard renders.
const pending = new Map<string, Promise<NavigatorResult>>()
function requestPaths(key: string, latest: string) {
  let request = pending.get(key)
  if (!request) {
    request = (async () => {
      const response = await fetch("/api/navigator/paths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(65_000),
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
      try {
        if (data.generationStatus !== "unavailable")
          sessionStorage.setItem(storageKey, JSON.stringify({ key, data }))
      } catch {
        /* Paths remain available for this visit. */
      }
      return data
    })()
    pending.set(key, request)
    // Failed or finished requests leave the map; the session cache serves later mounts.
    void request.catch(() => {}).finally(() => pending.delete(key))
  }
  return request
}

/** Start loading paths for a just-saved profile, e.g. while onboarding hands off to the dashboard. */
export function prefetchNavigator(profile: CareerProfile) {
  if (!hasMeterInputs(profile)) return
  const { key, latest } = navigatorKeys(profile)
  void requestPaths(key, latest).catch(() => {})
}

export function NavigatorProvider({ children }: { children: ReactNode }) {
  const { profile, ready } = useCareerProfile()
  const valid = hasMeterInputs(profile)
  const { key, latest } = navigatorKeys(profile)
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<NavigatorState>({ key: "", status: "loading" })
  useEffect(() => {
    if (!ready || !valid) return
    let active = true
    async function load() {
      if (attempt === 0) {
        try {
          const cached = JSON.parse(sessionStorage.getItem(storageKey) ?? "null")
          if (cached?.key === key && cached.data?.generationStatus !== "unavailable") {
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
        const data = await requestPaths(key, latest)
        if (active) setState({ key, status: "ready", data })
      } catch (error) {
        if (active)
          setState({
            key,
            status: "error",
            error: error instanceof Error ? error.message : "Your paths could not be loaded.",
          })
      }
    }
    void load()
    return () => {
      active = false
    }
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
