"use client"

import { useState } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { OccupationPicker } from "@/components/occupation-picker"
import { useCareerProfile } from "@/components/career-profile-provider"
import { Button } from "@/components/ui/button"
import { mergeProfile, type CareerProfile } from "@/lib/onboarding"

export default function ExplorePage() {
  const { profile, ready, update, saveOccupations } = useCareerProfile()
  const [draft, setDraft] = useState<CareerProfile | null>(null)
  const [saving, setSaving] = useState(false)
  if (!ready)
    return (
      <p className="p-6" role="status">
        Loading your occupations…
      </p>
    )
  return (
    <div className="space-y-6 p-6 max-w-3xl">
      <PageHeader
        title="Find your occupation"
        description="Search official job titles and typical duties, then confirm the roles that fit."
      />
      <OccupationPicker
        profile={draft ?? profile}
        onChange={(patch) => setDraft((current) => mergeProfile(current ?? profile, patch))}
      />
      <Button
        disabled={saving}
        onClick={async () => {
          setSaving(true)
          try {
            update(await saveOccupations(draft ?? profile))
            setDraft(null)
            toast.success("Occupation choices saved")
          } catch {
            toast.error("Occupation choices could not be saved. Try again.")
          } finally {
            setSaving(false)
          }
        }}
      >
        {saving ? "Saving…" : "Save role choices"}
      </Button>
    </div>
  )
}
