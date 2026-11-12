import type { Status } from '../../types';

const LABELS: Record<Status, string> = {
  safe: 'Safe',
  caution: 'Caution',
  short: 'Below target',
  unrecoverable: 'Unrecoverable',
  none: 'No classes held yet',
};

export default function StatusBadge({ status }: { status: Status }) {
  return <span className={`status-badge status-${status}`}>{LABELS[status]}</span>;
}
