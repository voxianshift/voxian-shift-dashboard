export const lumiTriggerSize = { width: 104, height: 144 }

export function clampLumiPosition(x: number, y: number, width: number, height: number) {
  const clamp = (value: number, extent: number, size: number) => {
    const space = Math.max(0, extent - size)
    const margin = Math.min(12, space / 2)
    return Math.max(margin, Math.min(space - margin, value))
  }
  return { x: clamp(x, width, lumiTriggerSize.width), y: clamp(y, height, lumiTriggerSize.height) }
}

export function stepLumiSpring(angle: number, velocity: number, target: number, seconds: number) {
  const dt = Math.min(Math.max(seconds, 0), 0.032)
  const nextVelocity = (velocity + (target - angle) * 220 * dt) * Math.exp(-18 * dt)
  return { angle: angle + nextVelocity * dt, velocity: nextVelocity }
}
