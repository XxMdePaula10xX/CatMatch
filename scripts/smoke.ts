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

// 1. Board generation has no initial matches for every level.
for (const level of levels) {
  const board = createBoard(level.boardConfig);
  assert(board.length === 8 && board[0].length === 8, `level ${level.id} is 8x8`);
  assert(
    findMatches(board).matchedPositions.length === 0,
    `level ${level.id} starts with no matches`,
  );
  assert(findHint(board) !== null, `level ${level.id} has at least one move`);
}

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

console.log('\nAll smoke tests passed ✅');
