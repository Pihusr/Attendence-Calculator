# SLICES.md: 5 prompts for your AI coding agent (about 45 min total)

## How to use this file
1. Create an empty folder, for example `attendance-tracker`, and put `CLAUDE.md`, `ARCHITECTURE.md` and this file inside it.
2. In Git Bash, go into that folder and run: `git init`
3. Open your AI coding agent in that folder.
4. Paste **one prompt at a time**, in order. Wait for it to finish, check the "Check it worked" list, run the commit command the agent gives you, then paste the next one.

| # | Slice | Time box |
|---|---|---|
| 1 | Project setup + calculation engine + tests | 12 min |
| 2 | Layout + side panel with all input fields + Calculate button | 12 min |
| 3 | Pie chart + scroll-down stats | 10 min |
| 4 | Edge cases, stale results, multiple subjects, mobile | 7 min |
| 5 | Final check + README | 4 min |

---

## Prompt 1: Setup + calculation engine (12 min)

```text
Read CLAUDE.md and ARCHITECTURE.md fully before writing any code. Time box: 12 minutes.

Goal: create the project and build and test the whole calculation engine. No UI yet.

Do this:
1. Scaffold a Vite + React + TypeScript project in the current folder (not in a sub-folder). Install recharts and vitest. Add npm scripts "test" (vitest run), "dev" and "build".
2. Create src/types.ts exactly as in ARCHITECTURE.md section 3.
3. Create src/data/calendar.json exactly as in ARCHITECTURE.md section 4.
4. Create every file in src/lib/ (dates, weights, calendar, schedule, attendance, planner, calculate, storage) with the functions, signatures and rules in ARCHITECTURE.md section 5.
5. Write unit tests in src/lib/__tests__/ covering at least:
   - Subject with lecture on Monday only, from 2026-10-12 to 2026-10-26: held is 1 (12 Oct counts; 19 Oct non-teaching and 26 Oct holiday are removed).
   - 31 Oct 2026 (Saturday) counts as a Monday: a Monday-lecture subject gets a lecture that day.
   - 28 Nov 2026 also counts as Monday. 23 Nov (non-teaching) and 24 Nov (holiday) are removed.
   - The Diwali break 9 to 13 Nov removes every class on those days.
   - Other Saturdays and all Sundays have no classes.
   - A tutorial counts as 0.5 and a lecture or lab as 1 in weightedSum.
   - Worked example: H=30, A=21 gives percent 70 and needNowWeighted 6.
   - Already above 75%: needNowWeighted is 0 and the skip budget is positive.
   - isUnrecoverable is true when 3H - 4A > F and false otherwise; when F equals 3H - 4A exactly, it is false.
   - splitIntoCounts: result never exceeds the pool, and its weighted total is >= the weighted need.
   - Consistency: needByEnd + skipBudget equals F.
   - storage: loadState returns null for corrupt JSON and when localStorage throws.

Do not build any UI, do not add libraries other than recharts and vitest, and do not change the formulas.

Finish with: npm test passing, npm run build passing, then the plain-language summary and the git commit command, as CLAUDE.md says.
```

**Check it worked:** run `npm test`. You should see every test passing and no red text.

---

## Prompt 2: Layout + side panel + Calculate button (12 min)

```text
Read CLAUDE.md and ARCHITECTURE.md again (sections 7, 8 and 9 especially). Time box: 12 minutes.

Goal: build the app shell, the state store, and the collapsible side panel with every input field and the Calculate button at the very bottom. The main area only needs a simple placeholder for results this time.

Do this:
1. Create src/state/store.tsx (React context + useReducer) with the state and actions in ARCHITECTURE.md section 7. Load from storage on start, save after every change (never save results). Start with one empty subject if nothing is saved. Default new subjects to batch UG-I, empty schedule, all counts 0.
2. Build AppShell: sidebar on the left, main panel on the right taking the larger share. The sidebar collapses to a narrow rail with an expand button, and the open/closed state is saved.
3. Build the sidebar to look like the Settings screenshot described in ARCHITECTURE.md section 8: one rounded dark panel with a centred title, grouped rounded cards, rows with a label on the left and a muted value on the right, chevrons for rows that expand an editor inline underneath, and plain-number stepper rows with no chevron. Use the exact colours and sizes given there, in CSS variables in src/styles/tokens.css.
4. Add all groups and rows from the table in section 8: Subject, Course (Batch, Starts, Counted up to), Weekly schedule (Lectures, Tutorials, Labs with Mon-Fri toggles), Attended so far (three steppers), Classes not held (three steppers). The right-hand value of each row must reflect what is stored, for example "Mon, Wed, Thu".
5. The sidebar body scrolls; the Calculate button is a pinned footer at the very bottom of the sidebar, full width, always visible. Disable it with the hint "Add your weekly schedule" if no weekdays are chosen.
6. Pressing Calculate calls store.calculate(), which calls calculateResults from src/lib/calculate.ts. For now the main panel shows the Results object as readable formatted text, so we can verify the numbers.
7. Components go in src/components/sidebar/ with the names in section 2 of ARCHITECTURE.md.

Do not add a chart yet. Do not put any math in components. Do not add a router, login, or extra libraries.

Finish with: npm test and npm run build passing, the plain-language summary, how to run it (npm run dev), and the git commit command.
```

**Check it worked:** run `npm run dev`. The left panel should look like your Settings screenshot, collapse and expand, remember your inputs after a page refresh, and Calculate should show numbers on the right.

---

## Prompt 3: Pie chart + scroll-down stats (10 min)

```text
Read CLAUDE.md and ARCHITECTURE.md again (section 8, "Main panel"). Time box: 10 minutes.

Goal: replace the placeholder in the main panel with the real results view.

Do this:
1. AttendancePie in src/components/main/: a solid pie (not a donut) using Recharts, startAngle 90 and endAngle -270. The FULL CIRCLE REPRESENTS THE 75% TARGET: slice 1 = min(percent, 75) in the status colour, slice 2 = max(75 - percent, 0) in muted grey (#2a2a2c). At or above 75% the circle is completely filled. Put TARGET = 75 in one constant. Show the real attendance as large text next to or under the pie (for example "70.0%"), a caption such as "93% of the way to 75%" or "5.2% above the 75% target", and the StatusBadge. Use the status colours and thresholds in CLAUDE.md.
2. The pie and its large text sit at the top of the right (bigger) side of the screen, centred, taking most of the first screen height.
3. Scrolling down shows StatsPanel: three cards (To reach 75% now, To finish the semester at 75%, You can skip) and the per-type table, exactly as in ARCHITECTURE.md section 8. Counts are shown per type, for example "4 lectures, 2 tutorials, 1 lab". Tutorials must be labelled as half weight in the table header or a footnote.
4. Below that, BreakdownTable (held, attended, remaining per type, plus weighted A, H, F) and RemovedDatesList (date, class type, holiday name) so the student can see why classes were removed.
5. Before the first Calculate, show the empty state: "Fill in the panel on the left and press Calculate."
6. Only read from the Results object; do no calculation in components, except formatting numbers (one decimal place for percentages, whole numbers for class counts).
7. Match the dark visual language of the sidebar: grouped rounded cards (#1b1b1d), muted labels, same fonts.

Do not change src/lib unless you find a real bug; if you do, add a test for it and mention it in your summary.

Finish with: npm test and npm run build passing, the plain-language summary, and the git commit command.
```

**Check it worked:** enter a subject, press Calculate. The pie fills toward 75% in the colour of your status. Scroll down to see the stats cards and tables.

---

## Prompt 4: Edge cases, stale results, multiple subjects, mobile (7 min)

```text
Read CLAUDE.md and ARCHITECTURE.md again (sections 6 and 9). Time box: 7 minutes. If you run short, cut item 5 first and tell me.

Goal: make the app robust and pleasant to use.

Do this:
1. Stale results: if any input or the "Counted up to" date changes after Calculate, show StaleBanner at the top of the main panel ("Inputs changed. Press Calculate to update."), and visually dim the pie and stats. Use the inputSnapshot comparison from ARCHITECTURE.md section 6.
2. Multiple subjects: SubjectPicker lists all subjects with a colour chip from lastStatus and lastPercent (grey if never calculated). Add, rename, delete (with a confirm). Switching subject clears the displayed results (results are per press of Calculate).
3. Handle every row in the edge-case table in ARCHITECTURE.md section 9: H = 0 caption, attended clamped to held with an inline message, unrecoverable message with the best possible percentage, counted-up-to dates before the start and after 4 Dec, corrupt localStorage.
4. Make the stepper rows accept typed numbers (whole numbers only, never negative) as well as - and + buttons.
5. Mobile: below 800px wide, the sidebar becomes an overlay drawer opened by a button in a top bar, and the Calculate button stays pinned at the bottom of the drawer. After pressing Calculate on mobile, the drawer closes and the pie is visible.
6. Keyboard and accessibility basics: buttons are real buttons with labels, weekday toggles have aria-pressed, focus outlines visible.

Add or update tests only where you change src/lib. Do not add libraries.

Finish with: npm test and npm run build passing, the plain-language summary, and the git commit command.
```

**Check it worked:** change a number after calculating and the banner appears. Add two subjects and see both chips. Make your browser window narrow and the panel becomes a drawer.

---

## Prompt 5: Final check + README (4 min)

```text
Read CLAUDE.md and ARCHITECTURE.md again. Time box: 4 minutes. Do not add features.

Goal: verify everything against the spec and document how to run it.

Do this:
1. Run npm test and npm run build; fix anything that fails.
2. Verify this scenario by running the engine (a quick test is fine) and report the numbers: UG-I subject with Lectures Mon, Wed, Thu; Tutorials Tue; Labs Fri; counted up to 2026-11-12; attended 20 lectures, 5 tutorials, 8 labs, nothing marked not held. Report held, remaining, weighted A, H, F, percent, status, and the three plan results. Confirm that classes on 4 Sep, 2 Oct, 19 Oct, 20 Oct, 26 Oct and 9-13 Nov were not counted and that 31 Oct was counted as a Monday.
3. Read through the code once against CLAUDE.md hard rules 1 to 9 and list any violations you find; fix them if small.
4. Write README.md for a beginner on Windows with Git Bash: what the app is, how to install (npm install), run (npm run dev), test (npm test), and build (npm run build); where the calendar data lives (src/data/calendar.json); and a short "How to update the calendar for a new semester" section.

Finish with the plain-language summary and the final git commit command.
```

**Check it worked:** the agent's report for step 2 should show 31 Oct counted and none of the holidays counted. Then run `npm run dev` one last time.
