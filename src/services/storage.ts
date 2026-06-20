import type { Board } from '../game/types';
import type { ObjectiveProgress } from '../game/objectives';

/** A full in-progress game snapshot, so a level can be resumed after leaving. */
export interface SavedGame {
  levelId: number;
  board: Board;
  movesLeft: number;
  totalMoves: number;
  score: number;
  progress: ObjectiveProgress;
  elapsedMs: number;
  bossActive: boolean;
  bossEnergy: number;
  boosterUses: Record<string, number>;
}

export interface MetaProgress {
  unlockedLevel: number;
  stars: Record<number, number>;
}

const KEYS = {
  meta: 'catmatch.progress',
  highScores: 'catmatch.highscores',
  savedGame: 'catmatch.savedgame',
  nickname: 'catmatch.nickname',
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage might be unavailable (private mode); ignore */
  }
}

function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

// ---- Meta progress (unlocked levels + stars) ----
export function loadMeta(): MetaProgress {
  return read<MetaProgress>(KEYS.meta, { unlockedLevel: 1, stars: {} });
}
export function saveMeta(meta: MetaProgress): void {
  write(KEYS.meta, meta);
}

// ---- High scores (best per level) ----
export function loadHighScores(): Record<number, number> {
  return read<Record<number, number>>(KEYS.highScores, {});
}
export function saveHighScore(level: number, score: number): Record<number, number> {
  const scores = loadHighScores();
  if (score > (scores[level] ?? 0)) {
    scores[level] = score;
    write(KEYS.highScores, scores);
  }
  return scores;
}

// ---- Saved (resumable) game ----
export function loadSavedGame(): SavedGame | null {
  return read<SavedGame | null>(KEYS.savedGame, null);
}
export function saveSavedGame(game: SavedGame): void {
  write(KEYS.savedGame, game);
}
export function clearSavedGame(): void {
  remove(KEYS.savedGame);
}

// ---- Player nickname (for the leaderboard) ----
export function loadNickname(): string {
  return read<string>(KEYS.nickname, '');
}
export function saveNickname(name: string): void {
  write(KEYS.nickname, name);
}
