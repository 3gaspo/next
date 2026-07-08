import { Task, PrioritySettings } from '../types';
import { calculatePriorityScore } from './priority';
import { getBreadcrumbPath, getRootProject, hasChildren, getAncestors } from './tree';

export function downloadTasksAsCSV(tasks: Task[], settings: PrioritySettings) {
  const headers = [
    'id', 'parentId', 'rootProjectId', 'rootProjectName', 'path', 
    'name', 'deadline', 'createdAt', 'updatedAt', 'completed', 'completedAt',
    'importance', 'duration', 'effort', 'appreciation', 'hasChildren', 'depth', 'priorityScore'
  ];

  const rows = tasks.map(task => {
    const root = getRootProject(task.id, tasks);
    const pathItems = getBreadcrumbPath(task.id, tasks);
    const pathStr = pathItems.map(t => t.name).join('/');
    const depth = getAncestors(task.id, tasks).length;
    const score = calculatePriorityScore(task, settings);
    const childrenCount = hasChildren(task.id, tasks);

    const values = [
      task.id,
      task.parentId || '',
      root?.id || '',
      root?.name || '',
      pathStr,
      task.name,
      task.deadline || '',
      task.createdAt,
      task.updatedAt,
      task.completed ? 'true' : 'false',
      task.completedAt || '',
      task.importance,
      task.duration,
      task.effort,
      task.appreciation,
      childrenCount ? 'true' : 'false',
      depth,
      score
    ];

    return values.map(v => {
      const s = String(v);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    }).join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `next_tasks_${date}.csv`);
  link.click();
}
