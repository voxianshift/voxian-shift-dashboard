import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeExposure } from './scoring.ts';

const exposures = [0.95, 0.85, 0.2, 0.35];
const withWeights = (w: number[]) => exposures.map((exposure, i) => ({ weight: w[i]!, exposure }));

test('spec example: routine vs escalation', () => {
  assert.equal(computeExposure(withWeights([0.45, 0.3, 0.15, 0.1])).toFixed(1), '74.8');
  assert.equal(computeExposure(withWeights([0.15, 0.15, 0.45, 0.25])).toFixed(1), '44.8');
});

test('normalizes weights', () => {
  assert.equal(computeExposure(withWeights([45, 30, 15, 10])).toFixed(1), '74.8');
});

test('rejects bad input', () => {
  assert.throws(() => computeExposure([]));
  assert.throws(() => computeExposure(withWeights([0, 0, 0, 0])));
  assert.throws(() => computeExposure([{ weight: 1, exposure: 1.5 }]));
});
