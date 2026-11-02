import { ACTIONS } from '@3gaspo/app-ui/labels';
import { ValidatedForm } from './ValidatedForm';
import React, { useState, useEffect, useId } from 'react';
import { Task } from '../types';
import { Calendar, Target, Clock, Zap, Heart, CalendarPlus, Folder, Leaf } from 'lucide-react';
import { Dialog, DialogActions } from './Dialog';
import { format, parseISO } from 'date-fns';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void | Promise<void>;
  task?: Task | null;
  parentId?: string | null;
  initialIsFolder?: boolean;
  returnFocusId?: string;
}

export default function TaskModal({ isOpen, onClose, onSave, task, parentId, initialIsFolder = false, returnFocusId }: TaskModalProps) {
  const formId = useId();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isFolder, setIsFolder] = useState(false);
  const [name, setName] = useState('');
  const [addedDate, setAddedDate] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('');
  const [importance, setImportance] = useState('5');
  const [duration, setDuration] = useState('30');
  const [effort, setEffort] = useState('3');
  const [appreciation, setAppreciation] = useState('5');

  useEffect(() => {
    setSaveError(null);
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (task) {
      setIsFolder(Boolean(task.isFolder));
      setName(task.name);
      setAddedDate(task.createdAt ? format(parseISO(task.createdAt), 'yyyy-MM-dd') : todayStr);
      setDeadline(task.deadline || '');
      setImportance(String(task.importance || 5));
      setDuration(String(task.duration || 30));
      setEffort(String(task.effort || 3));
      setAppreciation(String(task.appreciation || 5));
    } else {
      setIsFolder(Boolean(initialIsFolder));
      setName('');
      setAddedDate(todayStr);
      setDeadline('');
      setImportance('5');
      setDuration('30');
      setEffort('3');
      setAppreciation('5');
    }
  }, [task, isOpen, initialIsFolder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    
    // Create an ISO string for createdAt from the chosen addedDate
    let createdAtISO: string;
    if (addedDate) {
      const parsedDate = new Date(`${addedDate}T00:00:00`);
      createdAtISO = isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();
    } else {
      createdAtISO = new Date().toISOString();
    }

    try {
      await onSave({
        ...(task ? { id: task.id } : {}),
        isFolder,
        name,
        createdAt: createdAtISO,
        deadline: deadline || null,
        importance: isFolder ? 0 : (Number(importance) || 0),
        duration: isFolder ? 0 : (Number(duration) || 0),
        effort: isFolder ? 0 : (Number(effort) || 0),
        appreciation: isFolder ? 0 : (Number(appreciation) || 0),
        parentId: task ? task.parentId : (parentId || null),
      });
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} busy={isSaving} onClose={onClose} returnFocusId={returnFocusId} title={task ? (isFolder ? 'Edit folder' : 'Edit task') : (isFolder ? 'Add folder' : 'Add task')}>
          {saveError && <p role="alert" className="ui-error mb-4">{saveError}</p>}
          {/* Mode Selector */}
          {!task && (
            <div className="mb-6">
              <div className="flex p-1 bg-ui-section rounded-2xl">
                <button
                  type="button"
                  onClick={() => setIsFolder(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !isFolder 
                      ? 'bg-ui-overlay text-ui-text shadow-sm'
                      : 'text-ui-ink/40 hover:text-ui-text dark:hover:text-ui-text'
                  }`}
                >
                  <Leaf size={14} />
                  <span>Task</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFolder(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isFolder 
                      ? 'bg-ui-overlay text-ui-text shadow-sm'
                      : 'text-ui-ink/40 hover:text-ui-text dark:hover:text-ui-text'
                  }`}
                >
                  <Folder size={14} />
                  <span>Folder</span>
                </button>
              </div>
            </div>
          )}

          <ValidatedForm id={formId} onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="ui-field-label text-[10px] font-bold uppercase tracking-widest text-ui-ink/40">
                {isFolder ? 'Folder Name' : 'Task Name'}
              </label>
              <input
                autoFocus
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={isFolder ? 'Folder name' : 'What needs to be done?'}
                className="ui-field w-full text-2xl font-bold bg-transparent border-none focus:ring-0 p-0 placeholder:text-ui-ink/30 dark:placeholder:text-ui-ink/30"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="ui-field-label text-[10px] font-bold uppercase tracking-widest text-ui-ink/40 flex items-center gap-2">
                  <CalendarPlus size={12} /> Added Date
                </label>
                <input
                  type="date"
                  value={addedDate}
                  onChange={e => setAddedDate(e.target.value)}
                  className="ui-field w-full bg-ui-section p-4 rounded-2xl border-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="ui-field-label text-[10px] font-bold uppercase tracking-widest text-ui-ink/40 flex items-center gap-2">
                  <Calendar size={12} /> Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="ui-field w-full bg-ui-section p-4 rounded-2xl border-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-medium"
                />
              </div>

              {!isFolder && (
                <>
                  <div className="space-y-2">
                    <label className="ui-field-label text-[10px] font-bold uppercase tracking-widest text-ui-ink/40 flex items-center gap-2">
                      <Clock size={12} /> Duration (mins)
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      className="ui-field w-full bg-ui-section p-4 rounded-2xl border-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="ui-field-label text-[10px] font-bold uppercase tracking-widest text-ui-ink/40 flex items-center gap-2">
                      <Target size={12} /> Importance (1-10)
                    </label>
                    <input
                      type="number"
                      min="1" max="10"
                      value={importance}
                      onChange={e => setImportance(e.target.value)}
                      className="ui-field w-full bg-ui-section p-4 rounded-2xl border-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="ui-field-label text-[10px] font-bold uppercase tracking-widest text-ui-ink/40 flex items-center gap-2">
                      <Zap size={12} /> Effort (1-10)
                    </label>
                    <input
                      type="number"
                      min="1" max="10"
                      value={effort}
                      onChange={e => setEffort(e.target.value)}
                      className="ui-field w-full bg-ui-section p-4 rounded-2xl border-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="ui-field-label text-[10px] font-bold uppercase tracking-widest text-ui-ink/40 flex items-center gap-2">
                      <Heart size={12} /> Appreciation (1-10)
                    </label>
                    <input
                      type="number"
                      min="1" max="10"
                      value={appreciation}
                      onChange={e => setAppreciation(e.target.value)}
                      className="ui-field w-full bg-ui-section p-4 rounded-2xl border-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold"
                    />
                  </div>
                </>
              )}
            </div>

            <DialogActions form={formId} cancel>
              <button 
                type="submit"
                disabled={isSaving}
                aria-busy={isSaving}
                className="ui-button ui-button-primary w-full h-16 bg-ui-primary text-ui-primary-text rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl cursor-pointer"
              >
                {isSaving ? ACTIONS.saving : ACTIONS.save}
              </button>
            </DialogActions>
          </ValidatedForm>
    </Dialog>
  );
}
