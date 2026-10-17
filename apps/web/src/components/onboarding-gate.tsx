"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useCareerProfile } from "@/components/career-profile-provider"

export function OnboardingGate({ children }: { children: ReactNode }) {
  const { ready, onboardingComplete } = useCareerProfile()
  const router = useRouter()
  useEffect(() => {
    if (ready && !onboardingComplete) router.replace("/onboarding")
  }, [ready, onboardingComplete, router])
  if (!ready || !onboardingComplete) {
    return (
      <p role="status" className="m-auto p-8 text-muted-foreground">
        Preparing your space…
      </p>
    )
  }
  return children
}
