import type { CatType, Objective } from './types';

/** Accumulated progress used to evaluate level objectives. */
export interface ObjectiveProgress {
  score: number;
  catsCollected: Partial<Record<CatType, number>>;
  boxesBroken: number;
  yarnsActivated: number;
  bossCharged: number;
}

export function createProgress(): ObjectiveProgress {
  return {
    score: 0,
    catsCollected: {},
    boxesBroken: 0,
    yarnsActivated: 0,
    bossCharged: 0,
  };
}

/** Current value of an objective given the accumulated progress. */
export function objectiveCurrent(
  objective: Objective,
  progress: ObjectiveProgress,
): number {
  switch (objective.type) {
    case 'score':
      return progress.score;
    case 'collectCat':
      return objective.catType
        ? progress.catsCollected[objective.catType] ?? 0
        : 0;
    case 'breakBox':
      return progress.boxesBroken;
    case 'activateYarn':
      return progress.yarnsActivated;
    case 'chargeBoss':
      return progress.bossCharged;
    default:
      return 0;
  }
}

export function isObjectiveComplete(
  objective: Objective,
  progress: ObjectiveProgress,
): boolean {
  return objectiveCurrent(objective, progress) >= objective.target;
}

export function checkWinCondition(
  objectives: Objective[],
  progress: ObjectiveProgress,
): boolean {
  return objectives.every((o) => isObjectiveComplete(o, progress));
}

export function checkLoseCondition(
  movesLeft: number,
  won: boolean,
): boolean {
  return movesLeft <= 0 && !won;
}

/**
 * Star rating for a completed level: 1 star for finishing, +1 if more than a
 * third of the moves remained, +1 if more than two thirds remained.
 */
export function computeStars(movesLeft: number, totalMoves: number): number {
  if (totalMoves <= 0) return 1;
  const ratio = movesLeft / totalMoves;
  if (ratio >= 0.5) return 3;
  if (ratio >= 0.25) return 2;
  return 1;
}
