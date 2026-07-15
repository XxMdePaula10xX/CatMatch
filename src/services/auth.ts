import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import { firebaseEnabled, getFirebaseApp } from './firebase';
import { t } from '../i18n';

export interface AppUser {
  uid: string;
  name: string;
  email: string | null;
}

/** Whether account login is available (Firebase configured). */
export const authAvailable = firebaseEnabled;

let auth: Auth | null = null;
function getAuthInstance(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (!auth) {
    try {
      // Prefer localStorage persistence: IndexedDB (the default) can hang
      // inside the iOS WKWebView, leaving auth state stuck on "loading".
      auth = initializeAuth(app, {
        persistence: [browserLocalPersistence, indexedDBLocalPersistence],
      });
    } catch {
      // Already initialised elsewhere.
      auth = getAuth(app);
    }
  }
  return auth;
}

function toAppUser(user: User | null): AppUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    name: user.displayName ?? user.email?.split('@')[0] ?? 'Jogador',
    email: user.email,
  };
}

/** Subscribes to auth state (guest/no-op when Firebase isn't configured). */
export function onAuthChange(cb: (user: AppUser | null) => void): () => void {
  const a = getAuthInstance();
  if (!a) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(a, (user) => cb(toAppUser(user)));
}

/**
 * Rejects after `ms` with a network-error code so a hung request in the iOS
 * WKWebView surfaces the friendly "sem conexão" message instead of freezing the
 * button forever.
 */
function withTimeout<T>(p: Promise<T>, ms = 12000): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject({ code: 'auth/network-request-failed' }), ms),
    ),
  ]);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<void> {
  const a = getAuthInstance();
  if (!a) throw new Error('Firebase não configurado');
  const cred = await withTimeout(
    createUserWithEmailAndPassword(a, email, password),
  );
  if (displayName) await updateProfile(cred.user, { displayName });
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<void> {
  const a = getAuthInstance();
  if (!a) throw new Error('Firebase não configurado');
  await withTimeout(signInWithEmailAndPassword(a, email, password));
}

export async function resetPassword(email: string): Promise<void> {
  const a = getAuthInstance();
  if (!a) throw new Error('Firebase não configurado');
  await withTimeout(sendPasswordResetEmail(a, email));
}

export async function signOutUser(): Promise<void> {
  const a = getAuthInstance();
  if (a) await signOut(a);
}

/** Re-verifies the current user with their password (needed before deletion). */
export async function reauthenticate(password: string): Promise<void> {
  const a = getAuthInstance();
  const user = a?.currentUser;
  if (!a || !user) throw new Error('Não conectado');
  // Never silently succeed without a real credential check.
  if (!user.email) throw new Error('Reautenticação indisponível');
  const cred = EmailAuthProvider.credential(user.email, password);
  await withTimeout(reauthenticateWithCredential(user, cred));
}

/** Permanently deletes the current Firebase Auth account. */
export async function deleteCurrentUser(): Promise<void> {
  const a = getAuthInstance();
  const user = a?.currentUser;
  if (a && user) await withTimeout(deleteUser(user));
}

/** Turns a Firebase auth error into a friendly, localized message. */
export function authErrorMessage(e: unknown): string {
  const code =
    typeof e === 'object' && e && 'code' in e
      ? String((e as { code: unknown }).code)
      : '';
  switch (code) {
    case 'auth/invalid-email':
      return t('authErr.invalidEmail');
    case 'auth/email-already-in-use':
      return t('authErr.emailInUse');
    case 'auth/weak-password':
      return t('authErr.weakPassword');
    case 'auth/missing-password':
      return t('authErr.missingPassword');
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return t('authErr.wrongPassword');
    case 'auth/user-not-found':
      return t('authErr.userNotFound');
    case 'auth/too-many-requests':
      return t('authErr.tooManyRequests');
    case 'auth/network-request-failed':
      return t('authErr.network');
    default:
      return t('authErr.generic');
  }
}
