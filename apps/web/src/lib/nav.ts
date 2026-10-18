import {
  BookOpen,
  CalendarCheck,
  ChartLine,
  Compass,
  Gauge,
  MessageCircle,
  type LucideIcon,
} from "lucide-react"

export type NavItem = { title: string; href: string; icon: LucideIcon }

export const MAIN_NAV: NavItem[] = [
  { title: "Home", href: "/home", icon: MessageCircle },
  { title: "The Meter", href: "/meter", icon: Gauge },
  { title: "The Curve", href: "/insights", icon: ChartLine },
  { title: "The Navigator", href: "/roadmap", icon: Compass },
  { title: "The Tracker", href: "/progress", icon: CalendarCheck },
  { title: "Methodology & Proof", href: "/resources", icon: BookOpen },
]

export function navTitle(pathname: string): { section?: string; title: string } {
  const main = MAIN_NAV.find((item) => pathname.startsWith(item.href))
  if (main) return { title: main.title }
  if (pathname.startsWith("/explore")) return { title: "Occupation catalogue" }
  if (pathname.startsWith("/settings")) return { section: "Settings", title: "Profile" }
  if (pathname.startsWith("/roadmap")) return { title: "The Navigator" }
  if (pathname.startsWith("/progress")) return { title: "The Tracker" }
  return { title: "Voxian Shift" }
}
