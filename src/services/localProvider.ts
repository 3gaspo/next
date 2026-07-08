import { IAuthProvider, IDataProvider } from './interfaces';
import { Task, UserSettings, AuthState, DEFAULT_PRIORITY_SETTINGS } from '../types';

const TASKS_KEY = 'next_local_tasks';
const SETTINGS_KEY = 'next_local_settings';
const AUTH_KEY = 'next_local_auth';

export class LocalAuthProvider implements IAuthProvider {
  onAuthStateChanged(callback: (state: AuthState) => void) {
    const signedOut = localStorage.getItem('next_local_signed_out') === 'true';
    const stored = localStorage.getItem(AUTH_KEY);
    
    let user = null;
    if (!signedOut) {
      if (stored) {
        user = JSON.parse(stored);
      } else {
        user = { uid: 'local-dev-user', email: 'dev@next.app' };
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      }
    }
    
    // Simulate async
    setTimeout(() => {
      callback({ user, loading: false });
    }, 100);
    
    return () => {};
  }
  async signIn(email: string, _pass: string) {
    localStorage.removeItem('next_local_signed_out');
    localStorage.setItem(AUTH_KEY, JSON.stringify({ uid: 'local-dev-user', email }));
    window.location.reload();
  }
  async signUp(email: string, _pass: string) {
    localStorage.removeItem('next_local_signed_out');
    localStorage.setItem(AUTH_KEY, JSON.stringify({ uid: 'local-dev-user', email }));
    window.location.reload();
  }
  async signOut() {
    localStorage.setItem('next_local_signed_out', 'true');
    localStorage.removeItem(AUTH_KEY);
    window.location.reload();
  }
}

export class LocalDataProvider implements IDataProvider {
  async getTasks(_uid: string): Promise<Task[]> {
    const stored = localStorage.getItem(TASKS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  async addTask(_uid: string, task: Omit<Task, 'id'>): Promise<string> {
    const tasks = await this.getTasks(_uid);
    const id = Math.random().toString(36).substr(2, 9);
    const newTask = { ...task, id };
    tasks.push(newTask);
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return id;
  }

  async updateTask(_uid: string, taskId: string, updates: Partial<Task>): Promise<void> {
    const tasks = await this.getTasks(_uid);
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    }
  }

  async deleteTask(_uid: string, taskId: string): Promise<void> {
    const tasks = await this.getTasks(_uid);
    const filtered = tasks.filter(t => t.id !== taskId);
    localStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
  }

  async deleteTasks(_uid: string, taskIds: string[]): Promise<void> {
    const tasks = await this.getTasks(_uid);
    const filtered = tasks.filter(t => !taskIds.includes(t.id));
    localStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
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
    localStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
  }

  async getSettings(_uid: string): Promise<UserSettings | null> {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : { priority: DEFAULT_PRIORITY_SETTINGS, darkMode: false };
  }

  async saveSettings(_uid: string, settings: UserSettings): Promise<void> {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
}
