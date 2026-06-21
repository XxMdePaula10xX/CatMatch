import type { Board, CatType, Position } from './types';
import { makeEmptyTile } from './boardGenerator';
import { inBounds, neighbors } from './utils';
import { OBSTACLES } from '../data/obstacles';

export interface YarnActivation {
  yarn: Position;
  trigger: Position;
}

function key(p: Position): string {
  return `${p.row},${p.col}`;
}

/**
 * Finds yarn balls that are orthogonally adjacent to a matched cell, so they
 * should roll this turn. Each yarn is paired with one triggering match cell to
 * determine the roll direction.
 */
export function findYarnActivations(
  board: Board,
  matchedPositions: Position[],
): YarnActivation[] {
  const matchedSet = new Set(matchedPositions.map(key));
  const activations: YarnActivation[] = [];

  for (const row of board) {
    for (const tile of row) {
      if (tile.type !== 'yarn') continue;
      const trigger = neighbors(board, tile).find((n) =>
        matchedSet.has(key(n)),
      );
      if (trigger) {
        activations.push({
          yarn: { row: tile.row, col: tile.col },
          trigger: { row: trigger.row, col: trigger.col },
        });
      }
    }
  }
  return activations;
}

export interface YarnRollResult {
  cleared: Position[];
  path: Position[];
  /** Cat types of the cats cleared along the way (for collect objectives). */
  clearedCats: CatType[];
}

/**
 * Rolls a yarn ball away from the triggering combo, clearing cats along its
 * path. It stops at the board edge, an obstacle, another yarn, or a special
 * cat — damaging a removable obstacle it bumps into.
 */
export function activateYarnBall(
  board: Board,
  yarn: Position,
  trigger: Position,
): YarnRollResult {
  let dRow = Math.sign(yarn.row - trigger.row);
  let dCol = Math.sign(yarn.col - trigger.col);

  // Fallback: if direction is unclear, pick the first valid orthogonal dir.
  if (dRow === 0 && dCol === 0) {
    const dirs = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    for (const [r, c] of dirs) {
      if (inBounds(board, yarn.row + r, yarn.col + c)) {
        dRow = r;
        dCol = c;
        break;
      }
    }
  }

  const cleared: Position[] = [];
  const path: Position[] = [];
  const clearedCats: CatType[] = [];

  // The yarn leaves its own cell.
  board[yarn.row][yarn.col] = makeEmptyTile(yarn.row, yarn.col);

  let r = yarn.row + dRow;
  let c = yarn.col + dCol;
  while (inBounds(board, r, c)) {
    const tile = board[r][c];
    if (tile.type === 'yarn' || tile.type === 'specialCat') break;
    if (tile.type === 'obstacle') {
      // Bump and damage a removable obstacle, then stop.
      if (tile.obstacleType && OBSTACLES[tile.obstacleType].removable) {
        tile.hp = (tile.hp ?? OBSTACLES[tile.obstacleType].hp) - 1;
        tile.isActivating = true;
        if (tile.hp <= 0) {
          board[r][c] = makeEmptyTile(r, c);
          cleared.push({ row: r, col: c });
        }
      }
      break;
    }
    // Clear a cat in the path (empty cells are simply passed over).
    path.push({ row: r, col: c });
    if (tile.type === 'cat') {
      if (tile.catType) clearedCats.push(tile.catType);
      board[r][c] = makeEmptyTile(r, c);
      cleared.push({ row: r, col: c });
    }
    r += dRow;
    c += dCol;
  }

  return { cleared, path, clearedCats };
}
