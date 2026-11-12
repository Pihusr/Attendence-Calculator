import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: string;
  expanded: boolean;
  onToggle: () => void;
  children?: ReactNode;
  chipColor?: string;
}

export default function SettingsRow({ label, value, expanded, onToggle, children, chipColor }: Props) {
  return (
    <div className={`settings-row-wrap${expanded ? ' is-expanded' : ''}`}>
      <button className="settings-row" type="button" onClick={onToggle} aria-expanded={expanded}>
        <span className="row-label">{label}</span>
        <span className="row-value">{chipColor && <i className="subject-chip" style={{ backgroundColor: chipColor }} />}<span>{value}</span></span>
        <span className="row-chevron" aria-hidden="true">{expanded ? '⌄' : '›'}</span>
      </button>
      {expanded && children && <div className="row-editor">{children}</div>}
    </div>
  );
}
