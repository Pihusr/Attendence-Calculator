import { describe, expect, it } from 'vitest';
import type { Subject } from '../../types';
import { calculateResults } from '../calculate';

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
  it('combines the engine and snapshots all calculation inputs', () => {
    const result = calculateResults(subject, '2026-10-26');
    expect(result.held.lecture).toBe(1);
    expect(result.weighted).toMatchObject({ A: 1, H: 1 });
    expect(result.percent).toBe(100);
    expect(result.asOf).toBe('2026-10-26');
    expect(JSON.parse(result.inputSnapshot)).toMatchObject({
      subject: { id: 'math', schedule: subject.schedule },
      asOf: '2026-10-26',
    });
  });
});
