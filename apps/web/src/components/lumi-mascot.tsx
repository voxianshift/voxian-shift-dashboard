"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

export type LumiMascotProps = {
  className?: string
  size?: "xs" | "sm" | "md" | "lg" | number
  animated?: boolean
  idleFloat?: boolean
}

export function LumiMascot({
  className,
  size = "md",
  animated = true,
  idleFloat = false,
}: LumiMascotProps) {
  const id = useId().replace(/:/g, "")

  const sizeClasses = {
    xs: "w-[24px] h-[35px]",
    sm: "w-[36px] h-[52px]",
    md: "w-[58px] h-[84px]",
    lg: "w-[88px] h-[126px]",
  }

  const dimensions =
    typeof size === "number" ? { width: size, height: Math.round((size * 172) / 120) } : undefined

  return (
    <div
      className={cn(
        "relative flex items-center justify-center shrink-0 select-none",
        idleFloat && "animate-[lumi-float_3.6s_cubic-bezier(0.45,0.05,0.55,0.95)_infinite]",
        className,
      )}
      style={dimensions}
    >
      <svg
        viewBox="0 -16 120 172"
        className={cn(
          "overflow-visible drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]",
          typeof size === "string" ? sizeClasses[size] : "",
          animated && !idleFloat && "animate-pulse duration-[3000ms]",
        )}
        style={dimensions}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`lumiBodyGrad-${id}`} x1="25%" y1="0%" x2="75%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#f8fafc" />
            <stop offset="85%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id={`lumiArmPearlGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id={`lumiVisorGrad-${id}`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="60%" stopColor="#061021" />
            <stop offset="100%" stopColor="#0b1b36" />
          </linearGradient>
          <filter id={`lumiCyanGlow-${id}`} x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Antenna Rig */}
        <g style={{ transformOrigin: "60px 19.5px" }}>
          <ellipse
            cx="60"
            cy="19.5"
            rx="4"
            ry="1.6"
            fill="#475569"
            stroke="#64748b"
            strokeWidth={0.8}
          />
          <ellipse cx="60" cy="19.0" rx="2.4" ry="0.9" fill="#94a3b8" />
          <path
            d="M 60 19.5 C 60.00 12, 59.98 0.5, 59.96 -8.00"
            stroke="#94a3b8"
            strokeWidth={2.2}
            strokeLinecap="round"
            fill="none"
          />
          <g transform="translate(59.96, -8.00)">
            <circle cx="0" cy="0" r="5" fill="#00f2fe" opacity={0.6} />
            <circle cx="0" cy="0" r="4.6" fill="#00f2fe" filter={`url(#lumiCyanGlow-${id})`} />
            <circle cx="0" cy="0" r="2.2" fill="#ffffff" />
            <circle cx="-0.8" cy="-0.8" r="0.8" fill="#ffffff" opacity={0.9} />
          </g>
        </g>

        {/* Left Arm Rig: pinned to shoulder (21, 52) */}
        <g
          style={{
            transformOrigin: "21px 52px",
            animation: idleFloat ? "lumi-arm-idle 4.2s ease-in-out infinite 0.6s" : undefined,
          }}
        >
          <path
            d="M 21 52 C 11 62, 11 78, 16 92 C 18 95.5, 23 95.5, 25 91 C 26.5 80, 24.5 66, 23.5 53 C 23 50.5, 21.5 50.5, 21 52 Z"
            fill={`url(#lumiArmPearlGrad-${id})`}
            stroke="#cbd5e1"
            strokeWidth={0.8}
            opacity={0.96}
          />
          <path
            d="M 21.5 56 C 15.5 68, 16 83, 21.5 91"
            fill="none"
            stroke="#00f2fe"
            strokeWidth={0.6}
            opacity={0.35}
          />
        </g>

        {/* Main Body */}
        <g>
          <path
            d="M 60 16 C 85 16, 97 32, 97 58 C 97 84, 91 108, 80 126 C 73 137, 47 137, 40 126 C 29 108, 23 84, 23 58 C 23 32, 35 16, 60 16 Z"
            fill={`url(#lumiBodyGrad-${id})`}
            stroke="#e2e8f0"
            strokeWidth={1.2}
          />
          <ellipse cx="60" cy="23" rx="18" ry="4.5" fill="#ffffff" opacity={0.85} />
          <path
            d="M 42 125 C 49 135, 71 135, 78 125 C 71 131, 49 131, 42 125 Z"
            fill="#94a3b8"
            opacity={0.38}
          />
          <path
            d="M 33 36 C 44 30, 76 30, 87 36 C 94 41, 95 62, 89 69 C 81 76, 39 76, 31 69 C 25 62, 26 41, 33 36 Z"
            fill={`url(#lumiVisorGrad-${id})`}
            stroke="#00f2fe"
            strokeWidth={1.1}
            strokeOpacity={0.85}
          />
          <path
            d="M 36 38 C 45 33, 75 33, 84 38 C 72 38, 50 44, 40 54 C 36 48, 36 41, 36 38 Z"
            fill="#ffffff"
            opacity={0.18}
          />

          {/* Arch eyes */}
          <g filter={`url(#lumiCyanGlow-${id})`}>
            <path
              d="M 42 45 Q 49 37 56 45"
              fill="none"
              stroke="#00f2fe"
              strokeWidth={3.2}
              strokeLinecap="round"
            />
            <path
              d="M 64 45 Q 71 37 78 45"
              fill="none"
              stroke="#00f2fe"
              strokeWidth={3.2}
              strokeLinecap="round"
            />
          </g>

          {/* Chest branding */}
          <g className="opacity-90">
            <text
              x="60"
              y="93"
              fill="#64748b"
              fontSize="6.8"
              fontFamily="monospace"
              fontWeight="900"
              letterSpacing="2.6"
              textAnchor="middle"
            >
              VOXIAN
            </text>
            <circle cx="60" cy="103" r="3.2" fill="#00f2fe" filter={`url(#lumiCyanGlow-${id})`} />
            <circle cx="60" cy="103" r="1.5" fill="#ffffff" />
          </g>

          <ellipse
            cx="60"
            cy="135"
            rx="12"
            ry="3.4"
            fill="#0f172a"
            stroke="#334155"
            strokeWidth={0.8}
          />
          <ellipse
            cx="60"
            cy="135.5"
            rx="8"
            ry="1.6"
            fill="#00f2fe"
            filter={`url(#lumiCyanGlow-${id})`}
          />
          <circle cx="55.5" cy="135.5" r="1.1" fill="#ffffff" />
          <circle cx="64.5" cy="135.5" r="1.1" fill="#ffffff" />
        </g>

        {/* Right Arm Rig: pinned to shoulder (99, 52) */}
        <g
          style={{
            transformOrigin: "99px 52px",
            animation: idleFloat
              ? "lumi-arm-idle 4.2s ease-in-out reverse infinite 1.2s"
              : undefined,
          }}
        >
          <path
            d="M 99 52 C 109 62, 109 78, 104 92 C 102 95.5, 97 95.5, 95 91 C 93.5 80, 95.5 66, 96.5 53 C 97 50.5, 98.5 50.5, 99 52 Z"
            fill={`url(#lumiArmPearlGrad-${id})`}
            stroke="#cbd5e1"
            strokeWidth={0.8}
            opacity={0.96}
          />
          <path
            d="M 98.5 56 C 104.5 68, 104 83, 98.5 91"
            fill="none"
            stroke="#00f2fe"
            strokeWidth={0.6}
            opacity={0.35}
          />
        </g>
      </svg>
    </div>
  )
}
