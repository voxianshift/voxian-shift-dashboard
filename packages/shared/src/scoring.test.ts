import { expect, test } from "vite-plus/test"
import { computeExposure, iloGradient, taskStats } from "./scoring.ts"

const exposures = [0.95, 0.85, 0.2, 0.35]
const withWeights = (w: number[]) => exposures.map((exposure, i) => ({ weight: w[i]!, exposure }))

test("spec example: routine vs escalation", () => {
  expect(computeExposure(withWeights([0.45, 0.3, 0.15, 0.1])).toFixed(1)).toBe("74.8")
  expect(computeExposure(withWeights([0.15, 0.15, 0.45, 0.25])).toFixed(1)).toBe("44.8")
})

test("normalizes weights", () => {
  expect(computeExposure(withWeights([45, 30, 15, 10])).toFixed(1)).toBe("74.8")
})

test("rejects bad input", () => {
  expect(() => computeExposure([])).toThrow()
  expect(() => computeExposure(withWeights([0, 0, 0, 0]))).toThrow()
  expect(() => computeExposure([{ weight: 1, exposure: 1.5 }])).toThrow()
})

test("ILO Table 5 gradients from task mean and SD", () => {
  // Table A1 values
  expect(iloGradient(0.7, 0.03)).toBe("G4") // 4132 Data Entry Clerks
  expect(iloGradient(0.57, 0.08)).toBe("G3") // 2514 Applications Programmers
  expect(iloGradient(0.45, 0.1)).toBe("G2")
  expect(iloGradient(0.3, 0.25)).toBe("G1")
  expect(iloGradient(0.35, 0.1)).toBe("Minimal")
  expect(iloGradient(0.2, 0.05)).toBe("Not exposed")
  const { mean, sd } = taskStats([0.685, 0.555, 0.535, 0.615, 0.465])
  expect(mean.toFixed(3)).toBe("0.571")
  expect(iloGradient(mean, sd)).toBe("G3")
})
