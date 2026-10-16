"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { useCareerProfile } from "@/components/career-profile-provider"
import { ProfileSheet } from "@/components/profile-sheet"
import { Button } from "@/components/ui/button"
import { PanelHeading } from "@/components/radar-panel"
import { canConfirmProfile } from "@/lib/onboarding"
import { editorialPage, fieldHelp } from "@/lib/styles"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const { confirm, confirmed, profile } = useCareerProfile()
  const [editing, setEditing] = useState(false)
  return (
    <div className={cn(editorialPage, "max-w-3xl")}>
      <PanelHeading kicker="YOUR PROFILE" title="Your work. In your words.">
        Update your profile in one place, then review your starting picture. Your details stay in
        this browser tab.
      </PanelHeading>
      <p className="text-[16px] mb-6">
        {profile.preferredName || "Guest"} · {profile.currentWork || "No work details yet"}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setEditing(true)}>Edit my profile</Button>
        <Button
          variant="outline"
          disabled={!canConfirmProfile(profile)}
          onClick={() => {
            if (confirm()) toast.success("Profile confirmed")
          }}
        >
          {confirmed ? "Profile confirmed" : "Confirm profile"}
        </Button>
        <Button asChild variant="ghost">
          <Link href="/home">Review my starting picture</Link>
        </Button>
      </div>
      {!canConfirmProfile(profile) && (
        <p className={cn(fieldHelp, "mt-4")}>
          Choose a supported occupation and main role before confirming an exposure baseline.
        </p>
      )}
      <ProfileSheet open={editing} onOpenChange={setEditing} />
    </div>
  )
}
