import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { TaskCard } from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { Task } from '../types';
import { getRootProject } from '../lib/tree';
import { calculatePriorityScore } from '../lib/priority';
import { Plus, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const { user, actionableTasks, tasks, settings, toggleTask, saveTask, loading } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

  const handleCreate = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const isScoresEnabled = Boolean(settings.showScores);

  return (
    <div className="px-6 pt-12 pb-24 max-w-lg mx-auto">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-1">Today</h1>
          <p className="text-zinc-400 font-medium">{actionableTasks.length} actionable tasks</p>
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
          {actionableTasks.map(task => {
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
              />
            );
          })}
        </AnimatePresence>

        {!loading && actionableTasks.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center px-6 bg-zinc-50 dark:bg-zinc-900/40 rounded-[32px]"
          >
            <p className="text-zinc-400 font-medium">All caught up! Create a new project in the Database page to get started.</p>
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
