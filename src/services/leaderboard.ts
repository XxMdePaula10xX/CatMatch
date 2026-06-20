import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { getDb, firebaseEnabled } from './firebase';

export interface LeaderEntry {
  name: string;
  score: number;
  level: number;
  createdAt?: number;
}

const LOCAL_KEY = 'catmatch.leaderboard';
const COLLECTION = 'scores';

/** A few seeded entries so the local leaderboard isn't empty on first run. */
const SEED: LeaderEntry[] = [
  { name: 'Mimi 🐱', score: 9800, level: 5, createdAt: 0 },
  { name: 'Felix 😼', score: 7400, level: 4, createdAt: 0 },
  { name: 'Luna 😻', score: 5200, level: 3, createdAt: 0 },
  { name: 'Tom 😺', score: 3100, level: 2, createdAt: 0 },
  { name: 'Bigode 😸', score: 1500, level: 1, createdAt: 0 },
];

function readLocal(): LeaderEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw) as LeaderEntry[];
  } catch {
    /* ignore */
  }
  return [...SEED];
}

function writeLocal(entries: LeaderEntry[]): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

/** Submits a score to the global leaderboard (or the local fallback). */
export async function submitScore(entry: LeaderEntry): Promise<void> {
  if (firebaseEnabled) {
    const db = getDb();
    if (db) {
      await addDoc(collection(db, COLLECTION), {
        name: entry.name,
        score: entry.score,
        level: entry.level,
        createdAt: serverTimestamp(),
      });
      return;
    }
  }
  const entries = readLocal();
  entries.push({ ...entry, createdAt: Date.now() });
  writeLocal(entries);
}

/**
 * Returns the top scores, optionally filtered to a single level.
 * Uses Firestore when configured, otherwise the local fallback.
 */
export async function getTopScores(
  level?: number,
  max = 25,
): Promise<LeaderEntry[]> {
  if (firebaseEnabled) {
    const db = getDb();
    if (db) {
      const base = collection(db, COLLECTION);
      const q =
        level != null
          ? query(
              base,
              where('level', '==', level),
              orderBy('score', 'desc'),
              limit(max),
            )
          : query(base, orderBy('score', 'desc'), limit(max));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as LeaderEntry);
    }
  }

  let entries = readLocal();
  if (level != null) entries = entries.filter((e) => e.level === level);
  return entries.sort((a, b) => b.score - a.score).slice(0, max);
}

/** Whether scores are shared globally (Firebase) or only stored locally. */
export function isGlobalLeaderboard(): boolean {
  return firebaseEnabled;
}
