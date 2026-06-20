import type { Board, BoardConfig, CatType, Tile } from './types';
import { nextId, randomItem } from './utils';
import { findMatches } from './matchDetector';

function makeCatTile(
  row: number,
  col: number,
  catType: CatType,
): Tile {
  return {
    id: nextId(),
    row,
    col,
    type: 'cat',
    catType,
  };
}

function makeEmptyTile(row: number, col: number): Tile {
  return { id: nextId(), row, col, type: 'empty' };
}

/**
 * Picks a cat type for (row,col) that does not immediately complete a
 * horizontal or vertical run of 3, so the starting board has no matches.
 */
function pickNonMatchingCat(
  board: Board,
  row: number,
  col: number,
  cats: CatType[],
): CatType {
  const options = cats.filter((cat) => {
    // Avoid two of the same to the left.
    const left1 = board[row][col - 1];
    const left2 = board[row][col - 2];
    if (
      col >= 2 &&
      left1?.type === 'cat' &&
      left2?.type === 'cat' &&
      left1.catType === cat &&
      left2.catType === cat
    ) {
      return false;
    }
    // Avoid two of the same above.
    const up1 = board[row - 1]?.[col];
    const up2 = board[row - 2]?.[col];
    if (
      row >= 2 &&
      up1?.type === 'cat' &&
      up2?.type === 'cat' &&
      up1.catType === cat &&
      up2.catType === cat
    ) {
      return false;
    }
    return true;
  });
  return randomItem(options.length > 0 ? options : cats);
}

/**
 * Creates a fresh board for the given level configuration. Obstacles and
 * yarn balls are placed first, then remaining cells are filled with cats
 * that produce no starting matches.
 */
export function createBoard(config: BoardConfig): Board {
  const { rows, cols, availableCats } = config;
  const board: Board = [];

  for (let r = 0; r < rows; r++) {
    const rowTiles: Tile[] = [];
    for (let c = 0; c < cols; c++) {
      rowTiles.push(makeEmptyTile(r, c));
    }
    board.push(rowTiles);
  }

  // Place obstacles.
  for (const o of config.obstacles ?? []) {
    if (board[o.row]?.[o.col]) {
      board[o.row][o.col] = {
        id: nextId(),
        row: o.row,
        col: o.col,
        type: 'obstacle',
        obstacleType: o.type,
        hp: o.type === 'box' ? 2 : o.type === 'bed' ? 99 : 1,
      };
    }
  }

  // Place yarn balls.
  for (const y of config.yarns ?? []) {
    if (board[y.row]?.[y.col]) {
      board[y.row][y.col] = {
        id: nextId(),
        row: y.row,
        col: y.col,
        type: 'yarn',
      };
    }
  }

  // Fill remaining empty cells with non-matching cats.
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].type === 'empty') {
        const cat = pickNonMatchingCat(board, r, c, availableCats);
        board[r][c] = makeCatTile(r, c, cat);
      }
    }
  }

  // Safety: if any matches slipped through, reshuffle those cats.
  let guard = 0;
  while (findMatches(board).matchedPositions.length > 0 && guard < 50) {
    for (const { row, col } of findMatches(board).matchedPositions) {
      const tile = board[row][col];
      if (tile.type === 'cat') {
        board[row][col] = makeCatTile(
          row,
          col,
          pickNonMatchingCat(board, row, col, availableCats),
        );
      }
    }
    guard += 1;
  }

  return board;
}

/** Re-fills the `id` ordering helper isn't needed externally; export tile makers. */
export { makeCatTile, makeEmptyTile };
