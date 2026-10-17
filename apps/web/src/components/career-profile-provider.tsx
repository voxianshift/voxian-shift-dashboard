"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { occupationCode, occupationSelectionSchema } from "@voxian/shared"
import { z } from "zod"
import {
  emptyProfile,
  mergeProfile,
  profileSchema,
  hasMeterInputs,
  hasScheduleAnswers,
  type CareerProfile,
} from "@/lib/onboarding"

const sessionSchema = z.object({
  profile: profileSchema,
  confirmed: z.boolean(),
  onboardingComplete: z.boolean().default(false),
  skipped: z.array(z.string()).max(20),
})
const blank = {
  profile: emptyProfile,
  confirmed: false,
  onboardingComplete: false,
  skipped: [] as string[],
}
const storageKey = "voxian-career-profile-v1"
type ProfileState = z.infer<typeof sessionSchema>
const ProfileContext = createContext<{
  profile: CareerProfile
  confirmed: boolean
  onboardingComplete: boolean
  completeOnboarding: (profile: CareerProfile) => boolean
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
  const [ready, setReady] = useState(false)
  const [storageAvailable, setStorageAvailable] = useState(true)
  useEffect(() => {
    let active = true
    async function restore() {
      let restored: ProfileState = blank
      try {
        const stored = sessionStorage.getItem(storageKey)
        if (stored) {
          const result = sessionSchema.safeParse(JSON.parse(stored))
          if (result.success) {
            const profile = mergeProfile(emptyProfile, result.data.profile)
            restored = {
              ...result.data,
              profile,
              confirmed: result.data.confirmed && hasMeterInputs(profile),
            }
          }
        }
      } catch {
        if (active) setStorageAvailable(false)
      }
      try {
        const response = await fetch("/api/onboarding/occupations", {
          cache: "no-store",
          signal: AbortSignal.timeout(6000),
        })
        if (!response.ok) throw new Error("Saved occupations unavailable")
        const saved = occupationSelectionSchema.parse(await response.json())
        if (!restored.profile.occupations.length && saved.occupations.length) {
          restored = {
            ...restored,
            confirmed: false,
            profile: mergeProfile(restored.profile, {
              occupations: saved.occupations.map((role) => role.code),
              occupationNames: Object.fromEntries(
                saved.occupations.map((role) => [role.code, role.title]),
              ),
              primaryOccupation: saved.primaryOccupation,
            }),
          }
        }
      } catch {
        /* Local answers remain available while database access is unavailable. */
      }
      if (active) {
        setState(restored)
        setReady(true)
      }
    }
    void restore()
    return () => {
      active = false
    }
  }, [])
  async function saveOccupations(profile: CareerProfile) {
    const response = await fetch("/api/onboarding/occupations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        occupations: profile.occupations.map(occupationCode),
        primaryOccupation: occupationCode(profile.primaryOccupation),
      }),
    })
    if (!response.ok) throw new Error("Your occupations could not be saved. Try again.")
    const saved = occupationSelectionSchema.parse(await response.json())
    return mergeProfile(profile, {
      occupations: saved.occupations.map((role) => role.code),
      occupationNames: Object.fromEntries(saved.occupations.map((role) => [role.code, role.title])),
      primaryOccupation: saved.primaryOccupation,
    })
  }
  useEffect(() => {
    if (!ready) return
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(state))
    } catch {
      setStorageAvailable(false)
    }
  }, [state, ready])
  return (
    <ProfileContext.Provider
      value={{
        ...state,
        ready,
        storageAvailable,
        saveOccupations,
        completeOnboarding: (profile) => {
          if (!hasMeterInputs(profile) || !hasScheduleAnswers(profile)) return false
          setState((s) => ({ ...s, profile, confirmed: true, onboardingComplete: true }))
          return true
        },
        update: (patch) =>
          setState((s) => ({ ...s, profile: mergeProfile(s.profile, patch), confirmed: false })),
        skip: (field) => setState((s) => ({ ...s, skipped: [...new Set([...s.skipped, field])] })),
        confirm: (patch) => {
          const profile = mergeProfile(state.profile, patch ?? {})
          if (!hasMeterInputs(profile)) return false
          setState((s) => ({ ...s, profile, confirmed: true }))
          return true
        },
        reset: async (scope) => {
          if (scope === "all") {
            const response = await fetch("/api/onboarding/conversation", {
              method: "DELETE",
              signal: AbortSignal.timeout(10_000),
            })
            if (!response.ok) throw new Error("Your saved data could not be reset. Try again.")
          } else {
            await saveOccupations(emptyProfile)
          }
          try {
            sessionStorage.removeItem("voxian-navigator-v1")
          } catch {
            setStorageAvailable(false)
          }
          setState(blank)
        },
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useCareerProfile() {
  const context = useContext(ProfileContext)
  if (!context) throw new Error("Career profile provider missing")
  return context
}
