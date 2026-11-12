export type ClassType = 'lecture' | 'tutorial' | 'lab';
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6;
export type BatchId = 'UG-I' | 'PG-I' | 'PhD-I';
export type Status = 'safe' | 'caution' | 'short' | 'unrecoverable' | 'none';
export type Counts = Record<ClassType, number>;

export interface Subject {
  id: string;
  name: string;
  batch: BatchId;
  startDate: string | null;
  schedule: Record<ClassType, Weekday[]>;
  attended: Counts;
  notHeld: Counts;
  lastPercent: number | null;
  lastStatus: Status;
}

export interface Results {
  subjectId: string;
  inputSnapshot: string;
  asOf: string;
  held: Counts;
  remaining: Counts;
  weighted: { A: number; H: number; F: number };
  percent: number | null;
  status: Status;
  plan: Plan;
  removed: RemovedClass[];
}

export interface Plan {
  nowWeighted: number;
  nowCounts: Counts;
  endWeighted: number;
  endCounts: Counts;
  skipWeighted: number;
  skipCounts: Counts;
  unrecoverable: boolean;
}

export interface RemovedClass {
  date: string;
  type: ClassType;
  reason: string;
}
