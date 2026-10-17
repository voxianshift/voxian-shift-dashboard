"use client"

import { useEffect, useState } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  // Theme is only known on the client; avoid a hydration mismatch on the active tab.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return (
    <Tabs value={mounted ? theme : ""} onValueChange={setTheme}>
      <TabsList aria-label="Colour theme" className="h-8">
        {options.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value} aria-label={label} title={label} className="px-2">
            <Icon />
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
