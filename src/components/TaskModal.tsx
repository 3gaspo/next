import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { X, Calendar, Target, Clock, Zap, Heart, CalendarPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO } from 'date-fns';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  task?: Task | null;
  parentId?: string | null;
}

export default function TaskModal({ isOpen, onClose, onSave, task, parentId }: TaskModalProps) {
  const [name, setName] = useState('');
  const [addedDate, setAddedDate] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('');
  const [importance, setImportance] = useState('5');
  const [duration, setDuration] = useState('30');
  const [effort, setEffort] = useState('3');
  const [appreciation, setAppreciation] = useState('5');

  useEffect(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (task) {
      setName(task.name);
      setAddedDate(task.createdAt ? format(parseISO(task.createdAt), 'yyyy-MM-dd') : todayStr);
      setDeadline(task.deadline || '');
      setImportance(String(task.importance));
      setDuration(String(task.duration));
      setEffort(String(task.effort));
      setAppreciation(String(task.appreciation));
    } else {
      setName('');
      setAddedDate(todayStr);
      setDeadline('');
      setImportance('5');
      setDuration('30');
      setEffort('3');
      setAppreciation('5');
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create an ISO string for createdAt from the chosen addedDate
    let createdAtISO: string;
    if (addedDate) {
      // Preserve time or set to beginning of selected day
      const parsedDate = new Date(`${addedDate}T00:00:00`);
      createdAtISO = isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();
    } else {
      createdAtISO = new Date().toISOString();
    }

    onSave({
      ...(task ? { id: task.id } : {}),
      name,
      createdAt: createdAtISO,
      deadline: deadline || null,
      importance: Number(importance) || 0,
      duration: Number(duration) || 0,
      effort: Number(effort) || 0,
      appreciation: Number(appreciation) || 0,
      parentId: task ? task.parentId : (parentId || null),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          <div className="p-8 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-2xl font-bold tracking-tight">{task ? 'Edit Task' : 'New Task'}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Name</label>
              <input
                autoFocus
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full text-2xl font-bold bg-transparent border-none focus:ring-0 p-0 placeholder:text-zinc-200 dark:placeholder:text-zinc-800"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <CalendarPlus size={12} /> Added Date
                </label>
                <input
                  type="date"
                  value={addedDate}
                  onChange={e => setAddedDate(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Calendar size={12} /> Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Clock size={12} /> Duration (mins)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Target size={12} /> Importance (1-10)
                </label>
                <input
                  type="number"
                  min="1" max="10"
                  value={importance}
                  onChange={e => setImportance(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Zap size={12} /> Effort (1-10)
                </label>
                <input
                  type="number"
                  min="1" max="10"
                  value={effort}
                  onChange={e => setEffort(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Heart size={12} /> Appreciation (1-10)
                </label>
                <input
                  type="number"
                  min="1" max="10"
                  value={appreciation}
                  onChange={e => setAppreciation(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold"
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                className="w-full h-16 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-lg active:scale-[0.98] transition-all shadow-lg hover:shadow-xl"
              >
                {task ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
