import { Task, PrioritySettings } from '../types';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';

export function calculatePriorityScore(task: Task, settings: PrioritySettings): number {
  const now = new Date();
  
  // Deadline Score
  let deadlineScore = 0;
  if (task.deadline) {
    const deadlineDate = startOfDay(parseISO(task.deadline));
    const today = startOfDay(now);
    const daysUntil = differenceInDays(deadlineDate, today);
    
    if (daysUntil <= 0) {
      deadlineScore = 100;
    } else {
      deadlineScore = Math.max(0, 100 - daysUntil);
    }
  }

  // Age Score
  const createdAt = parseISO(task.createdAt);
  const ageInDays = Math.max(0, differenceInDays(now, createdAt));

  // Normalize inputs to ensure numeric safety
  const importance = Number(task.importance) || 0;
  const duration = Number(task.duration) || 0;
  const effort = Number(task.effort) || 0;
  const appreciation = Number(task.appreciation) || 0;

  const score = 
    (deadlineScore * settings.deadlineWeight) +
    (ageInDays * settings.ageWeight) +
    (importance * settings.importanceWeight) +
    (duration * settings.durationWeight) +
    (effort * settings.effortWeight) +
    (appreciation * settings.appreciationWeight);

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
