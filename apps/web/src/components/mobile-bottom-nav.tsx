"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MAIN_NAV } from "@/lib/nav"
import { cn } from "@/lib/utils"

// Show a subset of nav items in the mobile bottom bar
const MOBILE_NAV = ["The Meter", "The Curve", "The Navigator", "The Tracker", "Methodology & Proof"]

export function MobileBottomNav() {
  const pathname = usePathname()
  const items = MAIN_NAV.filter((n) => MOBILE_NAV.includes(n.title))

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-slate-800/80 bg-[#070b14]/96 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around px-2 py-1.5">
        {items.map(({ title, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all",
                isActive ? "text-cyan-400" : "text-slate-500",
              )}
            >
              {/* Active indicator bar */}
              <div
                className={cn(
                  "w-6 h-0.5 rounded-full mb-0.5 transition-all",
                  isActive ? "bg-cyan-400" : "bg-transparent",
                )}
              />
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-[9px] font-mono font-bold leading-none">
                {title.replace("The ", "")}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
