// Headless smoke test for the core engine (no React).
import { createBoard } from '../src/game/boardGenerator';
import { findMatches } from '../src/game/matchDetector';
import { resolveMatchStep } from '../src/game/cascadeResolver';
import { applyGravity, refillBoard } from '../src/game/gravity';
import { swapTiles, findHint, isValidSwap } from '../src/game/swapLogic';
import { levels } from '../src/data/levels';
import type { Board } from '../src/game/types';

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
  console.log('ok  -', msg);
}

function countTiles(board: Board) {
  let cats = 0;
  let empty = 0;
  for (const row of board) for (const t of row) {
    if (t.type === 'cat' || t.type === 'specialCat') cats++;
    if (t.type === 'empty') empty++;
  }
  return { cats, empty };
}

// 1. Every level (all 60) is well-formed and its objectives are feasible.
assert(levels.length === 60, `there are 60 levels (got ${levels.length})`);
let prevHardness = 0;
for (const level of levels) {
  const board = createBoard(level.boardConfig);
  assert(board.length === 8 && board[0].length === 8, `level ${level.id} is 8x8`);
  assert(
    findMatches(board).matchedPositions.length === 0,
    `level ${level.id} starts with no matches`,
  );
  assert(findHint(board) !== null, `level ${level.id} has at least one move`);

  const obstacles = level.boardConfig.obstacles ?? [];
  const yarns = level.boardConfig.yarns ?? [];
  for (const o of level.objectives) {
    if (o.type === 'breakBox') {
      const boxes = obstacles.filter((x) => x.type === 'box').length;
      assert(boxes >= o.target, `level ${level.id}: ${boxes} boxes >= target ${o.target}`);
    }
    if (o.type === 'activateYarn') {
      assert(yarns.length >= o.target, `level ${level.id}: ${yarns.length} yarns >= target ${o.target}`);
    }
    if (o.type === 'chargeBoss') {
      assert(!!level.boardConfig.bossCat, `level ${level.id}: boss enabled for chargeBoss`);
    }
  }
}
// Rough difficulty trend: average objective target should grow across worlds.
const worldAvg = (lo: number, hi: number) => {
  const ls = levels.filter((l) => l.id >= lo && l.id <= hi);
  const sum = ls.reduce((a, l) => a + l.objectives.reduce((s, o) => s + o.target, 0), 0);
  return sum / ls.length;
};
prevHardness = worldAvg(1, 10);
assert(worldAvg(51, 60) > prevHardness, 'late levels are harder than early ones');

// 2. A valid swap resolves and refills with no holes remaining.
const level = levels[0];
let board = createBoard(level.boardConfig);
const hint = findHint(board)!;
assert(isValidSwap(board, hint[0], hint[1]), 'hint swap is valid');
swapTiles(board, hint[0], hint[1]);
assert(findMatches(board).matchedPositions.length > 0, 'swap created a match');

let totalScore = 0;
let guard = 0;
while (findMatches(board).matchedPositions.length > 0 && guard < 50) {
  const step = resolveMatchStep(board, 1);
  totalScore += step.scoreGained;
  applyGravity(board);
  refillBoard(board, level.boardConfig.availableCats);
  guard++;
}
assert(totalScore > 0, `cascade produced score (${totalScore})`);
const { empty } = countTiles(board);
assert(empty === 0, `board fully refilled (empty=${empty})`);

// 3. Obstacle level: damaging boxes works through several random moves.
const boxLevel = levels[2];
board = createBoard(boxLevel.boardConfig);
let boxesBroken = 0;
for (let i = 0; i < 200 && boxesBroken < 1; i++) {
  const h = findHint(board);
  if (!h) break;
  swapTiles(board, h[0], h[1]);
  let g = 0;
  while (findMatches(board).matchedPositions.length > 0 && g < 50) {
    const step = resolveMatchStep(board, 1);
    boxesBroken += step.boxesBroken;
    applyGravity(board);
    refillBoard(board, boxLevel.boardConfig.availableCats);
    g++;
  }
}
assert(boxesBroken >= 1, `box obstacles can be broken (${boxesBroken})`);

// 4. Daily Challenge determinism: same seed → identical starting board.
import { mulberry32, hashString } from '../src/game/random';
const cfg = { rows: 8, cols: 8, availableCats: boxLevel.boardConfig.availableCats };
const seed = hashString('catmatch-2026-06-20');
const b1 = createBoard(cfg, mulberry32(seed));
const b2 = createBoard(cfg, mulberry32(seed));
const sig = (b: Board) => b.flat().map((t) => `${t.type}:${t.catType ?? ''}`).join('|');
assert(sig(b1) === sig(b2), 'daily seeded board is deterministic');
const b3 = createBoard(cfg, mulberry32(seed + 1));
assert(sig(b1) !== sig(b3), 'different seed → different board');

console.log('\nAll smoke tests passed ✅');
