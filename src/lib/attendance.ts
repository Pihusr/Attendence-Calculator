import type { Counts, Status } from '../types';
import { weightedSum } from './weights';

export function weightedTotals(
  attended: Counts,
  held: Counts,
  remaining: Counts,
): { A: number; H: number; F: number } {
  return { A: weightedSum(attended), H: weightedSum(held), F: weightedSum(remaining) };
}

export function percent(A: number, H: number): number | null {
  return H === 0 ? null : (A / H) * 100;
}

export function statusFor(value: number | null, unrecoverable: boolean): Status {
  if (unrecoverable) {
    return 'unrecoverable';
  }
  if (value === null) {
    return 'none';
  }
  if (value >= 80) {
    return 'safe';
  }
  if (value >= 75) {
    return 'caution';
  }
  return 'short';
}

export function validateAttended(
  attended: Counts,
  held: Counts,
): { attended: Counts; errors: string[] } {
  const errors: string[] = [];
  const clamped = { ...attended };
  for (const type of ['lecture', 'tutorial', 'lab'] as const) {
    const value = Math.min(held[type], Math.max(0, attended[type]));
    if (value !== attended[type]) {
      errors.push(`${type} attended count was clamped to 0..${held[type]}`);
    }
    clamped[type] = value;
  }
  return { attended: clamped, errors };
}
