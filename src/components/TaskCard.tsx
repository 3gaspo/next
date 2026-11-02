import { ActionButton } from '@3gaspo/app-ui/ActionButton';
import { formatDate, formatNumber } from '@3gaspo/app-ui/formats';
import React from 'react';
import { Task, PrioritySettings } from '../types';
import { calculatePriorityScore } from '../lib/priority';
import { CheckCircle2, Circle, Edit2, Calendar, Target, Clock, Zap, Heart, FastForward } from 'lucide-react';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';

interface TaskCardProps {
  task: Task;
  rootProjectName?: string;
  settings: PrioritySettings;
  showScores?: boolean;
  onToggle: (taskId: string) => Promise<void> | void;
  onEdit: (task: Task) => void;
  onSkip?: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  rootProjectName, 
  settings, 
  showScores = false, 
  onToggle, 
  onEdit,
  onSkip 
}) => {
  const score = calculatePriorityScore(task, settings);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.15 }}
      className="ui-item-card bg-ui-surface border border-ui-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="task-card-grid" data-has-project={!!rootProjectName}>
        <div className="task-card-main min-w-0 space-y-2">
          {rootProjectName && (
            <span title={rootProjectName} className="task-card-project ui-section-title text-[10px] font-bold uppercase tracking-[0.1em] text-ui-muted">
              {rootProjectName}
            </span>
          )}
          <h3 className="task-card-name ui-item-title text-xl font-bold tracking-tight text-ui-text leading-tight">
            {task.name}
          </h3>
          
          <div className="task-card-meta flex flex-wrap gap-3">
            {task.deadline && (
              <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-500 font-medium bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-lg">
                <Calendar size={12} />
                {formatDate(task.deadline, 'compact')}
              </div>
            )}
            
            <div className="task-card-metrics ui-meta flex items-center text-xs text-ui-ink/40 font-medium">
              <span className="flex items-center gap-1"><Target size={12} /> {task.importance}</span>
              <span className="flex items-center gap-1"><Clock size={12} /> {formatNumber(task.duration)} min</span>
              <span className="flex items-center gap-1"><Zap size={12} /> {task.effort}</span>
              <span className="flex items-center gap-1"><Heart size={12} /> {task.appreciation}</span>
            </div>
          </div>
        </div>

        <div className="task-card-controls">
          <ActionButton
            type="button"
            aria-label={`Complete ${task.name}`}
            aria-pressed={task.completed}
            onClick={() => onToggle(task.id)}
            className="task-card-toggle text-ui-ink/30 dark:text-ui-ink/30 hover:text-green-500 dark:hover:text-green-500 transition-colors cursor-pointer"
          >
            {task.completed ? <CheckCircle2 size={32} className="text-green-500" /> : <Circle size={32} />}
          </ActionButton>
          <div className="task-card-actions">
            {showScores && (
              <div className="task-card-score text-xs font-black bg-ui-primary text-ui-primary-text px-2 py-1 rounded-full opacity-70 group-hover:opacity-100 transition-opacity">
                {formatNumber(score, 1)}
              </div>
            )}
            {onSkip && !task.completed && (
              <ActionButton
                type="button"
                title="Skip for today"
                onClick={() => onSkip(task.id)}
                className="ui-icon-button ui-row-action hover:bg-amber-50 dark:hover:bg-amber-950/30 text-ui-ink/60 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
              >
                <FastForward size={16} />
              </ActionButton>
            )}
            <ActionButton aria-label="Edit"
              onClick={() => onEdit(task)}
              className="ui-icon-button ui-row-action hover:bg-ui-ink/10 text-ui-ink/60 transition-colors cursor-pointer"
            >
              <Edit2 size={16} />
            </ActionButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
