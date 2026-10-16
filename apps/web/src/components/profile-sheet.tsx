"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useCareerProfile } from "@/components/career-profile-provider"
import { ProfileEditor } from "@/components/profile-editor"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mergeProfile, type ProfileField } from "@/lib/onboarding"

const groups: { id: string; title: string; fields: ProfileField[] }[] = [
  {
    id: "work",
    title: "Your work",
    fields: ["preferredName", "currentWork", "taskFocus", "strengths"],
  },
  { id: "next", title: "Your next step", fields: ["goals", "direction", "risk"] },
  {
    id: "preferences",
    title: "Preferences",
    fields: ["hours", "flexibility", "timeline", "anxieties"],
  },
]

export function ProfileSheet({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}) {
  const { profile, update, storageAvailable, saveOccupations } = useCareerProfile()
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState(profile)
  const returnFocus = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (open) setDraft(profile)
  }, [open, profile])

  async function save() {
    setSaving(true)
    try {
      const saved = await saveOccupations(draft)
      if (JSON.stringify(saved) !== JSON.stringify(profile)) update(saved)
      onOpenChange(false)
      onSaved?.()
      toast.success(storageAvailable ? "Profile saved" : "Profile updated for this visit", {
        description:
          "Occupation choices are saved. Review your starting picture before opening your Meter.",
      })
    } catch {
      toast.error("Profile could not be saved", {
        description: "Your edits are still here. Try again.",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!saving) onOpenChange(next)
      }}
    >
      <SheetContent
        side="right"
        className="career-profile-sheet"
        onOpenAutoFocus={() => {
          returnFocus.current = document.activeElement as HTMLElement
        }}
        onCloseAutoFocus={(event) => {
          if (returnFocus.current?.isConnected) {
            event.preventDefault()
            returnFocus.current.focus()
          }
        }}
      >
        <SheetHeader className="profile-sheet-header">
          <SheetTitle className="text-[24px]">Edit your profile</SheetTitle>
          <SheetDescription className="text-[14px] leading-relaxed">
            Share what feels useful. Changes apply only when you save.
          </SheetDescription>
        </SheetHeader>
        <Tabs defaultValue="work" key={open ? "open" : "closed"} className="profile-sheet-tabs">
          <TabsList className="profile-sheet-tab-list" aria-label="Profile sections">
            {groups.map((group) => (
              <TabsTrigger value={group.id} key={group.id}>
                {group.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {groups.map((group) => (
            <TabsContent key={group.id} value={group.id} className="profile-sheet-body">
              <ProfileEditor
                profile={draft}
                onChange={(patch) => setDraft((current) => mergeProfile(current, patch))}
                fields={group.fields}
              />
            </TabsContent>
          ))}
        </Tabs>
        <SheetFooter className="profile-sheet-footer">
          <Button variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={saving} onClick={save}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
