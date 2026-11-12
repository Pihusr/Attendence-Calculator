import { describe, expect, it } from 'vitest';
import { adjustCount, setCount } from '../counts';

const counts = { lecture: 1, tutorial: 2, lab: 3 };

describe('counts', () => {
  it('updates one count while keeping it a non-negative integer', () => {
    expect(setCount(counts, 'tutorial', 4.8)).toEqual({ lecture: 1, tutorial: 4, lab: 3 });
    expect(setCount(counts, 'lecture', -2)).toEqual({ lecture: 0, tutorial: 2, lab: 3 });
    expect(setCount(counts, 'lab', Number.NaN)).toEqual({ lecture: 1, tutorial: 2, lab: 0 });
  });

  it('steps a count up or down without allowing it below zero', () => {
    expect(adjustCount(2, 1)).toBe(3);
    expect(adjustCount(2, -1)).toBe(1);
    expect(adjustCount(0, -1)).toBe(0);
  });
});
