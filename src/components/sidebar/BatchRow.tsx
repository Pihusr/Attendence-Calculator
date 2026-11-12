import type { BatchId } from '../../types';
import { useStore } from '../../state/store';
import SettingsRow from './SettingsRow';

const BATCHES: BatchId[] = ['UG-I', 'PG-I', 'PhD-I'];

export default function BatchRow({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const { subject, updateSubject } = useStore();
  return (
    <SettingsRow label="Batch" value={subject.batch} expanded={expanded} onToggle={onToggle}>
      <label className="editor-label" htmlFor="batch-select">Choose batch</label>
      <select
        id="batch-select"
        value={subject.batch}
        onChange={(event) => updateSubject({ batch: event.target.value as BatchId })}
      >
        {BATCHES.map((batch) => <option key={batch} value={batch}>{batch}</option>)}
      </select>
    </SettingsRow>
  );
}
