import type { Board, CatType, Position } from './types';
import type { SpecialCreation } from './matchDetector';
import { findMatches } from './matchDetector';
import { applySpecialActivations } from './specialPowers';
import { applyCatPersonalityEffects } from './catPowers';
import { applyObstacleDamage } from './obstacleLogic';
import { findYarnActivations, activateYarnBall } from './yarnLogic';
import {
  SCORE,
  BOSS_ENERGY,
  baseScoreForSize,
  bossEnergyForSize,
  comboMultiplier,
} from './scoring';
import { makeEmptyTile } from './boardGenerator';
import { nextId } from './utils';

export interface StepResult {
  hadMatches: boolean;
  clearedPositions: Position[];
  scoreGained: number;
  bossEnergyGained: number;
  catsCollected: Partial<Record<CatType, number>>;
  boxesBroken: number;
  obstaclesDestroyed: number;
  yarnsActivated: number;
  hint: boolean;
  creations: SpecialCreation[];
}

function key(p: Position): string {
  return `${p.row},${p.col}`;
}

function parse(k: string): Position {
  const [row, col] = k.split(',').map(Number);
  return { row, col };
}

function emptyStep(): StepResult {
  return {
    hadMatches: false,
    clearedPositions: [],
    scoreGained: 0,
    bossEnergyGained: 0,
    catsCollected: {},
    boxesBroken: 0,
    obstaclesDestroyed: 0,
    yarnsActivated: 0,
    hint: false,
    creations: [],
  };
}

/**
 * Resolves a single cascade step on the board: detects matches, fires special
 * cats, applies personality powers, damages obstacles, rolls adjacent yarn
 * balls, then clears matched tiles and places any newly created specials.
 *
 * Gravity, refill and the Boss Cat power are driven by the caller (the store)
 * so the in-between states can be animated.
 */
export function resolveMatchStep(
  board: Board,
  cascadeLevel: number,
): StepResult {
  const result = findMatches(board);
  if (result.matchedPositions.length === 0) return emptyStep();

  const matchedSet = new Set(result.matchedPositions.map(key));

  // 1. Special cat activations expand the cleared area.
  const specialExtra = applySpecialActivations(board, matchedSet);
  for (const p of specialExtra) matchedSet.add(key(p));

  // 2. Count collected cats (read tiles before they are emptied).
  const catsCollected: Partial<Record<CatType, number>> = {};
  for (const k of matchedSet) {
    const { row, col } = parse(k);
    const t = board[row][col];
    if ((t.type === 'cat' || t.type === 'specialCat') && t.catType) {
      catsCollected[t.catType] = (catsCollected[t.catType] ?? 0) + 1;
    }
  }

  // 3. Personality powers (may mutate surviving tiles + return bonuses).
  const basePerGroup = result.groups.map((g) => baseScoreForSize(g.size));
  const personality = applyCatPersonalityEffects(
    board,
    result.groups,
    matchedSet,
    basePerGroup,
  );

  // 4. Obstacle damage from adjacency + Black Cat extra damage.
  const allMatched = [...matchedSet].map(parse);
  const obs = applyObstacleDamage(
    board,
    allMatched,
    personality.extraObstacleDamage,
  );

  // 5. Yarn balls adjacent to matches roll and clear their path.
  let yarnsActivated = 0;
  const yarnActs = findYarnActivations(board, result.matchedPositions);
  for (const act of yarnActs) {
    activateYarnBall(board, act.yarn, act.trigger);
    yarnsActivated += 1;
  }

  // 6. Boss Cat energy.
  let bossEnergyGained = result.groups.reduce(
    (sum, g) => sum + bossEnergyForSize(g.size),
    0,
  );
  if (cascadeLevel > 1) bossEnergyGained += BOSS_ENERGY.cascadeBonus;
  bossEnergyGained += personality.bossBonus;

  // 7. Score (match score scaled by cascade multiplier + flat bonuses).
  const multiplier = comboMultiplier(cascadeLevel);
  const matchBase =
    basePerGroup.reduce((a, b) => a + b, 0) + personality.scoreBonus;
  const matchScore = Math.round(matchBase * multiplier);
  const extraScore =
    obs.obstaclesDestroyed * SCORE.obstacleDestroyed +
    yarnsActivated * SCORE.yarnActivated;
  const scoreGained = matchScore + extraScore;

  // 8. Clear matched cells, leaving room for created specials.
  const creationByKey = new Map(
    result.creations.map((c) => [key(c.pos), c]),
  );
  for (const k of matchedSet) {
    if (creationByKey.has(k)) continue;
    const { row, col } = parse(k);
    const t = board[row][col];
    if (t.type === 'cat' || t.type === 'specialCat') {
      board[row][col] = makeEmptyTile(row, col);
    }
  }
  for (const [k, creation] of creationByKey) {
    const { row, col } = parse(k);
    board[row][col] = {
      id: nextId(),
      row,
      col,
      type: 'specialCat',
      specialType: creation.special,
      catType: creation.catType,
      isNew: true,
      isActivating: true,
    };
  }

  return {
    hadMatches: true,
    clearedPositions: allMatched,
    scoreGained,
    bossEnergyGained,
    catsCollected,
    boxesBroken: obs.boxesBroken,
    obstaclesDestroyed: obs.obstaclesDestroyed,
    yarnsActivated,
    hint: personality.hint,
    creations: result.creations,
  };
}
