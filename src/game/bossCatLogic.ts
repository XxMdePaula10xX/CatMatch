import type { Board, CatType, Position } from './types';
import { makeEmptyTile } from './boardGenerator';
import { mostPresentCatType } from './catPowers';
import { applyObstacleDamage } from './obstacleLogic';

export interface BossPowerResult {
  cleared: Position[];
  catType: CatType | null;
  boxesBroken: number;
  obstaclesDestroyed: number;
}

/**
 * "Espreguiçada Real": the Boss Cat removes every tile of the most common cat
 * type, then deals 1 damage to obstacles adjacent to the cleared tiles.
 */
export function activateBossCatPower(board: Board): BossPowerResult {
  const catType = mostPresentCatType(board);
  const cleared: Position[] = [];
  if (!catType) {
    return { cleared, catType: null, boxesBroken: 0, obstaclesDestroyed: 0 };
  }

  for (const row of board) {
    for (const tile of row) {
      if (tile.type === 'cat' && tile.catType === catType) {
        cleared.push({ row: tile.row, col: tile.col });
      }
    }
  }

  // Damage obstacles adjacent to cleared cells BEFORE emptying them.
  const dmg = applyObstacleDamage(board, cleared);

  for (const p of cleared) {
    board[p.row][p.col] = makeEmptyTile(p.row, p.col);
  }

  return {
    cleared,
    catType,
    boxesBroken: dmg.boxesBroken,
    obstaclesDestroyed: dmg.obstaclesDestroyed,
  };
}
