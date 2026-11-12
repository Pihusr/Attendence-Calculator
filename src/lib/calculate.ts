import type { Results, Subject } from '../types';
import { percent, statusFor, validateAttended, weightedTotals } from './attendance';
import { batchStart } from './calendar';
import { heldAndRemaining, removedClasses } from './schedule';
import { buildPlan } from './planner';

export function calculateResults(subject: Subject, asOf: string): Results {
  const { held, remaining } = heldAndRemaining(subject, asOf);
  const attended = validateAttended(subject.attended, held).attended;
  const weighted = weightedTotals(attended, held, remaining);
  const plan = buildPlan(weighted.A, weighted.H, weighted.F, remaining);
  const attendancePercent = percent(weighted.A, weighted.H);
  const start = subject.startDate ?? batchStart(subject.batch);
  const inputs = {
    id: subject.id,
    name: subject.name,
    batch: subject.batch,
    startDate: subject.startDate,
    schedule: subject.schedule,
    attended: subject.attended,
    notHeld: subject.notHeld,
  };

  return {
    subjectId: subject.id,
    inputSnapshot: JSON.stringify({ subject: inputs, asOf }),
    asOf,
    held,
    remaining,
    weighted,
    percent: attendancePercent,
    status: statusFor(attendancePercent, plan.unrecoverable),
    plan,
    removed: removedClasses(subject, start, asOf),
  };
}
