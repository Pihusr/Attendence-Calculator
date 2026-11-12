import type { ClassType, Counts, RemovedClass, Subject } from '../types';
import { addDays, eachDay, weekdayOf } from './dates';
import { batchStart, dayInfo, lastTeachingDay } from './calendar';

const CLASS_TYPES: ClassType[] = ['lecture', 'tutorial', 'lab'];

export function classDates(subject: Subject, from: string, to: string): Record<ClassType, string[]> {
  const dates: Record<ClassType, string[]> = { lecture: [], tutorial: [], lab: [] };
  for (const date of eachDay(from, to)) {
    const info = dayInfo(date);
    if (!info.teaching || info.effectiveWeekday === null) {
      continue;
    }
    for (const type of CLASS_TYPES) {
      if (subject.schedule[type].includes(info.effectiveWeekday)) {
        dates[type].push(date);
      }
    }
  }
  return dates;
}

export function countClasses(subject: Subject, from: string, to: string): Counts {
  const dates = classDates(subject, from, to);
  return {
    lecture: dates.lecture.length,
    tutorial: dates.tutorial.length,
    lab: dates.lab.length,
  };
}

export function removedClasses(subject: Subject, from: string, to: string): RemovedClass[] {
  const removed: RemovedClass[] = [];
  for (const date of eachDay(from, to)) {
    const realWeekday = weekdayOf(date);
    if (realWeekday > 5) {
      continue;
    }
    const info = dayInfo(date);
    if (info.teaching || info.reason === null || info.reason === 'outside semester') {
      continue;
    }
    for (const type of CLASS_TYPES) {
      if (subject.schedule[type].includes(realWeekday as 1 | 2 | 3 | 4 | 5)) {
        removed.push({ date, type, reason: info.reason });
      }
    }
  }
  return removed;
}

export function heldAndRemaining(subject: Subject, asOf: string): { held: Counts; remaining: Counts } {
  const start = subject.startDate ?? batchStart(subject.batch);
  const rawHeld = countClasses(subject, start, asOf);
  const held: Counts = {
    lecture: Math.max(0, rawHeld.lecture - subject.notHeld.lecture),
    tutorial: Math.max(0, rawHeld.tutorial - subject.notHeld.tutorial),
    lab: Math.max(0, rawHeld.lab - subject.notHeld.lab),
  };
  const remaining = countClasses(subject, addDays(asOf, 1), lastTeachingDay());
  return { held, remaining };
}
