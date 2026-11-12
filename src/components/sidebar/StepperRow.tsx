import type { ClassType, Counts } from '../../types';

const LABELS: Record<ClassType, string> = {
  lecture: 'Lectures',
  tutorial: 'Tutorials',
  lab: 'Labs',
};

export default function StepperRow({
  type,
  counts,
  onChange,
  hint,
  inlineMessage,
}: {
  type: ClassType;
  counts: Counts;
  onChange: (value: number) => void;
  hint?: string;
  inlineMessage?: string;
}) {
  const value = counts[type];
  return (
    <div className="stepper-row">
      <div className="stepper-label">
        <span>{LABELS[type]}</span>
        {hint && <small>{hint}</small>}
        {inlineMessage && <small className="validation-message">{inlineMessage}</small>}
      </div>
      <div className="stepper">
        <button type="button" aria-label={`Decrease ${LABELS[type]}`} onClick={() => onChange(value - 1)}>−</button>
        <input
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          aria-label={`${LABELS[type]} count`}
          value={value}
          onChange={(event) => {
            const typed = event.target.value;
            if (/^\d*$/.test(typed)) onChange(typed === '' ? 0 : Number(typed));
          }}
        />
        <button type="button" aria-label={`Increase ${LABELS[type]}`} onClick={() => onChange(value + 1)}>+</button>
      </div>
    </div>
  );
}
