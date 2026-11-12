import calendarJson from '../data/calendar.json';
import type { BatchId, Weekday } from '../types';
import { eachDay, weekdayOf } from './dates';

interface CalendarJson {
  id: string;
  label: string;
  batches: Record<BatchId, { start: string }>;
  lastTeachingDay: string;
  estWindow: { start: string; end: string };
  holidays: Array<{ date: string; name: string }>;
  nonTeaching: Array<
    | { date: string; name: string }
    | { from: string; to: string; name: string }
  >;
  substituteDays: Array<{ date: string; followsWeekday: Weekday; note: string }>;
  assumptions: { saturdaysOffByDefault: boolean; classesHeldDuringMST: boolean };
}

export interface CalendarData extends Omit<CalendarJson, 'nonTeaching'> {
  nonTeaching: Array<{ date: string; name: string }>;
}

const source = calendarJson as CalendarJson;
const expandedNonTeaching = source.nonTeaching.flatMap((entry) => {
  if ('date' in entry) {
    return [{ date: entry.date, name: entry.name }];
  }
  return eachDay(entry.from, entry.to).map((date) => ({ date, name: entry.name }));
});

const calendar: CalendarData = { ...source, nonTeaching: expandedNonTeaching };

export function getCalendar(): CalendarData {
  return calendar;
}

export function batchStart(batch: BatchId): string {
  return calendar.batches[batch].start;
}

export function lastTeachingDay(): string {
  return calendar.lastTeachingDay;
}

export function dayInfo(date: string): {
  teaching: boolean;
  effectiveWeekday: Weekday | null;
  reason: string | null;
} {
  const earliestStart = Object.values(calendar.batches)
    .map(({ start }) => start)
    .sort()[0];

  if (date < earliestStart || date > calendar.lastTeachingDay) {
    return { teaching: false, effectiveWeekday: null, reason: 'outside semester' };
  }
  const holiday = calendar.holidays.find((entry) => entry.date === date);
  if (holiday) {
    return { teaching: false, effectiveWeekday: null, reason: holiday.name };
  }
  const nonTeaching = calendar.nonTeaching.find((entry) => entry.date === date);
  if (nonTeaching) {
    return { teaching: false, effectiveWeekday: null, reason: nonTeaching.name };
  }
  const substitute = calendar.substituteDays.find((entry) => entry.date === date);
  if (substitute) {
    return { teaching: true, effectiveWeekday: substitute.followsWeekday, reason: null };
  }

  const weekday = weekdayOf(date);
  if (weekday === 7) {
    return { teaching: false, effectiveWeekday: null, reason: 'Sunday' };
  }
  if (weekday === 6) {
    return { teaching: false, effectiveWeekday: null, reason: 'Saturday' };
  }
  return { teaching: true, effectiveWeekday: weekday as Weekday, reason: null };
}
