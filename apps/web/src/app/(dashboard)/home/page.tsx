"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Gauge, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { useCareerProfile } from "@/components/career-profile-provider"
import { OccupationPicker } from "@/components/occupation-picker"
import { ProfileSheet } from "@/components/profile-sheet"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { hasMeterInputs, mergeProfile, type CareerProfile } from "@/lib/onboarding"
import { occupationModels } from "@/lib/occupations"
import { eyebrow } from "@/lib/styles"

export default function HomePage() {
  const { profile, ready, storageAvailable, saveOccupations, confirm, reset } = useCareerProfile()
  const router = useRouter()
  const [draft, setDraft] = useState<CareerProfile | null>(null)
  const [changingRoles, setChangingRoles] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [pickerVersion, setPickerVersion] = useState(0)
  const candidate = draft ?? profile
  const savedRole = hasMeterInputs(profile)
  const canContinue = hasMeterInputs(candidate)
  const choosing = !savedRole || changingRoles
  const busy = saving || clearing
  const roleName =
    candidate.occupationNames[candidate.primaryOccupation] ??
    occupationModels.find((role) => role.id === candidate.primaryOccupation)?.title ??
    candidate.primaryOccupation

  async function openMeter() {
    if (!canContinue || busy) return
    setSaving(true)
    try {
      const saved = await saveOccupations(candidate)
      if (!confirm(saved)) throw new Error("Choose your main role before continuing.")
      router.push("/meter")
    } catch {
      toast.error("Could not open your Meter", {
        description: "Your choices are still here. Check your connection and try again.",
      })
    } finally {
      setSaving(false)
    }
  }

  async function resetProfile(scope: "profile" | "all") {
    if (busy) return
    setClearing(true)
    try {
      await reset(scope)
      setDraft(null)
      setChangingRoles(false)
      setEditing(false)
      setPickerVersion((version) => version + 1)
      setResetOpen(false)
      toast.success(scope === "all" ? "Profile and saved chats reset" : "Profile restarted")
    } catch {
      toast.error("Could not reset your profile", {
        description:
          "Your information is kept on this screen. Check your connection and try again.",
      })
    } finally {
      setClearing(false)
    }
  }

  if (!ready) {
    return (
      <p role="status" className="px-6 py-16 text-muted-foreground">
        Loading your starting picture…
      </p>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[820px] px-10 pt-12 pb-16 max-[650px]:px-[22px] max-[650px]:pt-8">
      <header className="mb-8">
        <p className={eyebrow}>YOUR NEXT CHAPTER</p>
        <h1 className="mt-3 text-[36px] font-medium leading-tight tracking-[-1px] max-[650px]:text-[30px]">
          {savedRole
            ? `Welcome back${profile.preferredName ? `, ${profile.preferredName}` : ""}.`
            : "How could AI change your work?"}
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
          {savedRole
            ? "Pick up where you left off. Your Meter starts with your main role."
            : "Find your role to explore which parts of your work AI could change."}
        </p>
      </header>

      <section
        aria-labelledby="starting-picture"
        className="rounded-xl border bg-background p-7 max-[650px]:p-5"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 id="starting-picture" className="text-[21px] font-medium tracking-[-0.4px]">
            {choosing ? "What work do you do?" : "Your starting picture"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Reset profile"
            title="Reset profile"
            disabled={busy}
            onClick={() => setResetOpen(true)}
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
        {choosing ? (
          <fieldset disabled={busy} className="min-w-0 space-y-5">
            <OccupationPicker
              key={pickerVersion}
              profile={candidate}
              onChange={(patch) => setDraft((current) => mergeProfile(current ?? profile, patch))}
            />
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Choose the closest match. If you have several roles, select the one that takes most of
              your time. You can add goals and preferences later.
            </p>
          </fieldset>
        ) : (
          <div className="flex items-start gap-4">
            <Gauge className="mt-1 size-6 shrink-0 text-mauve-deep" aria-hidden="true" />
            <div>
              <p className="text-[13px] text-muted-foreground">Your main role</p>
              <p className="mt-1 text-[20px] font-medium leading-snug">{roleName}</p>
              {profile.occupations.length > 1 && (
                <p className="mt-2 text-[15px] text-muted-foreground">
                  {profile.occupations.length} roles saved · Meter uses your main role
                </p>
              )}
            </div>
          </div>
        )}
        <div className="mt-6 border-t pt-5">
          <Button
            className="min-h-12 w-full text-[16px]"
            disabled={!canContinue || busy}
            onClick={openMeter}
          >
            {saving
              ? "Saving your role…"
              : choosing
                ? "Confirm role & open my Meter"
                : "Continue to my Meter"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
          {choosing && !canContinue && (
            <p className="mt-3 text-[14px] text-muted-foreground">
              Select a role and choose your main role to continue.
            </p>
          )}
          <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
            Your Meter shows available research for this role. AI exposure describes tasks that
            could change; it does not predict job loss.
          </p>
        </div>
      </section>

      {savedRole && (
        <div className="mt-4 flex flex-wrap gap-2">
          {changingRoles ? (
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setDraft(null)
                setChangingRoles(false)
              }}
            >
              Cancel role changes
            </Button>
          ) : (
            <Button variant="ghost" disabled={busy} onClick={() => setChangingRoles(true)}>
              Change roles
            </Button>
          )}
          <Button variant="ghost" disabled={busy} onClick={() => setEditing(true)}>
            Edit preferences
          </Button>
        </div>
      )}
      {!storageAvailable && (
        <p role="status" className="mt-5 text-[14px] text-muted-foreground">
          Browser storage is blocked. Role choices are saved, but other preferences will be lost on
          reload.
        </p>
      )}
      <Dialog
        open={resetOpen}
        onOpenChange={(open) => {
          if (!clearing) setResetOpen(open)
        }}
      >
        <DialogContent showCloseButton={!clearing} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[22px]">Start again?</DialogTitle>
            <DialogDescription className="text-[15px] leading-relaxed">
              Choose what to reset. These changes cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2 rounded-lg border p-4">
              <h3 className="text-[16px] font-medium">Restart profile</h3>
              <p className="text-[14px] leading-relaxed text-muted-foreground">
                Remove saved roles and this tab’s profile answers, then choose your role again. Keep
                saved chats.
              </p>
              <Button variant="outline" disabled={clearing} onClick={() => resetProfile("profile")}>
                Restart profile
              </Button>
            </div>
            <div className="space-y-2 rounded-lg border p-4">
              <h3 className="text-[16px] font-medium">Reset everything</h3>
              <p className="text-[14px] leading-relaxed text-muted-foreground">
                Remove saved roles, this tab’s profile answers, and all saved Lumi chats for this
                browser.
              </p>
              <Button variant="destructive" disabled={clearing} onClick={() => resetProfile("all")}>
                Reset everything
              </Button>
            </div>
          </div>
          {clearing && (
            <p role="status" className="text-[14px] text-muted-foreground">
              Resetting your information…
            </p>
          )}
          <Button variant="ghost" disabled={clearing} onClick={() => setResetOpen(false)}>
            Cancel
          </Button>
        </DialogContent>
      </Dialog>
      <ProfileSheet
        open={editing}
        onOpenChange={setEditing}
        onSaved={() => {
          setDraft(null)
          setChangingRoles(false)
        }}
      />
    </div>
  )
}
