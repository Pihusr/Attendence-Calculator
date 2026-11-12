import type { ReactNode } from 'react';

export default function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="settings-group" aria-label={title}>
      <h2 className="group-title">{title}</h2>
      <div className="settings-card">{children}</div>
    </section>
  );
}
