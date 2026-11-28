import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getCompletedHistoryIds } from '../src/lib/tree';
import type { Task } from '../src/types';

test('history cleanup preserves the complete path to active descendants', () => {
  const tasks = [
    { id: 'root', parentId: null, completed: true },
    { id: 'branch', parentId: 'root', completed: true },
    { id: 'active', parentId: 'branch', completed: false },
    { id: 'done', parentId: 'branch', completed: true },
    { id: 'other', parentId: null, completed: true },
  ] as Task[];
  assert.deepEqual(getCompletedHistoryIds(tasks), ['done', 'other']);
  assert.deepEqual(getCompletedHistoryIds(tasks.map(t => ({ ...t, completed: true }))), tasks.map(t => t.id));
  assert.deepEqual(getCompletedHistoryIds([]), []);
});
