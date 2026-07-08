import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  setDoc,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { IAuthProvider, IDataProvider } from './interfaces';
import { Task, UserSettings, AuthState } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseReady = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId
);

let app: any;
let auth: any;
let db: any;

if (firebaseReady) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

export class FirebaseAuthProvider implements IAuthProvider {
  onAuthStateChanged(callback: (state: AuthState) => void) {
    if (!firebaseReady) return () => {};
    return onAuthStateChanged(auth, (user) => {
      callback({
        user: user ? { uid: user.uid, email: user.email } : null,
        loading: false,
      });
    });
  }
  async signIn(email: string, pass: string) {
    await signInWithEmailAndPassword(auth, email, pass);
  }
  async signUp(email: string, pass: string) {
    await createUserWithEmailAndPassword(auth, email, pass);
  }
  async signOut() {
    await signOut(auth);
  }
}

export class FirebaseDataProvider implements IDataProvider {
  private getUserRef(uid: string) {
    return doc(db, 'users', uid);
  }

  async getTasks(uid: string): Promise<Task[]> {
    const tasksCol = collection(db, 'users', uid, 'tasks');
    const snapshot = await getDocs(tasksCol);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Task));
  }

  async addTask(uid: string, task: Omit<Task, 'id'>): Promise<string> {
    const tasksCol = collection(db, 'users', uid, 'tasks');
    const docRef = await addDoc(tasksCol, task);
    return docRef.id;
  }

  async updateTask(uid: string, taskId: string, updates: Partial<Task>): Promise<void> {
    const docRef = doc(db, 'users', uid, 'tasks', taskId);
    await updateDoc(docRef, updates);
  }

  async deleteTask(uid: string, taskId: string): Promise<void> {
    const docRef = doc(db, 'users', uid, 'tasks', taskId);
    await deleteDoc(docRef);
  }

  async deleteTasks(uid: string, taskIds: string[]): Promise<void> {
    if (taskIds.length === 0) return;
    const batch = writeBatch(db);
    taskIds.forEach(id => {
      batch.delete(doc(db, 'users', uid, 'tasks', id));
    });
    await batch.commit();
  }

  async deleteSubtree(uid: string, taskId: string): Promise<void> {
    const batch = writeBatch(db);
    const tasks = await this.getTasks(uid);
    
    const getDescendantIds = (id: string): string[] => {
      const children = tasks.filter(t => t.parentId === id);
      return children.reduce((acc, child) => {
        return [...acc, child.id, ...getDescendantIds(child.id)];
      }, [] as string[]);
    };

    const idsToDelete = [taskId, ...getDescendantIds(taskId)];
    idsToDelete.forEach(id => {
      batch.delete(doc(db, 'users', uid, 'tasks', id));
    });
    
    await batch.commit();
  }

  async getSettings(uid: string): Promise<UserSettings | null> {
    const docRef = doc(db, 'users', uid, 'settings', 'main');
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? snapshot.data() as UserSettings : null;
  }

  async saveSettings(uid: string, settings: UserSettings): Promise<void> {
    const docRef = doc(db, 'users', uid, 'settings', 'main');
    await setDoc(docRef, settings);
  }
}
