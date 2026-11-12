import type { Counts } from '../types';

export const WEIGHTS = { lecture: 1, lab: 1, tutorial: 0.5 } as const;

export function weightedSum(counts: Counts): number {
  return counts.lecture * WEIGHTS.lecture
    + counts.lab * WEIGHTS.lab
    + counts.tutorial * WEIGHTS.tutorial;
}
