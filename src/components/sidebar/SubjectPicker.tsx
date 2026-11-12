import type { ChangeEvent } from 'react';
import { useStore } from '../../state/store';

export default function SubjectPicker() {
  const { state, subject, addSubject, deleteSubject, selectSubject, updateSubject } = useStore();
  const onSelect = (event: ChangeEvent<HTMLSelectElement>) => selectSubject(event.target.value);
  return (
    <div className="subject-editor">
      <label className="editor-label" htmlFor="subject-select">Your subjects</label>
      <select id="subject-select" value={subject.id} onChange={onSelect}>
        {state.subjects.map((item) => (
          <option value={item.id} key={item.id}>{item.name || 'Untitled subject'}</option>
        ))}
      </select>
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
          onClick={() => deleteSubject(subject.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
