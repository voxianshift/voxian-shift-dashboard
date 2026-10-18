import { expect, test } from "vite-plus/test"
import { clampLumiPosition, stepLumiSpring } from "./lumi-motion"

test("Lumi stays where dropped and remains reachable after viewport resize", () => {
  expect(clampLumiPosition(142, 211, 390, 844)).toEqual({ x: 142, y: 211 })
  expect(clampLumiPosition(-400, 2000, 390, 844)).toEqual({ x: 12, y: 688 })
  expect(clampLumiPosition(1000, -200, 320, 480)).toEqual({ x: 204, y: 12 })
  expect(clampLumiPosition(200, 200, 100, 100)).toEqual({ x: 0, y: 0 })
})

test("drag sway follows movement, then settles back upright without frame-gap jumps", () => {
  let state = { angle: 0, velocity: 0 }
  for (let i = 0; i < 50; i++) state = stepLumiSpring(state.angle, state.velocity, 12, 1 / 60)
  expect(state.angle).toBeGreaterThan(10)
  for (let i = 0; i < 180; i++) state = stepLumiSpring(state.angle, state.velocity, 0, 1 / 60)
  expect(Math.abs(state.angle)).toBeLessThan(0.001)
  expect(Math.abs(state.velocity)).toBeLessThan(0.001)
  expect(stepLumiSpring(0, 0, 12, 10)).toEqual(stepLumiSpring(0, 0, 12, 0.032))
})
