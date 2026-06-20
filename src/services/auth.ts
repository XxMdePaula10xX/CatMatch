import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import { firebaseEnabled, getFirebaseApp } from './firebase';

export interface AppUser {
  uid: string;
  name: string;
  photoURL: string | null;
}

/** Whether real account login is available (Firebase configured). */
export const authAvailable = firebaseEnabled;

let auth: Auth | null = null;
function getAuthInstance(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (!auth) auth = getAuth(app);
  return auth;
}

function toAppUser(user: User | null): AppUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    name: user.displayName ?? user.email?.split('@')[0] ?? 'Jogador',
    photoURL: user.photoURL,
  };
}

/**
 * Subscribes to auth state. When Firebase isn't configured, immediately reports
 * "no user" (guest mode) and returns a no-op unsubscribe.
 */
export function onAuthChange(cb: (user: AppUser | null) => void): () => void {
  const a = getAuthInstance();
  if (!a) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(a, (user) => cb(toAppUser(user)));
}

export async function signInWithGoogle(): Promise<void> {
  const a = getAuthInstance();
  if (!a) throw new Error('Firebase não configurado');
  await signInWithPopup(a, new GoogleAuthProvider());
}

export async function signInWithApple(): Promise<void> {
  const a = getAuthInstance();
  if (!a) throw new Error('Firebase não configurado');
  const provider = new OAuthProvider('apple.com');
  provider.addScope('name');
  provider.addScope('email');
  await signInWithPopup(a, provider);
}

export async function signOutUser(): Promise<void> {
  const a = getAuthInstance();
  if (a) await signOut(a);
}
