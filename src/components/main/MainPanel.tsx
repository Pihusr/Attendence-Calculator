import { useStore } from '../../state/store';
import type { ClassType } from '../../types';
import AttendancePie from './AttendancePie';
import RemovedDatesList from './RemovedDatesList';
import StatsPanel from './StatsPanel';
import StatusBadge from './StatusBadge';

const CLASS_TYPES: ClassType[] = ['lecture', 'tutorial', 'lab'];

export default function MainPanel() {
  const { state, subject: selectedSubject } = useStore();
  const results = state.results;
  const subject = state.subjects.find((item) => item.id === results?.subjectId);
  const inputSnapshot = subject
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
    && (state.selectedId !== results.subjectId || inputSnapshot !== results.inputSnapshot);

  return (
    <main className="main-panel" id="results-panel">
      <div className="main-content">
        {results ? (
          <>
            <h2>Attendance</h2>
            <p className="results-subtitle">{subject?.name || 'Untitled subject'} · Counted up to {results.asOf}</p>
            {stale && <p className="stale-banner" role="status">Inputs changed. Press Calculate to update.</p>}
            <div className={`results-content${stale ? ' is-stale' : ''}`}>
              <AttendancePie results={results} />
              <StatusBadge status={results.status} />
              {subject && CLASS_TYPES.some((type) => subject.attended[type] > results.held[type]) &&
                <p className="validation-message" role="status">Attended counts were clamped to the number of classes held.</p>}
              <StatsPanel results={results} />
              <RemovedDatesList results={results} />
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">◎</div>
            <h2>Attendance results</h2>
            <p>Fill in the panel on the left and press Calculate.</p>
            <span className="current-subject">{selectedSubject.name || 'Untitled subject'}</span>
          </div>
        )}
      </div>
    </main>
  );
}
