export function parseDate(s: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!match) {
    throw new Error(`Invalid date: ${s}`);
  }

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    throw new Error(`Invalid date: ${s}`);
  }
  return date;
}

export function formatDate(d: Date): string {
  const year = String(d.getFullYear()).padStart(4, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(s: string, n: number): string {
  const date = parseDate(s);
  date.setDate(date.getDate() + n);
  return formatDate(date);
}

export function eachDay(from: string, to: string): string[] {
  if (from > to) {
    return [];
  }
  const days: string[] = [];
  for (let date = from; date <= to; date = addDays(date, 1)) {
    days.push(date);
  }
  return days;
}

export function weekdayOf(s: string): number {
  const weekday = parseDate(s).getDay();
  return weekday === 0 ? 7 : weekday;
}

export function today(): string {
  return formatDate(new Date());
}
