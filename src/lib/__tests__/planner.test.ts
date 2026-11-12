import { describe, expect, it } from 'vitest';
import { needByEndWeighted, needNowWeighted, isUnrecoverable, buildPlan, skipBudgetWeighted, splitIntoCounts } from '../planner';
import { weightedSum } from '../weights';

describe('planner', () => {
  it('matches the worked example and handles already exceeding 75 percent', () => {
    expect(needNowWeighted(21, 30)).toBe(6);
    expect(needNowWeighted(25, 30)).toBe(0);
    expect(skipBudgetWeighted(20, needByEndWeighted(25, 30, 20))).toBeGreaterThan(0);
  });

  it('uses a strict greater-than test for unrecoverability', () => {
    expect(isUnrecoverable(5, 10, 9)).toBe(true);
    expect(isUnrecoverable(5, 10, 10)).toBe(false);
    expect(isUnrecoverable(5, 10, 3 * 10 - 4 * 5)).toBe(false);
  });

  it('splits weighted needs without exceeding the pool or undershooting reachable needs', () => {
    const pool = { lecture: 8, tutorial: 4, lab: 2 };
    for (const need of [0.5, 1, 2, 3.5, 6, 12]) {
      const counts = splitIntoCounts(need, pool);
      expect(counts.lecture).toBeLessThanOrEqual(pool.lecture);
      expect(counts.tutorial).toBeLessThanOrEqual(pool.tutorial);
      expect(counts.lab).toBeLessThanOrEqual(pool.lab);
      expect(weightedSum(counts)).toBeGreaterThanOrEqual(need);
    }
    expect(splitIntoCounts(99, pool)).toEqual(pool);
  });

  it('keeps needed and skip weighted budgets consistent', () => {
    const plan = buildPlan(21, 30, 20, { lecture: 12, tutorial: 8, lab: 4 });
    expect(plan.endWeighted + plan.skipWeighted).toBe(20);
    expect(plan.skipCounts.lecture + plan.endCounts.lecture).toBe(12);
    expect(plan.skipCounts.tutorial + plan.endCounts.tutorial).toBe(8);
    expect(plan.skipCounts.lab + plan.endCounts.lab).toBe(4);
  });
});
