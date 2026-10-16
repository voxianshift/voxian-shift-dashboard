import type { ReactNode } from "react"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

export function PanelHeading({
  kicker,
  title,
  children,
}: {
  kicker: string
  title: string
  children: ReactNode
}) {
  return (
    <div className="panel-heading">
      <p className="eyebrow">{kicker}</p>
      <h1>{title}</h1>
      <p className="panel-description">{children}</p>
    </div>
  )
}

export function RadarFooter() {
  return (
    <footer className="radar-footer">
      <span>Built for your next move.</span>
      <Link href="/resources">
        Evidence over anxiety <ArrowUpRight className="size-3" />
      </Link>
    </footer>
  )
}
