import { useState } from 'react';
import type { ClassType, Weekday } from '../../types';
import { setCount } from '../../lib/counts';
import { setScheduleDay, useStore } from '../../state/store';
import { batchStart } from '../../lib/calendar';
import BatchRow from './BatchRow';
import CalculateButton from './CalculateButton';
import DateRow from './DateRow';
import SettingsGroup from './SettingsGroup';
import SettingsRow from './SettingsRow';
import StepperRow from './StepperRow';
import SubjectPicker from './SubjectPicker';
import WeekdayPicker from './WeekdayPicker';

const CLASS_TYPES: ClassType[] = ['lecture', 'tutorial', 'lab'];
const TYPE_LABELS: Record<ClassType, string> = { lecture: 'Lectures', tutorial: 'Tutorials', lab: 'Labs' };
const WEEKDAY_NAMES: Record<Weekday, string> = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
};

export default function Sidebar() {
  const { state, subject, updateSubject, setAsOf, toggleSidebar } = useStore();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const toggleRow = (id: string) => setExpandedRow((current) => current === id ? null : id);
  const dateValue = subject.startDate ?? batchStart(subject.batch);
  const scheduleValue = (type: ClassType) => subject.schedule[type].length
    ? subject.schedule[type].map((day) => WEEKDAY_NAMES[day]).join(', ')
    : 'Not set';
  const chipColor = subject.lastStatus === 'safe'
    ? 'var(--safe)'
    : subject.lastStatus === 'caution'
      ? 'var(--caution)'
      : subject.lastStatus === 'short'
        ? 'var(--short)'
        : subject.lastStatus === 'unrecoverable'
          ? 'var(--unrecoverable)'
          : 'var(--muted)';

  if (!state.sidebarOpen) {
    return (
      <aside className="sidebar sidebar-closed" aria-label="Settings panel">
        <button className="expand-button" type="button" aria-label="Expand settings" onClick={toggleSidebar}>›</button>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <button className="collapse-button" type="button" aria-label="Collapse settings" onClick={toggleSidebar}>‹</button>
        <h1>Settings</h1>
      </header>
      <div className="sidebar-body">
        <SettingsGroup title="Subject">
          <SettingsRow
            label="Subject"
            value={subject.name || 'Untitled subject'}
            chipColor={chipColor}
            expanded={expandedRow === 'subject'}
            onToggle={() => toggleRow('subject')}
          >
            <SubjectPicker />
          </SettingsRow>
        </SettingsGroup>
        <SettingsGroup title="Course">
          <BatchRow expanded={expandedRow === 'batch'} onToggle={() => toggleRow('batch')} />
          <DateRow
            label="Starts"
            value={dateValue}
            expanded={expandedRow === 'starts'}
            onToggle={() => toggleRow('starts')}
            onChange={(startDate) => updateSubject({ startDate: startDate || null })}
            canReset
          />
          <DateRow
            label="Counted up to"
            value={state.asOf}
            expanded={expandedRow === 'asOf'}
            onToggle={() => toggleRow('asOf')}
            onChange={(date) => { if (date) setAsOf(date); }}
          />
        </SettingsGroup>
        <SettingsGroup title="Weekly schedule">
          {CLASS_TYPES.map((type) => (
            <SettingsRow
              key={type}
              label={TYPE_LABELS[type]}
              value={scheduleValue(type)}
              expanded={expandedRow === `schedule-${type}`}
              onToggle={() => toggleRow(`schedule-${type}`)}
            >
              <WeekdayPicker
                value={subject.schedule[type]}
                onChange={(day) => updateSubject({ schedule: setScheduleDay(subject.schedule, type, day) })}
              />
            </SettingsRow>
          ))}
        </SettingsGroup>
        <SettingsGroup title="Attended so far">
          {CLASS_TYPES.map((type) => (
            <StepperRow
              key={type}
              type={type}
              counts={subject.attended}
              inlineMessage={state.results?.subjectId === subject.id && subject.attended[type] > state.results.held[type]
                ? `Limited to ${state.results.held[type]} classes held`
                : undefined}
              onChange={(value) => updateSubject({ attended: setCount(subject.attended, type, value) })}
            />
          ))}
        </SettingsGroup>
        <SettingsGroup title="Classes not held">
          {CLASS_TYPES.map((type) => (
            <StepperRow
              key={type}
              type={type}
              counts={subject.notHeld}
              hint={type === 'lecture' ? 'Cancelled by teacher' : undefined}
              onChange={(value) => updateSubject({ notHeld: setCount(subject.notHeld, type, value) })}
            />
          ))}
        </SettingsGroup>
      </div>
      <CalculateButton />
    </aside>
  );
}
