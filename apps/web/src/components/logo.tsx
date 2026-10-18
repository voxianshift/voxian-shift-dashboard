import Image from "next/image"
import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/voxian-shift-logo.svg"
      alt=""
      width={40}
      height={40}
      className={cn("size-7 shrink-0", className)}
      priority
    />
  )
}
