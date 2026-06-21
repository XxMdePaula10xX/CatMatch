import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  type Firestore,
} from 'firebase/firestore';

/**
 * Firebase config is read from Vite env vars (a `.env` file). If the API key is
 * missing, the leaderboard/auth transparently fall back to local/guest mode, so
 * the app works fully offline until you add your keys. See `.env.example`.
 */
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as
    | string
    | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const firebaseEnabled = Boolean(config.apiKey && config.projectId);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

/** Lazily initialises the shared Firebase app. Null when not configured. */
export function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseEnabled) return null;
  if (!app) app = initializeApp(config as Record<string, string>);
  return app;
}

/** Lazily initialises Firestore. Returns null when Firebase isn't configured. */
export function getDb(): Firestore | null {
  const a = getFirebaseApp();
  if (!a) return null;
  if (!db) {
    // Force long-polling: the default WebChannel transport hangs inside the
    // iOS WKWebView (Capacitor), so leaderboard queries never resolve.
    db = initializeFirestore(a, {
      experimentalForceLongPolling: true,
    });
  }
  return db;
}
