export interface Task {
  id: string;
  parentId: string | null;
  name: string;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
  completedAt: string | null;
  importance: number;
  duration: number;
  effort: number;
  appreciation: number;
  priorityScore?: number; // Calculated field
}

export interface PrioritySettings {
  deadlineWeight: number;
  ageWeight: number;
  importanceWeight: number;
  durationWeight: number;
  effortWeight: number;
  appreciationWeight: number;
}

export interface UserSettings {
  priority: PrioritySettings;
  darkMode: boolean;
  showScores?: boolean;
  maxHomeTasks?: number;
}

export const DEFAULT_PRIORITY_SETTINGS: PrioritySettings = {
  deadlineWeight: 2,
  ageWeight: 3,
  importanceWeight: 2,
  durationWeight: 1,
  effortWeight: -1,
  appreciationWeight: 1,
};

export interface AuthState {
  user: { uid: string; email: string | null } | null;
  loading: boolean;
}
