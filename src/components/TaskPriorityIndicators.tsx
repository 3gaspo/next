import { PrioritySettings, Task } from '../types';
import { calculatePriorityScore, getPriorityBand, isTaskUrgent } from '../lib/priority';

export function TaskPriorityIndicators({ task, settings, today }: {
  task: Task; settings: PrioritySettings; today: Date;
}) {
  if (task.completed) return null;
  const band = getPriorityBand(calculatePriorityScore(task, settings, today), settings);
  return (
    <span className="task-priority-indicators">
      {isTaskUrgent(task, today) && <span className="task-priority-badge task-urgent">Urgent</span>}
      <span className="task-priority-badge" aria-label={`Priority: ${band}`}>{band}</span>
    </span>
  );
}
