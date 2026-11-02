import { ConfirmDelete } from '@3gaspo/app-ui/ConfirmDelete';
import { ActionButton } from '@3gaspo/app-ui/ActionButton';
import { formatDate, formatNumber } from '@3gaspo/app-ui/formats';
import { ActionMenu } from '../components/ActionMenu';
import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { Task } from '../types';
import { getChildren, isFolder, getBreadcrumbPath, getDescendantCounts, getDescendants, getLeafTasks } from '../lib/tree';
import { calculatePriorityScore } from '../lib/priority';
import TaskModal from '../components/TaskModal';
import { FloatingAddButton } from '../components/FloatingAddButton';
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
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [showDone, setShowDone] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [addChildParentId, setAddChildParentId] = useState<string | null>(null);
  const [modalInitialIsFolder, setModalInitialIsFolder] = useState<boolean>(false);

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
    setDeletingTask(tasks.find(task => task.id === taskId) || null);
  };

  const handleToggle = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    return toggleTask(taskId);
  };

  return (
    <div className="app-page">
      <header className="mb-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-4xl font-bold tracking-tight">Database</h1>
          <ActionButton
            type="button"
            aria-pressed={showDone}
            onClick={() => setShowDone(prev => !prev)}
            className={`ui-option flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              showDone
                ? 'bg-ui-primary text-ui-primary-text shadow-sm'
                : 'bg-ui-section text-ui-ink/40 hover:text-ui-text dark:hover:text-ui-text'
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
              <span className={"ui-meta " + (`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                showDone 
                  ? 'bg-ui-primary-text/20 text-ui-primary-text'
                  : 'bg-ui-ink/10 text-ui-ink/60'
              }`)}>
                {doneCountAtLevel}
              </span>
            )}
          </ActionButton>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <ActionButton
            onClick={() => setCurrentParentId(null)}
            className={"ui-button " + (`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${!currentParentId ? 'bg-ui-primary text-ui-primary-text' : 'text-ui-ink/40 hover:bg-ui-ink/10'}`)}
          >
            Root
          </ActionButton>
          {breadcrumbs.map((crumb) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight size={14} className="text-ui-ink/30 shrink-0" />
              <ActionButton
                onClick={() => setCurrentParentId(crumb.id)}
                className={"ui-button " + (`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${currentParentId === crumb.id ? 'bg-ui-primary text-ui-primary-text' : 'text-ui-ink/40 hover:bg-ui-ink/10'}`)}
              >
                {crumb.name}
              </ActionButton>
            </React.Fragment>
          ))}
        </div>
      </header>

      <div className="bg-ui-section rounded-[32px] p-2 space-y-1">
        {currentParentId && (
          <ActionButton
            onClick={() => {
              const current = tasks.find(t => t.id === currentParentId);
              setCurrentParentId(current?.parentId || null);
            }}
            className="w-full flex items-center gap-4 p-6 text-ui-ink/40 hover:text-ui-ink/60 dark:hover:text-ui-ink/70 transition-colors cursor-pointer"
          >
            <ChevronLeft size={20} />
            <span className="font-bold uppercase text-[11px] tracking-widest">Go Back</span>
          </ActionButton>
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
                className="database-row group w-full bg-ui-surface rounded-[24px] shadow-sm hover:shadow-md transition-all cursor-pointer "
              >
                <div className="database-row-main flex items-center min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isItemFolder ? 'bg-ui-section text-ui-ink/60' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'}`}>
                    {isItemFolder ? <Folder size={20} fill="currentColor" opacity={0.2} /> : <Leaf size={20} />}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className={`font-bold tracking-tight break-words text-base leading-snug ${task.completed ? 'text-ui-ink/40 line-through' : 'text-ui-text'}`}>
                      {task.name}
                    </h3>
                    <div className="ui-meta text-[10px] uppercase font-bold tracking-widest text-ui-ink/40 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>
                        {isItemFolder ? `${completed} / ${total} tasks` : 'Leaf Task'}
                      </span>
                      {task.deadline && (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold normal-case bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full text-[10px]">
                          <Calendar size={10} />
                          Due {formatDate(task.deadline, 'compact')}
                        </span>
                      )}
                      {settings.showScores && itemScore !== null && (
                        <span>• Category Score: {formatNumber(itemScore, 1)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="database-row-actions flex items-center gap-2">
                  {settings.showScores && itemScore !== null && (
                    <span className="text-xs font-black bg-ui-primary text-ui-primary-text px-2.5 py-1 rounded-full opacity-80 group-hover:opacity-100 transition-opacity">
                      {formatNumber(itemScore, 1)}
                    </span>
                  )}
                  
                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {!isItemFolder && (
                      <ActionButton
                        onClick={(e) => handleToggle(task.id, e)}
                        className="p-2 text-ui-ink/30 hover:text-green-500 transition-colors cursor-pointer"
                      >
                        {task.completed ? <CheckCircle2 size={24} className="text-green-500" /> : <Circle size={24} />}
                      </ActionButton>
                    )}
                    <ActionButton
                      onClick={(e) => handleAddChild(task, e)}
                      className="ui-icon-button p-2 text-ui-ink/30 hover:text-ui-ink/60 dark:hover:text-ui-text transition-colors cursor-pointer"
                      title={isItemFolder ? 'Add task or Subfolder' : 'Add Child'}
                    >
                      <Plus size={20} />
                    </ActionButton>
                    <ActionButton
                      onClick={(e) => handleEdit(task, e)}
                      className="ui-icon-button p-2 text-ui-ink/30 hover:text-ui-ink/60 dark:hover:text-ui-text transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </ActionButton>
                    <ActionButton
                      onClick={(e) => handleDelete(task.id, e)}
                      className="ui-icon-button p-2 text-ui-ink/30 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </ActionButton>
                    {isItemFolder && <ChevronRight size={18} className="text-ui-ink/30 ml-2" />}
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
                <p className="text-ui-ink/40 font-medium">All tasks in this view are completed</p>
                <ActionButton
                  type="button"
                  onClick={() => setShowDone(true)}
                  className="text-xs font-bold text-ui-text underline hover:opacity-80 transition-opacity cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Eye size={13} />
                  Show {doneCountAtLevel} done {doneCountAtLevel === 1 ? 'task' : 'tasks'}
                </ActionButton>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-14 h-14 mx-auto rounded-3xl bg-ui-section flex items-center justify-center text-ui-ink/40">
                  <Folder size={26} />
                </div>
                <div className="space-y-1">
                  <p className="text-ui-ink/70 font-bold">
                    {currentParentId ? 'This folder is empty' : 'No tasks or folders yet'}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <ActionButton
                    type="button"
                    onClick={() => handleCreateAtLevel(false)}
                    className="ui-button ui-button-primary inline-flex items-center gap-2 px-4 py-2.5 bg-ui-primary text-ui-primary-text rounded-xl font-bold text-xs shadow-sm hover:opacity-90 transition-all cursor-pointer"
                  >
                    <Leaf size={14} />
                    Add task
                  </ActionButton>
                  <ActionButton
                    type="button"
                    onClick={() => handleCreateAtLevel(true)}
                    className="ui-button ui-button-secondary inline-flex items-center gap-2 px-4 py-2.5 bg-ui-section text-ui-text rounded-xl font-bold text-xs hover:bg-ui-ink/10 transition-all cursor-pointer"
                  >
                    <Folder size={14} />
                    Add folder
                  </ActionButton>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button with Speed Dial */}
      <div className="app-floating-actions z-40">
        <ActionMenu label="Add folder or task" triggerId="add-task-menu" triggerClassName="app-add-button" icon={<Plus size={28} aria-hidden="true" />} items={[
          { label: 'Add folder', icon: <Folder size={20} />, onSelect: () => handleCreateAtLevel(true) },
          { label: 'Add task', icon: <Leaf size={20} />, onSelect: () => handleCreateAtLevel(false) },
        ]} />
      </div>

      <ConfirmDelete open={!!deletingTask} onClose={() => setDeletingTask(null)} title={deletingTask?.isFolder ? 'Delete folder' : 'Delete task'} onConfirm={async () => {
        if (!deletingTask) return;
        await deleteTask(deletingTask.id);
        setDeletingTask(null);
      }}>
        <p>Delete “{deletingTask?.name}” and all its descendants?</p>
        <p>This cannot be undone.</p>
      </ConfirmDelete>
      <TaskModal
        returnFocusId="add-task-menu"
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
