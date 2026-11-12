import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadState, saveState } from '../storage';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('storage', () => {
  it('returns null for corrupt JSON', () => {
    vi.stubGlobal('localStorage', { getItem: () => '{not json' });
    expect(loadState()).toBeNull();
  });

  it('rejects structurally corrupt stored subjects', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => JSON.stringify({
        subjects: [null],
        selectedId: 'broken',
        asOf: '2026-99-99',
        sidebarOpen: true,
      }),
    });
    expect(loadState()).toBeNull();
  });

  it('returns null when localStorage access throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
    });
    expect(loadState()).toBeNull();
    expect(() => saveState({
      subjects: [],
      selectedId: '',
      asOf: null,
      sidebarOpen: true,
    })).not.toThrow();
  });

  it('loads valid stored state and writes it under the versioned key', () => {
    let value: string | null = null;
    vi.stubGlobal('localStorage', {
      getItem: () => value,
      setItem: (_key: string, next: string) => { value = next; },
    });
    const state = { subjects: [], selectedId: 'one', asOf: null, sidebarOpen: true };
    saveState(state);
    expect(value).toBe(JSON.stringify(state));
    expect(loadState()).toEqual(state);
  });
});
