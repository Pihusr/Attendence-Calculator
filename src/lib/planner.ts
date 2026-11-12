import type { Counts, Plan } from '../types';
import { WEIGHTS, weightedSum } from './weights';

export function needNowWeighted(A: number, H: number): number {
  return Math.max(0, 3 * H - 4 * A);
}

export function needByEndWeighted(A: number, H: number, F: number): number {
  return Math.max(0, 0.75 * (H + F) - A);
}

export function skipBudgetWeighted(F: number, a: number): number {
  return Math.max(0, F - a);
}

export function isUnrecoverable(A: number, H: number, F: number): boolean {
  return 3 * H - 4 * A > F;
}

export function splitIntoCounts(weightedNeed: number, pool: Counts): Counts {
  const result: Counts = { lecture: 0, tutorial: 0, lab: 0 };
  const poolWeight = weightedSum(pool);
  const target = Math.min(Math.max(0, weightedNeed), poolWeight);
  if (target === 0 || poolWeight === 0) {
    return result;
  }

  const fraction = target / poolWeight;
  for (const type of ['lecture', 'tutorial', 'lab'] as const) {
    result[type] = Math.min(pool[type], Math.ceil(fraction * pool[type]));
  }

  while (true) {
    const largest = (['lecture', 'tutorial', 'lab'] as const)
      .filter((type) => result[type] > 0)
      .sort((left, right) => result[right] - result[left])[0];
    if (largest === undefined || weightedSum(result) - WEIGHTS[largest] < target) {
      break;
    }
    result[largest] -= 1;
  }
  return result;
}

export function buildPlan(A: number, H: number, F: number, remaining: Counts): Plan {
  const nowWeighted = needNowWeighted(A, H);
  const endWeighted = needByEndWeighted(A, H, F);
  const endCounts = splitIntoCounts(endWeighted, remaining);
  return {
    nowWeighted,
    nowCounts: splitIntoCounts(nowWeighted, remaining),
    endWeighted,
    endCounts,
    skipWeighted: skipBudgetWeighted(F, endWeighted),
    skipCounts: {
      lecture: remaining.lecture - endCounts.lecture,
      tutorial: remaining.tutorial - endCounts.tutorial,
      lab: remaining.lab - endCounts.lab,
    },
    unrecoverable: isUnrecoverable(A, H, F),
  };
}
