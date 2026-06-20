import {
  collection,
  doc,
  getDoc,
  setDoc,
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
  uid?: string;
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

/**
 * Submits a score. For signed-in users it keeps a single best-score document
 * per (user, level) in Firestore. Guests / unconfigured Firebase fall back to
 * the local list.
 */
export async function submitScore(entry: LeaderEntry): Promise<void> {
  if (firebaseEnabled && entry.uid) {
    const db = getDb();
    if (db) {
      const ref = doc(db, COLLECTION, `${entry.uid}_${entry.level}`);
      const snap = await getDoc(ref);
      const prev = snap.exists() ? (snap.data().score as number) : 0;
      if (entry.score > prev) {
        await setDoc(ref, {
          uid: entry.uid,
          name: entry.name,
          score: entry.score,
          level: entry.level,
          updatedAt: serverTimestamp(),
        });
      }
      return;
    }
  }

  // Local fallback (guest or no Firebase). Keep best per name+level.
  const entries = readLocal();
  const idx = entries.findIndex(
    (e) => e.name === entry.name && e.level === entry.level,
  );
  if (idx >= 0) {
    if (entry.score > entries[idx].score) entries[idx] = { ...entry };
  } else {
    entries.push({ ...entry, createdAt: Date.now() });
  }
  writeLocal(entries);
}

/** Keeps only each user's single best entry (for the "Geral" view). */
function dedupeByUser(entries: LeaderEntry[]): LeaderEntry[] {
  const best = new Map<string, LeaderEntry>();
  for (const e of entries) {
    const key = e.uid ?? e.name;
    const current = best.get(key);
    if (!current || e.score > current.score) best.set(key, e);
  }
  return [...best.values()];
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
          : query(base, orderBy('score', 'desc'), limit(max * 2));
      const snap = await getDocs(q);
      let rows = snap.docs.map((d) => d.data() as LeaderEntry);
      if (level == null) rows = dedupeByUser(rows);
      return rows.sort((a, b) => b.score - a.score).slice(0, max);
    }
  }

  let entries = readLocal();
  if (level != null) entries = entries.filter((e) => e.level === level);
  else entries = dedupeByUser(entries);
  return entries.sort((a, b) => b.score - a.score).slice(0, max);
}

/** Whether scores are shared globally (Firebase) or only stored locally. */
export function isGlobalLeaderboard(): boolean {
  return firebaseEnabled;
}
