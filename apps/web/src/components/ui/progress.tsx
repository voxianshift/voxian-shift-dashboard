import type { ComponentProps } from "react"
import { cn } from "cn"

export function Progress({
  className,
  value = 0,
  ...props
}: ComponentProps<"div"> & { value?: number }) {
  const clamped = Math.max(0, Math.min(100, value ?? 0))
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      data-slot="progress"
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className="size-full flex-1 bg-primary transition-all duration-300 rounded-full"
        style={{ transform: `translateX(-${100 - clamped}%)` }}
      />
    </div>
  )
}
