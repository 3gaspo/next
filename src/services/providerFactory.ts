import { FirebaseAuthProvider, FirebaseDataProvider, firebaseReady } from './firebaseProvider';
import { LocalAuthProvider, LocalDataProvider } from './localProvider';
import { IAuthProvider, IDataProvider } from './interfaces';

export const authProvider: IAuthProvider = firebaseReady 
  ? new FirebaseAuthProvider() 
  : new LocalAuthProvider();

export const dataProvider: IDataProvider = firebaseReady 
  ? new FirebaseDataProvider() 
  : new LocalDataProvider();

export { firebaseReady };
