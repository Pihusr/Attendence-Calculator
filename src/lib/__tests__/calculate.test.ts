import { describe, expect, it } from 'vitest';
import type { Subject } from '../../types';
import { calculateResults } from '../calculate';
import { countClasses } from '../schedule';

const subject: Subject = {
  id: 'math',
  name: 'Math',
  batch: 'UG-I',
  startDate: '2026-10-12',
  schedule: { lecture: [1], tutorial: [], lab: [] },
  attended: { lecture: 1, tutorial: 0, lab: 0 },
  notHeld: { lecture: 0, tutorial: 0, lab: 0 },
  lastPercent: null,
  lastStatus: 'none',
};

describe('calculateResults', () => {
  it('calculates the UG-I calendar scenario through 12 November 2026', () => {
    const scenario: Subject = {
      ...subject,
      batch: 'UG-I',
      startDate: null,
      schedule: { lecture: [1, 3, 4], tutorial: [2], lab: [5] },
      attended: { lecture: 20, tutorial: 5, lab: 8 },
      notHeld: { lecture: 0, tutorial: 0, lab: 0 },
    };

    const result = calculateResults(scenario, '2026-11-12');

    expect(result.held).toEqual({ lecture: 35, tutorial: 11, lab: 10 });
    expect(result.remaining).toEqual({ lecture: 9, tutorial: 2, lab: 3 });
    expect(result.weighted).toEqual({ A: 30.5, H: 50.5, F: 13 });
    expect(result.percent).toBeCloseTo(30.5 / 50.5 * 100);
    expect(result.status).toBe('unrecoverable');
    expect(result.plan).toEqual({
      nowWeighted: 29.5,
      nowCounts: { lecture: 9, tutorial: 2, lab: 3 },
      endWeighted: 17.125,
      endCounts: { lecture: 9, tutorial: 2, lab: 3 },
      skipWeighted: 0,
      skipCounts: { lecture: 0, tutorial: 0, lab: 0 },
      unrecoverable: true,
    });

    expect(result.removed.map(({ date }) => date)).toEqual(expect.arrayContaining([
      '2026-09-04',
      '2026-10-02',
      '2026-10-19',
      '2026-10-20',
      '2026-10-26',
      '2026-11-09',
      '2026-11-10',
      '2026-11-11',
      '2026-11-12',
    ]));
    expect(countClasses(scenario, '2026-11-09', '2026-11-13'))
      .toEqual({ lecture: 0, tutorial: 0, lab: 0 });
    expect(countClasses(scenario, '2026-10-31', '2026-10-31'))
      .toEqual({ lecture: 1, tutorial: 0, lab: 0 });
  });

  it('combines the engine and snapshots all calculation inputs', () => {
    const result = calculateResults(subject, '2026-10-26');
    expect(result.held.lecture).toBe(1);
    expect(result.attended).toEqual({ lecture: 1, tutorial: 0, lab: 0 });
    expect(result.weighted).toMatchObject({ A: 1, H: 1 });
    expect(result.percent).toBe(100);
    expect(result.targetProgressPercent).toBeCloseTo(100 / 75 * 100);
    expect(result.aboveTargetBy).toBe(25);
    expect(result.targetPie).toEqual({ attended: 75, gap: 0 });
    expect(result.bestPossiblePercent).toBe(100);
    expect(result.asOf).toBe('2026-10-26');
    expect(JSON.parse(result.inputSnapshot)).toMatchObject({
      subject: { id: 'math', schedule: subject.schedule },
      asOf: '2026-10-26',
    });
  });

  it('keeps an empty attendance result as an unfilled target pie', () => {
    const result = calculateResults({
      ...subject,
      schedule: { lecture: [], tutorial: [], lab: [] },
      attended: { lecture: 0, tutorial: 0, lab: 0 },
    }, '2026-10-26');

    expect(result.percent).toBeNull();
    expect(result.targetProgressPercent).toBeNull();
    expect(result.targetPie).toEqual({ attended: 0, gap: 75 });
    expect(result.bestPossiblePercent).toBeNull();
  });
});
