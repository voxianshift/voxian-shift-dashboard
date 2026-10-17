import { Suspense, type ReactNode } from "react"
import { cookies } from "next/headers"
import { CareerProfileProvider } from "@/components/career-profile-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { LumiChatProvider } from "@/components/lumi-chat-provider"
import { LumiSidebar } from "@/components/lumi-sidebar"
import { LumiMobileTrigger } from "@/components/lumi-mobile-trigger"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <CareerProfileProvider>
      <LumiChatProvider>
        {/* Cookie read is request-time data, so it must sit inside Suspense under Cache Components. */}
        <Suspense fallback={null}>
          <DashboardShell>{children}</DashboardShell>
        </Suspense>
        <LumiMobileTrigger />
      </LumiChatProvider>
    </CareerProfileProvider>
  )
}

async function DashboardShell({ children }: { children: ReactNode }) {
  // SidebarProvider writes this cookie on every toggle; read it so reloads keep the last state.
  const defaultOpen = (await cookies()).get("sidebar_state")?.value !== "false"
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex h-dvh w-full overflow-hidden bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <main id="main-content" className="min-h-0 flex-1 overflow-y-auto">
              {children}
            </main>
            <LumiSidebar />
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
