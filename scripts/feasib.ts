import { createBoard } from '../src/game/boardGenerator';
import { findMatches } from '../src/game/matchDetector';
import { resolveMatchStep } from '../src/game/cascadeResolver';
import { applyGravity, refillBoard, clearFallFlags } from '../src/game/gravity';
import { swapTiles } from '../src/game/swapLogic';
import { activateBossCatPower } from '../src/game/bossCatLogic';
import { levels } from '../src/data/levels';
import { cloneBoard } from '../src/game/utils';
import { BOSS_ENERGY, SCORE } from '../src/game/scoring';
import type { Board, CatType, Level, Objective, Position } from '../src/game/types';

interface Prog {
  score: number; cats: Record<string, number>; boxes: number; yarns: number; boss: number;
}
function newProg(): Prog { return { score: 0, cats: {}, boxes: 0, yarns: 0, boss: 0 }; }

function resolve(board: Board, cats: CatType[], prog: Prog, bossActive: boolean, energyRef: { e: number }) {
  let cascade = 0; let guard = 0;
  while (guard++ < 60) {
    const m = findMatches(board);
    if (m.matchedPositions.length === 0) break;
    cascade += 1;
    const step = resolveMatchStep(board, cascade, undefined, cats);
    prog.score += step.scoreGained;
    prog.boxes += step.boxesBroken;
    prog.yarns += step.yarnsActivated;
    for (const [k, v] of Object.entries(step.catsCollected)) prog.cats[k] = (prog.cats[k] ?? 0) + (v ?? 0);
    energyRef.e += step.bossEnergyGained;
    applyGravity(board); refillBoard(board, cats); clearFallFlags(board);
    if (bossActive && energyRef.e >= BOSS_ENERGY.full) {
      energyRef.e -= BOSS_ENERGY.full;
      const res = activateBossCatPower(board);
      prog.score += SCORE.bossPower; prog.boxes += res.boxesBroken; prog.boss += 1;
      applyGravity(board); refillBoard(board, cats); clearFallFlags(board);
    }
  }
}

function validSwaps(board: Board): [Position, Position][] {
  const out: [Position, Position][] = [];
  const R = board.length, C = board[0].length;
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    for (const [dr, dc] of [[0, 1], [1, 0]]) {
      const r2 = r + dr, c2 = c + dc;
      if (r2 >= R || c2 >= C) continue;
      const a = board[r][c], b = board[r2][c2];
      const mv = (t: any) => t.type === 'cat' || t.type === 'specialCat';
      if (!mv(a) || !mv(b)) continue;
      swapTiles(board, { row: r, col: c }, { row: r2, col: c2 });
      const ok = findMatches(board, [{ row: r, col: c }, { row: r2, col: c2 }]).matchedPositions.length > 0;
      swapTiles(board, { row: r, col: c }, { row: r2, col: c2 });
      if (ok) out.push([{ row: r, col: c }, { row: r2, col: c2 }]);
    }
  }
  return out;
}

// Score a hypothetical move outcome for the given primary objective.
function value(before: Prog, after: Prog, obj: Objective, bossActive: boolean): number {
  switch (obj.type) {
    case 'score': return after.score - before.score;
    case 'collectCat': {
      const k = obj.catType!;
      const gained = (after.cats[k] ?? 0) - (before.cats[k] ?? 0);
      return gained * 1000 + (after.score - before.score) * 0.01;
    }
    case 'breakBox': return (after.boxes - before.boxes) * 1000 + (after.score - before.score) * 0.01;
    case 'activateYarn': return (after.yarns - before.yarns) * 1000 + (after.score - before.score) * 0.01;
    case 'chargeBoss': return (after.boss - before.boss) * 100000 + (after.score - before.score);
    default: return after.score - before.score;
  }
}

function met(prog: Prog, objs: Objective[]): boolean {
  return objs.every((o) => {
    if (o.type === 'score') return prog.score >= o.target;
    if (o.type === 'collectCat') return (prog.cats[o.catType!] ?? 0) >= o.target;
    if (o.type === 'breakBox') return prog.boxes >= o.target;
    if (o.type === 'activateYarn') return prog.yarns >= o.target;
    if (o.type === 'chargeBoss') return prog.boss >= o.target;
    return false;
  });
}

function playOnce(level: Level): { won: boolean; prog: Prog } {
  const cats = level.boardConfig.availableCats;
  const bossActive = !!level.boardConfig.bossCat;
  let board = createBoard(level.boardConfig);
  const prog = newProg();
  const primary = level.objectives[0];
  let moves = level.moves + (Number(process.env.EXTRA)||0);
  const energyRef = { e: 0 };
  while (moves > 0 && !met(prog, level.objectives)) {
    const swaps = validSwaps(board);
    if (swaps.length === 0) break;
    let best: [Position, Position] | null = null; let bestVal = -Infinity;
    for (const s of swaps) {
      const clone = cloneBoard(board);
      const p2: Prog = { score: prog.score, cats: { ...prog.cats }, boxes: prog.boxes, yarns: prog.yarns, boss: prog.boss };
      const eref2 = { e: energyRef.e };
      swapTiles(clone, s[0], s[1]);
      resolve(clone, cats, p2, bossActive, eref2);
      // Bias boss levels toward accumulating energy even before a charge fires.
      const v = value(prog, p2, primary, bossActive) + (bossActive ? (eref2.e - energyRef.e) : 0);
      if (v > bestVal) { bestVal = v; best = s; }
    }
    if (!best) break;
    swapTiles(board, best[0], best[1]);
    resolve(board, cats, prog, bossActive, energyRef);
    moves -= 1;
  }
  return { won: met(prog, level.objectives), prog };
}

const targets = process.argv.slice(2).map(Number);
const ids = targets.length ? targets : [66, 71, 76, 81, 86, 62, 67, 77, 63, 68, 83, 85, 95, 100, 110, 104];
for (const id of ids) {
  const level = levels.find((l) => l.id === id)!;
  const N = 12;
  let wins = 0; let bestProg: Prog | null = null; let bestScore = -1;
  for (let t = 0; t < N; t++) {
    const r = playOnce(level);
    if (r.won) wins += 1;
    const key = level.objectives[0];
    let metric = 0;
    if (key.type === 'collectCat') metric = r.prog.cats[key.catType!] ?? 0;
    else if (key.type === 'breakBox') metric = r.prog.boxes;
    else if (key.type === 'activateYarn') metric = r.prog.yarns;
    else if (key.type === 'chargeBoss') metric = r.prog.boss;
    else metric = r.prog.score;
    if (metric > bestScore) { bestScore = metric; bestProg = r.prog; }
  }
  const o = level.objectives;
  console.log(`L${id} ${level.objectives[0].type} moves=${level.moves} target=${JSON.stringify(o.map(x=>[x.type,x.catType,x.target]))} wins=${wins}/${N} bestPrimary=${bestScore} bestScore=${bestProg?.score}`);
}
