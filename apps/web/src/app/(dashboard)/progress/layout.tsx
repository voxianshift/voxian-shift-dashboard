import type { ReactNode } from "react"
import { NavigatorProvider } from "@/components/navigator-provider"

export default function ProgressLayout({ children }: { children: ReactNode }) {
  return <NavigatorProvider>{children}</NavigatorProvider>
}
