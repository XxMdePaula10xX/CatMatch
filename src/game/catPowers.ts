import type { Board, CatType, Position, Tile } from './types';
import type { MatchGroup } from './matchDetector';
import { neighbors, randomItem } from './utils';
import { swapTiles } from './swapLogic';

export interface PersonalityResult {
  /** Extra points from Orange Cat (+20% of the group base). */
  scoreBonus: number;
  /** Extra Boss Cat energy from Siamese Cat. */
  bossBonus: number;
  /** Gray Cat asked for a hint this turn. */
  hint: boolean;
  /** Obstacle cells that should take 1 extra damage (Black Cat). */
  extraObstacleDamage: Position[];
}

function key(p: Position): string {
  return `${p.row},${p.col}`;
}

/** Adjacent tiles around a group that are basic cats and not themselves matched. */
function adjacentFreeCats(
  board: Board,
  positions: Position[],
  matched: Set<string>,
): Tile[] {
  const seen = new Set<string>();
  const result: Tile[] = [];
  for (const p of positions) {
    for (const n of neighbors(board, p)) {
      const k = key(n);
      if (matched.has(k) || seen.has(k)) continue;
      if (n.type === 'cat') {
        seen.add(k);
        result.push(n);
      }
    }
  }
  return result;
}

/**
 * Applies each matched cat group's personality power, as described in the PRD.
 * Some powers mutate the board directly (White transforms a neighbour, Tabby
 * pushes a tile); others contribute bonuses returned to the caller.
 */
export function applyCatPersonalityEffects(
  board: Board,
  groups: MatchGroup[],
  matched: Set<string>,
  baseScorePerGroup: number[],
): PersonalityResult {
  const result: PersonalityResult = {
    scoreBonus: 0,
    bossBonus: 0,
    hint: false,
    extraObstacleDamage: [],
  };

  groups.forEach((group, idx) => {
    switch (group.catType) {
      case 'orange': {
        // Alegre — +20% pontos.
        result.scoreBonus += Math.round(baseScorePerGroup[idx] * 0.2);
        break;
      }
      case 'gray': {
        // Esperto — pede uma dica.
        result.hint = true;
        break;
      }
      case 'white': {
        // Mágico — transforma um vizinho aleatório em gato branco.
        const candidates = adjacentFreeCats(board, group.positions, matched);
        if (candidates.length > 0) {
          const target = randomItem(candidates);
          target.catType = 'white';
          target.isActivating = true;
        }
        break;
      }
      case 'black': {
        // Sortudo — reduz resistência de um obstáculo próximo.
        for (const p of group.positions) {
          const obstacle = neighbors(board, p).find(
            (n) => n.type === 'obstacle',
          );
          if (obstacle) {
            result.extraObstacleDamage.push({
              row: obstacle.row,
              col: obstacle.col,
            });
            break;
          }
        }
        break;
      }
      case 'siamese': {
        // Charmoso — bônus na barra do Gato Chefe.
        result.bossBonus += 5;
        break;
      }
      case 'tabby': {
        // Bagunceiro — empurra uma peça próxima.
        const candidates = adjacentFreeCats(board, group.positions, matched);
        if (candidates.length >= 2) {
          const a = randomItem(candidates);
          const rest = candidates.filter((t) => t.id !== a.id);
          const b = randomItem(rest);
          a.isActivating = true;
          b.isActivating = true;
          swapTiles(
            board,
            { row: a.row, col: a.col },
            { row: b.row, col: b.col },
          );
        }
        break;
      }
    }
  });

  return result;
}

/** Picks the cat type with the most tiles currently on the board. */
export function mostPresentCatType(board: Board): CatType | null {
  const counts = new Map<CatType, number>();
  for (const row of board) {
    for (const tile of row) {
      if (tile.type === 'cat' && tile.catType) {
        counts.set(tile.catType, (counts.get(tile.catType) ?? 0) + 1);
      }
    }
  }
  let best: CatType | null = null;
  let bestCount = 0;
  for (const [cat, count] of counts) {
    if (count > bestCount) {
      best = cat;
      bestCount = count;
    }
  }
  return best;
}
