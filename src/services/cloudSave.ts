import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { getDb, firebaseEnabled } from './firebase';
import { createStats, type Stats } from '../data/achievements';

const COLLECTION = 'saves';

export interface CloudData {
  unlockedLevel: number;
  stars: Record<number, number>;
  highScores: Record<number, number>;
  stats: Stats;
  achievements: string[];
}

/** Loads a user's cloud save, or null when not available / not found. */
export async function loadCloudSave(uid: string): Promise<CloudData | null> {
  if (!firebaseEnabled) return null;
  const db = getDb();
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, COLLECTION, uid));
    return snap.exists() ? (snap.data() as CloudData) : null;
  } catch {
    return null;
  }
}

/** Writes the user's cloud save (best-effort, never throws). */
export async function saveCloudSave(
  uid: string,
  data: CloudData,
): Promise<void> {
  if (!firebaseEnabled) return;
  const db = getDb();
  if (!db) return;
  try {
    await setDoc(doc(db, COLLECTION, uid), data, { merge: true });
  } catch {
    /* offline / rules — ignore */
  }
}

/** Deletes the user's cloud save (for account deletion). */
export async function deleteCloudSave(uid: string): Promise<void> {
  if (!firebaseEnabled) return;
  const db = getDb();
  if (!db) return;
  try {
    await deleteDoc(doc(db, COLLECTION, uid));
  } catch {
    /* ignore */
  }
}

/** Merges local and cloud data, keeping the best of each. */
export function mergeCloud(local: CloudData, cloud: CloudData): CloudData {
  const stars: Record<number, number> = { ...local.stars };
  for (const [k, v] of Object.entries(cloud.stars ?? {})) {
    const key = Number(k);
    stars[key] = Math.max(stars[key] ?? 0, v);
  }
  const highScores: Record<number, number> = { ...local.highScores };
  for (const [k, v] of Object.entries(cloud.highScores ?? {})) {
    const key = Number(k);
    highScores[key] = Math.max(highScores[key] ?? 0, v);
  }
  // Iterate the full stats schema (not just one side's keys) so a field
  // present on only one side is never dropped.
  const stats = createStats();
  for (const k of Object.keys(stats) as (keyof Stats)[]) {
    stats[k] = Math.max(local.stats?.[k] ?? 0, cloud.stats?.[k] ?? 0);
  }
  const achievements = Array.from(
    new Set([...(local.achievements ?? []), ...(cloud.achievements ?? [])]),
  );
  return {
    unlockedLevel: Math.max(local.unlockedLevel, cloud.unlockedLevel ?? 1),
    stars,
    highScores,
    stats,
    achievements,
  };
}
