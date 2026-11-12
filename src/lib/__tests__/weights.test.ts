import { describe, expect, it } from 'vitest';
import { weightedSum, WEIGHTS } from '../weights';

describe('weights', () => {
  it('weights lectures and labs as 1 and tutorials as 0.5', () => {
    expect(WEIGHTS).toEqual({ lecture: 1, lab: 1, tutorial: 0.5 });
    expect(weightedSum({ lecture: 2, tutorial: 3, lab: 1 })).toBe(4.5);
  });
});
