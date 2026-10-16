import { expect, test } from "vite-plus/test";
import { computeExposure } from "./scoring.ts";

const exposures = [0.95, 0.85, 0.2, 0.35];
const withWeights = (w: number[]) => exposures.map((exposure, i) => ({ weight: w[i]!, exposure }));

test("spec example: routine vs escalation", () => {
  expect(computeExposure(withWeights([0.45, 0.3, 0.15, 0.1])).toFixed(1)).toBe("74.8");
  expect(computeExposure(withWeights([0.15, 0.15, 0.45, 0.25])).toFixed(1)).toBe("44.8");
});

test("normalizes weights", () => {
  expect(computeExposure(withWeights([45, 30, 15, 10])).toFixed(1)).toBe("74.8");
});

test("rejects bad input", () => {
  expect(() => computeExposure([])).toThrow();
  expect(() => computeExposure(withWeights([0, 0, 0, 0]))).toThrow();
  expect(() => computeExposure([{ weight: 1, exposure: 1.5 }])).toThrow();
});
