# CLAUDE.md: Thapar Attendance Tracker

Read this file first, then ARCHITECTURE.md. Together they are the source of truth. If a prompt conflicts with them, stop and say so.

## What we are building
A login-free, Thapar-only web app. A student enters, per subject, the weekly schedule (which weekdays have lectures, tutorials, labs) and how many classes they attended. The app checks the official academic calendar, drops classes that fall on holidays, and shows:
- weighted attendance % as a pie chart (the full pie = the 75% target),
- how many more lectures, tutorials and labs they must attend to reach or keep 75%,
- how many they can safely skip.

## Stack (do not add anything else without asking)
- React 18 + TypeScript + Vite
- Recharts for the pie chart
- Vitest for unit tests
- Plain CSS with CSS variables in `src/styles/`. No Tailwind, no UI kit, no router, no state library
- No backend, no login, no analytics, no network calls. The calendar is a bundled JSON file. Data is saved in the browser's localStorage

## Commands (the user is on Windows, using Git Bash, not WSL)
- Install: `npm install`
- Run: `npm run dev` (open the URL it prints)
- Test: `npm test`
- Build: `npm run build`

The user is a beginner with git and developer tooling. At the end of every slice, reply with: (1) two or three plain-language sentences on what you built, (2) the exact commands to run it, (3) the exact commit command: `git add . && git commit -m "<message>"`. Do not use jargon without explaining it.

## Hard rules
1. **All math lives in `src/lib/` as pure functions.** Components display values; they never calculate.
2. **Weights come only from `src/lib/weights.ts`**: lecture = 1, lab = 1, tutorial = 0.5. Never hard-code 0.5 or 1 elsewhere.
3. **Dates are `"YYYY-MM-DD"` strings.** Parse and format only through `src/lib/dates.ts`, using local time. Never use `new Date("2026-10-19")` directly (it parses as UTC and can shift the day).
4. **Never invent calendar dates.** Holidays, non-teaching days and substitute days come only from `src/data/calendar.json`.
5. **Held counts are never typed by the user.** They are computed from schedule + calendar. The user types only attended counts and "not held" adjustments.
6. **Results appear only when Calculate is pressed.** Editing inputs afterwards marks results as stale; it does not recompute.
7. **Persist only through `src/lib/storage.ts`**, using a versioned key (`attendance-tracker:v1`) and try/catch around every read and write.
8. Every function in `src/lib/` has unit tests in `src/lib/__tests__/`.
9. Keep files small. One component per file in `src/components/`.

## Canonical formulas
Let `A` = weighted attended, `H` = weighted held so far, `F` = weighted classes remaining.
- Weighted sum of counts = `1*lectures + 1*labs + 0.5*tutorials`
- Attendance % = `A / H * 100` (if `H = 0`, show "No classes held yet")
- Weighted classes to attend in a row to reach 75% now: `w = 3H - 4A` (equals `(0.75H - A) / 0.25`)
- Weighted classes to attend by semester end: `a = max(0, 0.75(H + F) - A)`
- Safe-skip budget: `s = F - a`
- Unrecoverable when `w > F` (even attending every remaining class cannot reach 75%)

## Status thresholds
- Safe (green): 80% and above
- Caution (amber): 75% up to 80%
- Short (red): below 75%
- Unrecoverable (dark red): `w > F`

## UI summary (details in ARCHITECTURE.md section 8)
- Dark theme, matching the user's "Settings" screenshot: a rounded dark panel, grouped rounded cards, rows with label on the left, muted value on the right, chevron where the row opens an editor.
- **Left: collapsible side panel** holding every input field, with the **Calculate button pinned at the very bottom**.
- **Right (the larger side): pie chart** where the full circle = the 75% target. Scrolling down shows the stats: classes needed to reach or keep 75%, and classes that can be skipped.

## Definition of done for any slice
- `npm test` passes, `npm run build` passes, no TypeScript errors, no console errors in the browser.
- Only the files listed for the slice were touched, unless a fix required more (say which and why).
- You stayed inside the slice's time box. If something is taking longer, cut scope and list what you skipped.
