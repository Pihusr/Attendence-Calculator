import { useStore } from '../../state/store';

export default function SubjectPicker() {
  const { state, subject, addSubject, deleteSubject, selectSubject, updateSubject } = useStore();
  const chipColor = (status: string) => status === 'safe' ? 'var(--safe)'
    : status === 'caution' ? 'var(--caution)'
      : status === 'short' ? 'var(--short)'
        : status === 'unrecoverable' ? 'var(--unrecoverable)' : 'var(--muted)';
  return (
    <div className="subject-editor">
      <span className="editor-label">Your subjects</span>
      <div className="subject-list" role="list">
        {state.subjects.map((item) => (
          <button className={`subject-choice${item.id === subject.id ? ' selected' : ''}`} type="button"
            key={item.id} onClick={() => selectSubject(item.id)} aria-pressed={item.id === subject.id}>
            <i className="subject-chip" style={{ backgroundColor: chipColor(item.lastStatus) }} />
            <span>{item.name || 'Untitled subject'}</span>
            <small>{item.lastPercent === null ? 'Not calculated' : `${item.lastPercent.toFixed(1)}%`}</small>
          </button>
        ))}
      </div>
      <label className="editor-label" htmlFor="subject-name">Subject name</label>
      <input
        id="subject-name"
        value={subject.name}
        placeholder="e.g. Mathematics"
        onChange={(event) => updateSubject({ name: event.target.value })}
      />
      <div className="subject-actions">
        <button type="button" className="subtle-button" onClick={addSubject}>Add subject</button>
        <button
          type="button"
          className="subtle-button danger-text"
          disabled={state.subjects.length <= 1}
          onClick={() => {
            if (window.confirm(`Delete "${subject.name || 'Untitled subject'}"? This cannot be undone.`)) {
              deleteSubject(subject.id);
            }
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
