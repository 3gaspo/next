import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { Task } from '../types';
import { getChildren, hasChildren, getBreadcrumbPath, getDescendantCounts } from '../lib/tree';
import TaskModal from '../components/TaskModal';
import { 
  ChevronRight, 
  ChevronLeft, 
  Folder, 
  FileText, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Circle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Database() {
  const { user, tasks, saveTask, toggleTask, deleteTask, loading } = useData();
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const currentLevelTasks = useMemo(() => {
    return getChildren(currentParentId, tasks).sort((a, b) => {
      const aIsFolder = hasChildren(a.id, tasks);
      const bIsFolder = hasChildren(b.id, tasks);
      if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
  }, [currentParentId, tasks]);

  const breadcrumbs = useMemo(() => {
    if (!currentParentId) return [];
    return getBreadcrumbPath(currentParentId, tasks);
  }, [currentParentId, tasks]);

  const handleAddChild = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddChildParentId(task.id);
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleCreateAtLevel = () => {
    setAddChildParentId(currentParentId);
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEdit = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddChildParentId(task.parentId);
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this task and all its descendants?')) {
      deleteTask(taskId);
    }
  };

  const handleToggle = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTask(taskId);
  };

  const [addChildParentId, setAddChildParentId] = useState<string | null>(null);

  return (
    <div className="px-6 pt-12 pb-24 max-w-lg mx-auto">
      <header className="mb-10 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Database</h1>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setCurrentParentId(null)}
            className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${!currentParentId ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            Root
          </button>
          {breadcrumbs.map((crumb) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight size={14} className="text-zinc-300 shrink-0" />
              <button 
                onClick={() => setCurrentParentId(crumb.id)}
                className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${currentParentId === crumb.id ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
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
            className="w-full flex items-center gap-4 p-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="font-bold uppercase text-[11px] tracking-widest">Go Back</span>
          </button>
        )}

        <AnimatePresence mode="popLayout">
          {currentLevelTasks.map((task) => {
            const isFolder = hasChildren(task.id, tasks);
            const { total, completed } = getDescendantCounts(task.id, tasks);
            
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => isFolder ? setCurrentParentId(task.id) : null}
                className="group w-full flex items-center justify-between gap-4 p-6 bg-white dark:bg-zinc-900 rounded-[24px] shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isFolder ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300' : 'bg-transparent text-zinc-400'}`}>
                    {isFolder ? <Folder size={20} fill="currentColor" opacity={0.2} /> : <FileText size={20} />}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold tracking-tight ${task.completed ? 'text-zinc-400 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>
                      {task.name}
                    </h3>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                      {isFolder ? `${completed} / ${total} tasks` : 'Leaf Task'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isFolder && (
                    <button 
                      onClick={(e) => handleToggle(task.id, e)}
                      className="p-2 text-zinc-300 hover:text-green-500 transition-colors"
                    >
                      {task.completed ? <CheckCircle2 size={24} className="text-green-500" /> : <Circle size={24} />}
                    </button>
                  )}
                  <button 
                    onClick={(e) => handleAddChild(task, e)}
                    className="p-2 text-zinc-300 hover:text-zinc-600 dark:hover:text-zinc-100 transition-colors"
                    title="Add Child"
                  >
                    <Plus size={20} />
                  </button>
                  <button 
                    onClick={(e) => handleEdit(task, e)}
                    className="p-2 text-zinc-300 hover:text-zinc-600 dark:hover:text-zinc-100 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(task.id, e)}
                    className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  {isFolder && <ChevronRight size={18} className="text-zinc-300 ml-2" />}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {currentLevelTasks.length === 0 && !loading && (
          <div className="py-20 text-center text-zinc-400 font-medium">
            This folder is empty
          </div>
        )}
      </div>

      <div className="fixed bottom-28 right-6 z-40">
        <button 
          onClick={handleCreateAtLevel}
          className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-all"
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
      />
    </div>
  );
}
