import { appStorage, guestUser, isGuestSession } from '@3gaspo/app-ui/guestSession';
import { IAuthProvider, IDataProvider } from './interfaces';
import { DEFAULT_DARK_MODE } from '@3gaspo/app-ui/themePreference';
import { Task, UserSettings, AuthState, DEFAULT_PRIORITY_SETTINGS } from '../types';

const TASKS_KEY = 'next_local_tasks';
const SETTINGS_KEY = 'next_local_settings';
const AUTH_KEY = 'next_local_auth';

export class LocalAuthProvider implements IAuthProvider {
  onAuthStateChanged(callback: (state: AuthState) => void) {
    if (isGuestSession) {
      callback({ user: guestUser, loading: false });
      return () => {};
    }
    const signedOut = appStorage.getItem('next_local_signed_out') === 'true';
    const stored = appStorage.getItem(AUTH_KEY);
    
    let user = null;
    if (!signedOut) {
      if (stored) {
        user = JSON.parse(stored);
      } else {
        user = { uid: 'local-dev-user', email: 'dev@next.app' };
        appStorage.setItem(AUTH_KEY, JSON.stringify(user));
      }
    }
    
    // Simulate async
    setTimeout(() => {
      callback({ user, loading: false });
    }, 100);
    
    return () => {};
  }
  async signIn(email: string, _pass: string) {
    appStorage.removeItem('next_local_signed_out');
    appStorage.setItem(AUTH_KEY, JSON.stringify({ uid: 'local-dev-user', email }));
    window.location.reload();
  }
  async signUp(email: string, _pass: string) {
    appStorage.removeItem('next_local_signed_out');
    appStorage.setItem(AUTH_KEY, JSON.stringify({ uid: 'local-dev-user', email }));
    window.location.reload();
  }
  async signOut() {
    appStorage.setItem('next_local_signed_out', 'true');
    appStorage.removeItem(AUTH_KEY);
    window.location.reload();
  }
}

export class LocalDataProvider implements IDataProvider {
  async getTasks(_uid: string): Promise<Task[]> {
    const stored = appStorage.getItem(TASKS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  async addTask(_uid: string, task: Omit<Task, 'id'>): Promise<string> {
    const tasks = await this.getTasks(_uid);
    const id = Math.random().toString(36).substr(2, 9);
    const newTask = { ...task, id };
    tasks.push(newTask);
    appStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return id;
  }

  async updateTask(_uid: string, taskId: string, updates: Partial<Task>): Promise<void> {
    const tasks = await this.getTasks(_uid);
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      appStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    }
  }

  async deleteTask(_uid: string, taskId: string): Promise<void> {
    const tasks = await this.getTasks(_uid);
    const filtered = tasks.filter(t => t.id !== taskId);
    appStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
  }

  async deleteTasks(_uid: string, taskIds: string[]): Promise<void> {
    const tasks = await this.getTasks(_uid);
    const filtered = tasks.filter(t => !taskIds.includes(t.id));
    appStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
  }

  async deleteSubtree(_uid: string, taskId: string): Promise<void> {
    const tasks = await this.getTasks(_uid);
    
    const getDescendantIds = (id: string): string[] => {
      const children = tasks.filter(t => t.parentId === id);
      return children.reduce((acc, child) => {
        return [...acc, child.id, ...getDescendantIds(child.id)];
      }, [] as string[]);
    };

    const idsToDelete = [taskId, ...getDescendantIds(taskId)];
    const filtered = tasks.filter(t => !idsToDelete.includes(t.id));
    appStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
  }

  async getSettings(_uid: string): Promise<UserSettings | null> {
    const stored = appStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : { priority: DEFAULT_PRIORITY_SETTINGS, darkMode: DEFAULT_DARK_MODE, showScores: false };
  }

  async saveSettings(_uid: string, settings: UserSettings): Promise<void> {
    appStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
}
