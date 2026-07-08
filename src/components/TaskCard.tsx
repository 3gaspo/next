import React from 'react';
import { Task, PrioritySettings } from '../types';
import { calculatePriorityScore } from '../lib/priority';
import { CheckCircle2, Circle, Edit2, Calendar, Target, Clock, Zap, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';

interface TaskCardProps {
  task: Task;
  rootProjectName?: string;
  settings: PrioritySettings;
  onToggle: (taskId: string) => Promise<void> | void;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, rootProjectName, settings, onToggle, onEdit }) => {
  const score = calculatePriorityScore(task, settings);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          {rootProjectName && (
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">
              {rootProjectName}
            </span>
          )}
          <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
            {task.name}
          </h3>
          
          <div className="flex flex-wrap gap-3 pt-2">
            {task.deadline && (
              <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-500 font-medium bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-lg">
                <Calendar size={12} />
                {format(parseISO(task.deadline), 'MMM d')}
              </div>
            )}
            
            <div className="flex items-center gap-4 text-xs text-zinc-400 font-medium">
              <span className="flex items-center gap-1"><Target size={12} /> {task.importance}</span>
              <span className="flex items-center gap-1"><Clock size={12} /> {task.duration}m</span>
              <span className="flex items-center gap-1"><Zap size={12} /> {task.effort}</span>
              <span className="flex items-center gap-1"><Heart size={12} /> {task.appreciation}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <button 
            onClick={() => onToggle(task.id)}
            className="text-zinc-300 dark:text-zinc-700 hover:text-green-500 dark:hover:text-green-500 transition-colors"
          >
            {task.completed ? <CheckCircle2 size={32} className="text-green-500" /> : <Circle size={32} />}
          </button>
          <div className="flex items-center gap-2">
             <div className="text-xs font-black bg-zinc-900 dark:bg-white text-white dark:text-black px-2 py-1 rounded-full opacity-30 group-hover:opacity-100 transition-opacity">
              {score}
            </div>
            <button 
              onClick={() => onEdit(task)}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"
            >
              <Edit2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
