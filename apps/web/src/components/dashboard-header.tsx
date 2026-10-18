"use client"

import { PanelLeft, Radio } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useLumiChat } from "@/components/lumi-chat-provider"
import { navTitle } from "@/lib/nav"

export function DashboardHeader() {
  const { toggleSidebar } = useSidebar()
  const { title } = navTitle(usePathname())
  const { isOpen, toggleOpen } = useLumiChat()

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-4 border-b bg-background px-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Button size="icon-xs" variant="ghost" aria-label="Toggle sidebar" onClick={toggleSidebar}>
          <PanelLeft />
        </Button>
        <span className="text-[16px]">
          <span className="hidden sm:inline">Workspace</span>{" "}
          <span className="mx-2 hidden opacity-40 sm:inline">/</span>{" "}
          <span className="text-foreground">{title}</span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-2 text-[14px] text-muted-foreground xl:flex">
          <Radio className="size-3.5" /> AI disruption radar{" "}
          <span className="ml-2 border px-1.5 py-0.5 font-mono text-[12px]">DEMO</span>
        </span>
        <Button
          size="sm"
          variant={isOpen ? "secondary" : "outline"}
          onClick={toggleOpen}
          className="hidden lg:flex items-center gap-1.5 h-8 px-2.5 text-[13px]"
          title="Toggle Lumi Copilot"
        >
          <span>Ask Lumi</span>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  )
}
