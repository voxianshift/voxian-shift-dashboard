"use client"

import type { CSSProperties } from "react"

const motion = {
  smooth: "0.35s",
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
}

const ORB_STAGE = 24

const ORB_TASKS = {
  pulse: "Thinking",
  orbit: "Searching",
  sweep: "Writing",
  globe: "Planning",
  spark: "Waiting",
}

const ORB_LATTICE = (() => {
  const cells: { x: number; y: number }[] = []
  for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) cells.push({ x, y })
  return cells
})()

const ORB_RING = Array.from({ length: 8 }, (_, i) => i)

type OrbProps = {
  variant?: keyof typeof ORB_TASKS
  size?: number
  label?: string
  pill?: boolean
  color?: string
  style?: CSSProperties
}

function Orb({ variant = "pulse", size = 20, label, pill, color, style: sp }: OrbProps) {
  const text = label || `${ORB_TASKS[variant] || "Working"}…`

  let cells = null
  if (variant === "pulse" || variant === "sweep") {
    // 3×3 lattice: radial wavefront (pulse) or left-to-right band (sweep).
    cells = ORB_LATTICE.map(({ x, y }) => {
      const delay = variant === "pulse" ? Math.hypot(x - 1, y - 1) * 260 : x * 220
      return (
        <span
          key={`${x}${y}`}
          className="absolute size-1 [transform:scale(0.4)] rounded-[2px] bg-current opacity-25 animate-orb-swell motion-reduce:[animation-play-state:paused]"
          style={{ left: x * 8 + 2, top: y * 8 + 2, animationDelay: `${Math.round(delay)}ms` }}
        />
      )
    })
  } else if (variant === "orbit") {
    // Ring of 8: negative delays turn one swell into a comet chase.
    cells = ORB_RING.map((i) => {
      const a = (i / 8) * Math.PI * 2
      return (
        <span
          key={i}
          className="absolute size-[3.5px] [transform:scale(0.5)] rounded-[2px] bg-current opacity-20 animate-orb-swell [animation-duration:1.4s] motion-reduce:[animation-play-state:paused]"
          style={{
            left: 12 + Math.cos(a) * 9 - 1.75,
            top: 12 + Math.sin(a) * 9 - 1.75,
            animationDelay: `${-(i / 8) * 1.4}s`,
          }}
        />
      )
    })
  } else if (variant === "globe") {
    // Dots share one elliptical track, spaced by negative delay: reads as
    // a flattened globe spinning, with scale + opacity as the depth cue.
    cells = ORB_RING.map((i) => (
      <span
        key={i}
        className="absolute top-[10.25px] left-[10.25px] size-[3.5px] rounded-[2px] bg-current animate-orb-globe motion-reduce:[animation-play-state:paused]"
        style={{ animationDelay: `${-(i / 8) * 3.2}s` }}
      />
    ))
  } else if (variant === "spark") {
    // The kit's ✦ glyph, breathing: with a soft echo bursting outward.
    cells = (
      <>
        <span className="absolute inset-0 flex items-center justify-center text-[15px] leading-none animate-orb-spark motion-reduce:[animation-play-state:paused]">
          ✦
        </span>
        <span className="absolute inset-0 flex items-center justify-center text-[15px] leading-none opacity-0 animate-orb-burst motion-reduce:[animation-play-state:paused]">
          ✦
        </span>
      </>
    )
  }

  const glyph = (
    <span
      data-halaska-orb=""
      role={pill ? undefined : "img"}
      aria-label={pill ? undefined : text}
      aria-hidden={pill ? true : undefined}
      style={{
        position: "relative",
        display: "inline-block",
        width: size,
        height: size,
        flexShrink: 0,
        color: color || "var(--muted-foreground)",
        transition: `color ${motion.smooth} ${motion.easeInOut}`,
        ...(pill ? undefined : sp),
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: ORB_STAGE,
          height: ORB_STAGE,
          transform: `scale(${size / ORB_STAGE})`,
          transformOrigin: "top left",
        }}
      >
        {cells}
      </span>
    </span>
  )

  if (!pill) return glyph
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        minHeight: 38,
        padding: "0 12px 0 6px",
        borderRadius: 999,
        background: "var(--popover)",
        boxShadow: "0 0 0 1px var(--border), 0 1px 2px rgb(0 0 0 / 0.04)",
        fontFamily: "inherit",
        transition: `background ${motion.smooth} ${motion.easeInOut}, box-shadow ${motion.smooth} ${motion.easeInOut}`,
        ...sp,
      }}
    >
      {glyph}
      <span
        style={{
          fontSize: 14,
          lineHeight: 1.55,
          color: "var(--muted-foreground)",
          whiteSpace: "nowrap",
          transition: `color ${motion.smooth} ${motion.easeInOut}`,
        }}
      >
        {text}
      </span>
    </span>
  )
}

export default Orb
