import { create } from 'zustand';
import type {
  Board,
  BossState,
  CatType,
  FloatingScore,
  GameMode,
  GameStatus,
  Level,
  Objective,
  Position,
  Screen,
} from '../game/types';
import {
  levels,
  getLevel,
  makeDailyLevel,
  makeAdventureFloor,
  BLITZ_LEVEL,
  BLITZ_DURATION_MS,
  ADVENTURE_LEVEL_ID,
} from '../data/levels';
import {
  aggregateRelics,
  offerRelics,
  emptyEffects,
  type RelicEffects,
} from '../data/relics';
import { createBoard, makeEmptyTile, type Rng } from '../game/boardGenerator';
import { cloneBoard, delay, forEachTile, inBounds } from '../game/utils';
import { mulberry32, hashString } from '../game/random';
import { findMatches } from '../game/matchDetector';
import { swapTiles, findHint } from '../game/swapLogic';
import { resolveMatchStep } from '../game/cascadeResolver';
import { applyGravity, refillBoard, clearFallFlags } from '../game/gravity';
import { activateBossCatPower } from '../game/bossCatLogic';
import { applyObstacleDamage } from '../game/obstacleLogic';
import {
  ObjectiveProgress,
  createProgress,
  objectiveCurrent,
  checkWinCondition,
  checkLoseCondition,
  computeStars,
} from '../game/objectives';
import { BOSS_ENERGY, SCORE, timeMultiplier } from '../game/scoring';
import { soundManager } from '../services/soundManager';
import { SPECIAL_CATS } from '../data/cats';
import type { BoosterId } from '../data/boosters';
import * as storage from '../services/storage';
import { submitScore, renameUserScores } from '../services/leaderboard';
import {
  onAuthChange,
  signUpWithEmail,
  signInWithEmail,
  signOutUser,
  resetPassword as resetPasswordEmail,
  authErrorMessage,
  authAvailable,
  type AppUser,
} from '../services/auth';
import {
  loadCloudSave,
  saveCloudSave,
  mergeCloud,
  type CloudData,
} from '../services/cloudSave';
import {
  type Stats,
  unlockedIds,
  ACHIEVEMENTS,
} from '../data/achievements';
import { getDayId } from '../services/periods';

const T = { swap: 180, pop: 240, fall: 240, boss: 600 };
const BOOSTER_START = 3;

export interface Toast {
  id: string;
  text: string;
}
export interface Particle {
  id: string;
  row: number;
  col: number;
}

interface BeginOpts {
  mode?: GameMode;
  saved?: storage.SavedGame;
  rng?: Rng;
}

interface GameState {
  screen: Screen;
  mode: GameMode;
  level: Level | null;
  board: Board;
  movesLeft: number;
  totalMoves: number;
  score: number;
  progress: ObjectiveProgress;
  objectives: Objective[];
  status: GameStatus;
  isResolving: boolean;
  elapsedMs: number;

  bossActive: boolean;
  bossEnergy: number;
  bossState: BossState;

  selected: Position | null;
  hintCells: Position[] | null;
  floatingScores: FloatingScore[];
  toasts: Toast[];
  particles: Particle[];
  shakeLevel: number;
  comboLevel: number;

  activeBooster: BoosterId | null;
  boosterUses: Record<string, number>;

  unlockedLevel: number;
  starsByLevel: Record<number, number>;
  highScores: Record<number, number>;
  lastHighScore: number;
  lastTimeMultiplier: number;
  lastIsRecord: boolean;
  savedGameExists: boolean;
  nickname: string;
  soundEnabled: boolean;

  user: AppUser | null;
  authReady: boolean;
  authAvailable: boolean;

  stats: Stats;
  achievements: string[];

  // adventure (roguelite) run state
  advDepth: number;
  advRelics: string[];
  advTotalScore: number;
  relicMods: RelicEffects;
  relicChoices: string[];
  advFreeLeft: number;

  // tutorial
  tutorialSeen: boolean;
  showTutorial: boolean;

  // ----- actions -----
  goHome: () => void;
  goLevelSelect: () => void;
  goLeaderboard: () => void;
  goAchievements: () => void;
  goAuth: () => void;
  goProfile: () => void;
  startLevel: (id: number) => void;
  startDaily: () => void;
  startBlitz: () => void;
  startAdventure: () => void;
  chooseRelic: (id: string) => void;
  restartLevel: () => void;
  nextLevel: () => void;
  resumeGame: () => void;
  openTutorial: () => void;
  closeTutorial: () => void;
  onTileClick: (pos: Position) => void;
  onTileDrag: (from: Position, to: Position) => void;
  selectBooster: (id: BoosterId) => void;
  toggleSound: () => void;
  setNickname: (name: string) => void;
  tick: () => void;
  signInEmail: (email: string, password: string) => Promise<string | null>;
  signUpEmail: (
    email: string,
    password: string,
    nickname: string,
  ) => Promise<string | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<string | null>;
}

let floatId = 0;
let toastId = 0;
let particleId = 0;
/** Wall-clock timestamp of the last timer tick (for drift-free elapsed time). */
let lastTickTs = Date.now();

function recomputeObjectives(
  level: Level,
  progress: ObjectiveProgress,
): Objective[] {
  return level.objectives.map((o) => ({
    ...o,
    current: objectiveCurrent(o, progress),
  }));
}

const meta = storage.loadMeta();

export const useGameStore = create<GameState>((set, get) => {
  async function commit(board: Board, ms: number): Promise<void> {
    set({ board: cloneBoard(board) });
    if (ms > 0) await delay(ms);
  }

  function addFloating(value: number, at: Position | undefined) {
    if (!at || value <= 0) return;
    floatId += 1;
    const fs: FloatingScore = { id: `f${floatId}`, row: at.row, col: at.col, value };
    set((s) => ({ floatingScores: [...s.floatingScores, fs] }));
    setTimeout(
      () =>
        set((s) => ({
          floatingScores: s.floatingScores.filter((f) => f.id !== fs.id),
        })),
      900,
    );
  }

  function addToast(text: string) {
    toastId += 1;
    const t: Toast = { id: `to${toastId}`, text };
    set((s) => ({ toasts: [...s.toasts, t] }));
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== t.id) })),
      1700,
    );
  }

  function addParticles(cells: Position[]) {
    const items = cells.slice(0, 5).map((c) => {
      particleId += 1;
      return { id: `p${particleId}`, row: c.row, col: c.col };
    });
    if (items.length === 0) return;
    set((s) => ({ particles: [...s.particles, ...items] }));
    setTimeout(
      () =>
        set((s) => ({
          particles: s.particles.filter(
            (p) => !items.some((i) => i.id === p.id),
          ),
        })),
      600,
    );
  }

  function triggerShake(level: number) {
    set({ shakeLevel: level });
    setTimeout(() => set({ shakeLevel: 0 }), 450);
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

  // ---- stats + achievements ----
  function checkAchievements(stats: Stats) {
    const current = new Set(get().achievements);
    const all = unlockedIds(stats);
    const newly = all.filter((id) => !current.has(id));
    if (newly.length) {
      const updated = [...current, ...newly];
      storage.saveAchievements(updated);
      set({ achievements: updated });
      for (const id of newly) {
        const def = ACHIEVEMENTS.find((a) => a.id === id);
        if (def) addToast(`🏅 Conquista: ${def.name}`);
      }
    }
  }

  function updateStats(mut: (s: Stats) => void) {
    const stats = { ...get().stats };
    mut(stats);
    storage.saveStats(stats);
    set({ stats });
    checkAchievements(stats);
  }

  function cloudPush() {
    const s = get();
    if (!s.user) return;
    const data: CloudData = {
      unlockedLevel: s.unlockedLevel,
      stars: s.starsByLevel,
      highScores: s.highScores,
      stats: s.stats,
      achievements: s.achievements,
    };
    void saveCloudSave(s.user.uid, data);
  }

  function snapshot(board: Board): storage.SavedGame {
    const s = get();
    return {
      levelId: s.level!.id,
      board: cloneBoard(board),
      movesLeft: s.movesLeft,
      totalMoves: s.totalMoves,
      score: s.progress.score,
      progress: s.progress,
      elapsedMs: s.elapsedMs,
      bossActive: s.bossActive,
      bossEnergy: s.bossEnergy,
      boosterUses: s.boosterUses,
    };
  }

  async function runBossPower(board: Board, progress: ObjectiveProgress) {
    set({ bossState: 'waking' });
    soundManager.play('boss');
    addToast('👑 Gato Chefe: Espreguiçada Real!');
    triggerShake(4);
    await delay(T.boss);

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
    updateStats((st) => {
      st.bossCharges += 1;
      st.boxesBroken += res.boxesBroken;
    });
    set({ score: progress.score });
    await commit(board, T.pop);

    applyGravity(board);
    await commit(board, T.fall);
    refillBoard(board, get().level!.boardConfig.availableCats);
    await commit(board, T.fall);
    clearFallFlags(board);

    set({ bossState: 'backToSleep' });
    await delay(200);
    set({ bossState: 'sleeping' });
  }

  async function resolveCascades(board: Board) {
    const state = get();
    const level = state.level!;
    const progress = state.progress;
    const mods =
      state.mode === 'adventure'
        ? {
            scoreMult: state.relicMods.scoreMult,
            catBonus: state.relicMods.catBonus,
            comboTierBonus: state.relicMods.comboTierBonus,
          }
        : undefined;
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
      addParticles(matches.matchedPositions);
      if (cascadeLevel >= 3) triggerShake(cascadeLevel);

      for (const p of matches.matchedPositions) board[p.row][p.col].isMatched = true;
      await commit(board, T.pop);

      const step = resolveMatchStep(board, cascadeLevel, mods);
      if (step.yarnsActivated > 0) {
        soundManager.play('yarn');
        addToast('🧶 Novelo rolando!');
      }
      for (const c of step.creations) {
        const def = SPECIAL_CATS[c.special];
        addToast(`${def.emoji} ${def.name}: ${def.description}`);
      }

      progress.score += step.scoreGained;
      progress.boxesBroken += step.boxesBroken;
      progress.yarnsActivated += step.yarnsActivated;
      mergeCollected(progress, step.catsCollected);
      bossEnergy += step.bossEnergyGained;

      updateStats((st) => {
        st.boxesBroken += step.boxesBroken;
        st.yarns += step.yarnsActivated;
        st.maxCombo = Math.max(st.maxCombo, cascadeLevel);
      });

      addFloating(step.scoreGained, matches.matchedPositions[0]);
      set({
        score: progress.score,
        objectives: recomputeObjectives(level, progress),
      });
      if (state.bossActive) set({ bossEnergy: Math.min(bossEnergy, BOSS_ENERGY.full) });
      if (step.hint) {
        const hint = findHint(board);
        if (hint) {
          set({ hintCells: hint });
          setTimeout(() => set({ hintCells: null }), 1400);
        }
      }
      await commit(board, T.pop);

      applyGravity(board);
      await commit(board, T.fall);
      refillBoard(board, level.boardConfig.availableCats);
      await commit(board, T.fall);
      clearFallFlags(board);

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

  function ensureSolvable(board: Board, cats: CatType[]) {
    const needsReshuffle = () =>
      findMatches(board).matchedPositions.length > 0 || !findHint(board);
    let guard = 0;
    while (needsReshuffle() && guard < 60) {
      const movable = board
        .flat()
        .filter((t) => t.type === 'cat' || t.type === 'specialCat');
      for (const t of movable)
        t.catType = cats[Math.floor(Math.random() * cats.length)];
      guard += 1;
    }
  }

  /** Ends a score-attack run (daily / blitz) and submits the score. */
  function endScoreMode() {
    const s = get();
    if (s.status !== 'playing') return;
    const progress = s.progress;
    updateStats((st) => {
      st.bestScore = Math.max(st.bestScore, progress.score);
    });
    const board = s.mode === 'daily' ? 'daily' : 'blitz';
    const scope = s.mode === 'daily' ? 'daily' : 'weekly';
    const prevBest = s.highScores[s.level!.id] ?? 0;
    const highScores = storage.saveHighScore(s.level!.id, progress.score);
    void submitScore({
      uid: s.user?.uid,
      name: s.nickname || s.user?.name || 'Jogador',
      score: progress.score,
      board,
      scope,
    });
    soundManager.play('victory');
    set({
      status: 'finished',
      isResolving: false,
      lastHighScore: progress.score,
      lastIsRecord: progress.score > prevBest,
      highScores,
    });
    cloudPush();
  }

  function finishMove(board: Board) {
    const state = get();
    const level = state.level!;
    const progress = state.progress;

    // Adventure: win -> relic choice; out of moves -> end run.
    if (state.mode === 'adventure') {
      handleAdventureFinish(board);
      return;
    }

    // Score-attack modes have no objectives — they end by moves/time.
    if (state.mode !== 'normal') {
      if (state.mode === 'daily' && state.movesLeft <= 0) {
        endScoreMode();
        return;
      }
      if (state.mode === 'blitz' && state.elapsedMs >= BLITZ_DURATION_MS) {
        endScoreMode();
        return;
      }
      ensureSolvable(board, level.boardConfig.availableCats);
      set({ board: cloneBoard(board), score: progress.score, isResolving: false });
      return;
    }

    const objectives = recomputeObjectives(level, progress);
    const won = checkWinCondition(level.objectives, progress);
    const movesLeft = state.movesLeft;
    const lost = !won && checkLoseCondition(movesLeft, won);

    if (won) {
      const tMult = timeMultiplier(state.elapsedMs);
      const high = Math.round(progress.score * tMult);
      const prevBest = state.highScores[level.id] ?? 0;
      const highScores = storage.saveHighScore(level.id, high);
      const stars = computeStars(movesLeft, state.totalMoves);
      const bestStars = Math.max(state.starsByLevel[level.id] ?? 0, stars);
      const newStars = { ...state.starsByLevel, [level.id]: bestStars };
      const unlocked = Math.max(state.unlockedLevel, level.id + 1);
      storage.saveMeta({ unlockedLevel: unlocked, stars: newStars });
      storage.clearSavedGame();
      // DDA: a win resets the level's fail counter.
      const attemptsW = storage.loadAttempts();
      if (attemptsW[level.id]) {
        delete attemptsW[level.id];
        storage.saveAttempts(attemptsW);
      }
      updateStats((st) => {
        st.wins += 1;
        st.bestScore = Math.max(st.bestScore, progress.score);
        if (state.elapsedMs < 60000) st.fastWins += 1;
        st.levelsCompleted = Math.max(
          st.levelsCompleted,
          Object.keys(newStars).length,
        );
      });
      void submitScore({
        uid: state.user?.uid,
        name: state.nickname || state.user?.name || 'Jogador',
        score: high,
        board: `lvl${level.id}`,
        scope: 'weekly',
      });
      soundManager.play('victory');
      set({
        status: 'won',
        objectives,
        starsByLevel: newStars,
        unlockedLevel: unlocked,
        highScores,
        lastHighScore: high,
        lastTimeMultiplier: tMult,
        lastIsRecord: high > prevBest,
        savedGameExists: false,
        isResolving: false,
      });
      cloudPush();
      return;
    }

    if (lost) {
      storage.clearSavedGame();
      // DDA: record the loss so the next attempt grants bonus moves.
      const attemptsL = storage.loadAttempts();
      attemptsL[level.id] = { fails: (attemptsL[level.id]?.fails ?? 0) + 1 };
      storage.saveAttempts(attemptsL);
      soundManager.play('defeat');
      set({ status: 'lost', objectives, savedGameExists: false, isResolving: false });
      return;
    }

    ensureSolvable(board, level.boardConfig.availableCats);
    set({ board: cloneBoard(board), objectives, isResolving: false });
    storage.saveSavedGame(snapshot(board));
    set({ savedGameExists: true });
  }

  async function attemptSwap(a: Position, b: Position) {
    const board = cloneBoard(get().board);
    set({ isResolving: true, selected: null, hintCells: null });
    soundManager.play('swap');

    swapTiles(board, a, b);
    await commit(board, T.swap);

    const valid = findMatches(board, [a, b]).matchedPositions.length > 0;
    if (!valid) {
      swapTiles(board, a, b);
      await commit(board, T.swap);
      set({ isResolving: false });
      return;
    }

    const m = get().mode;
    if (m === 'adventure' && get().advFreeLeft > 0) {
      set({ advFreeLeft: get().advFreeLeft - 1 });
      addToast('🆓 Jogada grátis!');
    } else if (m !== 'blitz') {
      set({ movesLeft: get().movesLeft - 1 });
    }
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

    applyObstacleDamage(board, targets);
    addParticles(targets);
    for (const p of targets) {
      const t = board[p.row][p.col];
      if (t.type === 'cat' || t.type === 'specialCat') t.isMatched = true;
    }
    await commit(board, T.pop);
    for (const p of targets) {
      const t = board[p.row][p.col];
      if (t.type === 'cat' || t.type === 'specialCat')
        board[p.row][p.col] = makeEmptyTile(p.row, p.col);
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

  function beginLevel(level: Level, opts: BeginOpts = {}) {
    lastTickTs = Date.now();
    const mode = opts.mode ?? 'normal';
    const saved = opts.saved;
    const progress = saved ? saved.progress : createProgress();
    // Adaptive difficulty: grant bonus moves after repeated losses (normal mode).
    let ddaBonus = 0;
    if (!saved && mode === 'normal') {
      const fails = storage.loadAttempts()[level.id]?.fails ?? 0;
      ddaBonus = Math.min(fails, 3) * 2;
    }
    const moves = saved ? saved.movesLeft : level.moves + ddaBonus;
    const total = saved ? saved.totalMoves : level.moves + ddaBonus;
    set({
      screen: 'game',
      mode,
      level,
      board: saved ? saved.board : createBoard(level.boardConfig, opts.rng),
      movesLeft: moves,
      totalMoves: total,
      score: saved ? saved.score : 0,
      progress,
      objectives: recomputeObjectives(level, progress),
      status: 'playing',
      isResolving: false,
      elapsedMs: saved ? saved.elapsedMs : 0,
      bossActive: saved ? saved.bossActive : !!level.boardConfig.bossCat,
      bossEnergy: saved ? saved.bossEnergy : 0,
      bossState: 'sleeping',
      selected: null,
      hintCells: null,
      floatingScores: [],
      toasts: [],
      particles: [],
      shakeLevel: 0,
      comboLevel: 0,
      activeBooster: null,
      boosterUses: saved
        ? saved.boosterUses
        : { pawBomb: BOOSTER_START, laser: BOOSTER_START },
      advFreeLeft: 0,
    });
    if (saved) set({ savedGameExists: true });
    if (ddaBonus > 0) addToast(`🐾 +${ddaBonus} movimentos extras!`);
  }

  // ---- Adventure (roguelite) ----
  function beginAdventureFloor(depth: number) {
    lastTickTs = Date.now();
    const mods = get().relicMods;
    const level = makeAdventureFloor(depth, mods.yarnsPerFloor);
    const progress = createProgress();
    const moves = level.moves + mods.extraMoves;
    set({
      screen: 'game',
      mode: 'adventure',
      level,
      board: createBoard(level.boardConfig),
      movesLeft: moves,
      totalMoves: moves,
      score: 0,
      progress,
      objectives: recomputeObjectives(level, progress),
      status: 'playing',
      isResolving: false,
      elapsedMs: 0,
      bossActive: !!level.boardConfig.bossCat,
      bossEnergy: 0,
      bossState: 'sleeping',
      selected: null,
      hintCells: null,
      floatingScores: [],
      toasts: [],
      particles: [],
      shakeLevel: 0,
      comboLevel: 0,
      activeBooster: null,
      boosterUses: {
        pawBomb: BOOSTER_START + mods.bonusBoosters,
        laser: BOOSTER_START + mods.bonusBoosters,
      },
      advFreeLeft: mods.freeMoves,
    });
    addToast(`🗺️ Andar ${depth} — meta ${level.objectives[0].target} pts`);
  }

  function endAdventureRun() {
    const s = get();
    const total = s.advTotalScore + s.progress.score;
    const prevBest = s.highScores[ADVENTURE_LEVEL_ID] ?? 0;
    const highScores = storage.saveHighScore(ADVENTURE_LEVEL_ID, total);
    updateStats((st) => {
      st.bestScore = Math.max(st.bestScore, total);
      st.advBestDepth = Math.max(st.advBestDepth, s.advDepth);
    });
    void submitScore({
      uid: s.user?.uid,
      name: s.nickname || s.user?.name || 'Jogador',
      score: total,
      board: 'adventure',
      scope: 'weekly',
    });
    soundManager.play('defeat');
    set({
      status: 'finished',
      isResolving: false,
      advTotalScore: total,
      lastHighScore: total,
      lastIsRecord: total > prevBest,
      highScores,
    });
    cloudPush();
  }

  function handleAdventureFinish(board: Board) {
    const state = get();
    const level = state.level!;
    const progress = state.progress;
    const won = checkWinCondition(level.objectives, progress);

    if (won) {
      const total = state.advTotalScore + progress.score;
      updateStats((st) => {
        st.bestScore = Math.max(st.bestScore, progress.score);
      });
      soundManager.play('victory');
      set({
        advTotalScore: total,
        relicChoices: offerRelics(3),
        screen: 'relicSelect',
        isResolving: false,
      });
      return;
    }

    if (state.movesLeft <= 0) {
      endAdventureRun();
      return;
    }

    ensureSolvable(board, level.boardConfig.availableCats);
    set({
      board: cloneBoard(board),
      score: progress.score,
      objectives: recomputeObjectives(level, progress),
      isResolving: false,
    });
  }

  // Subscribe to auth changes (deferred so `set` is ready). On login, merge
  // the cloud save with local progress and push the union back up.
  // Safety net: if auth state never resolves (e.g. flaky network in the native
  // shell), stop showing "loading account" after a few seconds.
  if (authAvailable) {
    setTimeout(() => {
      if (!get().authReady) set({ authReady: true });
    }, 6000);
  }

  setTimeout(() => {
    onAuthChange(async (user) => {
      if (!user) {
        set({ user: null, authReady: true });
        return;
      }
      const patch: Partial<GameState> = { user, authReady: true };
      if (!get().nickname) {
        storage.saveNickname(user.name);
        patch.nickname = user.name;
      }
      set(patch);

      const cloud = await loadCloudSave(user.uid);
      // Re-read state AFTER the await so progress earned during the load isn't
      // lost when we merge.
      const s = get();
      const local: CloudData = {
        unlockedLevel: s.unlockedLevel,
        stars: s.starsByLevel,
        highScores: s.highScores,
        stats: s.stats,
        achievements: s.achievements,
      };
      const merged = cloud ? mergeCloud(local, cloud) : local;
      storage.saveMeta({
        unlockedLevel: merged.unlockedLevel,
        stars: merged.stars,
      });
      storage.saveHighScores(merged.highScores);
      storage.saveStats(merged.stats);
      storage.saveAchievements(merged.achievements);
      set({
        unlockedLevel: merged.unlockedLevel,
        starsByLevel: merged.stars,
        highScores: merged.highScores,
        stats: merged.stats,
        achievements: merged.achievements,
      });
      void saveCloudSave(user.uid, merged);
    });
  }, 0);

  return {
    screen: 'home',
    mode: 'normal',
    level: null,
    board: [],
    movesLeft: 0,
    totalMoves: 0,
    score: 0,
    progress: createProgress(),
    objectives: [],
    status: 'playing',
    isResolving: false,
    elapsedMs: 0,

    bossActive: false,
    bossEnergy: 0,
    bossState: 'sleeping',

    selected: null,
    hintCells: null,
    floatingScores: [],
    toasts: [],
    particles: [],
    shakeLevel: 0,
    comboLevel: 0,

    activeBooster: null,
    boosterUses: {},

    unlockedLevel: meta.unlockedLevel,
    starsByLevel: meta.stars,
    highScores: storage.loadHighScores(),
    lastHighScore: 0,
    lastTimeMultiplier: 1,
    lastIsRecord: false,
    savedGameExists: storage.loadSavedGame() !== null,
    nickname: storage.loadNickname(),
    soundEnabled: true,

    user: null,
    authReady: !authAvailable,
    authAvailable,

    stats: storage.loadStats(),
    achievements: storage.loadAchievements(),

    advDepth: 0,
    advRelics: [],
    advTotalScore: 0,
    relicMods: emptyEffects(),
    relicChoices: [],
    advFreeLeft: 0,

    tutorialSeen: storage.loadTutorialSeen(),
    showTutorial: !storage.loadTutorialSeen(),

    goHome: () => {
      soundManager.play('button');
      set({ screen: 'home', savedGameExists: storage.loadSavedGame() !== null });
    },
    goLevelSelect: () => {
      soundManager.play('button');
      set({ screen: 'levelSelect' });
    },
    goLeaderboard: () => {
      soundManager.play('button');
      set({ screen: 'leaderboard' });
    },
    goAchievements: () => {
      soundManager.play('button');
      set({ screen: 'achievements' });
    },
    goAuth: () => {
      soundManager.play('button');
      set({ screen: 'auth' });
    },
    goProfile: () => {
      soundManager.play('button');
      set({ screen: 'profile' });
    },

    startLevel: (id: number) => {
      const level = getLevel(id);
      if (!level) return;
      soundManager.play('button');
      beginLevel(level);
    },

    startDaily: () => {
      const dayId = getDayId();
      soundManager.play('button');
      beginLevel(makeDailyLevel(dayId), {
        mode: 'daily',
        rng: mulberry32(hashString(`catmatch-${dayId}`)),
      });
    },

    startBlitz: () => {
      soundManager.play('button');
      beginLevel(BLITZ_LEVEL, { mode: 'blitz' });
    },

    startAdventure: () => {
      soundManager.play('button');
      set({
        advDepth: 1,
        advRelics: [],
        advTotalScore: 0,
        relicMods: emptyEffects(),
        relicChoices: [],
      });
      beginAdventureFloor(1);
    },

    chooseRelic: (id: string) => {
      soundManager.play('button');
      const relics = [...get().advRelics, id];
      const depth = get().advDepth + 1;
      set({
        advRelics: relics,
        relicMods: aggregateRelics(relics),
        advDepth: depth,
      });
      beginAdventureFloor(depth);
    },

    openTutorial: () => {
      soundManager.play('button');
      set({ showTutorial: true });
    },
    closeTutorial: () => {
      storage.saveTutorialSeen(true);
      set({ showTutorial: false, tutorialSeen: true });
    },

    resumeGame: () => {
      const saved = storage.loadSavedGame();
      if (!saved) return;
      const level = getLevel(saved.levelId);
      if (!level) return;
      soundManager.play('button');
      beginLevel(level, { saved });
    },

    restartLevel: () => {
      const s = get();
      if (s.mode === 'daily') return s.startDaily();
      if (s.mode === 'blitz') return s.startBlitz();
      if (s.mode === 'adventure') return s.startAdventure();
      const id = s.level?.id;
      if (id) beginLevel(getLevel(id)!);
    },

    nextLevel: () => {
      const id = get().level?.id ?? 0;
      const next = getLevel(id + 1);
      if (next) beginLevel(next);
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
      if (adjacent && movable) void attemptSwap(sel, pos);
      else set({ selected: movable ? pos : null });
    },

    onTileDrag: (from: Position, to: Position) => {
      const state = get();
      if (state.isResolving || state.status !== 'playing' || state.activeBooster)
        return;
      if (!inBounds(state.board, to.row, to.col)) return;
      const a = state.board[from.row]?.[from.col];
      const b = state.board[to.row]?.[to.col];
      const movable = (t?: { type: string }) =>
        t?.type === 'cat' || t?.type === 'specialCat';
      const adjacent =
        Math.abs(from.row - to.row) + Math.abs(from.col - to.col) === 1;
      if (adjacent && movable(a) && movable(b)) void attemptSwap(from, to);
    },

    selectBooster: (id: BoosterId) => {
      const state = get();
      if (state.isResolving || state.status !== 'playing') return;
      if ((state.boosterUses[id] ?? 0) <= 0) return;
      soundManager.play('button');
      set({
        activeBooster: state.activeBooster === id ? null : id,
        selected: null,
      });
    },

    toggleSound: () => {
      const enabled = soundManager.toggle();
      set({ soundEnabled: enabled });
    },

    setNickname: (name: string) => {
      const clean = name.trim().slice(0, 18);
      storage.saveNickname(clean);
      set({ nickname: clean });
      cloudPush();
      // Reflect the new name on existing leaderboard entries (and locally).
      const user = get().user;
      if (clean && user) {
        void renameUserScores(user.uid, clean);
        set({ user: { ...user, name: clean } });
      }
    },

    tick: () => {
      const s = get();
      if (s.screen !== 'game' || s.status !== 'playing') return;
      // Freeze the clock during cascade animations so it stays fair (and the
      // win-time multiplier isn't eaten by long combos). Use real elapsed time
      // between ticks so background-tab throttling doesn't skew the timer.
      const now = Date.now();
      if (s.isResolving) {
        lastTickTs = now;
        return;
      }
      const delta = Math.min(Math.max(now - lastTickTs, 0), 5000);
      lastTickTs = now;
      const next = s.elapsedMs + delta;
      set({ elapsedMs: next });
      if (s.mode === 'blitz' && next >= BLITZ_DURATION_MS) {
        endScoreMode();
      }
    },

    signInEmail: async (email: string, password: string) => {
      try {
        await signInWithEmail(email.trim(), password);
        return null;
      } catch (e) {
        return authErrorMessage(e);
      }
    },
    signUpEmail: async (email: string, password: string, nickname: string) => {
      const nick = nickname.trim().slice(0, 18);
      try {
        await signUpWithEmail(email.trim(), password, nick || undefined);
        if (nick) {
          storage.saveNickname(nick);
          set({ nickname: nick });
        }
        return null;
      } catch (e) {
        return authErrorMessage(e);
      }
    },
    signOut: async () => {
      soundManager.play('button');
      await signOutUser();
      set({ user: null, screen: 'leaderboard' });
    },
    resetPassword: async (email: string) => {
      try {
        await resetPasswordEmail(email.trim());
        return null;
      } catch (e) {
        return authErrorMessage(e);
      }
    },
  };
});

export { levels };
