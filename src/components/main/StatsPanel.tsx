import type { ClassType, Counts, Results } from '../../types';
import { TARGET } from '../../lib/attendance';
import BreakdownTable from './BreakdownTable';

const CLASS_TYPES: ClassType[] = ['lecture', 'tutorial', 'lab'];

function formatCounts(counts: Counts): string {
  const values = CLASS_TYPES
    .filter((type) => counts[type] > 0)
    .map((type) => `${counts[type].toFixed(0)} ${type}${counts[type] === 1 ? '' : 's'}`);
  return values.length ? values.join(', ') : 'No classes';
}

export default function StatsPanel({ results }: { results: Results }) {
  const { plan, remaining } = results;
  const reachNow = results.percent === null
    ? 'No classes held yet'
    : plan.nowWeighted === 0
      ? `You're already above ${TARGET}%`
      : `Attend ${formatCounts(plan.nowCounts)} in a row`;

  return (
    <section className="results-section" aria-labelledby="stats-title">
      <h2 id="stats-title" className="section-title">Your plan</h2>
      <div className="stats-cards">
        <article className="result-card">
          <h3>To reach {TARGET}% now</h3>
          <p>{reachNow}</p>
        </article>
        <article className="result-card">
          <h3>To finish the semester at {TARGET}%</h3>
          <p>Attend {formatCounts(plan.endCounts)}</p>
          <small>Out of {formatCounts(remaining)} remaining</small>
        </article>
        <article className={`result-card${plan.unrecoverable ? ' result-card-warning' : ''}`}>
          <h3>You can skip</h3>
          <p>{formatCounts(plan.skipCounts)}</p>
          {plan.unrecoverable && (
            <small>
              Even attending every remaining class gets you only{' '}
              {results.bestPossiblePercent === null ? '—' : `${results.bestPossiblePercent.toFixed(1)}%`}.
            </small>
          )}
        </article>
      </div>
      <BreakdownTable results={results} />
    </section>
  );
}
