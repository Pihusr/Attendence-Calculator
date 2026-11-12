import { describe, expect, it } from 'vitest';
import type { Subject } from '../../types';
import { classDates, heldAndRemaining, removedClasses } from '../schedule';

const subject: Subject = {
  id: 'cs',
  name: 'Computer Science',
  batch: 'UG-I',
  startDate: '2026-10-12',
  schedule: { lecture: [1], tutorial: [2], lab: [5] },
  attended: { lecture: 0, tutorial: 0, lab: 0 },
  notHeld: { lecture: 0, tutorial: 0, lab: 0 },
  lastPercent: null,
  lastStatus: 'none',
};

describe('schedule', () => {
  it('counts Monday lectures between 12 and 26 October after exceptions', () => {
    expect(heldAndRemaining(subject, '2026-10-26').held.lecture).toBe(1);
    expect(removedClasses(subject, '2026-10-12', '2026-10-26')).toEqual([
      { date: '2026-10-19', type: 'lecture', reason: 'Non-teaching day (made up on 31 Oct)' },
      { date: '2026-10-20', type: 'tutorial', reason: 'Dussehra' },
      { date: '2026-10-26', type: 'lecture', reason: 'Birthday of Maharishi Balmiki Ji' },
    ]);
  });

  it('counts Monday timetable on 31 October and 28 November only', () => {
    expect(classDates(subject, '2026-10-31', '2026-10-31').lecture).toEqual(['2026-10-31']);
    expect(classDates(subject, '2026-11-28', '2026-11-28').lecture).toEqual(['2026-11-28']);
    expect(classDates(subject, '2026-11-23', '2026-11-24').lecture).toEqual([]);

    const mondayAndTuesday: Subject = {
      ...subject,
      schedule: { lecture: [1, 2], tutorial: [], lab: [] },
    };
    expect(removedClasses(mondayAndTuesday, '2026-11-23', '2026-11-24')).toEqual([
      { date: '2026-11-23', type: 'lecture', reason: 'Non-teaching day (made up on 28 Nov)' },
      { date: '2026-11-24', type: 'lecture', reason: 'Gurupurab (Guru Nanak Dev Ji)' },
    ]);
  });

  it('removes all scheduled classes during the Diwali break', () => {
    const daily: Subject = {
      ...subject,
      schedule: { lecture: [1, 2, 3, 4, 5], tutorial: [1, 2, 3, 4, 5], lab: [1, 2, 3, 4, 5] },
    };
    expect(classDates(daily, '2026-11-09', '2026-11-13')).toEqual({
      lecture: [], tutorial: [], lab: [],
    });
    expect(removedClasses(daily, '2026-11-09', '2026-11-13')).toHaveLength(15);
  });

  it('does not schedule on ordinary Saturdays or Sundays', () => {
    const weekdays: Subject = {
      ...subject,
      schedule: { lecture: [1, 2, 3, 4, 5], tutorial: [], lab: [] },
    };
    expect(classDates(weekdays, '2026-10-24', '2026-10-25').lecture).toEqual([]);
  });

  it('subtracts not-held adjustments and computes remaining classes', () => {
    const adjusted = { ...subject, notHeld: { lecture: 1, tutorial: 0, lab: 0 } };
    expect(heldAndRemaining(adjusted, '2026-10-26').held.lecture).toBe(0);
    expect(heldAndRemaining(subject, '2026-12-05').remaining).toEqual({
      lecture: 0, tutorial: 0, lab: 0,
    });
  });
});
