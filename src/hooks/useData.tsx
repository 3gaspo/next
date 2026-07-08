import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Task, UserSettings, DEFAULT_PRIORITY_SETTINGS } from '../types';
import { authProvider, dataProvider } from '../services/providerFactory';
import { getLeafTasks } from '../lib/tree';
import { sortTasksByPriority } from '../lib/priority';

interface DataContextType {
  user: { uid: string; email: string | null } | null;
  tasks: Task[];
  actionableTasks: Task[];
  settings: UserSettings;
  loading: boolean;
  saveTask: (taskData: Partial<Task>) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateSettings: (newSettings: UserSettings) => Promise<void>;
  resetAll: () => Promise<void>;
  clearHistory: () => Promise<void>;
  fetchData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ uid: string; email: string | null } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<UserSettings>({ priority: DEFAULT_PRIORITY_SETTINGS, darkMode: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = authProvider.onAuthStateChanged((state) => {
      setUser(state.user);
      if (!state.user) {
        setTasks([]);
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [fetchedTasks, fetchedSettings] = await Promise.all([
        dataProvider.getTasks(user.uid),
        dataProvider.getSettings(user.uid)
      ]);
      setTasks(fetchedTasks);
      if (fetchedSettings) setSettings(fetchedSettings);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const actionableTasks = useMemo(() => {
    const leaves = getLeafTasks(tasks);
    const sorted = sortTasksByPriority(leaves, settings.priority);
    // Move completed tasks to the bottom
    return [
      ...sorted.filter(t => !t.completed),
      ...sorted.filter(t => t.completed)
    ];
  }, [tasks, settings.priority]);

  const saveTask = async (taskData: Partial<Task>) => {
    if (!user) return;
    const now = new Date().toISOString();
    if ('id' in taskData && taskData.id) {
      const { id, ...updates } = taskData;
      await dataProvider.updateTask(user.uid, id, { ...updates, updatedAt: now });
    } else {
      await dataProvider.addTask(user.uid, {
        name: taskData.name || '',
        parentId: taskData.parentId || null,
        deadline: taskData.deadline || null,
        importance: taskData.importance || 5,
        duration: taskData.duration || 30,
        effort: taskData.effort || 3,
        appreciation: taskData.appreciation || 5,
        completed: false,
        completedAt: null,
        createdAt: now,
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

  const updateSettings = async (newSettings: UserSettings) => {
    if (!user) return;
    setSettings(newSettings);
    await dataProvider.saveSettings(user.uid, newSettings);
  };

  const resetAll = async () => {
    if (!user) return;
    const allTaskIds = tasks.map(t => t.id);
    await dataProvider.deleteTasks(user.uid, allTaskIds);
    const defaultSettings = { priority: DEFAULT_PRIORITY_SETTINGS, darkMode: settings.darkMode };
    setSettings(defaultSettings);
    await dataProvider.saveSettings(user.uid, defaultSettings);
    await fetchData();
  };

  const clearHistory = async () => {
    if (!user) return;
    const completedTaskIds = tasks.filter(t => t.completed).map(t => t.id);
    await dataProvider.deleteTasks(user.uid, completedTaskIds);
    await fetchData();
  };

  const value = useMemo(() => ({
    user,
    tasks,
    actionableTasks,
    settings,
    loading,
    saveTask,
    toggleTask,
    deleteTask,
    updateSettings,
    resetAll,
    clearHistory,
    fetchData
  }), [user, tasks, actionableTasks, settings, loading, saveTask, toggleTask, deleteTask, updateSettings, resetAll, clearHistory, fetchData]);

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
