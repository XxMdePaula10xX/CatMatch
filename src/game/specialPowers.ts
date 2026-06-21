import type { Board, CatType, Position, Tile } from './types';
import { inBounds, randomItem } from './utils';
import { CAT_TYPES } from '../data/cats';

function key(p: Position): string {
  return `${p.row},${p.col}`;
}

function areaCells(
  board: Board,
  center: Position,
  radius: number,
): Position[] {
  const cells: Position[] = [];
  for (let r = center.row - radius; r <= center.row + radius; r++) {
    for (let c = center.col - radius; c <= center.col + radius; c++) {
      if (inBounds(board, r, c)) cells.push({ row: r, col: c });
    }
  }
  return cells;
}

function rowCells(board: Board, row: number): Position[] {
  const cols = board[0]?.length ?? 0;
  return Array.from({ length: cols }, (_, c) => ({ row, col: c }));
}

function colCells(board: Board, col: number): Position[] {
  return board.map((_, r) => ({ row: r, col }));
}

/**
 * When special cats are part of the matched set, fire their powers. Returns
 * the extra cells that should be cleared this step (added to the match set).
 * Magician mutates the board in place (transforming tiles) and clears nothing.
 */
export function applySpecialActivations(
  board: Board,
  matched: Set<string>,
): Position[] {
  const extra: Position[] = [];
  const add = (cells: Position[]) => {
    for (const cell of cells) {
      const tile = board[cell.row][cell.col];
      if (tile.type === 'cat' || tile.type === 'specialCat') {
        extra.push(cell);
      }
    }
  };

  // Snapshot the special tiles currently in the matched set.
  const specials: Tile[] = [];
  for (const row of board) {
    for (const tile of row) {
      if (tile.type === 'specialCat' && matched.has(key(tile))) {
        specials.push(tile);
      }
    }
  }

  for (const tile of specials) {
    const pos: Position = { row: tile.row, col: tile.col };
    switch (tile.specialType) {
      case 'ninjaH':
        add(rowCells(board, pos.row));
        break;
      case 'ninjaV':
        add(colCells(board, pos.col));
        break;
      case 'angry':
      case 'sleepy':
        add(areaCells(board, pos, 1));
        break;
      case 'magician': {
        // Transform up to 5 random cats into one type (excluding cats already
        // of that type, so the effect is always visible).
        const target = randomItem(CAT_TYPES) as CatType;
        const cats: Tile[] = [];
        for (const row of board) {
          for (const t of row) {
            if (t.type === 'cat' && t.catType !== target && !matched.has(key(t)))
              cats.push(t);
          }
        }
        for (let i = 0; i < 5 && cats.length > 0; i++) {
          const idx = Math.floor(Math.random() * cats.length);
          const chosen = cats.splice(idx, 1)[0];
          chosen.catType = target;
          chosen.isActivating = true;
        }
        break;
      }
      case 'lucky': {
        // Clears the surrounding 3x3 of cats; obstacles adjacent to those cells
        // take damage in the resolver's obstacle step (counted there).
        // (Lucky/Sleepy are spawn-only specials.)
        add(areaCells(board, pos, 1));
        break;
      }
    }
  }

  return extra;
}
