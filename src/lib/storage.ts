import type { Subject } from '../types';

export interface StoredState {
  subjects: Subject[];
  selectedId: string;
  asOf: string | null;
  sidebarOpen: boolean;
}

const STORAGE_KEY = 'attendance-tracker:v1';

function isStoredState(value: unknown): value is StoredState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const state = value as Partial<StoredState>;
  return Array.isArray(state.subjects)
    && typeof state.selectedId === 'string'
    && (typeof state.asOf === 'string' || state.asOf === null)
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
