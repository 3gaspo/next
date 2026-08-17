import { Task, PrioritySettings } from '../types';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';

export function calculatePriorityScore(task: Task, settings: PrioritySettings): number {
  const now = new Date();
  
  // D = min(360, 360 - min(360, Delta_due)) / 360 (0 if no deadline)
  let D = 0;
  if (task.deadline) {
    const deadlineDate = startOfDay(parseISO(task.deadline));
    const today = startOfDay(now);
    const deltaDue = differenceInDays(deadlineDate, today);
    D = Math.max(0, Math.min(360, 360 - Math.min(360, deltaDue))) / 360;
  }

  // A = min( max(0, Delta_age), 360) / 360
  const createdAt = parseISO(task.createdAt);
  const deltaAge = differenceInDays(now, createdAt);
  const A = Math.min(Math.max(0, deltaAge), 360) / 360;

  // I = i / 10 (i in 1 to 10)
  const rawImportance = Number(task.importance) || 0;
  const I = Math.max(0, Math.min(10, rawImportance)) / 10;

  // T = max(0, min(T, 250)) / 250
  const rawDuration = Number(task.duration) || 0;
  const T = Math.max(0, Math.min(rawDuration, 250)) / 250;

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

export function sortTasksByPriority(tasks: Task[], settings: PrioritySettings): Task[] {
  return [...tasks].sort((a, b) => {
    const scoreA = calculatePriorityScore(a, settings);
    const scoreB = calculatePriorityScore(b, settings);

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
