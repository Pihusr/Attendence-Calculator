import { useStore } from '../../state/store';

export default function MainPanel() {
  const { state } = useStore();
  const results = state.results;
  const subject = state.subjects.find((item) => item.id === results?.subjectId);
  const currentSnapshot = subject
    ? JSON.stringify({
      subject: {
        id: subject.id,
        name: subject.name,
        batch: subject.batch,
        startDate: subject.startDate,
        schedule: subject.schedule,
        attended: subject.attended,
        notHeld: subject.notHeld,
      },
      asOf: state.asOf,
    })
    : null;
  const stale = results !== null
    && (state.selectedId !== results.subjectId || currentSnapshot !== results.inputSnapshot);

  return (
    <main className="main-panel">
      <div className="main-content">
        {results ? (
          <>
            <h2>Results</h2>
            <p className="results-subtitle">{subject?.name || 'Untitled subject'}</p>
            {stale && <p className="stale-banner">Inputs changed. Press Calculate to update these results.</p>}
            <pre className="results-output">{JSON.stringify(results, null, 2)}</pre>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">◎</div>
            <h2>Attendance results</h2>
            <p>Fill in the panel on the left and press Calculate.</p>
          </div>
        )}
      </div>
    </main>
  );
}
