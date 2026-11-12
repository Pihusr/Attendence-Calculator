import { useStore } from '../../state/store';
import SettingsRow from './SettingsRow';

export default function DateRow({
  label,
  value,
  expanded,
  onToggle,
  onChange,
  canReset = false,
}: {
  label: string;
  value: string;
  expanded: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
  canReset?: boolean;
}) {
  const { subject, updateSubject } = useStore();
  const shown = canReset && subject.startDate === null ? 'Batch default' : value;
  return (
    <SettingsRow label={label} value={shown} expanded={expanded} onToggle={onToggle}>
      <label className="editor-label" htmlFor={`${label.replaceAll(' ', '-').toLowerCase()}-date`}>Choose date</label>
      <input
        id={`${label.replaceAll(' ', '-').toLowerCase()}-date`}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {canReset && subject.startDate !== null && (
        <button type="button" className="subtle-button reset-button" onClick={() => updateSubject({ startDate: null })}>
          Use batch default
        </button>
      )}
    </SettingsRow>
  );
}
