import assert from 'node:assert/strict';
import { test } from 'node:test';
import { subDays } from 'date-fns';
import { calculatePriorityScore, getPriorityBand, isTaskUrgent, PRIORITY_BANDS, sortTasksByPriority, uShapedPriority } from '../src/lib/priority';
import { DEFAULT_PRIORITY_SETTINGS as weights, PrioritySettings, Task } from '../src/types';

const now = new Date(2026, 10, 15, 12);
const task = (changes: Partial<Task> = {}): Task => ({
  id: 'task', parentId: null, name: 'Task', deadline: null,
  createdAt: new Date(2026, 10, 15).toISOString(), updatedAt: now.toISOString(),
  completed: false, completedAt: null, importance: 5, duration: 30, effort: 3, appreciation: 5,
  ...changes,
});

test('U curves favor both extremes, with symmetric shoulders and capped tails', () => {
  for (const cap of [360, 250]) {
    assert.deepEqual([0, .25, .5, .75, 1].map(x => uShapedPriority(x * cap, cap)), [1, .25, 0, .25, 1]);
    assert.equal(uShapedPriority(-1, cap), 1);
    assert.equal(uShapedPriority(cap + 1, cap), 1);
  }
});

test('new default task has score 4.78; middle-aged/middle-length task has score 1.2', () => {
  assert.equal(calculatePriorityScore(task(), weights, now), 4.78);
  assert.equal(calculatePriorityScore(task({ createdAt: subDays(now, 180).toISOString(), duration: 125 }), weights, now), 1.2);
});

test('age and duration each independently favor both ends', () => {
  const ageScores = [0, 90, 180, 270, 360, 500].map(days => calculatePriorityScore(task({ createdAt: subDays(now, days).toISOString() }), weights, now));
  assert.equal(ageScores[0], ageScores[4]); assert.equal(ageScores[4], ageScores[5]);
  assert.equal(ageScores[1], ageScores[3]); assert.ok(ageScores[0] > ageScores[1] && ageScores[1] > ageScores[2]);
  const durationScores = [0, 62.5, 125, 187.5, 250, 500].map(duration => calculatePriorityScore(task({ duration }), weights, now));
  assert.equal(durationScores[0], durationScores[4]); assert.equal(durationScores[4], durationScores[5]);
  assert.equal(durationScores[1], durationScores[3]); assert.ok(durationScores[0] > durationScores[1] && durationScores[1] > durationScores[2]);
});

test('other weights, deadline cap and numeric bounds remain effective', () => {
  const maximum = task({ deadline: '2026-11-15', importance: 10, appreciation: 10, duration: 250, effort: 1 });
  assert.equal(calculatePriorityScore(maximum, weights, now), 8.9);
  assert.equal(calculatePriorityScore({ ...maximum, deadline: '2020-01-01' }, weights, now), 8.9);
  assert.equal(calculatePriorityScore({ ...maximum, deadline: '2030-01-01' }, weights, now), 6.9);
  assert.equal(calculatePriorityScore({ ...maximum, effort: 0 }, weights, now), 9);
  assert.equal(calculatePriorityScore(task({ createdAt: subDays(now, 180).toISOString(), duration: 125, importance: 0, appreciation: 0, effort: 10 }), weights, now), -1);
});

test('five equal score bins cover their boundaries and clamp outliers', () => {
  assert.deepEqual([-1, 1, 3, 5, 7].map(score => getPriorityBand(score, weights)), PRIORITY_BANDS);
  assert.equal(getPriorityBand(.99, weights), PRIORITY_BANDS[0]);
  assert.equal(getPriorityBand(9, weights), PRIORITY_BANDS[4]);
  assert.equal(getPriorityBand(100, weights), PRIORITY_BANDS[4]);
  assert.equal(getPriorityBand(-100, weights), PRIORITY_BANDS[0]);
});

test('bins adapt to custom positive/negative weights; all-zero weights are neutral', () => {
  const zero: PrioritySettings = { deadlineWeight: 0, ageWeight: 0, importanceWeight: 0, durationWeight: 0, effortWeight: 0, appreciationWeight: 0 };
  assert.equal(getPriorityBand(0, zero), PRIORITY_BANDS[2]);
  assert.equal(getPriorityBand(-2, { ...zero, importanceWeight: -2 }), PRIORITY_BANDS[0]);
  assert.equal(getPriorityBand(0, { ...zero, importanceWeight: -2 }), PRIORITY_BANDS[4]);
  assert.equal(getPriorityBand(5, { ...zero, importanceWeight: 10 }), PRIORITY_BANDS[2]);
});

test('urgent includes overdue, today and tomorrow, excluding completed, absent and later deadlines', () => {
  for (const deadline of ['2020-01-01', '2026-11-15', '2026-11-16']) assert.ok(isTaskUrgent(task({ deadline }), now));
  for (const deadline of [null, 'invalid', '2026-11-17']) assert.equal(isTaskUrgent(task({ deadline }), now), false);
  assert.equal(isTaskUrgent(task({ deadline: '2026-11-15', completed: true }), now), false);
});

test('urgency uses local calendar days across DST and month/year boundaries', () => {
  assert.ok(isTaskUrgent(task({ deadline: '2026-10-25' }), new Date(2026, 9, 24, 23, 59)));
  assert.equal(isTaskUrgent(task({ deadline: '2026-10-26' }), new Date(2026, 9, 24, 23, 59)), false);
  assert.ok(isTaskUrgent(task({ deadline: '2027-01-01' }), new Date(2026, 11, 31, 23, 59)));
});

test('ranking uses the U scores and keeps deadline/creation/name tie breakers', () => {
  const tasks = [task({ id: 'middle', duration: 125 }), task({ id: 'long', duration: 250 }), task({ id: 'short', duration: 0 })];
  assert.deepEqual(sortTasksByPriority(tasks, weights, now).map(t => t.id), ['long', 'short', 'middle']);
  const noWeights = Object.fromEntries(Object.keys(weights).map(k => [k, 0])) as unknown as PrioritySettings;
  const tied = [task({ id: 'none', name: 'A' }), task({ id: 'tomorrow', deadline: '2026-11-16' }), task({ id: 'today', deadline: '2026-11-15' })];
  assert.deepEqual(sortTasksByPriority(tied, noWeights, now).map(t => t.id), ['today', 'tomorrow', 'none']);
});
