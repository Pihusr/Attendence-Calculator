import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type { ClassType, Counts, Results, Subject, Weekday } from '../types';
import { calculateResults } from '../lib/calculate';
import { loadState, saveState, type StoredState } from '../lib/storage';
import { today } from '../lib/dates';

export interface AppState {
  subjects: Subject[];
  selectedId: string;
  asOf: string;
  asOfCustom: boolean;
  sidebarOpen: boolean;
  results: Results | null;
}

interface Store {
  state: AppState;
  subject: Subject;
  addSubject: () => void;
  deleteSubject: (id: string) => void;
  selectSubject: (id: string) => void;
  updateSubject: (patch: Partial<Omit<Subject, 'id'>>) => void;
  setAsOf: (date: string) => void;
  toggleSidebar: () => void;
  calculate: () => void;
}

type Action =
  | { type: 'addSubject'; subject: Subject }
  | { type: 'deleteSubject'; id: string }
  | { type: 'selectSubject'; id: string }
  | { type: 'updateSubject'; patch: Partial<Omit<Subject, 'id'>> }
  | { type: 'setAsOf'; date: string }
  | { type: 'toggleSidebar' }
  | { type: 'calculate' };

const EMPTY_COUNTS: Counts = { lecture: 0, tutorial: 0, lab: 0 };

function createSubject(name = ''): Subject {
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `subject-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    batch: 'UG-I',
    startDate: null,
    schedule: { lecture: [], tutorial: [], lab: [] },
    attended: { ...EMPTY_COUNTS },
    notHeld: { ...EMPTY_COUNTS },
    lastPercent: null,
    lastStatus: 'none',
  };
}

function initializeState(): AppState {
  const saved = loadState();
  const subjects = saved?.subjects.length ? saved.subjects : [createSubject()];
  const selectedId = subjects.some((subject) => subject.id === saved?.selectedId)
    ? saved!.selectedId
    : subjects[0].id;
  return {
    subjects,
    selectedId,
    asOf: saved?.asOf ?? today(),
    asOfCustom: saved?.asOf !== null && saved?.asOf !== undefined,
    sidebarOpen: typeof window !== 'undefined' && window.matchMedia('(max-width: 800px)').matches
      ? false
      : saved?.sidebarOpen ?? true,
    results: null,
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'addSubject':
      return {
        ...state,
        subjects: [...state.subjects, action.subject],
        selectedId: action.subject.id,
        results: null,
      };
    case 'deleteSubject': {
      if (state.subjects.length <= 1) return state;
      const subjects = state.subjects.filter((subject) => subject.id !== action.id);
      return {
        ...state,
        subjects,
        selectedId: state.selectedId === action.id ? subjects[0].id : state.selectedId,
        results: null,
      };
    }
    case 'selectSubject':
      return state.subjects.some((subject) => subject.id === action.id)
        ? { ...state, selectedId: action.id, results: null }
        : state;
    case 'updateSubject':
      return {
        ...state,
        subjects: state.subjects.map((subject) => subject.id === state.selectedId
          ? { ...subject, ...action.patch }
          : subject),
      };
    case 'setAsOf':
      return { ...state, asOf: action.date, asOfCustom: true };
    case 'toggleSidebar':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'calculate': {
      const subject = state.subjects.find((item) => item.id === state.selectedId);
      if (!subject) return state;
      const results = calculateResults(subject, state.asOf);
      return {
        ...state,
        results,
        subjects: state.subjects.map((item) => item.id === subject.id
          ? { ...item, lastPercent: results.percent, lastStatus: results.status }
          : item),
      };
    }
  }
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initializeState);
  const subject = state.subjects.find((item) => item.id === state.selectedId) ?? state.subjects[0];

  useEffect(() => {
    const persisted: StoredState = {
      subjects: state.subjects,
      selectedId: state.selectedId,
      asOf: state.asOfCustom ? state.asOf : null,
      sidebarOpen: state.sidebarOpen,
    };
    saveState(persisted);
  }, [state.subjects, state.selectedId, state.asOf, state.asOfCustom, state.sidebarOpen]);

  const addSubject = useCallback(() => {
    dispatch({ type: 'addSubject', subject: createSubject(`Subject ${state.subjects.length + 1}`) });
  }, [state.subjects.length]);
  const deleteSubject = useCallback((id: string) => dispatch({ type: 'deleteSubject', id }), []);
  const selectSubject = useCallback((id: string) => dispatch({ type: 'selectSubject', id }), []);
  const updateSubject = useCallback((patch: Partial<Omit<Subject, 'id'>>) => {
    dispatch({ type: 'updateSubject', patch });
  }, []);
  const setAsOf = useCallback((date: string) => dispatch({ type: 'setAsOf', date }), []);
  const toggleSidebar = useCallback(() => dispatch({ type: 'toggleSidebar' }), []);
  const calculate = useCallback(() => dispatch({ type: 'calculate' }), []);

  const value = useMemo<Store>(() => ({
    state, subject, addSubject, deleteSubject, selectSubject, updateSubject, setAsOf, toggleSidebar, calculate,
  }), [state, subject, addSubject, deleteSubject, selectSubject, updateSubject, setAsOf, toggleSidebar, calculate]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}

export function setScheduleDay(
  schedule: Subject['schedule'],
  type: ClassType,
  day: Weekday,
): Subject['schedule'] {
  const selected = schedule[type].includes(day)
    ? schedule[type].filter((value) => value !== day)
    : [...schedule[type], day].sort();
  return { ...schedule, [type]: selected };
}
