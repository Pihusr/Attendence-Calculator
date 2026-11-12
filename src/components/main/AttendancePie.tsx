import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { TARGET } from '../../lib/attendance';
import type { Results } from '../../types';

export default function AttendancePie({ results }: { results: Results }) {
  const data = [
    { name: 'Attended', value: results.targetPie.attended },
    { name: 'Gap', value: results.targetPie.gap },
  ];

  let caption = 'No classes held yet';
  if (results.percent !== null) {
    if (results.aboveTargetBy !== null && results.aboveTargetBy > 0) {
      caption = `${results.aboveTargetBy.toFixed(1)}% above the ${TARGET}% target`;
    } else {
      caption = `${results.targetProgressPercent?.toFixed(0)}% of the way to ${TARGET}%`;
    }
  }

  return (
    <div className={`attendance-hero status-${results.status}`}>
      <div className="attendance-chart" role="img" aria-label={`Attendance target pie: ${results.percent === null ? 'no classes held yet' : `${results.percent.toFixed(1)}% attendance`}`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              startAngle={90}
              endAngle={-270}
              outerRadius="92%"
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill="var(--pie-status-color)" />
              <Cell fill="#2a2a2c" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="attendance-summary">
        <p className="attendance-percent">
          {results.percent === null ? '—' : `${results.percent.toFixed(1)}%`}
        </p>
        <p className="attendance-caption">{caption}</p>
        <p className="target-note">Full circle = {TARGET}% target</p>
      </div>
    </div>
  );
}
