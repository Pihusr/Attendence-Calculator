import { describe, expect, it } from 'vitest';
import { batchStart, dayInfo, getCalendar, lastTeachingDay } from '../calendar';

describe('calendar', () => {
  it('expands Diwali range and returns batch dates', () => {
    expect(getCalendar().nonTeaching.filter(({ name }) => name === 'Diwali break')).toHaveLength(5);
    expect(batchStart('UG-I')).toBe('2026-08-17');
    expect(lastTeachingDay()).toBe('2026-12-04');
  });

  it('identifies holidays, non-teaching dates, substitutions and weekends', () => {
    expect(dayInfo('2026-10-26').reason).toBe('Birthday of Maharishi Balmiki Ji');
    expect(dayInfo('2026-10-19').reason).toContain('Non-teaching');
    expect(dayInfo('2026-10-31')).toMatchObject({ teaching: true, effectiveWeekday: 1 });
    expect(dayInfo('2026-11-28')).toMatchObject({ teaching: true, effectiveWeekday: 1 });
    expect(dayInfo('2026-10-25')).toMatchObject({ teaching: false, reason: 'Sunday' });
    expect(dayInfo('2026-10-24')).toMatchObject({ teaching: false, reason: 'Saturday' });
  });
});
