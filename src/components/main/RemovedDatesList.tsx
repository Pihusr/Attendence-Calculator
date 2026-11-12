import type { Results } from '../../types';

export default function RemovedDatesList({ results }: { results: Results }) {
  return (
    <section className="results-section removed-section" aria-labelledby="removed-title">
      <h2 id="removed-title" className="section-title">Removed classes</h2>
      {results.removed.length === 0 ? (
        <p className="no-removed-dates">No classes were removed by holidays or non-teaching days.</p>
      ) : (
        <div className="breakdown-card table-scroll">
          <table className="results-table removed-table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Class type</th>
                <th scope="col">Holiday / reason</th>
              </tr>
            </thead>
            <tbody>
              {results.removed.map((item) => (
                <tr key={`${item.date}-${item.type}`}>
                  <td>{item.date}</td>
                  <td>{item.type}</td>
                  <td>{item.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
