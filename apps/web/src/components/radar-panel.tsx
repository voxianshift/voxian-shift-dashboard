import type { ReactNode } from "react"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { eyebrow } from "@/lib/styles"

export function PanelHeading({
  kicker,
  title,
  children,
  variant = "page",
}: {
  kicker: string
  title: string
  children: ReactNode
  /** "page": full-width editorial pages; "panel": the Meter's evidence column */
  variant?: "page" | "panel"
}) {
  return (
    <div
      className={cn(
        "pt-[49px] pb-[25px] min-[1600px]:pt-16",
        variant === "panel" ? "px-4" : "pr-4",
      )}
    >
      <p className={eyebrow}>{kicker}</p>
      <h1
        className={cn(
          "mt-[11px] text-[clamp(30px,3.05vw,48px)] font-[450] leading-[1.12] tracking-[-1.9px] max-[850px]:text-[36px]",
          variant === "panel" ? "max-w-[540px]" : "max-w-[680px]",
        )}
      >
        {title}
      </h1>
      <p className="mt-[17px] text-[16px] leading-[1.8] text-muted-foreground">{children}</p>
    </div>
  )
}

export function RadarFooter() {
  return (
    <footer className="mt-auto flex justify-between border-t px-[22px] py-[15px] text-[12px] text-muted-foreground">
      <span>Built for your next move.</span>
      <Link href="/resources" className="flex items-center gap-1">
        Evidence over anxiety <ArrowUpRight className="size-3" />
      </Link>
    </footer>
  )
}
