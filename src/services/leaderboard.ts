import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  getCountFromServer,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { getDb, firebaseEnabled } from './firebase';
import { getDayId, getWeekId } from './periods';

export type Scope = 'weekly' | 'daily';

export interface LeaderEntry {
  name: string;
  score: number;
  /** Which board: 'lvl1'..'lvl5', 'daily', or 'blitz'. */
  board: string;
  /** Period bucket: a week id (weekly) or day id (daily). */
  periodId: string;
  scope: Scope;
  uid?: string;
  createdAt?: number;
}

export interface SubmitParams {
  uid?: string;
  name: string;
  score: number;
  board: string;
  scope: Scope;
}

export interface QueryParams {
  /** Omit for the "Geral" view (all weekly boards). */
  board?: string;
  scope: Scope;
}

const LOCAL_KEY = 'catmatch.leaderboard';
const COLLECTION = 'scores';

function periodFor(scope: Scope): string {
  return scope === 'daily' ? getDayId() : getWeekId();
}

/** Seeds so the weekly board isn't empty on first run (local mode only). */
function seed(): LeaderEntry[] {
  const week = getWeekId();
  const mk = (
    name: string,
    score: number,
    board: string,
  ): LeaderEntry => ({ name, score, board, periodId: week, scope: 'weekly' });
  return [
    mk('Mimi 🐱', 12800, 'lvl5'),
    mk('Felix 😼', 9400, 'lvl4'),
    mk('Luna 😻', 7200, 'lvl3'),
    mk('Tom 😺', 4100, 'lvl2'),
    mk('Bigode 😸', 2500, 'lvl1'),
    mk('Pretinha 🐈‍⬛', 6300, 'blitz'),
  ];
}

function readLocal(): LeaderEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw) as LeaderEntry[];
  } catch {
    /* ignore */
  }
  return seed();
}

function writeLocal(entries: LeaderEntry[]): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

/** Submits a score, keeping a single best document per (user, board, period). */
export async function submitScore(params: SubmitParams): Promise<void> {
  const periodId = periodFor(params.scope);
  const entry: LeaderEntry = {
    name: params.name,
    score: params.score,
    board: params.board,
    periodId,
    scope: params.scope,
    uid: params.uid,
  };

  if (firebaseEnabled && entry.uid) {
    const db = getDb();
    if (db) {
      const ref = doc(db, COLLECTION, `${entry.uid}_${entry.board}_${periodId}`);
      const snap = await getDoc(ref);
      const prev = snap.exists() ? (snap.data().score as number) : 0;
      if (entry.score > prev) {
        await setDoc(ref, { ...entry, updatedAt: serverTimestamp() });
      }
      return;
    }
  }

  // Local fallback: best per (name, board, period).
  const entries = readLocal();
  const idx = entries.findIndex(
    (e) =>
      e.name === entry.name &&
      e.board === entry.board &&
      e.periodId === periodId,
  );
  if (idx >= 0) {
    if (entry.score > entries[idx].score) entries[idx] = { ...entry };
  } else {
    entries.push({ ...entry, createdAt: Date.now() });
  }
  writeLocal(entries);
}

function dedupeByUser(entries: LeaderEntry[]): LeaderEntry[] {
  const best = new Map<string, LeaderEntry>();
  for (const e of entries) {
    const key = e.uid ?? e.name;
    const cur = best.get(key);
    if (!cur || e.score > cur.score) best.set(key, e);
  }
  return [...best.values()];
}

/** Top scores for the current period of the given board (or all weekly boards). */
export async function getTopScores(
  params: QueryParams,
  max = 25,
): Promise<LeaderEntry[]> {
  const periodId = periodFor(params.scope);

  if (firebaseEnabled) {
    const db = getDb();
    if (db) {
      const base = collection(db, COLLECTION);
      const q = params.board
        ? query(
            base,
            where('board', '==', params.board),
            where('periodId', '==', periodId),
            orderBy('score', 'desc'),
            limit(max),
          )
        : query(
            base,
            where('periodId', '==', periodId),
            where('scope', '==', 'weekly'),
            orderBy('score', 'desc'),
            limit(max * 2),
          );
      const snap = await getDocs(q);
      let rows = snap.docs.map((d) => d.data() as LeaderEntry);
      if (!params.board) rows = dedupeByUser(rows);
      return rows.sort((a, b) => b.score - a.score).slice(0, max);
    }
  }

  let entries = readLocal().filter((e) => e.periodId === periodId);
  if (params.board) entries = entries.filter((e) => e.board === params.board);
  else {
    entries = dedupeByUser(entries.filter((e) => e.scope === 'weekly'));
  }
  return entries.sort((a, b) => b.score - a.score).slice(0, max);
}

/**
 * Returns the player's 1-based rank for a board/period (1 + number of scores
 * strictly higher). Returns null when the player has no score there.
 */
export async function getPlayerRank(
  params: QueryParams,
  myScore: number,
): Promise<number | null> {
  if (myScore <= 0) return null;
  const periodId = periodFor(params.scope);

  if (firebaseEnabled) {
    const db = getDb();
    if (db && params.board) {
      try {
        const base = collection(db, COLLECTION);
        const q = query(
          base,
          where('board', '==', params.board),
          where('periodId', '==', periodId),
          where('score', '>', myScore),
        );
        const snap = await getCountFromServer(q);
        return snap.data().count + 1;
      } catch {
        return null;
      }
    }
  }

  let entries = readLocal().filter((e) => e.periodId === periodId);
  if (params.board) entries = entries.filter((e) => e.board === params.board);
  else entries = dedupeByUser(entries.filter((e) => e.scope === 'weekly'));
  const higher = entries.filter((e) => e.score > myScore).length;
  return higher + 1;
}

export function isGlobalLeaderboard(): boolean {
  return firebaseEnabled;
}
