import type { Subject } from '../types';
import { parseDate } from './dates';

export interface StoredState {
  subjects: Subject[];
  selectedId: string;
  asOf: string | null;
  sidebarOpen: boolean;
}

const STORAGE_KEY = 'attendance-tracker:v1';

function isDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    parseDate(value);
    return true;
  } catch {
    return false;
  }
}

function isSubject(value: unknown): value is Subject {
  if (typeof value !== 'object' || value === null) return false;
  const subject = value as Partial<Subject>;
  const countsAreValid = (counts: unknown) => typeof counts === 'object' && counts !== null
    && ['lecture', 'tutorial', 'lab'].every((type) =>
      Number.isInteger((counts as Record<string, unknown>)[type])
      && (counts as Record<string, number>)[type] >= 0);
  const schedule = subject.schedule;
  return typeof subject.id === 'string'
    && typeof subject.name === 'string'
    && ['UG-I', 'PG-I', 'PhD-I'].includes(subject.batch ?? '')
    && (subject.startDate === null || isDate(subject.startDate))
    && typeof schedule === 'object' && schedule !== null
    && ['lecture', 'tutorial', 'lab'].every((type) => Array.isArray(schedule[type as keyof typeof schedule]))
    && countsAreValid(subject.attended)
    && countsAreValid(subject.notHeld)
    && (subject.lastPercent === null || typeof subject.lastPercent === 'number')
    && ['safe', 'caution', 'short', 'unrecoverable', 'none'].includes(subject.lastStatus ?? '');
}

function isStoredState(value: unknown): value is StoredState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const state = value as Partial<StoredState>;
  return Array.isArray(state.subjects)
    && state.subjects.every(isSubject)
    && typeof state.selectedId === 'string'
    && (state.asOf === null || isDate(state.asOf))
    && typeof state.sidebarOpen === 'boolean';
}

export function loadState(): StoredState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return null;
    }
    const value: unknown = JSON.parse(raw);
    return isStoredState(value) ? value : null;
  } catch {
    return null;
  }
}

export function saveState(state: StoredState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    return;
  }
}
