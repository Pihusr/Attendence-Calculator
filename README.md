# Thapar Attendance Tracker

Thapar Attendance Tracker is a small web app for estimating weighted attendance for your subjects. Enter the weekdays for lectures, tutorials, and labs, then enter how many you attended. The app uses the bundled academic calendar to exclude holidays and non-teaching days, and shows your attendance percentage, classes to attend, and classes you can skip. Your settings are saved in this browser; no account is needed.

## Before you start

Install Node.js and npm, then open this project folder in **Git Bash** on Windows.

## Install and run

Install the project packages:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Open the local address printed in the terminal (usually `http://localhost:5173`). To stop the app, press `Ctrl+C` in Git Bash.

## Test and build

Run the automated tests:

```bash
npm test
```

Create a production build:

```bash
npm run build
```

## Calendar data

The academic calendar is bundled in [`src/data/calendar.json`](./src/data/calendar.json). It includes semester start dates, the last teaching day, holidays, non-teaching dates, and substitute teaching days.

### How to update the calendar for a new semester

1. Get the official semester dates and exceptions, and update the calendar JSON with those dates. Do not guess missing dates.
2. Keep dates in `YYYY-MM-DD` format. Update the semester `id` and `label`, batch start dates, `lastTeachingDay`, and the `estWindow` as needed.
3. Add holidays to `holidays`, full days or date ranges without classes to `nonTeaching`, and make-up days to `substituteDays`. For a substitute Saturday, set `followsWeekday` to the weekday timetable it replaces (Monday is `1`).
4. Save the JSON and check that it is valid, then run `npm test` and `npm run build`.

The calendar tests in `src/lib/__tests__/calendar.test.ts` and `src/lib/__tests__/schedule.test.ts` cover the current semester dates and exceptions. Update those expectations when the official calendar changes.
