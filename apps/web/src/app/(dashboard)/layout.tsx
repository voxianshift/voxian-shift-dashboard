import type { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { SidebarProvider } from "@/components/ui/sidebar"

// Stage/card/frame classes mirror seratus-webapp's DashboardStage + ContentFrame
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-muted/40 dark:bg-[#0a0a0a]">
        <div className="relative flex min-w-0 flex-1 overflow-hidden bg-background dark:bg-[#171717]">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <DashboardHeader />
            <div className="relative mx-auto flex min-h-0 w-full max-w-[1580px] flex-1 flex-col overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
