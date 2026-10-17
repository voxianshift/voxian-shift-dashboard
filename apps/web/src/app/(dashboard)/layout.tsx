import type { ReactNode } from "react"
import { CareerProfileProvider } from "@/components/career-profile-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <CareerProfileProvider>
      <SidebarProvider>
        <div className="flex h-dvh w-full overflow-hidden bg-background">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <DashboardHeader />
            <main id="main-content" className="min-h-0 flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </CareerProfileProvider>
  )
}
