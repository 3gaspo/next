import { Task, UserSettings, AuthState } from '../types';

export interface IAuthProvider {
  onAuthStateChanged: (callback: (state: AuthState) => void) => () => void;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface IDataProvider {
  getTasks: (uid: string) => Promise<Task[]>;
  addTask: (uid: string, task: Omit<Task, 'id'>) => Promise<string>;
  updateTask: (uid: string, taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (uid: string, taskId: string) => Promise<void>;
  deleteTasks: (uid: string, taskIds: string[]) => Promise<void>;
  deleteSubtree: (uid: string, taskId: string) => Promise<void>;
  
  getSettings: (uid: string) => Promise<UserSettings | null>;
  saveSettings: (uid: string, settings: UserSettings) => Promise<void>;
}
