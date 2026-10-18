"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpRight, AudioLines, ChevronUp } from "lucide-react"
import { useCareerProfile } from "@/components/career-profile-provider"
import { AccountMenu } from "@/components/account-menu"
import { SidebarTracker } from "@/components/sidebar-tracker"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { MAIN_NAV } from "@/lib/nav"
import { eyebrow } from "@/lib/styles"

export function AppSidebar() {
  const pathname = usePathname()
  const { profile } = useCareerProfile()
  const { state, isMobile, setOpenMobile } = useSidebar()
  const collapsed = state === "collapsed" && !isMobile

  return (
    <Sidebar collapsible="icon" className="[--sidebar:#fafafa] dark:[--sidebar:#1b1b1b]">
      <SidebarHeader className="h-[68px] justify-center px-4">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/home"
            aria-label="Voxian Shift home"
            className="flex items-center gap-2.5 whitespace-nowrap"
          >
            <AudioLines className="size-6 shrink-0" strokeWidth={1.5} />
            {!collapsed && (
              <span className="text-[16px] font-semibold tracking-[-.3px]">
                VOXIAN <span className="font-normal">SHIFT</span>
              </span>
            )}
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 pt-3">
        <SidebarMenu>
          {MAIN_NAV.map(({ title, href, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(href)}
                tooltip={title}
                className="h-10 rounded-md px-3 text-[15px] font-normal"
              >
                <Link href={href} onClick={() => setOpenMobile(false)}>
                  <Icon strokeWidth={1.5} />
                  <span>{title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="gap-4 p-4">
        <SidebarTracker
          collapsed={collapsed}
          fallback={
            <div className="border bg-background p-3">
              <span className={eyebrow}>YOUR NEXT CHAPTER</span>
              <p className="mt-2 text-[16px] leading-relaxed">
                The future of work.
                <br />
                With you in it.
              </p>
              <Link
                href="/roadmap"
                className="mt-3 flex items-center justify-between text-[14px] text-muted-foreground"
              >
                Explore your paths <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          }
        />
        {!collapsed && (
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-[#809488]" /> Research prototype · v0.1
          </div>
        )}
        <div className="flex items-center gap-2.5">
          <AccountMenu />
          {!collapsed && (
            <>
              <div className="flex-1 text-[14px]" suppressHydrationWarning>
                {profile.preferredName || "Your workspace"}
                <p className="mt-0.5 text-[14px] text-muted-foreground">Guest · this device</p>
              </div>
              <ChevronUp className="size-3.5 text-muted-foreground" />
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
