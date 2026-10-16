"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { MAIN_NAV } from "@/lib/nav"

export function AppSidebar() {
  const pathname = usePathname()
  const { state, isMobile, setOpenMobile } = useSidebar()
  const collapsed = state === "collapsed" && !isMobile

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {collapsed ? (
          <div className="flex h-8 items-center justify-center">
            <span className="flex size-6 items-center justify-center rounded-sm bg-primary text-xs font-bold text-primary-foreground">
              V
            </span>
          </div>
        ) : (
          <div className="flex h-8 items-center px-1 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Voxian Shift
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="gap-4 px-2 py-3">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MAIN_NAV.map(({ title, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(href)} tooltip={title}>
                    <Link href={href} onClick={() => setOpenMobile(false)}>
                      <Icon />
                      <span>{title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
