import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DEFAULT_DARK_MODE } from '@3gaspo/app-ui/themePreference';
import { isToday, parseISO } from 'date-fns';
import { Task, UserSettings, DEFAULT_PRIORITY_SETTINGS } from '../types';
import { authProvider, dataProvider } from '../services/providerFactory';
import { getLeafTasks } from '../lib/tree';
import { sortTasksByPriority } from '../lib/priority';
import { useToday } from './useToday';

type SettingsUpdate = Omit<Partial<UserSettings>, 'priority'> & { priority?: Partial<UserSettings['priority']> };

interface DataContextType {
  today: Date;
  user: { uid: string; email: string | null } | null;
  tasks: Task[];
  actionableTasks: Task[];
  settings: UserSettings;
  loading: boolean;
  loadError: string | null;
  skippedTaskIds: string[];
  skipTaskForToday: (taskId: string) => void;
  unskipTask: (taskId: string) => void;
  resetSkippedTasks: () => void;
  saveTask: (taskData: Partial<Task>) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateSettings: (newSettings: SettingsUpdate) => Promise<void>;
  resetAll: () => Promise<void>;
  clearHistory: () => Promise<void>;
  fetchData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const SKIPPED_TASKS_KEY = 'next_skipped_tasks';

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const today = useToday();
  const [user, setUser] = useState<{ uid: string; email: string | null } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<UserSettings>({ priority: DEFAULT_PRIORITY_SETTINGS, darkMode: DEFAULT_DARK_MODE, showScores: false, maxHomeTasks: 3 });
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [skippedTaskIds, setSkippedTaskIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const unsub = authProvider.onAuthStateChanged((state) => {
        if (state.error) {
          setLoadError("Could not load data.");
          setLoading(false);
          return;
        }
        setUser(state.user);
        if (!state.user) {
          setTasks([]);
          setLoadError(null);
          setLoading(false);
          setSkippedTaskIds([]);
        }
      });
      return unsub;
    } catch (error) {
      console.error("Could not load session:", error);
      setLoadError("Could not load data.");
      setLoading(false);
    }
  }, []);

  // Load skipped tasks for today for current user
  useEffect(() => {
    if (!user) {
      setSkippedTaskIds([]);
      return;
    }
    try {
      const stored = localStorage.getItem(`${SKIPPED_TASKS_KEY}_${user.uid}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.date === getTodayKey() && Array.isArray(parsed.taskIds)) {
          setSkippedTaskIds(parsed.taskIds);
          return;
        }
      }
    } catch (e) {
      console.error('Error loading skipped tasks:', e);
    }
    setSkippedTaskIds([]);
  }, [user, today]);

  const saveSkippedToStorage = useCallback((uid: string, ids: string[]) => {
    try {
      localStorage.setItem(`${SKIPPED_TASKS_KEY}_${uid}`, JSON.stringify({
        date: getTodayKey(),
        taskIds: ids,
      }));
    } catch (e) {
      console.error('Error saving skipped tasks:', e);
    }
  }, []);

  const skipTaskForToday = useCallback((taskId: string) => {
    if (!user) return;
    setSkippedTaskIds(prev => {
      if (prev.includes(taskId)) return prev;
      const next = [...prev, taskId];
      saveSkippedToStorage(user.uid, next);
      return next;
    });
  }, [user, saveSkippedToStorage]);

  const unskipTask = useCallback((taskId: string) => {
    if (!user) return;
    setSkippedTaskIds(prev => {
      const next = prev.filter(id => id !== taskId);
      saveSkippedToStorage(user.uid, next);
      return next;
    });
  }, [user, saveSkippedToStorage]);

  const resetSkippedTasks = useCallback(() => {
    if (!user) return;
    setSkippedTaskIds([]);
    saveSkippedToStorage(user.uid, []);
  }, [user, saveSkippedToStorage]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [fetchedTasks, fetchedSettings] = await Promise.all([
        dataProvider.getTasks(user.uid),
        dataProvider.getSettings(user.uid)
      ]);
      setTasks(fetchedTasks);
      setSettings({
        priority: { ...DEFAULT_PRIORITY_SETTINGS, ...(fetchedSettings?.priority || {}) },
        darkMode: fetchedSettings?.darkMode ?? DEFAULT_DARK_MODE,
        showScores: Boolean(fetchedSettings?.showScores),
        maxHomeTasks: typeof fetchedSettings?.maxHomeTasks === 'number' ? fetchedSettings.maxHomeTasks : 3,
      });
      setLoadError(null);
    } catch (error) {
      console.error('Fetch error:', error);
      setLoadError('Could not load data. Try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

function isCompletedToday(task: Task): boolean {
  if (!task.completed || !task.completedAt) return false;
  try {
    return isToday(parseISO(task.completedAt));
  } catch {
    return false;
  }
}

  const actionableTasks = useMemo(() => {
    const leaves = getLeafTasks(tasks);
    // Include all active tasks, plus tasks completed today (they disappear the next day)
    const validLeaves = leaves.filter(t => !t.completed || isCompletedToday(t));
    const sorted = sortTasksByPriority(validLeaves, settings.priority, today);
    // Move completed tasks to the bottom
    return [
      ...sorted.filter(t => !t.completed),
      ...sorted.filter(t => t.completed)
    ];
  }, [tasks, settings.priority, today]);

  const saveTask = async (taskData: Partial<Task>) => {
    if (!user) return;
    const now = new Date().toISOString();
    if ('id' in taskData && taskData.id) {
      const { id, ...updates } = taskData;
      if (updates.isFolder) {
        updates.importance = 0;
        updates.duration = 0;
        updates.effort = 0;
        updates.appreciation = 0;
      }
      await dataProvider.updateTask(user.uid, id, { ...updates, updatedAt: now });
    } else {
      const isFolder = Boolean(taskData.isFolder);
      await dataProvider.addTask(user.uid, {
        name: taskData.name || '',
        parentId: taskData.parentId || null,
        isFolder,
        deadline: taskData.deadline || null,
        importance: isFolder ? 0 : (taskData.importance ?? 5),
        duration: isFolder ? 0 : (taskData.duration ?? 30),
        effort: isFolder ? 0 : (taskData.effort ?? 3),
        appreciation: isFolder ? 0 : (taskData.appreciation ?? 5),
        completed: false,
        completedAt: null,
        createdAt: taskData.createdAt || now,
        updatedAt: now,
      });
    }
    await fetchData();
  };

  const toggleTask = async (taskId: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const now = new Date().toISOString();
    await dataProvider.updateTask(user.uid, taskId, {
      completed: !task.completed,
      completedAt: !task.completed ? now : null,
      updatedAt: now
    });
    await fetchData();
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    await dataProvider.deleteSubtree(user.uid, taskId);
    await fetchData();
  };

  const updateSettings = async (updates: SettingsUpdate) => {
    if (!user) return;
    const newSettings = { ...settingsRef.current, ...updates };
    const normalized: UserSettings = {
      ...newSettings,
      priority: { ...DEFAULT_PRIORITY_SETTINGS, ...settingsRef.current.priority, ...updates.priority },
      darkMode: newSettings.darkMode ?? DEFAULT_DARK_MODE,
      showScores: Boolean(newSettings.showScores),
      maxHomeTasks: typeof newSettings.maxHomeTasks === 'number' && newSettings.maxHomeTasks > 0 ? newSettings.maxHomeTasks : 3,
    };
    await dataProvider.saveSettings(user.uid, normalized);
    settingsRef.current = normalized;
    setSettings(normalized);
  };

  const resetAll = async () => {
    if (!user) return;
    const allTaskIds = tasks.map(t => t.id);
    await dataProvider.deleteTasks(user.uid, allTaskIds);
    const defaultSettings: UserSettings = { 
      priority: DEFAULT_PRIORITY_SETTINGS, 
      darkMode: Boolean(settings.darkMode), 
      showScores: Boolean(settings.showScores),
      maxHomeTasks: 3,
    };
    setSettings(defaultSettings);
    await dataProvider.saveSettings(user.uid, defaultSettings);
    resetSkippedTasks();
    await fetchData();
  };

  const clearHistory = async () => {
    if (!user) return;
    const completedTaskIds = tasks.filter(t => t.completed).map(t => t.id);
    await dataProvider.deleteTasks(user.uid, completedTaskIds);
    await fetchData();
  };

  const value = useMemo(() => ({
    today,
    user,
    tasks,
    actionableTasks,
    settings,
    loading,
    loadError,
    skippedTaskIds,
    skipTaskForToday,
    unskipTask,
    resetSkippedTasks,
    saveTask,
    toggleTask,
    deleteTask,
    updateSettings,
    resetAll,
    clearHistory,
    fetchData
  }), [today, user, tasks, actionableTasks, settings, loading, loadError, skippedTaskIds, skipTaskForToday, unskipTask, resetSkippedTasks, saveTask, toggleTask, deleteTask, updateSettings, resetAll, clearHistory, fetchData]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
