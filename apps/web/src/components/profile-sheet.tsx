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
import { mergeProfile, type ProfileField, type CareerProfile } from "@/lib/onboarding"

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
  onSaved?: (profile: CareerProfile) => void
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
      onSaved?.(saved)
      toast.success(storageAvailable ? "Profile saved" : "Profile updated for this visit", {
        description: "Your changes are saved. Open your Meter whenever you’re ready.",
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
        className="gap-0 data-[side=right]:w-[min(100%,560px)] data-[side=right]:max-w-[560px] data-[side=right]:sm:max-w-[560px]"
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
        <SheetHeader className="shrink-0 border-b px-7 pt-7 pb-5 max-[650px]:px-5 max-[650px]:pt-6 max-[650px]:pb-[18px] [&_[data-slot=sheet-title]]:pr-7">
          <SheetTitle className="text-[24px]">Edit your profile</SheetTitle>
          <SheetDescription className="text-[14px] leading-relaxed">
            Share what feels useful. Changes apply only when you save.
          </SheetDescription>
        </SheetHeader>
        <Tabs defaultValue="work" key={open ? "open" : "closed"} className="min-h-0 flex-1 gap-0">
          <TabsList
            className="mx-6 mt-5 flex min-h-[42px] w-auto shrink-0 max-[650px]:mx-4 [&_button]:min-h-9 [&_button]:text-[14px] max-[650px]:[&_button]:text-[13px]"
            aria-label="Profile sections"
          >
            {groups.map((group) => (
              <TabsTrigger value={group.id} key={group.id}>
                {group.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {groups.map((group) => (
            <TabsContent
              key={group.id}
              value={group.id}
              className="min-h-0 overflow-y-auto px-7 pb-6 max-[650px]:px-5"
            >
              <ProfileEditor
                profile={draft}
                onChange={(patch) => setDraft((current) => mergeProfile(current, patch))}
                fields={group.fields}
              />
            </TabsContent>
          ))}
        </Tabs>
        <SheetFooter className="shrink-0 flex-row justify-end border-t bg-popover px-6 py-[18px] max-[650px]:px-5 [&_button]:min-h-[42px] [&_button]:text-[15px]">
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
