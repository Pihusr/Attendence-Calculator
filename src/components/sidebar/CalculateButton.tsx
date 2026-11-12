import { useStore } from '../../state/store';

export default function CalculateButton() {
  const { subject, calculate } = useStore();
  const hasSchedule = Object.values(subject.schedule).some((days) => days.length > 0);
  return (
    <div className="calculate-footer">
      <button className="calculate-button" type="button" disabled={!hasSchedule} onClick={calculate}>
        Calculate
      </button>
      {!hasSchedule && <p className="calculate-hint">Add your weekly schedule</p>}
    </div>
  );
}
