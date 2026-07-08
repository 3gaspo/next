import { Task } from '../types';

export function hasChildren(taskId: string, allTasks: Task[]): boolean {
  return allTasks.some(t => t.parentId === taskId);
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
  const task = allTasks.find(t => t.id === taskId);
  if (!task) return null;
  if (!task.parentId) return task;
  return ancestors[ancestors.length - 1] || null;
}

export function getBreadcrumbPath(taskId: string, allTasks: Task[]): Task[] {
  return [...getAncestors(taskId, allTasks).reverse(), allTasks.find(t => t.id === taskId)!].filter(Boolean);
}

export function getLeafTasks(allTasks: Task[]): Task[] {
  return allTasks.filter(task => !hasChildren(task.id, allTasks));
}

export function getDescendantCounts(taskId: string, allTasks: Task[]) {
  const descendants = getDescendants(taskId, allTasks);
  return {
    total: descendants.length,
    completed: descendants.filter(d => d.completed).length
  };
}
