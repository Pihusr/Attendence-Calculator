import type { Weekday } from '../../types';

const DAYS: { value: Weekday; label: string }[] = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
];

export default function WeekdayPicker({
  value,
  onChange,
}: {
  value: Weekday[];
  onChange: (day: Weekday) => void;
}) {
  return (
    <div className="weekday-picker" role="group" aria-label="Choose weekdays">
      {DAYS.map((day) => (
        <button
          key={day.value}
          type="button"
          aria-pressed={value.includes(day.value)}
          className={`weekday-toggle${value.includes(day.value) ? ' selected' : ''}`}
          onClick={() => onChange(day.value)}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
}
