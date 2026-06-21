import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import { firebaseEnabled, getFirebaseApp } from './firebase';

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

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<void> {
  const a = getAuthInstance();
  if (!a) throw new Error('Firebase não configurado');
  const cred = await createUserWithEmailAndPassword(a, email, password);
  if (displayName) await updateProfile(cred.user, { displayName });
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<void> {
  const a = getAuthInstance();
  if (!a) throw new Error('Firebase não configurado');
  await signInWithEmailAndPassword(a, email, password);
}

export async function resetPassword(email: string): Promise<void> {
  const a = getAuthInstance();
  if (!a) throw new Error('Firebase não configurado');
  await sendPasswordResetEmail(a, email);
}

export async function signOutUser(): Promise<void> {
  const a = getAuthInstance();
  if (a) await signOut(a);
}

/** Turns a Firebase auth error into a friendly Portuguese message. */
export function authErrorMessage(e: unknown): string {
  const code =
    typeof e === 'object' && e && 'code' in e
      ? String((e as { code: unknown }).code)
      : '';
  switch (code) {
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está em uso.';
    case 'auth/weak-password':
      return 'A senha precisa de pelo menos 6 caracteres.';
    case 'auth/missing-password':
      return 'Digite uma senha.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/user-not-found':
      return 'Conta não encontrada.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.';
    case 'auth/network-request-failed':
      return 'Sem conexão. Verifique sua internet.';
    default:
      return 'Não foi possível concluir. Tente novamente.';
  }
}
