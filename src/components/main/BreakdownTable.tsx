import type { ClassType, Results } from '../../types';

const CLASS_TYPES: ClassType[] = ['lecture', 'tutorial', 'lab'];

const LABELS: Record<ClassType, string> = {
  lecture: 'Lectures',
  tutorial: 'Tutorials',
  lab: 'Labs',
};

export default function BreakdownTable({ results }: { results: Results }) {
  return (
    <div className="breakdown-card">
      <div className="table-scroll">
        <table className="results-table">
          <caption>Class counts by type</caption>
          <thead>
            <tr>
              <th scope="col">Class type</th>
              <th scope="col">Held</th>
              <th scope="col">Attended</th>
              <th scope="col">Remaining</th>
              <th scope="col">Needed</th>
              <th scope="col">Can skip</th>
            </tr>
          </thead>
          <tbody>
            {CLASS_TYPES.map((type) => (
              <tr key={type}>
                <th scope="row">
                  {LABELS[type]}{type === 'tutorial' && <span className="half-weight"> (half weight)</span>}
                </th>
                <td>{results.held[type].toFixed(0)}</td>
                <td>{results.attended[type].toFixed(0)}</td>
                <td>{results.remaining[type].toFixed(0)}</td>
                <td>{results.plan.endCounts[type].toFixed(0)}</td>
                <td>{results.plan.skipCounts[type].toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="weighted-totals" aria-label="Weighted attendance totals">
        <div><span>Weighted attended (A)</span><strong>{results.weighted.A.toFixed(1)}</strong></div>
        <div><span>Weighted held (H)</span><strong>{results.weighted.H.toFixed(1)}</strong></div>
        <div><span>Weighted remaining (F)</span><strong>{results.weighted.F.toFixed(1)}</strong></div>
      </div>
    </div>
  );
}
