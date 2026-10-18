"use client"

import { useCareerProfile } from "@/components/career-profile-provider"
import { Moon, RotateCcw, Settings, Sun } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ResetProfileDialog } from "@/components/reset-profile-dialog"

export function AccountMenu() {
  const { profile } = useCareerProfile()
  const name = profile.preferredName || "Guest"
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  const { resolvedTheme, setTheme } = useTheme()
  const dark = resolvedTheme !== "light"
  const [resetOpen, setResetOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Account menu"
        >
          <Avatar>
            <AvatarFallback suppressHydrationWarning className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="end" sideOffset={8} className="w-56">
          <DropdownMenuLabel className="font-normal">
            <p className="font-medium text-foreground">{name}</p>
            <p className="truncate text-xs text-muted-foreground">Profile saved in this tab</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings/profile">
              <Settings /> Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setTheme(dark ? "light" : "dark")}>
            {dark ? <Sun /> : <Moon />} {dark ? "Light mode" : "Dark mode"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setResetOpen(true)}>
            <RotateCcw /> Reset
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ResetProfileDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        // A reset profile has no role yet; home is where it gets chosen again.
        onReset={() => {
          if (pathname !== "/home") router.push("/home")
        }}
      />
    </>
  )
}
