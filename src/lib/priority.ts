import { Task, PrioritySettings } from '../types';
import { addDays, differenceInDays, isValid, parseISO, startOfDay } from 'date-fns';

// Preserve the existing caps, with a quadratic U: 1 at either end, 0 halfway.
export function uShapedPriority(value: number, cap: number): number {
  const normalized = Math.max(0, Math.min(value, cap)) / cap;
  return (2 * normalized - 1) ** 2;
}

export function isTaskUrgent(task: Task, now = new Date()): boolean {
  if (task.completed || !task.deadline) return false;
  const deadline = parseISO(task.deadline);
  return isValid(deadline) && startOfDay(deadline) <= addDays(startOfDay(now), 1);
}

export const PRIORITY_BANDS = [
  'Very low priority', 'Low priority', 'Medium priority', 'High priority', 'Very high priority',
] as const;

export function getPriorityBand(score: number, settings: PrioritySettings): typeof PRIORITY_BANDS[number] {
  // Every criterion is in [0, 1]. Negative/custom weights change both bounds.
  const weights = [settings.deadlineWeight, settings.ageWeight, settings.importanceWeight,
    settings.durationWeight, settings.effortWeight, settings.appreciationWeight];
  const minimum = weights.reduce((sum, weight) => sum + Math.min(0, weight), 0);
  const maximum = weights.reduce((sum, weight) => sum + Math.max(0, weight), 0);
  if (maximum === minimum) return PRIORITY_BANDS[2];
  const relativeScore = Math.max(0, Math.min(1, (score - minimum) / (maximum - minimum)));
  return PRIORITY_BANDS[Math.min(4, Math.floor(relativeScore * 5))];
}

export function calculatePriorityScore(task: Task, settings: PrioritySettings, now = new Date()): number {
  
  // D = min(360, 360 - min(360, Delta_due)) / 360 (0 if no deadline)
  let D = 0;
  if (task.deadline) {
    const deadlineDate = startOfDay(parseISO(task.deadline));
    const today = startOfDay(now);
    const deltaDue = differenceInDays(deadlineDate, today);
    D = Math.max(0, Math.min(360, 360 - Math.min(360, deltaDue))) / 360;
  }

  // New and very old tasks are favored; the minimum is at 180 days.
  const createdAt = parseISO(task.createdAt);
  const deltaAge = differenceInDays(startOfDay(now), startOfDay(createdAt));
  const A = uShapedPriority(deltaAge, 360);

  // I = i / 10 (i in 1 to 10)
  const rawImportance = Number(task.importance) || 0;
  const I = Math.max(0, Math.min(10, rawImportance)) / 10;

  // Short and very long tasks are favored; the minimum is at 125 minutes.
  const rawDuration = Number(task.duration) || 0;
  const T = uShapedPriority(rawDuration, 250);

  // E = e / 10 (e in 1 to 10)
  const rawEffort = Number(task.effort) || 0;
  const E = Math.max(0, Math.min(10, rawEffort)) / 10;

  // P = p / 10 (p in 1 to 10)
  const rawAppreciation = Number(task.appreciation) || 0;
  const P = Math.max(0, Math.min(10, rawAppreciation)) / 10;

  // S(t) = a.D + b.A + c.I + d.T + e.E + f.P
  const score = 
    (D * settings.deadlineWeight) +
    (A * settings.ageWeight) +
    (I * settings.importanceWeight) +
    (T * settings.durationWeight) +
    (E * settings.effortWeight) +
    (P * settings.appreciationWeight);

  return Number(score.toFixed(2));
}

export function sortTasksByPriority(tasks: Task[], settings: PrioritySettings, now = new Date()): Task[] {
  return [...tasks].sort((a, b) => {
    const scoreA = calculatePriorityScore(a, settings, now);
    const scoreB = calculatePriorityScore(b, settings, now);

    if (scoreB !== scoreA) return scoreB - scoreA;

    // Tie breakers
    if (a.deadline && b.deadline) {
      if (a.deadline !== b.deadline) return a.deadline.localeCompare(b.deadline);
    } else if (a.deadline) return -1;
    else if (b.deadline) return 1;

    if (a.createdAt !== b.createdAt) return a.createdAt.localeCompare(b.createdAt);
    
    return a.name.localeCompare(b.name);
  });
}
