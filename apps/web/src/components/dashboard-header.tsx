"use client"

import { PanelLeft } from "lucide-react"
import { usePathname } from "next/navigation"
import { AccountMenu } from "@/components/account-menu"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { navTitle } from "@/lib/nav"

// Same bar as seratus-webapp's DashboardHeader: toggle, "Section / Title", account menu
export function DashboardHeader() {
  const { toggleSidebar } = useSidebar()
  const { section, title } = navTitle(usePathname())

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-2 dark:border-slate-800 dark:bg-[#181818]">
      <div className="flex min-w-0 items-center gap-2">
        <Button size="icon" variant="ghost" aria-label="Toggle sidebar" onClick={toggleSidebar}>
          <PanelLeft />
        </Button>
        <h1 className="truncate font-medium text-gray-900 dark:text-gray-100">
          {section && (
            <span className="font-normal text-gray-400 dark:text-gray-500">
              {section}
              <span className="mx-1.5">/</span>
            </span>
          )}
          {title}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-2 pr-1">
        <AccountMenu />
      </div>
    </header>
  )
}
