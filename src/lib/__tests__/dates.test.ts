import { describe, expect, it } from 'vitest';
import { addDays, eachDay, formatDate, parseDate, today, weekdayOf } from '../dates';

describe('dates', () => {
  it('parses and formats local calendar dates', () => {
    expect(formatDate(parseDate('2026-10-31'))).toBe('2026-10-31');
    expect(weekdayOf('2026-10-31')).toBe(6);
  });

  it('adds days and returns inclusive ranges', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(eachDay('2026-10-12', '2026-10-14')).toEqual([
      '2026-10-12', '2026-10-13', '2026-10-14',
    ]);
    expect(eachDay('2026-10-14', '2026-10-12')).toEqual([]);
  });

  it('maps Sunday to 7 and can return today', () => {
    expect(weekdayOf('2026-11-01')).toBe(7);
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('rejects invalid date strings and impossible dates', () => {
    expect(() => parseDate('2026-02-30')).toThrow();
    expect(() => parseDate('10/12/2026')).toThrow();
  });
});
