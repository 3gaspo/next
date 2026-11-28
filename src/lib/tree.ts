import { Task } from '../types';

export function hasChildren(taskId: string, allTasks: Task[]): boolean {
  return allTasks.some(t => t.parentId === taskId);
}

export function isFolder(task: Task, allTasks: Task[]): boolean {
  return Boolean(task.isFolder) || hasChildren(task.id, allTasks);
}

export function getChildren(taskId: string | null, allTasks: Task[]): Task[] {
  return allTasks.filter(t => t.parentId === taskId);
}

export function getDescendants(taskId: string, allTasks: Task[]): Task[] {
  const children = getChildren(taskId, allTasks);
  return children.reduce((acc, child) => {
    return [...acc, child, ...getDescendants(child.id, allTasks)];
  }, [] as Task[]);
}

export function getAncestors(taskId: string, allTasks: Task[]): Task[] {
  const task = allTasks.find(t => t.id === taskId);
  if (!task || !task.parentId) return [];
  const parent = allTasks.find(t => t.id === task.parentId);
  if (!parent) return [];
  return [parent, ...getAncestors(parent.id, allTasks)];
}

export function getRootProject(taskId: string, allTasks: Task[]): Task | null {
  const ancestors = getAncestors(taskId, allTasks);
  if (ancestors.length === 0) return null;
  return ancestors[ancestors.length - 1];
}

export function getBreadcrumbPath(taskId: string, allTasks: Task[]): Task[] {
  return [...getAncestors(taskId, allTasks).reverse(), allTasks.find(t => t.id === taskId)!].filter(Boolean);
}

export function getLeafTasks(allTasks: Task[]): Task[] {
  return allTasks.filter(task => !isFolder(task, allTasks));
}

export function getDescendantCounts(taskId: string, allTasks: Task[]) {
  const descendants = getDescendants(taskId, allTasks);
  return {
    total: descendants.length,
    completed: descendants.filter(d => d.completed).length
  };
}

/** Keep completed ancestors while any active descendant still needs its path. */
export function getCompletedHistoryIds(tasks: Task[]): string[] {
  const byId = new Map(tasks.map(task => [task.id, task]));
  const retained = new Set<string>();
  for (const task of tasks) {
    if (task.completed) continue;
    let parentId = task.parentId;
    const visited = new Set<string>();
    while (parentId && !visited.has(parentId)) {
      visited.add(parentId);
      retained.add(parentId);
      parentId = byId.get(parentId)?.parentId ?? null;
    }
  }
  return tasks.filter(task => task.completed && !retained.has(task.id)).map(task => task.id);
}
