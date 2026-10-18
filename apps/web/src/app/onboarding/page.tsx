"use client"

import { warmupFlag } from "@/components/warmup-overlay"
import { prefetchNavigator } from "@/components/navigator-provider"
import { prefetchProfileMeter } from "@/hooks/use-isco-meter"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Compass } from "lucide-react"
import { occupationSearchSchema, type OccupationMatch } from "@voxian/shared"
import { toast } from "sonner"
import { useCareerProfile } from "@/components/career-profile-provider"
import { CvUpload } from "@/components/cv-upload"
import { ProfileEditor } from "@/components/profile-editor"
import { OnboardingBaseline } from "@/components/onboarding-baseline"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { onboardingSteps, canAdvanceOnboarding } from "@/lib/onboarding-flow"

const quickPrompts = [
  {
    label: "Assess risk",
    text: "I want to understand which parts of my role are most at risk from AI. ",
  },
  {
    label: "Displacement fear",
    text: "I'm worried about being displaced in the next 12–18 months. ",
  },
  { label: "AI pivot", text: "I want to pivot toward AI-adjacent or data-driven work. " },
  { label: "Lead the shift", text: "I want to lead AI adoption and transformation in my field. " },
]

export default function OnboardingPage() {
  const {
    profile,
    update,
    ready,
    onboardingComplete,
    completeOnboarding,
    saveOccupations,
    storageAvailable,
  } = useCareerProfile()
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [matching, setMatching] = useState(false)
  const [error, setError] = useState("")
  const [roles, setRoles] = useState<OccupationMatch[]>([])
  const [fileName, setFileName] = useState("")
  const heading = useRef<HTMLHeadingElement>(null)
  const step = onboardingSteps[index]!
  const last = index === onboardingSteps.length - 1

  useEffect(() => {
    if (ready && onboardingComplete) router.replace("/home")
  }, [ready, onboardingComplete, router])
  useEffect(() => {
    heading.current?.focus()
  }, [index])

  async function matchWork() {
    if (matching) return
    setMatching(true)
    setError("")
    try {
      const response = await fetch(
        `/api/occupations?q=${encodeURIComponent(profile.currentWork.trim())}`,
        { signal: AbortSignal.timeout(10_000) },
      )
      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(
          typeof result?.error === "string"
            ? result.error
            : "Role matching is unavailable. Try again.",
        )
      }
      const result = occupationSearchSchema.parse(await response.json())
      if (!result.occupations.length)
        throw new Error("No close roles found. Try another title or a few words about your duties.")
      setRoles(result.occupations)
      update({ occupations: [], primaryOccupation: "", occupationNames: {} })
      setFileName("")
      setIndex(1)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Role matching failed. Try again.")
    } finally {
      setMatching(false)
    }
  }

  async function finish() {
    if (saving || !canAdvanceOnboarding(index, profile)) return
    setSaving(true)
    try {
      const saved = await saveOccupations(profile)
      if (!(await completeOnboarding(saved)))
        throw new Error("Complete your role and learning preferences first.")
      // Start the slow requests now; the dashboard loader and pages pick up the same promises.
      prefetchNavigator(saved)
      void prefetchProfileMeter(saved)
      try {
        sessionStorage.setItem(warmupFlag, "1")
      } catch {
        /* Without the flag the dashboard simply loads each page on demand. */
      }
      router.replace("/home")
    } catch {
      toast.error("Your profile could not be saved. Your answers are still here. Try again.")
    } finally {
      setSaving(false)
    }
  }

  if (!ready || onboardingComplete)
    return (
      <p role="status" className="m-auto p-8">
        Preparing your space…
      </p>
    )

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-10 text-foreground sm:py-16">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex items-center gap-2 text-sm font-semibold">
          <Compass className="size-5" /> Voxian Shift
        </div>
        <div className="mb-6 flex items-center justify-between gap-4 border-b pb-4">
          <p className="text-xs tracking-widest text-muted-foreground">
            STEP {index + 1} OF {onboardingSteps.length}
          </p>
          <div
            className="flex gap-1.5"
            aria-label={`Step ${index + 1} of ${onboardingSteps.length}`}
          >
            {onboardingSteps.map((item, position) => (
              <span
                key={item.title}
                className={`h-1.5 w-5 rounded-full ${position <= index ? "bg-brand-deep dark:bg-white" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>
        <header>
          <h1
            ref={heading}
            tabIndex={-1}
            className="text-3xl font-bold tracking-tight outline-none"
          >
            {step.title}
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">{step.description}</p>
        </header>
        <form
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault()
            if (index === 0) void matchWork()
            else if (canAdvanceOnboarding(index, profile)) {
              if (last) void finish()
              else setIndex(index + 1)
            }
          }}
        >
          <fieldset disabled={saving || matching}>
            {index === 0 ? (
              <div className="space-y-5">
                <label htmlFor="onboarding-name" className="block text-sm font-medium">
                  What should we call you?{" "}
                  <span className="font-normal text-muted-foreground">Optional</span>
                </label>
                <Input
                  id="onboarding-name"
                  maxLength={80}
                  autoComplete="given-name"
                  value={profile.preferredName}
                  onChange={(event) => update({ preferredName: event.target.value })}
                  placeholder="Leave blank to stay a guest"
                />
                <label htmlFor="onboarding-job" className="block text-sm font-medium">
                  What is your current job title?
                </label>
                <Input
                  id="onboarding-job"
                  maxLength={800}
                  value={profile.currentWork}
                  onChange={(event) => {
                    update({ currentWork: event.target.value })
                    setFileName("")
                    setError("")
                  }}
                  placeholder="e.g. Customer Service Agent, Bookkeeper, HR Recruiter"
                />
                <div className="flex items-center gap-4" aria-hidden="true">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <CvUpload
                  onAccept={(context, matches, filename) => {
                    update({ cvContext: context })
                    if (!matches.length) {
                      setError(
                        "CV details saved. No reviewed role matched closely; search your job title to choose your baseline.",
                      )
                      return
                    }
                    setRoles(matches)
                    update({
                      cvContext: context,
                      occupations: [],
                      primaryOccupation: "",
                      occupationNames: {},
                    })
                    setFileName(filename)
                    setError("")
                    setIndex(1)
                  }}
                />
              </div>
            ) : index === 1 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Matched for {fileName || profile.currentWork || "your saved occupation"}. Select
                  one role to anchor your baseline.
                </p>
                {roles.map((role) => (
                  <OnboardingBaseline
                    key={role.code}
                    role={role}
                    selected={profile.primaryOccupation === role.code}
                    onSelect={() =>
                      update({
                        occupations: [role.code],
                        primaryOccupation: role.code,
                        occupationNames: { [role.code]: role.title },
                        ...(fileName ? { currentWork: role.title } : {}),
                      })
                    }
                  />
                ))}
                <button
                  type="button"
                  disabled
                  className="flex w-full cursor-not-allowed flex-wrap items-center justify-between gap-3 rounded-xl border p-5 text-left text-muted-foreground"
                >
                  <span className="text-lg font-semibold">My role isn't listed</span>
                  <Badge variant="secondary">Coming soon</Badge>
                </button>
                {!roles.length && (
                  <p role="status">
                    Go back to Your work and search your title to load baseline roles.
                  </p>
                )}
              </div>
            ) : index === 2 ? (
              <div role="radiogroup" aria-label={step.title} className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    value: "routine",
                    title: "Routine Tasks & Standard Workflows",
                    description: "High-volume, repetitive processing and template-driven outputs.",
                  },
                  {
                    value: "escalations",
                    title: "Complex Cases & Strategic Judgment",
                    description: "Ambiguous situations, discretion, and stakeholder navigation.",
                  },
                  {
                    value: "mixed",
                    title: "A bit of both",
                    description: "A mix of routine workflows and complex cases.",
                  },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 has-checked:border-brand-deep has-checked:bg-brand-tint-soft dark:has-checked:border-white dark:has-checked:bg-white/5"
                  >
                    <input
                      className="mt-1"
                      type="radio"
                      name="workload"
                      value={option.value}
                      checked={profile.taskFocus === option.value}
                      onChange={() =>
                        update({ taskFocus: option.value as "routine" | "escalations" | "mixed" })
                      }
                    />
                    <span>
                      <span className="block font-medium">{option.title}</span>
                      <span className="mt-2 block text-sm text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <>
                {!last && (
                  <ProfileEditor
                    profile={profile}
                    onChange={update}
                    fields={step.fields}
                    bordered={false}
                  />
                )}
                {last && (
                  <div className="py-4">
                    <label htmlFor="onboarding-anxieties" className="mb-2 block font-medium">
                      Your North Star + Current Anxieties
                    </label>
                    <Textarea
                      id="onboarding-anxieties"
                      rows={4}
                      maxLength={800}
                      value={profile.anxieties}
                      onChange={(event) => update({ anxieties: event.target.value })}
                      placeholder="What are you working towards, and what worries you about getting there?"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Optional · {profile.anxieties.length}/800. Share only what feels useful.
                    </p>
                    <div
                      className="mt-3 flex flex-wrap items-center gap-2"
                      role="group"
                      aria-label="Quick prompts"
                    >
                      <span className="text-xs text-muted-foreground">Quick prompts:</span>
                      {quickPrompts.map((prompt) => (
                        <Button
                          key={prompt.label}
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={profile.anxieties.length + prompt.text.length + 1 > 800}
                          onClick={() =>
                            update({
                              anxieties: `${profile.anxieties.trimEnd()}${profile.anxieties.trimEnd() ? " " : ""}${prompt.text}`,
                            })
                          }
                        >
                          {prompt.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </fieldset>
          {matching && (
            <p role="status" className="mt-4 text-sm">
              {index === 0 ? "Finding matching roles…" : "Loading…"}
            </p>
          )}
          {error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="mt-8 flex justify-end gap-4 border-t pt-5">
            {index > 0 && (
              <Button
                type="button"
                variant="ghost"
                className="mr-auto"
                disabled={saving || matching}
                onClick={() => {
                  setIndex(index - 1)
                  setError("")
                }}
              >
                <ArrowLeft />
                Back
              </Button>
            )}
            <Button
              type="submit"
              disabled={saving || matching || !canAdvanceOnboarding(index, profile)}
            >
              {saving
                ? "Saving…"
                : matching
                  ? "Matching…"
                  : last
                    ? "Launch My Disruption Radar"
                    : index === 0
                      ? "Search roles"
                      : "Continue"}
              <ArrowRight />
            </Button>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            {storageAvailable
              ? "Your answers are saved for this browser. You can edit them later."
              : "Changes aren’t saved yet. Retry before leaving this page."}
          </p>
        </form>
      </div>
    </main>
  )
}
