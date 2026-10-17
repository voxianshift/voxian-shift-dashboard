"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { occupationSelectionSchema, profileStateSchema, type ProfileState } from "@voxian/shared"
import {
  emptyProfile,
  mergeProfile,
  hasMeterInputs,
  hasScheduleAnswers,
  type CareerProfile,
} from "@/lib/onboarding"
import { guestRequest } from "@/lib/guest-data"

const blank: ProfileState = {
  profile: emptyProfile,
  confirmed: false,
  onboardingComplete: false,
  skipped: [],
}
const storageKey = "voxian-career-profile-v1"
const ProfileContext = createContext<{
  profile: CareerProfile
  confirmed: boolean
  onboardingComplete: boolean
  completeOnboarding: (profile: CareerProfile) => Promise<boolean>
  skipped: string[]
  ready: boolean
  storageAvailable: boolean
  saveOccupations: (profile: CareerProfile) => Promise<CareerProfile>
  update: (patch: Partial<CareerProfile>) => void
  skip: (field: string) => void
  confirm: (patch?: Partial<CareerProfile>) => boolean
  reset: (scope: "profile" | "all") => Promise<void>
} | null>(null)

export function CareerProfileProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProfileState>(blank)
  const current = useRef(state)
  const queue = useRef<Promise<unknown>>(Promise.resolve())
  const saved = useRef("")
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)
  const [saving, setSaving] = useState(false)
  const resetting = useRef(false)

  function replace(next: ProfileState) {
    current.current = next
    setState(next)
  }
  function persist(next: ProfileState) {
    if (timer.current) clearTimeout(timer.current)
    const task = queue.current
      .catch(() => {})
      .then(async () => {
        setSaving(true)
        try {
          const result = await guestRequest("profile", "PUT", next)
          const stored = profileStateSchema.parse(result.state)
          saved.current = JSON.stringify(next)
          setError("")
          return stored
        } catch (failure) {
          setError("Changes aren’t saved yet. Check your connection and retry.")
          throw failure
        } finally {
          setSaving(false)
        }
      })
    queue.current = task
    return task
  }

  useEffect(() => {
    let active = true
    async function restore() {
      try {
        const result = await guestRequest("profile")
        let restored: ProfileState | null =
          result.state === null ? null : profileStateSchema.parse(result.state)
        if (!restored) {
          try {
            const local = sessionStorage.getItem(storageKey)
            if (local) {
              const parsed = profileStateSchema.safeParse(JSON.parse(local))
              if (parsed.success) restored = parsed.data
            }
          } catch {
            /* Browser storage is optional; Postgres remains the source of truth. */
          }
          if (!restored?.profile.occupations.length) {
            const response = await fetch("/api/onboarding/occupations", {
              cache: "no-store",
              signal: AbortSignal.timeout(10_000),
            })
            if (!response.ok) throw new Error("Saved occupations unavailable")
            const roles = occupationSelectionSchema.parse(await response.json())
            restored = {
              ...(restored ?? blank),
              profile: mergeProfile(restored?.profile ?? emptyProfile, {
                occupations: roles.occupations.map((role) => role.code),
                primaryOccupation: roles.primaryOccupation,
                occupationNames: Object.fromEntries(
                  roles.occupations.map((role) => [role.code, role.title]),
                ),
              }),
            }
          }
          if (!active) return
          restored = await persist(restored ?? blank)
        }
        if (!active) return
        saved.current = JSON.stringify(restored)
        replace(restored)
        setError("")
        setReady(true)
        try {
          sessionStorage.removeItem(storageKey)
        } catch {
          /* Legacy cache only. */
        }
      } catch {
        if (active) setError("Your saved profile couldn’t load. Retry to continue.")
      }
    }
    void restore()
    return () => {
      active = false
    }
  }, [retry])

  useEffect(() => {
    if (!ready || resetting.current || JSON.stringify(state) === saved.current) return
    timer.current = setTimeout(() => {
      void persist(state).catch(() => {})
    }, 500)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [state, ready])

  return (
    <ProfileContext.Provider
      value={{
        ...state,
        ready,
        storageAvailable: !error,
        saveOccupations: async (profile) => {
          const stored = await persist({ ...current.current, profile, confirmed: false })
          return stored.profile
        },
        completeOnboarding: async (profile) => {
          if (!hasMeterInputs(profile) || !hasScheduleAnswers(profile)) return false
          const stored = await persist({
            ...current.current,
            profile,
            confirmed: true,
            onboardingComplete: true,
          })
          replace(stored)
          return true
        },
        update: (patch) =>
          replace({
            ...current.current,
            profile: mergeProfile(current.current.profile, patch),
            confirmed: false,
          }),
        skip: (field) =>
          replace({
            ...current.current,
            skipped: [...new Set([...current.current.skipped, field])],
          }),
        confirm: (patch) => {
          const profile = mergeProfile(current.current.profile, patch ?? {})
          if (!hasMeterInputs(profile)) return false
          replace({ ...current.current, profile, confirmed: true })
          return true
        },
        reset: async (scope) => {
          resetting.current = true
          if (timer.current) clearTimeout(timer.current)
          try {
            await queue.current.catch(() => {})
            await guestRequest(`state?scope=${scope}`, "DELETE")
            saved.current = JSON.stringify(blank)
            replace(blank)
            setError("")
            try {
              sessionStorage.removeItem(storageKey)
              sessionStorage.removeItem("voxian-navigator-v3-prototype1")
              if (scope === "all") {
                localStorage.removeItem("voxian-commitment-v1")
                sessionStorage.removeItem("voxian-lumi-chat-session-v1")
              }
            } catch {
              /* Legacy caches do not affect server reset. */
            }
          } finally {
            resetting.current = false
          }
        },
      }}
    >
      {children}
      {error && (
        <div
          role="alert"
          className="fixed inset-x-4 bottom-4 z-[100] mx-auto flex max-w-lg items-center justify-between gap-4 rounded-lg border bg-background p-4 text-sm shadow-lg"
        >
          <span>{error}</span>
          <button
            className="shrink-0 underline"
            onClick={() => {
              if (!ready) setRetry((value) => value + 1)
              else void persist(current.current).catch(() => {})
            }}
          >
            Retry
          </button>
        </div>
      )}
      {saving && ready && !error && (
        <span role="status" className="sr-only">
          Saving profile…
        </span>
      )}
    </ProfileContext.Provider>
  )
}

export function useCareerProfile() {
  const context = useContext(ProfileContext)
  if (!context) throw new Error("Career profile provider missing")
  return context
}
