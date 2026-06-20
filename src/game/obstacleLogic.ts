import type { Board, Position } from './types';
import { OBSTACLES } from '../data/obstacles';
import { makeEmptyTile } from './boardGenerator';
import { neighbors } from './utils';

export interface ObstacleDamageResult {
  /** Caixas de papelão quebradas (para objetivos). */
  boxesBroken: number;
  /** Total de obstáculos destruídos (para pontuação). */
  obstaclesDestroyed: number;
}

/**
 * Damages obstacles adjacent to matched cells (plus any extra damage points
 * from cat powers). Removable obstacles whose hp reaches 0 are cleared.
 */
export function applyObstacleDamage(
  board: Board,
  matchedPositions: Position[],
  extraDamage: Position[] = [],
): ObstacleDamageResult {
  const damage = new Map<string, number>();

  const addDamage = (row: number, col: number) => {
    const k = `${row},${col}`;
    damage.set(k, (damage.get(k) ?? 0) + 1);
  };

  // Standard adjacency damage from matches.
  for (const p of matchedPositions) {
    for (const n of neighbors(board, p)) {
      if (n.type === 'obstacle') addDamage(n.row, n.col);
    }
  }
  // Extra damage (e.g. Black Cat).
  for (const p of extraDamage) addDamage(p.row, p.col);

  let boxesBroken = 0;
  let obstaclesDestroyed = 0;

  for (const [k, dmg] of damage) {
    const [row, col] = k.split(',').map(Number);
    const tile = board[row][col];
    if (tile.type !== 'obstacle' || !tile.obstacleType) continue;
    const def = OBSTACLES[tile.obstacleType];
    if (!def.removable) continue;

    tile.hp = (tile.hp ?? def.hp) - dmg;
    tile.isActivating = true;
    if (tile.hp <= 0) {
      if (tile.obstacleType === 'box') boxesBroken += 1;
      obstaclesDestroyed += 1;
      board[row][col] = makeEmptyTile(row, col);
    }
  }

  return { boxesBroken, obstaclesDestroyed };
}
