"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useCareerProfile } from "@/components/career-profile-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function ResetProfileDialog({
  open,
  onOpenChange,
  onReset,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReset?: () => void
}) {
  const { reset } = useCareerProfile()
  const [clearing, setClearing] = useState(false)

  async function resetProfile(scope: "profile" | "all") {
    if (clearing) return
    setClearing(true)
    try {
      await reset(scope)
      onReset?.()
      onOpenChange(false)
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

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!clearing) onOpenChange(next)
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
              Remove your saved profile and roles, then choose your role again. Keep your plan,
              progress and saved chats.
            </p>
            <Button variant="outline" disabled={clearing} onClick={() => resetProfile("profile")}>
              Restart profile
            </Button>
          </div>
          <div className="space-y-2 rounded-lg border p-4">
            <h3 className="text-[16px] font-medium">Reset everything</h3>
            <p className="text-[14px] leading-relaxed text-muted-foreground">
              Remove this browser’s saved profile, roles, plan, progress and saved chats.
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
        <Button variant="ghost" disabled={clearing} onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  )
}
