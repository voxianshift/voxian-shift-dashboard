import {
  BookOpen,
  ChartLine,
  Compass,
  House,
  Map as MapIcon,
  Radar,
  Settings,
  type LucideIcon,
} from "lucide-react"

export type NavItem = { title: string; href: string; icon: LucideIcon }

// Sidebar "Main" group
export const MAIN_NAV: NavItem[] = [
  { title: "Home", href: "/home", icon: House },
  { title: "Explore", href: "/explore", icon: Compass },
  { title: "Roadmap", href: "/roadmap", icon: MapIcon },
  { title: "Skill Analyse", href: "/skill-analyse", icon: Radar },
  { title: "Resources", href: "/resources", icon: BookOpen },
  { title: "Insights", href: "/insights", icon: ChartLine },
]

const SETTINGS_NAV: NavItem[] = [{ title: "Profile", href: "/settings/profile", icon: Settings }]

// Header "Section / Title" for the current path
export function navTitle(pathname: string): { section?: string; title: string } {
  const main = MAIN_NAV.find((i) => pathname.startsWith(i.href))
  if (main) return { title: main.title }
  const settings = SETTINGS_NAV.find((i) => pathname.startsWith(i.href))
  if (settings) return { section: "Settings", title: settings.title }
  return { title: "Voxian Shift" }
}
