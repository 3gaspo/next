import { StateFeedback } from '../components/StateFeedback';
import { formatNumber } from '@3gaspo/app-ui/formats';
import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { TaskCard } from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { FloatingAddButton } from '../components/FloatingAddButton';
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
        <div className="w-24 h-24 bg-ui-section rounded-[32px] flex items-center justify-center text-ui-ink/40">
          <LayoutGrid size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Welcome to Next</h2>
          <p className="text-ui-ink/40 max-w-xs mx-auto">Please sign in from the Settings tab to start managing your priorities.</p>
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
    <div className="app-page app-home-content">
      <header className="app-home-header">
        <h1 className="app-brand-title">Next</h1>
      </header>
      <div className="app-home-meta flex items-center justify-between gap-4">
        <p className="text-ui-ink/40 font-medium">
          {availableUncompletedTasks.length} {availableUncompletedTasks.length === 1 ? 'task' : 'tasks'}
        </p>
        {isScoresEnabled && (
          <div className="text-right">
            <span className="ui-section-title text-[10px] font-black uppercase tracking-widest text-ui-ink/40 block">Overall Score</span>
            <span className="text-xl font-black text-ui-text">{formatNumber(overallScore, 1)}</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {loading && <StateFeedback kind="loading" />}
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
          <div className="ui-meta flex items-center justify-between py-3 px-5 bg-ui-section rounded-2xl border border-zinc-100 dark:border-zinc-800/80 text-xs font-medium text-ui-ink/40">
            <span>{skippedTaskIds.length} {skippedTaskIds.length === 1 ? 'task' : 'tasks'} skipped for today</span>
            <button
              type="button"
              onClick={resetSkippedTasks}
              className="flex items-center gap-1.5 font-bold text-ui-ink/70 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
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
            className="bg-ui-section rounded-[32px]"
          >
            <StateFeedback title={skippedTaskIds.length > 0 ? 'Tasks skipped for today' : 'All caught up!'} />
          </motion.div>
        )}
      </div>

      <FloatingAddButton label="Add task" onClick={() => { setEditingTask(null); setIsModalOpen(true); }} />
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={saveTask}
        task={editingTask}
      />
    </div>
  );
}
