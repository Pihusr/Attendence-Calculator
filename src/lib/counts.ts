import type { ClassType, Counts } from '../types';

export function setCount(counts: Counts, type: ClassType, value: number): Counts {
  return { ...counts, [type]: Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0 };
}

export function adjustCount(value: number, direction: 1 | -1): number {
  return Math.max(0, value + direction);
}
