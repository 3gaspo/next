import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { TaskCard } from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { Task } from '../types';
import { getRootProject } from '../lib/tree';
import { calculatePriorityScore } from '../lib/priority';
import { LayoutGrid, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const { 
    user, 
    actionableTasks, 
    tasks, 
    settings, 
    toggleTask, 
    saveTask, 
    loading,
    skippedTaskIds,
    skipTaskForToday,
    resetSkippedTasks
  } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const maxTasks = typeof settings.maxHomeTasks === 'number' && settings.maxHomeTasks > 0 ? settings.maxHomeTasks : 3;

  const skippedSet = useMemo(() => new Set(skippedTaskIds), [skippedTaskIds]);

  const availableUncompletedTasks = useMemo(() => {
    return actionableTasks.filter(t => !t.completed && !skippedSet.has(t.id));
  }, [actionableTasks, skippedSet]);

  const displayedTasks = useMemo(() => {
    const topUncompleted = availableUncompletedTasks.slice(0, maxTasks);
    const completed = actionableTasks.filter(t => t.completed);
    return [...topUncompleted, ...completed];
  }, [availableUncompletedTasks, actionableTasks, maxTasks]);

  const overallScore = useMemo(() => {
    const active = actionableTasks.filter(t => !t.completed);
    if (active.length === 0) return 0;
    const total = active.reduce((acc, t) => acc + calculatePriorityScore(t, settings.priority), 0);
    return Number((total / active.length).toFixed(1));
  }, [actionableTasks, settings.priority]);

  if (!user && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center gap-6">
        <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-900 rounded-[32px] flex items-center justify-center text-zinc-400">
          <LayoutGrid size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Welcome to Next</h2>
          <p className="text-zinc-500 max-w-xs mx-auto">Please sign in from the Settings tab to start managing your priorities.</p>
        </div>
      </div>
    );
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const isScoresEnabled = Boolean(settings.showScores);

  return (
    <div className="px-6 pt-12 pb-24 max-w-lg mx-auto">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-1">Today</h1>
          <p className="text-zinc-400 font-medium">
            {availableUncompletedTasks.length} {availableUncompletedTasks.length === 1 ? 'task' : 'tasks'}
          </p>
        </div>
        {isScoresEnabled && (
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">Overall Score</span>
            <span className="text-xl font-black text-zinc-900 dark:text-zinc-100">{overallScore}</span>
          </div>
        )}
      </header>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {displayedTasks.map(task => {
            const root = getRootProject(task.id, tasks);
            return (
              <TaskCard
                key={task.id}
                task={task}
                rootProjectName={root?.name}
                settings={settings.priority}
                showScores={isScoresEnabled}
                onToggle={toggleTask}
                onEdit={handleEdit}
                onSkip={skipTaskForToday}
              />
            );
          })}
        </AnimatePresence>

        {skippedTaskIds.length > 0 && (
          <div className="flex items-center justify-between py-3 px-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 text-xs font-medium text-zinc-500">
            <span>{skippedTaskIds.length} {skippedTaskIds.length === 1 ? 'task' : 'tasks'} skipped for today</span>
            <button
              type="button"
              onClick={resetSkippedTasks}
              className="flex items-center gap-1.5 font-bold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              Restore all
            </button>
          </div>
        )}

        {!loading && displayedTasks.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center px-6 bg-zinc-50 dark:bg-zinc-900/40 rounded-[32px]"
          >
            <p className="text-zinc-400 font-medium">
              {skippedTaskIds.length > 0 
                ? 'All other tasks are skipped for today.' 
                : 'All caught up!'}
            </p>
          </motion.div>
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={saveTask}
        task={editingTask}
      />
    </div>
  );
}
