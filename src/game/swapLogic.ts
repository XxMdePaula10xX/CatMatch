import type { Board, Position } from './types';
import { areAdjacent, inBounds } from './utils';
import { findMatches } from './matchDetector';

/** Swaps two tiles in place (mutates the board) and fixes their coords. */
export function swapTiles(board: Board, a: Position, b: Position): void {
  const tileA = board[a.row][a.col];
  const tileB = board[b.row][b.col];

  board[a.row][a.col] = tileB;
  board[b.row][b.col] = tileA;

  tileB.row = a.row;
  tileB.col = a.col;
  tileA.row = b.row;
  tileA.col = b.col;
}

/**
 * A swap is allowed when the two positions are orthogonally adjacent, both
 * tiles are movable cats (basic or special), and the swap produces a match.
 */
export function isValidSwap(board: Board, a: Position, b: Position): boolean {
  if (!areAdjacent(a, b)) return false;

  const tileA = board[a.row][a.col];
  const tileB = board[b.row][b.col];

  const movable = (t: Board[number][number]) =>
    t.type === 'cat' || t.type === 'specialCat';
  if (!movable(tileA) || !movable(tileB)) return false;

  // Try the swap on a temporary copy.
  swapTiles(board, a, b);
  const matched = findMatches(board, [a, b]).matchedPositions.length > 0;
  swapTiles(board, a, b); // revert

  return matched;
}

/**
 * Finds any single valid swap on the board (used by the Gray Cat hint and to
 * detect a dead board). Returns the two positions or null if none exist.
 */
export function findHint(board: Board): [Position, Position] | null {
  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = { row: r, col: c };
      // Only need to test right and down neighbours to cover all pairs.
      for (const b of [
        { row: r, col: c + 1 },
        { row: r + 1, col: c },
      ]) {
        if (inBounds(board, b.row, b.col) && isValidSwap(board, a, b)) {
          return [a, b];
        }
      }
    }
  }
  return null;
}
