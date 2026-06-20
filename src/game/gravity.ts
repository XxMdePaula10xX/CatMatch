import type { Board, CatType, Tile } from './types';
import { makeCatTile, makeEmptyTile } from './boardGenerator';
import { randomItem } from './utils';
import { OBSTACLES } from '../data/obstacles';

/**
 * Applies gravity: cats fall down within each column until they rest on the
 * board floor, another cat, or a fall-blocking obstacle. Empty cells bubble
 * up. Mutates the board and updates each tile's coordinates.
 */
export function applyGravity(board: Board): void {
  const rows = board.length;
  const cols = board[0]?.length ?? 0;

  for (let c = 0; c < cols; c++) {
    // Process the column from the bottom up, segment by segment between
    // fall-blocking obstacles so cats never fall "through" them.
    let segmentBottom = rows - 1;
    for (let r = rows - 1; r >= 0; r--) {
      const tile = board[r][c];
      const blocks =
        tile.type === 'obstacle' &&
        tile.obstacleType &&
        OBSTACLES[tile.obstacleType].blocksFall;
      const isYarn = tile.type === 'yarn';

      if (blocks || isYarn) {
        // Compact the segment above this blocker, then start a new segment.
        compactSegment(board, c, r + 1, segmentBottom);
        segmentBottom = r - 1;
      }
    }
    compactSegment(board, c, 0, segmentBottom);
  }
}

/** Settles movable tiles to the bottom of [top..bottom] within a column. */
function compactSegment(
  board: Board,
  col: number,
  top: number,
  bottom: number,
): void {
  if (bottom < top) return;
  let writeRow = bottom;
  for (let r = bottom; r >= top; r--) {
    const tile = board[r][col];
    if (tile.type === 'empty') continue;
    if (writeRow !== r) {
      board[writeRow][col] = tile;
      tile.row = writeRow;
      tile.col = col;
      tile.isFalling = true;
      board[r][col] = makeEmptyTile(r, col);
    }
    writeRow -= 1;
  }
}

/**
 * Spawns fresh cats into empty cells at the top of each column segment.
 * Only fills cells that are not below a fall-blocking obstacle.
 */
export function refillBoard(board: Board, availableCats: CatType[]): void {
  const rows = board.length;
  const cols = board[0]?.length ?? 0;

  for (let c = 0; c < cols; c++) {
    // Find the topmost fall-blocker; cells above the top blocker get refilled,
    // but cells trapped beneath a blocker should not be filled from the top.
    let topBlockerRow = -1;
    for (let r = 0; r < rows; r++) {
      const tile = board[r][c];
      const blocks =
        (tile.type === 'obstacle' &&
          tile.obstacleType &&
          OBSTACLES[tile.obstacleType].blocksFall) ||
        tile.type === 'yarn';
      if (blocks) {
        topBlockerRow = r;
        break;
      }
    }

    for (let r = 0; r < rows; r++) {
      if (topBlockerRow !== -1 && r > topBlockerRow) break;
      const tile = board[r][c];
      if (tile.type === 'empty') {
        const fresh: Tile = makeCatTile(r, c, randomItem(availableCats));
        fresh.isFalling = true;
        fresh.isNew = true;
        board[r][c] = fresh;
      }
    }
  }
}

/** Clears the transient falling/new animation flags. */
export function clearFallFlags(board: Board): void {
  for (const row of board) {
    for (const tile of row) {
      tile.isFalling = false;
      tile.isNew = false;
    }
  }
}
