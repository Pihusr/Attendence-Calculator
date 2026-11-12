# ARCHITECTURE.md: Thapar Attendance Tracker

## 1. Big picture

```
 calendar.json ──► lib/calendar.ts ──┐
                                     ▼
 Subject (schedule, attended) ──► lib/schedule.ts ──► held / remaining class counts
                                     │                         │
                                     ▼                         ▼
                              lib/weights.ts ──► lib/attendance.ts ──► A, H, F, percent, status
                                                                  │
                                                                  ▼
                                                          lib/planner.ts ──► needed / skip counts
                                                                  │
                                       lib/calculate.ts  (one entry point that wires all of the above)
                                                                  │
 Sidebar inputs ──► state/store.tsx ──(Calculate pressed)──► Results ──► Main panel
                         │                                              (pie, stats, breakdown)
                         └──► lib/storage.ts ──► localStorage
```

Only `lib/calculate.ts` is called by the UI. Everything below it is pure functions with no React and no browser APIs.

## 2. File tree

```
src/
  data/calendar.json
  types.ts
  lib/
    dates.ts  weights.ts  calendar.ts  schedule.ts
    attendance.ts  planner.ts  calculate.ts  storage.ts
    __tests__/  (one test file per lib file)
  state/store.tsx
  components/
    AppShell.tsx
    sidebar/
      Sidebar.tsx  SettingsGroup.tsx  SettingsRow.tsx
      SubjectPicker.tsx  WeekdayPicker.tsx  StepperRow.tsx
      DateRow.tsx  BatchRow.tsx  CalculateButton.tsx
    main/
      MainPanel.tsx  AttendancePie.tsx  StatusBadge.tsx
      StaleBanner.tsx  StatsPanel.tsx  BreakdownTable.tsx  RemovedDatesList.tsx
  styles/ tokens.css  layout.css  settings.css  main.css
  App.tsx  main.tsx
```

## 3. Types (`src/types.ts`)

```ts
export type ClassType = 'lecture' | 'tutorial' | 'lab';
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6;          // Mon=1 ... Sat=6
export type BatchId = 'UG-I' | 'PG-I' | 'PhD-I';
export type Status = 'safe' | 'caution' | 'short' | 'unrecoverable' | 'none';
export type Counts = Record<ClassType, number>;

export interface Subject {
  id: string;
  name: string;
  batch: BatchId;
  startDate: string | null;                 // null = use batch teaching start from calendar
  schedule: Record<ClassType, Weekday[]>;   // weekdays on which each type happens
  attended: Counts;
  notHeld: Counts;                          // cancelled classes the user removes from "held"
  lastPercent: number | null;               // saved after Calculate, used for the colour chip
  lastStatus: Status;
}

export interface Results {
  subjectId: string;
  inputSnapshot: string;                    // JSON of inputs at calculate time, used for stale check
  asOf: string;
  held: Counts;                             // after calendar + notHeld
  remaining: Counts;
  weighted: { A: number; H: number; F: number };
  percent: number | null;
  status: Status;
  plan: Plan;
  removed: RemovedClass[];                  // scheduled classes dropped for holidays, for display
}

export interface Plan {
  nowWeighted: number;                      // w: weighted classes in a row to reach 75% now (0 if already there)
  nowCounts: Counts;                        // same, as lectures/tutorials/labs
  endWeighted: number;                      // a: weighted classes to attend by semester end
  endCounts: Counts;
  skipWeighted: number;                     // s: weighted classes that can still be missed
  skipCounts: Counts;
  unrecoverable: boolean;
}

export interface RemovedClass { date: string; type: ClassType; reason: string; }
```

## 4. Calendar data (`src/data/calendar.json`), authoritative for v1

Weekday numbers: Mon=1.

```json
{
  "id": "2026-27-odd",
  "label": "Odd Sem 2026-27",
  "batches": {
    "UG-I":  { "start": "2026-08-17" },
    "PhD-I": { "start": "2026-08-17" },
    "PG-I":  { "start": "2026-08-03" }
  },
  "lastTeachingDay": "2026-12-04",
  "estWindow": { "start": "2026-12-07", "end": "2026-12-19" },
  "holidays": [
    { "date": "2026-09-04", "name": "Janmashtami" },
    { "date": "2026-10-02", "name": "Gandhi Jayanti" },
    { "date": "2026-10-20", "name": "Dussehra" },
    { "date": "2026-10-26", "name": "Birthday of Maharishi Balmiki Ji" },
    { "date": "2026-11-24", "name": "Gurupurab (Guru Nanak Dev Ji)" },
    { "date": "2026-12-14", "name": "Shaheedi Diwas (Guru Teg Bahadur Ji)" }
  ],
  "nonTeaching": [
    { "date": "2026-10-19", "name": "Non-teaching day (made up on 31 Oct)" },
    { "date": "2026-11-23", "name": "Non-teaching day (made up on 28 Nov)" },
    { "from": "2026-11-09", "to": "2026-11-13", "name": "Diwali break" }
  ],
  "substituteDays": [
    { "date": "2026-10-31", "followsWeekday": 1, "note": "Saturday follows Monday's timetable, in lieu of 19 Oct" },
    { "date": "2026-11-28", "followsWeekday": 1, "note": "Saturday follows Monday's timetable, in lieu of 23 Nov" }
  ],
  "assumptions": { "saturdaysOffByDefault": true, "classesHeldDuringMST": true }
}
```

## 5. Function reference (what calculates what, and who calls it)

### `lib/dates.ts`: called by everything that touches dates
| Function | Does |
|---|---|
| `parseDate(s)` | `"YYYY-MM-DD"` to a local-time `Date` |
| `formatDate(d)` | `Date` to `"YYYY-MM-DD"` |
| `addDays(s, n)` | returns the date string `n` days later |
| `eachDay(from, to)` | all date strings from `from` to `to` inclusive (empty if `from > to`) |
| `weekdayOf(s)` | Mon=1 ... Sun=7 |
| `today()` | today as a date string |

### `lib/weights.ts`: called by `attendance.ts`, `planner.ts`
- `WEIGHTS = { lecture: 1, lab: 1, tutorial: 0.5 }`
- `weightedSum(counts: Counts): number` = `1*lecture + 1*lab + 0.5*tutorial`

### `lib/calendar.ts`: called by `schedule.ts`
| Function | Does |
|---|---|
| `getCalendar()` | returns the bundled JSON, with `nonTeaching` ranges expanded to single dates |
| `batchStart(batch)` | teaching start date for a batch |
| `lastTeachingDay()` | `"2026-12-04"` |
| `dayInfo(date)` | returns `{ teaching: boolean, effectiveWeekday: Weekday \| null, reason: string \| null }` |

`dayInfo` rules, in this order:
1. Before the earliest batch start or after `lastTeachingDay`: not teaching, reason `"outside semester"`.
2. In `holidays`: not teaching, reason is the holiday name.
3. In expanded `nonTeaching`: not teaching, reason is its name.
4. In `substituteDays`: teaching, `effectiveWeekday = followsWeekday`.
5. Sunday: not teaching. Saturday (not a substitute day): not teaching, reason `"Saturday"`.
6. Otherwise: teaching, `effectiveWeekday = real weekday`.

### `lib/schedule.ts`: called by `calculate.ts`
| Function | Does |
|---|---|
| `classDates(subject, from, to)` | for each date in range where `dayInfo` is teaching, for each class type whose `schedule` contains `effectiveWeekday`, collect the date. Returns `Record<ClassType, string[]>` |
| `countClasses(subject, from, to)` | same as `classDates` but returns `Counts` (array lengths) |
| `removedClasses(subject, from, to)` | dates where the real weekday (Mon to Fri) is in a type's schedule but `dayInfo` is not teaching for a holiday or non-teaching reason. Returns `RemovedClass[]`, used only for display |
| `heldAndRemaining(subject, asOf)` | `held = countClasses(subject, start, asOf)` minus `subject.notHeld` (floor at 0 per type). `remaining = countClasses(subject, asOf+1, lastTeachingDay)`. `start = subject.startDate ?? batchStart(batch)`. Returns `{ held, remaining }` |

### `lib/attendance.ts`: called by `calculate.ts`
| Function | Does |
|---|---|
| `weightedTotals(attended, held, remaining)` | `A = weightedSum(attended)`, `H = weightedSum(held)`, `F = weightedSum(remaining)` |
| `percent(A, H)` | `A / H * 100`, or `null` if `H = 0` |
| `statusFor(percent, unrecoverable)` | `unrecoverable` gives `'unrecoverable'`; `null` gives `'none'`; `>= 80` gives `'safe'`; `>= 75` gives `'caution'`; else `'short'` |
| `validateAttended(attended, held)` | clamps each type to `0..held[type]` and returns `{ attended, errors[] }` |

### `lib/planner.ts`: called by `calculate.ts`
| Function | Does |
|---|---|
| `needNowWeighted(A, H)` | `max(0, 3H - 4A)` |
| `needByEndWeighted(A, H, F)` | `max(0, 0.75(H + F) - A)` |
| `skipBudgetWeighted(F, a)` | `max(0, F - a)` |
| `isUnrecoverable(A, H, F)` | `3H - 4A > F` |
| `splitIntoCounts(weightedNeed, pool)` | turns a weighted number into whole classes per type, using `pool: Counts` (what remains) as the mix. Steps: `f = weightedNeed / weightedSum(pool)`; start with `ceil(f * pool[type])` per type (never more than `pool[type]`); then, while total weight minus the weight of the type with the largest count is still `>= weightedNeed`, reduce that type by 1. Returns `Counts` |
| `buildPlan(A, H, F, remaining)` | wires the above. `nowCounts = splitIntoCounts(w, remaining)`, `endCounts = splitIntoCounts(a, remaining)`, `skipCounts = remaining - endCounts` per type. Returns `Plan` |

### `lib/calculate.ts`: the only function the UI calls
`calculateResults(subject, asOf): Results`
1. `{ held, remaining } = heldAndRemaining(subject, asOf)`
2. `attended = validateAttended(subject.attended, held).attended`
3. `{ A, H, F } = weightedTotals(attended, held, remaining)`
4. `plan = buildPlan(A, H, F, remaining)`
5. `status = statusFor(percent(A, H), plan.unrecoverable)`
6. `removed = removedClasses(subject, start, asOf)`
7. Return `Results`, with `inputSnapshot = JSON.stringify({ subject-inputs, asOf })`

### `lib/storage.ts`: called by `state/store.tsx`
- `loadState(): { subjects: Subject[]; selectedId: string; asOf: string | null; sidebarOpen: boolean } | null`
- `saveState(state): void`
- Key: `attendance-tracker:v1`. Both functions wrap `localStorage` in try/catch. On any error `loadState` returns `null` and `saveState` does nothing.

## 6. What happens when the user presses Calculate

1. `CalculateButton` calls `store.calculate()`.
2. `store.calculate()` reads the selected `Subject` and `asOf`, then calls `calculateResults(subject, asOf)`.
3. The store saves `results`, and copies `percent` and `status` onto the subject as `lastPercent` and `lastStatus`.
4. `MainPanel` re-renders: `AttendancePie`, `StatusBadge`, `StatsPanel`, `BreakdownTable`, `RemovedDatesList`.
5. `StaleBanner` shows whenever `JSON.stringify(current inputs + asOf) !== results.inputSnapshot`.

## 7. State (`state/store.tsx`, React context + `useReducer`)

```
state = { subjects, selectedId, asOf, sidebarOpen, results | null }
actions: addSubject, deleteSubject, selectSubject, updateSubject(patch),
         setAsOf, toggleSidebar, calculate
```
- `subjects`, `selectedId`, `asOf` (if the user changed it), and `sidebarOpen` are saved through `saveState` after every change.
- `results` is never saved. On a fresh load the main panel shows the empty state: "Press Calculate".
- `asOf` defaults to `today()` each load unless the user picked a date.

## 8. UI layout and what connects to what

### Layout (`AppShell`)
Two columns on desktop: `Sidebar` (about 360px, collapsible) and `MainPanel` (the rest, scrolls vertically). When collapsed, the sidebar shrinks to a narrow rail holding only the expand button. Below 800px wide the sidebar is an overlay drawer opened from a top-bar button.

### Visual language (match the user's Settings screenshot)
- Page background near black `#000`. Sidebar is one rounded panel (radius 20px, 1px border `#222`, background `#0c0c0d`) with a centred semibold title and a hairline under it.
- Inside, **groups**: rounded cards (radius 16px, background `#1b1b1d`) with 12px gap between groups.
- **Rows**: about 56px tall, 16px horizontal padding, label left in `#e8e8ea`, value right in `#8e8e93`, chevron `›` when the row expands an editor, divider `#2a2a2c` between rows. A row with a plain number and no chevron is a stepper row.
- Colours: safe `#34c759`, caution `#ff9f0a`, short `#ff453a`, unrecoverable `#b3261e`, muted pie remainder `#2a2a2c`.

### Sidebar contents, top to bottom (these are all the input fields)
| Group | Row | Value shown at right | Editor when tapped |
|---|---|---|---|
| Subject | Subject | selected subject name + colour chip | list of subjects, "Add subject", rename, delete |
| Course | Batch | `UG-I` | choose UG-I / PG-I / PhD-I |
| Course | Starts | date or "Batch default" | date input, reset button |
| Course | Counted up to | date, default today | date input |
| Weekly schedule | Lectures | `Mon, Wed, Thu` | `WeekdayPicker` (Mon to Fri toggles) |
| Weekly schedule | Tutorials | `Tue` | `WeekdayPicker` |
| Weekly schedule | Labs | `Fri` | `WeekdayPicker` |
| Attended so far | Lectures | number (no chevron) | `-` and `+` buttons and typed input |
| Attended so far | Tutorials | number | same |
| Attended so far | Labs | number | same |
| Classes not held | Lectures / Tutorials / Labs | number | same steppers, with a one-line hint "Cancelled by teacher" |
| (footer, pinned) | **Calculate** button | | runs `calculate()` |

### Component connections
```
App
└─ StoreProvider (state/store.tsx)
   └─ AppShell
      ├─ Sidebar  (reads subject, asOf, sidebarOpen; dispatches updateSubject, setAsOf, toggleSidebar, calculate)
      │   ├─ SettingsGroup > SettingsRow ...
      │   ├─ SubjectPicker, BatchRow, DateRow, WeekdayPicker, StepperRow
      │   └─ CalculateButton (pinned footer)
      └─ MainPanel (reads results, stale flag)
          ├─ StaleBanner
          ├─ hero: AttendancePie + big percent + StatusBadge
          ├─ StatsPanel (reads results.plan, results.remaining)
          ├─ BreakdownTable (reads held, remaining, weighted A/H/F)
          └─ RemovedDatesList (reads results.removed)
```

### Main panel: pie chart (`AttendancePie`)
- Recharts `PieChart`, solid (not a donut), `startAngle=90`, `endAngle=-270`.
- **The full circle represents the 75% target.** Two slices: `Attended = min(percent, 75)` in the status colour, and `Gap = max(75 - percent, 0)` in muted grey. At 75% or above the circle is completely filled.
- Beside or below the pie, large text shows the real attendance, for example `70.0%`, with a caption like `93% of the way to 75%` or `5.2% above the 75% target`, and the `StatusBadge`.
- Keep the 75 as one constant (`TARGET = 75`) so the meaning of "full circle" is easy to change.

### Main panel: scroll-down stats (`StatsPanel`)
Three cards, then a table:
1. **To reach 75% now**: `nowCounts` ("Attend 4 lectures, 2 tutorials, 1 lab in a row"). Shows "You're already above 75%" if `nowWeighted = 0`.
2. **To finish the semester at 75%**: `endCounts` out of `remaining`.
3. **You can skip**: `skipCounts`. If `unrecoverable`: a dark-red message "Even attending every remaining class gets you only X%", with X computed as `(A + F) / (H + F) * 100`.
4. A small table with one row per type: held, attended, remaining, needed, can skip.

## 9. Edge cases and expected behaviour
| Case | Behaviour |
|---|---|
| `H = 0` (nothing held yet) | no pie fill, caption "No classes held yet", status `none` |
| No weekdays chosen for any type | Calculate disabled, hint "Add your weekly schedule" |
| Attended typed above held | clamped to held; inline message in the stepper row |
| Holiday, non-teaching day or Diwali break | those classes are in neither held nor remaining |
| 31 Oct and 28 Nov (Saturdays) | count as Mondays: Monday classes happen that day |
| Other Saturdays and all Sundays | no classes |
| Counted-up-to date after 4 Dec | remaining is 0, held covers the full semester |
| Counted-up-to date before the start | held is 0 |
| Corrupt or missing localStorage | app starts with one empty subject, no error shown |
| Already above 75% | `nowWeighted = 0`; skip budget shown |
