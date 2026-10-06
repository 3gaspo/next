import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { Task } from '../types';
import { getChildren, isFolder, getBreadcrumbPath, getDescendantCounts, getDescendants, getLeafTasks } from '../lib/tree';
import { calculatePriorityScore } from '../lib/priority';
import TaskModal from '../components/TaskModal';
import { 
  ChevronRight, 
  ChevronLeft, 
  Folder, 
  Leaf, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Circle,
  Eye,
  EyeOff,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO } from 'date-fns';

export default function Database() {
  const { user, tasks, settings, saveTask, toggleTask, deleteTask, loading } = useData();
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [addChildParentId, setAddChildParentId] = useState<string | null>(null);
  const [modalInitialIsFolder, setModalInitialIsFolder] = useState<boolean>(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

  const allLevelTasks = useMemo(() => {
    return getChildren(currentParentId, tasks);
  }, [currentParentId, tasks]);

  const doneCountAtLevel = useMemo(() => {
    return allLevelTasks.filter(t => t.completed).length;
  }, [allLevelTasks]);

  const currentLevelTasks = useMemo(() => {
    const filtered = showDone ? allLevelTasks : allLevelTasks.filter(t => !t.completed);
    return filtered.sort((a, b) => {
      const aIsFolder = isFolder(a, tasks);
      const bIsFolder = isFolder(b, tasks);
      if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
  }, [allLevelTasks, showDone, tasks]);

  const breadcrumbs = useMemo(() => {
    if (!currentParentId) return [];
    return getBreadcrumbPath(currentParentId, tasks);
  }, [currentParentId, tasks]);

  const handleCreateAtLevel = (asFolder: boolean = false) => {
    setAddChildParentId(currentParentId);
    setEditingTask(null);
    setModalInitialIsFolder(asFolder);
    setIsFabMenuOpen(false);
    setIsModalOpen(true);
  };

  const handleAddChild = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddChildParentId(task.id);
    setEditingTask(null);
    setModalInitialIsFolder(false);
    setIsModalOpen(true);
  };

  const handleEdit = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddChildParentId(task.parentId);
    setEditingTask(task);
    setModalInitialIsFolder(Boolean(task.isFolder));
    setIsModalOpen(true);
  };

  const handleDelete = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this item and all its descendants?')) {
      deleteTask(taskId);
    }
  };

  const handleToggle = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTask(taskId);
  };

  return (
    <div className="px-6 pt-12 pb-24 max-w-lg mx-auto">
      <header className="mb-8 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-4xl font-bold tracking-tight">Database</h1>
          <button
            type="button"
            onClick={() => setShowDone(prev => !prev)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              showDone
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
            title={showDone ? 'Hide done tasks' : 'Show done tasks'}
          >
            {showDone ? (
              <>
                <EyeOff size={14} />
                <span>Hide done</span>
              </>
            ) : (
              <>
                <Eye size={14} />
                <span>Show done</span>
              </>
            )}
            {doneCountAtLevel > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                showDone 
                  ? 'bg-zinc-700 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800' 
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
              }`}>
                {doneCountAtLevel}
              </span>
            )}
          </button>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setCurrentParentId(null)}
            className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${!currentParentId ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            Root
          </button>
          {breadcrumbs.map((crumb) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight size={14} className="text-zinc-300 shrink-0" />
              <button 
                onClick={() => setCurrentParentId(crumb.id)}
                className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${currentParentId === crumb.id ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      </header>

      <div className="bg-black/5 dark:bg-white/5 rounded-[32px] p-2 space-y-1">
        {currentParentId && (
          <button 
            onClick={() => {
              const current = tasks.find(t => t.id === currentParentId);
              setCurrentParentId(current?.parentId || null);
            }}
            className="w-full flex items-center gap-4 p-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <ChevronLeft size={20} />
            <span className="font-bold uppercase text-[11px] tracking-widest">Go Back</span>
          </button>
        )}

        <AnimatePresence mode="popLayout">
          {currentLevelTasks.map((task) => {
            const isItemFolder = isFolder(task, tasks);
            const { total, completed } = getDescendantCounts(task.id, tasks);
            
            let itemScore: number | null = null;
            if (settings.showScores) {
              if (isItemFolder) {
                const descendants = getDescendants(task.id, tasks);
                const activeLeaves = getLeafTasks(descendants).filter(d => !d.completed);
                if (activeLeaves.length > 0) {
                  const sum = activeLeaves.reduce((acc, t) => acc + calculatePriorityScore(t, settings.priority), 0);
                  itemScore = Number((sum / activeLeaves.length).toFixed(1));
                }
              } else {
                itemScore = calculatePriorityScore(task, settings.priority);
              }
            }
            
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => isItemFolder ? setCurrentParentId(task.id) : null}
                className="group w-full flex items-center justify-between gap-4 p-6 bg-white dark:bg-zinc-900 rounded-[24px] shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isItemFolder ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'}`}>
                    {isItemFolder ? <Folder size={20} fill="currentColor" opacity={0.2} /> : <Leaf size={20} />}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className={`font-bold tracking-tight break-words text-base leading-snug ${task.completed ? 'text-zinc-400 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>
                      {task.name}
                    </h3>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>
                        {isItemFolder ? `${completed} / ${total} tasks` : 'Leaf Task'}
                      </span>
                      {task.deadline && (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold normal-case bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full text-[10px]">
                          <Calendar size={10} />
                          Due {format(parseISO(task.deadline), 'MMM d')}
                        </span>
                      )}
                      {settings.showScores && itemScore !== null && (
                        <span>• Category Score: {itemScore}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {settings.showScores && itemScore !== null && (
                    <span className="text-xs font-black bg-zinc-900 dark:bg-white text-white dark:text-black px-2.5 py-1 rounded-full opacity-80 group-hover:opacity-100 transition-opacity">
                      {itemScore}
                    </span>
                  )}
                  
                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {!isItemFolder && (
                      <button 
                        onClick={(e) => handleToggle(task.id, e)}
                        className="p-2 text-zinc-300 hover:text-green-500 transition-colors cursor-pointer"
                      >
                        {task.completed ? <CheckCircle2 size={24} className="text-green-500" /> : <Circle size={24} />}
                      </button>
                    )}
                    <button 
                      onClick={(e) => handleAddChild(task, e)}
                      className="p-2 text-zinc-300 hover:text-zinc-600 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                      title={isItemFolder ? 'Add Task or Subfolder' : 'Add Child'}
                    >
                      <Plus size={20} />
                    </button>
                    <button 
                      onClick={(e) => handleEdit(task, e)}
                      className="p-2 text-zinc-300 hover:text-zinc-600 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(task.id, e)}
                      className="p-2 text-zinc-300 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                    {isItemFolder && <ChevronRight size={18} className="text-zinc-300 ml-2" />}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {currentLevelTasks.length === 0 && !loading && (
          <div className="py-16 text-center space-y-4 px-4">
            {doneCountAtLevel > 0 && !showDone ? (
              <div className="space-y-3">
                <p className="text-zinc-400 font-medium">All tasks in this view are completed</p>
                <button
                  type="button"
                  onClick={() => setShowDone(true)}
                  className="text-xs font-bold text-zinc-900 dark:text-zinc-100 underline hover:opacity-80 transition-opacity cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Eye size={13} />
                  Show {doneCountAtLevel} done {doneCountAtLevel === 1 ? 'task' : 'tasks'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-14 h-14 mx-auto rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <Folder size={26} />
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-700 dark:text-zinc-300 font-bold">
                    {currentParentId ? 'This folder is empty' : 'No tasks or folders yet'}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleCreateAtLevel(false)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs shadow-sm hover:opacity-90 transition-all cursor-pointer"
                  >
                    <Leaf size={14} />
                    Add Task
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateAtLevel(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl font-bold text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
                  >
                    <Folder size={14} />
                    Add Folder
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button with Speed Dial */}
      <div className="fixed bottom-28 right-6 z-40 flex flex-col items-end gap-3">
        <AnimatePresence>
          {isFabMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              className="flex flex-col items-end gap-2.5 mb-1"
            >
              <button
                type="button"
                onClick={() => handleCreateAtLevel(true)}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-full shadow-xl border border-zinc-200/60 dark:border-zinc-700/60 hover:scale-105 active:scale-95 transition-all text-sm font-bold cursor-pointer"
              >
                <span>New Folder</span>
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200">
                  <Folder size={16} />
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleCreateAtLevel(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-full shadow-xl border border-zinc-200/60 dark:border-zinc-700/60 hover:scale-105 active:scale-95 transition-all text-sm font-bold cursor-pointer"
              >
                <span>New Task</span>
                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Leaf size={16} />
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsFabMenuOpen(prev => !prev)}
          aria-label="Add folder or task"
          className={`w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-all cursor-pointer ${isFabMenuOpen ? 'rotate-45' : 'rotate-0'}`}
        >
          <Plus size={32} />
        </button>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={saveTask}
        task={editingTask}
        parentId={addChildParentId}
        initialIsFolder={modalInitialIsFolder}
      />
    </div>
  );
}
