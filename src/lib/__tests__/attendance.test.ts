import { describe, expect, it } from 'vitest';
import { percent, statusFor, validateAttended, weightedTotals } from '../attendance';

describe('attendance', () => {
  it('calculates weighted totals and attendance percentage', () => {
    const counts = { lecture: 30, tutorial: 0, lab: 0 };
    expect(weightedTotals({ lecture: 21, tutorial: 0, lab: 0 }, counts, counts)).toEqual({
      A: 21, H: 30, F: 30,
    });
    expect(percent(21, 30)).toBe(70);
    expect(percent(0, 0)).toBeNull();
  });

  it('clamps attended counts to held counts and reports adjustments', () => {
    expect(validateAttended(
      { lecture: 4, tutorial: -1, lab: 2 },
      { lecture: 3, tutorial: 2, lab: 1 },
    )).toEqual({
      attended: { lecture: 3, tutorial: 0, lab: 1 },
      errors: [
        'lecture attended count was clamped to 0..3',
        'tutorial attended count was clamped to 0..2',
        'lab attended count was clamped to 0..1',
      ],
    });
  });

  it('selects statuses by thresholds and unrecoverability', () => {
    expect(statusFor(80, false)).toBe('safe');
    expect(statusFor(75, false)).toBe('caution');
    expect(statusFor(74, false)).toBe('short');
    expect(statusFor(null, false)).toBe('none');
    expect(statusFor(90, true)).toBe('unrecoverable');
  });
});
