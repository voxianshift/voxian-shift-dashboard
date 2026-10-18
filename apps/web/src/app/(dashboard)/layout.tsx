import { Suspense, type ReactNode } from "react"
import { cookies } from "next/headers"
import { OnboardingGate } from "@/components/onboarding-gate"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { LumiChatProvider } from "@/components/lumi-chat-provider"
import { LumiSidebar } from "@/components/lumi-sidebar"
import { LumiMobileTrigger } from "@/components/lumi-mobile-trigger"
import { NavigatorProvider } from "@/components/navigator-provider"
import { WarmupOverlay } from "@/components/warmup-overlay"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <OnboardingGate>
      {/* One Navigator fetch for every page, started on arrival so the warm-up can wait on it. */}
      <NavigatorProvider>
        {/* Hydrate chat provider with its shell so saved state cannot race the suspended subtree. */}
        <Suspense fallback={null}>
          <DashboardShell>{children}</DashboardShell>
        </Suspense>
        <WarmupOverlay />
      </NavigatorProvider>
    </OnboardingGate>
  )
}

async function DashboardShell({ children }: { children: ReactNode }) {
  // SidebarProvider writes this cookie on every toggle; read it so reloads keep the last state.
  const defaultOpen = (await cookies()).get("sidebar_state")?.value !== "false"
  return (
    <LumiChatProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <div className="flex h-dvh w-full overflow-hidden bg-background">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <DashboardHeader />
            <div className="flex min-h-0 flex-1 overflow-hidden">
              <main id="main-content" className="min-h-0 flex-1 overflow-y-auto pb-[72px] md:pb-0">
                {children}
              </main>
              <LumiSidebar />
            </div>
          </div>
        </div>
      </SidebarProvider>
      <LumiMobileTrigger />
      <MobileBottomNav />
    </LumiChatProvider>
  )
}
