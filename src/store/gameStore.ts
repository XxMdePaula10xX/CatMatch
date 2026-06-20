import { create } from 'zustand';
import type {
  Board,
  BossState,
  CatType,
  FloatingScore,
  GameStatus,
  Level,
  Objective,
  Position,
  Screen,
} from '../game/types';
import { levels, getLevel } from '../data/levels';
import { createBoard } from '../game/boardGenerator';
import { cloneBoard, delay, forEachTile, inBounds } from '../game/utils';
import { findMatches } from '../game/matchDetector';
import { swapTiles, findHint } from '../game/swapLogic';
import { resolveMatchStep } from '../game/cascadeResolver';
import { applyGravity, refillBoard, clearFallFlags } from '../game/gravity';
import { activateBossCatPower } from '../game/bossCatLogic';
import { applyObstacleDamage } from '../game/obstacleLogic';
import { makeEmptyTile } from '../game/boardGenerator';
import {
  ObjectiveProgress,
  createProgress,
  objectiveCurrent,
  checkWinCondition,
  checkLoseCondition,
  computeStars,
} from '../game/objectives';
import { BOSS_ENERGY, SCORE } from '../game/scoring';
import { soundManager } from '../services/soundManager';
import type { BoosterId } from '../data/boosters';

// Animation timings (ms).
const T = {
  swap: 180,
  pop: 240,
  fall: 240,
  boss: 600,
};

const BOOSTER_START = 3;

interface GameState {
  screen: Screen;
  level: Level | null;
  board: Board;
  movesLeft: number;
  totalMoves: number;
  score: number;
  progress: ObjectiveProgress;
  objectives: Objective[]; // with `current` filled in
  status: GameStatus;
  isResolving: boolean;

  bossActive: boolean;
  bossEnergy: number;
  bossState: BossState;

  selected: Position | null;
  hintCells: Position[] | null;
  floatingScores: FloatingScore[];
  comboLevel: number;

  activeBooster: BoosterId | null;
  boosterUses: Record<string, number>;

  unlockedLevel: number;
  starsByLevel: Record<number, number>;
  soundEnabled: boolean;

  // ----- actions -----
  goHome: () => void;
  goLevelSelect: () => void;
  startLevel: (id: number) => void;
  restartLevel: () => void;
  nextLevel: () => void;
  onTileClick: (pos: Position) => void;
  selectBooster: (id: BoosterId) => void;
  toggleSound: () => void;
}

let floatId = 0;

function recomputeObjectives(
  level: Level,
  progress: ObjectiveProgress,
): Objective[] {
  return level.objectives.map((o) => ({
    ...o,
    current: objectiveCurrent(o, progress),
  }));
}

const STORAGE_KEY = 'catmatch.progress';

function loadProgress(): { unlockedLevel: number; stars: Record<number, number> } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { unlockedLevel: 1, stars: {} };
}

function saveProgress(unlockedLevel: number, stars: Record<number, number>) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ unlockedLevel, stars }),
    );
  } catch {
    /* ignore */
  }
}

const persisted = loadProgress();

export const useGameStore = create<GameState>((set, get) => {
  /** Commit the working board to React state (fresh references) and wait. */
  async function commit(board: Board, ms: number): Promise<void> {
    set({ board: cloneBoard(board) });
    if (ms > 0) await delay(ms);
  }

  function addFloating(value: number, at: Position | undefined) {
    if (!at || value <= 0) return;
    floatId += 1;
    const fs: FloatingScore = {
      id: `f${floatId}`,
      row: at.row,
      col: at.col,
      value,
    };
    set((s) => ({ floatingScores: [...s.floatingScores, fs] }));
    setTimeout(() => {
      set((s) => ({
        floatingScores: s.floatingScores.filter((f) => f.id !== fs.id),
      }));
    }, 900);
  }

  function mergeCollected(
    progress: ObjectiveProgress,
    collected: Partial<Record<CatType, number>>,
  ) {
    for (const [cat, n] of Object.entries(collected)) {
      const key = cat as CatType;
      progress.catsCollected[key] =
        (progress.catsCollected[key] ?? 0) + (n ?? 0);
    }
  }

  /** Animated Boss Cat power. Mutates board + progress, returns nothing. */
  async function runBossPower(board: Board, progress: ObjectiveProgress) {
    set({ bossState: 'waking' });
    soundManager.play('boss');
    await delay(T.boss);

    // Flag the soon-to-clear tiles for a highlight before clearing.
    const cat = (() => {
      const counts = new Map<CatType, number>();
      forEachTile(board, (t) => {
        if (t.type === 'cat' && t.catType)
          counts.set(t.catType, (counts.get(t.catType) ?? 0) + 1);
      });
      let best: CatType | null = null;
      let bestN = 0;
      for (const [c, n] of counts)
        if (n > bestN) {
          best = c;
          bestN = n;
        }
      return best;
    })();
    forEachTile(board, (t) => {
      if (t.type === 'cat' && t.catType === cat) t.isMatched = true;
    });
    set({ bossState: 'power' });
    await commit(board, T.pop);

    const res = activateBossCatPower(board);
    progress.score += SCORE.bossPower;
    progress.boxesBroken += res.boxesBroken;
    progress.bossCharged += 1;
    set({ score: progress.score });
    await commit(board, T.pop);

    applyGravity(board);
    await commit(board, T.fall);
    const level = get().level!;
    refillBoard(board, level.boardConfig.availableCats);
    await commit(board, T.fall);
    clearFallFlags(board);

    set({ bossState: 'backToSleep' });
    await delay(200);
    set({ bossState: 'sleeping' });
  }

  /** Resolves cascades until the board is stable. Drives all animation. */
  async function resolveCascades(board: Board) {
    const state = get();
    const level = state.level!;
    const progress = state.progress;
    let cascadeLevel = 0;
    let bossEnergy = state.bossEnergy;
    let guard = 0;

    while (guard < 60) {
      guard += 1;
      const matches = findMatches(board);
      if (matches.matchedPositions.length === 0) break;

      cascadeLevel += 1;
      set({ comboLevel: cascadeLevel });
      soundManager.play(cascadeLevel > 1 ? 'combo' : 'match');

      // Pop animation for the basic matched cells.
      for (const p of matches.matchedPositions) board[p.row][p.col].isMatched = true;
      await commit(board, T.pop);

      const step = resolveMatchStep(board, cascadeLevel);
      if (step.yarnsActivated > 0) soundManager.play('yarn');

      // Accumulate progress.
      progress.score += step.scoreGained;
      progress.boxesBroken += step.boxesBroken;
      progress.yarnsActivated += step.yarnsActivated;
      mergeCollected(progress, step.catsCollected);
      bossEnergy += step.bossEnergyGained;

      addFloating(step.scoreGained, matches.matchedPositions[0]);
      set({
        score: progress.score,
        objectives: recomputeObjectives(level, progress),
      });
      if (state.bossActive) {
        set({ bossEnergy: Math.min(bossEnergy, BOSS_ENERGY.full) });
      }
      if (step.hint) {
        const hint = findHint(board);
        if (hint) {
          set({ hintCells: hint });
          setTimeout(() => set({ hintCells: null }), 1400);
        }
      }
      await commit(board, T.pop);

      // Gravity + refill.
      applyGravity(board);
      await commit(board, T.fall);
      refillBoard(board, level.boardConfig.availableCats);
      await commit(board, T.fall);
      clearFallFlags(board);

      // Boss Cat fires when full.
      if (state.bossActive && bossEnergy >= BOSS_ENERGY.full) {
        bossEnergy -= BOSS_ENERGY.full;
        set({ bossEnergy: Math.max(0, bossEnergy) });
        await runBossPower(board, progress);
        set({ objectives: recomputeObjectives(level, progress) });
      }
    }

    set({ comboLevel: 0 });
    if (state.bossActive) set({ bossEnergy: Math.max(0, bossEnergy) });
  }

  /** Reshuffles cat types if the board has no available moves. */
  function ensureSolvable(board: Board, cats: CatType[]) {
    let guard = 0;
    while (!findHint(board) && guard < 30) {
      const catTiles = board.flat().filter((t) => t.type === 'cat');
      for (const t of catTiles) {
        t.catType = cats[Math.floor(Math.random() * cats.length)];
      }
      // Avoid starting matches after the shuffle.
      if (findMatches(board).matchedPositions.length === 0) {
        if (findHint(board)) break;
      }
      guard += 1;
    }
  }

  function finishMove(board: Board) {
    const state = get();
    const level = state.level!;
    const progress = state.progress;
    const objectives = recomputeObjectives(level, progress);
    const won = checkWinCondition(level.objectives, progress);

    let movesLeft = state.movesLeft;
    const lost = !won && checkLoseCondition(movesLeft, won);

    if (won) {
      const stars = computeStars(movesLeft, state.totalMoves);
      const bestStars = Math.max(state.starsByLevel[level.id] ?? 0, stars);
      const newStars = { ...state.starsByLevel, [level.id]: bestStars };
      const unlocked = Math.max(state.unlockedLevel, level.id + 1);
      saveProgress(unlocked, newStars);
      soundManager.play('victory');
      set({
        status: 'won',
        objectives,
        starsByLevel: newStars,
        unlockedLevel: unlocked,
        isResolving: false,
      });
      return;
    }

    if (lost) {
      soundManager.play('defeat');
      set({ status: 'lost', objectives, isResolving: false });
      return;
    }

    ensureSolvable(board, level.boardConfig.availableCats);
    set({
      board: cloneBoard(board),
      objectives,
      isResolving: false,
    });
  }

  async function attemptSwap(a: Position, b: Position) {
    const board = cloneBoard(get().board);
    set({ isResolving: true, selected: null, hintCells: null });
    soundManager.play('swap');

    swapTiles(board, a, b);
    await commit(board, T.swap);

    const valid = findMatches(board, [a, b]).matchedPositions.length > 0;
    if (!valid) {
      swapTiles(board, a, b); // revert
      await commit(board, T.swap);
      set({ isResolving: false });
      return;
    }

    set({ movesLeft: get().movesLeft - 1 });
    await resolveCascades(board);
    finishMove(board);
  }

  async function applyBooster(id: BoosterId, pos: Position) {
    const state = get();
    if ((state.boosterUses[id] ?? 0) <= 0) {
      set({ activeBooster: null });
      return;
    }
    const board = cloneBoard(state.board);
    set({
      isResolving: true,
      activeBooster: null,
      selected: null,
      hintCells: null,
      boosterUses: { ...state.boosterUses, [id]: state.boosterUses[id] - 1 },
    });
    soundManager.play('combo');

    const targets: Position[] = [];
    if (id === 'pawBomb') {
      for (let r = pos.row - 1; r <= pos.row + 1; r++)
        for (let c = pos.col - 1; c <= pos.col + 1; c++)
          if (inBounds(board, r, c)) targets.push({ row: r, col: c });
    } else if (id === 'laser') {
      const cols = board[0].length;
      for (let c = 0; c < cols; c++) targets.push({ row: pos.row, col: c });
    }

    // Damage obstacles, then clear cats/specials.
    applyObstacleDamage(board, targets);
    for (const p of targets) {
      const t = board[p.row][p.col];
      if (t.type === 'cat' || t.type === 'specialCat') {
        t.isMatched = true;
      }
    }
    await commit(board, T.pop);
    for (const p of targets) {
      const t = board[p.row][p.col];
      if (t.type === 'cat' || t.type === 'specialCat') {
        board[p.row][p.col] = makeEmptyTile(p.row, p.col);
      }
    }
    const level = get().level!;
    const progress = get().progress;
    progress.score += targets.length * 20;
    set({ score: progress.score });
    await commit(board, T.pop);

    applyGravity(board);
    await commit(board, T.fall);
    refillBoard(board, level.boardConfig.availableCats);
    await commit(board, T.fall);
    clearFallFlags(board);

    await resolveCascades(board);
    finishMove(board);
  }

  return {
    screen: 'home',
    level: null,
    board: [],
    movesLeft: 0,
    totalMoves: 0,
    score: 0,
    progress: createProgress(),
    objectives: [],
    status: 'playing',
    isResolving: false,

    bossActive: false,
    bossEnergy: 0,
    bossState: 'sleeping',

    selected: null,
    hintCells: null,
    floatingScores: [],
    comboLevel: 0,

    activeBooster: null,
    boosterUses: {},

    unlockedLevel: persisted.unlockedLevel,
    starsByLevel: persisted.stars,
    soundEnabled: true,

    goHome: () => {
      soundManager.play('button');
      set({ screen: 'home' });
    },
    goLevelSelect: () => {
      soundManager.play('button');
      set({ screen: 'levelSelect' });
    },

    startLevel: (id: number) => {
      const level = getLevel(id);
      if (!level) return;
      soundManager.play('button');
      const board = createBoard(level.boardConfig);
      const progress = createProgress();
      set({
        screen: 'game',
        level,
        board,
        movesLeft: level.moves,
        totalMoves: level.moves,
        score: 0,
        progress,
        objectives: recomputeObjectives(level, progress),
        status: 'playing',
        isResolving: false,
        bossActive: !!level.boardConfig.bossCat,
        bossEnergy: 0,
        bossState: 'sleeping',
        selected: null,
        hintCells: null,
        floatingScores: [],
        comboLevel: 0,
        activeBooster: null,
        boosterUses: { pawBomb: BOOSTER_START, laser: BOOSTER_START },
      });
    },

    restartLevel: () => {
      const id = get().level?.id;
      if (id) get().startLevel(id);
    },

    nextLevel: () => {
      const id = get().level?.id ?? 0;
      const next = getLevel(id + 1);
      if (next) get().startLevel(next.id);
      else get().goLevelSelect();
    },

    onTileClick: (pos: Position) => {
      const state = get();
      if (state.isResolving || state.status !== 'playing') return;

      if (state.activeBooster) {
        void applyBooster(state.activeBooster, pos);
        return;
      }

      const tile = state.board[pos.row]?.[pos.col];
      if (!tile) return;
      const movable = tile.type === 'cat' || tile.type === 'specialCat';

      if (!state.selected) {
        if (movable) set({ selected: pos });
        return;
      }

      const sel = state.selected;
      if (sel.row === pos.row && sel.col === pos.col) {
        set({ selected: null });
        return;
      }

      const adjacent =
        Math.abs(sel.row - pos.row) + Math.abs(sel.col - pos.col) === 1;
      if (adjacent && movable) {
        void attemptSwap(sel, pos);
      } else {
        set({ selected: movable ? pos : null });
      }
    },

    selectBooster: (id: BoosterId) => {
      const state = get();
      if (state.isResolving || state.status !== 'playing') return;
      if ((state.boosterUses[id] ?? 0) <= 0) return;
      soundManager.play('button');
      set({ activeBooster: state.activeBooster === id ? null : id, selected: null });
    },

    toggleSound: () => {
      const enabled = soundManager.toggle();
      set({ soundEnabled: enabled });
    },
  };
});

export { levels };
